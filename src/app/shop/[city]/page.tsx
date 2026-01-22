"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import locations from "@/data/locations.json";
import themes from "@/data/themes.json";
import HeroSection from "@/components/HeroSection";
import ProductInfo from "@/components/ProductInfo";
import ProductDetails from "@/components/ProductDetails";
import type { Theme } from "@/lib/mapbox/applyTheme";

type LocationKey = keyof typeof locations;

// Cast themes to Theme type
const typedThemes = themes as Theme[];

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export default function CityPage({ params }: CityPageProps) {
  const [activeMood, setActiveMood] = useState<string>("Technical");
  const [activeTheme, setActiveTheme] = useState<Theme>(typedThemes[0]);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [resolvedCity, setResolvedCity] = useState<string | null>(null);

  // Resolve params
  if (resolvedCity === null) {
    params.then((p) => setResolvedCity(p.city));
    return null;
  }

  const cityKey = resolvedCity as LocationKey;
  const location = locations[cityKey];

  if (!location) {
    notFound();
  }

  const handleAddToCart = () => {
    console.log("Add to cart:", activeTheme.name, "for", location.displayName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* City Name */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-6">
        {location.displayName}
      </h1>

      {/* Hero Section - Map + Style Navigation */}
      <HeroSection
        theme={activeTheme}
        center={[location.lng, location.lat]}
        zoom={location.zoom}
        cityName={location.displayName}
        showSafeZone={showSafeZone}
        onToggleSafeZone={() => setShowSafeZone(!showSafeZone)}
        activeMood={activeMood}
        onMoodChange={setActiveMood}
        onThemeChange={setActiveTheme}
      />

      {/* Divider */}
      <div className="my-8 sm:my-12 border-t border-neutral-200 dark:border-neutral-800" />

      {/* Product Info */}
      <section className="mb-8">
        <ProductInfo onAddToCart={handleAddToCart} />
      </section>

      {/* Product Details (Expandable) */}
      <section className="mb-8">
        <ProductDetails />
      </section>
    </div>
  );
}
