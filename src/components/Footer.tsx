import { LEGAL, SITE } from "@/config/site";

export default function Footer() {
  return (
    <footer className="w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        {/* Disclaimer */}
        <div className="mb-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">
            Legal Disclaimer
          </h3>
          <p className="text-xs text-muted leading-relaxed max-w-2xl">
            {LEGAL.disclaimer}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} {SITE.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span>Made with care in Tampa Bay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
