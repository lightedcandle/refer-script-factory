import {
  decodeProfileToken,
  distinctions,
  json,
  latestProfile,
  maskPhone,
  validateCurrentProfileToken,
} from "../../../_shared/profile.js";

export async function onRequestGet(context) {
  const token = context.params.token;
  const session = await decodeProfileToken(token, context.env.ALLIANCE_PROFILE_FORM_SECRET);
  if (!session.ok) return json(session, 400);
  const current = await validateCurrentProfileToken(context.env, token, session).catch((error) => ({
    ok: false,
    error: error.message,
  }));
  if (!current.ok) return json(current, 410);

  const profile = session.mode === "edit" && session.profile_id
    ? await latestProfile(context.env, session.profile_id).catch(() => null)
    : null;

  return json({
    ok: true,
    phone: session.phone,
    phone_display: maskPhone(session.phone),
    mode: session.mode,
    profile_id: session.profile_id || "",
    profile: profile?.values || null,
    distinctions,
  });
}
