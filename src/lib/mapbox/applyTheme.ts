import type { Map } from "mapbox-gl";

export interface ThemeColors {
  bg: string;
  text: string;
  gradient_color: string;
  water: string;
  parks: string;
  road_motorway: string;
  road_primary: string;
  road_secondary: string;
  road_tertiary: string;
  road_residential: string;
  road_default: string;
}

export interface Theme {
  id: string;
  name: string;
  moodTag: string;
  description: string;
  colors: ThemeColors;
}

/**
 * Safely set a paint property on a layer.
 */
function safeSetPaint(
  map: Map,
  layerId: string,
  property: string,
  value: string | number
): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setPaintProperty(layerId, property as any, value);
  } catch {
    // Silently ignore
  }
}

/**
 * Determine road hierarchy from layer ID
 */
function getRoadHierarchy(layerId: string): "motorway" | "primary" | "secondary" | "tertiary" | "residential" | "default" | null {
  const id = layerId.toLowerCase();

  if (id.includes("motorway") || id.includes("trunk")) {
    return "motorway";
  }
  if (id.includes("primary")) {
    return "primary";
  }
  if (id.includes("secondary")) {
    return "secondary";
  }
  if (id.includes("tertiary") || id.includes("street")) {
    return "tertiary";
  }
  if (id.includes("residential") || id.includes("service") || id.includes("minor")) {
    return "residential";
  }
  if (id.includes("road") || id.includes("path") || id.includes("link") ||
      id.includes("pedestrian") || id.includes("track")) {
    return "default";
  }

  return null;
}

/**
 * Apply a custom color theme to the Mapbox map.
 * This overrides layer colors at runtime after the base style loads.
 */
export function applyTheme(map: Map, theme: Theme): void {
  const { colors } = theme;

  // Wait for style to be loaded
  if (!map.isStyleLoaded()) {
    map.once("style.load", () => applyTheme(map, theme));
    return;
  }

  const style = map.getStyle();
  if (!style || !style.layers) return;

  // Road color mapping
  const roadColors: Record<string, string> = {
    motorway: colors.road_motorway,
    primary: colors.road_primary,
    secondary: colors.road_secondary,
    tertiary: colors.road_tertiary,
    residential: colors.road_residential,
    default: colors.road_default,
  };

  // Process each layer
  style.layers.forEach((layer) => {
    const layerId = layer.id;
    const layerType = layer.type;
    const id = layerId.toLowerCase();

    // === BACKGROUND ===
    if (layerType === "background") {
      safeSetPaint(map, layerId, "background-color", colors.bg);
      return;
    }

    // === FILL LAYERS ===
    if (layerType === "fill") {
      // Land - use background color
      if (id === "land" || id.includes("landmass") || id === "land-structure-polygon") {
        safeSetPaint(map, layerId, "fill-color", colors.bg);
        return;
      }

      // Water
      if (id.includes("water") || id === "water") {
        safeSetPaint(map, layerId, "fill-color", colors.water);
        return;
      }

      // Parks and natural areas
      if (
        id.includes("park") ||
        id.includes("landuse") ||
        id.includes("landcover") ||
        id.includes("national-park") ||
        id.includes("pitch") ||
        id.includes("cemetery") ||
        id.includes("sand") ||
        id.includes("grass") ||
        id.includes("scrub") ||
        id.includes("wood") ||
        id.includes("glacier") ||
        id.includes("wetland")
      ) {
        safeSetPaint(map, layerId, "fill-color", colors.parks);
        return;
      }

      // Buildings
      if (id.includes("building")) {
        safeSetPaint(map, layerId, "fill-color", colors.parks);
        return;
      }

      // Any other fill - make it the background color to create clean look
      // This catches layers like "human-made", structure fills, etc.
      safeSetPaint(map, layerId, "fill-color", colors.bg);
      return;
    }

    // === LINE LAYERS ===
    if (layerType === "line") {
      // Water lines (rivers, streams)
      if (id.includes("waterway") || id.includes("water-line")) {
        safeSetPaint(map, layerId, "line-color", colors.water);
        return;
      }

      // Road layers - check for road hierarchy
      const roadType = getRoadHierarchy(id);
      if (roadType) {
        safeSetPaint(map, layerId, "line-color", roadColors[roadType]);
        return;
      }

      // Bridge and tunnel variants
      if (id.includes("bridge") || id.includes("tunnel")) {
        // Try to determine what road type this bridge/tunnel is
        const strippedId = id.replace("bridge-", "").replace("tunnel-", "").replace("-case", "");
        const bridgeRoadType = getRoadHierarchy(strippedId);
        if (bridgeRoadType) {
          safeSetPaint(map, layerId, "line-color", roadColors[bridgeRoadType]);
          return;
        }
      }

      // Rail lines - use default road color
      if (id.includes("rail") || id.includes("transit")) {
        safeSetPaint(map, layerId, "line-color", colors.road_default);
        return;
      }

      // Any other line layer - use a muted version of the road default
      // This catches admin boundaries, etc. which we'll hide anyway
    }

    // === FILL-EXTRUSION LAYERS (3D buildings) ===
    if (layerType === "fill-extrusion") {
      try {
        map.setPaintProperty(layerId, "fill-extrusion-color", colors.parks);
      } catch {
        // Ignore
      }
      return;
    }
  });

  // Also set fog/atmosphere to match theme
  try {
    map.setFog({
      color: colors.bg,
      "high-color": colors.bg,
      "horizon-blend": 0.02,
    });
  } catch {
    // Fog may not be supported
  }
}

/**
 * Get base Mapbox style URL for a theme.
 * Dark themes use dark-v11, light themes use light-v11.
 */
export function getBaseStyleForTheme(theme: Theme): string {
  const darkThemes = [
    "noir",
    "blueprint",
    "midnight-blue",
    "neon-cyberpunk",
  ];

  if (darkThemes.includes(theme.id)) {
    return "mapbox://styles/mapbox/dark-v11";
  }

  return "mapbox://styles/mapbox/light-v11";
}
