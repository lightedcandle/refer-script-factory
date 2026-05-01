import registry from "./registry.json" with { type: "json" };

const unknownIntentReply = registry.unknown_intent_reply;
const sectionStubReply = "Ok, we're still working on that section. We'll let you know once it is ready.";

export { registry, sectionStubReply, unknownIntentReply };

export function normalizeSmsIntentText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ");
}

export function suggestSmsScriptId(normalizedText) {
  const normalized = normalizeSmsIntentText(normalizedText);
  if (isGreetingIntent(normalized)) {
    return "alliance.sms_greeting_menu.v1";
  }
  if (/^profile$/.test(normalized)) {
    return "alliance.profile_link.question.v1";
  }
  const stub = stubIntent(normalized);
  if (stub) return stub.script_id;
  if (/\b(next|nxt|upcoming)\b/.test(normalized) && /\b(event|service|meeting|calendar|church)\b/.test(normalized)) {
    return "alliance.next_event.question.v1";
  }
  if (/\b(profile|profle|account)\b/.test(normalized) && /\b(link|edit|change|update|send)\b/.test(normalized)) {
    return "alliance.profile_link.question.v1";
  }
  if (/\b(group|groups|join|class|classes|team|teams)\b/.test(normalized)) {
    return "alliance.group_list.question.v1";
  }
  if (/\b(register|signup|sign up|rsvp)\b/.test(normalized) && /\b(event|service|sunday|meeting)\b/.test(normalized)) {
    return "alliance.event_register.sms.v1";
  }
  return "alliance.sms_script_draft.v1";
}

export function isGreetingIntent(normalizedText) {
  const normalized = normalizeSmsIntentText(normalizedText);
  return /^(hello|hi|hey|hey there|hey alliance|hello alliance|hi alliance)$/.test(normalized);
}

export function stubIntent(normalizedText) {
  const normalized = normalizeSmsIntentText(normalizedText);
  if (/^(events?|event list|calendar)$/.test(normalized)) {
    return { section: "events", script_id: "alliance.events.section.v1" };
  }
  if (/^(give|giving|donate|offering)$/.test(normalized)) {
    return { section: "give", script_id: "alliance.give.section.v1" };
  }
  if (/^(about|about alliance|the alliance)$/.test(normalized)) {
    return { section: "about", script_id: "alliance.about.section.v1" };
  }
  if (/^(my church|church|organization|my organization)$/.test(normalized)) {
    return { section: "my_church", script_id: "alliance.my_church.section.v1" };
  }
  if (/^(next event|next service|when is the next event|when is church)$/.test(normalized)) {
    return { section: "next_event", script_id: "alliance.next_event.question.v1" };
  }
  return null;
}

export function routeSmsIntent(body, options = {}) {
  const normalizedText = normalizeSmsIntentText(body);
  const suggestedScriptId = suggestSmsScriptId(normalizedText);
  const registered = Boolean(options.registered);
  const userName = options.userName || "there";

  if (!registered) {
    return {
      ok: true,
      routed: false,
      reason: "profile_registration_required",
      normalized_text: normalizedText,
      router_script_id: "alliance.sms_router.v1",
      suggested_script_id: "alliance.profile_setup.sms.v1",
    };
  }

  if (isGreetingIntent(normalizedText)) {
    return {
      ok: true,
      routed: true,
      reason: "registered_phone_greeting_menu",
      normalized_text: normalizedText,
      script_id: "alliance.sms_greeting_menu.v1",
      router_script_id: "alliance.sms_router.v1",
      response: [
        `Hello ${userName}, how are you today?`,
        "How can I help? You can quickly reply:",
        "Profile, Events, Give, About, My Church, Next Event",
      ].join("\n"),
      record_entity: "sms_script_run",
    };
  }

  if (/^profile$/.test(normalizedText)) {
    return {
      ok: true,
      routed: true,
      reason: "registered_phone_profile_link",
      normalized_text: normalizedText,
      script_id: "alliance.profile_link.question.v1",
      router_script_id: "alliance.sms_router.v1",
      response: "Alliance profile link will be sent when profile identity is available.",
      record_entity: "sms_route_decision",
    };
  }

  const stub = stubIntent(normalizedText);
  if (stub) {
    return {
      ok: true,
      routed: true,
      reason: "registered_phone_section_stub",
      normalized_text: normalizedText,
      script_id: "alliance.sms_section_stub.v1",
      router_script_id: "alliance.sms_router.v1",
      suggested_script_id: stub.script_id,
      section: stub.section,
      response: sectionStubReply,
      record_entity: "sms_notification_interest",
    };
  }

  return {
    ok: true,
    routed: true,
    reason: "registered_phone_unknown_intent",
    normalized_text: normalizedText,
    script_id: "alliance.sms_unknown_intent.v1",
    router_script_id: "alliance.sms_router.v1",
    suggested_script_id: suggestedScriptId,
    response: unknownIntentReply,
    record_entity: "sms_intake_gap",
  };
}

export function validateSmsScriptRegistry(value = registry) {
  const errors = [];
  if (value.schema !== "alliance.sms.script_registry.v1") errors.push("invalid_schema");
  if (!value.unknown_intent_reply) errors.push("missing_unknown_intent_reply");
  if (!Array.isArray(value.scripts)) errors.push("scripts_not_array");

  const ids = new Set();
  for (const script of value.scripts || []) {
    if (!script.id) errors.push("script_missing_id");
    if (script.id && ids.has(script.id)) errors.push(`duplicate_script_id:${script.id}`);
    if (script.id) ids.add(script.id);
    if (!script.status) errors.push(`script_missing_status:${script.id || "unknown"}`);
    if (!script.kind) errors.push(`script_missing_kind:${script.id || "unknown"}`);
    if (!script.description) errors.push(`script_missing_description:${script.id || "unknown"}`);
  }

  for (const required of [
    "alliance.sms_router.v1",
    "alliance.sms_unknown_intent.v1",
    "alliance.sms_intake_gap.v1",
  ]) {
    if (!ids.has(required)) errors.push(`missing_required_script:${required}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    script_count: ids.size,
  };
}
