"use client";

import type { Theme } from "@/lib/mapbox/applyTheme";
import type { DetailLineType } from "./builder/StepDetails";

export interface CartItem {
  id: string;
  cityName: string;
  stateName: string;
  theme: Theme;
  primaryText: string;
  detailLineType: DetailLineType;
  focusAddress?: string;
  lat: number;
  lng: number;
  price: number;
  thumbnail?: string; // Base64 data URL of map preview
}

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onReviewItem?: (item: CartItem) => void;
}

export default function Cart({
  items,
  isOpen,
  onClose,
  onRemoveItem,
  onCheckout,
  onReviewItem,
}: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-neutral-950 z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Your Cart ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
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
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <p className="text-neutral-500">Your cart is empty</p>
              <p className="text-sm text-neutral-400 mt-1">
                Complete your map design to add it to cart
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl"
              >
                {/* Map thumbnail - fixed portrait aspect ratio */}
                <button
                  onClick={() => onReviewItem?.(item)}
                  className="w-16 h-20 rounded-lg flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-neutral-400 transition-all cursor-pointer"
                  title="Click to review"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={`${item.primaryText} map preview`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-end justify-center pb-2"
                      style={{ backgroundColor: item.theme.colors.bg }}
                    >
                      <span
                        className="text-[8px] font-bold tracking-wider"
                        style={{ color: item.theme.colors.text }}
                      >
                        {item.primaryText.slice(0, 6).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                    {item.primaryText}
                  </h3>
                  <p className="text-sm text-neutral-500 truncate">
                    {item.stateName}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {item.theme.name} • 18&quot; × 24&quot; Portrait Canvas
                  </p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mt-2">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors self-start"
                >
                  <svg
                    className="w-4 h-4 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">
                Subtotal
              </span>
              <span className="text-lg font-semibold text-neutral-900 dark:text-white">
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 rounded-full font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all"
            >
              Checkout
            </button>
            <p className="text-xs text-center text-neutral-400">
              Free shipping included
            </p>
          </div>
        )}
      </div>
    </>
  );
}
