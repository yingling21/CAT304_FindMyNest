import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import vision from "@google-cloud/vision";

// Load backend .env
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
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

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: path.resolve(__dirname, "../google-key.json"),
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

async function extractIcNumberFromImage(
  buffer: Buffer,
  isBack: boolean = false
): Promise<string | null> {
  try {
    const [result] = await withTimeout(
      visionClient.textDetection({ image: { content: buffer } }),
      25_000,
      isBack ? "Back OCR" : "Front OCR"
    );
    
    const text = result.fullTextAnnotation?.text || "";
    
    if (!text) {
      return null;
    }

    if (isBack) {
      // Back IC format: xxxx-xx-xxxx-aa-a (e.g., 041010-02-1384-02-01)
      // Try to match the full format first
      const backFormatMatch = text.match(/\b\d{6}-\d{2}-\d{4}-\d{2}-\d{1,2}\b/);
      if (backFormatMatch) {
        return backFormatMatch[0];
      }
      
      // Fallback: match xxxx-xx-xxxx format
      const partialMatch = text.match(/\b\d{6}-\d{2}-\d{4}\b/);
      if (partialMatch) {
        return partialMatch[0];
      }
    } else {
      // Front IC format: xxxx-xx-xxxx (e.g., 041010-02-1384)
      const frontFormatMatch = text.match(/\b\d{6}-\d{2}-\d{4}\b/);
      if (frontFormatMatch) {
        return frontFormatMatch[0];
      }
    }

    // Fallback: try to extract digits and reconstruct format
    const digits = text.replace(/\D/g, "");
    if (digits.length >= 12) {
      // Reconstruct format: xxxx-xx-xxxx
      const formatted = `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`;
      return formatted;
    }

    return null;
  } catch (error: any) {
    console.error("OCR extraction error:", error?.message);
    return null;
  }
}


app.post("/verify/ic", upload.fields([{ name: "front", maxCount: 1 }, { name: "back", maxCount: 1 }]), async (req, res) => {
  const t0 = Date.now();
  console.log("✅ /verify/ic start");

  const mark = (label: string) => console.log(`⏱ ${label}: ${Date.now() - t0}ms`);

  try {
    const userId = req.body?.userId;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const frontFile = files?.["front"]?.[0];
    const backFile = files?.["back"]?.[0];

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
    if (!frontIc) {
      const reason = "Unable to detect IC number from front image.";
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
    if (frontIc !== backIcPrefix) {
      const reason = `IC numbers do not match. Front: ${frontIc}, Back prefix: ${backIcPrefix}`;
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
  console.log(`IC verification server running on port ${PORT}`);
});
