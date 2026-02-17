#!/usr/bin/env node

/**
 * Batch Render Cities Script
 *
 * Generates print-ready map images for 50 popular cities across all themes.
 * Outputs 250 total images (50 cities × 5 themes) for Etsy/Pinterest listings.
 *
 * Usage:
 *   node scripts/batch-render-cities.js              # Render all
 *   node scripts/batch-render-cities.js --resume     # Skip existing files
 *   node scripts/batch-render-cities.js --theme obsidian
 *   node scripts/batch-render-cities.js --city "New York"
 *   node scripts/batch-render-cities.js --theme obsidian --city "New York"
 *
 * Requires: Render server running (RENDER_SERVER_URL in .env.local)
 */

const fs = require("fs");
const path = require("path");

// ============================================================================
// Configuration
// ============================================================================

const OUTPUT_DIR = path.join(__dirname, "..", "output", "batch");
const THEMES_FILE = path.join(__dirname, "..", "src", "data", "themes.json");
const DELAY_BETWEEN_RENDERS_MS = 5000;
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60; // 2 minutes max per render

// 50 Popular Cities: 25 US + 25 International
const CITIES = [
  // ==================== TOP 25 US CITIES ====================
  { name: "New York", state: "New York", lat: 40.7128, lng: -74.006, zoom: 13 },
  { name: "Los Angeles", state: "California", lat: 34.0522, lng: -118.2437, zoom: 11 },
  { name: "Chicago", state: "Illinois", lat: 41.8781, lng: -87.6298, zoom: 12 },
  { name: "Houston", state: "Texas", lat: 29.7604, lng: -95.3698, zoom: 11 },
  { name: "Phoenix", state: "Arizona", lat: 33.4484, lng: -112.074, zoom: 11 },
  { name: "Philadelphia", state: "Pennsylvania", lat: 39.9526, lng: -75.1652, zoom: 12 },
  { name: "San Antonio", state: "Texas", lat: 29.4241, lng: -98.4936, zoom: 12 },
  { name: "San Diego", state: "California", lat: 32.7157, lng: -117.1611, zoom: 12 },
  { name: "Dallas", state: "Texas", lat: 32.7767, lng: -96.797, zoom: 12 },
  { name: "San Jose", state: "California", lat: 37.3382, lng: -121.8863, zoom: 12 },
  { name: "Austin", state: "Texas", lat: 30.2672, lng: -97.7431, zoom: 12 },
  { name: "Jacksonville", state: "Florida", lat: 30.3322, lng: -81.6557, zoom: 11 },
  { name: "Tampa", state: "Florida", lat: 27.9506, lng: -82.4572, zoom: 12 },
  { name: "Columbus", state: "Ohio", lat: 39.9612, lng: -82.9988, zoom: 12 },
  { name: "Charlotte", state: "North Carolina", lat: 35.2271, lng: -80.8431, zoom: 12 },
  { name: "Indianapolis", state: "Indiana", lat: 39.7684, lng: -86.1581, zoom: 12 },
  { name: "San Francisco", state: "California", lat: 37.7749, lng: -122.4194, zoom: 13 },
  { name: "Seattle", state: "Washington", lat: 47.6062, lng: -122.3321, zoom: 12 },
  { name: "Denver", state: "Colorado", lat: 39.7392, lng: -104.9903, zoom: 12 },
  { name: "Washington", state: "District of Columbia", lat: 38.9072, lng: -77.0369, zoom: 12 },
  { name: "Nashville", state: "Tennessee", lat: 36.1627, lng: -86.7816, zoom: 12 },
  { name: "Oklahoma City", state: "Oklahoma", lat: 35.4676, lng: -97.5164, zoom: 11 },
  { name: "Portland", state: "Oregon", lat: 45.5152, lng: -122.6784, zoom: 12 },
  { name: "Las Vegas", state: "Nevada", lat: 36.1699, lng: -115.1398, zoom: 12 },
  { name: "Miami", state: "Florida", lat: 25.7617, lng: -80.1918, zoom: 12 },

  // ==================== TOP 25 INTERNATIONAL CITIES ====================
  { name: "London", state: "United Kingdom", lat: 51.5074, lng: -0.1278, zoom: 12 },
  { name: "Paris", state: "France", lat: 48.8566, lng: 2.3522, zoom: 12 },
  { name: "Tokyo", state: "Japan", lat: 35.6762, lng: 139.6503, zoom: 12 },
  { name: "Toronto", state: "Canada", lat: 43.6532, lng: -79.3832, zoom: 12 },
  { name: "Sydney", state: "Australia", lat: -33.8688, lng: 151.2093, zoom: 12 },
  { name: "Dubai", state: "United Arab Emirates", lat: 25.2048, lng: 55.2708, zoom: 12 },
  { name: "Barcelona", state: "Spain", lat: 41.3851, lng: 2.1734, zoom: 12 },
  { name: "Amsterdam", state: "Netherlands", lat: 52.3676, lng: 4.9041, zoom: 13 },
  { name: "Berlin", state: "Germany", lat: 52.52, lng: 13.405, zoom: 12 },
  { name: "Rome", state: "Italy", lat: 41.9028, lng: 12.4964, zoom: 12 },
  { name: "Bangkok", state: "Thailand", lat: 13.7563, lng: 100.5018, zoom: 12 },
  { name: "Singapore", state: "Singapore", lat: 1.3521, lng: 103.8198, zoom: 13 },
  { name: "Hong Kong", state: "China", lat: 22.3193, lng: 114.1694, zoom: 13 },
  { name: "Mumbai", state: "India", lat: 19.076, lng: 72.8777, zoom: 12 },
  { name: "Seoul", state: "South Korea", lat: 37.5665, lng: 126.978, zoom: 12 },
  { name: "Dublin", state: "Ireland", lat: 53.3498, lng: -6.2603, zoom: 13 },
  { name: "Lisbon", state: "Portugal", lat: 38.7223, lng: -9.1393, zoom: 12 },
  { name: "Vienna", state: "Austria", lat: 48.2082, lng: 16.3738, zoom: 12 },
  { name: "Prague", state: "Czech Republic", lat: 50.0755, lng: 14.4378, zoom: 13 },
  { name: "Stockholm", state: "Sweden", lat: 59.3293, lng: 18.0686, zoom: 12 },
  { name: "Copenhagen", state: "Denmark", lat: 55.6761, lng: 12.5683, zoom: 13 },
  { name: "Melbourne", state: "Australia", lat: -37.8136, lng: 144.9631, zoom: 12 },
  { name: "Cape Town", state: "South Africa", lat: -33.9249, lng: 18.4241, zoom: 12 },
  { name: "Buenos Aires", state: "Argentina", lat: -34.6037, lng: -58.3816, zoom: 12 },
  { name: "Mexico City", state: "Mexico", lat: 19.4326, lng: -99.1332, zoom: 12 },
];

// ============================================================================
// Utilities
// ============================================================================

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

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatCoordinates(lat, lng) {
  const latDirection = lat >= 0 ? "N" : "S";
  const lngDirection = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDirection} / ${Math.abs(lng).toFixed(4)}° ${lngDirection}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    resume: false,
    theme: null,
    city: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--resume") {
      result.resume = true;
    } else if (args[i] === "--theme" && args[i + 1]) {
      result.theme = args[i + 1];
      i++;
    } else if (args[i] === "--city" && args[i + 1]) {
      result.city = args[i + 1];
      i++;
    }
  }

  return result;
}

// ============================================================================
// Render Server Communication (Direct, bypassing Next.js API)
// ============================================================================

async function submitRenderJob(params) {
  const RENDER_SERVER_URL = process.env.RENDER_SERVER_URL;
  const RENDER_SECRET = process.env.RENDER_SECRET;

  if (!RENDER_SERVER_URL || !RENDER_SECRET) {
    throw new Error("RENDER_SERVER_URL and RENDER_SECRET must be set in .env.local");
  }

  const response = await fetch(`${RENDER_SERVER_URL}/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-render-secret": RENDER_SECRET,
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

async function pollJobStatus(jobId) {
  const RENDER_SERVER_URL = process.env.RENDER_SERVER_URL;
  const RENDER_SECRET = process.env.RENDER_SECRET;

  const response = await fetch(`${RENDER_SERVER_URL}/status/${jobId}`, {
    headers: {
      "x-render-secret": RENDER_SECRET,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Status check failed: ${response.status}`);
  }

  return response.json();
}

async function waitForCompletion(jobId) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const status = await pollJobStatus(jobId);

    if (status.status === "completed" && status.imageBase64) {
      return status.imageBase64;
    }

    if (status.status === "failed") {
      throw new Error(status.error || "Render job failed");
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Render job timed out");
}

async function renderCity(city, theme) {
  const { jobId } = await submitRenderJob({
    lat: city.lat,
    lng: city.lng,
    zoom: city.zoom,
    themeId: theme.id,
    city: city.name,
    state: city.state,
    coordinates: formatCoordinates(city.lat, city.lng),
    paid: true, // No watermark for batch renders
    detailLineType: "coordinates",
  });

  const imageBase64 = await waitForCompletion(jobId);
  return Buffer.from(imageBase64, "base64");
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("MapMarked Batch City Renderer");
  console.log("=".repeat(60));
  console.log();

  // Load environment
  loadEnv();

  // Validate environment
  if (!process.env.RENDER_SERVER_URL || !process.env.RENDER_SECRET) {
    console.error("Error: RENDER_SERVER_URL and RENDER_SECRET must be set in .env.local");
    console.error("This script calls the render server directly to bypass payment verification.");
    process.exit(1);
  }

  // Parse arguments
  const args = parseArgs();
  console.log("Options:");
  console.log(`  --resume: ${args.resume}`);
  console.log(`  --theme: ${args.theme || "(all)"}`);
  console.log(`  --city: ${args.city || "(all)"}`);
  console.log();

  // Load themes
  let themes;
  try {
    themes = JSON.parse(fs.readFileSync(THEMES_FILE, "utf8"));
    console.log(`Loaded ${themes.length} themes from themes.json`);
  } catch (err) {
    console.error("Failed to load themes.json:", err.message);
    process.exit(1);
  }

  // Filter themes if --theme flag provided
  if (args.theme) {
    themes = themes.filter((t) => t.id === args.theme);
    if (themes.length === 0) {
      console.error(`Error: Theme "${args.theme}" not found`);
      console.error("Available themes:", JSON.parse(fs.readFileSync(THEMES_FILE, "utf8")).map((t) => t.id).join(", "));
      process.exit(1);
    }
  }

  // Filter cities if --city flag provided
  let cities = CITIES;
  if (args.city) {
    cities = cities.filter((c) => c.name.toLowerCase() === args.city.toLowerCase());
    if (cities.length === 0) {
      console.error(`Error: City "${args.city}" not found`);
      process.exit(1);
    }
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Build render queue
  const queue = [];
  for (const theme of themes) {
    const themeDir = path.join(OUTPUT_DIR, theme.id);
    if (!fs.existsSync(themeDir)) {
      fs.mkdirSync(themeDir, { recursive: true });
    }

    for (const city of cities) {
      const filename = `${slugify(city.name)}-${theme.id}-18x24.jpg`;
      const filepath = path.join(themeDir, filename);

      // Skip if file exists and --resume flag is set
      if (args.resume && fs.existsSync(filepath)) {
        continue;
      }

      queue.push({
        city,
        theme,
        filename,
        filepath,
      });
    }
  }

  const totalPossible = themes.length * cities.length;
  const skipped = totalPossible - queue.length;

  console.log();
  console.log(`Render queue: ${queue.length} images`);
  if (skipped > 0) {
    console.log(`Skipped (already exist): ${skipped} images`);
  }
  console.log();

  if (queue.length === 0) {
    console.log("Nothing to render. All images already exist.");
    return;
  }

  // Process queue
  const results = [];
  const errors = [];

  for (let i = 0; i < queue.length; i++) {
    const { city, theme, filename, filepath } = queue[i];
    const progress = `[${i + 1}/${queue.length}]`;

    console.log(`${progress} Generating ${city.name} (${theme.id})...`);

    try {
      const imageBuffer = await renderCity(city, theme);
      fs.writeFileSync(filepath, imageBuffer);

      results.push({
        city: city.name,
        state: city.state,
        theme: theme.id,
        lat: city.lat,
        lng: city.lng,
        zoom: city.zoom,
        filename,
        filepath: path.relative(path.join(__dirname, ".."), filepath),
      });

      console.log(`  ✓ Saved: ${filename}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      errors.push({
        city: city.name,
        theme: theme.id,
        error: err.message,
      });
    }

    // Delay between renders (except for the last one)
    if (i < queue.length - 1) {
      await sleep(DELAY_BETWEEN_RENDERS_MS);
    }
  }

  // Generate manifest
  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  const manifest = {
    generated: new Date().toISOString(),
    totalImages: results.length,
    themes: themes.map((t) => t.id),
    images: results,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Print summary
  console.log();
  console.log("=".repeat(60));
  console.log("Summary");
  console.log("=".repeat(60));
  console.log(`  Succeeded: ${results.length}`);
  console.log(`  Failed: ${errors.length}`);
  console.log(`  Manifest: ${manifestPath}`);

  if (errors.length > 0) {
    console.log();
    console.log("Failed renders:");
    for (const err of errors) {
      console.log(`  - ${err.city} (${err.theme}): ${err.error}`);
    }
  }

  console.log();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});