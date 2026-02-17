# MapMarked - Project Plan

> SaaS Map Art Generator - Implementation Complete

---

## Current Status: MVP Live

The core product is complete and deployed:
- Single-page app with hero, tool, and pricing sections
- Live Mapbox GL JS preview
- Server-side rendering via external render server
- Stripe payment integration ($5 single, $10/mo subscription)
- Watermark system for free vs paid downloads

---

## Completed Features

### Phase 1: Foundation ✅

- [x] Next.js 16 + Tailwind CSS setup
- [x] Data files: `locations.json`, `themes.json`
- [x] Site configuration
- [x] Basic page structure

### Phase 2: Map Engine ✅

- [x] Mapbox GL JS integration for live preview
- [x] Custom style generation from theme colors
- [x] Layer scrubbing (hide POIs, labels)
- [x] External render server (Mapbox Static API + Sharp)
- [x] SVG text overlay compositing
- [x] Watermark system

### Phase 3: Storefront UI ✅

- [x] Hero section with example cards
- [x] City/address search with Mapbox Geocoding
- [x] Style picker (5 themes)
- [x] Size dropdown
- [x] Download button with loading state
- [x] Mobile-responsive design
- [x] Dark mode design

### Phase 4: Payments ✅

- [x] Stripe Checkout integration
- [x] Single download ($5) flow
- [x] Subscription ($10/mo) flow
- [x] Payment success handling
- [x] Conditional watermark based on payment status

### Phase 5: Deployment ✅

- [x] Vercel deployment
- [x] Render.com render server
- [x] Environment variables configured
- [x] Domain setup

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Browser  │────▶│  Vercel (Next.js) │────▶│  Render Server  │
│                 │     │                  │     │  (Docker/Sharp) │
│  - Mapbox GL JS │     │  - /api/generate │     │                 │
│  - Preview      │     │  - /api/checkout │     │  - Static API   │
│  - Stripe       │     │                  │     │  - SVG Overlay  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │     Stripe       │
                        │  (Payments)      │
                        └──────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main single-page app |
| `src/app/api/create-checkout/route.ts` | Stripe session creation |
| `src/app/api/generate-print/route.ts` | Render server proxy |
| `src/components/MapPreview.tsx` | Live map preview component |
| `src/data/themes.json` | 5 map style definitions |
| `src/data/locations.json` | Preset city coordinates |

---

## Render Server (Separate Repo)

**Repository**: mapmarked-render-server

| File | Purpose |
|------|---------|
| `src/index.js` | Express server, job queue |
| `src/services/renderer.js` | Mapbox Static API + Sharp |
| `Dockerfile` | Node.js + fonts for SVG |

---

## Environment Setup

### Local Development

```bash
# Clone repo
git clone https://github.com/Sapol9/TampaMaps.git
cd TampaMaps

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your keys to .env.local
# NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
# STRIPE_SECRET_KEY=sk_xxx
# RENDER_SERVER_URL=https://mapmarked-render-server.onrender.com
# RENDER_SECRET=xxx

# Run development server
npm run dev
```

### Production Deployment

**Vercel**:
1. Connect GitHub repo
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

**Render.com** (render server):
1. Connect mapmarked-render-server repo
2. Set MAPBOX_ACCESS_TOKEN and RENDER_SECRET
3. Deploy as Docker service

---

## Future Roadmap

### Near Term
- [ ] Custom text input (user-defined city/state names)
- [ ] Focus point option (center on specific address)
- [ ] Additional map styles (6-10 total)
- [ ] Download history for logged-in users

### Medium Term
- [ ] User accounts with Stripe customer portal
- [ ] Bulk export for subscribers
- [ ] API access for developers
- [ ] Canvas print fulfillment option

### Long Term
- [ ] Custom style builder
- [ ] Team/agency accounts
- [ ] White-label option
- [ ] Mobile app

---

## Metrics to Track

| Metric | Goal |
|--------|------|
| Free downloads | Awareness/engagement |
| $5 conversions | Primary revenue |
| $10 subscriptions | Recurring revenue |
| Render time | < 30 seconds |
| Error rate | < 1% |

---

## Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit

# Deploy (automatic via Vercel)
git push origin main
```

---

## Support & Resources

- **Mapbox GL JS**: https://docs.mapbox.com/mapbox-gl-js/
- **Mapbox Static API**: https://docs.mapbox.com/api/maps/static-images/
- **Stripe Checkout**: https://stripe.com/docs/checkout
- **Sharp**: https://sharp.pixelplumbing.com/
- **Next.js**: https://nextjs.org/docs