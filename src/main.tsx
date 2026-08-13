import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  BrandProvider,
  captureAttribution,
  configureShared,
} from "@ballisticbrands/frontend-shared";
import App from "./App";
import { activeBrand, META_PIXEL_ID } from "./brands";
import { config } from "./lib/config";
import "./globals.css";

// Resolve the active brand once at boot. Every downstream step —
// analytics injection, tab title, meta description, shared library
// runtime — keys off it.
const brand = activeBrand();

// Configure @ballisticbrands/frontend-shared BEFORE any of its
// functions run. Sets the module-level singleton non-React code
// (attribution helpers, fetch wrapper) reads apiUrl + brand from.
// React components read brand via useBrand() from the same package.
configureShared({
  apiUrl: config.apiUrl,
  brand,
  turnstileSiteKey: config.turnstileSiteKey,
  googleClientId: config.googleClientId,
});

// Per-brand analytics injection. Moved out of index.html so a single
// codebase can serve differently-branded builds without shipping
// every brand's IDs to every user. GA4 + Clarity scripts are
// injected into <head> at runtime after brand is resolved.
function injectGa4(measurementId: string): void {
  if (!measurementId) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(s);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataLayer = (window as any).dataLayer || [];
  // gtag.js only processes the `arguments` object pushed to dataLayer.
  // The previous shim pushed a rest-param *array*, which gtag.js silently
  // ignores — so gtag('config') and every gtag('event') no-op'd and NO
  // hits were ever sent (page_view, sign_up, etc. all dropped). Push the
  // arguments object like the canonical snippet.
  const gtag: (...args: unknown[]) => void = function () {
    // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-explicit-any
    (window as any).dataLayer.push(arguments);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId);
}

function injectClarity(projectId: string): void {
  if (!projectId) return;
  // Verbatim port of the standard Clarity snippet.
  ((c, l, a, r, i) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c as any)[a] = (c as any)[a] || function () {
      // Clarity's queue, like gtag's, expects the arguments object — not
      // a plain array (see the GA4 note above).
      // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-explicit-any
      ((c as any)[a].q = (c as any)[a].q || []).push(arguments);
    };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    y?.parentNode?.insertBefore(t, y);
  })(window, document, "clarity", "script", projectId);
}

// Meta Pixel base snippet. The shared library fires CompleteRegistration /
// ConnectSeller / ConnectAds through `window.fbq`, but only when it already
// exists — nothing in the shared package loads the pixel itself. Without
// this, creating the dataset in Business Manager produces exactly zero app
// events, silently. The LP loads its pixel from index.html; this is the
// app's equivalent, kept here so it's brand-resolved like GA4 and Clarity.
function injectMetaPixel(pixelId: string): void {
  if (!pixelId) return;
  /* eslint-disable @typescript-eslint/no-explicit-any, prefer-rest-params */
  const w = window as any;
  if (w.fbq) return;
  const n: any = (w.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!w._fbq) w._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  const t = document.createElement("script");
  t.async = true;
  t.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(t);
  /* eslint-enable @typescript-eslint/no-explicit-any, prefer-rest-params */
  w.fbq("init", pixelId);
  w.fbq("track", "PageView");
}

injectGa4(brand.ga4MeasurementId);
injectClarity(brand.clarityId);
injectMetaPixel(META_PIXEL_ID);

// Brand-aware tab title + meta description. The tagline must be this
// product's own: inherited boilerplate describing a different product
// shows in the tab on any route that doesn't set its own title.
// Kept in sync with the pre-hydration <title> in index.html.
document.title = `${brand.displayName} — Never run out of stock again`;
const metaDesc = document.querySelector('meta[name="description"]');
if (metaDesc) metaDesc.setAttribute("content", brand.metaDescription);

// SPA fallback for GitHub Pages. MUST run BEFORE captureAttribution().
const redirectPath = sessionStorage.getItem("spa-redirect");
if (redirectPath && redirectPath !== "/") {
  sessionStorage.removeItem("spa-redirect");
  window.history.replaceState(null, "", redirectPath);
}

// Snapshot the visitor's first landing into localStorage.
captureAttribution();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrandProvider brand={brand}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BrandProvider>
  </StrictMode>,
);
