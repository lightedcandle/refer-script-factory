#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHmac } from "node:crypto";

const cwd = process.cwd();
loadEnv(resolve(cwd, ".env.local"));
loadEnv(resolve(cwd, ".env"));
loadEnv(resolve(cwd, "..", ".env.master"));
loadEnv(resolve(cwd, "..", "refer-zo-bootstrap", ".env.local"));
if (process.env.ALLIANCE_SUPABASE_ENV) loadEnv(process.env.ALLIANCE_SUPABASE_ENV);
loadEnv("E:\\telechurch-e2e\\.env.master");

const relayBaseUrl = trimSlash(process.env.ALLIANCE_SMS_RELAY_URL || "https://skqmzcdmfaijxpbvcdal.supabase.co/functions/v1/alliance-sms-relay");
const dispatcherToken = process.env.ALLIANCE_DISPATCHER_TOKEN || "";
const recordFunction = process.env.ALLIANCE_SUPABASE_FUNCTION || "alliance-record-write";
const allianceHomeUrl = trimSlash(process.env.ALLIANCE_HOME_URL || "https://alliance.telechurchlive.com");
const allianceAboutUrl = trimSlash(process.env.ALLIANCE_ABOUT_URL || `${allianceHomeUrl}/about`);
const profileBaseUrl = trimSlash(process.env.ALLIANCE_PROFILE_BASE_URL || `${allianceHomeUrl}/member`);
const profileUploadBaseUrl = trimSlash(process.env.ALLIANCE_PROFILE_UPLOAD_BASE_URL || `${profileBaseUrl}/upload`);
const profileFormBaseUrl = trimSlash(process.env.ALLIANCE_PROFILE_FORM_BASE_URL || "https://alliance.telechurchlive.com/profile");
const eventsApiUrl = trimSlash(process.env.ALLIANCE_EVENTS_API_URL || `${allianceHomeUrl}/api/events?canonical=true`);
const profileFormSecret = process.env.ALLIANCE_PROFILE_FORM_SECRET || dispatcherToken || process.env.ALLIANCE_SMS_RELAY_TOKEN || "alliance-local-profile-form-secret";
const storePath = resolve(cwd, ".alliance-sms", "profile-contexts.json");
const command = process.argv[2] || "help";
const args = parseArgs(process.argv.slice(3));

const SCRIPT = {
  id: "alliance.profile_setup.sms.v1",
  label: "Alliance SMS Profile Setup",
  channel: "sms",
  reply_ownership: "foreground",
  creates: ["alliance_profile"],
  states: [
    "awaiting_start",
    "profile_link_sent",
    "completed",
    "cancelled",
    "paused",
  ],
};

try {
  if (command === "script") {
    console.log(JSON.stringify({ ok: true, script: SCRIPT }, null, 2));
  } else if (command === "detect") {
      const phone = normalizePhone(required(args.from || args.phone, "--from"));
      const message = required(args.message || args.body, "--message");
      console.log(JSON.stringify(detectProfileRoute(phone, message), null, 2));
  } else if (command === "context") {
    const phone = normalizePhone(required(args.phone || args.to || args.from, "--phone"));
    const store = readStore();
    console.log(JSON.stringify({ ok: true, context: store.contexts[phone] || null }, null, 2));
  } else if (command === "start") {
    const phone = normalizePhone(required(args.to || args.phone, "--to"));
    const result = await startProfileSetup(phone, !flagFalse(args.send));
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "reply") {
    const phone = normalizePhone(required(args.from || args.phone, "--from"));
    const message = required(args.message || args.body, "--message");
    const result = await handleReply(phone, message, !flagFalse(args.send));
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "selftest") {
    console.log(JSON.stringify(await selftest(), null, 2));
  } else {
    console.log(JSON.stringify({
      ok: true,
      commands: [
        "script",
        "detect --from PHONE --message TEXT",
        "start --to PHONE [--send false]",
        "reply --from PHONE --message TEXT [--send false]",
        "context --phone PHONE",
        "selftest",
      ],
    }, null, 2));
  }
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}

export function detectProfileRoute(phone, inboundBody) {
  if (isSmsReactionMessage(inboundBody)) {
    return {
      ok: true,
      should_route: false,
      ignored: true,
      reason: "sms_reaction_ignored",
      state: null,
      script_id: SCRIPT.id,
    };
  }

  const store = readStore();
  const reset = isResetCommand(inboundBody);
  const context = store.contexts[normalizePhone(phone)] || null;
  const session = context ? activeSession(context) : null;
  const active = Boolean(session && session.script_id === SCRIPT.id && !["completed", "cancelled", "paused"].includes(session.state));
  const registered = Boolean(context?.current_profile_id || context?.profiles?.length);
  const registeredIntent = registered && !reset;
  const starts = !registered;
  if (isEventIntent(inboundBody)) {
    return {
      ok: true,
      should_route: true,
      reason: "events_intent",
      state: session?.state || null,
      script_id: "alliance.events.section.v1",
    };
  }
  if (isFormulaIntent(inboundBody)) {
    return {
      ok: true,
      should_route: true,
      reason: "formula_intent",
      state: session?.state || null,
      script_id: "alliance.formula.intake.v1",
    };
  }
  return {
    ok: true,
    should_route: reset || active || starts || registeredIntent,
    reason: reset ? "profile_setup_reset" : active ? "active_profile_session" : starts ? "unregistered_phone" : "registered_phone_action_menu",
    state: session?.state || null,
    script_id: SCRIPT.id,
  };
}

async function startProfileSetup(phone, send) {
  const store = readStore();
  const context = ensureContext(store, phone);
  let session = activeSession(context);
  if (!session || session.script_id !== SCRIPT.id || ["completed", "cancelled"].includes(session.state)) {
    session = createSession(phone, "awaiting_start");
    context.active_script_session_id = session.id;
    context.active_flow = SCRIPT.id;
    context.script_sessions.push(session);
    addEvent(context, "system", "script_started", "Profile setup started.", session.id);
  }
  session.state = "profile_link_sent";
  session.request_count = Number(session.request_count || 0) + 1;
  session.form_token = session.form_token || profileFormToken(phone);
  session.form_url = profileFormUrl(session.form_token);
  const outbound = firstFormPrompt(session.form_url);
  addEvent(context, "outbound", "sms", outbound, session.id);
  writeStore(store);
  const record = send ? await writeAllianceRecord("sms_profile_intake_session", `Profile intake ${phone}`, {
    phone,
    script_id: SCRIPT.id,
    session_id: session.id,
    state: session.state,
    status: session.status,
    event: "started",
  }) : { ok: true, skipped: true };
  const delivery = send ? await queueSms(phone, outbound) : { ok: true, skipped: true };
  return { ok: delivery.ok, phone, script_id: SCRIPT.id, state: session.state, outbound, delivery, record };
}

async function handleReply(phone, inboundBody, send) {
  if (isSmsReactionMessage(inboundBody)) {
    return {
      ok: true,
      ignored: true,
      routed: false,
      reason: "sms_reaction_ignored",
      phone,
      script_id: SCRIPT.id,
      outbound: null,
      delivery: { ok: true, skipped: true },
      record: { ok: true, skipped: true },
      profile: null,
    };
  }

  const store = readStore();
  const context = ensureContext(store, phone);
  let session = activeSession(context);
  const reset = isResetCommand(inboundBody);
  const registeredProfileId = currentProfileId(context);
  if (isEventIntent(inboundBody)) {
    const eventResponse = await fetchUpcomingEvents();
    const outbound = formatEventReply(eventResponse.events);
    addEvent(context, "inbound", "sms", inboundBody, session?.id || null);
    addEvent(context, "outbound", "sms", outbound, session?.id || null);
    context.summary = "events_reply";
    writeStore(store);
    const record = !send ? { ok: true, skipped: true } : await writeAllianceRecord("sms_route_decision", `Alliance events ${phone}`, {
      phone,
      script_id: "alliance.events.section.v1",
      state: "events_reply",
      status: "active",
      inbound_body: inboundBody,
      event_count: eventResponse.events.length,
      event_source: eventResponse.source,
      event_error: eventResponse.error || null,
      event: "events_reply",
    });
    const delivery = send ? await queueSms(phone, outbound) : { ok: true, skipped: true };
    return {
      ok: delivery.ok,
      phone,
      script_id: "alliance.events.section.v1",
      state: "events_reply",
      outbound,
      delivery,
      record,
      events: eventResponse.events,
    };
  }
  if (isFormulaIntent(inboundBody)) {
    const formulaResponse = await routeHubFormulaIntent(phone, inboundBody, { profile_id: registeredProfileId || null }, send);
    if (formulaResponse) {
      addEvent(context, "inbound", "sms", inboundBody, null);
      addEvent(context, "outbound", "sms", formulaResponse.outbound, null);
      context.summary = formulaResponse.reason || "formula_response";
      writeStore(store);
      return {
        ok: formulaResponse.ok,
        phone,
        script_id: formulaResponse.script_id,
        state: formulaResponse.reason,
        outbound: formulaResponse.outbound,
        delivery: formulaResponse.delivery,
        record: formulaResponse.record,
        hub: formulaResponse.hub,
      };
    }
  }
  if (reset) {
    context.current_profile_id = null;
    context.active_flow = SCRIPT.id;
    context.summary = "profile_link_sent";
    context.profiles = [];
    session = createSession(phone, "awaiting_start");
    context.active_script_session_id = session.id;
    context.script_sessions = [session];
    context.conversation_events = [];
    addEvent(context, "system", "reset", "Profile setup reset by SMS command.", session.id);
  }
  if (!reset && registeredProfileId && (!session || ["completed", "cancelled", "paused"].includes(session.state))) {
    const outbound = registeredUserReply(inboundBody, registeredProfileId);
    addEvent(context, "inbound", "sms", inboundBody, null);
    addEvent(context, "outbound", "sms", outbound, null);
    context.summary = "registered_user_action_menu";
    writeStore(store);
    const record = !send ? { ok: true, skipped: true } : await writeAllianceRecord("sms_route_decision", `Registered Alliance SMS ${phone}`, {
      phone,
      script_id: "alliance.sms_registered_actions.v1",
      state: "registered_user_action_menu",
      status: "active",
      inbound_body: inboundBody,
      profile_id: registeredProfileId,
      event: "registered_action_reply",
    });
    const delivery = send ? await queueSms(phone, outbound) : { ok: true, skipped: true };
    return {
      ok: delivery.ok,
      phone,
      script_id: "alliance.sms_registered_actions.v1",
      state: "registered_user_action_menu",
      outbound,
      delivery,
      record,
      profile: null,
    };
  }
  if (!session || ["completed", "cancelled"].includes(session.state)) {
    session = createSession(phone, "awaiting_start");
    context.active_script_session_id = session.id;
    context.active_flow = SCRIPT.id;
    context.script_sessions.push(session);
  }

  addEvent(context, "inbound", "sms", inboundBody, session.id);
  const transition = advanceSession(session, reset ? "Hello Alliance" : inboundBody);
  session.updated_at = now();
  context.summary = summarizeContext(context, session);
  if (transition.profile) {
    context.current_profile_id = transition.profile.id;
    context.profiles.push(transition.profile);
  }
  if (transition.clearActive) {
    context.active_script_session_id = null;
    context.active_flow = null;
  }
  addEvent(context, "outbound", "sms", transition.outbound, session.id);
  writeStore(store);
  const record = !send ? { ok: true, skipped: true } : transition.profile
    ? await writeAllianceRecord("alliance_profile", `Alliance profile ${phone}`, transition.profile)
    : await writeAllianceRecord("sms_profile_intake_session", `Profile intake ${phone}`, {
      phone,
      script_id: SCRIPT.id,
      session_id: session.id,
      state: session.state,
      status: session.status,
      collected_values: session.collected_values,
      event: "advanced",
    });
  const delivery = send ? await queueSms(phone, transition.outbound) : { ok: true, skipped: true };
  return {
    ok: delivery.ok && transition.ok,
    phone,
    script_id: SCRIPT.id,
    state: session.state,
    collected_values: session.collected_values,
    outbound: transition.outbound,
    delivery,
    record,
    profile: transition.profile || null,
  };
}

function advanceSession(session, inboundBody) {
  const body = String(inboundBody || "").trim();
  const commandBody = body.toUpperCase();
  if (["STOP", "CANCEL"].includes(commandBody)) {
    session.state = "cancelled";
    session.status = "cancelled";
    session.completed_at = now();
    return {
      ok: true,
      clearActive: true,
      outbound: "Profile setup cancelled. You can text START later to begin again.",
    };
  }

  if (session.state === "paused" || session.status === "paused") {
    return {
      ok: true,
      outbound: null,
    };
  }

  if (session.state === "completed") {
    return {
      ok: true,
      outbound: "Your Alliance profile is already set up. Thank you.",
    };
  }

  session.request_count = Number(session.request_count || 0) + 1;
  session.form_token = session.form_token || profileFormToken(session.phone);
  session.form_url = profileFormUrl(session.form_token);
  session.state = "profile_link_sent";

  if (session.request_count >= 3) {
    session.status = "paused";
    session.state = "paused";
    return {
      ok: true,
      outbound: [
        "This number is paused from receiving more Alliance profile prompts until setup is complete.",
        "Please click the link below to complete your profile and authorize us to message you.",
        session.form_url,
        "Thank you.",
      ].join("\n"),
    };
  }

  if (session.request_count === 2) {
    return {
      ok: true,
      outbound: [
        "Please complete your Alliance profile to gain access.",
        "Your phone number is already attached to this secure form and cannot be changed there.",
        session.form_url,
      ].join("\n"),
    };
  }

  if (isSelfInitiatedGreeting(body) || commandBody === "START") {
    return {
      ok: true,
      outbound: firstFormPrompt(session.form_url),
    };
  }

  return {
    ok: true,
    outbound: [
      "Please complete your Alliance profile before we continue.",
      session.form_url,
    ].join("\n"),
  };
}

async function queueSms(phone, message) {
  if (!dispatcherToken) throw new Error("Missing ALLIANCE_DISPATCHER_TOKEN.");
  const response = await fetch(`${relayBaseUrl}/sms/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Dispatcher-Token": dispatcherToken,
    },
    body: JSON.stringify({ to: phone, message }),
  });
  const body = await response.json().catch(() => null);
  return {
    ok: response.ok && body?.ok !== false,
    status: response.status,
    body,
  };
}

async function writeAllianceRecord(entity, label, values) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return { ok: false, configured: false };
  }
  const payload = {
    entity,
    label,
    route: `alliance-profile-intake:${SCRIPT.id}`,
    local_dataset: "alliance-sms-profile-intake",
    status: values.status || "active",
    values: {
      ...values,
      source: SCRIPT.id,
      recorded_at: now(),
    },
  };
  const response = await fetch(`${trimSlash(process.env.SUPABASE_URL)}/functions/v1/${recordFunction}`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  return {
    ok: response.ok,
    configured: true,
    status: response.status,
    edge_function: recordFunction,
    id: Array.isArray(body) ? body[0]?.id : body?.id,
    error: response.ok ? undefined : body?.message || body?.error || "edge_write_failed",
  };
}

async function selftest() {
  const phone = "15550001000";
  const originalStorePath = storePath;
  const testStore = {
    schema: "alliance.sms.profile-contexts.v1",
    contexts: {},
  };
  const context = ensureContext(testStore, phone);
  const session = createSession(phone, "awaiting_start");
  context.active_script_session_id = session.id;
  context.active_flow = SCRIPT.id;
  context.script_sessions.push(session);

  const steps = [
    advanceSession(session, "Hello Alliance"),
    advanceSession(session, "What is this?"),
    advanceSession(session, "Hello Alliance"),
  ];
  const secondPhone = "15550001001";
  const secondSession = createSession(secondPhone, "awaiting_start");
  const legacySteps = [
    advanceSession(secondSession, "START"),
  ];
  const registeredProfileReply = registeredUserReply("Profile", "user-1000-test");
  const registeredEditReply = registeredUserReply("I would like to update my name", "user-1000-test");
  const registeredAmbiguousReply = registeredUserReply("What can I do?", "user-1000-test");
  const reactionDetection = detectProfileRoute(phone, 'Liked "Profile"');
  const quotedReactionDetection = detectProfileRoute(phone, '"liked Profile"');
  const emojiReactionDetection = detectProfileRoute(phone, "👍");
  return {
    ok: steps.every((step) => step.ok)
      && legacySteps.every((step) => step.ok)
      && session.state === "paused"
      && secondSession.state === "profile_link_sent"
      && registeredProfileReply.includes("/member/user-1000-test")
      && registeredEditReply.includes("/member/user-1000-test")
      && registeredEditReply.toLowerCase().includes("edit")
      && registeredAmbiguousReply.includes("Available links:")
      && reactionDetection.ignored === true
      && quotedReactionDetection.ignored === true
      && emojiReactionDetection.ignored === true,
    script_id: SCRIPT.id,
    final_state: session.state,
    profile_created: false,
    form_url_created: Boolean(session.form_url && session.form_url.includes(profileFormBaseUrl)),
    registered_profile_link_reply: registeredProfileReply,
    registered_profile_edit_reply: registeredEditReply,
    registered_ambiguous_reply: registeredAmbiguousReply,
    reaction_detection: reactionDetection,
    store_path: originalStorePath,
  };
}

function createSession(phone, state) {
  return {
    id: `session-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    phone,
    script_id: SCRIPT.id,
    state,
    collected_values: {},
    status: "active",
    request_count: 0,
    form_token: null,
    form_url: null,
    started_at: now(),
    updated_at: now(),
  };
}

function activeSession(context) {
  return context.script_sessions.find((session) => session.id === context.active_script_session_id) || null;
}

function ensureContext(store, phone) {
  if (!store.contexts[phone]) {
    store.contexts[phone] = {
      phone,
      person_id: null,
      current_profile_id: null,
      active_script_session_id: null,
      active_flow: null,
      summary: "",
      status: "active",
      script_sessions: [],
      conversation_events: [],
      profiles: [],
      created_at: now(),
      updated_at: now(),
    };
  }
  store.contexts[phone].updated_at = now();
  return store.contexts[phone];
}

function addEvent(context, direction, eventType, body, sessionId) {
  context.conversation_events.push({
    id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    phone: context.phone,
    direction,
    event_type: eventType,
    body,
    script_session_id: sessionId || null,
    created_at: now(),
  });
}

function summarizeContext(context, session) {
  const values = session.collected_values || {};
  const name = [values.first_name, values.last_name].filter(Boolean).join(" ");
  return [session.state, name].filter(Boolean).join(" | ");
}

function validateName(value, label) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (normalized.length < 1) return { ok: false, message: `Please send your ${label}.` };
  if (normalized.length > 80) return { ok: false, message: `That ${label} is too long. Please send a shorter ${label}.` };
  if (!/^[A-Za-z][A-Za-z '\-]*$/.test(normalized)) {
    return { ok: false, message: `Please send only your ${label}. Letters, spaces, apostrophes, and hyphens are okay.` };
  }
  return { ok: true, value: normalized };
}

function firstFormPrompt(formUrl) {
  return [
    "Hi, got your message. Please register here so your message can be passed on to the admin.",
    formUrl,
  ].join("\n");
}

function isSelfInitiatedGreeting(value) {
  return /^hello[, ]+alliance[.! ]*$/i.test(String(value || "").trim());
}

function isResetCommand(value) {
  return /^reset$/i.test(String(value || "").trim());
}

function isSmsReactionMessage(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  const unquoted = raw.replace(/^["'“”‘’]+/, "").trim();
  if (/^(liked|like|loved|laughed at|emphasized|disliked|questioned)\b/i.test(unquoted)) return true;
  return !/[A-Za-z0-9]/.test(raw) && /^[\s\p{Emoji}\uFE0F]+$/u.test(raw);
}

function profileIdForSession(session) {
  const existing = session.collected_values.profile_id;
  if (existing) return existing;
  return `user-${session.phone.slice(-4)}-${session.id.split("-").at(-1).slice(0, 8)}`;
}

function uploadUrlForSession(session) {
  return `${profileUploadBaseUrl}/${encodeURIComponent(profileIdForSession(session))}`;
}

function profileUrl(profileId) {
  return `${profileBaseUrl}/${encodeURIComponent(profileId)}`;
}

function currentProfileId(context) {
  return context.current_profile_id || context.profiles?.at(-1)?.id || "";
}

function registeredUserReply(inboundBody, profileId) {
  const normalized = String(inboundBody || "").trim().toLowerCase().replace(/[^\w\s']/g, " ").replace(/\s+/g, " ");
  const profileLink = profileUrl(profileId);
  if (/^profile$/.test(normalized)) {
    return [
      "Alliance profile link:",
      profileLink,
      "Open it to view your profile, edit it, or jump into available Alliance areas.",
    ].join("\n");
  }
  if (/\b(profile|account|info|settings|name)\b/.test(normalized) && /\b(update|edit|change|correct|fix)\b/.test(normalized)) {
    return [
      "Closest match: edit your Alliance profile.",
      profileLink,
      "Open your profile and tap Edit Profile to request a secure edit link.",
    ].join("\n");
  }
  return [
    "I can help with these Alliance links right now.",
    availableActionLinks(profileId),
  ].join("\n");
}

function isFormulaIntent(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[^\w\s']/g, " ").replace(/\s+/g, " ");
  return /\b(church|churches|organization|organizations|fellowship|fellowships|my church|my organization|my fellowship|the alliance|alliance directory|directory)\b/.test(normalized);
}

function isEventIntent(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[^\w\s']/g, " ").replace(/\s+/g, " ");
  return /\b(events?|calendar|service|services|upcoming|next event|next service|what is happening|what's happening|meeting|gathering|schedule)\b/.test(normalized);
}

async function routeHubFormulaIntent(phone, inboundBody, context, send) {
  const clean = String(inboundBody || "").trim();
  try {
    const response = await fetch(`${allianceHomeUrl}/phone/inbound`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dispatcher-Token": dispatcherToken,
      },
      body: JSON.stringify({
        from: phone,
        body: inboundBody,
        date: Date.now(),
        registered: Boolean(context?.profile_id),
        phone,
        transport: "android_bridge_dispatcher",
      }),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) return null;

    const outbound = String(
      body.response_text
        || body.clarification_question
        || body.error
        || body.response
        || "",
    ).trim();
    if (!outbound) return null;

    const record = await writeAllianceRecord("sms_route_decision", `Alliance formula ${phone}`, {
      phone,
      script_id: "alliance.formula.intake.v1",
      state: body.execution_mode || body.response_kind || "formula_response",
      status: "active",
      inbound_body: clean,
      response_kind: body.response_kind || null,
      execution_mode: body.execution_mode || null,
      clarification_token: body.clarification_token || null,
      formula_id: body.formula?.formula_id || null,
      event: body.response_kind === "clarify" ? "formula_clarify" : "formula_response",
    });
    const delivery = send ? await queueSms(phone, outbound) : { ok: true, skipped: true };
    return {
      ok: delivery.ok,
      routed: true,
      reason: body.response_kind === "clarify" ? "formula_clarify" : "formula_response",
      phone,
      script_id: "alliance.formula.intake.v1",
      outbound,
      delivery,
      record,
      hub: body,
    };
  } catch (error) {
    return {
      ok: false,
      routed: false,
      reason: error.message,
      phone,
      script_id: "alliance.formula.intake.v1",
      outbound: null,
      delivery: { ok: false, skipped: true, error: error.message },
      record: { ok: false, skipped: true, error: error.message },
      hub: null,
    };
  }
}

async function fetchUpcomingEvents(limit = 3) {
  try {
    const response = await fetch(eventsApiUrl);
    if (!response.ok) {
      return { ok: false, events: [], source: "events_api_http_error", error: `http_${response.status}` };
    }

    const body = await response.json().catch(() => null);
    const events = Array.isArray(body?.events) ? body.events : [];
    const filtered = events
      .filter((event) => String(event?.event_status || "active").toLowerCase() !== "cancelled")
      .filter((event) => {
        const start = parseEventTime(event?.event_start_time || event?.date || event?.startDate);
        return !start || start.getTime() > Date.now();
      })
      .sort((left, right) => {
        const leftTime = parseEventTime(left?.event_start_time || left?.date || left?.startDate)?.getTime() || 0;
        const rightTime = parseEventTime(right?.event_start_time || right?.date || right?.startDate)?.getTime() || 0;
        return leftTime - rightTime;
      })
      .slice(0, Math.max(1, Math.min(Number(limit) || 3, 5)));

    return {
      ok: true,
      events: filtered,
      source: body?.shape || "canonical",
    };
  } catch (error) {
    return {
      ok: false,
      events: [],
      source: "events_api_failed",
      error: error.message,
    };
  }
}

function formatEventReply(events) {
  const safeEvents = Array.isArray(events) ? events.slice(0, 3) : [];
  if (!safeEvents.length) {
    return [
      "I couldn't find upcoming events right now.",
      `Calendar: ${allianceHomeUrl}/calendar`,
    ].join("\n");
  }

  const lines = ["Upcoming events:"];
  for (const event of safeEvents) {
    const title = event.event_title || event.title || "Upcoming event";
    const date = formatEventDate(event.event_start_time || event.date || event.startDate);
    const location = event.event_location || event.location || "";
    const link = event.event_public_url || `${allianceHomeUrl}/calendar`;
    const summary = [date, location].filter(Boolean).join(" · ");
    lines.push(summary ? `${title}\n${summary}\n${link}` : `${title}\n${link}`);
  }
  lines.push(`Calendar: ${allianceHomeUrl}/calendar`);
  return lines.join("\n");
}

function formatEventDate(value) {
  if (!value) return "";
  const date = parseEventTime(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function parseEventTime(value) {
  if (!value) return new Date(NaN);
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T00:00:00`);
  }
  return new Date(raw);
}

function availableActionLinks(profileId) {
  return [
    "Available links:",
    `Home: ${allianceHomeUrl}/`,
    `About: ${allianceAboutUrl}/`,
    `Profile: ${profileUrl(profileId)}`,
    "You can also text: Events, Give, My Church, Next Event.",
  ].join("\n");
}

function profileFormToken(phone) {
  const payload = base64Url(JSON.stringify({ p: normalizePhone(phone), iat: Date.now() }));
  const signature = createHmac("sha256", profileFormSecret).update(payload).digest("base64url");
  return `v1.${payload}.${signature}`;
}

function profileFormUrl(token) {
  return `${profileFormBaseUrl}/${encodeURIComponent(token)}`;
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function readStore() {
  if (!existsSync(storePath)) {
    return {
      schema: "alliance.sms.profile-contexts.v1",
      contexts: {},
    };
  }
  return JSON.parse(readFileSync(storePath, "utf8"));
}

function writeStore(store) {
  mkdirSync(dirname(storePath), { recursive: true });
  const tmp = `${storePath}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`);
  renameSync(tmp, storePath);
}

function loadEnv(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index++) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    parsed[key] = next && !next.startsWith("--") ? next : "true";
    if (next && !next.startsWith("--")) index++;
  }
  return parsed;
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) throw new Error("Phone must contain 10 to 15 digits.");
  return digits;
}

function required(value, name) {
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

function flagFalse(value) {
  return String(value || "").toLowerCase() === "false";
}

function trimSlash(value) {
  return String(value || "").replace(/\/$/, "");
}

function now() {
  return new Date().toISOString();
}
