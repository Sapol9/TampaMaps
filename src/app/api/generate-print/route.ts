import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

/**
 * Server-side print image generation using Puppeteer + @sparticuz/chromium
 *
 * This renders the actual MapPreview component at 5400x7200 resolution,
 * capturing the exact same output as the browser preview.
 *
 * Works on Vercel serverless functions with @sparticuz/chromium.
 */

// Print dimensions (300 DPI for 18"×24")
const PRINT_WIDTH = 5400;
const PRINT_HEIGHT = 7200;

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
}

// Get the base URL for the render page
function getBaseUrl(): string {
  // In production, use VERCEL_URL or custom domain
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // In development
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const body: GeneratePrintRequest = await request.json();
    const { center, zoom, themeId, cityName, stateName, coordinates, focusPoint, detailLineType } =
      body;

    console.log("[generate-print] Starting Puppeteer capture...");
    console.log("[generate-print] Theme:", themeId, "City:", cityName);

    // Build URL for the print render page
    const baseUrl = getBaseUrl();
    const renderUrl = new URL("/print-render", baseUrl);
    renderUrl.searchParams.set("lng", center[0].toString());
    renderUrl.searchParams.set("lat", center[1].toString());
    renderUrl.searchParams.set("zoom", zoom.toString());
    renderUrl.searchParams.set("theme", themeId);
    renderUrl.searchParams.set("city", cityName);
    renderUrl.searchParams.set("state", stateName);
    renderUrl.searchParams.set("coords", coordinates);
    renderUrl.searchParams.set("detailType", detailLineType);

    if (focusPoint) {
      renderUrl.searchParams.set("focusLat", focusPoint.lat.toString());
      renderUrl.searchParams.set("focusLng", focusPoint.lng.toString());
    }

    console.log("[generate-print] Render URL:", renderUrl.toString());

    // Launch browser
    // In production (Vercel), use @sparticuz/chromium
    // In development, use local Chrome
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: {
          width: PRINT_WIDTH,
          height: PRINT_HEIGHT,
          deviceScaleFactor: 1,
        },
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      // Local development - find Chrome
      const possiblePaths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      ];

      let executablePath = "";
      for (const p of possiblePaths) {
        try {
          const fs = await import("fs");
          if (fs.existsSync(p)) {
            executablePath = p;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!executablePath) {
        throw new Error("Chrome not found. Install Chrome or set CHROME_PATH.");
      }

      browser = await puppeteer.launch({
        executablePath,
        headless: true,
        defaultViewport: {
          width: PRINT_WIDTH,
          height: PRINT_HEIGHT,
          deviceScaleFactor: 1,
        },
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });
    }

    console.log("[generate-print] Browser launched");

    const page = await browser.newPage();

    // Set viewport to print dimensions
    await page.setViewport({
      width: PRINT_WIDTH,
      height: PRINT_HEIGHT,
      deviceScaleFactor: 1,
    });

    // Navigate to the render page
    await page.goto(renderUrl.toString(), {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    console.log("[generate-print] Page loaded, waiting for map...");

    // Wait for the map to be ready (data-print-ready attribute)
    await page.waitForFunction(
      () => document.body.getAttribute("data-print-ready") === "true",
      { timeout: 45000 }
    );

    console.log("[generate-print] Map ready, capturing screenshot...");

    // Capture screenshot
    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 95,
      clip: {
        x: 0,
        y: 0,
        width: PRINT_WIDTH,
        height: PRINT_HEIGHT,
      },
    });

    console.log("[generate-print] Screenshot captured, size:", screenshot.length);

    // Close browser
    await browser.close();
    browser = null;

    // Convert to base64 data URL
    const base64 = Buffer.from(screenshot).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    console.log("[generate-print] Done!");

    return NextResponse.json({ imageDataUrl: dataUrl });
  } catch (error) {
    console.error("[generate-print] Error:", error);

    // Clean up browser on error
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Increase function timeout for Vercel
export const maxDuration = 60;