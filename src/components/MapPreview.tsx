"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/mapbox-hardening.css";
import { createCustomStyle } from "@/lib/mapbox/createStyle";
import type { Theme } from "@/lib/mapbox/applyTheme";
import SafeZoneOverlay from "./SafeZoneOverlay";
import RenderingOverlay from "./RenderingOverlay";

export interface MapPreviewHandle {
  captureImage: (debug?: boolean) => Promise<string | null>;
  waitForIdle: () => Promise<void>;
}

const DEBUG_PRINT_MODE = false;

interface FocusPoint {
  lat: number;
  lng: number;
  address?: string;
}

type DetailLineType = "coordinates" | "address" | "none";
type TextLayout = "classic" | "overlay";
type ClassicTextStyle = "color" | "bw";

interface MapPreviewProps {
  theme: Theme;
  center: [number, number];
  zoom: number;
  cityName?: string;
  stateName?: string;
  detailText?: string;
  focusPoint?: FocusPoint | null;
  detailLineType?: DetailLineType;
  textLayout?: TextLayout;
  classicTextStyle?: ClassicTextStyle;
  showSafeZone?: boolean;
  showTextOverlay?: boolean;
  showMarker?: boolean;
  aspectRatio?: string;
  onToggleSafeZone?: () => void;
  isRendering?: boolean;
  onRenderComplete?: () => void;
}

const SAFE_ZONE_VERTICAL_PERCENT = (1.5 / 24) * 100;
const SAFE_ZONE_HORIZONTAL_PERCENT = (1.5 / 18) * 100;

const MapPreview = forwardRef<MapPreviewHandle, MapPreviewProps>(function MapPreview({
  theme,
  center,
  zoom,
  cityName = "TAMPA",
  stateName = "FLORIDA",
  detailText,
  focusPoint,
  detailLineType = "coordinates",
  textLayout = "classic",
  classicTextStyle = "color",
  showSafeZone = false,
  showTextOverlay = true,
  showMarker = false,
  aspectRatio = "3/4",
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
  const [hasUserMoved, setHasUserMoved] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const currentThemeRef = useRef<string>(theme.id);
  const lockedCenter = useRef<[number, number]>(center);
  const lockedZoom = useRef<number>(zoom);
  const lastLocationKey = useRef<string>("");

  const actualCenter: [number, number] = focusPoint ? [focusPoint.lng, focusPoint.lat] : center;

  const displayLat = focusPoint?.lat ?? center[1];
  const displayLng = focusPoint?.lng ?? center[0];
  const latDirection = displayLat >= 0 ? "N" : "S";
  const lngDirection = displayLng >= 0 ? "E" : "W";
  const formattedCoords = `${Math.abs(displayLat).toFixed(4)}° ${latDirection} / ${Math.abs(displayLng).toFixed(4)}° ${lngDirection}`;

  // Space out city name - scale font instead of wrapping
  const spacedCityName = cityName.toUpperCase().split("").join(" ");

  // Update marker
  const updateMarker = useCallback(() => {
    if (!map.current) return;
    marker.current?.remove();
    marker.current = null;

    if (showMarker) {
      const el = document.createElement("div");
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = `2px solid ${theme.colors.text}`;
      el.style.backgroundColor = "transparent";
      el.style.boxSizing = "border-box";

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

      const markerCenter = focusPoint ? [focusPoint.lng, focusPoint.lat] : center;
      marker.current = new mapboxgl.Marker({ element: el })
        .setLngLat(markerCenter as [number, number])
        .addTo(map.current);
    }
  }, [showMarker, focusPoint, center, theme.colors.text]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_public_token_here") {
      setError("Mapbox token not configured");
      setIsLoading(false);
      return;
    }

    mapboxgl.accessToken = token;
    const customStyle = createCustomStyle(theme);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: customStyle,
      center: actualCenter,
      zoom: zoom,
      interactive: true,
      attributionControl: false,
      logoPosition: "bottom-right",
      preserveDrawingBuffer: true,
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
    });

    // Disable rotation but keep pan and zoom
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    map.current.on("load", () => {
      setIsLoading(false);
      updateMarker();
      lockedCenter.current = actualCenter;
    });

    map.current.on("moveend", () => {
      setHasUserMoved(true);
    });

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    if (currentThemeRef.current === theme.id) return;
    currentThemeRef.current = theme.id;

    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();
    const customStyle = createCustomStyle(theme);

    map.current.setStyle(customStyle);
    map.current.once("style.load", () => {
      map.current?.setCenter(currentCenter);
      map.current?.setZoom(currentZoom);
      updateMarker();
    });
  }, [theme, updateMarker]);

  // Only fly to new location when the actual location changes (not on tab switches)
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Create a key for this location to detect actual changes
    const locationKey = `${actualCenter[0]},${actualCenter[1]},${zoom}`;
    if (locationKey === lastLocationKey.current) return;
    lastLocationKey.current = locationKey;

    map.current.flyTo({ center: actualCenter, zoom: zoom, duration: 1000 });
    updateMarker();
    lockedCenter.current = actualCenter;
    lockedZoom.current = zoom;
    setHasUserMoved(false);
  }, [center[0], center[1], focusPoint?.lat, focusPoint?.lng, zoom, isLoading, actualCenter, updateMarker]);

  useEffect(() => {
    if (!isLoading) updateMarker();
  }, [showMarker, isLoading, updateMarker]);

  const handleResetToCenter = () => {
    if (!map.current) return;
    map.current.flyTo({ center: lockedCenter.current, zoom: lockedZoom.current, duration: 800 });
    setHasUserMoved(false);
  };

  const handleZoomIn = () => {
    if (!map.current) return;
    map.current.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    if (!map.current) return;
    map.current.zoomOut({ duration: 300 });
  };

  const waitForIdle = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!map.current) { resolve(); return; }
      const checkAndResolve = () => setTimeout(resolve, 300);
      if (!map.current.isMoving() && !map.current.isZooming() && map.current.loaded() && map.current.areTilesLoaded()) {
        checkAndResolve();
        return;
      }
      const handleIdle = () => {
        if (map.current?.areTilesLoaded()) checkAndResolve();
        else setTimeout(() => map.current?.once("idle", handleIdle), 200);
      };
      map.current.once("idle", handleIdle);
      setTimeout(() => { map.current?.off("idle", handleIdle); resolve(); }, 5000);
    });
  }, []);

  const captureImage = useCallback(async (debug: boolean = DEBUG_PRINT_MODE): Promise<string | null> => {
    if (!map.current) return null;
    setIsCapturing(true);

    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();

    try {
      const response = await fetch("/api/generate-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          center: [currentCenter.lng, currentCenter.lat],
          zoom: currentZoom,
          themeId: theme.id,
          cityName,
          stateName,
          coordinates: detailText || formattedCoords,
          focusPoint: focusPoint || undefined,
          detailLineType,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate print image");
      const data = await response.json();

      if (debug && data.imageDataUrl) {
        const link = document.createElement("a");
        link.download = `mapmarked-print-${Date.now()}.jpg`;
        link.href = data.imageDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setIsCapturing(false);
      return data.imageDataUrl;
    } catch (err) {
      console.error("Failed to capture image:", err);
      setIsCapturing(false);
      return null;
    }
  }, [theme.id, cityName, stateName, focusPoint, detailLineType, detailText, formattedCoords]);

  useImperativeHandle(ref, () => ({ captureImage, waitForIdle }), [captureImage, waitForIdle]);

  // Calculate font size based on city name length (with letter spacing)
  const getFontSize = () => {
    const len = cityName.length;
    if (len > 16) return "3.5cqw";
    if (len > 14) return "4cqw";
    if (len > 12) return "4.5cqw";
    if (len > 10) return "5.5cqw";
    if (len > 6) return "6.5cqw";
    return "8cqw";
  };

  // Text content component - shared between both layouts
  // For overlay mode, use theme colors with text shadow
  // For classic mode, use B&W or theme colors based on classicTextStyle
  const TextContent = ({ padding = true, useOverlayStyle = false }: { padding?: boolean; useOverlayStyle?: boolean }) => {
    // Determine text color based on mode
    const textColor = useOverlayStyle
      ? theme.colors.text
      : classicTextStyle === "bw"
        ? "#000000"
        : theme.colors.text;

    // Text shadow for overlay mode (text directly on map)
    const textShadow = useOverlayStyle
      ? `0 1px 3px ${theme.colors.bg}cc, 0 0 8px ${theme.colors.bg}99`
      : undefined;

    return (
      <div className="text-center" style={padding ? { paddingTop: "3cqw", paddingBottom: "2cqw" } : {}}>
        {/* City Name */}
        <h2
          className="font-semibold leading-none whitespace-nowrap"
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            color: textColor,
            opacity: 0.95,
            letterSpacing: "0.12em",
            marginBottom: "1.5cqw",
            fontSize: getFontSize(),
            textShadow,
          }}
        >
          {spacedCityName}
        </h2>

        {/* Decorative Line */}
        <div
          className="mx-auto"
          style={{
            width: "10cqw",
            height: "2px",
            marginBottom: "1.5cqw",
            backgroundColor: textColor,
            opacity: 0.8,
            boxShadow: textShadow,
          }}
        />

        {/* State Name */}
        {stateName && (
          <p
            className="font-light uppercase whitespace-nowrap"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              color: textColor,
              opacity: 0.85,
              letterSpacing: "0.15em",
              fontSize: "3cqw",
              marginBottom: detailLineType !== "none" ? "0.8cqw" : "0",
              textShadow,
            }}
          >
            {stateName.toUpperCase()}
          </p>
        )}

        {/* Detail Line */}
        {detailLineType !== "none" && (
          <p
            className="font-light whitespace-nowrap"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              color: textColor,
              opacity: 0.6,
              letterSpacing: "0.08em",
              fontSize: "2.2cqw",
              textShadow,
            }}
          >
            {detailText || formattedCoords}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <div
        ref={previewContainer}
        className="w-full relative rounded-xl overflow-hidden flex flex-col"
        style={{
          aspectRatio,
          backgroundColor: theme.colors.bg,
          border: `1px solid ${theme.colors.road_default}20`,
          containerType: "inline-size",
        }}
      >
        {/* Map Section */}
        <div className="relative" style={{ flex: textLayout === "classic" ? "1 1 0%" : "1 1 100%", minHeight: 0 }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20" style={{ backgroundColor: theme.colors.bg }}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${theme.colors.text}30`, borderTopColor: theme.colors.text }} />
                <p className="text-sm" style={{ color: theme.colors.text }}>Loading map...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-20" style={{ backgroundColor: theme.colors.bg }}>
              <div className="text-center px-4">
                <p className="text-sm text-red-500 mb-2">{error}</p>
              </div>
            </div>
          )}

          <div ref={mapContainer} className="w-full h-full" />

          {/* Zoom Controls */}
          {!isLoading && !error && (
            <div className="absolute z-20 top-2 right-2 flex flex-col gap-1">
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 rounded-lg bg-black/70 hover:bg-black/90 transition-colors flex items-center justify-center text-white"
                title="Zoom in"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                </svg>
              </button>
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 rounded-lg bg-black/70 hover:bg-black/90 transition-colors flex items-center justify-center text-white"
                title="Zoom out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                </svg>
              </button>
            </div>
          )}

          {/* Recenter button - shows when user has moved the map */}
          {hasUserMoved && !isLoading && !error && (
            <button
              onClick={handleResetToCenter}
              className="absolute z-20 top-2 left-2 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black transition-colors shadow-sm text-xs font-medium text-white flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Recenter
            </button>
          )}

          {/* Overlay mode: Text floating on map with subtle shadow */}
          {textLayout === "overlay" && showTextOverlay && !isLoading && !error && (
            <div
              className="absolute left-0 right-0 bottom-0 pointer-events-none z-20"
              style={{
                paddingBottom: `${SAFE_ZONE_VERTICAL_PERCENT}%`,
                paddingLeft: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
                paddingRight: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
              }}
            >
              <TextContent padding useOverlayStyle />
            </div>
          )}

          <SafeZoneOverlay visible={showSafeZone} />

          {isCapturing && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-md bg-black/50">
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
                <div className="absolute inset-0 animate-spin">
                  <svg viewBox="0 0 48 48" className="w-full h-full">
                    <circle cx="24" cy="24" r="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="35 105" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-light tracking-wide text-white/90">Generating print-ready image...</p>
            </div>
          )}

          <RenderingOverlay isRendering={isRendering} duration={2000} onComplete={onRenderComplete} themeName={theme.name} />
        </div>

        {/* Classic mode: Solid text bar at bottom */}
        {textLayout === "classic" && showTextOverlay && !isLoading && !error && (
          <div
            className="flex-shrink-0"
            style={{
              backgroundColor: classicTextStyle === "bw" ? "#FFFFFF" : theme.colors.bg,
              borderTop: `1px solid ${classicTextStyle === "bw" ? "#00000015" : theme.colors.text + "15"}`,
              paddingLeft: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
              paddingRight: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
              paddingTop: "3cqw",
              paddingBottom: "4cqw",
            }}
          >
            <TextContent padding={false} />
          </div>
        )}
      </div>

      {/* Attribution outside the preview */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500">
        <span>© Mapbox © OpenStreetMap</span>
        {onToggleSafeZone && (
          <button
            onClick={onToggleSafeZone}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span className={`w-3 h-3 rounded border flex items-center justify-center ${showSafeZone ? "bg-white border-white" : "border-neutral-600"}`}>
              {showSafeZone && <svg className="w-2 h-2 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </span>
            Safe zone
          </button>
        )}
      </div>
    </div>
  );
});

export default MapPreview;
export type { MapPreviewProps, FocusPoint, DetailLineType, TextLayout, ClassicTextStyle };