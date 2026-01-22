import type { Map } from "mapbox-gl";

/**
 * Hide ALL labels and symbols to achieve a clean maptoposter-style aesthetic.
 * We want only roads, water, and parks - no text, icons, or markers.
 */
export function scrubLayers(map: Map): void {
  const style = map.getStyle();
  if (!style || !style.layers) return;

  style.layers.forEach((layer) => {
    const layerId = layer.id;
    const layerType = layer.type;
    const id = layerId.toLowerCase();

    // Hide ALL symbol layers (text labels, icons, markers)
    if (layerType === "symbol") {
      try {
        map.setLayoutProperty(layerId, "visibility", "none");
      } catch {
        // Ignore errors
      }
      return;
    }

    // Hide specific layer patterns that might not be symbols
    const hiddenPatterns = [
      /label/i,
      /symbol/i,
      /icon/i,
      /marker/i,
      /poi/i,
      /place/i,
      /transit/i,
      /airport/i,
      /admin/i,
      /boundary/i,
      /country/i,
      /state/i,
      /ferry/i,
      /aeroway/i,
      /helipad/i,
      /gate/i,
    ];

    for (const pattern of hiddenPatterns) {
      if (pattern.test(id)) {
        try {
          map.setLayoutProperty(layerId, "visibility", "none");
        } catch {
          // Ignore errors
        }
        return;
      }
    }

    // Also hide any layer with "text" in the paint properties
    // This catches edge cases where text might be rendered differently
    if (layer.paint && "text-color" in layer.paint) {
      try {
        map.setLayoutProperty(layerId, "visibility", "none");
      } catch {
        // Ignore errors
      }
    }
  });
}

/**
 * Sets up automatic layer scrubbing on style load events.
 * This ensures labels stay hidden when switching between styles.
 */
export function setupAutoScrubbing(map: Map): void {
  map.on("style.load", () => {
    scrubLayers(map);
  });

  if (map.isStyleLoaded()) {
    scrubLayers(map);
  }
}
