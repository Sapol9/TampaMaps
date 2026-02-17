"use client";

import { useState } from "react";
import { MATERIALS } from "@/config/product";

export default function ProductDetails() {
  const [isExpanded, setIsExpanded] = useState(false);

  const details = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      title: MATERIALS.frame,
      description: MATERIALS.frameDescription,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: MATERIALS.canvas,
      description: MATERIALS.canvasDescription,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      title: MATERIALS.inks,
      description: MATERIALS.inksDescription,
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-muted hover:text-foreground transition-colors"
      >
        <span>Product Details</span>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Details Content */}
      {isExpanded && (
        <div className="pb-4 space-y-4">
          {details.map((detail, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-muted">
                {detail.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{detail.title}</p>
                <p className="text-xs text-muted">{detail.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
