"use client";

import { useState } from "react";
import BackOfCanvasPreview from "@/components/BackOfCanvasPreview";

interface StepInscriptionProps {
  personalNote: string;
  onPersonalNoteChange: (note: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

const MAX_NOTE_LENGTH = 150;

export default function StepInscription({
  personalNote,
  onPersonalNoteChange,
  onComplete,
  onBack,
}: StepInscriptionProps) {
  const [showBackPreview, setShowBackPreview] = useState(false);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_NOTE_LENGTH) {
      onPersonalNoteChange(value);
    }
  };

  const charactersRemaining = MAX_NOTE_LENGTH - personalNote.length;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Add Your Inscription
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Personalize your canvas with a meaningful message
        </p>
      </div>

      {/* Inscription Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Write a personal note or commemorate a date
          </label>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
            Printed on the back of your canvas
          </p>
          <textarea
            value={personalNote}
            onChange={handleNoteChange}
            placeholder="e.g., &quot;Where we said yes — June 15, 2024&quot; or &quot;To Mom, with love. Our first home together.&quot;"
            className="w-full px-4 py-3 text-base border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none transition-all"
            rows={4}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-neutral-500">
              {charactersRemaining > 0 ? (
                <span>{charactersRemaining} characters remaining</span>
              ) : (
                <span className="text-amber-600">Character limit reached</span>
              )}
            </p>
            <p className="text-xs text-neutral-400">
              {personalNote.length}/{MAX_NOTE_LENGTH}
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Popular inscriptions:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Our First Home",
              "Where It All Began",
              "Home Sweet Home",
              "Est. 2024",
              "Forever Our Place",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  if (suggestion.length <= MAX_NOTE_LENGTH) {
                    onPersonalNoteChange(suggestion);
                  }
                }}
                className="px-3 py-1.5 text-xs bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-full text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Toggle */}
        <button
          onClick={() => setShowBackPreview(!showBackPreview)}
          className="w-full py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
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
          {showBackPreview ? "Hide" : "Preview"} Back of Canvas
        </button>

        {/* Back of Canvas Preview Modal */}
        {showBackPreview && (
          <BackOfCanvasPreview
            personalNote={personalNote}
            onClose={() => setShowBackPreview(false)}
          />
        )}
      </div>

      {/* Skip Note Option */}
      {!personalNote && (
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          This step is optional — you can skip it if you prefer a clean back
        </p>
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
          onClick={onComplete}
          className="px-8 py-3 rounded-full font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all"
        >
          {personalNote ? "Complete Design" : "Skip & Complete"}
        </button>
      </div>
    </div>
  );
}
