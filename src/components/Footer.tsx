"use client";

import { SITE, LEGAL } from "@/config/site";

export default function Footer() {
  // Fixed copyright year as specified
  const currentYear = 2026;

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
              {SITE.name}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Premium architectural map art. Transform any location into
              museum-quality canvas prints.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-medium text-neutral-900 dark:text-white mb-3 text-sm">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>18" × 24" Gallery Canvas</li>
              <li>5 Signature Series Styles</li>
              <li>Free US Shipping</li>
              <li>3-5 Day Delivery</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium text-neutral-900 dark:text-white mb-3 text-sm">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href={`mailto:hello@${SITE.domain}`}
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  hello@{SITE.domain}
                </a>
              </li>
              <li>Satisfaction Guaranteed</li>
              <li>Secure Checkout</li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed mb-6">
            {LEGAL.disclaimer}
          </p>

          {/* Copyright & Attribution */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 opacity-60">
            <p className="font-light">
              © {currentYear} {SITE.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="font-light">Map data © Mapbox © OpenStreetMap</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
