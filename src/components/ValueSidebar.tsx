"use client";

import { useState } from "react";
import type { Orientation } from "./MapPreview";

interface ValueSidebarProps {
  price: number;
  onAddToCart: () => void;
  isComplete: boolean;
  orientation?: Orientation;
  personalNote?: string;
  onPersonalNoteChange?: (note: string) => void;
}

const MAX_NOTE_LENGTH = 200;

export default function ValueSidebar({
  price,
  onAddToCart,
  isComplete,
  orientation = "portrait",
  personalNote = "",
  onPersonalNoteChange,
}: ValueSidebarProps) {
  const dimensions = orientation === "landscape" ? "24\" × 18\"" : "18\" × 24\"";
  const [showBackPreview, setShowBackPreview] = useState(false);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_NOTE_LENGTH) {
      onPersonalNoteChange?.(value);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
      {/* Price & Free Shipping */}
      <div className="text-center pb-5 border-b border-neutral-200 dark:border-neutral-800">
        <div className="text-3xl font-semibold text-neutral-900 dark:text-white">
          ${price.toFixed(2)}
        </div>
        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Free Shipping
        </div>
      </div>

      {/* Product Specs */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <svg
            className="w-5 h-5 text-neutral-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-neutral-600 dark:text-neutral-400">
            {dimensions} Archival Canvas
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <svg
            className="w-5 h-5 text-neutral-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span className="text-neutral-600 dark:text-neutral-400">
            1.25&quot; Kiln-Dried Wood Frame
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <svg
            className="w-5 h-5 text-neutral-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
            />
          </svg>
          <span className="text-neutral-600 dark:text-neutral-400">
            300 DPI / 5400×7200 px
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <svg
            className="w-5 h-5 text-neutral-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-neutral-600 dark:text-neutral-400">
            Ready to Hang • Ships in 3-5 Days
          </span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={onAddToCart}
        disabled={!isComplete}
        className={`w-full py-4 rounded-full font-medium text-lg transition-all ${
          isComplete
            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 shadow-lg"
            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
        }`}
      >
        {isComplete ? "Add to Cart" : "Complete Design First"}
      </button>

      {/* Back of Canvas Preview Toggle */}
      <button
        onClick={() => setShowBackPreview(!showBackPreview)}
        className="w-full text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center justify-center gap-2 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        {showBackPreview ? "Hide" : "View"} Back of Canvas
      </button>

      {/* Back of Canvas Preview with Personalized Note */}
      {showBackPreview && (
        <div className="space-y-4">
          {/* Personalized Note Textarea */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Add a Custom Note (Printed on Back)
            </label>
            <textarea
              value={personalNote}
              onChange={handleNoteChange}
              placeholder="Add a personal message, dedication, or story about this location..."
              className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none transition-all"
              rows={3}
            />
            <p className="text-xs text-neutral-400 mt-1 text-right">
              {personalNote.length}/{MAX_NOTE_LENGTH} characters
            </p>
          </div>

          {/* Back of Canvas Preview */}
          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-3 font-medium">
              Live Preview
            </p>
            <div
              className={`${
                orientation === "landscape" ? "aspect-[4/3]" : "aspect-[3/4]"
              } bg-white dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 flex flex-col`}
            >
              {/* MapMarked Logo */}
              <div className="text-center mb-3">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white tracking-wide">
                  MapMarked
                </span>
                <p className="text-[10px] text-neutral-400">
                  Premium Architectural Map Art
                </p>
              </div>

              {/* Personal Note Section */}
              <div className="flex-1 flex items-center justify-center">
                {personalNote ? (
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 text-center leading-relaxed px-2 italic">
                    &ldquo;{personalNote}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400 text-center italic">
                    Your personal note will appear here
                  </p>
                )}
              </div>

              {/* Dimensions & Info */}
              <div className="text-center mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {dimensions} • Gallery Wrap Canvas
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  mapmarked.com
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 text-center mt-3">
              This label is printed on the back of your canvas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
