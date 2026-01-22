"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import themes from "@/data/themes.json";
import type { Theme } from "@/lib/mapbox/applyTheme";

// Builder components
import StepNavigation from "@/components/builder/StepNavigation";
import StepCity, { type LocationData } from "@/components/builder/StepCity";
import StepOrientation from "@/components/builder/StepOrientation";
import StepVibe from "@/components/builder/StepVibe";
import StepFocus, { type FocusPoint } from "@/components/builder/StepFocus";
import StepBranding from "@/components/builder/StepBranding";
import StepDetails, { type DetailLineType } from "@/components/builder/StepDetails";
import { type MapPreviewHandle, type Orientation } from "@/components/MapPreview";
import Cart, { type CartItem } from "@/components/Cart";

// New premium components
import Hero from "@/components/Hero";
import ProcessSteps from "@/components/ProcessSteps";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import ValueSidebar from "@/components/ValueSidebar";

// Lazy load MapPreview for better Core Web Vitals
const MapPreview = dynamic(() => import("@/components/MapPreview"), {
  ssr: false,
  loading: () => (
    <div className="aspect-[3/4] w-full rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-neutral-500">Loading map...</p>
      </div>
    </div>
  ),
});

// Default theme for preview before user selects one
const defaultTheme = (themes as Theme[])[0];

export default function Home() {
  // Hero state
  const [showBuilder, setShowBuilder] = useState(false);

  // Builder step state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1: City selection
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Step 2: Orientation
  const [orientation, setOrientation] = useState<Orientation>("portrait");

  // Step 3: Vibe/Theme selection
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  // Step 4: Focus point
  const [focusPoint, setFocusPoint] = useState<FocusPoint | null>(null);

  // Step 5: Primary branding
  const [primaryText, setPrimaryText] = useState("");

  // Step 6: Detail line
  const [detailLineType, setDetailLineType] = useState<DetailLineType>("coordinates");

  // Personal note for back of canvas
  const [personalNote, setPersonalNote] = useState("");

  // Map preview state
  const [showSafeZone, setShowSafeZone] = useState(true);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Map preview ref for capturing thumbnails
  const mapPreviewRef = useRef<MapPreviewHandle>(null);

  // Navigation handlers
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const completeStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  // Step completion handlers
  const handleCityNext = () => {
    if (selectedLocation) {
      setPrimaryText(selectedLocation.name);
      completeStep(1);
      setCurrentStep(2);
    }
  };

  const handleOrientationNext = () => {
    completeStep(2);
    setCurrentStep(3);
  };

  const handleVibeNext = () => {
    if (selectedTheme) {
      completeStep(3);
      setCurrentStep(4);
    }
  };

  const handleFocusNext = () => {
    completeStep(4);
    setCurrentStep(5);
  };

  const handleBrandingNext = () => {
    if (primaryText.trim()) {
      completeStep(5);
      setCurrentStep(6);
    }
  };

  const handleComplete = () => {
    completeStep(6);
    // Stay on step 6 but show completion state
  };

  const handleAddToCart = async () => {
    if (!selectedLocation || !selectedTheme) return;

    // Capture map thumbnail (now async with html2canvas)
    const thumbnail = await mapPreviewRef.current?.captureImage() ?? undefined;

    const newItem: CartItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      cityName: selectedLocation.name,
      stateName: selectedLocation.state || selectedLocation.country || "",
      theme: selectedTheme,
      primaryText: primaryText || selectedLocation.name,
      detailLineType,
      focusAddress: focusPoint?.address,
      lat: focusPoint?.lat ?? selectedLocation.lat,
      lng: focusPoint?.lng ?? selectedLocation.lng,
      orientation,
      personalNote: personalNote || undefined,
      price: 94.0,
      thumbnail,
    };

    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    // TODO: Implement checkout with Stripe or similar
    alert("Checkout functionality coming soon!");
  };

  const handleReviewItem = (item: CartItem) => {
    // Load the item's settings back into the builder for review
    setSelectedLocation({
      id: item.id,
      name: item.cityName,
      displayName: `${item.cityName}, ${item.stateName}`,
      state: item.stateName,
      country: "",
      lat: item.lat,
      lng: item.lng,
      zoom: 12,
    });
    setOrientation(item.orientation);
    setSelectedTheme(item.theme);
    setPrimaryText(item.primaryText);
    setDetailLineType(item.detailLineType);
    if (item.focusAddress) {
      setFocusPoint({
        lat: item.lat,
        lng: item.lng,
        address: item.focusAddress,
      });
    } else {
      setFocusPoint(null);
    }
    setPersonalNote(item.personalNote || "");
    // Go to last step and close cart
    setCurrentStep(6);
    setCompletedSteps([1, 2, 3, 4, 5, 6]);
    setIsCartOpen(false);
    setShowBuilder(true);
  };

  const handleGetStarted = () => {
    setShowBuilder(true);
  };

  // Get current map center
  const mapCenter: [number, number] = selectedLocation
    ? [selectedLocation.lng, selectedLocation.lat]
    : [-82.4572, 27.9506]; // Default Tampa

  const mapZoom = selectedLocation?.zoom ?? 12;

  // Determine if we should show the map preview alongside steps
  // Show map as soon as city is selected, using default theme if none selected yet
  const showMapPreview = selectedLocation;
  const previewTheme = selectedTheme || defaultTheme;
  const isDesignComplete = completedSteps.includes(6);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-semibold text-neutral-900 dark:text-white">
            MapMarked
          </a>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - shown when builder is not active */}
        {!showBuilder && (
          <>
            <Hero onGetStarted={handleGetStarted} />
            <ProcessSteps />
            <Features />
          </>
        )}

        {/* Map Builder Section */}
        {showBuilder && (
          <section id="map-builder" className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-light text-neutral-900 dark:text-white">
                  Design Your <span className="font-semibold">Masterpiece</span>
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                  6 simple steps to create your custom architectural map art
                </p>
              </div>

              {/* Step Navigation */}
              <StepNavigation
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={goToStep}
              />

              {/* Main content area - 3 column on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Step content */}
                <div className="lg:col-span-5 order-2 lg:order-1">
                  {currentStep === 1 && (
                    <StepCity
                      selectedLocation={selectedLocation}
                      onLocationSelect={setSelectedLocation}
                      onNext={handleCityNext}
                    />
                  )}

                  {currentStep === 2 && (
                    <StepOrientation
                      selectedOrientation={orientation}
                      onOrientationSelect={setOrientation}
                      onNext={handleOrientationNext}
                      onBack={() => setCurrentStep(1)}
                    />
                  )}

                  {currentStep === 3 && (
                    <StepVibe
                      selectedMood={selectedMood}
                      selectedTheme={selectedTheme}
                      onMoodSelect={setSelectedMood}
                      onThemeSelect={setSelectedTheme}
                      onNext={handleVibeNext}
                      onBack={() => setCurrentStep(2)}
                    />
                  )}

                  {currentStep === 4 && selectedLocation && (
                    <StepFocus
                      centerLat={selectedLocation.lat}
                      centerLng={selectedLocation.lng}
                      focusPoint={focusPoint}
                      onFocusPointChange={setFocusPoint}
                      onNext={handleFocusNext}
                      onBack={() => setCurrentStep(3)}
                    />
                  )}

                  {currentStep === 5 && selectedLocation && (
                    <StepBranding
                      cityName={selectedLocation.name}
                      primaryText={primaryText}
                      onPrimaryTextChange={setPrimaryText}
                      onNext={handleBrandingNext}
                      onBack={() => setCurrentStep(4)}
                    />
                  )}

                  {currentStep === 6 && selectedLocation && (
                    <StepDetails
                      lat={focusPoint?.lat ?? selectedLocation.lat}
                      lng={focusPoint?.lng ?? selectedLocation.lng}
                      address={focusPoint?.address}
                      primaryText={primaryText || selectedLocation.name}
                      detailLineType={detailLineType}
                      onDetailLineTypeChange={setDetailLineType}
                      onComplete={handleComplete}
                      onBack={() => setCurrentStep(5)}
                    />
                  )}
                </div>

                {/* Center: Map preview */}
                <div className="lg:col-span-4 order-1 lg:order-2">
                  <div className="lg:sticky lg:top-24">
                    {showMapPreview ? (
                      <MapPreview
                        ref={mapPreviewRef}
                        theme={previewTheme}
                        center={mapCenter}
                        zoom={mapZoom}
                        cityName={primaryText || selectedLocation.name}
                        stateName={selectedLocation.state || selectedLocation.country || ""}
                        focusPoint={focusPoint}
                        detailLineType={detailLineType}
                        orientation={orientation}
                        showSafeZone={showSafeZone}
                        onToggleSafeZone={() => setShowSafeZone(!showSafeZone)}
                      />
                    ) : (
                      <div className="aspect-[3/4] w-full rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                        <div className="text-center px-8">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-neutral-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                              />
                            </svg>
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                            Select a city to preview your map
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Value Sidebar */}
                <div className="lg:col-span-3 order-3">
                  <div className="lg:sticky lg:top-24">
                    <ValueSidebar
                      price={94.0}
                      onAddToCart={handleAddToCart}
                      isComplete={isDesignComplete}
                      orientation={orientation}
                      personalNote={personalNote}
                      onPersonalNoteChange={setPersonalNote}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart */}
      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        onReviewItem={handleReviewItem}
      />
    </div>
  );
}
