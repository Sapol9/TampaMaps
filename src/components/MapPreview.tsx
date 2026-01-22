"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createCustomStyle } from "@/lib/mapbox/createStyle";
import type { Theme } from "@/lib/mapbox/applyTheme";
import SafeZoneOverlay from "./SafeZoneOverlay";

export interface MapPreviewHandle {
  captureImage: () => string | null;
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
}

// Safe zone constants
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
}, ref) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMovedMap, setHasMovedMap] = useState(false);
  const currentThemeRef = useRef<string>(theme.id);

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
      interactive: true,
      attributionControl: false,
      preserveDrawingBuffer: true,
    });

    map.current.on("load", () => {
      setIsLoading(false);
      updateMarker();
    });

    map.current.on("moveend", () => {
      setHasMovedMap(true);
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
    setHasMovedMap(false);
  }, [center[0], center[1], focusPoint?.lat, focusPoint?.lng, zoom, isLoading]);

  // Recenter map to original position
  const handleRecenter = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: actualCenter,
      zoom: zoom,
      duration: 800,
    });
    setHasMovedMap(false);
  };

  // Update marker when focus point or theme changes
  useEffect(() => {
    if (!isLoading) {
      updateMarker();
    }
  }, [focusPoint, theme.colors.text, isLoading]);

  // Expose captureImage method via ref
  useImperativeHandle(ref, () => ({
    captureImage: () => {
      if (!map.current) return null;
      try {
        const canvas = map.current.getCanvas();
        return canvas.toDataURL("image/jpeg", 0.8);
      } catch {
        return null;
      }
    },
  }), []);

  return (
    <div className="relative w-full">
      {/* Map container with 3:4 aspect ratio (18"x24") */}
      <div
        className="aspect-[3/4] w-full relative rounded-lg overflow-hidden"
        style={{
          backgroundColor: theme.colors.bg,
          border: `1px solid ${theme.colors.road_default}20`
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

        {/* Recenter button */}
        {hasMovedMap && !isLoading && !error && (
          <button
            onClick={handleRecenter}
            className="absolute z-20 top-2 left-2 p-2 rounded-lg bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black transition-colors shadow-sm"
            title="Recenter map"
          >
            <svg
              className="w-4 h-4 text-neutral-600 dark:text-neutral-400"
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
          </button>
        )}

        {/* Text overlay - maptoposter style: CITY, line, STATE, coordinates */}
        {showTextOverlay && !isLoading && !error && (
          <div
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{
              bottom: `${SAFE_ZONE_VERTICAL_PERCENT}%`,
              paddingLeft: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
              paddingRight: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
            }}
          >
            <div
              className="text-center py-3 sm:py-4"
              style={{
                textShadow: `0 1px 3px ${theme.colors.bg}, 0 0 8px ${theme.colors.bg}, 0 0 16px ${theme.colors.bg}`,
              }}
            >
              {/* City Name - Large, spaced letters, auto-sizing */}
              <h2
                className="font-bold tracking-[0.2em] sm:tracking-[0.25em] mb-2 whitespace-nowrap overflow-hidden"
                style={{
                  color: theme.colors.text,
                  fontSize: `clamp(0.875rem, ${Math.max(1.5, 3 - cityName.length * 0.15)}rem, 2rem)`,
                }}
              >
                {spacedCityName}
              </h2>

              {/* Decorative Line */}
              <div
                className="w-12 sm:w-16 h-px mx-auto mb-2"
                style={{
                  backgroundColor: theme.colors.text,
                  boxShadow: `0 0 8px ${theme.colors.bg}`,
                }}
              />

              {/* State/Country Name */}
              <p
                className="text-xs sm:text-sm font-light tracking-[0.15em] uppercase mb-1"
                style={{ color: theme.colors.text, opacity: 0.9 }}
              >
                {stateName}
              </p>

              {/* Detail Line - coordinates, address, or none */}
              {detailLineType !== "none" && (
                <p
                  className="text-[10px] sm:text-xs font-light tracking-wider"
                  style={{ color: theme.colors.text, opacity: 0.7 }}
                >
                  {detailLineType === "address" && focusPoint?.address
                    ? focusPoint.address.split(",")[0].trim()
                    : formattedCoords}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mapbox attribution - required for ToS, inside map but in wrap/bleed area */}
        {!isLoading && !error && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              top: "4px",
              right: "4px",
            }}
          >
            <span
              className="text-[6px] font-light"
              style={{ color: theme.colors.text, opacity: 0.3 }}
            >
              © Mapbox
            </span>
          </div>
        )}

        {/* Safe zone overlay */}
        <SafeZoneOverlay visible={showSafeZone} />
      </div>

      {/* Safe zone toggle */}
      {onToggleSafeZone && (
        <button
          onClick={onToggleSafeZone}
          className="mt-3 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
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
  );
});

export default MapPreview;
export type { MapPreviewProps, FocusPoint, DetailLineType };
