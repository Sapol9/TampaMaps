#!/usr/bin/env node

/**
 * Generate Hero Gallery Images
 *
 * This script generates the 5 hero gallery images using the render server.
 * Run with: node scripts/generate-hero-images.js
 *
 * Prerequisites:
 * - The Next.js dev server must be running (npm run dev)
 * - The render server must be configured and accessible
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const HERO_EXAMPLES = [
  { city: "New York", state: "NY", theme: "obsidian", lat: 40.7128, lng: -74.006, filename: "new-york-obsidian.jpg" },
  { city: "Paris", state: "France", theme: "parchment", lat: 48.8566, lng: 2.3522, filename: "paris-parchment.jpg" },
  { city: "Tokyo", state: "Japan", theme: "cobalt", lat: 35.6762, lng: 139.6503, filename: "tokyo-cobalt.jpg" },
  { city: "Tampa", state: "FL", theme: "coastal", lat: 27.9506, lng: -82.4572, filename: "tampa-coastal.jpg" },
  { city: "Austin", state: "TX", theme: "copper", lat: 30.2672, lng: -97.7431, filename: "austin-copper.jpg" },
];

async function generateImage(example) {
  console.log(`\nGenerating ${example.city} with ${example.theme} theme...`);

  const response = await fetch(`${BASE_URL}/api/generate-print`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      center: [example.lng, example.lat],
      zoom: 12,
      themeId: example.theme,
      cityName: example.city,
      stateName: example.state,
      coordinates: formatCoordinates(example.lat, example.lng),
      detailLineType: "coordinates",
      paid: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to generate ${example.city}: ${error.error || response.status}`);
  }

  const data = await response.json();
  const base64Data = data.imageDataUrl.replace(/^data:image\/jpeg;base64,/, "");

  const outputPath = path.join(__dirname, "..", "public", "hero", example.filename);
  fs.writeFileSync(outputPath, Buffer.from(base64Data, "base64"));

  console.log(`Saved: ${outputPath}`);
  return outputPath;
}

function formatCoordinates(lat, lng) {
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"} / ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
}

async function main() {
  console.log("Hero Image Generator");
  console.log("====================");
  console.log(`Using API at: ${BASE_URL}`);

  // Ensure output directory exists
  const heroDir = path.join(__dirname, "..", "public", "hero");
  if (!fs.existsSync(heroDir)) {
    fs.mkdirSync(heroDir, { recursive: true });
  }

  const results = [];
  const errors = [];

  for (const example of HERO_EXAMPLES) {
    try {
      const outputPath = await generateImage(example);
      results.push({ city: example.city, path: outputPath });
    } catch (error) {
      console.error(`Error generating ${example.city}:`, error.message);
      errors.push({ city: example.city, error: error.message });
    }
  }

  console.log("\n====================");
  console.log("Generation Complete");
  console.log(`Success: ${results.length}/${HERO_EXAMPLES.length}`);

  if (errors.length > 0) {
    console.log("\nFailed:");
    errors.forEach((e) => console.log(`  - ${e.city}: ${e.error}`));
  }
}

main().catch(console.error);