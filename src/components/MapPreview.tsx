"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { setupAutoScrubbing, scrubLayers } from "@/lib/mapbox/layerScrubbing";
import SafeZoneOverlay from "./SafeZoneOverlay";

interface MapPreviewProps {
  styleUrl: string;
  center: [number, number];
  zoom: number;
  showSafeZone?: boolean;
  onToggleSafeZone?: () => void;
}

export default function MapPreview({
  styleUrl,
  center,
  zoom,
  showSafeZone = false,
  onToggleSafeZone,
}: MapPreviewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: center,
      zoom: zoom,
      interactive: true,
      attributionControl: false,
      preserveDrawingBuffer: true,
    });

    // Set up auto scrubbing for POI removal
    setupAutoScrubbing(map.current);

    map.current.on("load", () => {
      setIsLoading(false);
      if (map.current) {
        scrubLayers(map.current);
      }
    });

    map.current.on("error", (e) => {
      console.error("Map error:", e);
      setError("Failed to load map");
      setIsLoading(false);
    });

    // Add minimal controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    return () => {
      map.current?.remove();
    };
  }, []);

  // Handle style changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();

    map.current.setStyle(styleUrl);

    // Restore position after style change
    map.current.once("style.load", () => {
      map.current?.setCenter(currentCenter);
      map.current?.setZoom(currentZoom);
      scrubLayers(map.current!);
    });
  }, [styleUrl]);

  // Get map instance for export
  const getMap = () => map.current;

  return (
    <div className="relative w-full">
      {/* Map container with 3:4 aspect ratio (18"x24") */}
      <div className="aspect-[3/4] w-full relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
              <p className="text-sm text-neutral-500">Loading map...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-20">
            <div className="text-center px-4">
              <p className="text-sm text-red-500 mb-2">{error}</p>
              <p className="text-xs text-neutral-500">
                Get a token at mapbox.com
              </p>
            </div>
          </div>
        )}

        {/* Map */}
        <div ref={mapContainer} className="w-full h-full" />

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
}

// Export for use in parent components
export type { MapPreviewProps };
