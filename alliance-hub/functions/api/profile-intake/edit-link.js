import {
  createProfileToken,
  cleanText,
  decodeProfileToken,
  json,
  latestProfile,
  latestProfileContext,
  maskPhone,
  queueSms,
  updateProfileContext,
} from "../../_shared/profile.js";

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const sourceToken = String(body.token || "");
  const profileId = cleanText(body.profile_id);
  if (!profileId) return json({ ok: false, error: "missing_profile_id" }, 400);

  const session = sourceToken
    ? await decodeProfileToken(sourceToken, context.env.ALLIANCE_PROFILE_FORM_SECRET)
    : { ok: true, phone: "" };
  if (!session.ok) return json(session, 400);

  const profile = await latestProfile(context.env, profileId);
  const phone = session.phone || profile?.values?.phone || "";
  if (!phone) return json({ ok: false, error: "profile_phone_not_found" }, 404);

  const existing = await latestProfileContext(context.env, phone);
  const values = existing?.values || {};
  if (!existing || values.profile_id !== profileId || values.status !== "completed") {
    return json({ ok: false, error: "profile_not_ready_for_edit" }, 409);
  }

  const issuedAt = Date.now();
  const expiresAt = issuedAt + 30 * 60 * 1000;
  const editToken = await createProfileToken({
    p: phone,
    m: "edit",
    pid: profileId,
    iat: issuedAt,
    exp: expiresAt,
  }, context.env.ALLIANCE_PROFILE_FORM_SECRET);
  const editUrl = `https://alliance.telechurchlive.com/profile/${encodeURIComponent(editToken)}`;
  const updated = {
    ...values,
    edit_form_token: editToken,
    edit_form_token_expires_at: new Date(expiresAt).toISOString(),
    edit_form_token_used_at: null,
    edit_requested_at: new Date(issuedAt).toISOString(),
  };
  const saved = await updateProfileContext(context.env, existing.id, phone, updated, "completed");
  const delivery = await queueSms(context.env, phone, [
    "Alliance profile edit link:",
    editUrl,
    "This secure link expires in 30 minutes.",
  ].join("\n"), {
    source: "alliance_profile_edit_link",
    profile_id: profileId,
  });

  return json({
    ok: delivery.ok,
    phone_display: maskPhone(phone),
    expires_at: updated.edit_form_token_expires_at,
    sms_context: saved,
    delivery,
  }, delivery.ok ? 200 : 502);
}
