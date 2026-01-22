"use client";

import themes from "@/data/themes.json";
import type { Theme } from "@/lib/mapbox/applyTheme";

const typedThemes = themes as Theme[];

// Define mood categories with descriptions
const MOOD_CATEGORIES = [
  {
    id: "Technical",
    name: "Technical",
    description: "Clean, precise, architectural aesthetics",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    id: "Elemental",
    name: "Elemental",
    description: "Natural, organic, earth-inspired tones",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    id: "Modern",
    name: "Modern",
    description: "Contemporary, bold, artistic styles",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
];

interface StepVibeProps {
  selectedMood: string | null;
  selectedTheme: Theme | null;
  onMoodSelect: (mood: string) => void;
  onThemeSelect: (theme: Theme) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepVibe({
  selectedMood,
  selectedTheme,
  onMoodSelect,
  onThemeSelect,
  onNext,
  onBack,
}: StepVibeProps) {
  // Get themes for selected mood
  const themesForMood = selectedMood
    ? typedThemes.filter((t) => t.moodTag === selectedMood)
    : [];

  const handleMoodSelect = (moodId: string) => {
    onMoodSelect(moodId);
    // Auto-select first theme in mood
    const firstTheme = typedThemes.find((t) => t.moodTag === moodId);
    if (firstTheme) {
      onThemeSelect(firstTheme);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Choose Your Vibe
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Select a mood category, then pick your perfect style
        </p>
      </div>

      {/* Mood Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {MOOD_CATEGORIES.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodSelect(mood.id)}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              selectedMood === mood.id
                ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
            }`}
          >
            <div
              className={`mb-3 ${
                selectedMood === mood.id
                  ? "text-white dark:text-neutral-900"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {mood.icon}
            </div>
            <h3
              className={`font-semibold mb-1 ${
                selectedMood === mood.id
                  ? "text-white dark:text-neutral-900"
                  : "text-neutral-900 dark:text-white"
              }`}
            >
              {mood.name}
            </h3>
            <p
              className={`text-sm ${
                selectedMood === mood.id
                  ? "text-white/70 dark:text-neutral-900/70"
                  : "text-neutral-500"
              }`}
            >
              {mood.description}
            </p>
          </button>
        ))}
      </div>

      {/* Theme Selection */}
      {selectedMood && themesForMood.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-center text-neutral-900 dark:text-white">
            {selectedMood} Styles
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {themesForMood.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeSelect(theme)}
                className={`group relative px-4 py-2 rounded-full border-2 transition-all ${
                  selectedTheme?.id === theme.id
                    ? "border-neutral-900 dark:border-white"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                {/* Color preview dots */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.colors.bg }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.colors.road_motorway }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.colors.water }}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      selectedTheme?.id === theme.id
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {theme.name}
                  </span>
                </div>

                {/* Selected indicator */}
                {selectedTheme?.id === theme.id && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white dark:text-neutral-900"
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
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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
