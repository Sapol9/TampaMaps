"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createCustomStyle } from "@/lib/mapbox/createStyle";
import themes from "@/data/themes.json";
import type { Theme } from "@/lib/mapbox/applyTheme";

// Print dimensions (300 DPI for 18"×24")
const PRINT_WIDTH = 5400;
const PRINT_HEIGHT = 7200;

// Safe zone percentages
const SAFE_ZONE_VERTICAL_PERCENT = (1.5 / 24) * 100; // 6.25%
const SAFE_ZONE_HORIZONTAL_PERCENT = (1.5 / 18) * 100; // 8.33%

function PrintRenderContent() {
  const searchParams = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Parse URL parameters
  const lng = parseFloat(searchParams.get("lng") || "0");
  const lat = parseFloat(searchParams.get("lat") || "0");
  const zoom = parseFloat(searchParams.get("zoom") || "13");
  const themeId = searchParams.get("theme") || "parchment";
  const cityName = searchParams.get("city") || "CITY";
  const stateName = searchParams.get("state") || "STATE";
  const coordinates = searchParams.get("coords") || "";
  const detailLineType = searchParams.get("detailType") || "coordinates";
  const focusLat = searchParams.get("focusLat");
  const focusLng = searchParams.get("focusLng");

  const theme = (themes as Theme[]).find((t) => t.id === themeId);

  // Space out city name letters
  const spacedCityName = cityName.toUpperCase().split("").join(" ");

  // Dynamic city font size based on length (in cqw units)
  const cityFontSizeCqw =
    cityName.length > 14
      ? 4.5
      : cityName.length > 10
        ? 5.5
        : cityName.length > 6
          ? 6.5
          : 8;

  useEffect(() => {
    if (!mapContainer.current || !theme) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const customStyle = createCustomStyle(theme);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: customStyle,
      center: [lng, lat],
      zoom: zoom,
      interactive: false,
      attributionControl: false,
      preserveDrawingBuffer: true,
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
    });

    map.current.on("load", () => {
      // Add focus point marker if provided
      if (focusLat && focusLng && map.current) {
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
          .setLngLat([parseFloat(focusLng), parseFloat(focusLat)])
          .addTo(map.current);
      }

      // Wait for tiles to load
      const checkTiles = () => {
        if (map.current?.areTilesLoaded() && map.current?.loaded()) {
          // Give WebGL extra time to finish rendering
          setTimeout(() => {
            setIsReady(true);
            document.body.setAttribute("data-print-ready", "true");
          }, 2000);
        } else {
          map.current?.once("idle", checkTiles);
        }
      };

      map.current?.once("idle", checkTiles);
    });

    return () => {
      map.current?.remove();
    };
  }, [lng, lat, zoom, theme, focusLat, focusLng]);

  if (!theme) {
    return (
      <div
        style={{
          width: PRINT_WIDTH,
          height: PRINT_HEIGHT,
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Invalid theme: {themeId}
      </div>
    );
  }

  return (
    <div
      style={{
        width: PRINT_WIDTH,
        height: PRINT_HEIGHT,
        backgroundColor: theme.colors.bg,
        position: "relative",
        overflow: "hidden",
        containerType: "inline-size",
      }}
    >
      {/* Map */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* Text overlay */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: `${SAFE_ZONE_VERTICAL_PERCENT}%`,
          paddingLeft: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
          paddingRight: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        <div
          style={{
            textAlign: "center",
            textShadow: `0 0 4px ${theme.colors.bg}, 0 0 4px ${theme.colors.bg}, 0 0 4px ${theme.colors.bg}, 0 0 4px ${theme.colors.bg}`,
            paddingTop: "2cqw",
            paddingBottom: "2cqw",
          }}
        >
          {/* City Name */}
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: `${cityFontSizeCqw}cqw`,
              color: theme.colors.text,
              opacity: 0.9,
              letterSpacing: "0.1em",
              margin: 0,
              marginBottom: "1.5cqw",
              lineHeight: 1,
            }}
          >
            {spacedCityName}
          </h2>

          {/* Decorative Line */}
          <div
            style={{
              width: "10cqw",
              height: "1px",
              backgroundColor: theme.colors.text,
              opacity: 0.9,
              margin: "0 auto 1.5cqw auto",
              boxShadow: `0 0 4px ${theme.colors.bg}`,
            }}
          />

          {/* State Name */}
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 300,
              fontSize: "3cqw",
              color: theme.colors.text,
              opacity: 0.9,
              letterSpacing: "0.1em",
              margin: 0,
              marginBottom: "0.5cqw",
              textTransform: "uppercase",
            }}
          >
            {stateName.toUpperCase()}
          </p>

          {/* Coordinates/Address */}
          {detailLineType !== "none" && coordinates && (
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 300,
                fontSize: "2.5cqw",
                color: theme.colors.text,
                opacity: 0.7,
                letterSpacing: "0.1em",
                margin: 0,
              }}
            >
              {coordinates}
            </p>
          )}
        </div>
      </div>

      {/* Attribution */}
      <div
        style={{
          position: "absolute",
          bottom: `${SAFE_ZONE_VERTICAL_PERCENT}%`,
          right: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 300,
            fontSize: "1.5cqw",
            color: theme.colors.text,
            opacity: 0.15,
            letterSpacing: "0.02em",
          }}
        >
          © Mapbox © OpenStreetMap
        </span>
      </div>

      {/* Ready indicator (hidden) */}
      {isReady && <div id="print-ready" style={{ display: "none" }} />}
    </div>
  );
}

export default function PrintRenderPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: PRINT_WIDTH,
            height: PRINT_HEIGHT,
            backgroundColor: "#000",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading...
        </div>
      }
    >
      <PrintRenderContent />
    </Suspense>
  );
}