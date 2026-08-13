import { Link } from "react-router-dom";

/**
 * The DragonRestock logo lockup — the single definition used by every layout
 * (auth, app, docs), so /sign-up, /dashboard and /docs can no longer drift.
 *
 * Mirrors dragonrestock.com's navbar (src/components/landing/Nav.jsx) exactly:
 *   • /DragonBot-logo.png at h-9, width auto
 *   • the same bob: 0 → -4px → 0, 1.2s ease-in-out, infinite (`.logo-bob`,
 *     the CSS twin of the LP's framer-motion animation — no dependency needed)
 *   • "Dragon" + "Restock" (no space) in Clash Display, extrabold, 22px,
 *     tracking -0.02em, with the brand-green gradient on "Restock"
 *
 * 🚨 The wordmark is SPLIT ACROSS TWO ELEMENTS so the gradient can apply to
 * the second half. That means `grep -r "DragonReply"` does NOT match it — the
 * inherited name survived the rebrand sweep here and shipped visibly on every
 * header until a screenshot caught it. Rebranding a fork: render the app and
 * look, don't only grep.
 *
 * 🚨 The mark is **2.07:1** — never give it both a width and a height.
 *
 * Two things this corrects. The auth header used to render
 * `/logos/dragonbot_fire.png`, a **192×192 square fire mark** — a different
 * logo from the one the LP shows, not merely a differently-sized one. The docs
 * header rendered the right mark `h-7 w-7 rounded`, squashing 2.07:1 into a
 * square. Only deliberate difference from the LP: it hardcodes a dark-navbar
 * colour, so the plain word here tracks --foreground instead.
 */
export function BrandLockup({
  to = "/",
  suffix,
}: {
  to?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <img
        src="/DragonBot-logo.png"
        alt="DragonRestock"
        className="logo-bob h-9 w-auto"
      />
      <span className="whitespace-nowrap font-clash text-[22px] font-extrabold tracking-[-0.02em] text-[var(--foreground)]">
        Dragon
        <span className="bg-gradient-to-r from-[#2F7D4F] to-[#98CC65] bg-clip-text text-transparent">
          Restock
        </span>
      </span>
      {suffix}
    </Link>
  );
}
