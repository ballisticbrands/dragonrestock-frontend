import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AuthDivider,
  Button,
  GoogleSignInButton,
  Input,
  Label,
  Turnstile,
  useBrand,
  useSignUpForm,
} from "@ballisticbrands/frontend-shared";
import { config } from "@/lib/config";
import { ArrowRight, CheckCircle, Shield } from "@/components/ui/icons";

const VALUE_PROPS = [
  "An order-by date and quantity for every SKU",
  "Forecasts that tell real demand from Prime Day",
  "Every marketplace, warehouse and 3PL in one number",
];

/**
 * DragonRestock sign-up — a two-column pitch + form. The presentation pitches
 * restock planning (replacing the buyer-messaging pitch inherited on the
 * dragonreply fork); the account itself is still created by `useSignUpForm`
 * from the shared package, so the auth flow stays identical to the sibling
 * brand apps. Confirm-password is local — the shared hook owns
 * name/email/password only, so we block the submit before the hook sees it.
 */
export function SignUp() {
  const navigate = useNavigate();
  const brand = useBrand();

  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const form = useSignUpForm({
    onSuccess: () => {
      // The `sign_up` GA4/Clarity event is fired by the shared
      // identifyUserAcrossPlatforms() after the post-signup /me lookup, so we
      // only navigate here to avoid double-counting the conversion.
      navigate("/dashboard", { replace: true });
    },
  });

  useEffect(() => {
    document.title = `Create your account — ${brand.displayName}`;
  }, [brand.displayName]);

  const mismatch = confirm.length > 0 && confirm !== form.password;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setSubmitted(true);
    if (form.password !== confirm) {
      e.preventDefault();
      return;
    }
    form.onSubmit(e);
  };

  const showMismatch = mismatch || (submitted && form.password !== confirm);

  return (
    <div className="grid items-stretch gap-10 sm:grid-cols-2">
      {/* left — pitch, on the brand-green panel. Text here is fixed white
          rather than themed, because the panel sets its own dark green
          ground. */}
      <div className="relative flex flex-col">
        {/* The green ground is a separate absolutely-positioned layer rather
            than a background on the panel itself, so it can run past the
            panel's left edge and off the viewport. -100vw is simply "further
            left than any screen"; AuthLayout's overflow-x-hidden clips it, so
            it costs no horizontal scroll. Below sm the grid is one column and
            the panel is an ordinary inset rounded card. */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 right-0 rounded-2xl shadow-sm sm:left-[-100vw] sm:rounded-l-none"
          style={{
            // Flat green first, gradient second. A browser without color-mix()
            // (Chrome <111, Safari <16.2, Firefox <113) drops the whole
            // backgroundImage declaration — without this fallback the panel
            // loses its ground entirely and renders white-on-white, which is
            // unreadable rather than merely plainer.
            backgroundColor: "var(--brand-green)",
            backgroundImage:
              "linear-gradient(160deg, var(--brand-green) 0%, color-mix(in srgb, var(--brand-green) 72%, #000) 100%)",
          }}
        />
        {/* Positioned so it paints above the absolute background layer, and
            flex-1 so the badge's mt-auto still reaches the panel bottom. */}
        <div className="relative flex flex-1 flex-col p-7 text-white sm:py-9 sm:pl-0 sm:pr-9">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-medium">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--brand-green-light)]" />
            Start free
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-4xl">
            Know what to order.
            <br />
            Before you run out.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
            Your restock plan, worked out from your own sales history and lead times. Create your
            account, connect Amazon, and see your first plan in minutes.
          </p>
          <ul className="mt-7 space-y-3">
            {VALUE_PROPS.map((text) => (
              <li key={text} className="flex items-center gap-3 text-[15px]">
                <CheckCircle className="h-5 w-5 shrink-0 text-[var(--brand-green-light)]" />
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-5">
            <div>
              <div className="text-2xl font-extrabold leading-none">10 years</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.15em] text-white/60">
                on Amazon
              </div>
            </div>
            <div className="h-9 w-px bg-white/25" />
            <div>
              <div className="text-2xl font-extrabold leading-none">8 figures</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.15em] text-white/60">sold</div>
            </div>
          </div>

          {/* Amazon partner badge — same asset and same h-24/sm:h-28 sizing the
            landing page uses on /messaging. The SVG carries its own white
            ground, so it reads as a seal tile on the green rather than
            needing a wrapper. mt-auto pins it to the bottom so the panel
            bottoms out level with the form card. */}
          <div className="mt-auto flex items-center gap-4 border-t border-white/15 pt-6 sm:mt-10">
            <img
              src="/logos/badge-amazon-software-partner.svg"
              alt="Amazon Software Partner"
              className="h-24 w-auto shrink-0 sm:h-28"
            />
            <div className="text-[14px] font-medium leading-snug text-white/75">
              Official Amazon
              <br />
              Software Partner
            </div>
          </div>
        </div>
      </div>

      {/* right — form */}
      <div className="rounded-2xl border bg-[var(--card)] p-6 shadow-sm sm:p-7">
        <h2 className="text-xl font-extrabold tracking-[-0.02em]">Create your account</h2>
        <p className="mt-1 text-[13.5px] text-[var(--muted-foreground)]">
          Start free — no credit card required.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Google path skips the whole form (and Turnstile — Google's
              own bot defenses stand in; the backend doesn't require a
              captcha on /v1/auth/google). */}
          {config.googleClientId && (
            <>
              <GoogleSignInButton
                text="signup_with"
                onSuccess={() => navigate("/dashboard", { replace: true })}
                onError={setGoogleError}
              />
              {googleError && (
                <p className="text-center text-sm text-[var(--danger)]">{googleError}</p>
              )}
              <AuthDivider label="or sign up with email" />
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => form.setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => form.setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => form.setPassword(e.target.value)}
            />
            <p className="text-xs text-[var(--muted-foreground)]">At least 8 characters.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {showMismatch && <p className="text-xs text-[var(--danger)]">Passwords don't match.</p>}
          </div>

          <Turnstile onToken={form.onTurnstileToken} onExpired={form.onTurnstileExpired} />
          {form.error && <p className="text-sm text-[var(--danger)]">{form.error}</p>}

          <Button
            type="submit"
            disabled={form.pending || !form.turnstileToken}
            className="flex w-full items-center justify-center gap-2"
          >
            {form.pending ? "Creating account…" : "Start free"}
            {!form.pending && <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-[var(--muted-foreground)]">
            By continuing you agree to our{" "}
            <a
              href="https://dragonrestock.com/tos"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="https://dragonrestock.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Privacy Policy
            </a>
            .
          </p>
        </form>

        {/* The inherited row linked to DragonReply's Selling Partner Appstore
            listing — a different product's page, so it's dropped rather than
            repointed. Restore an "Amazon approved" link here once
            DragonRestock has a listing of its own. */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-5 text-[12px] font-medium">
          <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <CheckCircle className="h-3.5 w-3.5 text-[var(--brand-green)]" />
            Official Amazon Software Partner
          </span>
          <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <Shield className="h-3.5 w-3.5 text-[var(--brand-green)]" />
            Amazon ToS compliant
          </span>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--muted-foreground)]">
          Already have an account?{" "}
          <Link to="/sign-in" className="font-medium text-[var(--foreground)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
