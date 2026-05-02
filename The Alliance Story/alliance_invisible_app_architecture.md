# Alliance Invisible App Architecture

## Core Vision

The platform is conversation-first, not website-first.

Users interact primarily through:

- SMS
- Email
- Web chat
- Dynamic personal links
- Push notifications later
- WhatsApp later

The app runs in the background while the system tracks:

- identity
- journeys
- appointments
- attendance
- giving
- uploads
- reminders
- ministry progression
- engagement history
- AI memory summaries

The user experience should feel like:

> “Text Alliance and Alliance knows me.”

The user’s phone becomes the application.

---

# Primary User Flow

## Initial Contact

User sends:

```txt
Hello Alliance
```

System responds:

```txt
Welcome to Alliance 👋

I can help you with services, reminders, prayer, giving, training, or fellowship.

Continue here:
https://alliancehub.org/c/a8K29x
```

Behind the scenes:

- create provisional user
- create conversation thread
- assign organization context
- initialize journey state
- initialize AI memory

---

# Main Architectural Principle

Do not build giant dashboards first.

Build reusable capabilities first.

Examples:

- collect email
- collect name
- create appointment
- send reminder
- confirm attendance
- upload profile photo
- request prayer
- show service format
- send giving link
- connect to leader

The AI chooses which capability to invoke.

---

# REFER Layer Mapping

## Body

User-facing surfaces:

- SMS responses
- email responses
- personal chat pages
- CTA cards
- upload pages
- giving pages
- service format pages

## Mind

Supabase stores:

- users
- profiles
- conversation threads
- messages
- journeys
- roles
- attendance
- appointments
- reminders
- AI summaries

## Spirit

Cloudflare handles:

- routing
- orchestration
- signed links
- realtime sessions
- AI invocation
- transport adapters
- reminder scheduling

---

# MVP Scope

## Ship Now

- SMS inbound webhook
- Android bridge adapter
- user identity by phone
- thread creation
- secure personal links
- dynamic chat page
- AI intent classification
- collect name/email
- attendance reminders
- service-day check-in
- giving links

## Schedule Later

- WhatsApp
- push notifications
- voice notes
- leader dashboard
- profile photos
- uploads
- vector memory
- multi-org routing

---

# Transport Architecture

Use a unified transport layer.

Never hard-code Twilio or Android bridge into business logic.

## Transport Types

- sms
- email
- web_chat
- whatsapp
- push

## Provider Types

- android_bridge
- twilio
- resend
- gmail
- whatsapp_business
- web

## Transport Adapter Contract

```ts
export interface TransportAdapter {
  normalizeInbound(payload: unknown): NormalizedInboundMessage;
  sendMessage(input: SendMessageInput): Promise<void>;
}
```

---

# Android Bridge Role

Android bridge becomes one transport provider.

Flow:

```txt
User SMS
→ Android Phone
→ Android Bridge Webhook
→ Cloudflare Worker
→ Normalize Message
→ Identify User
→ AI Orchestration
→ Generate Secure Link
→ Send SMS Reply
```

Benefits:

- low cost
- real phone number
- two-way messaging
- easy MVP testing

---

# Database Model

## users

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  primary_phone text unique,
  primary_email text,
  display_name text,
  profile_photo_url text,
  status text default 'provisional',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## user_profiles

```sql
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  preferred_name text,
  communication_preference text default 'sms',
  timezone text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## conversation_threads

```sql
create table conversation_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  org_id uuid,
  status text default 'active',
  current_intent text,
  current_journey_key text,
  last_message_at timestamptz,
  ai_summary text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## conversation_messages

```sql
create table conversation_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references conversation_threads(id) on delete cascade,
  user_id uuid references users(id),
  direction text,
  transport text,
  provider text,
  body text,
  intent text,
  category text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
```

## user_roles

```sql
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  org_id uuid,
  role_key text,
  confidence numeric default 1.0,
  status text default 'inferred',
  created_at timestamptz default now()
);
```

---

# Journey System

## journeys

```sql
create table journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  org_id uuid,
  journey_key text,
  status text default 'active',
  current_step text,
  progress jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Journey Examples:

- new_visitor
- service_attendance
- ministry_training
- prayer_followup
- giving_followup

---

# Appointment and Reminder Flow

## appointments

```sql
create table appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  org_id uuid,
  event_id uuid,
  title text,
  starts_at timestamptz,
  attendance_status text,
  created_at timestamptz default now()
);
```

## reminders

```sql
create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  appointment_id uuid references appointments(id),
  transport text default 'sms',
  remind_at timestamptz,
  status text default 'pending',
  created_at timestamptz default now()
);
```

Flow:

```txt
User: “I’ll be there Sunday”
→ create appointment
→ schedule reminder
→ ask “Are you here?”
→ if yes, send service format and giving links
```

---

# Personal Link System

Never expose raw IDs.

Bad:

```txt
/message/12345
```

Good:

```txt
https://alliancehub.org/c/a8K29x
```

## personal_links

```sql
create table personal_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  user_id uuid references users(id),
  thread_id uuid references conversation_threads(id),
  purpose text,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now()
);
```

Purposes:

- continue_chat
- upload_profile_photo
- confirm_attendance
- give
- read_message

---

# Dynamic Chat Page

Route:

```txt
/c/:token
```

Page Responsibilities:

- validate token
- load thread
- load AI summary
- render messages
- render CTA cards
- allow uploads
- continue conversation

CTA Examples:

- Remind Me
- I’m Here
- Watch Online
- Give
- Request Prayer
- Contact Leader

---

# AI Orchestration Pipeline

Every message flows through:

```txt
normalize
→ identify user
→ load memory
→ classify intent
→ select capability
→ execute workflow
→ update memory
→ respond
```

## Intent Categories

- greeting
- provide_email
- provide_name
- appointment_intent
- attendance_yes
- prayer_request
- giving_intent
- leadership_question
- unknown

---

# Progressive Identity Discovery

Never force giant registration forms.

Identity unfolds naturally.

Examples:

## Collect Email

```txt
Sure 👋

What email should I send it to?
```

## Collect Name

```txt
By the way, what should we call you?
```

## Save Contact Prompt

```txt
You can save this number as Alliance so we’ll recognize you next time.
```

---

# Service Day Flow

## Before Service

```txt
Hey Bob 👋

Just a reminder that service begins at 11AM today.
```

## During Service Window

```txt
Are you here with us today?

[ Yes ]
[ Running Late ]
[ Watching Online ]
```

## If Yes

```txt
Welcome 👋

Here is today’s service format:
https://alliancehub.org/service/s8K2

Give here:
https://alliancehub.org/give/bob
```

---

# Email Strategy

Use email for:

- training materials
- long-form communication
- notes
- documents
- weekly summaries

Use SMS for:

- wake-up messages
- reminders
- urgent communication
- continuation links

---

# Cost Optimization

Best pattern:

```txt
1 SMS
→ opens personal web session
→ unlimited interaction on web
```

This minimizes SMS cost.

---

# Capability Engine

## Capability Examples

- collect_email
- collect_name
- create_appointment
- confirm_attendance
- send_service_format
- send_giving_link
- create_prayer_request
- upload_profile_photo

The AI selects capabilities dynamically.

---

# Human Escalation

Escalate to leaders when needed:

- urgent prayer
- counseling
- crisis language
- branch church onboarding
- leadership matters

## followup_tasks

```sql
create table followup_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  thread_id uuid references conversation_threads(id),
  assigned_to uuid,
  reason text,
  priority text,
  status text default 'open',
  created_at timestamptz default now()
);
```

---

# MVP Build Sequence

## Phase 1

- users
- threads
- messages
- Android bridge
- SMS webhook
- secure links

## Phase 2

- dynamic chat page
- CTA cards
- thread persistence

## Phase 3

- AI intent classifier
- collect name/email
- memory summaries

## Phase 4

- appointment flow
- reminders
- attendance confirmation

## Phase 5

- service-day surface
- giving links
- prayer request flow

## Phase 6

- multi-stream communication
- email integration
- transport fallback

---

# Recommended Routes

```txt
POST /api/transports/android/inbound
POST /api/conversations/:threadId/messages
GET  /c/:token
POST /c/:token/reply
POST /api/reminders/run
POST /api/attendance/confirm
GET  /service/:token
GET  /give/:token
```

---

# Cloudflare / Supabase Split

## Cloudflare

- transport webhooks
- orchestration
- signed links
- realtime coordination
- AI routing

## Supabase

- durable storage
- users
- messages
- appointments
- reminders
- journeys
- AI summaries

---

# Guardrails

- never expose raw IDs
- validate all signed tokens
- always store inbound/outbound messages
- support STOP/unsubscribe
- never aggressively push giving
- escalate serious emotional distress

---

# MVP Definition

The first complete MVP:

```txt
A user texts “Hello Alliance.”

The system creates or recognizes them,
creates a thread,
sends a secure link,
opens a personal chat page,
collects name/email progressively,
allows attendance intent,
sends reminders,
confirms attendance,
and delivers service and giving links.
```

---

# Final Architectural Principle

You are not building a traditional website.

You are building:

- a conversational operating system
- a relational engagement engine
- an AI-guided ministry infrastructure
- an invisible app where the user’s phone becomes the interface
