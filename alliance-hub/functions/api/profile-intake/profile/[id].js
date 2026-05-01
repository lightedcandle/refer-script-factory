import { json, latestProfile } from "../../../_shared/profile.js";

export async function onRequestGet(context) {
  const profile = await latestProfile(context.env, context.params.id).catch((error) => ({
    error: error.message,
  }));
  if (!profile || profile.error) return json({ ok: false, error: profile?.error || "profile_not_found" }, 404);

  const values = profile.values || {};
  return json({
    ok: true,
    profile: {
      id: values.id,
      first_name: values.first_name,
      last_name: values.last_name,
      distinction: values.distinction,
      image_url: values.image_url || null,
      profile_url: values.profile_url,
      submitted_at: values.submitted_at,
    },
  });
}
