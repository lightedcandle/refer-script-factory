import { json, supabaseRest } from "../../_shared/profile.js";

export async function onRequestGet(context) {
  const authorized = authorizeAdmin(context.request, context.env);
  if (!authorized.ok) return json(authorized, 401);

  const url = new URL(context.request.url);
  const status = cleanStatus(url.searchParams.get("status") || "queued");
  const limit = clampLimit(url.searchParams.get("limit"));
  const path = [
    "/alliance_records?entity=eq.sms_intake_gap",
    `status=eq.${encodeURIComponent(status)}`,
    "order=created_at.desc",
    `limit=${limit}`,
    "select=id,entity,label,route,status,values,created_at,updated_at",
  ].join("&");

  const rows = await supabaseRest(context.env, path);
  return json({
    ok: true,
    script_id: "alliance.sms_intake_gap.v1",
    count: Array.isArray(rows) ? rows.length : 0,
    gaps: rows,
  });
}

function authorizeAdmin(request, env) {
  const configured = Boolean(env.ALLIANCE_ADMIN_TOKEN);
  if (!configured) return { ok: false, error: "admin_token_not_configured" };
  const token = request.headers.get("x-alliance-admin-token") || "";
  if (token !== env.ALLIANCE_ADMIN_TOKEN) return { ok: false, error: "unauthorized" };
  return { ok: true };
}

function cleanStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return /^[a-z0-9_-]+$/.test(normalized) ? normalized : "queued";
}

function clampLimit(value) {
  const parsed = Number(value || 25);
  if (!Number.isFinite(parsed)) return 25;
  return Math.min(Math.max(Math.trunc(parsed), 1), 100);
}
