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
    const email = req.body?.email;
    const fullName = req.body?.fullName;
    const phoneNumber = req.body?.phoneNumber;
    const role = req.body?.role || "tenant";
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const frontFile = files?.["front"]?.[0];
    const backFile = files?.["back"]?.[0];

    console.log(`User ID: ${userId}`);
    console.log(`User info: email=${email}, fullName=${fullName}, phoneNumber=${phoneNumber}, role=${role}`);
    console.log(`Front file size: ${frontFile?.size || 0} bytes`);
    console.log(`Back file size: ${backFile?.size || 0} bytes`);

    mark("after multer parse");

    if (!userId || !frontFile || !backFile) {
      return res.status(400).json({
        error: "userId, front, and back files are required",
      });
    }

    if (!email || !fullName || !phoneNumber) {
      console.error(`\n❌ MISSING USER INFO FOR USER CREATION`);
      console.error(`Email: ${email || "MISSING"}`);
      console.error(`Full Name: ${fullName || "MISSING"}`);
      console.error(`Phone Number: ${phoneNumber || "MISSING"}`);
      console.error(`Role: ${role || "MISSING"}`);
      console.log(`${"=".repeat(60)}\n`);
      return res.status(400).json({
        error: "email, fullName, and phoneNumber are required for user creation",
        debug: {
          hasEmail: !!email,
          hasFullName: !!fullName,
          hasPhoneNumber: !!phoneNumber,
          hasRole: !!role,
        },
      });
    }

    const { data: verRowData, error: verErr } = await supabase
      .from("identity_verifications")
      .insert({
        user_id: userId,
        status: "PENDING" as VerificationStatus,
      })
      .select("*");

    mark("after supabase insert");

    if (verErr) {
      console.error("Failed to create verification row:", verErr);
      throw verErr;
    }

    const verRow = verRowData && verRowData.length > 0 ? verRowData[0] : null;
    if (!verRow) {
      throw new Error("Failed to create verification row - no data returned");
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
      // Don't create/update user row on failure - user should not exist in users table yet
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
      // Don't create/update user row on failure - user should not exist in users table yet
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
      // Don't create/update user row on failure - user should not exist in users table yet
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
      // Don't create/update user row on failure - user should not exist in users table yet
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

    // CREATE or UPDATE user row in users table ONLY after successful IC verification
    const userVerificationStatus = finalStatus === "VERIFIED" ? "approved" : "rejected";
    
    // Check if user already exists
    const { data: existingUser, error: checkUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

    if (checkUserError && checkUserError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error(`❌ ERROR CHECKING USER EXISTENCE:`, checkUserError);
      throw checkUserError;
    }

    if (existingUser) {
      // User already exists - update all fields
      console.log(`⚠️  User ${userId} already exists in users table, updating all user data`);
      
      // Ensure email and phone_number are always stored when updating
      const updateData = {
        email: email.trim(),
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        role: role.trim(),
        verification_status: userVerificationStatus,
      };

      // Validate that email and phone_number are present before update
      if (!updateData.email || !updateData.phone_number) {
        console.error(`\n❌ CRITICAL: Missing required fields for user update`);
        console.error(`Email: ${updateData.email || "MISSING"}`);
        console.error(`Phone Number: ${updateData.phone_number || "MISSING"}`);
        console.log(`${"=".repeat(60)}\n`);
        throw new Error("Email and phone number are required for user update");
      }
      
      console.log(`📤 Attempting to update user data:`, JSON.stringify(updateData, null, 2));
      
      // Update without select first (to avoid RLS issues with select)
      const { error: updateErr } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);
        
      if (updateErr) {
        console.error(`❌ FAILED TO UPDATE USER ROW:`, updateErr);
        console.error(`Error details:`, JSON.stringify(updateErr, null, 2));
        throw updateErr;
      }
      
      // Query the updated user separately to verify
      const { data: updatedUserData, error: queryErr } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (queryErr && queryErr.code !== 'PGRST116') {
        console.error(`⚠️  WARNING: Update succeeded but could not verify:`, queryErr);
        // Don't throw - update may have succeeded even if query fails
      }
      
      const updatedUser = updatedUserData;
      
      if (updatedUser) {
        console.log(`✅ USER ROW UPDATED SUCCESSFULLY with all data`);
        console.log(`Updated user data:`, JSON.stringify(updatedUser, null, 2));
      } else {
        console.warn(`⚠️  Update completed but could not verify data (may be RLS issue, but update likely succeeded)`);
        // Don't throw - the update likely succeeded even if we can't verify due to RLS
      }
    } else {
      // Create new user row after successful verification
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📝 CREATING USER ROW IN DATABASE`);
      console.log(`${"=".repeat(60)}`);
      console.log(`User ID: ${userId}`);
      console.log(`Email: ${email}`);
      console.log(`Full Name: ${fullName}`);
      console.log(`Phone Number: ${phoneNumber}`);
      console.log(`Role: ${role}`);
      console.log(`Verification Status: ${userVerificationStatus}`);
      
      // Prepare user data for insertion
      // Ensure email and phone_number are always stored
      const userData = {
        id: userId,
        email: email.trim(),
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        role: role.trim(),
        verification_status: userVerificationStatus,
      };

      // Validate that email and phone_number are present before insertion
      if (!userData.email || !userData.phone_number) {
        console.error(`\n❌ CRITICAL: Missing required fields for user creation`);
        console.error(`Email: ${userData.email || "MISSING"}`);
        console.error(`Phone Number: ${userData.phone_number || "MISSING"}`);
        console.log(`${"=".repeat(60)}\n`);
        throw new Error("Email and phone number are required for user creation");
      }

      console.log(`📤 Attempting to insert user data:`, JSON.stringify(userData, null, 2));

      const { data: createdUserData, error: userErr } = await supabase
        .from("users")
        .insert(userData)
        .select();

      if (userErr) {
        console.error(`\n❌ FAILED TO CREATE USER ROW:`);
        console.error(`Error code: ${userErr.code}`);
        console.error(`Error message: ${userErr.message}`);
        console.error(`Error details:`, JSON.stringify(userErr, null, 2));
        console.error(`Attempted data:`, JSON.stringify(userData, null, 2));
        console.log(`${"=".repeat(60)}\n`);
        throw new Error(`Failed to create user in database: ${userErr.message}`);
      }

      const createdUser = createdUserData && createdUserData.length > 0 ? createdUserData[0] : null;

      if (!createdUser) {
        console.error(`\n❌ USER ROW CREATED BUT NO DATA RETURNED`);
        console.error(`This might indicate a database issue or RLS (Row Level Security) policy blocking the select`);
        console.error(`Response data:`, JSON.stringify(createdUserData, null, 2));
        console.log(`${"=".repeat(60)}\n`);
        
        // If insert succeeded but select returned nothing, try to query it directly
        const { data: verifyInsert, error: verifyInsertErr } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        
        if (verifyInsertErr) {
          console.error(`❌ Could not verify insert:`, verifyInsertErr);
          throw new Error(`User row may have been created but cannot be verified: ${verifyInsertErr.message}`);
        }
        
        if (verifyInsert) {
          console.log(`✅ User row exists, using verified data`);
          // Continue with verifyInsert instead
          const verifiedUser = verifyInsert;
          console.log(`✅ VERIFIED: All user data saved correctly`);
          console.log(`   Email: ${verifiedUser.email}`);
          console.log(`   Full Name: ${verifiedUser.full_name}`);
          console.log(`   Phone Number: ${verifiedUser.phone_number}`);
          console.log(`   Role: ${verifiedUser.role}`);
          console.log(`   Verification Status: ${verifiedUser.verification_status}`);
          console.log(`${"=".repeat(60)}\n`);
        } else {
          throw new Error("User row created but no data returned from database and verification query also failed");
        }
      } else {
        // User was created successfully and data was returned
        console.log(`✅ USER ROW CREATED SUCCESSFULLY`);
        console.log(`Created user data:`, JSON.stringify(createdUser, null, 2));
        
        // Verify the data was actually saved
        if (!createdUser.email || !createdUser.full_name || !createdUser.phone_number) {
          console.error(`\n❌ WARNING: USER ROW CREATED BUT DATA IS MISSING!`);
          console.error(`Email: ${createdUser.email || "MISSING"}`);
          console.error(`Full Name: ${createdUser.full_name || "MISSING"}`);
          console.error(`Phone Number: ${createdUser.phone_number || "MISSING"}`);
          console.error(`Full created user object:`, JSON.stringify(createdUser, null, 2));
          console.log(`${"=".repeat(60)}\n`);
          throw new Error("User row created but required data is missing");
        }
        
        console.log(`✅ VERIFIED: All user data saved correctly`);
        console.log(`   Email: ${createdUser.email}`);
        console.log(`   Full Name: ${createdUser.full_name}`);
        console.log(`   Phone Number: ${createdUser.phone_number}`);
        console.log(`   Role: ${createdUser.role}`);
        console.log(`   Verification Status: ${createdUser.verification_status}`);
        console.log(`${"=".repeat(60)}\n`);
        
        // Double-check by querying the database (optional verification)
        try {
          const { data: verifyUserData, error: verifyErr } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .maybeSingle(); // Use maybeSingle() to handle gracefully
            
          if (verifyErr && verifyErr.code !== 'PGRST116') {
            console.error(`⚠️  WARNING: Could not verify user data after insert:`, verifyErr);
          } else {
            const verifyUser = verifyUserData;
            if (verifyUser) {
              console.log(`✅ VERIFICATION QUERY: User data confirmed in database`);
              console.log(`   Email: ${verifyUser.email || "MISSING"}`);
              console.log(`   Full Name: ${verifyUser.full_name || "MISSING"}`);
              console.log(`   Phone Number: ${verifyUser.phone_number || "MISSING"}`);
              if (!verifyUser.email || !verifyUser.full_name || !verifyUser.phone_number) {
                console.error(`❌ CRITICAL: Data verification failed - fields are missing in database!`);
              }
            } else {
              console.warn(`⚠️  Verification query returned no data (might be RLS issue, but insert may have succeeded)`);
            }
          }
        } catch (verifyError) {
          console.warn(`⚠️  Verification query failed (non-critical):`, verifyError);
          // Don't throw - the insert may have succeeded even if verification query fails
        }
      }
    }

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
    console.error("\n❌ VERIFICATION ERROR CAUGHT:");
    console.error("Error type:", err?.constructor?.name);
    console.error("Error message:", err?.message);
    console.error("Error code:", err?.code);
    console.error("Full error:", JSON.stringify(err, null, 2));
    console.log(`${"=".repeat(60)}\n`);
    
    // Provide more detailed error message
    let errorMessage = err?.message || "Verification failed";
    if (err?.code === 'PGRST205' || err?.message?.includes("Cannot coerce")) {
      errorMessage = "Database query error: Unable to process verification. This may be due to Row Level Security (RLS) policies or database configuration issues.";
    } else if (err?.code === 'PGRST116') {
      errorMessage = "Database error: Expected data not found. Please try again.";
    } else if (err?.code) {
      errorMessage = `Database error (${err.code}): ${err.message || "Unknown database error"}`;
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        code: err?.code,
        message: err?.message,
        stack: err?.stack,
      } : undefined,
    });
  }
});

const PORT = Number(process.env.PORT) || 5001;
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
