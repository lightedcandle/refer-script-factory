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
- **Which pastor** is the church's pastor on record. The Hub already records who
  leads and who administers each church. *Not checked:* that every church's
  pastor has a mobile number on record that the line can text. The ruling says
  every church has a pastor; whether the system can reach each one is a fact to
  go and count, not to assume.
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
  the limit, one honest line goes back: it has not been forgotten.

### Crisis, unchanged

The 988 and 911 line is still added by the relay, always, when either the
relay's own check of the incoming text or the answerer's reason says crisis.
Either is enough; neither can switch the other off. The relay's check runs near
the front of the order in section 1, so a heavy message that happens to contain
"service" or "change" is not answered with an events list. The pastor is told at
once, on the short clock.

The relay's check is a word list, and a word list misses things. It is a floor
under the model, not a replacement for it.

## 6. What this does not prove

- **Nothing was built.** Every arrow in section 3 and every step in section 5
  is a drawing.
- **No text has ever reached a pastor through this, and no pastor's reply has
  ever travelled back.** The promise is the operator's and it stands; the
  machinery that keeps it does not exist yet.
- **Whether every pastor can be reached by text was not counted.**
- **Church matching is unproven at every step** beyond the Alliance-member case,
  and section 5 now depends on it entirely. Whether Telechurch's texts pass
  through this relay was not checked.
- **The model survives on the phone only under test conditions.** See
  `phone-coexistence-2026-10-12/README.md`: started from the cable it is
  unkillable, which a real app would not be.
- **The hosted engine was not measured here.** The phone-trial session reports a
  Cloudflare trial (Nemotron 3 Super, about 3 seconds a reply). The slot in
  section 3 holds either; a second engine is not decided.
- **The model invents.** Two phone runs, two different inventions. The rule that
  an answer must name a saved fact (section 4) is the proposed guard and has not
  been tried.
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
2. **Which church does a stranger's text belong to** when nothing matches it?
   Proposed: the guide asks, once, and until they say, the text goes to nobody's
   pastor and is shown at the app level as unplaced.
3. **May a pastor see the visitor's number**, to call them? Proposed: not by
   default; yes when the visitor asked for a call.

## Records

- `phone-coexistence-2026-10-12/` — the phone measurement, with its raw samples
  and the ten answers.
- Background: Telechurch repo, branch `claude/phone-trial-g10-windows-hooks`,
  `.claude/agent-context/phone-trial-2026-10-12/README.md`.
