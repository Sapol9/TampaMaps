"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import MapPreview from "@/components/MapPreview";
import themes from "@/data/themes.json";
import type { Theme } from "@/lib/mapbox/applyTheme";

// Gallery items configuration
const galleryConfig: Record<string, { lat: number; lng: number; state: string; zoom: number }> = {
  manhattan: { lat: 40.7484, lng: -73.9857, state: "New York", zoom: 13 },
  "san francisco": { lat: 37.7749, lng: -122.4194, state: "California", zoom: 13 },
  tampa: { lat: 27.9506, lng: -82.4572, state: "Florida", zoom: 13 },
  austin: { lat: 30.2672, lng: -97.7431, state: "Texas", zoom: 13 },
  chicago: { lat: 41.8781, lng: -87.6298, state: "Illinois", zoom: 13 },
};

function GalleryRenderContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "tampa";
  const themeId = searchParams.get("theme") || "parchment";
  const [isReady, setIsReady] = useState(false);

  const cityConfig = galleryConfig[city.toLowerCase()];
  const theme = (themes as Theme[]).find((t) => t.id === themeId);

  useEffect(() => {
    // Signal that the page is loaded
    if (cityConfig && theme) {
      // Give the map time to fully render
      const timer = setTimeout(() => {
        setIsReady(true);
        // Add data attribute for Playwright to detect
        document.body.setAttribute("data-gallery-ready", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cityConfig, theme]);

  if (!cityConfig || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Invalid city or theme. City: {city}, Theme: {themeId}</p>
      </div>
    );
  }

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  return (
    <div
      className="w-[400px] h-[533px]"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <MapPreview
        theme={theme}
        center={[cityConfig.lng, cityConfig.lat]}
        zoom={cityConfig.zoom}
        cityName={cityName}
        stateName={cityConfig.state}
        showSafeZone={false}
        showTextOverlay={true}
        detailLineType="coordinates"
      />
      {/* Hidden element to signal ready state */}
      {isReady && <div id="gallery-ready" style={{ display: "none" }} />}
    </div>
  );
}

export default function GalleryRenderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          Loading...
        </div>
      }
    >
      <GalleryRenderContent />
    </Suspense>
  );
}