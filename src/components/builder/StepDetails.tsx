"use client";

export type DetailLineType = "coordinates" | "address" | "none";

interface StepDetailsProps {
  lat: number;
  lng: number;
  address?: string;
  primaryText: string;
  detailLineType: DetailLineType;
  onDetailLineTypeChange: (type: DetailLineType) => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function StepDetails({
  lat,
  lng,
  address,
  primaryText,
  detailLineType,
  onDetailLineTypeChange,
  onComplete,
  onBack,
}: StepDetailsProps) {
  // Format coordinates
  const latDirection = lat >= 0 ? "N" : "S";
  const lngDirection = lng >= 0 ? "E" : "W";
  const formattedCoords = `${Math.abs(lat).toFixed(4)}° ${latDirection} / ${Math.abs(lng).toFixed(4)}° ${lngDirection}`;

  // Format address - just the street address (first part only)
  const streetAddress = address
    ? address.split(",")[0].trim()
    : null;

  const options = [
    {
      id: "coordinates" as DetailLineType,
      label: "Coordinates",
      preview: formattedCoords,
      description: "Display latitude and longitude",
    },
    {
      id: "address" as DetailLineType,
      label: "Street Address",
      preview: streetAddress || "No address selected",
      description: "Display the focus point address",
      disabled: !address,
    },
    {
      id: "none" as DetailLineType,
      label: "No Text",
      preview: "",
      description: "Clean look without detail line",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Detail Line
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Choose what appears below the main title
        </p>
      </div>

      {/* Preview */}
      <div className="max-w-md mx-auto p-8 bg-neutral-100 dark:bg-neutral-900 rounded-2xl">
        <div className="text-center space-y-2">
          <div className="font-serif font-bold text-2xl tracking-tight text-neutral-900 dark:text-white border-b border-neutral-900 dark:border-white pb-2 inline-block">
            {primaryText.toUpperCase()}
          </div>
          {detailLineType !== "none" && (
            <p className="font-sans text-sm uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {detailLineType === "coordinates"
                ? formattedCoords
                : streetAddress || formattedCoords}
            </p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="max-w-md mx-auto space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => !option.disabled && onDetailLineTypeChange(option.id)}
            disabled={option.disabled}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              option.disabled
                ? "border-neutral-100 dark:border-neutral-900 opacity-50 cursor-not-allowed"
                : detailLineType === option.id
                ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white"
                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p
                  className={`font-medium ${
                    detailLineType === option.id && !option.disabled
                      ? "text-white dark:text-neutral-900"
                      : "text-neutral-900 dark:text-white"
                  }`}
                >
                  {option.label}
                </p>
                <p
                  className={`text-sm ${
                    detailLineType === option.id && !option.disabled
                      ? "text-white/70 dark:text-neutral-900/70"
                      : "text-neutral-500"
                  }`}
                >
                  {option.description}
                </p>
                {option.preview && (
                  <p
                    className={`text-xs font-mono ${
                      detailLineType === option.id && !option.disabled
                        ? "text-white/60 dark:text-neutral-900/60"
                        : "text-neutral-400"
                    }`}
                  >
                    {option.preview}
                  </p>
                )}
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  detailLineType === option.id && !option.disabled
                    ? "border-white dark:border-neutral-900"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {detailLineType === option.id && !option.disabled && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-neutral-900" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full font-medium border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-full font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all"
        >
          Complete Design
        </button>
      </div>
    </div>
  );
}
