import {
  createProfileToken,
  json,
  latestProfileContext,
  maskPhone,
  onlyDigits,
  queueSms,
  updateProfileContext,
} from "../../_shared/profile.js";

const profileFormBaseUrl = "https://alliance.telechurchlive.com/profile";

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const phone = onlyDigits(body.phone);
  if (phone.length < 10 || phone.length > 15) {
    return json({ ok: false, error: "invalid_phone" }, 400);
  }

  const existing = await latestProfileContext(context.env, phone).catch(() => null);
  const existingValues = existing?.values || {};
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  if (existingValues.status === "completed" && existingValues.profile_id) {
    const profileUrl = `https://alliance.telechurchlive.com/member/${encodeURIComponent(existingValues.profile_id)}`;
    const delivery = await queueSms(context.env, phone, [
      "Alliance profile link:",
      profileUrl,
      "Use this link to view your profile. Tap Edit Profile there if you need a secure edit link.",
    ].join("\n"), {
      source: "alliance_home_profile_link_existing",
      script_id: "alliance.profile_link.question.v1",
      profile_id: existingValues.profile_id,
    });
    return json({
      ok: delivery.ok,
      mode: "existing_profile",
      phone_display: maskPhone(phone),
      delivery,
    }, delivery.ok ? 200 : 502);
  }

  const token = await createProfileToken({ p: phone, iat: now }, context.env.ALLIANCE_PROFILE_FORM_SECRET);
  const formUrl = `${profileFormBaseUrl}/${encodeURIComponent(token)}`;
  const values = {
    ...existingValues,
    phone,
    script_id: "alliance.profile_setup.sms.v1",
    state: "profile_link_sent",
    status: "active",
    collected_values: existingValues.collected_values || {},
    request_count: Number(existingValues.request_count || 0) + 1,
    form_token: token,
    form_url: formUrl,
    form_token_used_at: null,
    home_start_requested_at: nowIso,
    events: [
      ...(existingValues.events || []),
      {
        direction: "inbound",
        body: "Alliance Hub home phone entry",
        source: "alliance_home_phone_entry",
        at: nowIso,
      },
      {
        direction: "outbound",
        body: formUrl,
        source: "alliance_home_phone_entry",
        at: nowIso,
      },
    ].slice(-50),
  };

  const saved = await updateProfileContext(context.env, existing?.id || null, phone, values, "active");
  const delivery = await queueSms(context.env, phone, [
    "Welcome to Alliance Hub.",
    "Complete your Alliance profile here:",
    formUrl,
  ].join("\n"), {
    source: "alliance_home_phone_entry",
    script_id: "alliance.profile_setup.sms.v1",
    context_id: saved.id,
  });

  return json({
    ok: delivery.ok,
    mode: "registration_link",
    phone_display: maskPhone(phone),
    sms_context: saved,
    delivery,
  }, delivery.ok ? 200 : 502);
}
