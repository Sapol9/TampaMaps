import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import themes from "@/data/themes.json";
import type { Theme } from "@/lib/mapbox/applyTheme";

/**
 * Server-side print image generation using Mapbox Static Images API + Sharp
 *
 * Requires Mapbox Studio styles to be created for each theme.
 * Set style IDs in environment variables:
 *   MAPBOX_STYLE_OBSIDIAN, MAPBOX_STYLE_COBALT, MAPBOX_STYLE_PARCHMENT,
 *   MAPBOX_STYLE_COASTAL, MAPBOX_STYLE_COPPER
 *
 * Static API limits: 1280x1280 max (2560x2560 @2x)
 * We request 960x1280 @2x (1920x2560) then upscale to 5400x7200
 */

// Print dimensions (300 DPI for 18"×24")
const PRINT_WIDTH = 5400;
const PRINT_HEIGHT = 7200;

// Static API max dimensions with @2x
const STATIC_WIDTH = 960;
const STATIC_HEIGHT = 1280;

// Safe zone percentages
const SAFE_ZONE_VERTICAL_PERCENT = (1.5 / 24) * 100; // 6.25%
const SAFE_ZONE_HORIZONTAL_PERCENT = (1.5 / 18) * 100; // 8.33%

// Style IDs from Mapbox Studio
const MAPBOX_STYLE_IDS: Record<string, string> = {
  obsidian: process.env.MAPBOX_STYLE_OBSIDIAN || "",
  cobalt: process.env.MAPBOX_STYLE_COBALT || "",
  parchment: process.env.MAPBOX_STYLE_PARCHMENT || "",
  coastal: process.env.MAPBOX_STYLE_COASTAL || "",
  copper: process.env.MAPBOX_STYLE_COPPER || "",
};

interface GeneratePrintRequest {
  center: [number, number]; // [lng, lat]
  zoom: number;
  themeId: string;
  cityName: string;
  stateName: string;
  coordinates: string; // formatted coordinates string
  focusPoint?: {
    lat: number;
    lng: number;
    address?: string;
  };
  detailLineType: "coordinates" | "address" | "none";
}

/**
 * Creates SVG text overlay matching the preview styling
 */
function createTextOverlaySVG(
  theme: Theme,
  cityName: string,
  stateName: string,
  detailText: string,
  detailLineType: string
): string {
  // cqw equivalent at print resolution
  const cqw = PRINT_WIDTH / 100;

  // Calculate positions
  const textBottomY = PRINT_HEIGHT * (1 - SAFE_ZONE_VERTICAL_PERCENT / 100);
  const textCenterX = PRINT_WIDTH / 2;
  const safeZoneRight = PRINT_WIDTH * (1 - SAFE_ZONE_HORIZONTAL_PERCENT / 100);

  // Space out city name letters
  const spacedCityName = cityName.toUpperCase().split("").join(" ");

  // Dynamic city font size based on length
  const cityFontSize =
    cityName.length > 14
      ? 4.5 * cqw
      : cityName.length > 10
        ? 5.5 * cqw
        : cityName.length > 6
          ? 6.5 * cqw
          : 8 * cqw;

  // Calculate Y positions (bottom-up)
  let currentY = textBottomY - 2 * cqw;

  const detailY = currentY;
  currentY -= detailLineType !== "none" ? 3.5 * cqw : 0;

  const stateY = currentY;
  currentY -= 4 * cqw;

  const lineY = currentY;
  currentY -= 3 * cqw;

  const cityY = currentY;

  // Build SVG with text halo effect using filters
  return `<svg width="${PRINT_WIDTH}" height="${PRINT_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;600&amp;display=swap');
      .city-text {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 600;
        font-size: ${cityFontSize}px;
        fill: ${theme.colors.text};
        fill-opacity: 0.9;
        letter-spacing: 0.1em;
      }
      .state-text {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 300;
        font-size: ${3 * cqw}px;
        fill: ${theme.colors.text};
        fill-opacity: 0.9;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .detail-text {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 300;
        font-size: ${2.5 * cqw}px;
        fill: ${theme.colors.text};
        fill-opacity: 0.7;
        letter-spacing: 0.1em;
      }
      .attr-text {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 300;
        font-size: ${1.5 * cqw}px;
        fill: ${theme.colors.text};
        fill-opacity: 0.15;
        letter-spacing: 0.02em;
      }
      .halo {
        stroke: ${theme.colors.bg};
        stroke-width: ${0.15 * cqw}px;
        stroke-linejoin: round;
        paint-order: stroke fill;
      }
    </style>
  </defs>

  <!-- City name -->
  <text x="${textCenterX}" y="${cityY}" text-anchor="middle" dominant-baseline="middle" class="city-text halo">
    ${escapeXml(spacedCityName)}
  </text>

  <!-- Decorative line -->
  <rect x="${textCenterX - 5 * cqw}" y="${lineY}" width="${10 * cqw}" height="2" fill="${theme.colors.text}" fill-opacity="0.9"/>

  <!-- State name -->
  <text x="${textCenterX}" y="${stateY}" text-anchor="middle" dominant-baseline="middle" class="state-text halo">
    ${escapeXml(stateName.toUpperCase())}
  </text>

  ${
    detailLineType !== "none"
      ? `<!-- Detail line (coordinates/address) -->
  <text x="${textCenterX}" y="${detailY}" text-anchor="middle" dominant-baseline="middle" class="detail-text halo">
    ${escapeXml(detailText)}
  </text>`
      : ""
  }

  <!-- Attribution -->
  <text x="${safeZoneRight}" y="${textBottomY}" text-anchor="end" dominant-baseline="text-after-edge" class="attr-text">
    © Mapbox © OpenStreetMap
  </text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePrintRequest = await request.json();
    const { center, zoom, themeId, cityName, stateName, coordinates, focusPoint, detailLineType } =
      body;

    // Get theme
    const theme = (themes as Theme[]).find((t) => t.id === themeId);
    if (!theme) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    // Get style ID
    const styleId = MAPBOX_STYLE_IDS[themeId];
    if (!styleId) {
      return NextResponse.json(
        {
          error: `Mapbox style not configured for theme: ${themeId}. Set MAPBOX_STYLE_${themeId.toUpperCase()} environment variable.`,
        },
        { status: 500 }
      );
    }

    const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!MAPBOX_TOKEN) {
      return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 });
    }

    // Calculate zoom adjustment for print resolution
    // The Static API renders at the specified dimensions, so we need to adjust zoom
    // to show the same geographic area as the preview
    const previewWidth = 400; // Approximate preview width
    const zoomAdjustment = Math.log2((STATIC_WIDTH * 2) / previewWidth);
    const adjustedZoom = zoom + zoomAdjustment;

    // Build Static API URL
    // Format: /styles/v1/{username}/{style_id}/static/{lon},{lat},{zoom},{bearing},{pitch}/{width}x{height}@2x
    const staticUrl = `https://api.mapbox.com/styles/v1/${styleId}/static/${center[0]},${center[1]},${adjustedZoom.toFixed(2)},0,0/${STATIC_WIDTH}x${STATIC_HEIGHT}@2x?access_token=${MAPBOX_TOKEN}&logo=false&attribution=false`;

    console.log("[generate-print] Fetching map from Static API...");

    const mapResponse = await fetch(staticUrl);
    if (!mapResponse.ok) {
      const errorText = await mapResponse.text();
      console.error("[generate-print] Static API error:", errorText);
      return NextResponse.json(
        { error: `Mapbox Static API error: ${mapResponse.status}` },
        { status: 500 }
      );
    }

    const mapBuffer = Buffer.from(await mapResponse.arrayBuffer());
    console.log("[generate-print] Map fetched, size:", mapBuffer.length);

    // Scale up to print resolution using Sharp
    // Use lanczos3 for high-quality upscaling of vector-like content
    const scaledMap = await sharp(mapBuffer)
      .resize(PRINT_WIDTH, PRINT_HEIGHT, {
        fit: "fill",
        kernel: "lanczos3",
      })
      .toBuffer();

    console.log("[generate-print] Map scaled to print resolution");

    // Determine detail text
    const detailText =
      detailLineType === "address" && focusPoint?.address
        ? focusPoint.address.split(",")[0].trim()
        : coordinates;

    // Create SVG text overlay
    const svgOverlay = createTextOverlaySVG(theme, cityName, stateName, detailText, detailLineType);

    // Composite text overlay onto map
    const finalImage = await sharp(scaledMap)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    console.log("[generate-print] Final image generated, size:", finalImage.length);

    // Return as base64 data URL for compatibility with existing flow
    const base64 = finalImage.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ imageDataUrl: dataUrl });
  } catch (error) {
    console.error("[generate-print] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}