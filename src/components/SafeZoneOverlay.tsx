"use client";

interface SafeZoneOverlayProps {
  visible: boolean;
}

/**
 * Displays a 1.5" safe zone overlay on the map preview.
 * This shows where the gallery wrap will occur on the final canvas.
 *
 * The safe zone is calculated as a percentage:
 * - Horizontal: 1.5" / 18" = 8.33%
 * - Vertical: 1.5" / 24" = 6.25%
 */
export default function SafeZoneOverlay({ visible }: SafeZoneOverlayProps) {
  if (!visible) return null;

  // Safe zone percentages
  const horizontalPercent = (1.5 / 18) * 100; // 8.33%
  const verticalPercent = (1.5 / 24) * 100; // 6.25%

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
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
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
        1.5&quot; Safe Zone (Gallery Wrap Area)
      </div>
    </div>
  );
}
