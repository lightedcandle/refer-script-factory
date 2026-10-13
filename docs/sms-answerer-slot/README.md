# The answerer slot: where an AI guide sits beside the SMS bridge

Status: **design only. Nothing here is built, wired or deployed.**
Date: 2026-10-12. Thread: shelf G10 in the Telechurch repo (the SMS half).

Wiring waits on the operator's answers about the guide's name, voice and
greeting, and on a handoff reaching a pastor end to end on Canary. The contract
this door builds against is the Assistant session's `assistant/1` in the
Telechurch repo (proposed, not yet on main); section 4 says what it settles.

What is settled, and not reopened here (operator, 2026-10-12): the bridge stays
a carrier that knows nothing about any app; the guide is a separate answerer,
asked only when no fixed reply covers the message; each app supplies its own
knowledge cards; grief, crisis and pastor requests go to a person; and the
988/911 line is attached by the carrier side, never left to the model.

**Operator ruling, 2026-10-12, relayed by the phone-trial session** (section 5
was rewritten for it the same day): "All churches have pastors, and its the
pastors job to answer the questions. The ai is answering all the answers the
pastor saved in the db and any pastor in the app is in the business of
responding to their respondents. That is the whole purpose of telechurch. Its
digital ministry. So i see no false promise but a universal expectation."

So handing a text to the pastor is the main act of this door, not an exception.
The guide speaks from what the pastor has already saved; everything else is the
pastor's to answer. The guide may always say a pastor will respond, and the
carrier side exists to make that true.

Five-seat reading (`refer.fivefold.md`): the guide answering a newcomer is
**Reach** at the group level. The handoff is **Care**, and Care's rule applies
in full: the guide notices and prepares, the pastor decides and speaks, and what
is said goes out in the pastor's name.

---

## 1. What happens to a text today

Read from the relay's source
(`refer-zo-bootstrap/scopes/alliance/supabase/functions/alliance-sms-relay/index.ts`)
and checked against the copy actually running (version 96, read back from
Supabase; the routing code matches by reading, it was not compared byte for
byte).

A text reaches the phone. The bridge app passes it to the relay in the cloud
with three things only: who it is from, what it says, and when. The relay then
tries these in order and stops at the first that fits.

1. **Its own number, or a repeat** of a text it already has: ignored.
2. **STOP, START and the other consent words**, when they are the whole message:
   passed to the Alliance Hub, which passes them to Telechurch. No other
   handling.
3. **The one test phone**: tried against the Hub's test lane first.
4. **Anything that sounds like an events question**, from anybody. The words
   that trigger it are broad: event, calendar, service, meeting, gathering,
   schedule, upcoming. The reply is the Alliance events list.
5. **RESET**: starts profile setup again.
6. **If the number has finished an Alliance profile:**
   - a bare greeting gets the menu (Profile, Events, Give, About, My Church,
     Next Event);
   - any message containing profile, account, info, settings, name, update,
     edit or change gets the profile link;
   - the menu words get either the Hub's answer or "we're still working on that
     section";
   - anything else is offered to the Hub's formula engine;
   - **and if the Hub has nothing, the text is written down as a gap and nobody
     replies.**
7. **If the number has not finished a profile:** every message, whatever it
   says, gets the registration link. After the third, silence.

### Where the answerer goes

**In the last line of step 6: the moment the relay today writes a gap and says
nothing.** That is the one place where every fixed handler has already declined.
In the code it is the end of `advanceProfileIntake`, where
`recordSmsIntakeGap` is called. The gap record should still be written; the
answerer is asked as well.

Three things in the present order would stop that from being enough. They are
findings, not changes made.

- **Strangers never reach it.** Step 7 answers every unregistered number with
  the registration link. The questions the guide was trialled on ("how do I
  join", "is there parking") come from exactly those people. Today a visitor in
  crisis who texts the line is told to register.
- **Two broad word lists sit in front of it and take the guide's questions.**
  Checked by running the relay's own patterns over the ten trial questions:
  "what time is service on sunday" is taken by step 4 and answered with the
  Alliance events list. Two made-up heavy messages were also taken: "i missed
  the service because i wanted to end it all" (events list) and "can someone
  change my mind about living" (profile link). The other nine trial questions
  fall through to the slot.
- **A registered person in crisis gets no reply at all today** (the gap in
  step 6).

So the crisis check cannot live only in the answerer at the end of the line. It
has to run near the front, straight after the consent words. See section 5.

Two documents in this repo said otherwise and were corrected with this record:
`docs/alliance-sms-profile-flow.md` claimed an unknown text gets "Let me check
on this and get back with you soon." It gets nothing. The same file said STOP
was not yet passed on. It is.

## 2. How a text is matched to a church or an app

**It is not.** This is the largest gap between what is settled and what exists.

- There is one phone and one number. The bridge does not say which number a
  text arrived on, and there is only one for it to be.
- The relay knows the sender's number and nothing else. From it, it learns one
  fact: whether that number has finished an **Alliance** profile.
- A church appears only further in, inside the Hub: sender's number, to Alliance
  profile, to the church on that profile. Telechurch does its own lookup by
  number, but only to act on STOP and START.
- Nothing matches a text to a church by a keyword, by a code, or by which church
  last texted that person.

So "Telechurch Live supplies an app card and a per-church card" has, today,
nothing to choose the church with for anyone who is not already a member with a
church on their profile. A newcomer is by definition not that.

**How a stranger's first text finds its church is with the operator.** He has
been given three directions by the Assistant session and has not chosen. The
list below is what this door could do under any of them, not a choice made for
him. All of it is design.

1. **The sender is known to an app and has a home church there**: that app's
   card and that church's card. (Needs a lookup the app owns; for Telechurch
   that is the sibling session's side.)
2. **A church texted this number recently**: the reply belongs to that church.
   The relay already keeps, with every outgoing text, the details the sending
   app attached to it, so this may be buildable from what is stored.
   *Checked 2026-10-12, counts only, no numbers or message text read:* in the
   last 60 days the relay's outbox holds 27 texts marked as Telechurch's, all on
   one day (2026-09-27), all carrying the same single tenant id, beside 514
   unmarked texts (the Alliance's own). So Telechurch's texts do pass through
   this relay and do carry a tenant. Telechurch's code sets that tenant to the
   church's id unless a fixed value is configured. *Still not known:* whether
   that one id is a church or the fixed value, since one id cannot tell the two
   apart, and why Telechurch has sent nothing through here since. There is a
   second bridge app on the phone, `com.sovereignnode.telecombridge`, not
   running.
3. **The text names a church** or carries a church's code. Every church
   already has a short code (Canary's is `oL6bHiV`), so nothing new would have
   to be invented for this.
4. **None of the above**: no church is guessed. What happens then is part of
   what he is choosing.

Which app, when a number is known to more than one: no rule exists. The consent
words avoid the question by going to every app. An answer cannot do that; two
apps answering one text reads as a broken system. Until there is a rule, the
slot serves one app per line.

## 3. The slot

The relay is in the cloud. The model is on the phone and listens only to the
phone itself. The cloud cannot call into the phone, and should not be able to.
The bridge already solves the same problem for texts: the cloud writes a job
down, and the phone comes and collects it. The answerer uses the same pattern,
as its own separate collector.

```text
text arrives
  -> bridge (unchanged) -> relay
       fixed handlers, in today's order, plus the crisis check near the front
       nothing fits
       -> relay writes a QUESTION to the answer queue, with the cards
              ...an answerer collects it, wherever it lives...
       <- answerer writes back ANSWER or HANDOFF
       -> relay applies the carrier's rules (section 5)
       -> relay queues the reply as an ordinary outgoing text
  -> bridge (unchanged) sends it
```

- **The bridge app does not change.** It never learns a guide exists. It still
  only carries texts in and out.
- **The answerer never sends a text.** It hands words back. The relay decides
  whether they go out, and what goes with them.
- **Moving the answerer is a change of who collects**, not a change to the
  bridge or the relay. On the phone, a small worker beside the model collects.
  On the sovereign node, the node collects. In the cloud, the relay can skip the
  queue and call it directly. The question and the answer are the same shape in
  all three.
- **The queue can be the record store the relay already writes everything to**
  (`alliance_records`, a new kind of record). That needs no change to the
  database's structure. A dedicated table would be tidier and is a migration,
  which is never done without the operator.
- **If no answer comes back in time, that is a handoff**, not silence. Measured
  on the phone: 2 to 5 seconds with the screen on, 15 to 30 with it off. A
  limit of about 90 seconds leaves room for a sleeping phone. The same holds if
  the answer is empty, malformed, too long, or the answerer is simply not
  running.

## 4. The contract this is built against

The contract now exists: `refer.app/refer.telechurch.assistant.contract.md` in
the Telechurch repo, contract `assistant/1`, branch `claude/assistant-plan-g10`
(pull request 903, commit `00faed5f`, proposed and not yet on main). Read
2026-10-12. It replaces the assumptions this section used to hold. In its words
this relay is a **door**, and what this document calls the answerer it calls
the **Assistant**.

What the door sends, and so what a question on the queue in section 3 holds:
the contract number, the door (`sms`), the church's id, the question exactly as
texted, whether this is the person's first text, and the two cards. No number,
no name, no earlier messages.

What comes back, always one of two:

- **an answer**: the words, and the ids of the saved facts they rest on;
- **a handoff**: the words to send, a reason (`crisis`, `care`,
  `asked_for_pastor`, `not_saved`, `fault`), whether it is urgent (true exactly
  for crisis), and for `not_saved` a note of what was asked so it can go on the
  church's list of unanswered questions.

What that settles for the door:

- **The door sends the Assistant's words unchanged**, for a handoff as well.
  The fixed wording for grief and crisis lives with the Assistant, outside the
  model. An earlier draft of this document had the relay writing that reply
  itself; that is withdrawn.
- **The door does not decide what is a crisis.** The Assistant's own screen
  does. The relay's word list has two narrower jobs, in section 5.
- **The door refuses an answer that names no saved fact** (the contract's
  rule 6), even though the Assistant should never return one.
- **The door delivers every handoff to the pastor**, and an urgent one at once.
- **No door carries the Assistant to real visitors until a handoff reaches a
  pastor end to end on Canary** (rule 5). That is the gate on wiring, beside
  the operator's answers.
- **The save-this-answer loop is adopted** as the contract's section 5. Where a
  saved answer is kept does not exist yet and needs a database change and the
  operator's yes.

Three places the door still has nothing to stand on:

- **The cards cannot be fetched yet.** The endpoint that hands a door both cards
  for a church does not exist. Until it does, a door builds against the two
  example files on the Telechurch branch `claude/assistant-trial-real-facts`:
  `canary-cards.json` (Canary's real facts) and `invented-filled-cards.json`.
- **The church's id is the door's to work out**, and for a stranger it cannot
  (section 2).
- **When the Assistant cannot be reached at all.** The contract promises the
  Assistant always returns something, a `fault` handoff at worst. That holds
  while it is running. If the phone is off or the collector has stopped, nothing
  comes back, and the door is not allowed to write a reply of its own. Raised
  with the Assistant session and answered the same day in the contract's
  section 5 (commit `d6f0692d`, read from the file): the door hands the
  question to the pastor and sends exactly "Thank you for your message. I am
  passing it to the pastor of {church}, who will respond to you." `{church}` is
  the name on the church's card, or "the church" when there is no card. If the
  door's word list reads the message as a crisis it adds the crisis line and
  tells the pastor at once. So this one is closed on paper; what remains open is
  the waiting limit before the door decides the Assistant is unreachable.

On timing: the Assistant session measured 15 to 30 seconds for the first reply
after a church's cards change, with the screen on. This session measured the
same for any reply with the screen off. Both at once was not measured, so the
90-second limit in section 3 is a guess that may be too short.

## 5. The handoff to the pastor, and the pastor's reply back

Rewritten 2026-10-12 for the operator's ruling at the top of this document. The
first draft treated the handoff as an exception and proposed making the promise
"a person will reach out" only when someone was on record to keep it. That is
withdrawn. The promise is always made. The work is on the carrier side: make it
true every time, and make it plain when it has not been kept yet.

That takes three things, and none of them exists yet.

### 5a. The pastor is actually told

- Every text the guide does not answer from the pastor's saved answers becomes
  an open **question for the pastor**: written down with the church, the time,
  the reason, and whether it has been answered. It stays open until it is.
- The pastor is told by a text from the same line. The notice has to carry
  enough for the pastor to answer from their own phone, which for an ordinary
  question means the question itself.
- **Which pastor** is the church's pastor on record. Counted by the Assistant
  session, read-only from the live Telechurch database, 2026-10-12 (not re-run
  here): all 6 active churches have a mobile number for the person who created
  the church; 5 of the 6 have a named host with a number; one church has no
  host and no church phone. So a first person to text exists for every church
  today, though for one of them it is the founder and not a named host.
- **There is no step where a pastor agrees to this, and no switch to turn it
  off.** Operator, 2026-10-13, relayed by the phone-trial session and now in
  the contract's rule 5 in his words: a pastor has taken on responsibility for
  the people who come to their ministry and cannot bypass it; the only way out
  is to unpublish the church; "the pastor is always the first point of
  contact". An earlier draft of this document listed the pastor's agreement as
  a missing record. That is withdrawn. What is left is practical: which number
  the app holds for each pastor.
- **A published church whose pastor cannot be reached is a fault in that
  church's setup**, to be shown and fixed. It is not a case the door routes
  around. Today that is one church of six (no host and no church phone).
- **This makes church matching (section 2) the thing everything rests on.** A
  text that cannot be matched to a church has no pastor to go to. The ruling
  answers who the person is; it does not answer which church a stranger's text
  belongs to.

### 5b. The pastor's reply travels back by text

The visitor texted a phone number, so the answer comes back from that number.
Two roads for the pastor's reply, both ending in the same place.

- **From the app.** The pastor opens the question, writes the answer, and the
  app sends it through the bridge like any other text. Nothing new is needed on
  the carrier side. Where this lives in the app is the Assistant session's and
  the app's to say.
- **By replying to the notice.** The pastor answers the text they were sent.
  The relay sees a text from a number it knows to be a pastor with an open
  question, and passes the words on to the visitor. This needs one new fixed
  handler near the front of the order in section 1, before the guide is ever
  asked, so a pastor's reply is never answered by the guide.
  - One open question: the reply goes to that visitor.
  - Several open: each notice carries a short number, and the pastor starts the
    reply with it. A reply the relay cannot place is never guessed at; the
    pastor is asked which one.

Either way:

- **It goes out in the pastor's name**, so the visitor knows a person answered.
  The exact wording waits on the voice and greeting.
- **The visitor's number is not shown to the pastor by default.** The relay
  carries the words both ways, so it does not need to be. Whether a pastor may
  see it, to call someone, is in section 7.
- **The reply closes the question**, and the time it took is kept.
- **A pastor's answer is a saved answer waiting to happen.** The ruling says the
  guide speaks from what the pastor saved. Each reply to a new question could be
  offered back to the pastor: "save this, so the guide can answer it next time?"
  That is how the guide gets better without anyone writing cards. Proposed to
  the Assistant session, which owns the cards; not designed here.

### 5c. It is visible when nobody has answered

A universal expectation is only as good as the worst wait. So:

- Every open question shows its age, to the pastor and to whoever the church
  lets see it.
- When one has waited too long, the pastor is reminded once, and then it is
  shown to the church's other leaders on record. How long is "too long" is a
  number to set with the operator, shorter for crisis than for parking.
- Above the church, the app sees the picture across churches: how many
  questions are open, the longest wait, which churches answer and which have
  gone quiet. That is Care at the app level, asking of churches what a pastor
  asks of people.
- The visitor is not left guessing either. If a question is still open after
  the limit, one honest line goes back. The wording is fixed in the contract's
  section 5 (commit `d6f0692d`): "Your message is with the pastor of {church}
  and has not been forgotten. A pastor will respond to you." It is sent once
  per question and never repeated, and the door reminds the pastor at the same
  moment, because the sentence is only true if it does. The limit is proposed
  as 24 hours and is not ruled, so the door keeps it as a setting. It does not
  apply to an urgent handoff; how fast a crisis must reach a person is unsettled
  and belongs to the Assistant plan.

### Crisis, unchanged

Corrected 2026-10-12 against the contract. The 988 and 911 line is already in
the Assistant's fixed wording for an urgent handoff, written outside the model.
So the relay does **not** add it every time. It checks, and adds the line only
when it is missing, in two cases: an urgent handoff, and a `fault` on a message
the relay's own word list reads as a crisis. Never twice, never reworded.

The relay's word list has one other job, and it is not deciding what a crisis
is. It runs near the front of the order in section 1 so that a heavy message
which happens to contain "service" or "change" skips the events list and the
profile link and goes straight to the Assistant, whose own screen decides.

An urgent handoff reaches the pastor at once, on the short clock.

A word list misses things. The Assistant session's second trial showed it: the
screen missed both heavy messages written in words it had not seen, and the
model caught them. Neither guard is enough alone.

## 6. What this does not prove

- **Nothing was built.** Every arrow in section 3 and every step in section 5
  is a drawing.
- **No text has ever reached a pastor through this, and no pastor's reply has
  ever travelled back.** The promise is the operator's and it stands; the
  machinery that keeps it does not exist yet.
- **Which number reaches each pastor is not settled.** Numbers exist for all 6
  active churches (the Assistant session's count, not re-run here), but for one
  it is the founder's and not a host's. No agreement from the pastor is needed
  (ruled 2026-10-13).
- **STOP ends texts to a pastor's number; it never ends the pastor being the
  contact.** Ruled by the operator, 2026-10-13, relayed by the phone-trial
  session and recorded in his words in the Telechurch phone-trial record: a
  published church's pastor must always be reachable through at least one
  channel outside the app, text or email; text is "just a channel" and the same
  work can be done by email or on the platform. With no outside channel live
  the pastor is directed to unpublish, change the number, or name someone else
  as owner. So the carrier's rule and "no off switch" no longer collide. How
  the notices move to email is being proposed to him by that session and is
  the app's side, not this door's.
- **What a pastor's STOP does, ruled 2026-10-13** (his full words are in the
  Telechurch phone-trial record; this is a reading of them): one final text
  says texts have stopped and messages will now go to their email; after that
  no text goes to that number; the notices go by email, which is the app's
  side. Texting START, or choosing text in the app, reopens it. If email is
  closed as well the app takes over, and that part is not this door's.
- **The one final text already exists, in another voice.** Read from
  Telechurch's `sms-bridge-inbound` on main: when a number with a Telechurch
  profile texts STOP it is already sent a confirmation ("Stop Detected: you
  have been unsubscribed from Telechurch text messages…"), which says nothing
  about email. If the door sent its own final text as well, a pastor would get
  two. So the final text has to be that one message, reworded for a pastor,
  and it lives on the app's side. The door sends nothing on STOP.
- **So the door's whole duty is the lookup.** Before texting a pastor's
  number: has it opted out? If so, no text, and the notice is handed to the
  email channel. Required by the ruling, and not built.
- **This door does not yet honour a pastor's STOP itself.** Found while
  recording the ruling. The relay passes STOP on to the apps, and each app
  stops its own sends. The guide's notices are queued by the relay directly
  and check nothing. Today that reaches only the operator's own test pastor
  number. Before any real pastor is behind this door, it has to ask whether
  that number has opted out, and if so hand the notice to the other channel
  and not text it.
- **Church matching is unproven at every step** beyond the Alliance-member case,
  and section 5 now depends on it entirely. Telechurch's texts do pass through
  this relay (27 in 60 days, one day, one tenant id); that the id names a
  church is not established.
- **The model survives on the phone only under test conditions.** See
  `phone-coexistence-2026-10-12/README.md`: started from the cable it is
  unkillable, which a real app would not be.
- **The hosted engine was not measured here.** The phone-trial session reports a
  Cloudflare trial (Nemotron 3 Super, about 3 seconds a reply). The slot in
  section 3 holds either; a second engine is not decided.
- **The model invents when trusted alone.** Two phone runs here, two different
  inventions. With the Assistant's screen and check around it, that session
  reports sixteen questions with nothing invented, one sample each. That is
  their measurement, not re-run here, and one sample is not a rate.
- **One question at a time.** No follow-up, no memory of the last text. A
  pastor's reply and the visitor's answer to it are a conversation, and this
  design carries only the first exchange.
- **The crisis word list has not been written or tested** against real phrasing.
- **Consent.** A reply to someone who texted first is one thing. Notices and
  reminders to pastors are texts the line starts, and are bound by the app's own
  sending rules and by STOP. Not examined here.
- **The load on a pastor was not estimated.** Until answers are saved, nearly
  every question goes to the pastor.

## 7. What is the operator's to decide

Beyond the name, voice and greeting already with him. The ruling settled who
answers (the pastor, always) and that the promise is made. What is left:

1. **Does a stranger's first text reach the guide, or the registration link?**
   Today it is the link, always. The ruling reads as: answer them. Proposed: the
   guide answers, and the relay offers the registration link once alongside.
2. **How a stranger's first text finds its church.** Already with him, as three
   directions from the Assistant session. Nothing is proposed here on top of
   them.
3. **May a pastor see the visitor's number**, to call them? Proposed: not by
   default; yes when the visitor asked for a call.
4. ~~How a pastor says yes to being texted visitors' questions.~~ Ruled
   2026-10-13: they do not; a published church's pastor is reached. What this
   left was what happens when a pastor texts STOP. Also ruled, the same day:
   STOP ends texts to that number and the pastor's notices go by another
   outside channel. The detail of that handover is with him now, from the
   phone-trial session.
5. **How long a visitor waits before being told the pastor has not replied
   yet.** The Assistant session proposes 24 hours. And, separately, how fast a
   crisis must reach a person, which nobody has proposed a number for.

## Records

- `phone-coexistence-2026-10-12/` — the phone measurement, with its raw samples
  and the ten answers.
- Background: Telechurch repo, branch `claude/phone-trial-g10-windows-hooks`,
  `.claude/agent-context/phone-trial-2026-10-12/README.md`.
