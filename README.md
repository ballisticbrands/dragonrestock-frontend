# dragonrestock-frontend

The **DragonRestock** web app — Amazon inventory & restock planning.

- **Live:** https://app.dragonrestock.com
- **Landing page:** https://dragonrestock.com (repo: `ballisticbrands/DragonRestock-LP`)
- **Backend:** `https://api.getdragonbot.com` — the **shared** backend for every Dragon
  brand app. Bearer tokens from `/v1/auth/sign-in` work across all brand frontends; one
  User table spans them. Overridable via `VITE_API_URL`.
- **Deploy:** GitHub Actions → GitHub Pages on push to `main`.

## Tracking IDs

| Tool | ID |
|------|----|
| Google Analytics (GA4) | `G-7JMJEMLRZD` |
| Microsoft Clarity | `y1peimheyt` |
| Meta pixel / dataset | `28716421651297621` |

Same property/project/dataset as the landing page — one per **product**, spanning LP and
app, separate from every sibling brand's. Loaded in
[`src/main.tsx`](src/main.tsx); brand values live in
[`src/brands/dragonrestock.ts`](src/brands/dragonrestock.ts).

## Local deviations from `@ballisticbrands/frontend-shared`

Three things live here rather than upstream. Each has a comment at its definition
explaining why; all three would otherwise mean publishing the shared package and bumping
every sibling repo.

- **`injectMetaPixel()`** (`main.tsx`) — the shared lib fires Meta events through
  `window.fbq` but guards on `typeof window.fbq === "function"` and never loads the
  pixel. Without this, creating the dataset yields **zero** app-side events, silently.
- **`CompleteRegistration` normalization** (`main.tsx`) — `frontend-shared` 0.5.0 sends
  it via `fbq('trackCustom', …)`, but it is a **standard** Meta event; sent as custom it
  forfeits Meta's optimization priors and its AEM slot while still showing up in Events
  Manager. The pixel stub promotes any standard event name from `trackCustom` to `track`.
  **Delete once upstream is fixed.**
- **`TAGLINE`** (`brands/dragonrestock.ts`) — the tab title is set in two places
  (`main.tsx` at boot, `App.tsx` on every route change). While they held separate string
  literals they drifted and the app shipped a sibling brand's tagline. One constant now.

## Deep links return HTTP 404 — by design

This is a `BrowserRouter` SPA on GitHub Pages, so any deep link is served by
[`public/404.html`](public/404.html), which stashes the path in `sessionStorage` and
redirects to `/`; `main.tsx` reads it back and rewrites history before the router mounts.
Browsers reach the right route; only a status-code check looks broken. **Don't "fix" it.**

Full playbook: `DragonBot-marketing/skills/new-product-funnel/SKILL.md`. Live status and
IDs for every product: `DragonBot-marketing/ADS_STATUS.md`.
