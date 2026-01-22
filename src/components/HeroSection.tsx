"use client";

import MapPreview from "./MapPreview";
import StyleTabs from "./StyleTabs";
import type { Theme } from "@/lib/mapbox/applyTheme";

interface HeroSectionProps {
  theme: Theme;
  center: [number, number];
  zoom: number;
  cityName: string;
  stateName: string;
  showSafeZone: boolean;
  onToggleSafeZone: () => void;
  activeMood: string;
  onMoodChange: (mood: string) => void;
  onThemeChange: (theme: Theme) => void;
}

export default function HeroSection({
  theme,
  center,
  zoom,
  cityName,
  stateName,
  showSafeZone,
  onToggleSafeZone,
  activeMood,
  onMoodChange,
  onThemeChange,
}: HeroSectionProps) {
  return (
    <section className="w-full">
      {/* Map Preview */}
      <div className="max-w-2xl mx-auto mb-8">
        <MapPreview
          theme={theme}
          center={center}
          zoom={zoom}
          cityName={cityName}
          stateName={stateName}
          showSafeZone={showSafeZone}
          onToggleSafeZone={onToggleSafeZone}
        />
      </div>

      {/* Style Navigation */}
      <StyleTabs
        activeMood={activeMood}
        activeTheme={theme}
        onMoodChange={onMoodChange}
        onThemeChange={onThemeChange}
      />
    </section>
  );
}
