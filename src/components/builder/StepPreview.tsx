"use client";

import { useState, useEffect } from "react";
import type { Theme } from "@/lib/mapbox/applyTheme";
import BackOfCanvasPreview from "../BackOfCanvasPreview";

interface StepPreviewProps {
  mapThumbnail: string | null;
  theme: Theme;
  cityName: string;
  stateName: string;
  personalNote: string;
  onAddToCart: () => void;
  onBack: () => void;
  isCapturing?: boolean;
}

/**
 * StepPreview Component (Step 7) - Final Reveal
 *
 * Displays the user's completed design in a realistic room setting
 * with flip-to-back functionality and gallery wrap detail view.
 */
export default function StepPreview({
  mapThumbnail,
  theme,
  cityName,
  stateName,
  personalNote,
  onAddToCart,
  onBack,
  isCapturing = false,
}: StepPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGalleryZoom, setShowGalleryZoom] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasViewedPreview, setHasViewedPreview] = useState(false);

  // Space out city name for poster aesthetic
  const spacedCityName = cityName.toUpperCase().split("").join(" ");

  // Mark preview as viewed after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasViewedPreview(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle image load
  useEffect(() => {
    if (mapThumbnail) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [mapThumbnail]);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
          Your Masterpiece
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          See how your custom map art will look in a real space
        </p>
      </div>

      {/* Room Preview Container */}
      <div
        className={`relative w-full rounded-xl overflow-hidden shadow-lg transition-all duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Flip Container */}
        <div
          className="relative w-full"
          style={{
            perspective: "1500px",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className={`relative w-full transition-transform duration-700 ease-in-out`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front: Room Preview */}
            <div
              className="relative w-full"
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              {/* Living Room Image */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10]">
                <img
                  src="/mockup-living-room.jpg"
                  alt="Living room mockup"
                  className="w-full h-full object-contain sm:object-cover"
                />

                {/* Canvas Frame Container - Positioned over the wall canvas */}
                <div
                  className="absolute"
                  style={{
                    top: "8%",
                    left: "13%",
                    width: "28%",
                    height: "42%",
                    // Perspective transform to match room angle
                    transform: "perspective(1000px) rotateY(-2deg)",
                    transformOrigin: "center center",
                  }}
                >
                  {/* Canvas Shadow (depth effect) */}
                  <div
                    className="absolute inset-0 rounded-sm"
                    style={{
                      boxShadow:
                        "8px 12px 24px rgba(0,0,0,0.4), 2px 3px 8px rgba(0,0,0,0.3)",
                      transform: "translateZ(-2px)",
                    }}
                  />

                  {/* Canvas Container with Gallery Wrap Effect */}
                  <div
                    className="relative w-full h-full rounded-sm overflow-hidden"
                    style={{
                      backgroundColor: theme.colors.bg,
                      // 1.25" frame depth simulation
                      boxShadow: `
                        inset 0 0 0 2px ${theme.colors.bg},
                        inset -4px 0 8px rgba(0,0,0,0.2),
                        inset 0 -4px 8px rgba(0,0,0,0.15)
                      `,
                    }}
                  >
                    {/* Map Image */}
                    {mapThumbnail ? (
                      <img
                        src={mapThumbnail}
                        alt={`${cityName} map preview`}
                        className="w-full h-full object-cover"
                        style={{
                          // Multiply blend to inherit room lighting
                          mixBlendMode: "multiply",
                        }}
                      />
                    ) : (
                      /* Fallback */
                      <div
                        className="w-full h-full flex flex-col items-center justify-end pb-[12%]"
                        style={{ backgroundColor: theme.colors.bg }}
                      >
                        <svg
                          className="absolute inset-0 w-full h-full"
                          preserveAspectRatio="none"
                        >
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
                        </svg>
                        <div className="relative z-10 text-center px-4">
                          <h3
                            className="text-[2cqw] font-semibold tracking-[0.1em]"
                            style={{ color: theme.colors.text }}
                          >
                            {spacedCityName}
                          </h3>
                        </div>
                      </div>
                    )}

                    {/* Canvas Texture Overlay */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ mixBlendMode: "overlay" }}
                    >
                      <defs>
                        <filter
                          id="canvasTexturePreview"
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                        >
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
                      <rect
                        width="100%"
                        height="100%"
                        filter="url(#canvasTexturePreview)"
                      />
                    </svg>

                    {/* Lighting Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `
                          linear-gradient(135deg,
                            rgba(255,255,255,0.08) 0%,
                            rgba(255,255,255,0.02) 30%,
                            rgba(0,0,0,0.04) 70%,
                            rgba(0,0,0,0.1) 100%
                          )
                        `,
                        mixBlendMode: "overlay",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Back: Inscription Preview */}
            <div
              className="absolute inset-0 w-full"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="w-full aspect-[4/3] sm:aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-4 sm:p-8">
                <BackOfCanvasPreview personalNote={personalNote} />
              </div>
            </div>
          </div>
        </div>

        {/* Product Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-end justify-between text-white">
            <div>
              <p className="font-medium">{cityName}, {stateName}</p>
              <p className="text-sm text-white/70">{theme.name} • 18" × 24" Gallery Canvas</p>
            </div>
            <p className="text-lg font-semibold">$94.00</p>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-wrap gap-3">
        {/* Flip to Back Button */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isFlipped ? "rotate-180" : ""}`}
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
          {isFlipped ? "View Front" : "View Inscription"}
        </button>

        {/* Gallery Wrap Zoom Button */}
        <button
          onClick={() => setShowGalleryZoom(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
          Frame Detail
        </button>
      </div>

      {/* Gallery Wrap Zoom Modal */}
      {showGalleryZoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowGalleryZoom(false)}
        >
          <div
            className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGalleryZoom(false)}
              className="absolute top-4 right-4 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Gallery Wrap Detail
            </h4>

            {/* Frame Corner Illustration */}
            <div className="relative aspect-square max-w-[280px] mx-auto mb-4">
              {/* Corner simulation */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{ backgroundColor: theme.colors.bg }}
              >
                {/* Top face */}
                <div
                  className="absolute top-0 left-0 right-0 h-8"
                  style={{
                    background: `linear-gradient(to bottom, ${theme.colors.bg}, ${theme.colors.bg}dd)`,
                    transform: "perspective(100px) rotateX(45deg)",
                    transformOrigin: "bottom",
                  }}
                />
                {/* Left face */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-8"
                  style={{
                    background: `linear-gradient(to right, ${theme.colors.bg}cc, ${theme.colors.bg})`,
                    transform: "perspective(100px) rotateY(-45deg)",
                    transformOrigin: "right",
                  }}
                />
                {/* Main face with map preview */}
                <div className="absolute inset-8 rounded-sm overflow-hidden">
                  {mapThumbnail ? (
                    <img
                      src={mapThumbnail}
                      alt="Corner detail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: theme.colors.bg }}
                    />
                  )}
                </div>
              </div>

              {/* Depth measurement annotation */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <div className="h-12 w-px bg-neutral-400" />
                <span className="text-[10px] text-neutral-500 -rotate-90 whitespace-nowrap">
                  1.25" depth
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Premium 1.25" solid wood stretcher bars
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Museum-quality gallery wrap finish
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Image wraps around edges seamlessly
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ready to hang, no frame needed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-full font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all"
        >
          Back
        </button>
        <button
          onClick={onAddToCart}
          disabled={!hasViewedPreview || isCapturing}
          className={`flex-1 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2 ${
            hasViewedPreview && !isCapturing
              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
              : "bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed"
          }`}
        >
          {isCapturing ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Add to Cart — $94.00
            </>
          )}
        </button>
      </div>

      {/* Trust indicator */}
      {!hasViewedPreview && (
        <p className="text-xs text-center text-neutral-500">
          Please review your design before adding to cart
        </p>
      )}
    </div>
  );
}
