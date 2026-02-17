"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import themes from "@/data/themes.json";
import locations from "@/data/locations.json";
import type { Theme } from "@/lib/mapbox/applyTheme";
import { type MapPreviewHandle, type DetailLineType } from "@/components/MapPreview";

const MapPreview = dynamic(() => import("@/components/MapPreview"), {
  ssr: false,
  loading: () => (
    <div className="aspect-[3/4] w-full rounded-xl bg-neutral-900 animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
    </div>
  ),
});

interface LocationData {
  id: string;
  name: string;
  displayName: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  zoom: number;
}

const PRINT_SIZES = [
  { id: "12x16", label: '12" × 16"', aspectRatio: "3/4" },
  { id: "16x20", label: '16" × 20"', aspectRatio: "4/5" },
  { id: "18x24", label: '18" × 24"', aspectRatio: "3/4" },
  { id: "24x36", label: '24" × 36"', aspectRatio: "2/3" },
];

const HERO_EXAMPLES = [
  { city: "New York", state: "NY", theme: "obsidian", lat: 40.7128, lng: -74.006 },
  { city: "Paris", state: "France", theme: "parchment", lat: 48.8566, lng: 2.3522 },
  { city: "Tokyo", state: "Japan", theme: "cobalt", lat: 35.6762, lng: 139.6503 },
  { city: "Tampa", state: "FL", theme: "coastal", lat: 27.9506, lng: -82.4572 },
];

const presetLocations: LocationData[] = Object.values(locations);

// Parse city name from geocode result
function parseCityName(feature: {
  text: string;
  place_name: string;
  place_type?: string[];
  context?: Array<{ id: string; text: string; short_code?: string }>;
}): { city: string; state: string; country: string } {
  const context = feature.context || [];

  // Find place (city), region (state), and country from context
  const placeCtx = context.find((c) => c.id.startsWith("place"));
  const regionCtx = context.find((c) => c.id.startsWith("region"));
  const countryCtx = context.find((c) => c.id.startsWith("country"));

  // If the result IS a place, use its text as city
  // Otherwise look in context for the place
  let city = feature.text;
  if (feature.place_type?.includes("address") || feature.place_type?.includes("poi")) {
    city = placeCtx?.text || feature.text;
  }

  // Use short_code for US states (e.g., "US-FL" -> "FL")
  let state = regionCtx?.text || "";
  if (regionCtx?.short_code?.startsWith("US-")) {
    state = regionCtx.short_code.replace("US-", "");
  }

  const country = countryCtx?.text || "";

  return { city, state, country };
}

function HomeContent() {
  const searchParams = useSearchParams();
  const isPaid = searchParams.get("paid") === "true";
  const paymentType = searchParams.get("type");

  // Location state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>(presetLocations);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Editable text fields
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [detailText, setDetailText] = useState("");
  const [detailLineType, setDetailLineType] = useState<DetailLineType>("coordinates");

  // Points/marker
  const [showMarker, setShowMarker] = useState(false);

  // Style & size
  const [selectedTheme, setSelectedTheme] = useState<Theme>((themes as Theme[])[0]);
  const [selectedSize, setSelectedSize] = useState(PRINT_SIZES[2]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"style" | "text" | "points">("style");

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(isPaid);

  const mapPreviewRef = useRef<MapPreviewHandle>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toolSectionRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear URL params after success
  useEffect(() => {
    if (isPaid) {
      const timeout = setTimeout(() => {
        window.history.replaceState({}, "", window.location.pathname);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isPaid]);

  // Format coordinates
  const formatCoordinates = (lat: number, lng: number) => {
    return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"} / ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
  };

  // Search handler with better city parsing
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(presetLocations);
      return;
    }

    setIsSearching(true);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    try {
      const presetMatches = presetLocations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query.toLowerCase()) ||
          loc.displayName.toLowerCase().includes(query.toLowerCase())
      );

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&types=place,locality,neighborhood,address&limit=5`
      );

      if (response.ok) {
        const data = await response.json();
        const mapboxResults: LocationData[] = data.features.map(
          (feature: {
            id: string;
            place_name: string;
            text: string;
            center: [number, number];
            place_type?: string[];
            context?: Array<{ id: string; text: string; short_code?: string }>;
          }) => {
            const parsed = parseCityName(feature);
            return {
              id: feature.id,
              name: parsed.city,
              displayName: parsed.city,
              state: parsed.state,
              country: parsed.country,
              lat: feature.center[1],
              lng: feature.center[0],
              zoom: 12,
            };
          }
        );

        const combined = [...presetMatches];
        mapboxResults.forEach((result) => {
          if (!combined.some((loc) => loc.name === result.name && loc.state === result.state)) {
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchLocation(value), 300);
  };

  const handleSelectLocation = (location: LocationData) => {
    setSelectedLocation(location);
    setSearchQuery(location.displayName);
    setShowDropdown(false);
    // Set default text values from location
    setCityName(location.name);
    setStateName(location.state || location.country || "");
    setDetailText(formatCoordinates(location.lat, location.lng));
  };

  // Download handler
  const handleDownload = useCallback(async (paid: boolean) => {
    if (!selectedLocation) return;
    setIsDownloading(true);

    try {
      const response = await fetch("/api/generate-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          center: [selectedLocation.lng, selectedLocation.lat],
          zoom: selectedLocation.zoom,
          themeId: selectedTheme.id,
          cityName: cityName || selectedLocation.name,
          stateName: stateName,
          coordinates: detailLineType === "none" ? "" : detailText,
          detailLineType,
          paid,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      const link = document.createElement("a");
      link.download = `mapmarked-${(cityName || selectedLocation.name).toLowerCase().replace(/\s+/g, "-")}-${selectedTheme.id}-${selectedSize.id}.jpg`;
      link.href = data.imageDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to generate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [selectedLocation, selectedTheme, selectedSize, cityName, stateName, detailText, detailLineType]);

  const handleCheckout = async (priceType: "single" | "subscription") => {
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType, returnUrl: window.location.href }),
      });
      if (!response.ok) throw new Error("Failed to create checkout");
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout.");
    }
  };

  const scrollToTool = () => {
    toolSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const mapCenter: [number, number] = selectedLocation
    ? [selectedLocation.lng, selectedLocation.lat]
    : [-74.006, 40.7128];
  const mapZoom = selectedLocation?.zoom ?? 12;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-center relative">
          <p className="font-medium">
            {paymentType === "subscription"
              ? "Welcome! You now have unlimited watermark-free downloads."
              : "Payment successful! Download your watermark-free map below."}
          </p>
          <button onClick={() => setShowSuccessBanner(false)} className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Create Stunning Map Art
              <br />
              <span className="text-neutral-400">in Seconds</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-8">
              Print-ready custom maps of any place on Earth. Perfect for wall art, gifts, Etsy shops, and closing gifts.
            </p>
            <button
              onClick={scrollToTool}
              className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-neutral-200 transition-colors"
            >
              Start Creating
            </button>
          </div>

          {/* Example Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {HERO_EXAMPLES.map((example) => {
              const theme = (themes as Theme[]).find((t) => t.id === example.theme) || (themes as Theme[])[0];
              return (
                <div
                  key={example.city}
                  className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer"
                  style={{ backgroundColor: theme.colors.bg }}
                  onClick={() => {
                    const loc = {
                      id: example.city,
                      name: example.city,
                      displayName: example.city,
                      state: example.state,
                      lat: example.lat,
                      lng: example.lng,
                      zoom: 12,
                    };
                    setSelectedLocation(loc);
                    setSelectedTheme(theme);
                    setSearchQuery(example.city);
                    setCityName(example.city);
                    setStateName(example.state);
                    setDetailText(formatCoordinates(example.lat, example.lng));
                    scrollToTool();
                  }}
                >
                  <div className="absolute inset-0 opacity-30">
                    <svg className="w-full h-full" viewBox="0 0 100 133">
                      <g stroke={theme.colors.text} strokeWidth="0.5" fill="none" opacity="0.6">
                        <line x1="20" y1="0" x2="20" y2="133" />
                        <line x1="50" y1="0" x2="50" y2="133" />
                        <line x1="80" y1="0" x2="80" y2="133" />
                        <line x1="0" y1="30" x2="100" y2="30" />
                        <line x1="0" y1="66" x2="100" y2="66" />
                        <line x1="0" y1="100" x2="100" y2="100" />
                      </g>
                    </svg>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: theme.colors.text }}>
                      {example.city.split("").join(" ")}
                    </p>
                    <p className="text-[10px] tracking-wider uppercase mt-1 opacity-70" style={{ color: theme.colors.text }}>
                      {example.state}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-sm font-medium" style={{ color: theme.colors.text }}>Try this style</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section ref={toolSectionRef} className="py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Controls */}
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">City or Address</label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search any location..."
                    className="w-full px-4 py-3.5 pl-12 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
                    </div>
                  )}

                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                      {searchResults.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleSelectLocation(location)}
                          className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors flex items-center gap-3"
                        >
                          <svg className="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="text-white">
                            {location.displayName}
                            {location.state && <span className="text-neutral-500">, {location.state}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 p-1 bg-neutral-900 rounded-lg">
                {(["style", "text", "points"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors capitalize ${
                      activeTab === tab
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Style Tab */}
              {activeTab === "style" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {(themes as Theme[]).map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme)}
                        className={`aspect-[3/4] rounded-lg overflow-hidden transition-all relative ${
                          selectedTheme.id === theme.id
                            ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: theme.colors.bg }}
                      >
                        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 30 40">
                          <g stroke={theme.colors.text} strokeWidth="0.5" fill="none">
                            <line x1="10" y1="0" x2="10" y2="40" />
                            <line x1="20" y1="0" x2="20" y2="40" />
                            <line x1="0" y1="15" x2="30" y2="15" />
                            <line x1="0" y1="30" x2="30" y2="30" />
                          </g>
                        </svg>
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                          <span className="text-[6px] uppercase tracking-wider font-medium" style={{ color: theme.colors.text }}>
                            {theme.id}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500">{selectedTheme.name}</p>

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Size</label>
                    <select
                      value={selectedSize.id}
                      onChange={(e) => {
                        const size = PRINT_SIZES.find((s) => s.id === e.target.value);
                        if (size) setSelectedSize(size);
                      }}
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-neutral-600 transition-colors cursor-pointer"
                    >
                      {PRINT_SIZES.map((size) => (
                        <option key={size.id} value={size.id}>{size.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Text Tab */}
              {activeTab === "text" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">City Name</label>
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      placeholder="City name..."
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">State / Country</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="State or country..."
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Detail Line</label>
                    <div className="flex gap-2 mb-2">
                      {(["coordinates", "none"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setDetailLineType(type)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors capitalize ${
                            detailLineType === type
                              ? "bg-white text-black"
                              : "bg-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          {type === "none" ? "Hide" : type}
                        </button>
                      ))}
                    </div>
                    {detailLineType !== "none" && (
                      <input
                        type="text"
                        value={detailText}
                        onChange={(e) => setDetailText(e.target.value)}
                        placeholder="Coordinates or custom text..."
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Points Tab */}
              {activeTab === "points" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div>
                      <p className="font-medium">Center Marker</p>
                      <p className="text-sm text-neutral-500">Show a pin at the map center</p>
                    </div>
                    <button
                      onClick={() => setShowMarker(!showMarker)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        showMarker ? "bg-white" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                          showMarker ? "translate-x-7 bg-neutral-900" : "translate-x-1 bg-neutral-400"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-neutral-500">
                    The marker will appear at the center of the map. Use &quot;Adjust position&quot; below the preview to fine-tune the location.
                  </p>
                </div>
              )}

              {/* Download Button */}
              <div className="pt-4">
                <button
                  onClick={() => handleDownload(isPaid)}
                  disabled={!selectedLocation || isDownloading}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                    selectedLocation && !isDownloading
                      ? isPaid
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-white hover:bg-neutral-100 text-black"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Print-Ready Map
                    </>
                  )}
                </button>

                {!isPaid && (
                  <p className="text-center text-sm text-neutral-500 mt-3">
                    Free downloads include watermark.{" "}
                    <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="text-white underline">
                      Remove watermark
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Map Preview */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              {selectedLocation ? (
                <MapPreview
                  ref={mapPreviewRef}
                  theme={selectedTheme}
                  center={mapCenter}
                  zoom={mapZoom}
                  cityName={cityName || selectedLocation.name}
                  stateName={stateName}
                  detailText={detailText}
                  detailLineType={detailLineType}
                  showSafeZone={false}
                  showMarker={showMarker}
                  aspectRatio={selectedSize.aspectRatio}
                />
              ) : (
                <div
                  className="w-full rounded-xl flex items-center justify-center border border-neutral-800 transition-all duration-300"
                  style={{ backgroundColor: selectedTheme.colors.bg, aspectRatio: selectedSize.aspectRatio }}
                >
                  <div className="text-center px-8">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: selectedTheme.colors.text }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-sm opacity-40" style={{ color: selectedTheme.colors.text }}>
                      Search for a location to preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-neutral-400 text-center mb-12">Remove the watermark and get clean, print-ready files</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <p className="text-3xl font-bold mb-1">$0</p>
              <p className="text-sm text-neutral-500 mb-6">Watermarked</p>
              <ul className="space-y-3 text-sm text-neutral-400 mb-6">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Unlimited previews
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  300 DPI resolution
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="text-neutral-600">Includes watermark</span>
                </li>
              </ul>
              <button
                onClick={() => selectedLocation && handleDownload(false)}
                disabled={!selectedLocation}
                className="w-full py-3 rounded-xl font-medium border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download Free
              </button>
            </div>

            <div className="bg-neutral-900 border-2 border-white rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-xs font-semibold rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold mb-2">Single Download</h3>
              <p className="text-3xl font-bold mb-1">$5</p>
              <p className="text-sm text-neutral-500 mb-6">One-time</p>
              <ul className="space-y-3 text-sm text-neutral-400 mb-6">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  No watermark
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  300 DPI print-ready
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Commercial use OK
                </li>
              </ul>
              <button
                onClick={() => handleCheckout("single")}
                className="w-full py-3 rounded-xl font-semibold bg-white text-black hover:bg-neutral-200 transition-colors"
              >
                Buy for $5
              </button>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">Unlimited</h3>
              <p className="text-3xl font-bold mb-1">$10<span className="text-lg font-normal text-neutral-500">/mo</span></p>
              <p className="text-sm text-neutral-500 mb-6">Cancel anytime</p>
              <ul className="space-y-3 text-sm text-neutral-400 mb-6">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Unlimited downloads
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  All styles included
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Perfect for Etsy sellers
                </li>
              </ul>
              <button
                onClick={() => handleCheckout("subscription")}
                className="w-full py-3 rounded-xl font-medium border border-neutral-700 text-white hover:bg-neutral-800 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <p>
              Print your map anywhere — we recommend{" "}
              <a href="https://www.printful.com/a/mapmarked" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                Printful
              </a>
            </p>
            <p>© {new Date().getFullYear()} MapMarked. Map data © Mapbox © OpenStreetMap.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}