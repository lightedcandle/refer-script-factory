# Alliance SMS Profile Flow

This document is the end-to-end operator map for the Alliance SMS registration flow.

The broader one-page plus one-SMS-leg build plan lives in:

```text
docs/alliance-journey-build-plan.md
```

## Purpose

The flow lets a person text the Alliance bridge, receive a secure profile form link, complete a profile, and later request a secure edit link.

The system deliberately keeps SMS as the transport and the browser form as the profile data surface. SMS carries links and short commands; profile details and images are collected on the Cloudflare Pages form.

## Live Surfaces

```text
Phone app:
alliance-android-sms-bridge

SMS relay:
https://skqmzcdmfaijxpbvcdal.supabase.co/functions/v1/alliance-sms-relay

Alliance Hub home:
https://alliance.telechurchlive.com/

Alliance Hub profile form:
https://alliance.telechurchlive.com/profile/{signed-token}

Profile page:
https://alliance.telechurchlive.com/member/{profile-id}
```

## Runtime Path

```text
Inbound SMS
  -> Android phone relay
  -> Supabase Edge Function: alliance-sms-relay /phone/inbound
  -> alliance_sms_inbox
  -> alliance_records sms_message
  -> alliance_records sms_profile_context
  -> alliance_sms_outbox
  -> Android phone polls /phone/next
  -> Android SmsManager sends SMS reply
```

Profile save:

```text
Alliance Hub Cloudflare Pages app
  -> /api/profile-intake/session/{token}
  -> latest sms_profile_context validation
  -> /api/profile-intake/submit
  -> alliance_records alliance_profile
  -> alliance_records sms_profile_context completed
```

Home page phone entry:

```text
Alliance Hub home
  -> /api/profile-intake/start
  -> creates or refreshes sms_profile_context
  -> queues secure profile link by SMS
  -> Android phone polls /phone/next
  -> Android SmsManager sends SMS reply
```

Edit link:

```text
/member/{profile-id}
  -> Edit Profile button
  -> /api/profile-intake/edit-link
  -> stores edit_form_token on sms_profile_context
  -> queues SMS with 30-minute edit link
```

## Link Rules

- Registration tokens are HMAC-signed and phone-bound.
- The form accepts only the latest token stored on the phone's `sms_profile_context`.
- When a new reset token is issued, older registration links are rejected.
- When a registration form is saved, that registration link is treated as used.
- Edit tokens are HMAC-signed, phone-bound, profile-bound, expire after 30 minutes, and are single-use.
- Invalid, expired, used, replaced, or unverified profile links redirect the browser to `/?link=expired`, where the home page surfaces a "Link expired" message and lets the person request a fresh profile link by phone number.

## SMS Commands

`RESET`

Clears the current profile setup attempt for that phone number, restarts the prompt count, stores a fresh registration token, sends a fresh registration link, and invalidates the previous registration link.

`STOP` or `CANCEL`

Cancels the local deterministic profile script path. The live relay currently records inbound messages and should be expanded before broad production use to enforce full opt-out policy across all outbound queues.

Unknown registered-user text:

After a phone number has completed profile registration, unmatched inbound SMS is handled by the Alliance SMS Smart Intake fallback. The relay replies:

```text
Let me check on this and get back with you soon.
```

It also records an `sms_intake_gap` with the original text, normalized text, `alliance.sms_router.v1`, `alliance.sms_unknown_intent.v1`, and a suggested future script id when the message resembles a planned intent such as next event, profile link, groups, or event registration.

SMS script source:

```text
alliance-hub/scripts/sms/registry.json
alliance-hub/scripts/sms/router.mjs
```

The Supabase relay handles the live SMS runtime, but the Hub owns the durable script registry and factory tooling.

Casual conversation presets:

- `Hello`, `Hi`, `Hey`, `Hey there`, and `Hey Alliance` return a personalized menu:

```text
Hello {first name}, how are you today?
How can I help? You can quickly reply:
Profile, Events, Give, About, My Church, Next Event
```

- `Profile` returns the member profile link when a completed profile exists.
- `Events`, `Give`, `About`, `My Church`, and `Next Event` are active stubs until their sections are built. The relay replies that the section is still being worked on and records `sms_notification_interest` so the person can be notified when the section is ready.

## Profile Form Rules

- Distinction is required and appears before first name.
- Distinction starts empty.
- Distinctions are alphabetized.
- Current additions include `Evangelist`, `Missionary`, and `Overseer`.
- Profile image accepts a hosted URL or a browser-compressed local image.
- Header image: `/assets/alliance-header.png`.
- Favicon: `/favicon.ico`.

## Deployment

From the workspace root:

```powershell
npm run alliance:hub-check
npm run alliance:hub-deploy
npm --prefix refer-zo-bootstrap run alliance:sms-relay-deploy -- --deploy
```

The Alliance Hub deploy script uploads the Pages secrets without printing values. The Pages app needs Supabase URL, anon key, service role key for context lookups, profile form secret, SMS relay URL, and SMS relay token.

The Supabase relay deploy script sets relay secrets and deploys `alliance-sms-relay` with its own `X-Dispatcher-Token` gate.

## Verification

```powershell
npm run alliance:hub-check
npm --prefix alliance-android-sms-bridge test
npm --prefix refer-zo-bootstrap run check
```

Public checks:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri 'https://skqmzcdmfaijxpbvcdal.supabase.co/functions/v1/alliance-sms-relay/health'
Invoke-WebRequest -UseBasicParsing -Uri 'https://alliance.telechurchlive.com/'
Invoke-WebRequest -UseBasicParsing -Uri 'https://alliance.telechurchlive.com/favicon.ico'
Invoke-WebRequest -UseBasicParsing -Uri 'https://alliance.telechurchlive.com/assets/alliance-header.png'
```

Expected deployed behavior for an old token:

```text
Page route: HTTP 200 with "This link is no longer valid" and Reset instruction.
Session API: HTTP 410 Gone.
```

## Current Limits

- The Android bridge sends SMS text only, not MMS attachments.
- Group messaging should be implemented as one-recipient-per-SMS broadcast, not a shared group thread.
- Voice calling is not part of the SMS bridge.
- Image delivery should use links or the profile form uploader, not MMS, unless a separate MMS capability is built.
- Full STOP policy enforcement across every queue is still a required production hardening step.
