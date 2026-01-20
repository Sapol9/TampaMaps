"use client";

import MapPreview from "./MapPreview";
import StyleTabs, { type Style } from "./StyleTabs";

interface HeroSectionProps {
  styleUrl: string;
  center: [number, number];
  zoom: number;
  showSafeZone: boolean;
  onToggleSafeZone: () => void;
  activeMood: string;
  activeStyle: Style;
  onMoodChange: (mood: string) => void;
  onStyleChange: (style: Style) => void;
}

export default function HeroSection({
  styleUrl,
  center,
  zoom,
  showSafeZone,
  onToggleSafeZone,
  activeMood,
  activeStyle,
  onMoodChange,
  onStyleChange,
}: HeroSectionProps) {
  return (
    <section className="w-full">
      {/* Map Preview */}
      <div className="max-w-2xl mx-auto mb-8">
        <MapPreview
          styleUrl={styleUrl}
          center={center}
          zoom={zoom}
          showSafeZone={showSafeZone}
          onToggleSafeZone={onToggleSafeZone}
        />
      </div>

      {/* Style Navigation */}
      <StyleTabs
        activeMood={activeMood}
        activeStyle={activeStyle}
        onMoodChange={onMoodChange}
        onStyleChange={onStyleChange}
      />
    </section>
  );
}
