export const PRODUCT = {
  size: '18" × 24"',
  width: 18,
  height: 24,
  depth: 1.25,
  price: 94.0,
  currency: "USD",
  shippingText: "Includes Free Shipping",
  description: 'Our Signature Size: 18" × 24" Gallery Wrap (1.25" Depth)',
} as const;

export const PRINT_SPECS = {
  dpi: 300,
  widthPx: 5400, // 18 * 300
  heightPx: 7200, // 24 * 300
  safeZoneInches: 1.5,
  safeZonePx: 450, // 1.5 / 18 * 5400 or 1.5 / 24 * 7200
} as const;

export const MATERIALS = {
  frame: "Hand-Glued Solid Wood Bars",
  frameDescription: '1.25" depth for a substantial gallery feel',
  canvas: "Acid-Free Poly-Cotton Canvas",
  canvasDescription: "Ensures long-term durability and color vibrance",
  inks: "Fade-Resistant Inks",
  inksDescription: "High-resolution output for sharp architectural detail",
} as const;
