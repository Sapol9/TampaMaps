"use client";

import type { Orientation } from "@/components/MapPreview";

interface StepOrientationProps {
  selectedOrientation: Orientation;
  onOrientationSelect: (orientation: Orientation) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepOrientation({
  selectedOrientation,
  onOrientationSelect,
  onNext,
  onBack,
}: StepOrientationProps) {
  const options: { id: Orientation; label: string; dimensions: string; icon: React.ReactNode }[] = [
    {
      id: "portrait",
      label: "Portrait",
      dimensions: "18\" × 24\"",
      icon: (
        <div className="w-12 h-16 border-2 border-current rounded-sm" />
      ),
    },
    {
      id: "landscape",
      label: "Landscape",
      dimensions: "24\" × 18\"",
      icon: (
        <div className="w-16 h-12 border-2 border-current rounded-sm" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Choose Orientation
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Select the canvas orientation for your map
        </p>
      </div>

      {/* Orientation Options */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onOrientationSelect(option.id)}
            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
              selectedOrientation === option.id
                ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"
            }`}
          >
            <div
              className={`${
                selectedOrientation === option.id
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              {option.icon}
            </div>
            <div className="text-center">
              <p
                className={`font-medium ${
                  selectedOrientation === option.id
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {option.label}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                {option.dimensions}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Info Note */}
      <div className="max-w-md mx-auto p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
          Both orientations use the same premium gallery-wrap canvas with 1.25" depth.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-full font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
