# MapMarked - Project Overview

> SaaS Map Art Generator

## Project Summary

**MapMarked** is a SaaS platform that lets users generate print-ready custom map art of any location on Earth. Users search for a city or address, choose a style, and download high-resolution artwork suitable for printing at home or through services like Printful.

- **Website**: mapmarked.com
- **Product**: Digital map art downloads (JPG, 300 DPI)
- **Pricing**: Free (watermarked), $5 single download, $10/month unlimited
- **Rendering**: External render server using Mapbox Static API + Sharp

---

## Business Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Unlimited previews, watermarked downloads, 300 DPI |
| Single | $5 | One watermark-free download, commercial use OK |
| Unlimited | $10/mo | Unlimited watermark-free downloads, all styles |

**Target Users**:
- Etsy sellers creating custom map prints
- Real estate agents making closing gifts
- Individuals wanting personalized wall art
- Gift givers for weddings, anniversaries, hometowns

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 |
| Styling | Tailwind CSS |
| Map Preview | Mapbox GL JS (client-side) |
| Map Rendering | Mapbox Static API + Sharp (server-side) |
| Payments | Stripe Checkout |
| Hosting | Vercel |
| Render Server | Render.com (Docker/Node.js) |

---

## Architecture

### Frontend (TampaMaps repo on Vercel)

```
/src
├── /app
│   ├── page.tsx              # Single-page app (hero, tool, pricing)
│   ├── layout.tsx            # Root layout with metadata
│   ├── sitemap.ts            # Dynamic sitemap
│   └── /api
│       ├── create-checkout/  # Stripe checkout sessions
│       └── generate-print/   # Proxy to render server
├── /components
│   ├── MapPreview.tsx        # Live Mapbox GL JS preview
│   ├── RenderingOverlay.tsx  # Loading state overlay
│   └── SafeZoneOverlay.tsx   # Print safe zone visualization
├── /data
│   ├── locations.json        # Preset city coordinates
│   └── themes.json           # 5 map style themes
├── /lib
│   └── /mapbox               # Map styling utilities
└── /config
    └── site.ts               # Site configuration
```

### Render Server (mapmarked-render-server on Render.com)

```
/src
├── index.js                  # Express server with job queue
└── /services
    └── renderer.js           # Mapbox Static API + Sharp compositing
```

---

## Map Styles (5 Themes)

| ID | Name | Description |
|----|------|-------------|
| obsidian | The Obsidian | Dark charcoal with white roads on black water |
| cobalt | The Cobalt | Deep Prussian blue with cyan-tinted roads |
| parchment | The Parchment | Light cream background with dark ink roads |
| coastal | The Coastal | Soft teals with sandy warm tones |
| copper | The Copper | Dark gunmetal with warm copper roads |

---

## Print Specifications

| Attribute | Value |
|-----------|-------|
| Resolution | 300 DPI |
| Output Size | 5400 × 7200 px (18" × 24") |
| Format | JPEG (quality 95) |
| Safe Zone | 1.5" (6.25% vertical, 8.33% horizontal) |

### Size Options (UI only - all render at same resolution)

- 12" × 16"
- 16" × 20"
- 18" × 24"

---

## Page Layout

### Single Page Structure

1. **Hero Section**
   - Headline: "Create Stunning Map Art in Seconds"
   - Subtitle: "Print-ready custom maps... Perfect for wall art, gifts, Etsy shops, and closing gifts."
   - 4 example map cards (clickable to try style)
   - CTA button scrolls to tool

2. **Tool Section** (inline, no pages)
   - City/address search bar (Mapbox Geocoding)
   - Live Mapbox GL JS map preview
   - Style picker: 5 thumbnail cards
   - Size dropdown
   - Download button: "Download Print-Ready Map"
   - Watermark notice with link to pricing

3. **Pricing Section**
   - 3-column layout: Free, $5 Single, $10/mo Unlimited
   - Feature comparison
   - Stripe checkout buttons

4. **Footer**
   - Printful affiliate recommendation
   - Copyright and attribution

---

## Payment Flow

1. User clicks "$5" or "$10/mo" button
2. Frontend calls `/api/create-checkout` with price type
3. API creates Stripe Checkout session
4. User redirected to Stripe
5. On success, redirected back with `?paid=true`
6. Frontend shows success banner
7. Download button triggers watermark-free render

---

## Render Flow

1. User clicks "Download Print-Ready Map"
2. Frontend calls `/api/generate-print` with map params
3. API proxies to render server with auth secret
4. Render server:
   - Fetches map from Mapbox Static API (1280×1280 @2x)
   - Scales to 5400×7200 using Sharp
   - Creates SVG text overlay (city, state, coordinates)
   - Composites SVG onto map
   - Adds watermark if `paid: false`
   - Returns base64 JPEG
5. Frontend downloads as JPG file

---

## Environment Variables

### Frontend (Vercel)

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
STRIPE_SECRET_KEY=sk_xxx
RENDER_SERVER_URL=https://mapmarked-render-server.onrender.com
RENDER_SECRET=xxx
```

### Render Server (Render.com)

```
MAPBOX_ACCESS_TOKEN=pk.xxx
RENDER_SECRET=xxx
```

---

## Deployment

| Service | URL | Purpose |
|---------|-----|---------|
| Vercel | mapmarked.com | Frontend + API |
| Render.com | mapmarked-render-server.onrender.com | Image rendering |

---

## Future Enhancements

- [ ] Custom text options (change city/state names)
- [ ] Address-based focus point
- [ ] Additional map styles
- [ ] Canvas print fulfillment (Printful integration)
- [ ] User accounts with download history
- [ ] Bulk download for subscribers