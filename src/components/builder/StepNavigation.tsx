"use client";

interface Step {
  number: number;
  title: string;
  shortTitle: string;
}

const STEPS: Step[] = [
  { number: 1, title: "Select City", shortTitle: "City" },
  { number: 2, title: "Choose Your Vibe", shortTitle: "Vibe" },
  { number: 3, title: "Define Your Focus", shortTitle: "Focus" },
  { number: 4, title: "Primary Branding", shortTitle: "Title" },
  { number: 5, title: "Detail Line", shortTitle: "Details" },
  { number: 6, title: "Final Preview", shortTitle: "Preview" },
];

interface StepNavigationProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: number[];
}

export default function StepNavigation({
  currentStep,
  onStepClick,
  completedSteps,
}: StepNavigationProps) {
  return (
    <nav className="w-full mb-8">
      {/* Desktop: Horizontal */}
      <div className="hidden md:flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = completedSteps.includes(step.number);
          const isClickable = isCompleted || step.number <= Math.max(...completedSteps, 1) + 1;

          return (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : isCompleted
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700"
                    : isClickable
                    ? "bg-transparent text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    : "bg-transparent text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    isActive
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      : isCompleted
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : "border border-current"
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </span>
                <span className="text-sm font-medium">{step.title}</span>
              </button>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 h-px mx-2 ${
                    completedSteps.includes(step.number)
                      ? "bg-neutral-900 dark:bg-white"
                      : "bg-neutral-200 dark:bg-neutral-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Compact horizontal */}
      <div className="md:hidden flex items-center justify-between px-2">
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = completedSteps.includes(step.number);
          const isClickable = isCompleted || step.number <= Math.max(...completedSteps, 1) + 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className="flex flex-col items-center gap-1 w-full"
              >
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 scale-110"
                      : isCompleted
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : isClickable
                      ? "border-2 border-neutral-300 dark:border-neutral-700 text-neutral-500"
                      : "border border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-700"
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500"
                  }`}
                >
                  {step.shortTitle}
                </span>
              </button>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-1 ${
                    completedSteps.includes(step.number)
                      ? "bg-neutral-900 dark:bg-white"
                      : "bg-neutral-200 dark:bg-neutral-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export { STEPS };
export type { Step };
