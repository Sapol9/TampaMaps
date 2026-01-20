# Tampa Bay Maps - Project Plan

> Step-by-step implementation guide

---

## Phase 1: Foundation & Modular Architecture

### 1.1 Project Initialization

- [ ] Initialize Next.js project with TypeScript
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
  ```
- [ ] Verify Tailwind CSS is configured correctly
- [ ] Clean up boilerplate files (remove default Next.js content)

### 1.2 Data Directory Setup

- [ ] Create `/data` directory
- [ ] Create `locations.json`
  ```json
  {
    "tampa": {
      "id": "tampa",
      "name": "Tampa",
      "displayName": "Tampa Bay",
      "lat": 27.9506,
      "lng": -82.4572,
      "zoom": 12
    }
  }
  ```
- [ ] Create `styles.json` with all 17 map styles
  - Include `id`, `name`, `moodTag`, `mapboxStyle` URL for each
  - Mood tags: "Technical", "Elemental", "Modern"

### 1.3 Global Configuration

- [ ] Create `/config/product.ts`
  ```typescript
  export const PRODUCT = {
    size: '18" × 24"',
    width: 18,
    height: 24,
    depth: 1.25,
    price: 94.00,
    currency: 'USD',
    shippingText: 'Includes Free Shipping',
  };

  export const PRINT_SPECS = {
    dpi: 300,
    widthPx: 5400,  // 18 * 300
    heightPx: 7200, // 24 * 300
    safeZoneInches: 1.5,
  };
  ```
- [ ] Create `/config/site.ts` for site metadata

### 1.4 Environment Setup

- [ ] Create `.env.local` template
  ```
  NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
  PRINTFUL_API_KEY=your_key_here
  ```
- [ ] Add `.env.local` to `.gitignore`
- [ ] Create `.env.example` for documentation

### 1.5 Basic Page Structure

- [ ] Create home page layout (`/src/app/page.tsx`)
- [ ] Create basic header component
- [ ] Create footer component with trademark disclaimer
- [ ] Verify pages render correctly

**Phase 1 Deliverable**: Empty Next.js app with data files, config, and basic layout structure

---

## Phase 2: Map Engine & High-Resolution Rendering

### 2.1 Mapbox Setup

- [ ] Install Mapbox GL JS
  ```bash
  npm install mapbox-gl
  npm install --save-dev @types/mapbox-gl
  ```
- [ ] Review [maptoposter](https://github.com/originalankur/maptoposter) implementation
- [ ] Create `/lib/mapbox/MapEngine.ts` utility class

### 2.2 Layer Scrubbing Implementation

- [ ] Create `/lib/mapbox/layerScrubbing.ts`
  ```typescript
  const HIDDEN_LAYERS = [
    'poi-label',
    'transit-label',
    'airport-label',
  ];

  export function scrubLayers(map: mapboxgl.Map) {
    HIDDEN_LAYERS.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', 'none');
      }
    });
  }
  ```
- [ ] Hook scrubbing into map `load` event
- [ ] Hook scrubbing into style `change` event
- [ ] Test with multiple styles to verify POIs are hidden

### 2.3 Map Component

- [ ] Create `/components/MapPreview.tsx`
  - Accept style URL as prop
  - Accept coordinates from `locations.json`
  - Initialize with layer scrubbing
  - Handle style switching without coordinate change
- [ ] Add loading state while map initializes
- [ ] Handle Mapbox token errors gracefully

### 2.4 High-Resolution Export

- [ ] Create `/lib/mapbox/exportMap.ts`
  - Reference maptoposter's export logic
  - Configure for 5400 × 7200px output
  - Handle `devicePixelRatio` correctly
  - Return PNG blob/data URL
- [ ] Create export button component
- [ ] Test export produces correct dimensions
- [ ] Verify export quality (no artifacts, sharp lines)

### 2.5 Safe Zone Overlay

- [ ] Calculate safe zone in pixels
  ```
  1.5" / 18" * 5400px = 450px horizontal
  1.5" / 24" * 7200px = 450px vertical
  ```
- [ ] Create `/components/SafeZoneOverlay.tsx`
  - Semi-transparent border overlay
  - Toggleable visibility
- [ ] Add toggle button to UI

**Phase 2 Deliverable**: Working map that displays, switches styles, hides POIs, and exports at print resolution

---

## Phase 3: Storefront UI & Mood-Based Navigation

### 3.1 Design System Setup

- [ ] Define color palette in Tailwind config
  - Primary: Dark/noir tones
  - Accents: Subtle highlights
- [ ] Define typography scale
- [ ] Create spacing/layout constants

### 3.2 Style Tab Navigation

- [ ] Create `/components/StyleTabs.tsx`
  - Tab 1: "Technical & Noir"
  - Tab 2: "Elemental & Warm"
  - Tab 3: "Modern & Bold"
- [ ] Filter styles by `moodTag` from `styles.json`
- [ ] Display style thumbnails/names within each tab
- [ ] Wire tab selection to map style change
- [ ] Add active state styling

### 3.3 Hero Section

- [ ] Create `/components/HeroSection.tsx`
  - Full-width map preview
  - Style tabs below/beside map
  - Responsive layout (stack on mobile)
- [ ] Ensure map is interactive (pan/zoom for exploration)
- [ ] Lock to Tampa coordinates on style change

### 3.4 Product Information

- [ ] Create `/components/ProductInfo.tsx`
  - Size text: "Our Signature Size: 18" × 24" Gallery Wrap (1.25" Depth)"
  - Price: $94.00
  - Free shipping badge
  - Add to cart button (placeholder for now)
- [ ] Create `/components/ProductDetails.tsx`
  - Hand-glued solid wood bars
  - Acid-free poly-cotton canvas
  - Fade-resistant inks
  - Expandable/collapsible section

### 3.5 Safe Zone Toggle

- [ ] Add toggle switch to UI
- [ ] Label: "Show Print Safe Zone"
- [ ] Tooltip explaining gallery wrap

### 3.6 Footer Implementation

- [ ] Finalize footer with disclaimer
- [ ] Add any necessary links
- [ ] Ensure disclaimer text is complete

### 3.7 Mobile Optimization

- [ ] Test all components at mobile breakpoints
- [ ] Ensure tabs are tap-friendly (min 44px touch targets)
- [ ] Verify map is usable on touch devices
- [ ] Test on actual mobile device if possible

**Phase 3 Deliverable**: Complete storefront UI with style navigation, product info, and mobile support

---

## Phase 4: Deployment & Expansion Configuration

### 4.1 Dynamic Routing Setup

- [ ] Create `/src/app/shop/[city]/page.tsx`
- [ ] Generate static params from `locations.json`
- [ ] Redirect root to `/shop/tampa` or display Tampa by default
- [ ] Verify adding new city to JSON creates new route

### 4.2 Printful Configuration

- [ ] Create `/config/printful.ts`
  ```typescript
  export const PRINTFUL_PRODUCTS = {
    '18x24_gallery_wrap': {
      variantId: 'YOUR_VARIANT_ID',
      // ... other details
    },
  };
  ```
- [ ] Document how to find Printful variant IDs
- [ ] Stub out API integration (full implementation later)

### 4.3 SEO Implementation

- [ ] Configure metadata in `layout.tsx`
- [ ] Create dynamic metadata for city pages
- [ ] Add Open Graph tags
- [ ] Add Twitter card tags
- [ ] Create `robots.txt`
- [ ] Create `sitemap.xml` (or dynamic generation)

### 4.4 Domain & Hosting Setup

- [ ] Deploy to Vercel
  ```bash
  vercel
  ```
- [ ] Configure environment variables in Vercel dashboard
- [ ] Connect `tampabaymaps.com` domain
- [ ] Set up `tbmaps.com` redirect
- [ ] Verify HTTPS is working

### 4.5 Mapbox Token Security

- [ ] Restrict Mapbox token to production domains
  - tampabaymaps.com
  - tbmaps.com
  - localhost (for development)
- [ ] Verify token works only on allowed domains

### 4.6 Performance Optimization

- [ ] Run Lighthouse audit
- [ ] Optimize images (Next.js Image component)
- [ ] Verify map loads efficiently
- [ ] Check bundle size
- [ ] Enable caching headers

**Phase 4 Deliverable**: Production-deployed site with SEO, security, and expansion-ready architecture

---

## Phase 5: Final QA & Launch

### 5.1 Functional Testing

- [ ] Test all 17 style switches
- [ ] Verify POI scrubbing on each style
- [ ] Test high-res export (verify 5400 × 7200px)
- [ ] Test safe zone overlay accuracy
- [ ] Test on Chrome, Safari, Firefox
- [ ] Test on iOS Safari, Android Chrome

### 5.2 Visual QA

- [ ] Review desktop layout
- [ ] Review tablet layout
- [ ] Review mobile layout
- [ ] Check all text is readable
- [ ] Verify color contrast meets accessibility standards

### 5.3 Content Review

- [ ] Proofread all copy
- [ ] Verify pricing is correct
- [ ] Verify disclaimer text is complete and accurate
- [ ] Check all links work

### 5.4 Launch Checklist

| Task | Status |
|------|--------|
| Mapbox token restricted to domains | ☐ |
| Mobile UI tested on real devices | ☐ |
| High-res export verified (5400×7200px) | ☐ |
| Trademark disclaimer in footer | ☐ |
| tbmaps.com redirect working | ☐ |
| SSL certificate active | ☐ |
| Analytics installed (if desired) | ☐ |
| Error monitoring setup (if desired) | ☐ |

### 5.5 Soft Launch

- [ ] Deploy final build
- [ ] Test purchase flow (Printful test order)
- [ ] Monitor for errors
- [ ] Gather initial feedback

---

## Future Enhancements (Post-Launch)

### Expansion
- [ ] Add additional cities to `locations.json`
- [ ] Add size variants (if demand exists)
- [ ] Build city selector UI

### Features
- [ ] Shopping cart functionality
- [ ] Checkout with Printful integration
- [ ] User accounts (optional)
- [ ] Email capture / newsletter

### Marketing
- [ ] Social media preview images
- [ ] Local Tampa SEO optimization
- [ ] Instagram/Facebook integration

---

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `/data/locations.json` | City coordinates and zoom levels |
| `/data/styles.json` | Map style definitions with mood tags |
| `/config/product.ts` | Product specs, pricing, dimensions |
| `/config/printful.ts` | Printful product ID mappings |
| `/lib/mapbox/layerScrubbing.ts` | POI removal logic |
| `/lib/mapbox/exportMap.ts` | High-res PNG export |
| `/components/MapPreview.tsx` | Main map component |
| `/components/StyleTabs.tsx` | Mood-based navigation |

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Deploy
vercel --prod

# Check types
npm run type-check
```

### Important Numbers

| Metric | Value |
|--------|-------|
| Print size | 18" × 24" |
| Resolution | 300 DPI |
| Export dimensions | 5400 × 7200 px |
| Safe zone | 1.5" (450px) |
| Frame depth | 1.25" |
| Price | $94.00 |

---

## Timeline Estimate

| Phase | Description |
|-------|-------------|
| Phase 1 | Foundation & Architecture |
| Phase 2 | Map Engine & Rendering |
| Phase 3 | Storefront UI |
| Phase 4 | Deployment & Config |
| Phase 5 | QA & Launch |

*Work at your own pace through each phase. Each phase builds on the previous one.*
