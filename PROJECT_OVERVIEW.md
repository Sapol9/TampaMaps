# Tampa Bay Maps - Project Overview

> Premium minimalist map art for the Tampa Bay area

## Project Summary

**Tampa Bay Maps** is a single-product e-commerce platform selling high-quality, minimalist map canvas prints of Tampa Bay. The site offers 17 distinct map styles organized by mood, all rendered at gallery-quality resolution using Mapbox GL JS.

- **Website**: tampabaymaps.com (with tbmaps.com redirect)
- **Product**: 18" × 24" Gallery Wrapped Canvas
- **Price**: $94.00 (includes free shipping)
- **Fulfillment**: Printful

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js |
| Styling | Tailwind CSS |
| Map Engine | Mapbox GL JS |
| Hosting | Vercel or Cloudflare Pages |
| Fulfillment | Printful API |

**Reference Implementation**: [maptoposter](https://github.com/originalankur/maptoposter) - for map rendering and high-resolution export logic

---

## Architecture

### Directory Structure

```
/TampaMaps
├── /data
│   ├── locations.json      # City coordinates, zoom levels
│   └── styles.json         # 17 map styles with mood tags
├── /components
├── /pages
│   └── /shop
│       └── [city].js       # Dynamic city routes
├── /lib
│   └── mapbox/             # Map engine, layer scrubbing, export
├── /config
│   └── printful.js         # Product ID mappings
└── /public
```

### Data-Driven Design

All configuration is externalized to JSON files to prevent hard-coding:

**locations.json**
```json
{
  "tampa": {
    "name": "Tampa",
    "lat": 27.9506,
    "lng": -82.4572,
    "zoom": 12
  }
}
```

**styles.json**
```json
[
  { "id": "noir", "name": "Noir", "moodTag": "Technical", "mapboxStyle": "..." },
  { "id": "blueprint", "name": "Blueprint", "moodTag": "Technical", "mapboxStyle": "..." },
  { "id": "autumn", "name": "Autumn", "moodTag": "Elemental", "mapboxStyle": "..." }
]
```

---

## Product Specifications

### Canvas Details

| Attribute | Value |
|-----------|-------|
| Size | 18" × 24" |
| Frame Depth | 1.25" (gallery wrap) |
| Frame Material | Hand-glued solid wood bars |
| Canvas | Acid-free poly-cotton |
| Inks | Fade-resistant, archival quality |

### Print Resolution

| Dimension | Calculation | Pixels |
|-----------|-------------|--------|
| Width | 18" × 300 DPI | 5,400 px |
| Height | 24" × 300 DPI | 7,200 px |
| **Total Output** | | **5400 × 7200 px** |

### Safe Zone

A **1.5-inch safe zone** margin accounts for the 1.25" gallery wrap depth. This overlay is displayed in the UI preview so customers understand where the wrap occurs.

---

## Map Engine

### Layer Scrubbing ("Blue Dot Fix")

To achieve a clean, architectural aesthetic, the following Mapbox layers are programmatically hidden on initialization:

| Layer ID | Purpose |
|----------|---------|
| `poi-label` | Removes businesses, parks, points of interest |
| `transit-label` | Removes bus, rail, station icons |
| `airport-label` | Removes runway and airport markers |

**Implementation**: Use `map.setLayoutProperty(layerId, 'visibility', 'none')` on map load and style change events.

### High-Resolution Export

- Output: PNG at 5400 × 7200 pixels
- Handle `devicePixelRatio` correctly per maptoposter implementation
- Ensure artifact-free, sharp output for large-format printing

### Style Persistence

When users switch between styles:
1. Coordinates remain locked to `locations.json` values
2. Zoom level persists
3. Layer scrubbing re-applies automatically

---

## Map Styles (17 Total)

Organized into three mood-based categories:

### Technical & Noir
- Noir
- Blueprint
- Slate
- Charcoal
- *(additional styles TBD)*

### Elemental & Warm
- Autumn
- Copper Patina
- Gradient Rust
- Driftwood
- *(additional styles TBD)*

### Modern & Bold
- Neon Cyberpunk
- Contrast Zones
- Japanese Ink
- Monochrome Blue
- *(additional styles TBD)*

---

## Storefront UI

### Design Philosophy

- **Minimalist, Noir-inspired aesthetic**
- Clean typography
- Ample white space
- Subtle high-contrast accents
- Mobile-first (optimized for social media traffic)

### Page Layout

1. **Hero Section**: Full-width interactive Mapbox preview
2. **Style Navigation**: Tab-based mood selector
   - Tab 1: Technical & Noir
   - Tab 2: Elemental & Warm
   - Tab 3: Modern & Bold
3. **Product Info**:
   - "Our Signature Size: 18" × 24" Gallery Wrap (1.25" Depth)"
   - Price: $94.00
   - "Free Shipping" badge
4. **Product Details**: Material specs, quality highlights
5. **Safe Zone Toggle**: Visual overlay for wrap preview
6. **Footer**: Trademark & Affiliation Disclaimer

### Single-Product Constraint

No size dropdown. The UI is hard-coded for the 18" × 24" canvas. Descriptive text replaces selection UI.

---

## Deployment

### Hosting

- **Primary**: Vercel or Cloudflare Pages
- **Build**: Optimized Next.js production build
- **Environment Variables**: Mapbox tokens, Printful API keys

### Domain Configuration

| Domain | Purpose |
|--------|---------|
| tampabaymaps.com | Primary canonical URL |
| tbmaps.com | 301 redirect to primary |

### SEO

Dynamic metadata for all pages:
```html
<title>Tampa Bay Maps | Premium 18x24 Minimalist Noir Canvas Art</title>
<meta name="description" content="..." />
```

---

## Expansion Framework

### City Switcher Architecture

The `locations.json` file drives automatic route generation:

- Adding a new city entry creates a new URL slug automatically
- Example: Adding `"miami": {...}` generates `/shop/miami`
- No additional coding required for new locations

### Printful Integration

Centralized product ID configuration in `/config/printful.js`:
- Map 18" × 24" Gallery Wrap to Printful variant ID
- Architecture supports future size/product additions

---

## Legal

### Trademark & Affiliation Disclaimer

The footer must include a disclaimer stating:

> Tampa Bay Maps is an independent artistic venture. We are not affiliated with, endorsed by, or connected to any professional sports leagues, collegiate athletic programs, universities, or local government agencies. All map artwork is original and created for decorative purposes.

---

## 2026 Launch Checklist

| Action | Objective | Status |
|--------|-----------|--------|
| Verify Mapbox Token | Ensure public token is restricted to your domains | ☐ |
| Test Mobile UI | Verify "Mood" tabs are easy to tap on smartphone | ☐ |
| Check High-Res Output | Download sample map, verify exactly 5400×7200px | ☐ |
| Confirm Disclaimer | Ensure trademark non-affiliation text is in footer | ☐ |
| Test 301 Redirect | Verify tbmaps.com redirects to tampabaymaps.com | ☐ |
| Printful Test Order | Place test order to verify fulfillment flow | ☐ |
| Safe Zone Accuracy | Verify 1.5" margin is mathematically correct | ☐ |
| Performance Audit | Test mobile load times for Tampa users | ☐ |

---

## Development Phases

### Phase 1: Foundation & Modular Architecture
- Initialize Next.js + Tailwind CSS
- Create `/data` directory with `locations.json` and `styles.json`
- Define global constants (size, price, resolution)
- Scaffold home page and style navigation
- Add legal footer

### Phase 2: Map Engine & High-Resolution Rendering
- Integrate Mapbox GL JS (reference: maptoposter)
- Implement layer scrubbing for clean aesthetic
- Build high-resolution PNG export (5400 × 7200px)
- Add safe zone visualization overlay
- Implement style switching with coordinate persistence

### Phase 3: Storefront UI & Navigation
- Build hero section with interactive map preview
- Implement mood-based tab navigation
- Create product details section
- Add pricing and free shipping badge
- Optimize for mobile

### Phase 4: Deployment & Expansion
- Configure Vercel/Cloudflare deployment
- Set up domain routing and redirects
- Implement SEO metadata
- Build city switcher foundation
- Configure Printful API mapping
- Final QA and launch

---

## Resources

- **Reference Repo**: https://github.com/originalankur/maptoposter
- **Mapbox GL JS Docs**: https://docs.mapbox.com/mapbox-gl-js/
- **Printful API**: https://www.printful.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
