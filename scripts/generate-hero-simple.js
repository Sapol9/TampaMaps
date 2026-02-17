#!/usr/bin/env node

/**
 * Generate Hero Gallery Images (Simple Version)
 *
 * This script generates hero images directly using Mapbox Static API.
 * No render server needed - just your Mapbox token.
 *
 * Run with: node scripts/generate-hero-simple.js
 */

const fs = require("fs");
const path = require("path");

// Load env vars from .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  }
}
loadEnv();

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Map theme IDs to custom Mapbox Studio styles
const MAPBOX_STYLE_MAP = {
  obsidian: "tbmaps/cmlq09zht00mo01qxf4tp1r1v",
  cobalt: "tbmaps/cmlq0g9sg006801s54tqrea0k",
  parchment: "tbmaps/cmlq0is69002v01qp3w6df36n",
  coastal: "tbmaps/cmlq0e2vn00mp01qxbkx34hoo",
  copper: "tbmaps/cmlq0kk5f002x01qpceg63bt9",
};

const HERO_EXAMPLES = [
  { city: "New York", state: "NY", theme: "obsidian", lat: 40.7128, lng: -74.006, filename: "new-york-obsidian.jpg" },
  { city: "Paris", state: "France", theme: "parchment", lat: 48.8566, lng: 2.3522, filename: "paris-parchment.jpg" },
  { city: "Tokyo", state: "Japan", theme: "cobalt", lat: 35.6762, lng: 139.6503, filename: "tokyo-cobalt.jpg" },
  { city: "Tampa", state: "FL", theme: "coastal", lat: 27.9506, lng: -82.4572, filename: "tampa-coastal.jpg" },
  { city: "Austin", state: "TX", theme: "copper", lat: 30.2672, lng: -97.7431, filename: "austin-copper.jpg" },
];

async function generateImage(example) {
  console.log(`\nGenerating ${example.city} with ${example.theme} theme...`);

  const style = MAPBOX_STYLE_MAP[example.theme];
  if (!style) {
    throw new Error(`Unknown theme: ${example.theme}`);
  }

  // Static API - 640x853 @2x for 3:4 aspect ratio (max 1280x1280)
  // This gives us 1280x1706 actual pixels
  const width = 600;
  const height = 800;
  const zoom = 12;

  const url = `https://api.mapbox.com/styles/v1/${style}/static/${example.lng},${example.lat},${zoom},0,0/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}&logo=false&attribution=false`;

  console.log(`  Fetching from Mapbox Static API...`);

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mapbox API error ${response.status}: ${text}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const outputPath = path.join(__dirname, "..", "public", "hero", example.filename);
  fs.writeFileSync(outputPath, buffer);

  console.log(`  Saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return outputPath;
}

async function main() {
  console.log("Hero Image Generator (Simple)");
  console.log("=============================");

  if (!MAPBOX_TOKEN) {
    console.error("\nError: NEXT_PUBLIC_MAPBOX_TOKEN not found in .env.local");
    console.error("Make sure your .env.local file has the Mapbox token set.");
    process.exit(1);
  }

  console.log(`Using Mapbox token: ${MAPBOX_TOKEN.slice(0, 10)}...`);

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
      console.error(`  Error: ${error.message}`);
      errors.push({ city: example.city, error: error.message });
    }
  }

  console.log("\n=============================");
  console.log("Generation Complete");
  console.log(`Success: ${results.length}/${HERO_EXAMPLES.length}`);

  if (errors.length > 0) {
    console.log("\nFailed:");
    errors.forEach((e) => console.log(`  - ${e.city}: ${e.error}`));
  }
}

main().catch(console.error);