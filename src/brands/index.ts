// Single-brand registry for dragonrestock-frontend.
//
// This repo only builds the DragonRestock app (deployed at
// app.dragonrestock.com). Sibling repos dragonbot-frontend,
// dragonrefunds-frontend and dragonreply-frontend build their apps the
// same way with their own brand files.
//
// The BrandConfig type is owned by @ballisticbrands/frontend-shared —
// consumers import it from there, and pass their brand into the
// shared BrandProvider + configureShared({ brand }).

import { DRAGONRESTOCK } from "./dragonrestock";

export type { BrandConfig } from "@ballisticbrands/frontend-shared";
export { DRAGONRESTOCK };
export { META_PIXEL_ID, TAGLINE } from "./dragonrestock";

/** The one brand this repo builds. */
export function activeBrand() {
  return DRAGONRESTOCK;
}
