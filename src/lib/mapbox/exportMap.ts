import mapboxgl from "mapbox-gl";
import { PRINT_SPECS } from "@/config/product";
import { scrubLayers } from "./layerScrubbing";

interface ExportOptions {
  style: string;
  center: [number, number];
  zoom: number;
  bearing?: number;
  pitch?: number;
}

/**
 * Export a high-resolution map image for print.
 * Creates a hidden map instance at 5400x7200px (18"x24" at 300 DPI).
 *
 * Based on techniques from:
 * - mpetroff/print-maps
 * - watergis/mapbox-gl-export
 */
export async function exportMapImage(
  options: ExportOptions
): Promise<Blob | null> {
  const { style, center, zoom, bearing = 0, pitch = 0 } = options;

  return new Promise((resolve) => {
    // Store original pixel ratio
    const actualPixelRatio = window.devicePixelRatio;

    // Calculate target pixel ratio for 300 DPI output
    // 300 DPI / 96 DPI (screen) = 3.125
    const targetDpi = PRINT_SPECS.dpi;
    const targetPixelRatio = targetDpi / 96;

    // Override devicePixelRatio for high-res rendering
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      get: () => targetPixelRatio,
    });

    // Create hidden container
    const hidden = document.createElement("div");
    hidden.style.position = "absolute";
    hidden.style.left = "-99999px";
    hidden.style.top = "-99999px";
    hidden.style.overflow = "hidden";
    document.body.appendChild(hidden);

    // Calculate container size to achieve target pixel dimensions
    // Container size = target pixels / pixel ratio
    const containerWidth = PRINT_SPECS.widthPx / targetPixelRatio;
    const containerHeight = PRINT_SPECS.heightPx / targetPixelRatio;

    const container = document.createElement("div");
    container.style.width = `${containerWidth}px`;
    container.style.height = `${containerHeight}px`;
    hidden.appendChild(container);

    // Create render map
    const renderMap = new mapboxgl.Map({
      container,
      style,
      center,
      zoom,
      bearing,
      pitch,
      interactive: false,
      preserveDrawingBuffer: true,
      fadeDuration: 0,
      attributionControl: false,
    });

    // Wait for map to fully render
    renderMap.once("idle", () => {
      // Apply layer scrubbing
      scrubLayers(renderMap);

      // Small delay to ensure scrubbing is applied
      setTimeout(() => {
        // Export canvas to blob
        const canvas = renderMap.getCanvas();

        canvas.toBlob(
          (blob) => {
            // Cleanup
            renderMap.remove();
            hidden.parentNode?.removeChild(hidden);

            // Restore original pixel ratio
            Object.defineProperty(window, "devicePixelRatio", {
              configurable: true,
              get: () => actualPixelRatio,
            });

            resolve(blob);
          },
          "image/png",
          1.0
        );
      }, 100);
    });

    // Handle errors
    renderMap.on("error", (e) => {
      console.error("Map export error:", e);

      // Cleanup on error
      renderMap.remove();
      hidden.parentNode?.removeChild(hidden);

      // Restore original pixel ratio
      Object.defineProperty(window, "devicePixelRatio", {
        configurable: true,
        get: () => actualPixelRatio,
      });

      resolve(null);
    });
  });
}

/**
 * Download the exported map image.
 */
export function downloadMapImage(blob: Blob, filename = "tampa-bay-map.png"): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
