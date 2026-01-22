"use client";

import { useState, useRef } from "react";
import themes from "@/data/themes.json";
import type { Theme } from "@/lib/mapbox/applyTheme";

// Builder components
import StepNavigation from "@/components/builder/StepNavigation";
import StepCity, { type LocationData } from "@/components/builder/StepCity";
import StepVibe from "@/components/builder/StepVibe";
import StepFocus, { type FocusPoint } from "@/components/builder/StepFocus";
import StepBranding from "@/components/builder/StepBranding";
import StepDetails, { type DetailLineType } from "@/components/builder/StepDetails";
import MapPreview, { type MapPreviewHandle } from "@/components/MapPreview";
import ProductInfo from "@/components/ProductInfo";
import ProductDetails from "@/components/ProductDetails";
import Cart, { type CartItem } from "@/components/Cart";

// Default theme for preview before user selects one
const defaultTheme = (themes as Theme[])[0];

export default function Home() {
  // Builder step state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1: City selection
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Step 2: Vibe/Theme selection
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  // Step 3: Focus point
  const [focusPoint, setFocusPoint] = useState<FocusPoint | null>(null);

  // Step 4: Primary branding
  const [primaryText, setPrimaryText] = useState("");

  // Step 5: Detail line
  const [detailLineType, setDetailLineType] = useState<DetailLineType>("coordinates");

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

  const handleVibeNext = () => {
    if (selectedTheme) {
      completeStep(2);
      setCurrentStep(3);
    }
  };

  const handleFocusNext = () => {
    completeStep(3);
    setCurrentStep(4);
  };

  const handleBrandingNext = () => {
    if (primaryText.trim()) {
      completeStep(4);
      setCurrentStep(5);
    }
  };

  const handleComplete = () => {
    completeStep(5);
    // Stay on step 5 but show completion state
  };

  const handleAddToCart = () => {
    if (!selectedLocation || !selectedTheme) return;

    // Capture map thumbnail
    const thumbnail = mapPreviewRef.current?.captureImage() ?? undefined;

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
    // Go to last step and close cart
    setCurrentStep(5);
    setCompletedSteps([1, 2, 3, 4, 5]);
    setIsCartOpen(false);
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <span className="text-sm text-neutral-500">mapmarked.com</span>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Build Your Map
          </h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Navigation */}
        <StepNavigation
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Step content */}
          <div className="order-2 lg:order-1">
            {currentStep === 1 && (
              <StepCity
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
                onNext={handleCityNext}
              />
            )}

            {currentStep === 2 && (
              <StepVibe
                selectedMood={selectedMood}
                selectedTheme={selectedTheme}
                onMoodSelect={setSelectedMood}
                onThemeSelect={setSelectedTheme}
                onNext={handleVibeNext}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && selectedLocation && (
              <StepFocus
                centerLat={selectedLocation.lat}
                centerLng={selectedLocation.lng}
                focusPoint={focusPoint}
                onFocusPointChange={setFocusPoint}
                onNext={handleFocusNext}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && selectedLocation && (
              <StepBranding
                cityName={selectedLocation.name}
                primaryText={primaryText}
                onPrimaryTextChange={setPrimaryText}
                onNext={handleBrandingNext}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && selectedLocation && (
              <StepDetails
                lat={focusPoint?.lat ?? selectedLocation.lat}
                lng={focusPoint?.lng ?? selectedLocation.lng}
                address={focusPoint?.address}
                primaryText={primaryText || selectedLocation.name}
                detailLineType={detailLineType}
                onDetailLineTypeChange={setDetailLineType}
                onComplete={handleComplete}
                onBack={() => setCurrentStep(4)}
              />
            )}

            {/* Product info after completion */}
            {completedSteps.includes(5) && (
              <div className="mt-8 space-y-6">
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
                  <ProductInfo onAddToCart={handleAddToCart} />
                </div>
                <ProductDetails />
              </div>
            )}
          </div>

          {/* Right: Map preview */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-8 lg:self-start">
            {showMapPreview ? (
              <div className="max-w-md mx-auto lg:max-w-none">
                <MapPreview
                  ref={mapPreviewRef}
                  theme={previewTheme}
                  center={mapCenter}
                  zoom={mapZoom}
                  cityName={primaryText || selectedLocation.name}
                  stateName={selectedLocation.state || selectedLocation.country || ""}
                  focusPoint={focusPoint}
                  detailLineType={detailLineType}
                  showSafeZone={showSafeZone}
                  onToggleSafeZone={() => setShowSafeZone(!showSafeZone)}
                />
              </div>
            ) : (
              <div className="aspect-[3/4] w-full max-w-md mx-auto lg:max-w-none rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
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
                    Select a city and style to preview your map
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

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
