# dragonrestock-frontend

The DragonRestock brand's app frontend. Deployed at
**app.dragonrestock.com** via GitHub Pages.

**Status: forked and rebranded, not yet launched.** Copied from
dragonreply-frontend (itself forked from dragonrefunds-frontend, from
dragonbot-frontend) with the brand config swapped and every page of
inherited product copy rewritten — the sign-up pitch, the connect
prompt, and the `/docs` pages, which documented DragonBot on a live
route. The dead `lib/refundsEstimate.ts` was deleted.

What ships today is the account + Amazon-connect console: sign up,
connect Seller Central, manage API keys and COGS, read the docs. The
restock product surface itself lives in Claude over MCP, not here.

## Sibling repos + services

- **[dragonrefunds-frontend](https://github.com/ballisticbrands/dragonrefunds-frontend)** —
  Dragon Refunds' app (app.dragonrefunds.com). **This repo was
  forked from it**, which in turn was forked from
  dragonbot-frontend — treat dragonbot-frontend as the canonical
  structural reference.
- **[dragonbot-frontend](https://github.com/ballisticbrands/dragonbot-frontend)** —
  DragonBot brand's app (app.getdragonbot.com).
- **[frontend-shared](https://github.com/ballisticbrands/frontend-shared)** —
  npm package (`@ballisticbrands/frontend-shared`) that owns the
  auth flow, session/API client, brand context, Turnstile widget,
  verify-email banner, and auth-form hooks. See its README for the
  full shared-vs-per-brand boundary and dev loop.
- **[sellerconnect](https://github.com/ballisticbrands/sellerconnect)** —
  the shared backend at api.getdragonbot.com. Serves ALL brand
  apps. Derives brand from the request's `Origin` header at
  `src/lib/brand.ts`.
- **[DragonRestock-LP](https://github.com/ballisticbrands/DragonRestock-LP)** —
  landing page at dragonrestock.com (separate repo, unrelated build).
  Owns `/tos`, `/privacy`, `/pricing`, `/support`.

## Multi-brand model — what to know

Users are shared across brand apps. Same backend, same User table,
same bearer tokens. A user who signs up on `app.getdragonbot.com`
can enter the same credentials on `app.dragonrestock.com` and sign in
— no re-signup needed. What differs per brand:

- **Frontend build**: brand config in `src/brands/dragonrestock.ts`
  (name, GA4 ID, Clarity ID, support email, header label).
- **Frontend hostname + repo**: this repo → `app.dragonrestock.com`.
- **Verify-email link**: backend picks the brand's app URL from the
  Origin header on the sign-up POST.
- **SP-API / Ads OAuth `return_to`**: frontend sends its own app
  origin on `/start`; backend threads it through the JWT state
  token and bounces the seller back to the right app.
- **Analytics**: per-brand GA4 + Clarity, injected at runtime in
  `main.tsx` from the brand config — NOT hardcoded in `index.html`.

What is the SAME across brands:

- Backend (`api.getdragonbot.com`)
- Auth flow, session, API client (all in `@ballisticbrands/frontend-shared`)
- SES sender (`hello@getdragonbot.com`)
- Cloudflare Turnstile widget (single widget with multiple
  hostnames in its allowlist)

## Before this repo can ship — open backend/infra items

These are NOT code changes in this repo.

1. ~~**GitHub repo + Pages.**~~ DONE — repo exists, `main` pushed,
   Pages source set to GitHub Actions. No repo secrets are needed:
   the backend URL defaults to `api.getdragonbot.com` in
   `src/lib/config.ts`, and the public Turnstile site key is inline
   in `.github/workflows/deploy.yml`. (The earlier
   `VITE_BACKEND_URL` secret was a dead name — nothing ever read it;
   the code reads `VITE_API_URL`.)
2. ~~**DNS.**~~ DONE — `app.dragonrestock.com` CNAMEs to
   `ballisticbrands.github.io`. Pages auto-issues the Let's Encrypt
   cert for `public/CNAME` on the first successful deploy.
3. ~~**Turnstile allowlist.**~~ DONE — `app.dragonrestock.com` added to
   the shared Cloudflare Turnstile widget's hostname allowlist.
4. **Backend brand entry.** Add `app.dragonrestock.com` to
   sellerconnect's `src/lib/brand.ts` Origin→brand map, otherwise
   verify-email links and OAuth `return_to` bounce to the wrong app.
5. **Analytics IDs.** `ga4MeasurementId` and `clarityId` in
   `src/brands/dragonrestock.ts` are intentionally empty — Dragon
   Reply has no GA4 property or Clarity project yet. The injectors
   in `main.tsx` no-op on empty strings, so nothing half-configured
   ships; fill both in before launch.

## Layout

```
src/
├── main.tsx              ← boot: configureShared(), analytics injection, BrandProvider
├── App.tsx               ← react-router routes
├── brands/
│   ├── dragonrestock.ts  ← this brand's config
│   └── index.ts          ← re-exports + activeBrand() helper
├── lib/
│   ├── config.ts         ← build-time Vite config (apiUrl, turnstileSiteKey)
│   ├── connections.ts    ← SP-API/Ads /start + /reauth + /callback helpers
│   ├── keys.ts, cogs.ts, billing.ts, tools.ts  ← inherited; some will be replaced
│   └── refundsEstimate.ts ← INHERITED, Dragon Refunds-only; delete on rewrite
├── pages/
│   ├── Index.tsx         ← INHERITED marketing landing (refunds pitch)
│   ├── SignUp.tsx        ← INHERITED refunds estimate; form logic is shared
│   ├── SignIn.tsx        ← uses useSignInForm from shared
│   ├── Dashboard.tsx     ← INHERITED; will become the reply-workflow UI
│   ├── Docs.tsx
│   └── (VerifyEmail + ForgotPassword served from shared)
├── components/
│   ├── layout/           ← AuthLayout, AppLayout, DocsLayout
│   ├── dashboard/        ← INHERITED; will diverge
│   └── ui/               ← Badge, Card, CopyButton, CodeBlock (brand-local primitives)
└── globals.css           ← Tailwind + CSS-var brand theme
```

Shared components (Button, Input, Label, Turnstile, VerifyEmailBanner,
VerifyEmailPage, ForgotPasswordPage) live in
`@ballisticbrands/frontend-shared` — import from there, don't
recreate locally.

## Boot sequence (main.tsx)

1. Resolve `activeBrand()` from `src/brands/`
2. `configureShared({ apiUrl, brand, turnstileSiteKey })` — sets
   the shared package's module-level singleton
3. Inject GA4 + Clarity scripts with this brand's IDs
4. Set document title + meta description from brand config
5. GitHub-Pages SPA-fallback restore
6. `captureAttribution()` — snapshot first-touch UTMs / gclid /
   referrer / landing_page into localStorage
7. Render app inside `<BrandProvider brand={brand}>`

## Divergence plan (what is done, what is left)

Rewritten already — these carried the wrong product's copy on live
routes and have been fixed:

- `pages/SignUp.tsx` — pitch is restock planning (was buyer
  messaging, itself replacing the inherited FBA-reimbursement
  estimate). `useSignUpForm` from shared is untouched.
- `components/dashboard/ConnectSellerPrompt.tsx` + `DataTab.tsx` —
  said the SP-API connection was for finding reimbursements.
- `docs/*` + `docs/registry.tsx` — documented **DragonBot** by name,
  on a route a paid visitor reads before trusting us.
- `lib/refundsEstimate.ts` — deleted; nothing imported it.
- `globals.css` — the greens are the shared Dragon palette and match
  dragonrestock-lp exactly, so only the comment was wrong. `--accent`
  is still DragonBot orange, inherited from the fork chain.

Still open:

- `pages/Dashboard.tsx` + `components/dashboard/*` are a generic
  account console (connections, keys, COGS, settings, support). That
  is deliberate for now — the restock product surface is in Claude
  over MCP. Revisit if the web app ever needs its own restock UI.
- `pages/Index.tsx` is already just a session-aware redirect; the
  older fork docs claiming it holds marketing copy were stale.

DO NOT change these (they should stay in sync with the sibling apps
via the shared package):

- `src/lib/connections.ts` (SP-API flow) — belongs in shared
  eventually; keep in sync until then
- Session/auth code that's already in `frontend-shared`

If you find yourself wanting to change something in this list, ask
whether the change actually belongs upstream in
`@ballisticbrands/frontend-shared` first.

## Common tasks

**Update the shared package dep.** Bump the version in
`package.json` (`"@ballisticbrands/frontend-shared": "^0.4.0"`),
`npm install`, verify locally, commit + push. Do this across all
brand frontends so the apps stay in sync.

**Change brand config.** Edit `src/brands/dragonrestock.ts`.
Analytics IDs, header label, support email, meta description all
live there.

**Iterate on shared code locally.** From `frontend-shared`:
```bash
npm run build && npm link
```
From this repo:
```bash
npm link @ballisticbrands/frontend-shared
```

## Deploy

Push to `main` → GitHub Actions runs `.github/workflows/deploy.yml`
→ Vite build → GitHub Pages picks up the artifact + reads
`public/CNAME` (`app.dragonrestock.com`) as its custom domain.

**GH Packages auth**: `.npmrc` reads `NODE_AUTH_TOKEN`; CI sets it
to `GITHUB_TOKEN`. Local `npm install` needs a PAT with
`read:packages` on the ballisticbrands org.

## Local dev

```bash
NODE_AUTH_TOKEN=<PAT> npm install   # needed once + on shared updates
npm run dev                          # http://localhost:5173
```

Local dev connects to `api.getdragonbot.com` (real prod backend)
unless `VITE_API_URL` is set in `.env.local`.
