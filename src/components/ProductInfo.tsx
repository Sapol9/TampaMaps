"use client";

import { PRODUCT } from "@/config/product";

interface ProductInfoProps {
  onAddToCart?: () => void;
}

export default function ProductInfo({ onAddToCart }: ProductInfoProps) {
  return (
    <div className="text-center">
      {/* Size Description */}
      <p className="text-sm text-muted mb-3">{PRODUCT.description}</p>

      {/* Price */}
      <div className="mb-4">
        <span className="text-4xl font-semibold tracking-tight">
          ${PRODUCT.price.toFixed(2)}
        </span>
      </div>

      {/* Free Shipping Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-950 text-success text-sm rounded-full mb-6">
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
            d="M5 13l4 4L19 7"
          />
        </svg>
        {PRODUCT.shippingText}
      </div>

      {/* Add to Cart Button */}
      <div>
        <button
          onClick={onAddToCart}
          className="w-full sm:w-auto px-12 py-4 bg-accent text-background text-base font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
