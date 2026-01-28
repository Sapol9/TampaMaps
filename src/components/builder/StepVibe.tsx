"use client";

import themes from "@/data/themes.json";
import type { Theme } from "@/lib/mapbox/applyTheme";

const typedThemes = themes as Theme[];

interface StepVibeProps {
  selectedMood: string | null;
  selectedTheme: Theme | null;
  onMoodSelect: (mood: string) => void;
  onThemeSelect: (theme: Theme | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepVibe({
  selectedTheme,
  onThemeSelect,
  onNext,
  onBack,
}: StepVibeProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Architectural Signature Series
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Five proprietary styles engineered for museum-grade canvas prints
        </p>
      </div>

      {/* Signature Series Themes */}
      <div className="space-y-4">
        {typedThemes.map((theme) => {
          const isSelected = selectedTheme?.id === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => onThemeSelect(theme)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-neutral-900 dark:border-white shadow-lg"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Color Preview Swatch */}
                <div
                  className="w-16 h-20 rounded-lg flex-shrink-0 overflow-hidden relative shadow-sm"
                  style={{ backgroundColor: theme.colors.bg }}
                >
                  {/* Mini map preview with roads */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 40 50" className="w-full h-full p-2">
                      {/* Simplified road network preview */}
                      <line
                        x1="5"
                        y1="25"
                        x2="35"
                        y2="25"
                        stroke={theme.colors.road_motorway}
                        strokeWidth="1.8"
                        strokeOpacity={theme.colors.road_opacity ?? 0.8}
                      />
                      <line
                        x1="20"
                        y1="8"
                        x2="20"
                        y2="42"
                        stroke={theme.colors.road_primary}
                        strokeWidth="1.2"
                        strokeOpacity={theme.colors.road_opacity ?? 0.8}
                      />
                      <line
                        x1="8"
                        y1="15"
                        x2="32"
                        y2="35"
                        stroke={theme.colors.road_secondary}
                        strokeWidth="0.6"
                        strokeOpacity={(theme.colors.road_opacity ?? 0.8) * 0.8}
                      />
                      <line
                        x1="32"
                        y1="15"
                        x2="8"
                        y2="35"
                        stroke={theme.colors.road_residential}
                        strokeWidth="0.4"
                        strokeOpacity={(theme.colors.road_opacity ?? 0.8) * 0.6}
                      />
                    </svg>
                  </div>
                  {/* Series number badge */}
                  <div
                    className="absolute bottom-1 right-1 text-[8px] font-bold px-1 rounded"
                    style={{
                      backgroundColor: theme.colors.text,
                      color: theme.colors.bg,
                      opacity: 0.9,
                    }}
                  >
                    {theme.seriesNumber}
                  </div>
                </div>

                {/* Theme Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {theme.name}
                    </h3>
                    {isSelected && (
                      <span className="w-5 h-5 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white dark:text-neutral-900"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-1">
                    {theme.subtitle}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {theme.vibe}
                  </p>
                </div>

                {/* Color Palette Pills */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.colors.bg }}
                      title="Land"
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.colors.water }}
                      title="Water"
                    />
                  </div>
                  <div
                    className="w-full h-2 rounded-full"
                    style={{
                      backgroundColor: theme.colors.road_motorway,
                      opacity: theme.colors.road_opacity ?? 0.8,
                    }}
                    title="Roads"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full font-medium border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedTheme}
          className={`px-8 py-3 rounded-full font-medium transition-all ${
            selectedTheme
              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
