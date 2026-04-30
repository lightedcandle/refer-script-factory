# Law 54: refer.stripe.md â€” Stripe Integration Guardrails

## Article 54.1: 1) Placement rule (modal safety)
- Stripe Elements must be mounted in **2P (page) modal** contexts or inline page sections.
- Do **not** mount Stripe Elements inside floating overlays (2F/2N/2S/2E/2W). These contexts are treated as unsupported for Stripe rendering.

## Article 54.2: 2) Mounting rule (single host)
- A single Stripe Element instance can be mounted to only one host at a time.
- If you need multiple visible fields, create separate Elements and mount each to its own host.

## Article 54.3: 3) Client reset behavior (cancel)
- A cancel/reset action may clear local input state (amount, donor fields) and call `StripeElement.clear()` to clear card entry fields.
- Do not unmount or destroy the Stripe Element on cancel; keep it mounted for reuse.

## Article 54.4: 4) Publishable key selection (domain routing)
- Publishable key selection is **host-aware** at runtime and is app-specific; document the host routing rules in `refer.<app>.md`.
- Both live and test publishable keys must be available to the client runtime so the selector can choose at load when host-based routing is required.
- If a domain match cannot be resolved, fall back to the explicitly configured publishable key.

## Article 54.5: 5) Recurring Purpose Giving

App-specific recurring giving flows must be documented in `refer.<app>.md`.

## Article 54.6: 6) Upcoming Payments + Subscription Management

App-specific subscription management flows must be documented in `refer.<app>.md`.

## Article 54.7: 7) Dual Stripe Accounts (Live/Test)

App-specific live/test account selection rules must be documented in `refer.<app>.md`.
