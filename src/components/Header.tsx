import { SITE } from "@/config/site";

export default function Header() {
  return (
    <header className="w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8 border-b border-neutral-100 dark:border-neutral-900">
      <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-semibold tracking-tight">
            {SITE.name}
          </span>
        </a>
      </div>
    </header>
  );
}
