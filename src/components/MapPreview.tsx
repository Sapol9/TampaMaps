"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/mapbox-hardening.css";
import html2canvas from "html2canvas";
import { createCustomStyle } from "@/lib/mapbox/createStyle";
import type { Theme } from "@/lib/mapbox/applyTheme";
import SafeZoneOverlay from "./SafeZoneOverlay";
import RenderingOverlay from "./RenderingOverlay";

export interface MapPreviewHandle {
  captureImage: () => Promise<string | null>;
  waitForIdle: () => Promise<void>;
}

interface FocusPoint {
  lat: number;
  lng: number;
  address?: string;
}

type DetailLineType = "coordinates" | "address" | "none";

interface MapPreviewProps {
  theme: Theme;
  center: [number, number];
  zoom: number;
  cityName?: string;
  stateName?: string;
  focusPoint?: FocusPoint | null;
  detailLineType?: DetailLineType;
  showSafeZone?: boolean;
  showTextOverlay?: boolean;
  onToggleSafeZone?: () => void;
  isRendering?: boolean;
  onRenderComplete?: () => void;
}

// Crosshair overlay component for manual adjustment mode
function CrosshairOverlay({ visible, color }: { visible: boolean; color: string }) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      {/* Horizontal line */}
      <div
        className="absolute w-8 h-px"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />
      {/* Vertical line */}
      <div
        className="absolute w-px h-8"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />
      {/* Center dot */}
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{ backgroundColor: color, opacity: 0.8 }}
      />
    </div>
  );
}

// Safe zone constants for portrait (18"x24") - 1.5" border for gallery wrap
// Final render: 5400px × 7200px at 300 DPI
const SAFE_ZONE_VERTICAL_PERCENT = (1.5 / 24) * 100; // 6.25%
const SAFE_ZONE_HORIZONTAL_PERCENT = (1.5 / 18) * 100; // 8.33%

const MapPreview = forwardRef<MapPreviewHandle, MapPreviewProps>(function MapPreview({
  theme,
  center,
  zoom,
  cityName = "TAMPA",
  stateName = "FLORIDA",
  focusPoint,
  detailLineType = "coordinates",
  showSafeZone = false,
  showTextOverlay = true,
  onToggleSafeZone,
  isRendering = false,
  onRenderComplete,
}, ref) {
  const previewContainer = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [hasMovedInManualMode, setHasMovedInManualMode] = useState(false);
  const currentThemeRef = useRef<string>(theme.id);
  const lockedCenter = useRef<[number, number]>(center);

  // Get the actual center point (focus point or city center)
  const actualCenter: [number, number] = focusPoint
    ? [focusPoint.lng, focusPoint.lat]
    : center;

  // Format coordinates for display
  const displayLat = focusPoint?.lat ?? center[1];
  const displayLng = focusPoint?.lng ?? center[0];
  const latDirection = displayLat >= 0 ? "N" : "S";
  const lngDirection = displayLng >= 0 ? "E" : "W";
  const formattedCoords = `${Math.abs(displayLat).toFixed(4)}° ${latDirection} / ${Math.abs(displayLng).toFixed(4)}° ${lngDirection}`;

  // Space out the city name letters for poster aesthetic
  const spacedCityName = cityName.toUpperCase().split("").join(" ");

  // Update marker
  const updateMarker = () => {
    if (!map.current) return;

    // Remove existing marker
    marker.current?.remove();
    marker.current = null;

    // Add marker if we have a focus point
    if (focusPoint) {
      // Create minimalist marker element
      const el = document.createElement("div");
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = `2px solid ${theme.colors.text}`;
      el.style.backgroundColor = "transparent";
      el.style.boxSizing = "border-box";
      el.style.position = "relative";

      // Inner dot
      const innerDot = document.createElement("div");
      innerDot.style.width = "6px";
      innerDot.style.height = "6px";
      innerDot.style.borderRadius = "50%";
      innerDot.style.backgroundColor = theme.colors.text;
      innerDot.style.position = "absolute";
      innerDot.style.top = "50%";
      innerDot.style.left = "50%";
      innerDot.style.transform = "translate(-50%, -50%)";
      el.appendChild(innerDot);

      marker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([focusPoint.lng, focusPoint.lat])
        .addTo(map.current);
    }
  };

  // Toggle map interactivity based on manual mode
  const setMapInteractive = useCallback((interactive: boolean) => {
    if (!map.current) return;

    if (interactive) {
      map.current.dragPan.enable();
      map.current.scrollZoom.enable();
      map.current.boxZoom.enable();
      map.current.doubleClickZoom.enable();
      map.current.touchZoomRotate.enable();
      map.current.touchZoomRotate.disableRotation(); // Keep rotation disabled
    } else {
      map.current.dragPan.disable();
      map.current.scrollZoom.disable();
      map.current.boxZoom.disable();
      map.current.doubleClickZoom.disable();
      map.current.touchZoomRotate.disable();
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_public_token_here") {
      setError("Mapbox token not configured. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local");
      setIsLoading(false);
      return;
    }

    mapboxgl.accessToken = token;

    // Create custom style with our exact theme colors
    const customStyle = createCustomStyle(theme);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: customStyle,
      center: actualCenter,
      zoom: zoom,
      // Start with interactivity disabled (locked mode by default)
      interactive: false,
      attributionControl: false, // We render custom attribution for better control
      logoPosition: "bottom-right",
      preserveDrawingBuffer: true,
      // Disable rotation/pitch for flat architectural view
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
    });

    map.current.on("load", () => {
      setIsLoading(false);
      updateMarker();
      // Store the initial center position
      lockedCenter.current = actualCenter;
    });

    map.current.on("moveend", () => {
      if (isManualMode) {
        setHasMovedInManualMode(true);
      }
    });

    map.current.on("error", (e) => {
      if (e.error?.message) {
        console.error("Map error:", e.error.message);
      }
    });

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, []);

  // Handle theme changes - completely rebuild style
  useEffect(() => {
    if (!map.current) return;

    // Skip if theme hasn't changed
    if (currentThemeRef.current === theme.id) return;
    currentThemeRef.current = theme.id;

    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();

    // Create new style with the new theme colors
    const customStyle = createCustomStyle(theme);

    map.current.setStyle(customStyle);
    map.current.once("style.load", () => {
      map.current?.setCenter(currentCenter);
      map.current?.setZoom(currentZoom);
      // Re-add marker if exists
      updateMarker();
    });
  }, [theme]);

  // Handle center/focus point changes
  useEffect(() => {
    if (!map.current || isLoading) return;

    map.current.flyTo({
      center: actualCenter,
      zoom: zoom,
      duration: 1000,
    });

    updateMarker();
    // Update the locked center when location changes
    lockedCenter.current = actualCenter;
    // Reset manual mode when location changes
    setIsManualMode(false);
    setHasMovedInManualMode(false);
    setMapInteractive(false);
  }, [center[0], center[1], focusPoint?.lat, focusPoint?.lng, zoom, isLoading, setMapInteractive]);

  // Toggle manual adjustment mode
  const handleToggleManualMode = () => {
    if (isManualMode) {
      // Locking position - disable interactivity
      setMapInteractive(false);
      setIsManualMode(false);
    } else {
      // Entering manual mode - enable interactivity
      setMapInteractive(true);
      setIsManualMode(true);
      setHasMovedInManualMode(false);
    }
  };

  // Reset map to original center position
  const handleResetToCenter = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: lockedCenter.current,
      zoom: zoom,
      duration: 800,
    });
    setHasMovedInManualMode(false);
  };

  // Update marker when focus point or theme changes
  useEffect(() => {
    if (!isLoading) {
      updateMarker();
    }
  }, [focusPoint, theme.colors.text, isLoading]);

  // Wait for Mapbox map to be idle (all tiles loaded and rendered)
  const waitForIdle = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!map.current) {
        resolve();
        return;
      }

      const checkAndResolve = () => {
        // Add a longer delay to ensure WebGL has finished rendering all tiles
        setTimeout(resolve, 300);
      };

      // Check if already idle
      if (!map.current.isMoving() && !map.current.isZooming() && map.current.loaded() && map.current.areTilesLoaded()) {
        checkAndResolve();
        return;
      }

      // Wait for idle event
      const handleIdle = () => {
        // Double-check tiles are loaded after idle fires
        if (map.current?.areTilesLoaded()) {
          checkAndResolve();
        } else {
          // If tiles aren't loaded yet, wait a bit more
          setTimeout(() => {
            map.current?.once("idle", handleIdle);
          }, 200);
        }
      };

      map.current.once("idle", handleIdle);

      // Fallback timeout in case idle never fires
      setTimeout(() => {
        map.current?.off("idle", handleIdle);
        resolve();
      }, 5000);
    });
  }, []);

  // Capture the full preview including text overlay
  // Uses Mapbox's native canvas capture + html2canvas for text overlay compositing
  // Final output: 5400px × 7200px at 300 DPI for portrait canvas
  const captureImage = useCallback(async (): Promise<string | null> => {
    if (!previewContainer.current || !map.current) return null;

    // Trigger a render to ensure the map is fresh
    map.current.triggerRepaint();

    // Wait for map to be fully rendered before capturing
    await waitForIdle();

    // Extra delay for WebGL buffer to be ready
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      // Get the container dimensions
      const container = previewContainer.current;
      const rect = container.getBoundingClientRect();
      const scale = 2; // Higher quality capture
      const width = rect.width * scale;
      const height = rect.height * scale;

      // Create a composite canvas
      const compositeCanvas = document.createElement("canvas");
      compositeCanvas.width = width;
      compositeCanvas.height = height;
      const ctx = compositeCanvas.getContext("2d");
      if (!ctx) return null;

      // Scale for high DPI
      ctx.scale(scale, scale);

      // 1. Draw the Mapbox canvas directly (WebGL capture)
      const mapCanvas = map.current.getCanvas();
      ctx.drawImage(mapCanvas, 0, 0, rect.width, rect.height);

      // 2. Use html2canvas to capture ONLY the text overlay (not the map)
      const overlayCanvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null, // Transparent background
        scale: scale,
        logging: false,
        ignoreElements: (element) => {
          // Ignore the map container itself, safe zone, and rendering overlay
          if (element === mapContainer.current) return true;
          if (element.classList?.contains("mapboxgl-canvas-container")) return true;
          if (element.classList?.contains("mapboxgl-canvas")) return true;
          if (element.classList?.contains("safe-zone-overlay")) return true;
          if (element.classList?.contains("rendering-overlay")) return true;
          return false;
        },
      });

      // 3. Composite the text overlay on top of the map
      ctx.resetTransform(); // Reset scale for overlay
      ctx.drawImage(overlayCanvas, 0, 0);

      return compositeCanvas.toDataURL("image/jpeg", 0.9);
    } catch (err) {
      console.error("Failed to capture image:", err);
      return null;
    }
  }, [waitForIdle]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    captureImage,
    waitForIdle,
  }), [captureImage, waitForIdle]);

  return (
    <div className="relative w-full">
      {/* Map container - fixed portrait 3:4 aspect ratio (18" × 24") */}
      <div
        ref={previewContainer}
        className="aspect-[3/4] w-full relative rounded-lg overflow-hidden"
        style={{
          backgroundColor: theme.colors.bg,
          border: `1px solid ${theme.colors.road_default}20`,
          containerType: "inline-size", // Enable container queries for text scaling
        }}
      >
        {/* Loading state */}
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{ backgroundColor: theme.colors.bg }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{
                  borderColor: `${theme.colors.text}30`,
                  borderTopColor: theme.colors.text
                }}
              />
              <p className="text-sm" style={{ color: theme.colors.text }}>
                Loading map...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{ backgroundColor: theme.colors.bg }}
          >
            <div className="text-center px-4">
              <p className="text-sm text-red-500 mb-2">{error}</p>
              <p className="text-xs opacity-60" style={{ color: theme.colors.text }}>
                Get a token at mapbox.com
              </p>
            </div>
          </div>
        )}

        {/* Map */}
        <div ref={mapContainer} className="w-full h-full" />

        {/* Crosshair overlay for manual adjustment mode */}
        <CrosshairOverlay visible={isManualMode} color={theme.colors.text} />

        {/* Reset to center button - only visible in manual mode when map has been moved */}
        {isManualMode && hasMovedInManualMode && !isLoading && !error && (
          <button
            onClick={handleResetToCenter}
            className="absolute z-20 top-2 left-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black transition-colors shadow-sm text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
            title="Reset to center"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset to Center
          </button>
        )}

        {/* Text overlay - Space Grotesk typography with dynamic halo matching theme */}
        {showTextOverlay && !isLoading && !error && (
          <div
            className="absolute left-0 right-0 pointer-events-none z-20"
            style={{
              bottom: `${SAFE_ZONE_VERTICAL_PERCENT}%`,
              paddingLeft: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
              paddingRight: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
            }}
          >
            <div
              className="text-center py-2 sm:py-3"
              style={{
                // Hard-edge vector halo: 4 stacked shadows with 0 blur for crisp gap
                textShadow: `0 0 4px ${theme.colors.bg}, 0 0 4px ${theme.colors.bg}, 0 0 4px ${theme.colors.bg}, 0 0 4px ${theme.colors.bg}`,
              }}
            >
              {/* City Name - Space Grotesk with 0.1em letter spacing */}
              <h2
                className="font-semibold mb-1.5 sm:mb-2 leading-tight"
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  color: theme.colors.text,
                  opacity: 0.9,
                  letterSpacing: "0.1em",
                  // Dynamic font size: smaller for longer names, fits container width
                  fontSize: cityName.length > 14
                    ? "clamp(0.6rem, 4.5cqw, 1rem)"
                    : cityName.length > 10
                    ? "clamp(0.7rem, 5.5cqw, 1.25rem)"
                    : cityName.length > 6
                    ? "clamp(0.875rem, 6.5cqw, 1.5rem)"
                    : "clamp(1rem, 8cqw, 2rem)",
                }}
              >
                {spacedCityName}
              </h2>

              {/* Decorative Line */}
              <div
                className="w-10 sm:w-14 h-px mx-auto mb-1.5 sm:mb-2"
                style={{
                  backgroundColor: theme.colors.text,
                  opacity: 0.9,
                  boxShadow: `0 0 4px ${theme.colors.bg}`,
                }}
              />

              {/* State/Country Name - Space Grotesk */}
              <p
                className="text-[10px] sm:text-xs font-light uppercase mb-0.5 sm:mb-1"
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  color: theme.colors.text,
                  opacity: 0.9,
                  letterSpacing: "0.1em",
                }}
              >
                {stateName}
              </p>

              {/* Detail Line - coordinates, address, or none */}
              {detailLineType !== "none" && (
                <p
                  className="text-[8px] sm:text-[10px] font-light"
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    color: theme.colors.text,
                    opacity: 0.7,
                    letterSpacing: "0.1em",
                  }}
                >
                  {detailLineType === "address" && focusPoint?.address
                    ? focusPoint.address.split(",")[0].trim()
                    : formattedCoords}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mapbox attribution - Ghost Signature at safe zone edge */}
        {!isLoading && !error && (
          <div
            className="absolute z-50 pointer-events-none flex flex-col items-end gap-1"
            style={{
              // Position at safe zone edge: 6.25% from bottom, 8.33% from right
              bottom: `${SAFE_ZONE_VERTICAL_PERCENT}%`,
              right: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
            }}
          >
            {/* Mapbox logo - 85px width */}
            <svg
              width="85"
              height="22"
              viewBox="0 0 85 22"
              aria-label="Mapbox"
              style={{
                opacity: 0.25,
                filter: "grayscale(100%) brightness(1.2)",
              }}
            >
              <path
                d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                fill={theme.colors.text}
              />
              <path
                d="M11 6c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm2.5 6.32l-4.17 1.67c-.28.11-.61-.05-.61-.35V8.36c0-.3.33-.46.61-.35l4.17 1.67c.37.15.37.49 0 .64z"
                fill={theme.colors.text}
              />
              <text
                x="24"
                y="15"
                fontSize="12"
                fontFamily="var(--font-space-grotesk), Arial, sans-serif"
                fontWeight="600"
                fill={theme.colors.text}
              >
                mapbox
              </text>
            </svg>
            {/* Attribution text - 8px */}
            <span
              style={{
                fontSize: 8,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                color: theme.colors.text,
                letterSpacing: "0.02em",
                opacity: 0.25,
              }}
            >
              © OpenStreetMap
            </span>
          </div>
        )}

        {/* Safe zone overlay - fixed portrait */}
        <SafeZoneOverlay visible={showSafeZone} />

        {/* High-resolution rendering overlay */}
        <RenderingOverlay
          isRendering={isRendering}
          duration={2000}
          onComplete={onRenderComplete}
          themeName={theme.name}
        />
      </div>

      {/* Controls below the map */}
      <div className="mt-3 flex flex-col gap-2">
        {/* Manual adjustment toggle */}
        <button
          onClick={handleToggleManualMode}
          className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <span
            className={`w-4 h-4 rounded border flex items-center justify-center ${
              isManualMode
                ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white"
                : "border-neutral-400"
            }`}
          >
            {isManualMode && (
              <svg
                className="w-3 h-3 text-white dark:text-neutral-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </span>
          {isManualMode ? "Lock position" : "Adjust map position manually (optional)"}
        </button>

        {/* Safe zone toggle */}
        {onToggleSafeZone && (
          <button
            onClick={onToggleSafeZone}
            className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                showSafeZone
                  ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white"
                  : "border-neutral-400"
              }`}
            >
              {showSafeZone && (
                <svg
                  className="w-3 h-3 text-white dark:text-neutral-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </span>
            Show Print Safe Zone
          </button>
        )}

      </div>
    </div>
  );
});

export default MapPreview;
export type { MapPreviewProps, FocusPoint, DetailLineType };
