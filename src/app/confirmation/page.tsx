"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface OrderStatus {
  status: "pending" | "completed";
  mockupUrl: string | null;
  printfulOrderId: number | null;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Poll for order status
  const fetchOrderStatus = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/order-status?session_id=${sessionId}`);
      if (response.ok) {
        const data: OrderStatus = await response.json();
        setOrderStatus(data);
        return data.status === "completed";
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
    return false;
  }, [sessionId]);

  useEffect(() => {
    // Initial load
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sessionId || isLoading) return;

    // Start polling for order status
    const poll = async () => {
      const isComplete = await fetchOrderStatus();
      if (!isComplete && pollCount < 60) {
        // Poll for up to 60 seconds
        setPollCount((prev) => prev + 1);
      }
    };

    poll();

    // Continue polling if not complete
    if (!orderStatus?.mockupUrl && pollCount < 60) {
      const interval = setInterval(async () => {
        const isComplete = await fetchOrderStatus();
        if (isComplete) {
          clearInterval(interval);
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [sessionId, isLoading, fetchOrderStatus, pollCount, orderStatus?.mockupUrl]);

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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wide mb-4 text-neutral-900 dark:text-white">
            Order Confirmed
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
            Thank you for your order. Your custom map canvas is being prepared
            with care and will ship within 3-5 business days.
          </p>
        </div>

        {/* Mockup Preview */}
        {orderStatus?.mockupUrl ? (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-900">
              <Image
                src={orderStatus.mockupUrl}
                alt="Your canvas mockup"
                fill
                className="object-contain"
                unoptimized // External URL from Printful
              />
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                Preview of your finished canvas
              </p>
            </div>
          </div>
        ) : orderStatus?.status === "pending" && pollCount < 30 ? (
          <div className="mb-8 rounded-xl bg-neutral-50 dark:bg-neutral-900 p-8 border border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-600 dark:border-t-white rounded-full animate-spin" />
              <p className="text-neutral-600 dark:text-neutral-400 text-center">
                Generating your canvas preview...
              </p>
            </div>
          </div>
        ) : pollCount >= 30 && !orderStatus?.mockupUrl ? (
          <div className="mb-8 rounded-xl bg-neutral-50 dark:bg-neutral-900 p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  Preview unavailable
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Your order is confirmed and being processed. You&apos;ll receive an email with your canvas mockup once it&apos;s ready.
                </p>
              </div>
            </div>
          </div>
        ) : null}

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

        {/* Order Reference */}
        <div className="text-center mb-8 space-y-2">
          {sessionId && (
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">
              Order Reference: {sessionId.slice(0, 20)}...
            </p>
          )}
          {orderStatus?.printfulOrderId && (
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">
              Fulfillment ID: #{orderStatus.printfulOrderId}
            </p>
          )}
        </div>

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

// Loading fallback for Suspense
function ConfirmationLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neutral-300 dark:border-white/20 border-t-neutral-600 dark:border-t-white rounded-full animate-spin" />
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationContent />
    </Suspense>
  );
}