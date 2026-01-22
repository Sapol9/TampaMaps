"use client";

const steps = [
  {
    number: "01",
    title: "Pin",
    description:
      "Search for any address, neighborhood, or landmark worldwide. Our engine instantly generates a high-density architectural draft of your location.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Style",
    description:
      "Select your aesthetic. Choose from signature palettes like The Noir for dramatic technical contrast or The Blueprint for classic elegance.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Ship",
    description:
      "We render your map at 300 DPI (5400×7200 px) and hand-stretch it over a 1.25\" gallery wrap. Arrives at your door ready to hang.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3m-6.75-4.5H21M3.375 15h13.125"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 5.25H21v5.25h-7.5V5.25z"
        />
      </svg>
    ),
  },
];

export default function ProcessSteps() {
  return (
    <section className="py-20 sm:py-24 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            Your Story in Three Steps
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative text-center p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800"
            >
              {/* Step Number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-950 px-3">
                <span className="text-sm font-medium text-neutral-400 tracking-wider">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 mb-6">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
