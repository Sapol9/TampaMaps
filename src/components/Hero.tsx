"use client";

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  const handleScroll = () => {
    onGetStarted();
    // Smooth scroll to builder section
    const builderSection = document.getElementById("map-builder");
    if (builderSection) {
      builderSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-20 sm:py-28 lg:py-36">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900 dark:text-white mb-6">
          Museum-Grade Canvas.{" "}
          <span className="font-semibold">Architectural Precision.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Transform your life&apos;s landmarks into gallery-ready art. Hand-stretched
          on premium 18&quot; × 24&quot; gallery canvas with a substantial 1.25&quot; deep
          museum profile.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleScroll}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
        >
          Build Your Landmark
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {/* Price & Free Shipping Badge */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="text-2xl font-semibold text-neutral-900 dark:text-white">
            $94
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Free Shipping
          </span>
        </div>

        {/* Trust indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ships in 3-5 Days</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Satisfaction Guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Ready to Hang</span>
          </div>
        </div>
      </div>
    </section>
  );
}
