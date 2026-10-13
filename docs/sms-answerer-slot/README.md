# The answerer slot: where an AI guide sits beside the SMS bridge

Status: **design only. Nothing here is built, wired or deployed.**
Date: 2026-10-12. Thread: shelf G10 in the Telechurch repo (the SMS half).

Wiring waits on the operator's answers about the guide's name, voice and
greeting, and on the answerer contract the sibling session is writing in the
Telechurch repo. Until that contract exists, section 4 states what this design
assumes about it.

What is settled, and not reopened here (operator, 2026-10-12): the bridge stays
a carrier that knows nothing about any app; the guide is a separate answerer,
asked only when no fixed reply covers the message; each app supplies its own
knowledge cards; grief, crisis and pastor requests go to a person; and the
988/911 line is attached by the carrier side, never left to the model.

Five-seat reading (`refer.fivefold.md`): the guide answering a newcomer is
**Reach** at the group level. The handoff is **Care**, and Care's rule applies
in full: the guide notices and prepares, a person decides and speaks.

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

Proposed order for choosing the cards, cheapest first. All of it is design.

1. **The sender is known to an app and has a home church there**: that app's
   card and that church's card. (Needs a lookup the app owns; for Telechurch
   that is the sibling session's side.)
2. **A church texted this number recently**: the reply belongs to that church.
   The relay already keeps, with every outgoing text, the details the sending
   app attached to it, so this may be buildable from what is stored. *Not
   verified:* that Telechurch's texts go out through this relay at all, or that
   what it attaches names a church. There is a second bridge app on the phone,
   `com.sovereignnode.telecombridge`, not running; Telechurch's texts may travel
   another road.
3. **The text names a church** or carries a church's code.
4. **None of the above**: the app card only, and the guide may ask which church
   they mean. It must not guess one.

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

## 4. What this design assumes about the answerer's contract

The sibling session owns the contract. Until it exists, these are assumptions,
and each one is a place this design may have to bend.

In:

- the question, exactly as texted;
- the cards: one for the app, and one for the church when a church was matched;
- whether a church was matched at all;
- nothing that identifies the person. Not the number, not the name. (The relay
  keeps those and puts the greeting together itself.)
- no earlier messages. The trial was single questions only, and so is this.

Out, one of:

- **answer**: the words, and which card facts they came from;
- **handoff**: a reason from a short fixed list (grief, crisis, asks for a
  pastor, does not know, other), and optionally a kind sentence;

and nothing else. No instruction to send, no link the cards did not contain.

Assumed, and worth the sibling session saying yes or no to:

- "I do not have that fact" is a handoff with the reason *does not know*, not an
  answer. Both phone runs invented church facts (a dress code twice, baptism and
  its price), so the relay will not accept an answer that names no card fact.
- The crisis line is not the answerer's job and the relay will add it even when
  the answerer already wrote one.

## 5. The handoff: who is told, and how

Three parts. Only the first exists in any form.

### What the person who texted hears

Written by the carrier side, not by the model, so it is the same every time.

- A plain acknowledgement that a person will be in touch, in the church's name
  when a church was matched.
- **For crisis, the 988 and 911 line, always**, added by the relay. It is added
  when either of two things is true: the relay's own check of the incoming text
  says crisis, or the answerer's reason says crisis. Either is enough; neither
  can switch the other off. The relay's check runs near the front of the order
  in section 1, so a heavy message containing "service" or "change" is not
  answered with an events list.
- **The promise is only made when it can be kept.** "A person from the church
  will reach out" goes out only if there is a named person to tell. If there is
  not, the reply says what is true instead, and still carries the crisis line.

The relay's crisis check is a word list, and a word list misses things. It is a
floor under the model, not a replacement for it.

### Who is told

In order, the first that exists:

1. the church's own care contact, a person the church names for this;
2. the church's pastor or administrator on record (the Hub already records who
   administers a church);
3. a person at the app level, for texts where no church was matched or the
   church has named nobody.

No church has a named care contact today, and no app-level person is named for
this. **Both are empty seats, reported as such, not filled by guessing.**

### How they are told, and how it is known they were

- A handoff is written down as its own record: when, which church, the reason,
  and whether anyone has taken it. It is open until a person takes it.
- The person is told by a text from the same line, saying only that someone
  needs a person and where to look. Proposed: **the notice does not carry what
  was texted or the number.** Those are read after signing in. A grief message
  should not sit in a lock-screen preview.
- If nobody takes it within a set time, the next person in the list above is
  told. Crisis has a short clock, the others a longer one.
- Open handoffs are visible somewhere a person looks every day. Where is the
  sibling session's and the app's to say.

## 6. What this does not prove

- **Nothing was built.** Every arrow in section 3 is a drawing.
- **The model survives on the phone only under test conditions.** See
  `phone-coexistence-2026-10-12/README.md`: started from the cable it is
  unkillable, which a real app would not be. Running it for real needs an app
  or service on the phone that holds the model and collects from the queue, and
  none exists.
- **Church matching is unproven at every step** beyond the Alliance-member case.
  Whether Telechurch's texts pass through this relay was not checked.
- **The model invents.** Two runs, two different inventions. The card-fact rule
  in section 4 is the proposed guard and has not been tried.
- **No handoff has ever reached a person.** There is nobody named to reach.
- **One question at a time.** No follow-up, no memory of the last text.
- **The crisis word list has not been written or tested** against real phrasing.
- **Consent.** A reply to someone who texted first is one thing; a text to a
  pastor about someone else is another, and is bound by the app's own sending
  rules. Not examined here.
- **Cost of the queue on the phone's battery and data** was not measured. The
  bridge already polls every eight seconds; a second collector doubles that.

## 7. What is the operator's to decide

Beyond the name, voice and greeting already with him:

1. **Does a stranger's first text reach the guide, or the registration link?**
   Today it is the link, always. The guide's whole purpose is the stranger.
   Proposed: the guide answers, and the relay offers the registration link once
   alongside.
2. **What may a pastor's notice contain?** Proposed: nothing of what was texted;
   only that someone needs a person.
3. **Who is the person when a church has named nobody**, or no church was
   matched?

## Records

- `phone-coexistence-2026-10-12/` — the phone measurement, with its raw samples
  and the ten answers.
- Background: Telechurch repo, branch `claude/phone-trial-g10-windows-hooks`,
  `.claude/agent-context/phone-trial-2026-10-12/README.md`.
