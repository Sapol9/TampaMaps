"use client";

import Image from "next/image";
import themes from "@/data/themes.json";
import type { Theme } from "@/lib/mapbox/applyTheme";

// Gallery items: city + theme pairings
// Images are pre-generated using the actual MapPreview component
// Run `npm run generate-gallery` to regenerate
const galleryItems = [
  { city: "Manhattan", state: "New York", themeId: "obsidian", image: "/gallery/manhattan-obsidian.jpg" },
  { city: "San Francisco", state: "California", themeId: "cobalt", image: "/gallery/san-francisco-cobalt.jpg" },
  { city: "Tampa", state: "Florida", themeId: "parchment", image: "/gallery/tampa-parchment.jpg" },
  { city: "Austin", state: "Texas", themeId: "emerald", image: "/gallery/austin-emerald.jpg" },
  { city: "Chicago", state: "Illinois", themeId: "copper", image: "/gallery/chicago-copper.jpg" },
];

function MapPreviewCard({
  city,
  state,
  theme,
  image,
}: {
  city: string;
  state: string;
  theme: Theme;
  image: string;
}) {
  return (
    <div className="group relative">
      {/* Card Container */}
      <div
        className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl relative"
        style={{ backgroundColor: theme.colors.bg }}
      >
        {/* Pre-rendered map image */}
        <Image
          src={image}
          alt={`${city} map in ${theme.name} style`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>

      {/* Theme Label */}
      <div className="mt-2 sm:mt-3 text-center">
        <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white">
          {theme.name}
        </p>
        <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
          {theme.subtitle}
        </p>
      </div>
    </div>
  );
}

export default function Gallery() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
            Signature Series
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-neutral-900 dark:text-white">
            Five Distinct <span className="font-semibold">Aesthetics</span>
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Each theme transforms your location into a unique piece of architectural art
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {galleryItems.map((item) => {
            const theme = (themes as Theme[]).find((t) => t.id === item.themeId);
            if (!theme) return null;

            return (
              <MapPreviewCard
                key={item.city}
                city={item.city}
                state={item.state}
                theme={theme}
                image={item.image}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}