import {
  cleanText,
  decodeProfileToken,
  distinctions,
  json,
  maskPhone,
  updateProfileContext,
  validateCurrentProfileToken,
  writeAllianceRecord,
} from "../../_shared/profile.js";

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const token = String(body.token || "");
  const session = await decodeProfileToken(token, context.env.ALLIANCE_PROFILE_FORM_SECRET);
  if (!session.ok) return json(session, 400);
  const current = await validateCurrentProfileToken(context.env, token, session).catch((error) => ({
    ok: false,
    error: error.message,
  }));
  if (!current.ok) return json(current, 410);

  const firstName = cleanText(body.first_name);
  const lastName = cleanText(body.last_name);
  const email = cleanText(body.email);
  const imageUrl = cleanText(body.image_url);
  const distinction = cleanText(body.distinction);
  const smsAuthorized = body.sms_authorized === true;

  if (!firstName || !lastName || !distinction) {
    return json({ ok: false, error: "missing_required_profile_fields" }, 400);
  }
  if (!smsAuthorized) return json({ ok: false, error: "sms_authorization_required" }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }
  if (!distinctions.includes(distinction)) {
    return json({ ok: false, error: "invalid_distinction" }, 400);
  }
  if (imageUrl && !(/^https?:\/\/\S+$/i.test(imageUrl) || /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i.test(imageUrl))) {
    return json({ ok: false, error: "invalid_image_url" }, 400);
  }
  if (imageUrl.length > 650_000) return json({ ok: false, error: "image_too_large" }, 400);

  const profileId = session.mode === "edit" && session.profile_id
    ? session.profile_id
    : `user-${session.phone.slice(-4)}-${Date.now().toString(36)}`;
  const submittedAt = new Date().toISOString();
  const profileValues = {
    id: profileId,
    phone: session.phone,
    first_name: firstName,
    last_name: lastName,
    email: email || null,
    image_url: imageUrl || null,
    distinction,
    sms_authorized: true,
    profile_url: `/member/${profileId}`,
    source: session.mode === "edit" ? "alliance_cloudflare_profile_edit" : "alliance_cloudflare_profile_intake",
    form_token: token,
    submitted_at: submittedAt,
  };

  const profile = await writeAllianceRecord(context.env, {
    entity: "alliance_profile",
    label: `Alliance profile ${firstName} ${lastName}`,
    route: `alliance-profile:${profileId}`,
    local_dataset: "alliance-profile-intake",
    status: "active",
    values: profileValues,
  });

  if (!profile.ok) {
    return json({ ok: false, error: profile.error || "profile_record_failed", profile }, 502);
  }

  const contextValues = {
    ...(current.values || {}),
    phone: session.phone,
    script_id: "alliance.profile_setup.sms.v1",
    state: "completed",
    status: "completed",
    form_token: current.values?.form_token || token,
    form_token_used_at: session.mode === "register" ? submittedAt : current.values?.form_token_used_at,
    edit_form_token: null,
    edit_form_token_expires_at: null,
    edit_form_token_used_at: session.mode === "edit" ? submittedAt : current.values?.edit_form_token_used_at || null,
    profile_id: profileId,
    profile: profileValues,
    completed_at: submittedAt,
  };

  const smsContext = await updateProfileContext(context.env, current.context.id, session.phone, contextValues, "completed").catch((error) => ({
    ok: false,
    error: error.message || "profile_context_update_failed",
  }));

  return json({
    ok: true,
    profile_id: profileId,
    phone_display: maskPhone(session.phone),
    profile_url: `/member/${profileId}`,
    mode: session.mode,
    warning: smsContext.ok === false ? "profile_context_update_failed" : null,
    profile,
    sms_context: smsContext,
  });
}
