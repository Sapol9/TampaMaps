"use client";

import { useState } from "react";
import locations from "@/data/locations.json";
import styles from "@/data/styles.json";
import HeroSection from "@/components/HeroSection";
import ProductInfo from "@/components/ProductInfo";
import ProductDetails from "@/components/ProductDetails";

// Get Tampa location
const tampa = locations.tampa;

export default function Home() {
  const [activeMood, setActiveMood] = useState<string>("Technical");
  const [activeStyle, setActiveStyle] = useState(styles[0]);
  const [showSafeZone, setShowSafeZone] = useState(false);

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log("Add to cart:", activeStyle.name);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Hero Section - Map + Style Navigation */}
      <HeroSection
        styleUrl={activeStyle.mapboxStyle}
        center={[tampa.lng, tampa.lat]}
        zoom={tampa.zoom}
        showSafeZone={showSafeZone}
        onToggleSafeZone={() => setShowSafeZone(!showSafeZone)}
        activeMood={activeMood}
        activeStyle={activeStyle}
        onMoodChange={setActiveMood}
        onStyleChange={setActiveStyle}
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
