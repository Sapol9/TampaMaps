"use client";

import styles from "@/data/styles.json";

type Style = (typeof styles)[number];

interface StyleTabsProps {
  activeMood: string;
  activeStyle: Style;
  onMoodChange: (mood: string) => void;
  onStyleChange: (style: Style) => void;
}

const moodTabs = [
  { id: "Technical", label: "Technical & Noir" },
  { id: "Elemental", label: "Elemental & Warm" },
  { id: "Modern", label: "Modern & Bold" },
] as const;

export default function StyleTabs({
  activeMood,
  activeStyle,
  onMoodChange,
  onStyleChange,
}: StyleTabsProps) {
  const filteredStyles = styles.filter((s) => s.moodTag === activeMood);

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
                const firstStyle = styles.find((s) => s.moodTag === tab.id);
                if (firstStyle) onStyleChange(firstStyle);
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

      {/* Style Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {filteredStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all ${
              activeStyle.id === style.id
                ? "bg-accent text-background font-medium"
                : "bg-neutral-100 dark:bg-neutral-800 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { Style };
