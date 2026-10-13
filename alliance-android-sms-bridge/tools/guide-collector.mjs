#!/usr/bin/env node
/**
 * The guide's collector: the piece that sits between the SMS relay's answer
 * queue and whatever model answers. It is NOT part of the bridge app and the
 * bridge never learns it exists.
 *
 *   relay /guide/next  ->  this  ->  the model  ->  this  ->  relay /guide/answer
 *
 * It is handed a question and never the sender's number. It sends no text: it
 * returns words, and the relay decides whether they go out.
 *
 *   node tools/guide-collector.mjs run   --cards <cards.json> [--env <.env.local>]
 *        [--relay <url>] [--model http://127.0.0.1:18080] [--log <file.jsonl>]
 *   node tools/guide-collector.mjs ask   --cards <cards.json> "what time is service"
 *   node tools/guide-collector.mjs selftest
 *
 * `ask` talks only to the model and prints the contract's answer-or-handoff; it
 * touches no relay. `selftest` needs neither.
 *
 * STAND-IN, said plainly. Contract assistant/1 puts a screen, the model and a
 * check inside "the Assistant", which the Telechurch Assistant session owns and
 * has not built as a service yet. Until it has, the three live here, taken from
 * that session's second phone trial (tools/factory/phone-guide-cards-trial.cjs,
 * picker mode, held to one shape): the model never writes to a visitor, it only
 * names which saved facts answer the question. When the real Assistant exists
 * this file shrinks to the two fetches.
 *
 * INFERRED wording, for the operator to overturn: the handoff sentences for
 * crisis, care and asked_for_pastor. The contract fixes the not_saved example
 * and the unreachable sentence; the other three are the trial's, reworded to
 * name the pastor.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_RELAY = "https://skqmzcdmfaijxpbvcdal.supabase.co/functions/v1/alliance-sms-relay";
const argv = process.argv.slice(2);
const command = argv[0];
const opt = (name, dflt) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : dflt);

// ---- outside the model ------------------------------------------------------
const CRISIS =
  /(kill(ing)? myself|suicid|end(ing)? (my life|it all)|better off without me|can'?t (keep going|go on)|think i can keep going|(hurt|harm)(ing)? myself|want to die|no reason to live|nobody would notice if i was gone)/i;
const CARE =
  /(passed away|\bdied\b|\bdeath\b|funeral|buried|griev|grief|lost my (mom|mother|dad|father|husband|wife|son|daughter|child|baby|brother|sister)|divorc|separat|abus|diagnos|cancer|hospital|pray (with|for) me|someone to pray|need(s)? prayer)/i;
const PERSON =
  /((pastor|minister|someone|somebody|a person).{0,30}(call|talk|speak|contact|reach))|((call|talk to|talk with|speak to|speak with).{0,20}(pastor|minister|someone|a person))/i;

// Asked-for-a-pastor is read before care: "can a pastor call me, I need someone
// to pray with" is a request, and "Yes" is the right first word for it. Found in
// the live trial of 2026-10-13 (Telechurch, tools/factory/sms-guide-collector.cjs).
const screen = (text) => (CRISIS.test(text) ? "crisis" : PERSON.test(text) ? "asked_for_pastor" : CARE.test(text) ? "care" : null);

const say = (church) => ({
  crisis: `I'm so sorry you are carrying this. I am passing your message to the pastor of ${church} right now, who will respond to you. If you are in danger or thinking of harming yourself, call or text 988 now, or call 911.`,
  care: `I'm so sorry. I am passing this to the pastor of ${church} now, who will respond to you.`,
  asked_for_pastor: `Yes. I am passing your message to the pastor of ${church}, who will respond to you.`,
  not_saved: `That answer has not been saved for ${church} yet, so I am passing your question to the pastor, who will respond to you.`,
  fault: `Thank you for your message. I am passing it to the pastor of ${church}, who will respond to you.`,
});

function loadCards(path) {
  const cards = JSON.parse(readFileSync(path, "utf8"));
  // Each fact carries what it is ABOUT, shown to the model and never sent.
  // Without it the live trial answered "do I need to dress up" with the church's name.
  const facts = [
    ...cards.church.facts.map((f) => ({ id: f.id, say: f.say, about: f.topic })),
    ...cards.app.entries.map((f) => ({ id: f.id, say: f.say, about: f.meets })),
  ];
  return { church: cards.church.name, churchId: cards.church.church_id, facts, byId: new Map(facts.map((f) => [f.id, f])) };
}

const handoff = (cards, reason, decidedBy, question) => ({
  contract: "assistant/1",
  kind: "handoff",
  text: say(cards.church)[reason],
  handoff: { reason, urgent: reason === "crisis", decided_by: decidedBy },
  ...(reason === "not_saved" ? { gap: { question, topic: null } } : {}),
});

// What the model's vote becomes, once the rules outside it have been applied.
export function decide(cards, question, vote) {
  const screened = screen(question);
  if (screened) return handoff(cards, screened, "screen", question);
  if (!vote || vote.fault) return handoff(cards, "fault", "check", question);
  // A pastor's saved answer that passed its second look is given whatever the
  // sorter voted: the live trial sorted a reworded question as PERSON and it
  // never reached the answer that had been saved for it.
  if (Array.isArray(vote.keptSaved) && vote.keptSaved.length) {
    return { contract: "assistant/1", kind: "answer", text: vote.keptSaved.map((x) => x.say).join(" "), used_facts: vote.keptSaved.map((x) => x.id) };
  }
  // The model's own PERSON vote hands off in neutral words. The word screen
  // owns "I'm so sorry"; the live trial sent it to someone asking what to wear.
  if (vote.vote === "PERSON") return { ...handoff(cards, "care", "model", question), text: say(cards.church).fault };
  const ids = Array.isArray(vote.ids) ? [...new Set(vote.ids)] : [];
  const real = ids.filter((id) => cards.byId.has(id));
  if (vote.vote !== "FACTS" || !real.length || real.length !== ids.length) {
    return handoff(cards, "not_saved", vote.vote === "NONE" ? "model" : "check", question);
  }
  // `kept` is what survived the second look. A picked fact that did not survive
  // is beside the point, and an answer beside the point is a handoff.
  const kept = Array.isArray(vote.kept) ? real.filter((id) => vote.kept.includes(id)) : real;
  if (!kept.length) return handoff(cards, "not_saved", "check", question);
  return { contract: "assistant/1", kind: "answer", text: kept.map((id) => cards.byId.get(id).say).join(" "), used_facts: kept };
}

async function chat(modelUrl, system, user, schema, timeoutMs) {
  const res = await fetch(`${modelUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: 80,
      temperature: 0,
      cache_prompt: true,
      // The model cannot produce anything but the shape it is given.
      response_format: { type: "json_schema", json_schema: { name: "shape", strict: true, schema } },
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`model said ${res.status}`);
  const raw = String(body?.choices?.[0]?.message?.content || "").trim();
  return { ...JSON.parse(raw), raw };
}

// The second look: one fact at a time, does it really answer what was asked?
// Picking alone was not enough in the live trial; with this it was 14 of 14, at
// a cost of about 1 second becoming 4 to 9.
async function fits(modelUrl, question, fact, timeoutMs) {
  const out = await chat(
    modelUrl,
    'You check one thing. A person sent a message to a church. Below is an answer the church has saved. Does that answer directly respond to what the person asked? Reply as JSON {"fits":"YES"} or {"fits":"NO"}. Say NO when the answer is about a different subject, even if it is true.',
    `Message: ${question}\nSaved answer (about ${fact.about || "the church"}): ${fact.say}`,
    { type: "object", properties: { fits: { enum: ["YES", "NO"] } }, required: ["fits"], additionalProperties: false },
    timeoutMs,
  );
  return out.fits === "YES";
}

// The sorter's vote, then the second look at each fact it picked. The whole
// thing has to fit inside the relay's wait (90 seconds), so each step has its
// own limit: one sort and at most two looks.
async function askModel(cards, question, modelUrl, timeoutMs, savedAnswers = []) {
  const saved = savedAnswers.filter((x) => x && /^S\d+$/.test(x.id) && x.say).slice(0, 40);
  const list = [...cards.facts, ...saved];
  const system = [
    `You sort text messages sent to ${cards.church}, a church. You never write a reply.`,
    'Read the message, then answer as JSON with a vote. When the vote is FACTS, add the ids of the facts that answer it, like {"vote":"FACTS","ids":["C2"]}. The three votes:',
    "FACTS: <ids, comma separated> - when one or more of the facts below directly answer the message.",
    "PERSON - when the message is about grief, a death, a crisis, self-harm, danger, a personal struggle, or asks for a pastor, a phone call or prayer with someone.",
    "NONE - when no fact directly answers it. Do not stretch a fact to fit. A link to the church's page does not answer a question about times, place, children, clothing, baptism or money.",
    "Facts:",
    ...list.map((f) => `[${f.id}] (about ${f.about || "the church"}) ${f.say}`),
  ].join("\n");
  try {
    const vote = await chat(modelUrl, system, question, {
      anyOf: [
        {
          type: "object",
          // At most two: the live trial answered "can I watch online" with three facts, two beside the point.
          properties: { vote: { const: "FACTS" }, ids: { type: "array", minItems: 1, maxItems: 2, items: { enum: list.map((f) => f.id) } } },
          required: ["vote", "ids"],
          additionalProperties: false,
        },
        { type: "object", properties: { vote: { enum: ["NONE", "PERSON"] } }, required: ["vote"], additionalProperties: false },
      ],
    }, Math.round(timeoutMs * 0.5));
    // Every saved answer gets its own look, whatever the vote, and before
    // anything from the general cards. At most four looks and two answers, so
    // the whole thing stays inside the relay's wait.
    const picked = vote.vote === "FACTS" ? [...new Set(vote.ids || [])] : [];
    const looks = [...saved, ...picked.filter((id) => !/^S\d+$/.test(id)).map((id) => cards.byId.get(id)).filter(Boolean)].slice(0, 4);
    const kept = [];
    const keptSaved = [];
    for (const fact of looks) {
      if (kept.length + keptSaved.length >= 2) break;
      if (!(await fits(modelUrl, question, fact, Math.round(timeoutMs * 0.12)))) continue;
      if (/^S\d+$/.test(fact.id)) keptSaved.push({ id: fact.id, say: fact.say });
      else kept.push(fact.id);
    }
    // A saved answer that fits is the answer; the general cards are not added to it.
    if (keptSaved.length) return { ...vote, keptSaved };
    if (vote.vote !== "FACTS") return vote;
    return { ...vote, ids: picked.filter((id) => cards.byId.has(id)), kept };
  } catch (error) {
    return { fault: String(error?.message || error) };
  }
}

function parseEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = raw.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function run() {
  const cards = loadCards(resolve(opt("--cards", "")));
  const env = { ...parseEnv(resolve(opt("--env", ".env.local"))), ...process.env };
  const token = env.ALLIANCE_DISPATCHER_TOKEN || env.ALLIANCE_SMS_RELAY_TOKEN;
  if (!token) throw new Error("No relay token: set ALLIANCE_DISPATCHER_TOKEN in the env file.");
  const relay = String(opt("--relay", env.ALLIANCE_SMS_RELAY_URL || DEFAULT_RELAY)).replace(/\/$/, "");
  const modelUrl = String(opt("--model", "http://127.0.0.1:18080")).replace(/\/$/, "");
  const logPath = resolve(opt("--log", ".alliance-sms/guide-collector.jsonl"));
  mkdirSync(dirname(logPath), { recursive: true });
  // Never the token, and there is no number here to write.
  const log = (row) => {
    const line = JSON.stringify({ at: new Date().toISOString(), ...row });
    appendFileSync(logPath, line + "\n");
    console.log(line);
  };
  const call = async (path, init = {}) => {
    const res = await fetch(`${relay}${path}`, {
      ...init,
      headers: { "content-type": "application/json", "x-dispatcher-token": token },
      signal: AbortSignal.timeout(20000),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  };
  log({ event: "started", church: cards.church, facts: cards.facts.length, model: modelUrl });
  let quiet = 0;
  for (;;) {
    try {
      const next = await call("/guide/next");
      const q = next.body?.question;
      if (!q) {
        // An older relay answers 404 here; a relay with the guide off says so.
        if ((next.status !== 200 || next.body?.guide === "off") && quiet++ % 100 === 0) log({ event: "relay_not_serving_questions", status: next.status, guide: next.body?.guide || null });
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      const started = Date.now();
      const screened = screen(q.question);
      // A question the screen takes is not held up waiting for the model.
      const vote = screened ? null : await askModel(cards, q.question, modelUrl, 70000, Array.isArray(q.saved_answers) ? q.saved_answers : []);
      const response = q.church_id && q.church_id !== cards.churchId
        ? handoff(cards, "fault", "check", q.question)
        : decide(cards, q.question, vote);
      const sent = await call("/guide/answer", { method: "POST", body: JSON.stringify({ id: q.id, response }) });
      log({
        event: "answered",
        question_id: q.id,
        question: q.question,
        first_contact: q.first_contact,
        model: vote ? vote.raw || vote.fault : null,
        kind: response.kind,
        reason: response.handoff?.reason || null,
        decided_by: response.handoff?.decided_by || "model",
        used_facts: response.used_facts || [],
        saved_answers_offered: Array.isArray(q.saved_answers) ? q.saved_answers.length : 0,
        seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
        relay: { status: sent.status, applied: sent.body?.applied ?? null, kind: sent.body?.kind || null, reason: sent.body?.reason || null },
      });
    } catch (error) {
      log({ event: "error", message: String(error?.message || error) });
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

function selftest() {
  const cards = {
    church: "Canary",
    churchId: "c",
    facts: [{ id: "A2", say: "Join by tapping Join This Church." }, { id: "C3", say: "Email us." }],
  };
  cards.byId = new Map(cards.facts.map((f) => [f.id, f]));
  const cases = [
    ["i dont think i can keep going anymore", { vote: "FACTS", ids: ["A2"] }, (r) => r.handoff?.reason === "crisis" && r.handoff.urgent && /988/.test(r.text) && r.handoff.decided_by === "screen"],
    ["my mom passed away tuesday", null, (r) => r.handoff?.reason === "care" && !r.handoff.urgent],
    ["can a pastor call me", { vote: "NONE" }, (r) => r.handoff?.reason === "asked_for_pastor"],
    ["how do i join", { vote: "FACTS", ids: ["A2"] }, (r) => r.kind === "answer" && r.text === "Join by tapping Join This Church." && r.used_facts[0] === "A2"],
    ["what should i wear", { vote: "NONE" }, (r) => r.handoff?.reason === "not_saved" && r.gap?.question === "what should i wear"],
    ["what should i wear", { vote: "FACTS", ids: ["Z9"] }, (r) => r.handoff?.reason === "not_saved" && r.handoff.decided_by === "check"],
    ["what should i wear", { vote: "FACTS", ids: [] }, (r) => r.handoff?.reason === "not_saved"],
    ["im struggling lately", { vote: "PERSON" }, (r) => r.handoff?.reason === "care" && r.handoff.decided_by === "model" && r.text.startsWith("Thank you for your message.")],
    ["can a pastor call me? i need someone to pray with", null, (r) => r.handoff?.reason === "asked_for_pastor" && r.text.startsWith("Yes.")],
    ["what should i wear", { vote: "FACTS", ids: ["A2"], kept: [] }, (r) => r.handoff?.reason === "not_saved" && r.handoff.decided_by === "check"],
    ["how do i join", { vote: "FACTS", ids: ["A2", "C3"], kept: ["A2"] }, (r) => r.kind === "answer" && r.used_facts.length === 1 && r.used_facts[0] === "A2"],
    ["what do people wear", { vote: "PERSON", keptSaved: [{ id: "S1", say: "Come as you are." }] }, (r) => r.kind === "answer" && r.text === "Come as you are." && r.used_facts[0] === "S1"],
    ["what do people wear", { vote: "NONE", keptSaved: [] }, (r) => r.handoff?.reason === "not_saved"],
    ["i want to die", { vote: "FACTS", ids: ["A2"], keptSaved: [{ id: "S1", say: "Come as you are." }] }, (r) => r.handoff?.reason === "crisis"],
    ["what time is service", { fault: "timeout" }, (r) => r.handoff?.reason === "fault" && r.text.startsWith("Thank you for your message.")],
  ];
  let failed = 0;
  for (const [question, vote, ok] of cases) {
    const result = decide(cards, question, vote);
    const pass = result.contract === "assistant/1" && ok(result);
    if (!pass) failed += 1;
    console.log(`${pass ? "ok  " : "FAIL"} ${question} / ${JSON.stringify(vote)} -> ${result.kind}${result.handoff ? ":" + result.handoff.reason : ""}`);
  }
  console.log(failed ? `${failed} FAILED` : "all passed");
  process.exit(failed ? 1 : 0);
}

if (command === "selftest") selftest();
else if (command === "ask") {
  const cards = loadCards(resolve(opt("--cards", "")));
  const question = argv[argv.length - 1];
  const vote = screen(question) ? null : await askModel(cards, question, String(opt("--model", "http://127.0.0.1:18080")), 70000);
  console.log(JSON.stringify({ model: vote, response: decide(cards, question, vote) }, null, 2));
} else if (command === "run") {
  run().catch((error) => {
    console.error(error?.message || error);
    process.exit(1);
  });
} else {
  console.error("usage: guide-collector.mjs run|ask|selftest --cards <cards.json> ...");
  process.exit(2);
}
