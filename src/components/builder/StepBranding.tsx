"use client";

import { useState } from "react";

interface StepBrandingProps {
  cityName: string;
  primaryText: string;
  onPrimaryTextChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepBranding({
  cityName,
  primaryText,
  onPrimaryTextChange,
  onNext,
  onBack,
}: StepBrandingProps) {
  const [useCustomText, setUseCustomText] = useState(primaryText !== cityName);

  const handleToggleCustom = () => {
    if (useCustomText) {
      // Switching back to city name
      onPrimaryTextChange(cityName);
      setUseCustomText(false);
    } else {
      // Switching to custom
      setUseCustomText(true);
    }
  };

  const handleTextChange = (value: string) => {
    onPrimaryTextChange(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Primary Branding
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Customize the main title that appears on your map art
        </p>
      </div>

      {/* Preview */}
      <div className="max-w-md mx-auto p-8 bg-neutral-100 dark:bg-neutral-900 rounded-2xl">
        <div className="text-center">
          <h3
            className="font-serif font-bold text-3xl sm:text-4xl tracking-tight text-neutral-900 dark:text-white border-b border-neutral-900 dark:border-white pb-2 inline-block"
          >
            {primaryText || cityName}
          </h3>
        </div>
      </div>

      {/* Toggle Options */}
      <div className="max-w-md mx-auto space-y-4">
        {/* Use City Name Option */}
        <button
          onClick={() => {
            onPrimaryTextChange(cityName);
            setUseCustomText(false);
          }}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            !useCustomText
              ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white"
              : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`font-medium ${
                  !useCustomText
                    ? "text-white dark:text-neutral-900"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                Use City Name
              </p>
              <p
                className={`text-sm ${
                  !useCustomText
                    ? "text-white/70 dark:text-neutral-900/70"
                    : "text-neutral-500"
                }`}
              >
                {cityName}
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                !useCustomText
                  ? "border-white dark:border-neutral-900"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {!useCustomText && (
                <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-neutral-900" />
              )}
            </div>
          </div>
        </button>

        {/* Custom Text Option */}
        <button
          onClick={handleToggleCustom}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            useCustomText
              ? "border-neutral-900 dark:border-white"
              : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`font-medium ${
                  useCustomText
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                Custom Text
              </p>
              <p className="text-sm text-neutral-500">
                Enter your own title
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                useCustomText
                  ? "border-neutral-900 dark:border-white"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {useCustomText && (
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 dark:bg-white" />
              )}
            </div>
          </div>
        </button>

        {/* Custom Text Input */}
        {useCustomText && (
          <div className="pt-2">
            <input
              type="text"
              value={primaryText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter custom title..."
              maxLength={30}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all text-center font-serif font-bold text-xl"
            />
            <p className="text-xs text-neutral-500 text-center mt-2">
              {primaryText.length}/30 characters
            </p>
          </div>
        )}
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
          disabled={!primaryText.trim()}
          className={`px-8 py-3 rounded-full font-medium transition-all ${
            primaryText.trim()
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
