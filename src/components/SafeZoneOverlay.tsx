"use client";

interface SafeZoneOverlayProps {
  visible: boolean;
}

/**
 * Displays a subtle 1.5" safe zone overlay on the map preview.
 * This shows where the gallery wrap will occur on the final canvas.
 *
 * Fixed Portrait (18"x24"):
 * - Horizontal: 1.5" / 18" = 8.33%
 * - Vertical: 1.5" / 24" = 6.25%
 *
 * Final render resolution: 5400px × 7200px at 300 DPI
 */
export default function SafeZoneOverlay({ visible }: SafeZoneOverlayProps) {
  if (!visible) return null;

  // Fixed portrait safe zone percentages (18" × 24")
  const horizontalPercent = (1.5 / 18) * 100; // 8.33%
  const verticalPercent = (1.5 / 24) * 100; // 6.25%

  // Neutral gray color for subtle appearance
  const lineColor = "#9CA3AF"; // Tailwind gray-400

  return (
    <div className="absolute inset-0 pointer-events-none z-10 safe-zone-overlay">
      {/* Inner rectangle outline - subtle dashed line */}
      <div
        className="absolute"
        style={{
          top: `${verticalPercent}%`,
          right: `${horizontalPercent}%`,
          bottom: `${verticalPercent}%`,
          left: `${horizontalPercent}%`,
          border: `1px dashed ${lineColor}`,
          opacity: 0.6,
        }}
      />

      {/* Corner markers for visual clarity */}
      {/* Top-left */}
      <div
        className="absolute"
        style={{
          top: `${verticalPercent}%`,
          left: `${horizontalPercent}%`,
          width: "12px",
          height: "12px",
          borderTop: `2px solid ${lineColor}`,
          borderLeft: `2px solid ${lineColor}`,
          opacity: 0.8,
          transform: "translate(-1px, -1px)",
        }}
      />
      {/* Top-right */}
      <div
        className="absolute"
        style={{
          top: `${verticalPercent}%`,
          right: `${horizontalPercent}%`,
          width: "12px",
          height: "12px",
          borderTop: `2px solid ${lineColor}`,
          borderRight: `2px solid ${lineColor}`,
          opacity: 0.8,
          transform: "translate(1px, -1px)",
        }}
      />
      {/* Bottom-left */}
      <div
        className="absolute"
        style={{
          bottom: `${verticalPercent}%`,
          left: `${horizontalPercent}%`,
          width: "12px",
          height: "12px",
          borderBottom: `2px solid ${lineColor}`,
          borderLeft: `2px solid ${lineColor}`,
          opacity: 0.8,
          transform: "translate(-1px, 1px)",
        }}
      />
      {/* Bottom-right */}
      <div
        className="absolute"
        style={{
          bottom: `${verticalPercent}%`,
          right: `${horizontalPercent}%`,
          width: "12px",
          height: "12px",
          borderBottom: `2px solid ${lineColor}`,
          borderRight: `2px solid ${lineColor}`,
          opacity: 0.8,
          transform: "translate(1px, 1px)",
        }}
      />

      {/* Subtle label in top-right corner */}
      <div
        className="absolute text-[8px] font-light leading-tight text-right max-w-[120px]"
        style={{
          top: "8px",
          right: "8px",
          color: lineColor,
          opacity: 0.7,
        }}
      >
        Everything outside this line wraps around the 1.25&quot; frame
      </div>
    </div>
  );
}
