"use client";

import { SITE, LEGAL } from "@/config/site";

interface BackOfCanvasPreviewProps {
  personalNote: string;
  onClose?: () => void;
}

/**
 * Back of Canvas Preview Component
 *
 * Displays a 4" x 6" label layout preview containing:
 * - Personalized text in a high-end serif font
 * - MapMarked authenticity logo
 * - Legal disclaimer
 */
export default function BackOfCanvasPreview({
  personalNote,
  onClose,
}: BackOfCanvasPreviewProps) {
  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Back of Canvas Preview
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 4"x6" Label Preview - ratio 2:3 */}
      <div
        className="aspect-[2/3] max-w-[240px] mx-auto bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden"
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
        }}
      >
        <div className="h-full flex flex-col p-5">
          {/* MapMarked Authenticity Logo/Header */}
          <div className="text-center pb-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="mb-2">
              {/* Simplified logo mark */}
              <svg
                className="w-8 h-8 mx-auto text-neutral-800 dark:text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white tracking-wide">
              {SITE.name}
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-sans">
              Premium Architectural Map Art
            </p>
          </div>

          {/* Personal Note Section */}
          <div className="flex-1 flex items-center justify-center py-4">
            {personalNote ? (
              <div className="text-center px-2">
                <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed italic">
                  &ldquo;{personalNote}&rdquo;
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 text-center italic font-sans">
                Your personal inscription will appear here
              </p>
            )}
          </div>

          {/* Authenticity & Info Footer */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
            {/* Product Info */}
            <div className="text-center">
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-sans">
                18&quot; &times; 24&quot; Gallery Canvas
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-500 font-sans">
                300 DPI Archival Print
              </p>
            </div>

            {/* Legal Disclaimer */}
            <p className="text-[7px] text-neutral-400 dark:text-neutral-500 text-center leading-relaxed font-sans">
              {LEGAL.disclaimer}
            </p>

            {/* Website */}
            <p className="text-[9px] text-neutral-500 dark:text-neutral-400 text-center font-sans tracking-wide">
              {SITE.domain}
            </p>
          </div>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
        This 4&quot; &times; 6&quot; label is printed on the back of your canvas
      </p>
    </div>
  );
}
