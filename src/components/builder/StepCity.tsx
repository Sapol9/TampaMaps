"use client";

import { useState, useEffect, useRef } from "react";
import locations from "@/data/locations.json";

export interface LocationData {
  id: string;
  name: string;
  displayName: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  zoom: number;
}

interface StepCityProps {
  selectedLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
  onNext: () => void;
}

// Convert locations.json to array
const presetLocations: LocationData[] = Object.values(locations);

export default function StepCity({
  selectedLocation,
  onLocationSelect,
  onNext,
}: StepCityProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
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

  // Search with Mapbox Geocoding API
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(presetLocations);
      return;
    }

    setIsSearching(true);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    try {
      // First, filter preset locations
      const presetMatches = presetLocations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query.toLowerCase()) ||
          loc.displayName.toLowerCase().includes(query.toLowerCase())
      );

      // Then search Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${token}&types=place,locality,neighborhood&limit=5`
      );

      if (response.ok) {
        const data = await response.json();
        const mapboxResults: LocationData[] = data.features.map(
          (feature: {
            id: string;
            place_name: string;
            text: string;
            center: [number, number];
            context?: Array<{ id: string; text: string }>;
          }) => {
            // Extract state/region from context
            const stateContext = feature.context?.find((c) => c.id.startsWith("region"));
            const countryContext = feature.context?.find((c) => c.id.startsWith("country"));

            return {
              id: feature.id,
              name: feature.text,
              displayName: feature.place_name.split(",")[0],
              state: stateContext?.text,
              country: countryContext?.text,
              lat: feature.center[1],
              lng: feature.center[0],
              zoom: 12,
            };
          }
        );

        // Combine preset matches with Mapbox results, removing duplicates
        const combined = [...presetMatches];
        mapboxResults.forEach((result) => {
          if (!combined.some((loc) => loc.name === result.name)) {
            combined.push(result);
          }
        });

        setSearchResults(combined.slice(0, 8));
      } else {
        setSearchResults(presetMatches);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setSearchResults(presetLocations);
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
      searchLocation(value);
    }, 300);
  };

  // Initialize with preset locations
  useEffect(() => {
    setSearchResults(presetLocations);
  }, []);

  const handleSelect = (location: LocationData) => {
    onLocationSelect(location);
    setSearchQuery(location.displayName);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Select Your City
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Choose from our curated locations or search for any city worldwide
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for a city..."
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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
            {searchResults.map((location) => (
              <button
                key={location.id}
                onClick={() => handleSelect(location)}
                className={`w-full px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 ${
                  selectedLocation?.id === location.id
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : ""
                }`}
              >
                <svg
                  className="w-5 h-5 text-neutral-400 flex-shrink-0"
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
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {location.displayName}
                    {location.state && (
                      <span className="text-neutral-500 font-normal">, {location.state}</span>
                    )}
                    {!location.state && location.country && (
                      <span className="text-neutral-500 font-normal">, {location.country}</span>
                    )}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                  </p>
                </div>
                {selectedLocation?.id === location.id && (
                  <svg
                    className="w-5 h-5 text-green-500 ml-auto"
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
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected City Preview */}
      {selectedLocation && (
        <div className="max-w-md mx-auto p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Selected Location
              </p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {selectedLocation.displayName}
              </p>
            </div>
            <button
              onClick={() => {
                onLocationSelect(null as unknown as LocationData);
                setSearchQuery("");
              }}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
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
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onNext}
          disabled={!selectedLocation}
          className={`px-8 py-3 rounded-full font-medium transition-all ${
            selectedLocation
              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
