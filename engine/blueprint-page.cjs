/**
 * THE BLUEPRINT PAGE - the factory board flipped to how a repo is wired.
 * PLAN-CIRCUIT-001 (Telechurch), operator 2026-11-04: "Imagine the video engine
 * block, and you can click and go into the video engine and see how it's
 * connected in Cloudflare ... No matter how vast or complicated, I should be
 * able to drill down and see how things are wired."
 *
 * This file only DRAWS. The map comes from the observed repo's own reader
 * (tools/factory/circuit-build.cjs), run by serve-tracker when the page is
 * opened, so the drawing is never older than the checkout. Nothing here
 * invents a block or a wire: every line drawn is one the reader found.
 *
 * Levels, as he accepted them - about ten blocks a level at most:
 *   #/                    the whole platform in blocks, outside services at the edge
 *   #/block/<id>          inside one block: its parts, what comes in, what goes out
 *   #/part/<block>/<id>   the files behind one part and what each one calls
 *   #/path                the path a person walks: landing page, doors, Sanctuary
 *   #/tray                what the reader could not place or could not read
 */
"use strict";

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const MONO = "'JetBrains Mono',ui-monospace,monospace";

function toggle(repoId, repoName) {
  return `<div class="mode" role="group" aria-label="board mode">
    <a href="/?repo=${encodeURIComponent(repoId)}" title="flip back to the factory board for ${esc(repoName)}"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M1 13h14M2 13V7l4 2V7l4 2V4h4v9" style="stroke:currentColor;stroke-width:1.4"></path></svg>FACTORY</a>
    <span class="on" aria-current="page"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1" style="stroke:currentColor;stroke-width:1.4"></rect><path d="M6 1v3M10 1v3M6 12v3M10 12v3M1 6h3M1 10h3M12 6h3M12 10h3" style="stroke:currentColor;stroke-width:1.2"></path></svg>BLUEPRINT</span>
  </div>`;
}

/**
 * opts: { repoId, repoName, circuit?: object, error?: string, builtAt?: number, tookMs?: number }
 */
function renderBlueprintPage(opts) {
  const { repoId, repoName } = opts;
  const data = opts.circuit ? JSON.stringify(opts.circuit).replace(/</g, "\\u003c") : "null";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blueprint - ${esc(repoName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --bg: oklch(0.15 0.012 70); --panel: oklch(0.185 0.012 70); --panel2: oklch(0.21 0.012 70); --line: oklch(0.30 0.012 70);
          --text: oklch(0.95 0.008 85); --muted: oklch(0.64 0.01 80); --faint: oklch(0.48 0.01 80); --blue: oklch(0.74 0.09 230); }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--bg); color: var(--text); font-family: 'Space Grotesk', system-ui, sans-serif; }
  a { color: inherit; }
  .mono { font-family: ${MONO}; }
  header { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 24px; padding: 22px 28px 14px; border-bottom: 1px solid var(--line); }
  .who { display: flex; flex-direction: column; gap: 3px; min-width: 260px; }
  .eyebrow { font-family: ${MONO}; font-size: 12px; letter-spacing: 0.16em; color: var(--muted); }
  .repo { font-size: 30px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.05; }
  .mode { display: flex; margin-top: 8px; max-width: 300px; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; font-family: ${MONO}; font-size: 12px; letter-spacing: 0.08em; }
  .mode > * { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 5px 10px; text-decoration: none; }
  .mode a { background: oklch(0.16 0.012 70); color: oklch(0.80 0.01 80); border-right: 1px solid var(--line); }
  .mode a:hover { background: var(--panel2); }
  .mode .on { background: oklch(0.26 0.04 230); color: oklch(0.92 0.05 230); }
  .how { flex: 1; min-width: 300px; font-size: 14px; line-height: 1.5; color: var(--muted); padding-top: 4px; }
  .how b { color: var(--text); font-weight: 500; }
  nav.levels { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 28px 0; }
  nav.levels a { font-family: ${MONO}; font-size: 12px; letter-spacing: 0.08em; text-decoration: none; color: var(--muted); padding: 6px 12px; border: 1px solid var(--line); border-radius: 4px; }
  nav.levels a.on { color: var(--text); background: var(--panel2); border-color: oklch(0.40 0.012 70); }
  .trail { font-family: ${MONO}; font-size: 13px; letter-spacing: 0.04em; padding: 14px 28px 4px; color: var(--muted); }
  .trail a { text-decoration: none; color: var(--blue); }
  .trail a:hover { text-decoration: underline; }
  .trail .here { color: var(--text); }
  main { padding: 8px 28px 40px; }
  .lede { font-size: 16px; line-height: 1.5; color: oklch(0.86 0.01 85); max-width: 900px; margin: 6px 0 16px; }
  .lede .hint { color: var(--muted); }

  /* level 1 */
  .board { position: relative; width: 100%; max-width: 1400px; aspect-ratio: 14 / 8; }
  .board svg.wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .wire { stroke: oklch(0.55 0.05 230); fill: none; vector-effect: non-scaling-stroke; transition: opacity .15s, stroke .15s; }
  .board.focus .wire { opacity: 0.05 !important; }
  .board.focus .wire.lit { opacity: 0.95 !important; stroke: var(--blue); }
  .card { position: absolute; transform: translate(-50%, -50%); background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 12px 14px; cursor: pointer; text-decoration: none; display: block; transition: border-color .15s, background .15s; }
  .card:hover, .card.lit { background: var(--panel2); }
  .card .nm { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; }
  .card .dz { font-size: 13px; line-height: 1.4; color: var(--muted); margin-top: 5px; }
  .card .ft { display: flex; justify-content: space-between; gap: 10px; margin-top: 8px; font-family: ${MONO}; font-size: 11px; letter-spacing: 0.08em; color: var(--faint); }
  .card .ft .open { color: var(--blue); }
  .card.block { width: 19%; min-height: 0; border-top: 3px solid var(--hue); }
  .card.svc { width: 13%; padding: 9px 11px; border-left: 3px solid oklch(0.58 0.02 80); cursor: default; }
  .card.svc .nm { font-size: 15px; }
  .card.svc .dz { font-size: 12px; }
  .colhead { position: absolute; font-family: ${MONO}; font-size: 11px; letter-spacing: 0.16em; color: var(--faint); }

  /* level 2 */
  .inside { display: grid; grid-template-columns: minmax(170px, 1fr) minmax(320px, 2.2fr) minmax(200px, 1.3fr); gap: 0 70px; position: relative; max-width: 1400px; }
  .inside svg.wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
  .inside .col { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
  .inside .col h3 { margin: 0 0 4px; font-family: ${MONO}; font-size: 11px; font-weight: 400; letter-spacing: 0.16em; color: var(--faint); }
  .chip { background: var(--panel); border: 1px solid var(--line); border-radius: 5px; padding: 8px 11px; text-decoration: none; display: block; cursor: pointer; }
  .chip:hover, .chip.lit { background: var(--panel2); border-color: oklch(0.45 0.05 230); }
  .chip .nm { font-size: 14px; font-weight: 500; }
  .chip .sub { font-family: ${MONO}; font-size: 11px; color: var(--faint); margin-top: 3px; letter-spacing: 0.04em; }
  .chip.cf { border-left: 3px solid oklch(0.70 0.14 55); }
  .chip.blk { border-left: 3px solid var(--hue); }
  .part { background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--hue); border-radius: 6px; padding: 11px 14px; text-decoration: none; display: block; }
  .part:hover, .part.lit { background: var(--panel2); }
  .part .nm { font-size: 16px; font-weight: 600; }
  .part .dz { font-size: 13px; line-height: 1.4; color: var(--muted); margin-top: 4px; }
  .part .ft { display: flex; justify-content: space-between; margin-top: 7px; font-family: ${MONO}; font-size: 11px; color: var(--faint); letter-spacing: 0.06em; }
  .part .ft .open { color: var(--blue); }
  .inside .wire { stroke-width: 1.4; opacity: 0.35; }
  .inside.focus .wire { opacity: 0.06; }
  .inside.focus .wire.lit { opacity: 0.95; stroke: var(--blue); }
  .detail { margin-top: 22px; max-width: 1400px; background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 14px 16px; min-height: 64px; }
  .detail h4 { margin: 0 0 8px; font-size: 15px; font-weight: 600; }
  .detail .row { font-size: 14px; line-height: 1.55; color: oklch(0.84 0.01 85); }
  .detail .row .k { font-family: ${MONO}; font-size: 12px; color: var(--muted); letter-spacing: 0.04em; }
  .detail .empty { color: var(--muted); font-size: 14px; }

  /* level 3 */
  .walk { display: grid; grid-template-columns: 150px 24px 200px 24px minmax(240px, 1.3fr) 24px minmax(220px, 1.2fr) 24px 190px; align-items: stretch; gap: 10px 0; max-width: 1400px; }
  .walk .arrow { display: flex; align-items: center; justify-content: center; color: var(--faint); font-family: ${MONO}; }
  .walk .stack { display: flex; flex-direction: column; justify-content: center; gap: 8px; }
  .walk h3 { margin: 0 0 8px; font-family: ${MONO}; font-size: 11px; font-weight: 400; letter-spacing: 0.16em; color: var(--faint); }
  .door { background: var(--panel); border: 1px solid var(--line); border-left: 3px solid oklch(0.70 0.12 55); border-radius: 5px; padding: 9px 12px; }
  .door .nm { font-size: 15px; font-weight: 600; }
  .door .dz { font-size: 12.5px; color: var(--muted); line-height: 1.4; margin-top: 3px; }
  .door .ft { font-family: ${MONO}; font-size: 11px; color: var(--faint); margin-top: 5px; }
  .leads { display: flex; flex-wrap: wrap; gap: 6px; align-content: center; }
  .pill { font-family: ${MONO}; font-size: 12px; padding: 3px 8px; border: 1px solid var(--line); border-radius: 999px; color: oklch(0.84 0.01 85); background: var(--panel); }
  .pill.none { color: var(--faint); border-style: dashed; }
  .tall { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 12px; }

  /* level 4 and tray */
  table.files { width: 100%; max-width: 1400px; border-collapse: collapse; font-size: 13.5px; }
  table.files th { text-align: left; font-family: ${MONO}; font-size: 11px; font-weight: 400; letter-spacing: 0.14em; color: var(--faint); padding: 8px 10px; border-bottom: 1px solid var(--line); }
  table.files td { vertical-align: top; padding: 8px 10px; border-bottom: 1px solid oklch(0.22 0.012 70); line-height: 1.5; }
  table.files td.f { font-family: ${MONO}; font-size: 12.5px; color: oklch(0.86 0.01 85); word-break: break-all; width: 32%; }
  table.files .k { font-family: ${MONO}; font-size: 11.5px; color: var(--muted); }
  .nothing { color: var(--muted); font-size: 15px; padding: 20px 0; }
  .err { margin: 30px 28px; padding: 16px 18px; border: 1px solid oklch(0.45 0.12 25); border-radius: 6px; background: oklch(0.20 0.04 25); color: oklch(0.90 0.05 30); font-size: 15px; line-height: 1.5; max-width: 900px; }
  .err pre { white-space: pre-wrap; font-family: ${MONO}; font-size: 12px; color: oklch(0.80 0.03 30); }
  @media (max-width: 900px) {
    .board { aspect-ratio: auto; display: flex; flex-direction: column; gap: 10px; }
    .board svg.wires, .colhead { display: none; }
    .card, .card.block, .card.svc { position: static; transform: none; width: auto; }
    .inside { grid-template-columns: 1fr; gap: 18px; }
    .inside svg.wires { display: none; }
    .walk { grid-template-columns: 1fr; }
    .walk .arrow { transform: rotate(90deg); height: 18px; }
  }
</style>
</head>
<body>
<header>
  <div class="who">
    <span class="eyebrow">LIVING FACTORY &middot; BLUEPRINT</span>
    <span class="repo">${esc(repoName)}</span>
    ${toggle(repoId, repoName)}
  </div>
  <div class="how" id="how"></div>
</header>
<nav class="levels" id="levels"></nav>
<div class="trail" id="trail"></div>
<main id="main"></main>
${opts.error ? `<div class="err"><b>The blueprint could not be drawn for ${esc(repoName)}.</b><br>${esc(opts.error.split("\n")[0])}${opts.error.includes("\n") ? `<pre>${esc(opts.error.split("\n").slice(1).join("\n"))}</pre>` : ""}</div>` : ""}
<script>
(function () {
  var C = ${data};
  var REPO = ${JSON.stringify(String(repoName))};
  if (!C) return;
  var HUE = { doors: 55, rooms: 150, "video-engine": 310, giving: 95, messages: 25, apostle: 265, office: 195, frame: 80 };
  var hueOf = function (id) { return HUE[id] != null ? HUE[id] : 230; };
  var $ = function (id) { return document.getElementById(id); };
  var e = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var KIND = { fn: 'calls a server function', api: 'calls a website function', table: 'reads or writes a table', rpc: 'runs a database procedure', storage: 'keeps files in storage', service: 'talks to', binding: 'is joined on Cloudflare to', "import": 'uses code from' };
  var blockById = {}; C.blocks.forEach(function (b) { blockById[b.id] = b; });
  var svcById = {}; C.services.forEach(function (s) { svcById[s.id] = s; });
  var cfById = {}; ((svcById.cloudflare || {}).parts || []).forEach(function (p) { cfById[p.id] = p; });
  var partByKey = {}; C.blocks.forEach(function (b) { b.parts.forEach(function (p) { partByKey[b.id + '/' + p.id] = { block: b, part: p }; }); });

  function endName(key) {
    if (key.indexOf('block:') === 0) return (blockById[key.slice(6)] || {}).name || key;
    if (key.indexOf('part:') === 0) { var x = partByKey[key.slice(5)]; return x ? x.part.name + ' (' + x.block.name + ')' : key; }
    if (key.indexOf('service:') === 0) {
      var rest = key.slice(8), sl = rest.indexOf('/');
      if (sl > 0) { var cf = cfById[rest.slice(sl + 1)]; return cf ? 'Cloudflare: ' + cf.label : rest; }
      return (svcById[rest] || {}).name || rest;
    }
    return key;
  }
  function kindsLine(kinds) {
    return Object.keys(kinds).sort(function (a, b) { return kinds[b] - kinds[a]; }).map(function (k) { return kinds[k] + ' ' + (KIND[k] || k); }).join(' &middot; ');
  }
  function namesLine(w) {
    var names = w.names.map(function (n) { return /\\//.test(n) && /\\.(ts|js|mjs|cjs)$/.test(n) ? n.split('/').pop() : n; });
    var uniq = names.filter(function (n, i) { return names.indexOf(n) === i; });
    return e(uniq.slice(0, 24).join(', ')) + (w.name_count > 24 ? ' and ' + (w.name_count - 24) + ' more' : '');
  }

  // ---- header and navigation
  var n = C.counts;
  var when = new Date(C.generatedAt);
  $('how').innerHTML = 'Read from the code just now (' + e(when.toLocaleString()) + '): <b>' + n.files_read + ' files</b>, <b>' + n.wires + ' wires</b> - ' +
    n.function_calls + ' calls to server functions, ' + n.table_uses + ' uses of tables, ' + n.cloudflare_bindings + ' joins on Cloudflare. ' +
    'Every line drawn here was read from the code or a Cloudflare settings file; nothing is drawn by hand. ' +
    '<span style="color:var(--faint)">It shows how the code is wired, not whether a part is running right now.</span>';
  function levels(active) {
    var tray = (n.unplaced_files ? 1 : 0) + n.unread_calls;
    $('levels').innerHTML = [
      ['#/', 'THE PLATFORM', active === 'top' || active === 'block' || active === 'part'],
      ['#/path', "A PERSON'S PATH", active === 'path'],
      ['#/tray', 'NOT YET READ (' + (n.unplaced_files + n.unread_calls) + ')', active === 'tray'],
    ].map(function (l) { return '<a href="' + l[0] + '"' + (l[2] ? ' class="on"' : '') + '>' + l[1] + '</a>'; }).join('');
  }
  function trail(items) {
    $('trail').innerHTML = items.map(function (it, i) {
      return i === items.length - 1 ? '<span class="here">' + e(it[0]) + '</span>' : '<a href="' + it[1] + '">' + e(it[0]) + '</a>';
    }).join(' &nbsp;&rsaquo;&nbsp; ');
  }

  // ---- level 1: the platform
  function top() {
    levels('top');
    trail([[REPO, '#/']]);
    var blocks = C.blocks, svcs = C.services;
    var pos = {};
    var cols = 4, rows = Math.ceil(blocks.length / cols);
    blocks.forEach(function (b, i) {
      var r = Math.floor(i / cols), c = i % cols;
      pos['block:' + b.id] = { x: 11.5 + c * 21.5, y: rows === 1 ? 50 : 27 + r * (50 / Math.max(1, rows - 1)) };
    });
    svcs.forEach(function (s, i) { pos['service:' + s.id] = { x: 92, y: 12 + i * (82 / Math.max(1, svcs.length - 1)) }; });
    // merge both directions of a block pair into one wire
    var pairs = {};
    C.wires.level1.forEach(function (w) {
      var a = w.from, b = w.to;
      var key = a < b ? a + '|' + b : b + '|' + a;
      if (!pairs[key]) pairs[key] = { a: a, b: b, count: 0 };
      pairs[key].count += w.count;
    });
    var max = 1; Object.keys(pairs).forEach(function (k) { max = Math.max(max, pairs[k].count); });
    var lines = Object.keys(pairs).map(function (k) {
      var p = pairs[k], A = pos[p.a], B = pos[p.b];
      if (!A || !B) return '';
      var w = 0.6 + 3.2 * Math.sqrt(p.count / max);
      var op = 0.10 + 0.45 * Math.sqrt(p.count / max);
      var mx = (A.x + B.x) / 2;
      var d = 'M' + A.x * 10 + ',' + A.y * 8 + ' C' + mx * 10 + ',' + A.y * 8 + ' ' + mx * 10 + ',' + B.y * 8 + ' ' + B.x * 10 + ',' + B.y * 8;
      return '<path class="wire" data-a="' + e(p.a) + '" data-b="' + e(p.b) + '" d="' + d + '" style="stroke-width:' + w.toFixed(2) + 'px; opacity:' + op.toFixed(2) + '"></path>';
    }).join('');
    var html = '<p class="lede">The whole platform in ' + blocks.length + ' blocks, and the outside services they plug into. ' +
      '<span class="hint">Point at a block to light its wires; click it to go inside.</span></p>' +
      '<div class="board" id="board"><svg class="wires" viewBox="0 0 1000 800" preserveAspectRatio="none">' + lines + '</svg>' +
      '<span class="colhead" style="left:1%; top:1%">THE PLATFORM</span><span class="colhead" style="left:85.5%; top:1%">OUTSIDE SERVICES</span>';
    blocks.forEach(function (b) {
      var p = pos['block:' + b.id];
      html += '<a class="card block" data-key="block:' + e(b.id) + '" href="#/block/' + e(b.id) + '" style="left:' + p.x + '%; top:' + p.y + '%; --hue: oklch(0.70 0.13 ' + hueOf(b.id) + ')">' +
        '<div class="nm">' + e(b.name) + '</div><div class="dz">' + e(b.does) + '</div>' +
        '<div class="ft"><span>' + e((b.seat || '').toUpperCase()) + ' &middot; ' + b.file_count + ' FILES</span><span class="open">' + b.parts.length + ' PARTS &rsaquo;</span></div></a>';
    });
    svcs.forEach(function (s) {
      var p = pos['service:' + s.id];
      html += '<div class="card svc" data-key="service:' + e(s.id) + '" style="left:' + p.x + '%; top:' + p.y + '%"><div class="nm">' + e(s.name) + '</div><div class="dz">' + e(s.does) + '</div></div>';
    });
    html += '</div><div class="detail" id="detail"><div class="empty">Point at a block or a service to see what crosses its wires.</div></div>';
    $('main').innerHTML = html;
    var board = $('board');
    board.querySelectorAll('[data-key]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { focus1(el.getAttribute('data-key')); });
      el.addEventListener('focus', function () { focus1(el.getAttribute('data-key')); });
    });
    board.addEventListener('mouseleave', function () { board.classList.remove('focus'); board.querySelectorAll('.lit').forEach(function (x) { x.classList.remove('lit'); }); });
    function focus1(key) {
      board.classList.add('focus');
      board.querySelectorAll('.lit').forEach(function (x) { x.classList.remove('lit'); });
      board.querySelectorAll('.wire').forEach(function (w) {
        if (w.getAttribute('data-a') === key || w.getAttribute('data-b') === key) {
          w.classList.add('lit');
          var other = w.getAttribute('data-a') === key ? w.getAttribute('data-b') : w.getAttribute('data-a');
          var o = board.querySelector('[data-key="' + other + '"]'); if (o) o.classList.add('lit');
        }
      });
      var rows = C.wires.level1.filter(function (w) { return w.from === key || w.to === key; }).slice(0, 14);
      $('detail').innerHTML = '<h4>' + e(endName(key)) + '</h4>' + (rows.length ? rows.map(function (w) {
        var out = w.from === key;
        return '<div class="row">' + (out ? '&rarr; ' : '&larr; ') + '<b>' + e(endName(out ? w.to : w.from)) + '</b> <span class="k">' + kindsLine(w.kinds) + '</span></div>';
      }).join('') : '<div class="empty">No wires read to or from it.</div>');
    }
  }

  // ---- level 2: inside one block
  function inside(id) {
    var b = blockById[id];
    if (!b) { $('main').innerHTML = '<p class="nothing">There is no block called ' + e(id) + '. <a href="#/">Back to the platform</a>.</p>'; return; }
    levels('block');
    trail([[REPO, '#/'], [b.name, '#/block/' + id]]);
    var hue = hueOf(b.id);
    var mine = function (k) { return k.indexOf('part:' + id + '/') === 0; };
    var inW = [], outW = [], innerW = [];
    C.wires.level2.forEach(function (w) {
      var f = mine(w.from), t = mine(w.to);
      if (f && t) innerW.push(w); else if (f) outW.push(w); else if (t) inW.push(w);
    });
    // fold the far end of outside wires into blocks (a part of another block reads as that block)
    var fold = function (k) { return k.indexOf('part:') === 0 ? 'block:' + k.slice(5).split('/')[0] : k; };
    function gather(ws, farOf, nearOf) {
      var m = {};
      ws.forEach(function (w) {
        var far = fold(farOf(w));
        if (!m[far]) m[far] = { key: far, count: 0, kinds: {}, names: [], name_count: 0, near: {} };
        var x = m[far]; x.count += w.count; x.near[nearOf(w)] = (x.near[nearOf(w)] || 0) + w.count;
        Object.keys(w.kinds).forEach(function (k) { x.kinds[k] = (x.kinds[k] || 0) + w.kinds[k]; });
        w.names.forEach(function (nm) { if (x.names.indexOf(nm) < 0) x.names.push(nm); });
        x.name_count = x.names.length;
      });
      return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return (b.key.indexOf('/') > 0) - (a.key.indexOf('/') > 0) || b.count - a.count; });
    }
    var ins = gather(inW, function (w) { return w.from; }, function (w) { return w.to; }).slice(0, 10);
    var outsAll = gather(outW, function (w) { return w.to; }, function (w) { return w.from; });
    var outs = outsAll.slice(0, 11);
    var chip = function (x, side) {
      var k = x.key, isBlock = k.indexOf('block:') === 0, isCf = k.indexOf('service:cloudflare/') === 0;
      var href = isBlock ? ' href="#/block/' + e(k.slice(6)) + '"' : '';
      var tag = isBlock ? 'a' : 'div';
      var sub = kindsLine(x.kinds);
      return '<' + tag + href + ' class="chip' + (isCf ? ' cf' : '') + (isBlock ? ' blk' : '') + '" data-key="' + e(k) + '" data-side="' + side + '"' +
        (isBlock ? ' style="--hue: oklch(0.70 0.13 ' + hueOf(k.slice(6)) + ')"' : '') + '><div class="nm">' + e(endName(k)) + (isBlock ? ' &rsaquo;' : '') + '</div><div class="sub">' + sub + '</div></' + tag + '>';
    };
    var html = '<p class="lede"><b>' + e(b.name) + '.</b> ' + e(b.does) + ' <span class="hint">Point at a part to light its wires; click it for its files.</span></p>' +
      '<div class="inside" id="inside"><svg class="wires" id="w2"></svg>' +
      '<div class="col" id="cin"><h3>COMES IN FROM</h3>' + (ins.length ? ins.map(function (x) { return chip(x, 'in'); }).join('') : '<div class="pill none">nothing read coming in</div>') + '</div>' +
      '<div class="col" id="cmid"><h3>INSIDE ' + e(b.name.toUpperCase()) + ' &middot; ' + b.parts.length + ' PARTS</h3>' +
      b.parts.map(function (p) {
        return '<a class="part" data-key="part:' + e(id + '/' + p.id) + '" href="#/part/' + e(id) + '/' + encodeURIComponent(p.id) + '" style="--hue: oklch(0.70 0.13 ' + hue + ')">' +
          '<div class="nm">' + e(p.name) + '</div>' + (p.does ? '<div class="dz">' + e(p.does) + '</div>' : '') +
          '<div class="ft"><span>' + p.file_count + ' FILES' + (p.path ? ' &middot; ' + e(p.path) : '') + '</span><span class="open">FILES &rsaquo;</span></div></a>';
      }).join('') + '</div>' +
      '<div class="col" id="cout"><h3>GOES OUT TO</h3>' + (outs.length ? outs.map(function (x) { return chip(x, 'out'); }).join('') : '<div class="pill none">nothing read going out</div>') +
      (outsAll.length > outs.length ? '<div class="pill none">and ' + (outsAll.length - outs.length) + ' more</div>' : '') + '</div>' +
      '</div><div class="detail" id="detail"><div class="empty">Point at a part, or at anything it is wired to, to see what crosses the wire.</div></div>';
    $('main').innerHTML = html;
    var box = $('inside'), svg = $('w2');
    var edges = [];
    ins.forEach(function (x) { Object.keys(x.near).forEach(function (p) { edges.push({ a: x.key, b: p, count: x.near[p], side: 'in' }); }); });
    outs.forEach(function (x) { Object.keys(x.near).forEach(function (p) { edges.push({ a: p, b: x.key, count: x.near[p], side: 'out' }); }); });
    innerW.forEach(function (w) { edges.push({ a: w.from, b: w.to, count: w.count, side: 'inner' }); });
    function draw() {
      var r0 = box.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + r0.width + ' ' + r0.height);
      var at = function (key, side) {
        var el = box.querySelector('[data-key="' + key + '"]'); if (!el) return null;
        var r = el.getBoundingClientRect();
        var y = r.top - r0.top + r.height / 2;
        if (side === 'left') return { x: r.left - r0.left, y: y };
        if (side === 'right') return { x: r.right - r0.left, y: y };
        return { x: r.left - r0.left, y: y };
      };
      svg.innerHTML = edges.map(function (ed) {
        var A, B, d;
        if (ed.side === 'inner') {
          A = at(ed.a, 'right'); B = at(ed.b, 'right'); if (!A || !B) return '';
          var bend = 26 + Math.min(40, Math.abs(A.y - B.y) / 6);
          d = 'M' + A.x + ',' + A.y + ' C' + (A.x + bend) + ',' + A.y + ' ' + (B.x + bend) + ',' + B.y + ' ' + B.x + ',' + B.y;
        } else {
          A = at(ed.a, 'right'); B = at(ed.b, 'left'); if (!A || !B) return '';
          var mx = (A.x + B.x) / 2;
          d = 'M' + A.x + ',' + A.y + ' C' + mx + ',' + A.y + ' ' + mx + ',' + B.y + ' ' + B.x + ',' + B.y;
        }
        var w = 0.8 + Math.min(3, Math.log(1 + ed.count));
        return '<path class="wire" data-a="' + e(ed.a) + '" data-b="' + e(ed.b) + '" d="' + d + '" style="stroke-width:' + w.toFixed(2) + 'px' + (ed.side === 'inner' ? '; stroke-dasharray: 4 3' : '') + '"></path>';
      }).join('');
    }
    draw();
    window.onresize = draw;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    var wiresOf = function (key) {
      return C.wires.level2.filter(function (w) {
        if (!mine(w.from) && !mine(w.to)) return false;
        return w.from === key || w.to === key || fold(w.from) === key || fold(w.to) === key;
      });
    };
    box.querySelectorAll('[data-key]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        var key = el.getAttribute('data-key');
        box.classList.add('focus');
        box.querySelectorAll('.lit').forEach(function (x) { x.classList.remove('lit'); });
        el.classList.add('lit');
        svg.querySelectorAll('.wire').forEach(function (w) {
          if (w.getAttribute('data-a') === key || w.getAttribute('data-b') === key) {
            w.classList.add('lit');
            var other = w.getAttribute('data-a') === key ? w.getAttribute('data-b') : w.getAttribute('data-a');
            var o = box.querySelector('[data-key="' + other + '"]'); if (o) o.classList.add('lit');
          }
        });
        var rows = wiresOf(key).slice(0, 16);
        $('detail').innerHTML = '<h4>' + e(endName(key)) + '</h4>' + (rows.length ? rows.map(function (w) {
          var out = w.from === key || fold(w.from) === key;
          return '<div class="row">' + e(endName(w.from)) + ' &rarr; <b>' + e(endName(w.to)) + '</b> <span class="k">' + kindsLine(w.kinds) + '</span><br><span class="k">' + namesLine(w) + '</span></div>';
        }).join('') : '<div class="empty">No wires read to or from it.</div>');
      });
    });
    box.addEventListener('mouseleave', function () { box.classList.remove('focus'); box.querySelectorAll('.lit').forEach(function (x) { x.classList.remove('lit'); }); });
  }

  // ---- level 4: the files behind one part
  function files(bid, pid) {
    var x = partByKey[bid + '/' + pid];
    if (!x) { $('main').innerHTML = '<p class="nothing">That part is not on the map. <a href="#/">Back to the platform</a>.</p>'; return; }
    levels('part');
    trail([[REPO, '#/'], [x.block.name, '#/block/' + bid], [x.part.name, '#/part/' + bid + '/' + pid]]);
    var placeName = function (file) {
      for (var k in partByKey) { if (partByKey[k].part.files.some(function (f) { return f.file === file; })) return partByKey[k].part.name + ' (' + partByKey[k].block.name + ')'; }
      return file;
    };
    var usedBy = {};
    for (var pk in partByKey) {
      var px = partByKey[pk];
      if (px.part === x.part) continue;
      px.part.files.forEach(function (f) { f.refs.forEach(function (r) { if (r.k === 'import') (usedBy[r.n] = usedBy[r.n] || []).push(px.part.name + ' (' + px.block.name + ')'); }); });
    }
    var rows = x.part.files.map(function (f) {
      var g = {};
      f.refs.forEach(function (r) {
        var label = r.k === 'import' ? placeName(r.n) : r.n;
        (g[r.k] = g[r.k] || []).indexOf(label) < 0 && g[r.k].push(label);
      });
      var cell = Object.keys(g).map(function (k) { return '<div><span class="k">' + e(KIND[k] || k) + ':</span> ' + e(g[k].slice(0, 14).join(', ')) + (g[k].length > 14 ? ' and ' + (g[k].length - 14) + ' more' : '') + '</div>'; }).join('');
      var users = (usedBy[f.file] || []).filter(function (u, i, a) { return a.indexOf(u) === i; });
      return '<tr><td class="f">' + e(f.file) + '</td><td>' + (cell || '<span class="k">nothing outside this part read</span>') + '</td><td>' +
        (users.length ? e(users.slice(0, 8).join(', ')) + (users.length > 8 ? ' and ' + (users.length - 8) + ' more' : '') : '<span class="k">no other part read using it</span>') + '</td></tr>';
    }).join('');
    $('main').innerHTML = '<p class="lede"><b>' + e(x.part.name) + '.</b> ' + e(x.part.does || '') + ' <span class="hint">' + x.part.file_count + ' files: what each one reaches outside its part, and which other parts use it.</span></p>' +
      (rows ? '<table class="files"><thead><tr><th>FILE</th><th>WHAT IT REACHES</th><th>USED BY</th></tr></thead><tbody>' + rows + '</tbody></table>' : '<p class="nothing">No files are placed in this part yet.</p>');
  }

  // ---- level 3: the path a person walks
  function walk() {
    levels('path');
    trail([[REPO, '#/'], ["A person's path", '#/path']]);
    var P = C.path;
    if (!P || !P.doors) { $('main').innerHTML = '<p class="nothing">This repo has no door list to read a path from.</p>'; return; }
    var rows = P.doors.map(function (d, i) {
      return '<div class="door" style="grid-column:5; grid-row:' + (i + 2) + '"><div class="nm">' + e(d.name) + '</div><div class="dz">' + e(d.does) + '</div>' +
        '<div class="ft">' + e(d.path) + ' &middot; ' + (d.preview ? 'a shared link shows its picture' : 'no link preview read') + '</div></div>' +
        '<div class="arrow" style="grid-column:6; grid-row:' + (i + 2) + '">&rarr;</div>' +
        '<div class="leads" style="grid-column:7; grid-row:' + (i + 2) + '">' + (d.leads_to.length ? d.leads_to.map(function (r) { return '<span class="pill">' + e(r) + '</span>'; }).join('') : '<span class="pill none">no links read</span>') + '</div>';
    }).join('');
    var span = 'grid-row: 2 / span ' + P.doors.length;
    var html = '<p class="lede">How a stranger arrives: from where people already are, to the landing page, through a door, into a church\\'s Sanctuary. ' +
      '<span class="hint">' + e(P.how) + '.</span></p>' +
      '<div class="walk">' +
      '<h3 style="grid-column:1; grid-row:1">OUTER WORLD</h3><h3 style="grid-column:3; grid-row:1">THE LANDING PAGE</h3><h3 style="grid-column:5; grid-row:1">THE DOORS &middot; ' + P.doors.length + '</h3><h3 style="grid-column:7; grid-row:1">WHERE EACH LEADS</h3><h3 style="grid-column:9; grid-row:1">ORG ENTRY</h3>' +
      '<div class="stack" style="grid-column:1; ' + span + '">' + P.outer_world.names.map(function (x) { return '<span class="pill">' + e(x) + '</span>'; }).join('') + '<span class="k mono" style="font-size:11px;color:var(--faint)">named in the doorway law</span></div>' +
      '<div class="arrow" style="grid-column:2; ' + span + '">&rarr;</div>' +
      '<div class="stack" style="grid-column:3; ' + span + '"><div class="tall"><div style="font-weight:600">telechurchlive.com</div><div style="font-size:12.5px;color:var(--muted);margin-top:4px;line-height:1.4">' +
        (P.landing ? (P.landing.shows_doors ? 'Shows every door - read from what the page loads.' : 'Does not load the door list.') + '<br><span class="mono" style="font-size:11px;color:var(--faint)">' + e(P.landing.page.split('/').pop()) + '</span>' : 'No landing page read.') +
        '</div></div>' + (P.landing && P.landing.leads_to.length ? '<div class="leads">' + P.landing.leads_to.slice(0, 6).map(function (r) { return '<span class="pill">' + e(r) + '</span>'; }).join('') + '</div>' : '') + '</div>' +
      '<div class="arrow" style="grid-column:4; ' + span + '">&rarr;</div>' +
      rows +
      '<div class="arrow" style="grid-column:8; ' + span + '">&rarr;</div>' +
      '<div class="stack" style="grid-column:9; ' + span + '"><div class="tall"><div style="font-weight:600">A church\\'s Sanctuary</div><div style="font-size:12.5px;color:var(--muted);margin-top:4px">where every door leads</div></div>' +
        P.sanctuary.map(function (r) { return '<span class="pill">' + e(r) + '</span>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="detail"><div class="row">The doors are <a href="#/block/doors" style="color:var(--blue)">a block of their own</a> - open it to see what each door calls on the server.</div></div>';
    $('main').innerHTML = html;
  }

  // ---- the tray
  function tray() {
    levels('tray');
    trail([[REPO, '#/'], ['Not yet read', '#/tray']]);
    var T = C.tray;
    $('main').innerHTML = '<p class="lede">What the reader could not place or could not follow. A gap is shown here rather than hidden. ' +
      '<span class="hint">A folder is placed by adding it to a block in ' + e(C.blocks_from) + '.</span></p>' +
      '<h3 class="eyebrow" style="margin:18px 0 8px">NOT YET PLACED IN A BLOCK &middot; ' + n.unplaced_files + ' FILES</h3>' +
      (T.unplaced.length ? '<table class="files"><tbody>' + T.unplaced.map(function (u) { return '<tr><td class="f">' + e(u.folder) + '</td><td>' + u.files + ' files</td></tr>'; }).join('') + '</tbody></table>' : '<p class="nothing">Every file is in a block.</p>') +
      '<h3 class="eyebrow" style="margin:24px 0 8px">CALLS NOT YET READ &middot; ' + T.unread.length + '</h3>' +
      '<p class="lede" style="font-size:14px">A call whose name is built while the app runs cannot be read from the code. These are not drawn.</p>' +
      (T.unread.length ? '<table class="files"><tbody>' + T.unread.map(function (u) { return '<tr><td class="f">' + e(u.file) + ':' + u.line + '</td><td class="mono" style="font-size:12px">' + e(u.text) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="nothing">Every call was read.</p>');
  }

  function route() {
    var h = (location.hash || '#/').slice(1).split('/').filter(Boolean).map(decodeURIComponent);
    window.onresize = null;
    if (h[0] === 'block') inside(h[1]);
    else if (h[0] === 'part') files(h[1], h[2]);
    else if (h[0] === 'path') walk();
    else if (h[0] === 'tray') tray();
    else top();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
</script>
</body>
</html>`;
}

module.exports = { renderBlueprintPage };
