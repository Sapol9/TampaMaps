import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paymentVerification";

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

// Polling configuration
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 45; // 90 seconds max

interface GeneratePrintRequest {
  center: [number, number]; // [lng, lat]
  zoom: number;
  themeId: string;
  cityName: string;
  stateName: string;
  coordinates: string;
  focusPoint?: {
    lat: number;
    lng: number;
    address?: string;
  };
  detailLineType: "coordinates" | "address" | "none";
  stripeSessionId?: string; // For payment verification - replaces trusted `paid` flag
}

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
    // Validate environment
    if (!RENDER_SERVER_URL || !RENDER_SECRET) {
      console.error("[generate-print] Missing RENDER_SERVER_URL or RENDER_SECRET");
      return NextResponse.json(
        { error: "Render server not configured" },
        { status: 500 }
      );
    }

    const body: GeneratePrintRequest = await request.json();
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
    console.log("[generate-print] Theme:", themeId, "Center:", center, "Zoom:", zoom, "Paid:", paid);

    // Submit job to render server
    const { jobId } = await submitRenderJob({
      lat: center[1],
      lng: center[0],
      zoom,
      themeId,
      city: cityName,
      state: stateName,
      coordinates,
      paid,
      focusPoint,
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
    console.error("[generate-print] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Vercel function timeout - needs to be long enough for render + polling
export const maxDuration = 120;