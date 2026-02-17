"use client";

const features = [
  {
    title: "Precision Vector Data",
    description:
      "Every map is rendered at 300 DPI (5400×7200 px) for razor-sharp technical detail. Streets, waterways, and landmarks captured with cartographic precision from OpenStreetMap data.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    title: "Museum-Grade Build",
    description:
      "18\"×24\" gallery wrap on archival canvas with 1.25\" depth for a substantial, gallery-ready feel. Built to remain vibrant for generations.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Signature Aesthetics",
    description:
      "Curated palettes designed for impact. \"The Noir\" delivers dramatic contrast, while \"The Blueprint\" offers technical elegance.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section className="py-20 sm:py-28 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-widest text-neutral-500 uppercase mb-3">
            The System
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-neutral-900 dark:text-white mb-4">
            Engineered for <span className="font-semibold">Permanence</span>
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
            Every detail crafted for museum-quality display
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-8 rounded-2xl bg-white dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
