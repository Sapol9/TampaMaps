"use client";

import { useState, useEffect } from "react";
import type { Theme } from "@/lib/mapbox/applyTheme";

interface StepPreviewProps {
  mapThumbnail: string | null;
  theme: Theme;
  cityName: string;
  stateName: string;
  onAddToCart: () => void;
  onBack: () => void;
  isCapturing?: boolean;
}

/**
 * CanvasMockup - 3D canvas visualization with gallery wrap depth
 */
function CanvasMockup({
  imageSrc,
  bgColor,
}: {
  imageSrc: string | null;
  bgColor: string;
}) {
  const CANVAS_WIDTH = 270;
  const CANVAS_HEIGHT = 360;
  const CANVAS_DEPTH = 16;

  return (
    <div
      className="relative mx-auto"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        perspective: "1200px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* 3D Canvas Container */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(-8deg) rotateX(2deg)",
        }}
      >
        {/* Main canvas face */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: `translateZ(${CANVAS_DEPTH / 2}px)`,
            boxShadow: `
              6px 6px 20px rgba(0,0,0,0.25),
              12px 12px 40px rgba(0,0,0,0.15),
              -3px -3px 12px rgba(0,0,0,0.08)
            `,
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Canvas preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Right edge (gallery wrap) */}
        <div
          className="absolute top-0 right-0 h-full overflow-hidden"
          style={{
            width: CANVAS_DEPTH,
            transform: `rotateY(90deg) translateZ(${CANVAS_WIDTH - CANVAS_DEPTH / 2}px)`,
            backgroundColor: bgColor,
          }}
        >
          {imageSrc && (
            <div
              className="h-full"
              style={{
                width: CANVAS_WIDTH,
                transform: `translateX(-${CANVAS_WIDTH - CANVAS_DEPTH}px)`,
                filter: "brightness(0.7)",
              }}
            >
              <img
                src={imageSrc}
                alt=""
                className="w-full h-full object-cover"
                style={{ objectPosition: "right center" }}
              />
            </div>
          )}
        </div>

        {/* Bottom edge (gallery wrap) */}
        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden"
          style={{
            height: CANVAS_DEPTH,
            transform: `rotateX(-90deg) translateZ(${CANVAS_HEIGHT - CANVAS_DEPTH / 2}px)`,
            backgroundColor: bgColor,
          }}
        >
          {imageSrc && (
            <div
              className="w-full"
              style={{
                height: CANVAS_HEIGHT,
                transform: `translateY(-${CANVAS_HEIGHT - CANVAS_DEPTH}px)`,
                filter: "brightness(0.6)",
              }}
            >
              <img
                src={imageSrc}
                alt=""
                className="w-full h-full object-cover"
                style={{ objectPosition: "center bottom" }}
              />
            </div>
          )}
        </div>

        {/* Left edge shadow */}
        <div
          className="absolute top-0 left-0 h-full pointer-events-none"
          style={{
            width: 4,
            transform: `translateZ(${CANVAS_DEPTH / 2}px)`,
            background: "linear-gradient(to right, rgba(0,0,0,0.15), transparent)",
          }}
        />

        {/* Top edge shadow */}
        <div
          className="absolute top-0 left-0 w-full pointer-events-none"
          style={{
            height: 4,
            transform: `translateZ(${CANVAS_DEPTH / 2}px)`,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)",
          }}
        />
      </div>
    </div>
  );
}

/**
 * StepPreview Component (Step 6) - Final Review
 *
 * Shows a 3D canvas mockup for fast, instant preview before checkout.
 * Printful lifestyle mockups are generated after checkout for the confirmation page.
 */
export default function StepPreview({
  mapThumbnail,
  theme,
  cityName,
  stateName,
  onAddToCart,
  onBack,
  isCapturing = false,
}: StepPreviewProps) {
  const [hasViewedPreview, setHasViewedPreview] = useState(false);

  // Mark preview as viewed after thumbnail loads
  useEffect(() => {
    if (mapThumbnail) {
      const timer = setTimeout(() => setHasViewedPreview(true), 800);
      return () => clearTimeout(timer);
    }
  }, [mapThumbnail]);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
          Review Your Design
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Your canvas with gallery wrap finish
        </p>
      </div>

      {/* 3D Canvas Mockup */}
      <div className="bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-900 rounded-xl p-8 border border-neutral-200 dark:border-neutral-700">
        <CanvasMockup
          imageSrc={mapThumbnail}
          bgColor={theme.colors.bg}
        />

        {/* Product Details */}
        <div className="text-center mt-6 space-y-1">
          <p className="font-medium text-neutral-900 dark:text-white">
            {cityName}, {stateName}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {theme.name} • 18&quot; × 24&quot; Gallery Canvas
          </p>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white pt-2">
            $94.00
          </p>
        </div>
      </div>

      {/* Product Features */}
      <div className="grid grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>300 DPI print quality</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>1.25&quot; wood frame</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Gallery wrap finish</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Free shipping</span>
        </div>
      </div>

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
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}