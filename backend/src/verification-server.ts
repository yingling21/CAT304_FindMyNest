import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import vision from "@google-cloud/vision";

// Load backend .env (look in same directory as this file, then parent directory)
const envPath = path.resolve(__dirname, ".env");
const envPathParent = path.resolve(__dirname, "../.env");
const usedEnvPath = fs.existsSync(envPath) ? envPath : envPathParent;
console.log(`📄 Loading .env from: ${usedEnvPath}`);
dotenv.config({
  path: usedEnvPath,
});

const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.use(express.json({ limit: "20mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "IC verification server is running" });
});

// Supabase (service role – backend only)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Look for google-key.json in same directory as this file, then parent directory
const keyPath = path.resolve(__dirname, "google-key.json");
const keyPathParent = path.resolve(__dirname, "../google-key.json");
const keyFilename = fs.existsSync(keyPath) ? keyPath : keyPathParent;

if (!fs.existsSync(keyFilename)) {
  throw new Error(`Google Cloud key file not found. Checked: ${keyPath} and ${keyPathParent}`);
}

console.log(`🔑 Using Google Cloud key from: ${keyFilename}`);
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: keyFilename,
});

type VerificationStatus = "PENDING" | "VERIFIED" | "FAILED";

type VerificationResult = {
  status: VerificationStatus;
  reason?: string;
};

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then((v) => { clearTimeout(id); resolve(v); })
     .catch((e) => { clearTimeout(id); reject(e); });
  });
}

/**
 * Normalize IC number: remove all non-digits and take first 12 digits
 */
function normalizeIC(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 12);
}

/**
 * Validate Malaysia IC using date logic
 * IC format: YYMMDD-PB-G### (12 digits total)
 * - YY: Year (00-99)
 * - MM: Month (01-12)
 * - DD: Day (01-31)
 */
function isValidMalaysiaIC(ic: string): boolean {
  if (ic.length !== 12) return false;

  const yy = parseInt(ic.slice(0, 2), 10);
  const mm = parseInt(ic.slice(2, 4), 10);
  const dd = parseInt(ic.slice(4, 6), 10);

  // Validate month (01-12)
  if (mm < 1 || mm > 12) return false;
  
  // Validate day (01-31, basic check)
  if (dd < 1 || dd > 31) return false;

  return true;
}

/**
 * Extract IC number from image using multi-step validation
 * Step 1: Get full OCR text from Vision API
 * Step 2: Extract all potential IC number matches
 * Step 3: Normalize each match (remove symbols, take first 12 digits)
 * Step 4: Validate each normalized IC using date logic
 * Step 5: Return the first valid IC number in formatted form
 */
async function extractIcNumberFromImage(
  buffer: Buffer,
  isBack: boolean = false
): Promise<string | null> {
  const side = isBack ? "BACK" : "FRONT";
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📸 EXTRACTING IC FROM ${side} IMAGE`);
  console.log(`${"=".repeat(60)}`);
  
  try {
    // Step 1: Get full OCR text from Vision API
    console.log(`\n[Step 1] Calling Google Vision API for ${side}...`);
    const [result] = await withTimeout(
      visionClient.textDetection({ image: { content: buffer } }),
      25_000,
      isBack ? "Back OCR" : "Front OCR"
    );
    
    const text = result.fullTextAnnotation?.text || "";
    
    if (!text) {
      console.log(`❌ No OCR text found for ${side} image`);
      return null;
    }

    // Display full OCR text (truncate if too long)
    const textPreview = text.length > 500 ? text.substring(0, 500) + "..." : text;
    console.log(`\n[Step 1] ✅ OCR Text extracted (${text.length} characters):`);
    console.log(`─`.repeat(60));
    console.log(textPreview);
    if (text.length > 500) {
      console.log(`... (truncated, showing first 500 chars of ${text.length} total)`);
    }
    console.log(`─`.repeat(60));

    // Step 2: Extract all potential IC number matches
    console.log(`\n[Step 2] Searching for IC number patterns...`);
    const matches = text.match(/\d{6}[- ]?\d{2}[- ]?\d{4,6}(?:[- ]?\d{2}[- ]?\d{1,2})?/g);
    
    if (!matches || matches.length === 0) {
      console.log(`❌ No IC pattern matches found in ${side} OCR text`);
      return null;
    }

    console.log(`✅ Found ${matches.length} potential IC match(es):`);
    matches.forEach((match, idx) => {
      console.log(`   ${idx + 1}. "${match}"`);
    });

    // Step 3 & 4: Normalize and validate each match
    console.log(`\n[Step 3-4] Normalizing and validating each match...`);
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const normalized = normalizeIC(match);
      
      console.log(`\n   Match ${i + 1}: "${match}"`);
      console.log(`   → Normalized: "${normalized}" (${normalized.length} digits)`);
      
      if (normalized.length !== 12) {
        console.log(`   ❌ Invalid: Not 12 digits`);
        continue;
      }

      // Show date breakdown for validation
      const yy = normalized.slice(0, 2);
      const mm = normalized.slice(2, 4);
      const dd = normalized.slice(4, 6);
      const pb = normalized.slice(6, 8);
      const g = normalized.slice(8, 12);
      
      console.log(`   → Breakdown: YY=${yy}, MM=${mm}, DD=${dd}, PB=${pb}, G=${g}`);
      
      const isValid = isValidMalaysiaIC(normalized);
      if (isValid) {
        const formatted = `${normalized.slice(0, 6)}-${normalized.slice(6, 8)}-${normalized.slice(8, 12)}`;
        console.log(`   ✅ VALID IC! Date check passed (MM: ${mm}, DD: ${dd})`);
        console.log(`   → Formatted: "${formatted}"`);
        
        // For back IC, if the original match has extended format, return it
        if (isBack && match.match(/\d{6}[- ]?\d{2}[- ]?\d{4}[- ]?\d{2}[- ]?\d{1,2}/)) {
          const backFormatMatch = match.match(/(\d{6}[- ]?\d{2}[- ]?\d{4})([- ]?\d{2}[- ]?\d{1,2})?/);
          if (backFormatMatch) {
            console.log(`\n${"=".repeat(60)}`);
            console.log(`✅ FINAL RESULT FOR ${side}: "${backFormatMatch[0]}"`);
            console.log(`${"=".repeat(60)}\n`);
            return backFormatMatch[0]; // e.g., "041010-02-1384-02-01"
          }
        }
        
        console.log(`\n${"=".repeat(60)}`);
        console.log(`✅ FINAL RESULT FOR ${side}: "${formatted}"`);
        console.log(`${"=".repeat(60)}\n`);
        return formatted; // e.g., "041010-02-1384"
      } else {
        const mmNum = parseInt(mm, 10);
        const ddNum = parseInt(dd, 10);
        if (mmNum < 1 || mmNum > 12) {
          console.log(`   ❌ Invalid: Month ${mm} is not between 01-12`);
        } else if (ddNum < 1 || ddNum > 31) {
          console.log(`   ❌ Invalid: Day ${dd} is not between 01-31`);
        }
      }
    }

    console.log(`\n❌ No valid IC found after validation for ${side}`);
    console.log(`${"=".repeat(60)}\n`);
    return null;
  } catch (error: any) {
    console.error(`\n❌ OCR extraction error for ${side}:`, error?.message);
    console.log(`${"=".repeat(60)}\n`);
    return null;
  }
}


app.post("/verify/ic", upload.fields([{ name: "front", maxCount: 1 }, { name: "back", maxCount: 1 }]), async (req, res) => {
  const t0 = Date.now();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 NEW VERIFICATION REQUEST`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const mark = (label: string) => console.log(`⏱ ${label}: ${Date.now() - t0}ms`);

  try {
    const userId = req.body?.userId;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const frontFile = files?.["front"]?.[0];
    const backFile = files?.["back"]?.[0];

    console.log(`User ID: ${userId}`);
    console.log(`Front file size: ${frontFile?.size || 0} bytes`);
    console.log(`Back file size: ${backFile?.size || 0} bytes`);

    mark("after multer parse");

    if (!userId || !frontFile || !backFile) {
      return res.status(400).json({
        error: "userId, front, and back files are required",
      });
    }

    const { data: verRow, error: verErr } = await supabase
      .from("identity_verifications")
      .insert({
        user_id: userId,
        status: "PENDING" as VerificationStatus,
      })
      .select("*")
      .single();

    mark("after supabase insert");

    if (verErr || !verRow) {
      throw verErr || new Error("Failed to create verification row");
    }

    const frontBuffer = frontFile.buffer;
    const backBuffer = backFile.buffer;

    const [frontIc, backIc] = await Promise.all([
      extractIcNumberFromImage(frontBuffer, false),
      extractIcNumberFromImage(backBuffer, true),
    ]);

    mark("after vision ocr");
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔍 IC NUMBER COMPARISON`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Front IC: "${frontIc}"`);
    console.log(`Back IC:  "${backIc}"`);
    
    if (!frontIc) {
      const reason = "Unable to detect IC number from front image.";
      console.log(`\n❌ VERIFICATION FAILED: ${reason}`);
      await supabase
        .from("identity_verifications")
        .update({ status: "FAILED", verified_at: null })
        .eq("id", verRow.id);
      await supabase
        .from("users")
        .update({ verification_status: "rejected" })
        .eq("id", userId);
      return res.json({
        verificationId: verRow.id,
        status: "FAILED" as VerificationStatus,
        reason,
      });
    }

    if (!backIc) {
      const reason = "Unable to detect IC number from back image.";
      console.log(`\n❌ VERIFICATION FAILED: ${reason}`);
      await supabase
        .from("identity_verifications")
        .update({ status: "FAILED", verified_at: null })
        .eq("id", verRow.id);
      await supabase
        .from("users")
        .update({ verification_status: "rejected" })
        .eq("id", userId);
      return res.json({
        verificationId: verRow.id,
        status: "FAILED" as VerificationStatus,
        reason,
      });
    }

    if (backIc.length < 14) {
      const reason = `Back IC number is too short. Expected at least 14 characters, got: ${backIc.length}`;
      console.log(`\n❌ VERIFICATION FAILED: ${reason}`);
      await supabase
        .from("identity_verifications")
        .update({ status: "FAILED", verified_at: null })
        .eq("id", verRow.id);
      await supabase
        .from("users")
        .update({ verification_status: "rejected" })
        .eq("id", userId);
      return res.json({
        verificationId: verRow.id,
        status: "FAILED" as VerificationStatus,
        reason,
      });
    }

    const backIcPrefix = backIc.substring(0, 14);
    console.log(`Back IC prefix (first 14 chars): "${backIcPrefix}"`);
    console.log(`\nComparing: "${frontIc}" === "${backIcPrefix}"`);
    
    if (frontIc !== backIcPrefix) {
      const reason = `IC numbers do not match. Front: ${frontIc}, Back prefix: ${backIcPrefix}`;
      console.log(`❌ MISMATCH! ${reason}`);
      console.log(`${"=".repeat(60)}\n`);
      await supabase
        .from("identity_verifications")
        .update({ status: "FAILED", verified_at: null })
        .eq("id", verRow.id);
      await supabase
        .from("users")
        .update({ verification_status: "rejected" })
        .eq("id", userId);
      return res.json({
        verificationId: verRow.id,
        status: "FAILED" as VerificationStatus,
        reason,
      });
    }

    console.log(`✅ MATCH! IC numbers are identical.`);
    console.log(`${"=".repeat(60)}\n`);

    const finalStatus: VerificationStatus = "VERIFIED";

    const { error: updErr } = await supabase
      .from("identity_verifications")
      .update({
        status: finalStatus,
        verified_at:
          finalStatus === "VERIFIED"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", verRow.id);

    if (updErr) throw updErr;

    const userVerificationStatus = finalStatus === "VERIFIED" ? "approved" : "rejected";

    const { error: userErr } = await supabase
      .from("users")
      .update({ verification_status: userVerificationStatus })
      .eq("id", userId);

    if (userErr) throw userErr;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ VERIFICATION SUCCESSFUL!`);
    console.log(`   Verification ID: ${verRow.id}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Status: ${finalStatus}`);
    console.log(`   User verification_status: ${userVerificationStatus}`);
    console.log(`${"=".repeat(60)}\n`);

    return res.json({
      verificationId: verRow.id,
      status: finalStatus,
    });
  } catch (err: any) {
    console.error("Verification error:", err);
    return res.status(500).json({ 
      error: err?.message || "Verification failed",
    });
  }
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 IC VERIFICATION SERVER STARTED`);
  console.log(`${"=".repeat(60)}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Listening on: 0.0.0.0:${PORT}`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Android Emulator: http://10.0.2.2:${PORT}`);
  console.log(`📄 .env file: ${usedEnvPath}`);
  console.log(`🔑 Google key: ${keyFilename}`);
  console.log(`${"=".repeat(60)}\n`);
});
