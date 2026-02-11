#!/usr/bin/env node

/**
 * Gallery Image Generator
 * Uses Playwright to capture screenshots of the actual MapPreview component
 * with real Mapbox styles for each city/theme combination.
 *
 * Usage:
 *   1. Start the dev server: npm run dev
 *   2. Run this script: node scripts/generate-gallery.mjs
 *
 * Note: Runs with a visible browser window because Mapbox GL requires WebGL
 * which works better in headed mode.
 */

import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

// Gallery items to capture
const galleryItems = [
  { city: "Manhattan", themeId: "obsidian" },
  { city: "San Francisco", themeId: "cobalt" },
  { city: "Tampa", themeId: "parchment" },
  { city: "Austin", themeId: "emerald" },
  { city: "Chicago", themeId: "copper" },
];

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUTPUT_DIR = path.join(projectRoot, "public", "gallery");

async function captureGalleryImages() {
  console.log("🎨 Gallery Image Generator");
  console.log("==========================\n");
  console.log("Note: Using visible browser (WebGL requires headed mode)\n");

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Launch browser with visible window (WebGL works better in headed mode)
  console.log("🚀 Launching browser...");
  const browser = await chromium.launch({
    headless: false, // WebGL requires headed mode
  });

  const context = await browser.newContext({
    viewport: { width: 450, height: 600 },
    deviceScaleFactor: 2, // Retina quality
  });

  let successCount = 0;

  // Capture each gallery item
  for (const item of galleryItems) {
    const slug = item.city.toLowerCase().replace(/\s+/g, "-");
    const filename = `${slug}-${item.themeId}.jpg`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    console.log(`\n📍 Capturing ${item.city} with ${item.themeId} theme...`);

    const url = `${BASE_URL}/gallery-render?city=${encodeURIComponent(item.city)}&theme=${item.themeId}`;

    // Create a fresh page for each capture
    const page = await context.newPage();

    try {
      // Navigate to the render page
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000
      });

      console.log("   ⏳ Waiting for map to load...");

      // Wait for the MapPreview container
      await page.waitForSelector(".aspect-\\[3\\/4\\]", { timeout: 10000 });

      // Wait for Mapbox canvas to appear
      await page.waitForSelector(".mapboxgl-canvas", { timeout: 20000 });

      // Wait for loading text to disappear
      await page.waitForFunction(
        () => !document.body.textContent?.includes("Loading map..."),
        { timeout: 15000 }
      );

      // Wait for tiles to fully render
      console.log("   ⏳ Waiting for tiles...");
      await page.waitForTimeout(4000);

      // Find the map container and take screenshot
      const mapContainer = await page.locator(".aspect-\\[3\\/4\\]").first();

      await mapContainer.screenshot({
        path: outputPath,
        type: "jpeg",
        quality: 90,
      });
      console.log(`   ✅ Saved: ${filename}`);
      successCount++;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  // Cleanup
  await browser.close();

  console.log("\n==========================");
  console.log(`🎉 Complete! ${successCount}/${galleryItems.length} images captured`);
  console.log(`📁 Saved to: ${OUTPUT_DIR}`);
}

// Run the script
captureGalleryImages().catch(console.error);