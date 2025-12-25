import { Platform } from "react-native";
import { supabase } from "./supabase";

// For Android: use 10.0.2.2 (emulator) or set EXPO_PUBLIC_VERIFICATION_API_BASE to your computer's IP
// For iOS/Web: use localhost
const getVerificationApiBase = () => {
  if (process.env.EXPO_PUBLIC_VERIFICATION_API_BASE) {
    return process.env.EXPO_PUBLIC_VERIFICATION_API_BASE;
  }
  
  // Default port is 5001 (can be overridden via EXPO_PUBLIC_VERIFICATION_API_BASE)
  const port = process.env.EXPO_PUBLIC_VERIFICATION_PORT || "5001";
  
  if (Platform.OS === "android") {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    // For physical device, you need to set EXPO_PUBLIC_VERIFICATION_API_BASE to your computer's IP
    return `http://10.0.2.2:${port}`;
  }
  
  // iOS simulator and web can use localhost
  return `http://localhost:${port}`;
};

const VERIFICATION_API_BASE = getVerificationApiBase();
const VERIFY_TIMEOUT_MS = 120_000;

export type VerificationApiResponse = {
  verificationId: string;
  status: "VERIFIED" | "FAILED";
  reason?: string;
};

export async function verifyIcWithBackend(
  frontIcUri: string,
  backIcUri: string
): Promise<VerificationApiResponse> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id;
  const url = `${VERIFICATION_API_BASE}/verify/ic`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const form = new FormData();
    form.append("userId", userId);
    form.append("front", {
      uri: frontIcUri,
      name: "front.jpg",
      type: "image/jpeg",
    } as any);
    form.append("back", {
      uri: backIcUri,
      name: "back.jpg",
      type: "image/jpeg",
    } as any);

    const res = await fetch(url, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { ok: res.ok, raw: text };
    }

    if (!res.ok) {
      const errorMessage = data?.error || data?.reason || `Verification failed (${res.status})`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("Fetch error:", err);

    if (err?.name === "AbortError") {
      throw new Error(`Request timeout after ${VERIFY_TIMEOUT_MS / 1000}s. The verification is taking too long. Please try again with clearer images.`);
    }

    if (err.message) {
      throw err;
    }

    if (err.name === "TypeError" && (err.message.includes("fetch") || err.message.includes("Network request failed"))) {
      throw new Error(
        `Cannot connect to backend server at ${VERIFICATION_API_BASE}.\n\nPlease check:\n1. Backend is running: cd backend && npm run dev\n2. Backend shows: "IC verification server running on port..."\n3. For Android emulator, backend should be accessible at ${VERIFICATION_API_BASE}`
      );
    }

    throw new Error(`Network error: ${err.message || "Failed to connect to verification server. Please check your network connection."}`);
  }
}


