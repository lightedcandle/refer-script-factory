# Alliance Journey Build Plan

This is the REFER plan for building the Alliance app one page and one SMS leg at a time.

## Intake Contract

```json
{
  "schema": "refer.intake.v1",
  "domain": "alliance.sms-profile-app",
  "intent": "build Alliance Hub through paired web pages and SMS journey triggers",
  "authority": [
    "The Alliance Story/alliance_invisible_app_architecture.md",
    "refer-zo-bootstrap/scopes/alliance/story-authority.md",
    "refer-zo-bootstrap/scopes/alliance/phase2-data-contract.json",
    "docs/alliance-sms-profile-flow.md"
  ],
  "principle": "SMS is the app window; personal links are the focused work surface; durable records are the source of truth.",
  "delivery": "one page plus one SMS trigger per leg"
}
```

## Build Doctrine

The sustainable Alliance app surface is `alliance-hub`, deployed on Cloudflare
Pages with Supabase and the Android SMS bridge. Zo remains useful as prior
learning, vocabulary, and evidence from the proving instance, but new Alliance
product work should land in the Cloudflare Hub unless a task explicitly calls
for Zo runtime verification.

Script source should live in the Hub repository before it lives in a runtime:

```text
alliance-hub/scripts/sms/registry.json
alliance-hub/scripts/sms/router.mjs
alliance-hub/tools/sms-script-factory.mjs
```

Cloudflare and Supabase execute scripts at the edges, but the Hub owns their
names, contracts, statuses, and review flow.

Do not build a giant dashboard first. Build one useful page, connect it to one SMS notification or command, persist the result, then use that completed state to unlock the next page.

Each leg must ship with:

- a web page or personal link;
- an SMS notification, prompt, or command;
- a deterministic script id;
- a data contract update;
- an input ledger row;
- a journey-state transition;
- a verification check;
- a doc update.

The app should feel like:

```text
Text Alliance and Alliance knows me.
```

## Parallel Journeys

The build has two parallel journeys.

### User Journey

The user journey is the member or pastor-facing path. It advances by phone identity and personal links.

Core idea:

```text
SMS prompt
  -> personal page
  -> user input
  -> durable record
  -> next SMS prompt
```

### Alliance Journey

The Alliance journey is the organization/operator path. It advances the institution: organization setup, pastor linkage, calendar, groups, subscriptions, messaging, attendance, and follow-up.

Core idea:

```text
admin/operator page
  -> Alliance record
  -> journey state update
  -> routed SMS capability
  -> next operator page
```

## Journey Ledger

All inputs should be captured the way Script Factory captures process state.

Minimum record shape:

```json
{
  "schema": "alliance.input-ledger.v1",
  "id": "input-{timestamp}-{random}",
  "phone": "digits-only-or-null",
  "person_id": "optional",
  "organization_id": "optional",
  "journey_key": "profile_setup",
  "journey_leg": "profile.registration",
  "transport": "sms|web|admin",
  "route": "/profile/{token}",
  "script_id": "alliance.profile_setup.sms.v1",
  "input_type": "message|form|button|system",
  "input_summary": "short safe summary",
  "status": "received|accepted|rejected|completed",
  "created_at": "iso-date"
}
```

Do not rely on chat history as memory. Persist journey state and input summaries in Supabase through Edge Functions.

## Journey Legs

### 1. Profile Registration

Status: active.

User page:

```text
/profile/{signed-token}
/member/{profile-id}
```

SMS behavior:

- first inbound message sends the registration link;
- `RESET` restarts the attempt and invalidates older links;
- invalid links tell the user to text `Reset`;
- saved profile links to `/member/{profile-id}`;
- `Edit Profile` sends a 30-minute edit link by SMS.

Deterministic script:

```text
alliance.profile_setup.sms.v1
```

Records:

- `sms_message`
- `sms_profile_context`
- `alliance_profile`
- future `alliance_input_ledger`

Next unlock:

Organization setup.

### 1A. About Branch

Status: active.

Purpose:

Create the first public branch of the growing Alliance site so users can start from a general Alliance page, then move back into their remembered profile.
The page copy must be grounded in the full `The Alliance Story/` source set: Hub, Structure, Rhythm, Members, Leadership, Gifts, and invisible app architecture.

Public page:

```text
/
/about/
```

Home entry:

`/` is the abbreviated Alliance home page. It includes a phone-number form under
"Become a part of the Alliance" so a person can request a secure profile link by
SMS without first texting the bridge.

```text
Direct SMS
  -> alliance.profile_setup.sms.v1
  -> secure profile link

Home phone entry
  -> /api/profile-intake/start
  -> sms_profile_context
  -> secure profile link by SMS
```

Expired, used, replaced, or unverified profile links return the browser to
`/?link=expired`, where the home page displays a link-expired notice and the
phone entry form.

Profile backlink:

```text
/member/{profile-id}
```

Browser behavior:

- after profile save or profile view load, store the last profile id in local storage;
- About uses that browser memory to label the profile link as `My profile`;
- this memory is navigation convenience only, not authorization.

Gating rule:

Future branch links can appear publicly, but sensitive or group-specific actions must be enforced server-side by signed token, registered number, journey state, and group membership.

Profile editor context:

The profile form should include concise story context explaining that profile registration starts the journey into organization setup, calendar, groups, subscriptions, service opportunities, and routed SMS questions.

### 2. Organization Setup

Status: next.

Purpose:

Create the church or ministry organization record that the pastor belongs to.

User page:

```text
/organization/{signed-token}
/organization/{organization-id}
```

Alliance page:

```text
/dashboard/organizations
```

SMS behavior:

- after profile completion, send: "Set up your organization";
- `ORG` or `ORGANIZATION` returns the current setup link;
- invalid/used organization links instruct the user to text `Reset Organization`.

Deterministic script:

```text
alliance.organization_setup.sms.v1
```

Required fields:

- organization name;
- organization type;
- city/region;
- primary phone;
- public contact email;
- service location or online status;
- pastor/leader confirmation.

Records:

- `organization`
- `person.organization_link`
- `sms_organization_context`
- `alliance_input_ledger`

Next unlock:

Link pastor to organization.

### 3. Pastor to Organization Link

Status: planned.

Purpose:

Confirm that the registered person is a pastor, leader, administrator, or authorized representative for the organization.

User page:

```text
/link-pastor/{signed-token}
```

Alliance page:

```text
/dashboard/people
```

SMS behavior:

- after organization setup, send pastor-link confirmation;
- `LINK` returns the active link;
- approval or rejection sends a clear SMS result.

Deterministic script:

```text
alliance.pastor_org_link.sms.v1
```

Records:

- `person`
- `organization_person_link`
- `role_assignment`
- `alliance_input_ledger`

Next unlock:

Calendar setup.

### 4. Calendar Setup

Status: planned.

Purpose:

Create the organization calendar surface and first recurring gathering patterns.

User page:

```text
/calendar-setup/{signed-token}
```

Alliance page:

```text
/dashboard/calendar
```

SMS behavior:

- after pastor linkage, send calendar setup link;
- `CALENDAR` returns the calendar link;
- "When is the next event?" routes to the next public or organization-relevant event.

Deterministic scripts:

```text
alliance.calendar_setup.sms.v1
alliance.next_event.question.v1
```

Records:

- `event`
- `event_series`
- `appointment`
- `reminder`
- `alliance_input_ledger`

Next unlock:

Add events to calendar.

### 5. Add Calendar Event

Status: planned.

Purpose:

Let authorized leaders add services, trainings, meetings, conferences, or outreach events.

User page:

```text
/event/new/{signed-token}
/event/{event-id}
```

SMS behavior:

- `ADD EVENT` sends the event creation link;
- event saved sends confirmation and optional share link;
- members can text "When is the next event?" for deterministic lookup.

Deterministic scripts:

```text
alliance.event_create.sms.v1
alliance.event_lookup.sms.v1
```

Records:

- `event`
- `event_audience`
- `event_registration`
- `alliance_input_ledger`

Next unlock:

Groups.

### 6. Groups

Status: planned.

Purpose:

Create groups for ministries, regions, fellowships, training cohorts, volunteers, or private organization segments.

User page:

```text
/groups/{signed-token}
/group/{group-id}
```

SMS behavior:

- `GROUPS` shows groups available to the user;
- `JOIN {group}` requests or completes membership;
- group announcements are sent as individual SMS broadcasts, not shared group threads.

Deterministic scripts:

```text
alliance.group_create.sms.v1
alliance.group_join.sms.v1
alliance.group_broadcast.sms.v1
```

Records:

- `group`
- `group_membership`
- `communication`
- `alliance_input_ledger`

Next unlock:

Subscriptions.

### 7. Subscriptions

Status: planned.

Purpose:

Let users choose what kinds of messages they receive.

User page:

```text
/subscriptions/{signed-token}
```

SMS behavior:

- `SUBSCRIBE` returns subscription management link;
- `STOP` opts out of non-essential SMS;
- `START` can resume allowed messages;
- `RESET` remains scoped to profile setup unless command context says otherwise.

Deterministic scripts:

```text
alliance.subscription_manage.sms.v1
alliance.stop_policy.sms.v1
```

Records:

- `communication_preference`
- `sms_consent_event`
- `alliance_input_ledger`

Next unlock:

Routed SMS questions and automation.

### 8. Routed SMS Questions

Status: planned.

Purpose:

Make SMS a deterministic app window for common questions and commands.

Script Factory name:

The general factory capability is `Smart Intake`. The formal Script Factory
term is `Request Intake`. For Alliance SMS, the runtime entrypoint is
`alliance.sms_router.v1`.

Example questions:

- "Hello"
- "Hey Alliance"
- "When is the next event?"
- "Where is the service?"
- "Send my profile link."
- "Edit my profile."
- "What groups can I join?"
- "Register me for Sunday."

Routing rule:

```text
Inbound SMS
  -> normalize text
  -> match deterministic script
  -> check identity and journey state
  -> return answer or personal link
  -> record input and result
```

Deterministic scripts:

```text
alliance.sms_router.v1
alliance.sms_greeting_menu.v1
alliance.sms_section_stub.v1
alliance.sms_unknown_intent.v1
alliance.sms_intake_gap.v1
alliance.next_event.question.v1
alliance.profile_link.question.v1
alliance.group_list.question.v1
alliance.event_register.sms.v1
```

Active presets:

```text
Hello / Hi / Hey / Hey there / Hey Alliance
  -> personalized SMS menu

Profile
  -> member profile link

Events / Give / About / My Church / Next Event
  -> section-in-progress stub
  -> sms_notification_interest
```

Unknown intent fallback:

When a registered phone sends a message that does not yet match a deterministic
SMS script, the relay must:

1. Reply: `Let me check on this and get back with you soon.`
2. Record an `sms_intake_gap` row.
3. Store the original text, normalized text, suggested script id, router script
   id, and fallback response.
4. Leave the gap queued for Script Factory review so the repeated message can
   become a deterministic script.

SMS Script Factory lifecycle:

```text
Inbound SMS
  -> alliance.sms_router.v1
  -> known script answers now
  -> unknown script records sms_intake_gap
  -> repeated gaps become sms_script_candidate
  -> approved candidate is published to alliance-hub/scripts/sms/registry.json
  -> future matching SMS runs deterministically
```

Records:

- `sms_message`
- `sms_route_decision`
- `sms_intake_gap`
- `alliance_input_ledger`
- affected entity record.

## Build Sequence

Use this sequence for every new leg:

1. Define the journey leg contract.
2. Define the page route and fields.
3. Define the SMS trigger and deterministic responses.
4. Define records written and records read.
5. Add or update the Supabase Edge route.
6. Add the Cloudflare page/API route.
7. Add the deterministic local script or script draft.
8. Add verification checks.
9. Deploy the narrow changed surface.
10. Send one live SMS proof only when needed.
11. Update this plan and the flow doc.

## Next Build Contract

```json
{
  "schema": "refer.alliance.journey-leg.v1",
  "id": "alliance.organization_setup.leg.v1",
  "status": "next",
  "unlocked_by": "profile.registration.completed",
  "user_journey": "registered pastor receives organization setup link",
  "alliance_journey": "organization record is created and linked to pastor",
  "page": "/organization/{signed-token}",
  "dashboard": "/dashboard/organizations",
  "sms_triggers": ["ORG", "ORGANIZATION", "RESET ORGANIZATION"],
  "script_id": "alliance.organization_setup.sms.v1",
  "records": ["organization", "organization_person_link", "sms_organization_context", "alliance_input_ledger"],
  "verification": [
    "old organization link rejected",
    "organization saved",
    "pastor linked",
    "next SMS prompt sent"
  ]
}
```

## Open Decisions

- Whether organization setup belongs in Cloudflare Pages first, Zo Site first, or both with Cloudflare handling personal links and Zo handling dashboard views.
- Whether `alliance_records` remains the general event store or whether dedicated Supabase tables are promoted before organization setup.
- Where the admin/operator inbox lives for reviewing ambiguous SMS input.
- How strict STOP/START policy should be before broadcast messages are enabled.
- Whether subscriptions are free communication preferences first or paid subscriptions later.
