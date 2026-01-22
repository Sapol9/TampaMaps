"use client";

import { useState, useRef, useEffect } from "react";

export interface FocusPoint {
  lat: number;
  lng: number;
  address?: string;
}

interface StepFocusProps {
  centerLat: number;
  centerLng: number;
  focusPoint: FocusPoint | null;
  onFocusPointChange: (point: FocusPoint | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepFocus({
  centerLat,
  centerLng,
  focusPoint,
  onFocusPointChange,
  onNext,
  onBack,
}: StepFocusProps) {
  const [searchQuery, setSearchQuery] = useState(focusPoint?.address || "");
  const [searchResults, setSearchResults] = useState<
    Array<{ place_name: string; center: [number, number] }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search addresses near the selected city
  const searchAddress = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    try {
      // Search near the city center with proximity bias
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${token}&proximity=${centerLng},${centerLat}&types=address,poi&limit=5`
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.features || []);
      }
    } catch (error) {
      console.error("Address search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  const handleSelectAddress = (result: {
    place_name: string;
    center: [number, number];
  }) => {
    onFocusPointChange({
      lat: result.center[1],
      lng: result.center[0],
      address: result.place_name,
    });
    setSearchQuery(result.place_name);
    setShowDropdown(false);
  };

  const handleUseCityCenter = () => {
    onFocusPointChange(null);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Define Your Focus
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Search for a specific address or landmark to center your map
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-lg mx-auto" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for an address or landmark..."
            className="w-full px-4 py-3 pl-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectAddress(result)}
                className="w-full px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-start gap-3"
              >
                <svg
                  className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-neutral-900 dark:text-white text-sm">
                  {result.place_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Focus Display */}
      <div className="max-w-lg mx-auto space-y-3">
        {focusPoint ? (
          <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-neutral-900 dark:border-white flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Focus Point
                  </p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {focusPoint.address || `${focusPoint.lat.toFixed(4)}°, ${focusPoint.lng.toFixed(4)}°`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onFocusPointChange(null);
                  setSearchQuery("");
                }}
                className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4 text-neutral-500"
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
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center">
            <p className="text-sm text-neutral-500">
              Using city center as focus point
            </p>
          </div>
        )}

        <button
          onClick={handleUseCityCenter}
          className="w-full py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          Reset to city center
        </button>
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
          onClick={onNext}
          className="px-8 py-3 rounded-full font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
