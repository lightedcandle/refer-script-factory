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

const screen = (text) => (CRISIS.test(text) ? "crisis" : CARE.test(text) ? "care" : PERSON.test(text) ? "asked_for_pastor" : null);

const say = (church) => ({
  crisis: `I'm so sorry you are carrying this. I am passing your message to the pastor of ${church} right now, who will respond to you. If you are in danger or thinking of harming yourself, call or text 988 now, or call 911.`,
  care: `I'm so sorry. I am passing this to the pastor of ${church} now, who will respond to you.`,
  asked_for_pastor: `Yes. I am passing your message to the pastor of ${church}, who will respond to you.`,
  not_saved: `That answer has not been saved for ${church} yet, so I am passing your question to the pastor, who will respond to you.`,
  fault: `Thank you for your message. I am passing it to the pastor of ${church}, who will respond to you.`,
});

function loadCards(path) {
  const cards = JSON.parse(readFileSync(path, "utf8"));
  const facts = [...cards.church.facts, ...cards.app.entries].map((f) => ({ id: f.id, say: f.say }));
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
  if (vote.vote === "PERSON") return handoff(cards, "care", "model", question);
  const ids = Array.isArray(vote.ids) ? [...new Set(vote.ids)] : [];
  const real = ids.filter((id) => cards.byId.has(id));
  if (vote.vote !== "FACTS" || !real.length || real.length !== ids.length) {
    return handoff(cards, "not_saved", vote.vote === "NONE" ? "model" : "check", question);
  }
  return { contract: "assistant/1", kind: "answer", text: real.map((id) => cards.byId.get(id).say).join(" "), used_facts: real };
}

async function askModel(cards, question, modelUrl, timeoutMs) {
  const system = [
    `You sort text messages sent to ${cards.church}, a church. You never write a reply.`,
    'Read the message, then answer as JSON with a vote. When the vote is FACTS, add the ids of the facts that answer it, like {"vote":"FACTS","ids":["C2"]}. The three votes:',
    "FACTS: <ids, comma separated> - when one or more of the facts below directly answer the message.",
    "PERSON - when the message is about grief, a death, a crisis, self-harm, danger, a personal struggle, or asks for a pastor, a phone call or prayer with someone.",
    "NONE - when no fact directly answers it. Do not stretch a fact to fit. A link to the church's page does not answer a question about times, place, children, clothing, baptism or money.",
    "Facts:",
    cards.facts.map((f) => `[${f.id}] ${f.say}`).join("\n"),
  ].join("\n");
  // The model cannot produce anything but one of the three shapes.
  const shape = {
    type: "json_schema",
    json_schema: {
      name: "pick",
      strict: true,
      schema: {
        anyOf: [
          {
            type: "object",
            properties: { vote: { const: "FACTS" }, ids: { type: "array", minItems: 1, items: { enum: cards.facts.map((f) => f.id) } } },
            required: ["vote", "ids"],
            additionalProperties: false,
          },
          { type: "object", properties: { vote: { enum: ["NONE", "PERSON"] } }, required: ["vote"], additionalProperties: false },
        ],
      },
    },
  };
  try {
    const res = await fetch(`${modelUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        messages: [{ role: "system", content: system }, { role: "user", content: question }],
        max_tokens: 48,
        temperature: 0,
        cache_prompt: true,
        response_format: shape,
      }),
    });
    const body = await res.json();
    if (!res.ok) return { fault: `model said ${res.status}` };
    const raw = String(body?.choices?.[0]?.message?.content || "").trim();
    try {
      return { ...JSON.parse(raw), raw };
    } catch {
      return { fault: "unreadable", raw };
    }
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
      const vote = screened ? null : await askModel(cards, q.question, modelUrl, 70000);
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
    ["im struggling lately", { vote: "PERSON" }, (r) => r.handoff?.reason === "care" && r.handoff.decided_by === "model"],
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
