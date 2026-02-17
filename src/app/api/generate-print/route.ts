import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paymentVerification";
import { checkRateLimit, getClientIp, rateLimiters, RateLimitError } from "@/lib/rateLimit";
import {
  sanitizeText,
  validateCoordinates,
  validateZoom,
  sanitizeThemeId,
  validateDetailLineType,
  validateFocusPoint,
} from "@/lib/sanitize";
import { logAndRespond } from "@/lib/apiError";

/**
 * Proxy to the external MapMarked Render Server
 *
 * The render server uses Puppeteer with real WebGL to capture exact map previews.
 * This proxy keeps the RENDER_SECRET server-side and handles job polling.
 *
 * SECURITY: Payment verification is done server-side via Stripe API.
 * The client sends a stripeSessionId which is verified before generating
 * watermark-free images. Never trust client-side `paid` flags.
 */

const RENDER_SERVER_URL = process.env.RENDER_SERVER_URL;
const RENDER_SECRET = process.env.RENDER_SECRET;

// Valid theme IDs from themes.json
const VALID_THEME_IDS = ["obsidian", "cobalt", "parchment", "coastal", "copper"];

// Polling configuration
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 45; // 90 seconds max

interface RenderJobResponse {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  imageBase64?: string;
  error?: string;
}

async function submitRenderJob(params: {
  lat: number;
  lng: number;
  zoom: number;
  themeId: string;
  city: string;
  state: string;
  coordinates: string;
  paid: boolean;
  focusPoint?: { lat: number; lng: number; address?: string };
  detailLineType: string;
}): Promise<{ jobId: string }> {
  const response = await fetch(`${RENDER_SERVER_URL}/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-render-secret": RENDER_SECRET!,
    },
    body: JSON.stringify({
      ...params,
      width: 5400,
      height: 7200,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Render server error: ${response.status}`);
  }

  return response.json();
}

async function pollJobStatus(jobId: string): Promise<RenderJobResponse> {
  const response = await fetch(`${RENDER_SERVER_URL}/status/${jobId}`, {
    headers: {
      "x-render-secret": RENDER_SECRET!,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Status check failed: ${response.status}`);
  }

  return response.json();
}

async function waitForCompletion(jobId: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const status = await pollJobStatus(jobId);

    if (status.status === "completed" && status.imageBase64) {
      return status.imageBase64;
    }

    if (status.status === "failed") {
      throw new Error(status.error || "Render job failed");
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Render job timed out");
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 requests per minute per IP
    const clientIp = getClientIp(request);
    try {
      checkRateLimit(rateLimiters.expensive, clientIp);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429, headers: { "Retry-After": String(error.retryAfter) } }
        );
      }
      throw error;
    }

    // Validate environment
    if (!RENDER_SERVER_URL || !RENDER_SECRET) {
      console.error("[generate-print] Missing RENDER_SERVER_URL or RENDER_SECRET");
      return NextResponse.json(
        { error: "Render server not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      center,
      zoom,
      themeId,
      cityName,
      stateName,
      coordinates,
      focusPoint,
      detailLineType,
      stripeSessionId,
    } = body;

    // SECURITY: Validate and sanitize all inputs
    if (!validateCoordinates(center)) {
      console.warn("[generate-print] Invalid coordinates:", center);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!validateZoom(zoom)) {
      console.warn("[generate-print] Invalid zoom:", zoom);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const validThemeId = sanitizeThemeId(themeId, VALID_THEME_IDS);
    if (!validThemeId) {
      console.warn("[generate-print] Invalid themeId:", themeId);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!validateDetailLineType(detailLineType)) {
      console.warn("[generate-print] Invalid detailLineType:", detailLineType);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!validateFocusPoint(focusPoint)) {
      console.warn("[generate-print] Invalid focusPoint:", focusPoint);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Sanitize text fields
    const sanitizedCityName = sanitizeText(cityName, 50);
    const sanitizedStateName = sanitizeText(stateName, 50);
    const sanitizedCoordinates = sanitizeText(coordinates, 80);
    const sanitizedFocusPoint = focusPoint
      ? {
          lat: focusPoint.lat,
          lng: focusPoint.lng,
          address: focusPoint.address ? sanitizeText(focusPoint.address, 200) : undefined,
        }
      : undefined;

    // SECURITY: Verify payment server-side via Stripe API
    // Never trust client-provided `paid` flags
    let paid = false;
    if (stripeSessionId) {
      console.log("[generate-print] Verifying payment for session:", stripeSessionId);
      paid = await verifyPayment(stripeSessionId);
      console.log("[generate-print] Payment verified:", paid);
    } else {
      console.log("[generate-print] No session ID provided - watermarked download");
    }

    console.log("[generate-print] Submitting job to render server...");
    console.log("[generate-print] Theme:", validThemeId, "Center:", center, "Zoom:", zoom, "Paid:", paid);

    // Submit job to render server with sanitized inputs
    const { jobId } = await submitRenderJob({
      lat: center[1],
      lng: center[0],
      zoom,
      themeId: validThemeId,
      city: sanitizedCityName,
      state: sanitizedStateName,
      coordinates: sanitizedCoordinates,
      paid,
      focusPoint: sanitizedFocusPoint,
      detailLineType,
    });

    console.log("[generate-print] Job submitted:", jobId);

    // Poll for completion
    const imageBase64 = await waitForCompletion(jobId);

    const base64Length = imageBase64.length;
    const estimatedMB = (base64Length / 1024 / 1024).toFixed(2);
    console.log(`[generate-print] Job completed, base64 length: ${base64Length} chars (~${estimatedMB}MB)`);

    // Return as data URL
    const dataUrl = `data:image/jpeg;base64,${imageBase64}`;

    console.log(`[generate-print] Returning data URL, total length: ${dataUrl.length}`);

    return NextResponse.json({ imageDataUrl: dataUrl });
  } catch (error) {
    return logAndRespond(error, "Failed to generate image. Please try again.");
  }
}

// Vercel function timeout - needs to be long enough for render + polling
export const maxDuration = 120;