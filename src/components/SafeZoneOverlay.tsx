"use client";

import type { Orientation } from "./MapPreview";

interface SafeZoneOverlayProps {
  visible: boolean;
  orientation?: Orientation;
}

/**
 * Displays a 1.5" safe zone overlay on the map preview.
 * This shows where the gallery wrap will occur on the final canvas.
 *
 * Portrait (18"x24"):
 * - Horizontal: 1.5" / 18" = 8.33%
 * - Vertical: 1.5" / 24" = 6.25%
 *
 * Landscape (24"x18"):
 * - Horizontal: 1.5" / 24" = 6.25%
 * - Vertical: 1.5" / 18" = 8.33%
 */
export default function SafeZoneOverlay({
  visible,
  orientation = "portrait",
}: SafeZoneOverlayProps) {
  if (!visible) return null;

  // Safe zone percentages based on orientation
  const horizontalPercent =
    orientation === "portrait"
      ? (1.5 / 18) * 100 // 8.33% for portrait
      : (1.5 / 24) * 100; // 6.25% for landscape

  const verticalPercent =
    orientation === "portrait"
      ? (1.5 / 24) * 100 // 6.25% for portrait
      : (1.5 / 18) * 100; // 8.33% for landscape

  const dimensions =
    orientation === "portrait" ? '18"×24"' : '24"×18"';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 safe-zone-overlay">
      {/* Top safe zone */}
      <div
        className="absolute top-0 left-0 right-0 bg-red-500/20 border-b border-dashed border-red-500/50"
        style={{ height: `${verticalPercent}%` }}
      />
      {/* Bottom safe zone */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-red-500/20 border-t border-dashed border-red-500/50"
        style={{ height: `${verticalPercent}%` }}
      />
      {/* Left safe zone */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-red-500/20 border-r border-dashed border-red-500/50"
        style={{
          width: `${horizontalPercent}%`,
          top: `${verticalPercent}%`,
          bottom: `${verticalPercent}%`,
        }}
      />
      {/* Right safe zone */}
      <div
        className="absolute top-0 bottom-0 right-0 bg-red-500/20 border-l border-dashed border-red-500/50"
        style={{
          width: `${horizontalPercent}%`,
          top: `${verticalPercent}%`,
          bottom: `${verticalPercent}%`,
        }}
      />
      {/* Label */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        1.5&quot; Safe Zone ({dimensions})
      </div>
    </div>
  );
}
