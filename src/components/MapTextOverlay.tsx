"use client";

interface MapTextOverlayProps {
  cityName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  textColor: string;
  bgColor: string;
  visible?: boolean;
}

// Safe zone constants (matching SafeZoneOverlay.tsx)
const SAFE_ZONE_VERTICAL_PERCENT = (1.5 / 24) * 100; // 6.25%
const SAFE_ZONE_HORIZONTAL_PERCENT = (1.5 / 18) * 100; // 8.33%

/**
 * Text overlay for the map poster showing city name and coordinates.
 * Positioned at the bottom of the map preview INSIDE the print safe zone.
 */
export default function MapTextOverlay({
  cityName,
  coordinates,
  textColor,
  bgColor,
  visible = true,
}: MapTextOverlayProps) {
  if (!visible) return null;

  // Format coordinates like maptoposter: "27.9506° N / 82.4572° W"
  const latDirection = coordinates.lat >= 0 ? "N" : "S";
  const lngDirection = coordinates.lng >= 0 ? "E" : "W";
  const formattedCoords = `${Math.abs(coordinates.lat).toFixed(4)}° ${latDirection} / ${Math.abs(coordinates.lng).toFixed(4)}° ${lngDirection}`;

  // Space out the city name letters for the poster aesthetic
  const spacedCityName = cityName.toUpperCase().split("").join(" ");

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{
        // Position text area just above the bottom safe zone
        bottom: `${SAFE_ZONE_VERTICAL_PERCENT}%`,
        // Respect horizontal safe zones
        paddingLeft: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
        paddingRight: `${SAFE_ZONE_HORIZONTAL_PERCENT}%`,
        backgroundColor: bgColor,
      }}
    >
      <div className="text-center py-4 sm:py-6">
        {/* City Name - Large, spaced letters */}
        <h2
          className="text-lg sm:text-xl md:text-2xl font-light tracking-[0.4em] mb-1"
          style={{ color: textColor }}
        >
          {spacedCityName}
        </h2>

        {/* Coordinates */}
        <p
          className="text-xs sm:text-sm font-light tracking-widest"
          style={{ color: textColor, opacity: 0.7 }}
        >
          {formattedCoords}
        </p>
      </div>
    </div>
  );
}
