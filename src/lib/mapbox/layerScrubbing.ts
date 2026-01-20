import type { Map } from "mapbox-gl";

/**
 * Layers to hide for a clean, architectural aesthetic.
 * These remove POIs, transit markers, and airport labels.
 */
const HIDDEN_LAYERS = [
  "poi-label",
  "transit-label",
  "airport-label",
] as const;

/**
 * Additional layer patterns to hide for an even cleaner look.
 * These catch variations across different Mapbox styles.
 */
const HIDDEN_LAYER_PATTERNS = [
  /^poi/,
  /^transit/,
  /^airport/,
  /place-label.*poi/,
] as const;

/**
 * Scrub (hide) POI, transit, and airport labels from the map.
 * Call this on map load and after style changes.
 */
export function scrubLayers(map: Map): void {
  const style = map.getStyle();
  if (!style || !style.layers) return;

  style.layers.forEach((layer) => {
    // Check exact matches
    if (HIDDEN_LAYERS.includes(layer.id as (typeof HIDDEN_LAYERS)[number])) {
      map.setLayoutProperty(layer.id, "visibility", "none");
      return;
    }

    // Check pattern matches
    for (const pattern of HIDDEN_LAYER_PATTERNS) {
      if (pattern.test(layer.id)) {
        map.setLayoutProperty(layer.id, "visibility", "none");
        return;
      }
    }
  });
}

/**
 * Sets up automatic layer scrubbing on style load events.
 * This ensures POIs stay hidden when switching between styles.
 */
export function setupAutoScrubbing(map: Map): void {
  // Scrub on initial style load
  map.on("style.load", () => {
    scrubLayers(map);
  });

  // Also scrub if style is already loaded
  if (map.isStyleLoaded()) {
    scrubLayers(map);
  }
}
