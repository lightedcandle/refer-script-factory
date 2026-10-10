#!/usr/bin/env node
/**
 * DAY MODE - the board in daylight, and the one place that decides which mode
 * is showing.
 *
 * Operator, 2026-10-10: "this black is boring and doesnt help to focus my
 * attention... a more visually appealing whitemode that i can use for days and
 * then this darkmode can be reserved for nights." Then, on seeing two drafts:
 * "keep the background white and stack the various layers based on light
 * colors according to what they might represent... while the background remain
 * offwhite with a hint of yellow beige." And on the switch: "sun plus
 * override."
 *
 * A LIBRARY, NOT A MACHINE. It asks nothing about a repo and writes nothing.
 * build-tracker.cjs passes the finished board through theme(); the board
 * server passes its all-repos page and its belt-only lines through the same
 * function, so there is one opinion about what a colour becomes in daylight
 * and one opinion about what time it is.
 *
 * HOW IT WORKS, AND WHY IT IS NOT A SECOND STYLESHEET. The board is drawn with
 * several hundred colours written where they are used, and every one of them
 * was chosen against a near-black ground. Rewriting each by hand would be two
 * boards to keep in step. So the night colours stay exactly where they are, as
 * the source of truth, and theme() does three things to the finished page:
 *
 *   1. every complete `oklch(L C H)` becomes `var(--k-...)`, named by its own
 *      numbers, so the name is stable from one build to the next;
 *   2. one table gives each name its night value (the literal that was there)
 *      and its day value (tone() of it);
 *   3. one script sets data-mode on <html> before the page paints.
 *
 * A colour added to the board tomorrow gets a day value with no edit here.
 * A colour that looks wrong in daylight is fixed in tone() or in DAY_EXACT,
 * never at the place it is used.
 *
 * WHAT IT DOES NOT REACH: a colour a page script assembles at run time out of
 * pieces ('oklch(0.7 0.1 ' + hue + ')') is not a complete literal in the built
 * page and keeps its night value in both modes. theme() matches numbers only,
 * on purpose - a looser match would swallow the quote and the plus sign.
 *
 * THE FUNCTION TINTS are the one thing daylight adds that night does not have.
 * An element carrying data-fn="arriving" (or work, done, body, mind, spirit)
 * takes a light tint of the job it does, in day mode only. Night ignores the
 * attribute, so the night board is unchanged by this file.
 *
 * TO MOVE THE PLACE THE SUN IS MEASURED FROM, change SUN_AT below. To make a
 * board hold one mode, a person presses DAY or NIGHT on it: that is kept in
 * the browser (localStorage "factory.dayMode") until the next sunrise or
 * sunset, and pressing the mode the sun already agrees with clears it.
 */

// Atlanta. The operator's wall, and the only wall there is.
const SUN_AT = { lat: 33.749, lon: -84.388 };

const round = (n, p = 3) => Number(n.toFixed(p));

// Night lightness -> day lightness for the neutrals, as points on a line.
// Not an inversion: on the night board a LIGHTER fill means "raised", and in
// daylight raised means WHITER up to the panel (0.185) and a soft step darker
// past it, so rows and hovers still read as marks on the panel.
const NEUTRAL = [
  [0.0, 0.955],
  [0.15, 0.98],
  [0.17, 0.99],
  [0.185, 1.0],
  [0.2, 0.985],
  [0.22, 0.968],
  [0.24, 0.95],
  [0.26, 0.925],
  [0.28, 0.905],
  [0.3, 0.885],
  [0.36, 0.82],
  [0.42, 0.74],
  [0.5, 0.6],
  [0.56, 0.545],
  [0.62, 0.48],
  [0.7, 0.42],
  [0.8, 0.36],
  [0.86, 0.32],
  [0.95, 0.25],
  [1.0, 0.2],
];

function along(points, x) {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    if (x > x1) continue;
    const [x0, y0] = points[i - 1];
    return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return points[points.length - 1][1];
}

// A night value that the rule gets wrong is written here, by its exact text.
const DAY_EXACT = {};

/**
 * What a night colour becomes in daylight. Takes and returns { l, c, h, a }
 * where a is the alpha exactly as written ("0.5", "40%") or null.
 */
function tone({ l, c, h, a }) {
  // A translucent near-black is a shadow or a scrim. Daylight has those too.
  if (a != null && l < 0.12) return { l, c, h, a };
  if (c <= 0.03) {
    const L = along(NEUTRAL, l);
    if (L >= 0.999) return { l: 1, c: 0, h: 0, a };
    // The ground and the lines carry a hint of beige; the ink is warm.
    if (L >= 0.9) return { l: round(L), c: 0.008, h: 90, a };
    if (L >= 0.66) return { l: round(L), c: 0.014, h: 80, a };
    return { l: round(L), c: 0.028, h: 55, a };
  }
  // A dark, coloured fill or border becomes a light tint of the same hue.
  if (l < 0.45) return { l: round(0.97 - (l - 0.15) * 0.45), c: round(c), h, a };
  if (l < 0.6) return { l: round(0.84 - ((l - 0.45) / 0.15) * 0.25), c: round(Math.min(c * 1.15, 0.2)), h, a };
  // A bright accent was bright so it could be read on black. On white it is
  // read by being deep. Amber needs more light than the rest to stay amber.
  const lift = h >= 45 && h <= 105 ? 0.06 : 0;
  const L = Math.min(0.64, Math.max(0.45, 0.55 - (l - 0.74) * 0.3 + lift));
  return { l: round(L), c: round(Math.min(c * 1.3, 0.2)), h, a };
}

const css = ({ l, c, h, a }) => `oklch(${l} ${c} ${h}${a != null ? ` / ${a}` : ""})`;
const LITERAL = /oklch\(\s*(\d*\.?\d+)\s+(\d*\.?\d+)\s+(-?\d*\.?\d+)\s*(?:\/\s*(\d*\.?\d+%?)\s*)?\)/g;
const nameOf = (m) => "--k-" + [m[1], m[2], m[3], m[4]].filter((x) => x != null).map((x) => String(x).replace(/[^0-9a-z]/gi, "")).join("-");

// The tints. One hue per job, the same hues the night board already gives the
// three seats; arriving and done are the two daylight adds.
const FN = {
  arriving: 240,
  done: 150,
  body: 70,
  mind: 195,
  spirit: 305,
  alarm: 25,
};
const FN_CSS =
  Object.entries(FN)
    .map(([fn, hue]) => `:root[data-mode="day"] [data-fn="${fn}"]{background:oklch(0.966 0.026 ${hue})!important;border-color:oklch(0.87 0.055 ${hue})!important}`)
    .join("\n") +
  // The belt is the one lit object: pure white, lifted off the ground.
  `\n:root[data-mode="day"] [data-fn="work"]{background:oklch(1 0 0)!important;border-color:oklch(0.82 0.014 80)!important;box-shadow:0 1px 0 oklch(0.88 0.01 80 / 0.7),0 18px 40px -22px oklch(0.4 0.02 70 / 0.3)}`;

// Runs in the page. Sets the mode before anything paints, keeps it right as
// the sun moves, and draws the DAY / NIGHT switch into #day-switch if the page
// has one. Written as text because it is shipped as text.
const MODE_SCRIPT = `
(function () {
  var LAT = ${SUN_AT.lat}, LON = ${SUN_AT.lon}, KEY = 'factory.dayMode', RAD = Math.PI / 180;
  // Sunrise and sunset for the solar day that contains t, as epoch ms. The
  // NOAA short form: good to about a minute, which is finer than a wall needs.
  function sun(t) {
    var local = new Date(t + LON / 15 * 3600000);
    var base = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
    var n = Math.floor((base - Date.UTC(local.getUTCFullYear(), 0, 0)) / 86400000);
    var g = 2 * Math.PI / 365 * (n - 1 + 0.5);
    var eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    var dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    var x = Math.cos(90.833 * RAD) / (Math.cos(LAT * RAD) * Math.cos(dec)) - Math.tan(LAT * RAD) * Math.tan(dec);
    var ha = Math.acos(Math.max(-1, Math.min(1, x))) / RAD;
    var noon = 720 - 4 * LON - eq;
    return { rise: base + (noon - 4 * ha) * 60000, set: base + (noon + 4 * ha) * 60000 };
  }
  function sky(t) {
    var s = sun(t);
    if (t < s.rise) return { mode: 'night', next: s.rise };
    if (t < s.set) return { mode: 'day', next: s.set };
    return { mode: 'night', next: sun(t + 86400000).rise };
  }
  function held(t) {
    try {
      var h = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (h && (h.mode === 'day' || h.mode === 'night') && t < h.until) return h;
      if (h) localStorage.removeItem(KEY);
    } catch (e) {}
    return null;
  }
  function clock(ms) { return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  function apply() {
    var t = Date.now(), s = sky(t), h = held(t), mode = h ? h.mode : s.mode;
    if (document.documentElement.getAttribute('data-mode') !== mode) document.documentElement.setAttribute('data-mode', mode);
    var host = document.getElementById('day-switch');
    if (!host) return;
    var why = h ? 'held by hand until ' + clock(h.until) + ', then it follows the sun again' : 'following the sun - ' + (s.mode === 'day' ? 'night' : 'day') + ' at ' + clock(s.next);
    var html = '';
    ['day', 'night'].forEach(function (m) {
      var on = m === mode;
      html += '<button type="button" data-day-mode="' + m + '" aria-pressed="' + on + '" title="' + why + '" style="font:inherit; letter-spacing:0.1em; padding:1px 7px; border-radius:3px; background:transparent; cursor:pointer; border:1px solid ' +
        (on ? 'oklch(0.75 0.12 190)' : 'oklch(0.35 0.01 80)') + '; color:' + (on ? 'oklch(0.85 0.10 190)' : 'oklch(0.58 0.01 80)') + '">' + m.toUpperCase() + '</button> ';
    });
    if (host.getAttribute('data-drawn') !== mode + why) { host.innerHTML = html; host.setAttribute('data-drawn', mode + why); }
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('button[data-day-mode]') : null;
    if (!b) return;
    var want = b.getAttribute('data-day-mode'), s = sky(Date.now());
    try {
      if (want === s.mode) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify({ mode: want, until: s.next }));
    } catch (e) {}
    apply();
  });
  // Another window, or a belt in a frame on the all-repos page, pressed it.
  window.addEventListener('storage', function (ev) { if (ev.key === KEY || ev.key === null) apply(); });
  document.addEventListener('DOMContentLoaded', apply);
  setInterval(apply, 30000);
  apply();
})();
`;

const TABLE_RE = /<style data-day-mode>[\s\S]*?<\/style>/g;

/**
 * Give a finished page its day mode. Safe to run on a page that has already
 * been through it (the board server does, when it adds its belt-only lines to
 * a built board): a table that is already there is left alone, since replacing
 * the literals inside it would define each name as itself.
 */
function theme(html) {
  html = String(html);
  if (html.indexOf("data-day-mode-script") < 0) {
    const script = `<script data-day-mode-script>${MODE_SCRIPT}</script>`;
    const at = html.indexOf("</head>");
    html = at >= 0 ? html.slice(0, at) + script + "\n" + html.slice(at) : script + html;
  }
  const kept = [];
  html = html.replace(TABLE_RE, (m) => {
    kept.push(m);
    return `<!--day-mode-table-${kept.length - 1}-->`;
  });
  const night = new Map();
  const day = new Map();
  html = html.replace(LITERAL, (...m) => {
    const name = nameOf(m);
    if (!night.has(name)) {
      const src = { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]), a: m[4] != null ? m[4] : null };
      night.set(name, css(src));
      day.set(name, DAY_EXACT[css(src)] || css(tone(src)));
    }
    return `var(${name})`;
  });
  const rows = (map) => [...map].map(([k, v]) => `${k}:${v}`).join(";");
  const table =
    `<style data-day-mode>\n:root{${rows(night)}}\n:root[data-mode="day"]{color-scheme:light;${rows(day)}}\n` +
    (kept.length ? "" : FN_CSS + "\n") +
    `</style>`;
  html = html.replace(/<!--day-mode-table-(\d+)-->/g, (_, i) => kept[Number(i)]);
  const at = html.indexOf("</head>");
  if (at >= 0) return html.slice(0, at) + table + "\n" + html.slice(at);
  const end = html.lastIndexOf("</body>");
  return end >= 0 ? html.slice(0, end) + table + "\n" + html.slice(end) : html + table;
}

module.exports = { theme, tone, SUN_AT, FN };

if (require.main === module) {
  // Run by hand, it shows the rule: a few night colours and what they become.
  for (const s of ["oklch(0.15 0.012 70)", "oklch(0.185 0.012 70)", "oklch(0.28 0.012 70)", "oklch(0.62 0.01 80)", "oklch(0.95 0.008 85)", "oklch(0.74 0.13 195)", "oklch(0.76 0.12 75)", "oklch(0.32 0.05 25)"]) {
    const m = new RegExp(LITERAL.source).exec(s);
    console.log(s.padEnd(24), "->", css(tone({ l: Number(m[1]), c: Number(m[2]), h: Number(m[3]), a: m[4] != null ? m[4] : null })));
  }
}
