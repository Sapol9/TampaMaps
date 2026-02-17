"use client";

import themes from "@/data/themes.json";
import type { Theme } from "@/lib/mapbox/applyTheme";

interface StyleTabsProps {
  activeMood: string;
  activeTheme: Theme;
  onMoodChange: (mood: string) => void;
  onThemeChange: (theme: Theme) => void;
}

const moodTabs = [
  { id: "Technical", label: "Technical & Noir" },
  { id: "Elemental", label: "Elemental & Warm" },
  { id: "Modern", label: "Modern & Bold" },
] as const;

export default function StyleTabs({
  activeMood,
  activeTheme,
  onMoodChange,
  onThemeChange,
}: StyleTabsProps) {
  const filteredThemes = (themes as Theme[]).filter((t) => t.moodTag === activeMood);

  return (
    <div className="w-full">
      {/* Mood Tabs */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-neutral-100 dark:bg-neutral-900 rounded-lg p-1">
          {moodTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onMoodChange(tab.id);
                const firstTheme = (themes as Theme[]).find((t) => t.moodTag === tab.id);
                if (firstTheme) onThemeChange(firstTheme);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeMood === tab.id
                  ? "bg-white dark:bg-neutral-800 text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {filteredThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all ${
              activeTheme.id === theme.id
                ? "bg-accent text-background font-medium"
                : "bg-neutral-100 dark:bg-neutral-800 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
            title={theme.description}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );
}
