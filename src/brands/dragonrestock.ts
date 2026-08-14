import type { BrandConfig } from "@ballisticbrands/frontend-shared";

export const DRAGONRESTOCK: BrandConfig = {
  id: "dragonrestock",
  appHost: "app.dragonrestock.com",
  appOrigin: "https://app.dragonrestock.com",
  headerLabel: "DragonRestock",
  displayName: "DragonRestock",
  metaDescription:
    "DragonRestock tracks your Amazon sales velocity and lead times, and tells you exactly when to reorder every SKU — so you never stock out.",
  supportEmail: "info@dragonrestock.com",
  // Same GA4 property and Clarity project as dragonrestock.com — one
  // property per PRODUCT, spanning its LP and its app, so the funnel is
  // readable end to end. Separate from every sibling brand's.
  ga4MeasurementId: "G-7JMJEMLRZD",
  clarityId: "y1peimheyt",
  // Same postMessage namespace as DragonBot — the backend sends this
  // type regardless of tenant, so every brand frontend listens for the
  // same value.
  oauthMessageType: "dragonbot-oauth-result",
};

/**
 * Meta Pixel (dataset) ID for DragonRestock — its own dataset, shared with
 * the landing page, and separate from every sibling brand's.
 *
 * Deliberately NOT a BrandConfig field: that type is owned by
 * @ballisticbrands/frontend-shared and has no `metaPixelId`, so adding one
 * would mean publishing the shared package and bumping every sibling repo.
 * This repo builds exactly one brand, so a local export is sufficient.
 * Promote it into BrandConfig when a second brand needs an app-side pixel.
 *
 * Why this has to exist at all: the shared lib's Meta calls are guarded by
 * `typeof window.fbq === "function"`. With no base snippet loaded, every
 * Meta event on app.dragonrestock.com silently no-ops — no error, just
 * nothing. Creating the dataset in Business Manager is not enough.
 */
export const META_PIXEL_ID = "28716421651297621";

/**
 * The product's own tab-title tagline.
 *
 * Exported rather than inlined because two places need it at different
 * times: `main.tsx` sets the title at boot, and `App.tsx` re-sets it on
 * every route change as the fallback for pages that don't set their own.
 * While those held separate string literals they drifted — the rebrand
 * updated `main.tsx` but missed `App.tsx`, so the app booted with the right
 * title and then overwrote it on mount with DragonReply's "Your Customers,
 * Answered Automatically", which showed on every route lacking its own
 * title (today, `/`). One constant makes that class of drift impossible.
 *
 * Like META_PIXEL_ID, deliberately NOT a BrandConfig field: that type is
 * owned by @ballisticbrands/frontend-shared and has no tagline, so adding
 * one would mean publishing the shared package and bumping every sibling.
 */
export const TAGLINE = "Never run out of stock again";
