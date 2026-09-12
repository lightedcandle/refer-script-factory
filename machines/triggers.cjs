/**
 * WHERE THE TRIGGER DECLARATIONS ARE, AND WHAT THE SCHEDULE STATE IS CALLED.
 *
 * UNIVERSAL. Reads the repo it is given, never its own directory.
 *
 * Operator, 2026-09-12: "Let's redefine Station to be Trigger... Clock should
 * not be used, it means just the current time or some other time to be defined.
 * Schedule means the time that has been set."
 *
 * Four machines discovered declaration files independently, each with the
 * suffix written out by hand, and three of them also read the schedule state
 * with its key written out by hand. A rename against that arrangement is four
 * chances to miss one - and a machine that finds NO triggers does not crash, it
 * cheerfully reports that everything is fine, which is the failure shape this
 * whole factory exists to remove. One reader, so the suffix and the key exist
 * once.
 *
 * BOTH NAMES ARE ACCEPTED FOR ONE RELEASE. The rename cannot land everywhere at
 * once: the Windows task that ticks the factory runs in a checkout that advances
 * on its own schedule, so for a while some trees carry `*.station.json` and
 * `clock-state.json` and others carry the new names. Drop the legacy entries
 * once no tree has them.
 */
const fs = require("fs");
const path = require("path");

const SUFFIXES = [".trigger.json", ".station.json"];
const SEARCH = ["tools", "tools/factory", "scripts", "machines"];
const STATE_FILES = ["schedule-state.json", "clock-state.json"];

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

/** Every trigger declared in this repo. */
function discoverTriggers(root) {
  const found = [];
  const seen = new Set();
  for (const rel of SEARCH) {
    const dir = path.join(root, rel);
    if (!fs.existsSync(dir)) continue;
    let entries = [];
    try {
      entries = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const f of entries) {
      const suffix = SUFFIXES.find((s) => f.endsWith(s));
      if (!suffix) continue;
      const d = readJson(path.join(dir, f), null);
      if (!d || !d.id) continue;
      // A tree caught mid-rename can hold both names for one trigger. Counting
      // it twice would quietly double every total computed from this list.
      if (seen.has(d.id)) continue;
      seen.add(d.id);
      found.push({ ...d, kind: d.kind || "schedule", legacyName: suffix === ".station.json" });
    }
  }
  return found;
}

/**
 * The schedule state, normalised. Returns { triggers: {...} } whichever file
 * and whichever key is on disk, so no caller has to know the rename happened.
 */
function readScheduleState(ctxDir) {
  for (const name of STATE_FILES) {
    const s = readJson(path.join(ctxDir, name), null);
    if (!s) continue;
    return { triggers: s.triggers || s.stations || {}, updatedAt: s.updatedAt || null, from: name };
  }
  return { triggers: {}, updatedAt: null, from: null };
}

module.exports = { discoverTriggers, readScheduleState, SUFFIXES, STATE_FILES };
