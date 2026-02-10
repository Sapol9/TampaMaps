"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay for visual transition
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 dark:border-white/20 border-t-neutral-600 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="font-semibold text-neutral-900 dark:text-white">
            MapMarked
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light tracking-wide mb-4 text-neutral-900 dark:text-white">
            Order Confirmed
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
            Thank you for your order. Your custom map canvas is being prepared
            with care and will ship within 3-5 business days.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-8 mb-8 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
            What&apos;s Next
          </h2>
          <ul className="space-y-4 text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 text-neutral-600 dark:text-neutral-400">
                1
              </span>
              <span>
                You&apos;ll receive an email confirmation with your order
                details
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 text-neutral-600 dark:text-neutral-400">
                2
              </span>
              <span>
                Your canvas will be printed on premium gallery-quality material
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 text-neutral-600 dark:text-neutral-400">
                3
              </span>
              <span>
                We&apos;ll send tracking information once your order ships
              </span>
            </li>
          </ul>
        </div>

        {/* Session ID for reference */}
        {sessionId && (
          <p className="text-center text-neutral-400 dark:text-neutral-500 text-sm mb-8">
            Order Reference: {sessionId.slice(0, 20)}...
          </p>
        )}

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
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
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Create Another Map</span>
          </Link>
        </div>
      </div>
    </div>
  );
}