"use client";

interface ValueSidebarProps {
  price: number;
  onAddToCart: () => void;
  isComplete: boolean;
}

export default function ValueSidebar({
  price,
  onAddToCart,
  isComplete,
}: ValueSidebarProps) {
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

      {/* Product Specs - Fixed Portrait */}
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
            18&quot; &times; 24&quot; Portrait Canvas
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
            300 DPI / 5400&times;7200 px
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
            Ready to Hang &bull; Ships in 3-5 Days
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

    </div>
  );
}
