"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/mapbox-hardening.css";
import { createCustomStyle } from "@/lib/mapbox/createStyle";
import type { Theme } from "@/lib/mapbox/applyTheme";
import SafeZoneOverlay from "./SafeZoneOverlay";
import RenderingOverlay from "./RenderingOverlay";
import { toJpeg } from "html-to-image";

export interface MapPreviewHandle {
  captureImage: (debug?: boolean) => Promise<string | null>;
  waitForIdle: () => Promise<void>;
}

// Debug mode flag - set to true to enable print dimension logging and file download
const DEBUG_PRINT_MODE = false;

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
  const [isCapturing, setIsCapturing] = useState(false);
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

  // Capture the full preview at print resolution using html-to-image
  // Creates an off-screen clone of the preview at 5400x7200px for true 300 DPI quality
  // This approach captures the exact browser-rendered output, eliminating Canvas API mismatches
  const captureImage = useCallback(async (debug: boolean = DEBUG_PRINT_MODE): Promise<string | null> => {
    if (!previewContainer.current || !map.current) return null;

    // Show loading state
    setIsCapturing(true);

    // Fixed print dimensions (300 DPI for 18"×24")
    const PRINT_WIDTH = 5400;
    const PRINT_HEIGHT = 7200;

    // Get current map state
    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();
    const currentStyle = createCustomStyle(theme);

    // Get preview container size to calculate zoom adjustment
    const previewRect = previewContainer.current.getBoundingClientRect();

    // Mapbox zoom is relative to viewport size. To show the same geographic area
    // on a larger canvas, we need to increase zoom by log2(printSize/previewSize)
    const zoomAdjustment = Math.log2(PRINT_WIDTH / previewRect.width);
    const adjustedZoom = currentZoom + zoomAdjustment;

    // cqw = 1% of container width (for converting CSS container query units to pixels)
    const cqw = PRINT_WIDTH / 100;

    if (debug) {
      console.log("[MapPreview Debug] Creating off-screen capture at", PRINT_WIDTH, "x", PRINT_HEIGHT);
      console.log("[MapPreview Debug] Preview size:", previewRect.width, "x", previewRect.height);
      console.log("[MapPreview Debug] Map center:", currentCenter.lng, currentCenter.lat);
      console.log("[MapPreview Debug] Original zoom:", currentZoom, "Adjusted zoom:", adjustedZoom.toFixed(2));
    }

    try {
      // Ensure fonts are loaded before rendering
      await document.fonts.ready;
      try {
        await document.fonts.load("600 100px 'Space Grotesk'");
        await document.fonts.load("300 100px 'Space Grotesk'");
      } catch {
        console.warn("[MapPreview] Font loading failed, using fallback");
      }

      // Create hidden container for the complete print preview
      const printContainer = document.createElement("div");
      printContainer.style.cssText = `
        position: absolute;
        left: -99999px;
        top: -99999px;
        width: ${PRINT_WIDTH}px;
        height: ${PRINT_HEIGHT}px;
        overflow: hidden;
        background-color: ${theme.colors.bg};
      `;
      document.body.appendChild(printContainer);

      // Create map container inside print container
      const mapDiv = document.createElement("div");
      mapDiv.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      `;
      printContainer.appendChild(mapDiv);

      // Create high-resolution off-screen map
      const printMap = new mapboxgl.Map({
        container: mapDiv,
        style: currentStyle,
        center: currentCenter,
        zoom: adjustedZoom,
        interactive: false,
        preserveDrawingBuffer: true,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
        touchPitch: false,
      });

      // Wait for the print map to fully load with robust tile checking
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn("[MapPreview] Print map load timeout - proceeding anyway");
          resolve(); // Don't reject, try to capture anyway
        }, 30000);

        printMap.once("error", (e) => {
          clearTimeout(timeout);
          reject(e.error);
        });

        // First wait for initial load
        printMap.once("load", () => {
          if (debug) {
            console.log("[MapPreview Debug] Print map 'load' event fired");
          }

          // Then wait for idle with tile verification
          const waitForTiles = () => {
            if (printMap.areTilesLoaded() && printMap.loaded() && !printMap.isMoving()) {
              if (debug) {
                console.log("[MapPreview Debug] All tiles loaded, waiting for render...");
              }
              // Give WebGL extra time to finish rendering
              setTimeout(() => {
                clearTimeout(timeout);
                resolve();
              }, 1500); // Increased delay for tile rendering
            } else {
              if (debug) {
                console.log("[MapPreview Debug] Tiles not ready, waiting for idle...");
              }
              // Wait for next idle event
              printMap.once("idle", () => {
                // Check again after idle
                setTimeout(waitForTiles, 200);
              });
            }
          };

          // Start checking after initial load
          printMap.once("idle", waitForTiles);
        });
      });

      // Add marker if focus point exists
      if (focusPoint) {
        const markerSize = PRINT_WIDTH * 0.012;
        const el = document.createElement("div");
        el.style.cssText = `
          width: ${markerSize * 2}px;
          height: ${markerSize * 2}px;
          border-radius: 50%;
          border: ${markerSize * 0.15}px solid ${theme.colors.text};
          background-color: transparent;
          box-sizing: border-box;
          position: relative;
        `;
        const innerDot = document.createElement("div");
        innerDot.style.cssText = `
          width: ${markerSize * 0.6}px;
          height: ${markerSize * 0.6}px;
          border-radius: 50%;
          background-color: ${theme.colors.text};
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `;
        el.appendChild(innerDot);
        new mapboxgl.Marker({ element: el })
          .setLngLat([focusPoint.lng, focusPoint.lat])
          .addTo(printMap);
      }

      // Dynamic city font size (matching preview logic)
      let cityFontSizeCqw: number;
      if (cityName.length > 14) {
        cityFontSizeCqw = 4.5;
      } else if (cityName.length > 10) {
        cityFontSizeCqw = 5.5;
      } else if (cityName.length > 6) {
        cityFontSizeCqw = 6.5;
      } else {
        cityFontSizeCqw = 8;
      }

      // Create text overlay - exact same structure as preview but with pixel values
      const textOverlay = document.createElement("div");
      textOverlay.style.cssText = `
        position: absolute;
        left: 0;
        right: 0;
        bottom: ${SAFE_ZONE_VERTICAL_PERCENT}%;
        padding-left: ${SAFE_ZONE_HORIZONTAL_PERCENT}%;
        padding-right: ${SAFE_ZONE_HORIZONTAL_PERCENT}%;
        pointer-events: none;
        z-index: 20;
      `;

      const textContent = document.createElement("div");
      textContent.style.cssText = `
        text-align: center;
        text-shadow: 0 0 ${4 * cqw / 54}px ${theme.colors.bg},
                     0 0 ${4 * cqw / 54}px ${theme.colors.bg},
                     0 0 ${4 * cqw / 54}px ${theme.colors.bg},
                     0 0 ${4 * cqw / 54}px ${theme.colors.bg};
        padding-top: ${2 * cqw}px;
        padding-bottom: ${2 * cqw}px;
      `;

      // City name
      const cityEl = document.createElement("h2");
      cityEl.textContent = spacedCityName;
      cityEl.style.cssText = `
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 600;
        font-size: ${cityFontSizeCqw * cqw}px;
        color: ${theme.colors.text};
        opacity: 0.9;
        letter-spacing: 0.1em;
        margin: 0;
        margin-bottom: ${1.5 * cqw}px;
        line-height: 1;
      `;
      textContent.appendChild(cityEl);

      // Decorative line
      const lineEl = document.createElement("div");
      lineEl.style.cssText = `
        width: ${10 * cqw}px;
        height: 1px;
        background-color: ${theme.colors.text};
        opacity: 0.9;
        margin: 0 auto ${1.5 * cqw}px auto;
        box-shadow: 0 0 4px ${theme.colors.bg};
      `;
      textContent.appendChild(lineEl);

      // State name
      const stateEl = document.createElement("p");
      stateEl.textContent = stateName.toUpperCase();
      stateEl.style.cssText = `
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 300;
        font-size: ${3 * cqw}px;
        color: ${theme.colors.text};
        opacity: 0.9;
        letter-spacing: 0.1em;
        margin: 0;
        margin-bottom: ${0.5 * cqw}px;
        text-transform: uppercase;
      `;
      textContent.appendChild(stateEl);

      // Detail line (coordinates or address)
      if (detailLineType !== "none") {
        const detailText = detailLineType === "address" && focusPoint?.address
          ? focusPoint.address.split(",")[0].trim()
          : formattedCoords;
        const detailEl = document.createElement("p");
        detailEl.textContent = detailText;
        detailEl.style.cssText = `
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 300;
          font-size: ${2.5 * cqw}px;
          color: ${theme.colors.text};
          opacity: 0.7;
          letter-spacing: 0.1em;
          margin: 0;
        `;
        textContent.appendChild(detailEl);
      }

      textOverlay.appendChild(textContent);
      printContainer.appendChild(textOverlay);

      // Attribution (bottom-right, subtle)
      const attribution = document.createElement("div");
      attribution.style.cssText = `
        position: absolute;
        bottom: ${SAFE_ZONE_VERTICAL_PERCENT}%;
        right: ${SAFE_ZONE_HORIZONTAL_PERCENT}%;
        z-index: 50;
        pointer-events: none;
      `;
      const attrText = document.createElement("span");
      attrText.textContent = "© Mapbox © OpenStreetMap";
      attrText.style.cssText = `
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 300;
        font-size: ${1.5 * cqw}px;
        color: ${theme.colors.text};
        opacity: 0.15;
        letter-spacing: 0.02em;
      `;
      attribution.appendChild(attrText);
      printContainer.appendChild(attribution);

      if (debug) {
        console.log("[MapPreview Debug] Off-screen preview built, capturing with html-to-image");
      }

      // Capture with html-to-image
      const dataUrl = await toJpeg(printContainer, {
        quality: 0.95,
        width: PRINT_WIDTH,
        height: PRINT_HEIGHT,
        pixelRatio: 1, // We're already at print resolution
        cacheBust: true,
        skipFonts: false,
        fontEmbedCSS: '', // Let it embed fonts automatically
      });

      // Clean up
      printMap.remove();
      printContainer.remove();

      if (debug) {
        console.log("[MapPreview Debug] ✅ Capture complete");
        // Download for inspection
        const link = document.createElement("a");
        link.download = `mapmarked-print-${Date.now()}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("[MapPreview Debug] 📥 Print-ready image downloaded");
      }

      setIsCapturing(false);
      return dataUrl;
    } catch (err) {
      console.error("Failed to capture image:", err);
      setIsCapturing(false);
      return null;
    }
  }, [theme, cityName, stateName, focusPoint, detailLineType, formattedCoords, spacedCityName]);

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
        {/* All sizes use container query units (cqw) to scale with canvas, not viewport */}
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
              className="text-center"
              style={{
                // Hard-edge vector halo: 4 stacked shadows with 0 blur for crisp gap
                textShadow: `0 0 4px ${theme.colors.bg}, 0 0 4px ${theme.colors.bg}, 0 0 4px ${theme.colors.bg}, 0 0 4px ${theme.colors.bg}`,
                paddingTop: "2cqw",
                paddingBottom: "2cqw",
              }}
            >
              {/* City Name - Space Grotesk with 0.1em letter spacing */}
              <h2
                className="font-semibold leading-tight"
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  color: theme.colors.text,
                  opacity: 0.9,
                  letterSpacing: "0.1em",
                  marginBottom: "1.5cqw",
                  // Dynamic font size: smaller for longer names, fits container width
                  fontSize: cityName.length > 14
                    ? "4.5cqw"
                    : cityName.length > 10
                    ? "5.5cqw"
                    : cityName.length > 6
                    ? "6.5cqw"
                    : "8cqw",
                }}
              >
                {spacedCityName}
              </h2>

              {/* Decorative Line */}
              <div
                className="h-px mx-auto"
                style={{
                  width: "10cqw",
                  marginBottom: "1.5cqw",
                  backgroundColor: theme.colors.text,
                  opacity: 0.9,
                  boxShadow: `0 0 4px ${theme.colors.bg}`,
                }}
              />

              {/* State/Country Name - Space Grotesk */}
              <p
                className="font-light uppercase"
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  color: theme.colors.text,
                  opacity: 0.9,
                  letterSpacing: "0.1em",
                  fontSize: "3cqw",
                  marginBottom: "0.5cqw",
                }}
              >
                {stateName}
              </p>

              {/* Detail Line - coordinates, address, or none */}
              {detailLineType !== "none" && (
                <p
                  className="font-light"
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    color: theme.colors.text,
                    opacity: 0.7,
                    letterSpacing: "0.1em",
                    fontSize: "2.5cqw",
                  }}
                >
                  {detailLineType === "address" && focusPoint?.address
                    ? focusPoint.address.split(",")[0].trim()
                    : formattedCoords}
                </p>
              )}

              {/* Print-only: mapmarked.com branding */}
              <p
                className="print-only-attribution font-light"
                style={{
                  display: "none",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  color: theme.colors.text,
                  opacity: 0.5,
                  letterSpacing: "0.08em",
                  fontSize: "2cqw",
                  marginTop: "1cqw",
                }}
              >
                mapmarked.com
              </p>
            </div>
          </div>
        )}

        {/* Mapbox attribution - Ghost Signature at safe zone edge */}
        {/* All sizes use container query units (cqw) to scale with canvas */}
        {!isLoading && !error && (
          <div
            className="absolute z-50 pointer-events-none flex flex-col items-end"
            style={{
              // Position at safe zone edge: 6.25% from bottom, 8.33% from right
              bottom: `${SAFE_ZONE_VERTICAL_PERCENT}%`,
              right: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
              gap: "0.3cqw",
            }}
          >
            {/* Preview-only: Mapbox logo - small and subtle (excluded from print) */}
            <svg
              className="preview-only-attribution"
              viewBox="0 0 85 22"
              aria-label="Mapbox"
              style={{
                width: "14cqw",
                height: "3.5cqw",
                opacity: 0.25,
                filter: "grayscale(100%)",
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
            {/* Preview-only: Attribution text (excluded from print) */}
            <span
              className="preview-only-attribution"
              style={{
                fontSize: "1.5cqw",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                color: theme.colors.text,
                letterSpacing: "0.02em",
                opacity: 0.25,
              }}
            >
              © OpenStreetMap
            </span>
            {/* Print-only: Text attribution (hidden in preview, shown in print) */}
            <span
              className="print-only-attribution"
              style={{
                display: "none",
                fontSize: "1.8cqw",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                color: theme.colors.text,
                letterSpacing: "0.02em",
                opacity: 0.2,
              }}
            >
              © Mapbox © OpenStreetMap
            </span>
          </div>
        )}

        {/* Safe zone overlay - fixed portrait */}
        <SafeZoneOverlay visible={showSafeZone} />

        {/* Capture loading overlay */}
        {isCapturing && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-md bg-black/50">
            {/* Spinner */}
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
              <div className="absolute inset-0 animate-spin">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="35 105"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm font-light tracking-wide text-white/90">
              Generating your print-quality canvas...
            </p>
          </div>
        )}

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
