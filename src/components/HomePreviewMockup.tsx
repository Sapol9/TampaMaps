"use client";

import { useRef, useEffect, useState } from "react";
import type { Theme } from "@/lib/mapbox/applyTheme";

interface HomePreviewMockupProps {
  mapThumbnail: string | null;
  theme: Theme;
  cityName: string;
  stateName: string;
  isVisible: boolean;
  onClose: () => void;
}

/**
 * HomePreviewMockup Component
 *
 * Displays the user's custom map design overlaid on a realistic
 * living room mockup image with perspective transform and canvas texture.
 *
 * Canvas specs: 18" x 24" portrait (3:4 aspect ratio)
 * The map container is positioned to align with the canvas in the photo.
 */
export default function HomePreviewMockup({
  mapThumbnail,
  theme,
  cityName,
  stateName,
  isVisible,
  onClose,
}: HomePreviewMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Space out city name for poster aesthetic
  const spacedCityName = cityName.toUpperCase().split("").join(" ");

  useEffect(() => {
    if (isVisible) {
      // Small delay for smooth transition
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsLoaded(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        ref={containerRef}
        className={`relative w-full max-w-5xl mx-4 transition-all duration-500 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <span>Close Preview</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Living Room Mockup Container */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
          {/* Background Room Image */}
          <img
            src="/mockup-living-room.jpg"
            alt="Living room mockup"
            className="w-full h-full object-cover"
          />

          {/* Canvas Frame Container - Positioned over the wall canvas */}
          {/* Based on the image analysis: canvas is roughly at top: 8%, left: 13%, width: 28%, height: 42% */}
          <div
            className="absolute"
            style={{
              top: "8%",
              left: "13%",
              width: "28%",
              height: "42%",
              // Perspective transform to match the slight angle of the canvas on the wall
              transform: "perspective(1200px) rotateY(-3deg) rotateX(1deg)",
              transformOrigin: "center center",
            }}
          >
            {/* Canvas Shadow (depth effect) */}
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                boxShadow: "8px 12px 24px rgba(0,0,0,0.4), 2px 3px 8px rgba(0,0,0,0.3)",
                transform: "translateZ(-2px)",
              }}
            />

            {/* Canvas Container with Edge Wrap Effect */}
            <div
              className="relative w-full h-full rounded-sm overflow-hidden"
              style={{
                backgroundColor: theme.colors.bg,
                // Subtle border to simulate canvas edge/frame depth
                boxShadow: `
                  inset 0 0 0 2px ${theme.colors.bg},
                  inset -3px 0 6px rgba(0,0,0,0.15),
                  inset 0 -3px 6px rgba(0,0,0,0.1)
                `,
              }}
            >
              {/* Map Image or Generated Preview */}
              {mapThumbnail ? (
                <img
                  src={mapThumbnail}
                  alt={`${cityName} map preview`}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Fallback: Generated map preview with city name */
                <div
                  className="w-full h-full flex flex-col items-center justify-end pb-[12%]"
                  style={{ backgroundColor: theme.colors.bg }}
                >
                  {/* Simulated road lines */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <line
                      x1="20%"
                      y1="30%"
                      x2="80%"
                      y2="30%"
                      stroke={theme.colors.road_motorway}
                      strokeWidth="2"
                      strokeOpacity={theme.colors.road_opacity ?? 0.8}
                    />
                    <line
                      x1="50%"
                      y1="10%"
                      x2="50%"
                      y2="70%"
                      stroke={theme.colors.road_primary}
                      strokeWidth="1.5"
                      strokeOpacity={theme.colors.road_opacity ?? 0.8}
                    />
                    <line
                      x1="15%"
                      y1="50%"
                      x2="85%"
                      y2="45%"
                      stroke={theme.colors.road_secondary}
                      strokeWidth="1"
                      strokeOpacity={(theme.colors.road_opacity ?? 0.8) * 0.7}
                    />
                    <line
                      x1="30%"
                      y1="20%"
                      x2="70%"
                      y2="60%"
                      stroke={theme.colors.road_tertiary}
                      strokeWidth="0.5"
                      strokeOpacity={(theme.colors.road_opacity ?? 0.8) * 0.5}
                    />
                  </svg>

                  {/* City Name Text */}
                  <div className="relative z-10 text-center px-4">
                    <h3
                      className="text-[2.5cqw] font-semibold tracking-[0.1em] leading-tight"
                      style={{
                        color: theme.colors.text,
                        textShadow: `0 0 4px ${theme.colors.bg}`,
                      }}
                    >
                      {spacedCityName}
                    </h3>
                    <div
                      className="w-8 h-px mx-auto my-1"
                      style={{ backgroundColor: theme.colors.text, opacity: 0.8 }}
                    />
                    <p
                      className="text-[1.2cqw] font-light tracking-[0.1em] uppercase"
                      style={{ color: theme.colors.text, opacity: 0.9 }}
                    >
                      {stateName}
                    </p>
                  </div>
                </div>
              )}

              {/* Canvas Texture Overlay - SVG feTurbulence for grain effect */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "overlay" }}>
                <defs>
                  <filter id="canvasTexture" x="0" y="0" width="100%" height="100%">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.9"
                      numOctaves="4"
                      seed="15"
                      result="noise"
                    />
                    <feColorMatrix
                      type="matrix"
                      values="1 0 0 0 0
                              0 1 0 0 0
                              0 0 1 0 0
                              0 0 0 0.08 0"
                    />
                  </filter>
                </defs>
                <rect width="100%" height="100%" filter="url(#canvasTexture)" />
              </svg>

              {/* Lighting/Shadow Overlay - Simulates room lighting on canvas */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    linear-gradient(135deg,
                      rgba(255,255,255,0.06) 0%,
                      rgba(255,255,255,0.02) 30%,
                      rgba(0,0,0,0.04) 70%,
                      rgba(0,0,0,0.08) 100%
                    )
                  `,
                  mixBlendMode: "overlay",
                }}
              />
            </div>
          </div>
        </div>

        {/* Product Info Bar */}
        <div className="mt-4 flex items-center justify-between text-white/80 text-sm px-2">
          <div className="flex items-center gap-4">
            <span className="font-medium">{cityName}, {stateName}</span>
            <span className="text-white/50">•</span>
            <span className="text-white/60">{theme.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60">18&quot; &times; 24&quot; Gallery Canvas</span>
            <span className="px-2 py-0.5 bg-white/10 rounded text-xs">$94.00</span>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-white/40 text-xs mt-3">
          Mockup for visualization purposes. Actual colors may vary slightly.
        </p>
      </div>
    </div>
  );
}
