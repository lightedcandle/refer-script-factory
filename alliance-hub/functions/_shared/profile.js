const distinctions = [
  "Apostle",
  "Bishop",
  "Church Administrator",
  "Deacon",
  "Elder",
  "Evangelist",
  "Guest",
  "Member",
  "Minister",
  "Ministry Worker",
  "Missionary",
  "Overseer",
  "Pastor",
  "Volunteer",
];

export { distinctions };

export async function decodeProfileToken(token, secret) {
  const raw = String(token || "").trim();
  if (!raw) return { ok: false, error: "missing_profile_token" };

  const signed = raw.match(/^v1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/);
  if (!signed) return { ok: false, error: "invalid_profile_token" };
  if (!secret) return { ok: false, error: "profile_form_secret_not_configured" };

  const payloadBytes = base64UrlDecode(signed[1]);
  const expected = await hmacSha256(`${signed[1]}`, secret);
  if (!timingSafeEqual(base64UrlDecode(signed[2]), expected)) {
    return { ok: false, error: "invalid_profile_token_signature" };
  }

  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return { ok: false, error: "invalid_profile_token_payload" };
  }

  const phone = onlyDigits(parsed.p);
  if (phone.length < 10 || phone.length > 15) return { ok: false, error: "invalid_profile_phone" };

  return {
    ok: true,
    phone,
    mode: cleanText(parsed.m || "register") || "register",
    profile_id: cleanText(parsed.pid || ""),
    issued_at: Number(parsed.iat || 0),
    expires_at: Number(parsed.exp || 0),
  };
}

export async function createProfileToken(payload, secret) {
  if (!secret) throw new Error("profile_form_secret_not_configured");
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(encoded, secret);
  return `v1.${encoded}.${base64UrlEncode(signature)}`;
}

export function tokenExpired(session, now = Date.now()) {
  return Boolean(session.expires_at && Number(session.expires_at) < now);
}

export function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function maskPhone(phone) {
  return phone.length > 4 ? `***${phone.slice(-4)}` : phone;
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function writeAllianceRecord(env, payload) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;
  const functionName = env.ALLIANCE_SUPABASE_FUNCTION || "alliance-record-write";
  if (!url || !key) return { ok: false, configured: false, error: "supabase_not_configured" };

  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      configured: true,
      status: response.status,
      error: result?.message || result?.error || "alliance_record_write_failed",
    };
  }
  return {
    ok: true,
    configured: true,
    id: Array.isArray(result) ? result[0]?.id : result?.id,
  };
}

export async function latestProfileContext(env, phone) {
  const rows = await supabaseRest(env, `/alliance_records?entity=eq.sms_profile_context&route=eq.${encodeURIComponent(`alliance-profile-context:${onlyDigits(phone)}`)}&order=updated_at.desc&limit=1&select=id,status,values,updated_at`);
  return Array.isArray(rows) ? rows[0] : null;
}

export async function latestProfile(env, profileId) {
  const rows = await supabaseRest(env, `/alliance_records?entity=eq.alliance_profile&route=eq.${encodeURIComponent(`alliance-profile:${cleanText(profileId)}`)}&order=updated_at.desc&limit=1&select=id,status,values,updated_at`);
  return Array.isArray(rows) ? rows[0] : null;
}

export async function updateProfileContext(env, id, phone, values, status = values.status || "active") {
  if (!id) return writeAllianceRecord(env, {
    entity: "sms_profile_context",
    label: `SMS profile context ${onlyDigits(phone)}`,
    route: `alliance-profile-context:${onlyDigits(phone)}`,
    local_dataset: "alliance-sms-profile-intake",
    status,
    values,
  });

  const rows = await supabaseRest(env, `/alliance_records?id=eq.${encodeURIComponent(id)}&select=id`, {
    method: "PATCH",
    body: {
      entity: "sms_profile_context",
      label: `SMS profile context ${onlyDigits(phone)}`,
      route: `alliance-profile-context:${onlyDigits(phone)}`,
      local_dataset: "alliance-sms-profile-intake",
      status,
      values,
    },
  });
  return { ok: true, id: Array.isArray(rows) ? rows[0]?.id : rows?.id };
}

export async function validateCurrentProfileToken(env, token, session) {
  if (!session.ok) return session;
  if (tokenExpired(session)) return { ok: false, error: "profile_token_expired" };

  const context = await latestProfileContext(env, session.phone);
  if (!context) return { ok: false, error: "profile_context_not_found" };

  const values = context.values || {};
  if (session.mode === "edit") {
    if (values.edit_form_token !== token) return { ok: false, error: "profile_token_replaced" };
    if (values.edit_form_token_used_at) return { ok: false, error: "profile_token_used" };
    if (values.edit_form_token_expires_at && Date.parse(values.edit_form_token_expires_at) < Date.now()) {
      return { ok: false, error: "profile_token_expired" };
    }
    return { ok: true, context, values };
  }

  if (values.form_token !== token) return { ok: false, error: "profile_token_replaced" };
  if (values.state === "completed" || values.status === "completed" || values.form_token_used_at) {
    return { ok: false, error: "profile_token_used" };
  }
  return { ok: true, context, values };
}

export async function queueSms(env, to, message, metadata = {}) {
  const relayUrl = env.ALLIANCE_SMS_RELAY_URL || "https://skqmzcdmfaijxpbvcdal.supabase.co/functions/v1/alliance-sms-relay";
  const token = env.ALLIANCE_SMS_RELAY_TOKEN || env.ALLIANCE_DISPATCHER_TOKEN;
  if (!token) return { ok: false, error: "sms_relay_token_not_configured" };
  const response = await fetch(`${relayUrl.replace(/\/$/, "")}/sms/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Dispatcher-Token": token,
    },
    body: JSON.stringify({ to, message, metadata }),
  });
  const result = await response.json().catch(() => null);
  return {
    ok: response.ok && result?.ok !== false,
    status: response.status,
    body: result,
  };
}

export async function supabaseRest(env, path, init = {}) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase_service_role_not_configured");
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1${path}`, {
    method: init.method || "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || result?.error || "supabase_rest_failed");
  return result;
}

function base64UrlEncode(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function hmacSha256(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index];
  return diff === 0;
}
