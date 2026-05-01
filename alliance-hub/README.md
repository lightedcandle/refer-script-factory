# Alliance Hub

Dedicated Cloudflare Pages surface for the Alliance Hub.

The Alliance Hub is the sustainable app surface. It carries forward the useful
lessons learned from Zo, but the production build target is Cloudflare Pages,
Supabase, and the Android SMS bridge.

End-to-end flow authority:

```text
../docs/alliance-sms-profile-flow.md
../docs/alliance-journey-build-plan.md
```

Initial route:

```text
https://alliance.telechurchlive.com/
https://alliance.telechurchlive.com/profile/{signed-token}
```

The home page is the public Alliance Hub entry point. A person can enter a phone
number under "Become a part of the Alliance" and receive a secure SMS profile
link. This gives the Hub two profile entry points:

- direct SMS conversation starts profile setup;
- home page phone entry sends a secure profile link by SMS.

The signed token contains the SMS phone number. The form displays the phone number as read-only and rejects tampered tokens.
The latest Supabase SMS profile context is checked before a token is accepted, so reset, completion, and edit-link replacement make older links unusable.
When a profile link is expired, already used, replaced by reset, or tied to a phone with no current profile context, the browser returns to the home page with a "Link expired" message and the phone entry form.

Profile routes:

```text
https://alliance.telechurchlive.com/member/{profile-id}
```

Site branch routes:

```text
https://alliance.telechurchlive.com/about/
https://alliance.telechurchlive.com/
```

The About route is the first public branch of the growing site. The browser remembers the last profile opened or saved in local storage and uses that to backlink About to `My profile`. This is convenience navigation only; gated links must still be enforced server-side by signed tokens, registration state, group membership, and journey context.

About and profile story context should be drawn from the full `../The Alliance Story/` source set:

- `The alliance Hub`
- `The Alliance Structure`
- `The Alliance Rhythm`
- `The Alliance Members`
- `The Alliance Leadership`
- `The Alliance Gifts`
- `alliance_invisible_app_architecture.md`

The profile view can request an edit link. The edit link is sent by SMS and expires after 30 minutes.

## SMS Script Factory

The Hub owns the source definitions for the Alliance SMS Script Factory:

```text
scripts/sms/registry.json
scripts/sms/router.mjs
tools/sms-script-factory.mjs
```

Runtime split:

- `scripts/sms/` is the source of truth for deterministic SMS script ids and draft candidates.
- Supabase Edge receives inbound SMS and stores `sms_intake_gap` evidence for unknown messages.
- Cloudflare Pages Functions expose Hub/admin surfaces, including `GET /api/sms-factory/gaps`.
- Supabase records messages, route decisions, gaps, candidates, approvals, and script runs.

`GET /api/sms-factory/gaps` requires:

```http
X-Alliance-Admin-Token: admin-token
```

The deploy script uploads `ALLIANCE_ADMIN_TOKEN` only when it exists in the local env sources. If it is missing, the endpoint remains disabled.

Unknown registered-user SMS receives:

```text
Let me check on this and get back with you soon.
```

Then the original message is queued as an `sms_intake_gap` so repeated needs can become deterministic scripts.

Active SMS presets:

- `Hello`, `Hi`, `Hey`, `Hey there`, and `Hey Alliance` return a personalized menu.
- `Profile` returns the profile link when a registered profile is available.
- `Events`, `Give`, `About`, `My Church`, and `Next Event` return a section-in-progress stub and record notification interest.

Form rules:

- Distinction is required, starts empty, and is shown before first name.
- Supported distinctions are sorted alphabetically and include Missionary, Evangelist, and Overseer.
- Profile image accepts a hosted image URL or a local image file that is compressed in the browser before submit.
- The Alliance header image is served from `/assets/alliance-header.png`.
- The favicon is served from `/favicon.ico`.

## Commands

```powershell
npm run check
npm run sms:validate
npm run sms:route -- --registered --text "when is the next event"
npm run deploy:dry
npm run deploy
```

`npm run deploy` creates or reuses the `alliance-telechurchlive` Pages project, uploads Pages Function secrets, deploys `public/`, and attempts to attach `alliance.telechurchlive.com`.

Required private values are loaded from `E:\telechurch-e2e\.env.master` and the ignored bridge env file. The script does not print secret values.
