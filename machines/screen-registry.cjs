#!/usr/bin/env node
/**
 * SCREEN REGISTRY - remember every screen this machine has ever shown on, and
 * which of them arrived over the air.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-23, after asking whether a ScreenBeam could connect itself
 * at boot: "Maybe we can include screen detection to capture and provision and
 * save wireless displays for future automatic management."
 *
 * WHY A REGISTRY BEFORE AN AUTO-CONNECT. A church buys a receiver, plugs it
 * into the TV, and from then on the PC should find it. Nothing can find it
 * automatically until something has WRITTEN DOWN what "it" is - and the
 * identity has to be the part that survives a power cut: not the window on
 * screen, not the IP it happened to get, but the receiver's own name and MAC.
 * Windows keeps those under SWD\WiFiDirect and they outlive a reboot; this
 * station copies them somewhere the factory can read and act on.
 *
 * WHAT IT PROVES AND WHAT IT DOES NOT. It reports the topology, classifies each
 * screen as wired or wireless by ancestry rather than by name, and records every
 * wireless sink it has ever seen. It does NOT connect anything. The connect side
 * was measured on 2026-09-23 and the finding is recorded here so nobody has to
 * rediscover it:
 *
 *   - Miracast support is real on this host: `netsh wlan show driver` reports
 *     "Wireless Display Supported: Yes (Graphics Driver: Yes, Wi-Fi Driver: Yes)".
 *   - A plain script CAN find the sink. ProjectionManager.GetDeviceSelector()
 *     plus DeviceInformation.FindAllAsync returns it with a stable id keyed on
 *     the receiver's MAC - WiFiDirect#0E:61:27:40:E8:0F for the unit on this
 *     desk, named SBWD 40E80F.
 *   - A plain script CANNOT start the projection. ProjectionManager.
 *     StartProjectingAsync wants view ids that only a packaged app has, and
 *     refuses a desktop process with "The parameter is incorrect."
 *   - The layer underneath IS reachable: WiFiDirectDevice.FromIdAsync returned
 *     Connected with endpoints 192.168.137.1 to 192.168.137.247.
 *
 * So the missing piece is not discovery and not memory - both work from a
 * script today. It is the last inch: telling Windows to project. That is a
 * separate decision with a cost attached, and a registry is worth having
 * whichever way it goes.
 *
 * ONE VOCABULARY. Monitor numbering comes from engine/kiosk.ps1 -List, which
 * the board and the kiosk launcher already use, so a screen called 2 here is
 * the screen called 2 everywhere else. Minting a second numbering would be the
 * defect this factory keeps writing down.
 *
 *   node <factory>/machines/screen-registry.cjs          report
 *   node <factory>/machines/screen-registry.cjs --json   machine-readable
 *   node <factory>/machines/screen-registry.cjs --dry    read, write nothing
 *
 * Exit 0 always: having no wireless display is an ordinary state, not a fault.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const STORE = path.join(CTX, "screens.json");
const BELT = path.join(CTX, "findings.jsonl");
const JSON_OUT = process.argv.includes("--json");
const DRY = process.argv.includes("--dry");
const now = new Date().toISOString();

const FACTORY = path.resolve(__dirname, "..");
const KIOSK = path.join(FACTORY, "engine/kiosk.ps1");

// windowsHide on every launcher: the factory's standing rule since 2026-09-15,
// and a gate checks it. A station that watches screens must not put a console
// on one.
const ps = (script) =>
  String(
    execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      windowsHide: true,
    }),
  );

const parse = (text, fallback) => {
  try {
    const v = JSON.parse(String(text).trim() || "null");
    return v === null ? fallback : Array.isArray(v) || typeof v === "object" ? v : fallback;
  } catch {
    return fallback;
  }
};
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// ---- the live topology, in the numbering everything else already uses --------
function monitors() {
  try {
    return asArray(parse(ps(`& '${KIOSK}' -List`), []));
  } catch {
    return [];
  }
}

// ---- which screen is wireless, decided by ANCESTRY not by name ---------------
//
// A Miracast screen's monitor node has a parent of the form
// SWD\WiFiDirect\<MAC>#Miracast. The two TVs on this desk both report
// UserFriendlyName "FullHD TV" and only the parent tells them apart, which is
// exactly why the test is the parent and not the label.
const MONITOR_PS = [
  "$out = @()",
  "foreach ($m in Get-PnpDevice -Class Monitor -ErrorAction SilentlyContinue) {",
  "  $parent = $null",
  "  try { $parent = (Get-PnpDeviceProperty -InstanceId $m.InstanceId -KeyName 'DEVPKEY_Device_Parent' -ErrorAction Stop).Data } catch {}",
  "  $out += [pscustomobject]@{ InstanceId = $m.InstanceId; Status = $m.Status; Parent = $parent }",
  "}",
  "$out | ConvertTo-Json -Compress -Depth 3",
].join("\n");

// ---- every wireless sink Windows can see, connected or merely discoverable ---
//
// The selector is Windows' own - the one the Connect pane uses - rather than a
// guess at what a wireless display looks like.
const SINKS_PS = [
  "function Await($op, [Type]$t) {",
  "  $m = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1",
  "  $r = $m.MakeGenericMethod($t).Invoke($null, @($op)); $null = $r.Wait(20000); return $r.Result",
  "}",
  "[void][Windows.Devices.Enumeration.DeviceInformation, Windows.Devices.Enumeration, ContentType = WindowsRuntime]",
  "$pm = [Windows.UI.ViewManagement.ProjectionManager, Windows.UI.ViewManagement, ContentType = WindowsRuntime]",
  "$sel = $pm::GetDeviceSelector()",
  "$found = Await ([Windows.Devices.Enumeration.DeviceInformation]::FindAllAsync($sel)) ([Windows.Devices.Enumeration.DeviceInformationCollection])",
  "$rows = @()",
  "foreach ($d in $found) { $rows += [pscustomobject]@{ Name = $d.Name; Id = $d.Id } }",
  "[pscustomobject]@{ projecting = [bool]$pm::ProjectionDisplayAvailable; devices = $rows } | ConvertTo-Json -Compress -Depth 4",
].join("\n");

// ---- what survives a reboot -------------------------------------------------
//
// THE PART THAT MAKES PROVISIONING POSSIBLE. These keys are written when a
// display is first paired and they are still there after a power cut, so a
// receiver seen once can be recognised for as long as the machine lives.
const REMEMBERED_PS = [
  "$out = @()",
  "$base = 'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\SWD\\WiFiDirect'",
  "if (Test-Path $base) {",
  "  foreach ($k in Get-ChildItem $base -ErrorAction SilentlyContinue) {",
  "    $p = Get-ItemProperty $k.PSPath -ErrorAction SilentlyContinue",
  "    $out += [pscustomobject]@{ Key = $k.PSChildName; FriendlyName = $p.FriendlyName; DeviceDesc = $p.DeviceDesc }",
  "  }",
  "}",
  "$out | ConvertTo-Json -Compress -Depth 3",
].join("\n");

const CAPABILITY_PS = [
  "$t = (netsh wlan show driver) -join \"`n\"",
  "$m = [regex]::Match($t, 'Wireless Display Supported\\s*:\\s*(.+)')",
  "[pscustomobject]@{ line = $(if ($m.Success) { $m.Groups[1].Value.Trim() } else { $null }) } | ConvertTo-Json -Compress",
].join("\n");

const MAC_RE = /WiFiDirect[\\#]([0-9A-Fa-f:]{17})/;
const macOf = (s) => {
  const m = MAC_RE.exec(String(s || ""));
  return m ? m[1].toUpperCase() : null;
};

let readFailures = [];
const safely = (what, fn, fallback) => {
  try {
    return fn();
  } catch (err) {
    // UNREADABLE IS NOT EMPTY. A failed probe that returned [] would be written
    // to the store as "no wireless displays", which is the lie this whole
    // factory keeps catching in its own instruments.
    readFailures.push(`${what}: ${String(err.message || err).split("\n")[0]}`);
    return fallback;
  }
};

const mon = safely("monitors", monitors, []);
const pnp = asArray(safely("monitor ancestry", () => parse(ps(MONITOR_PS), []), []));
const sinkDoc = safely("wireless sinks", () => parse(ps(SINKS_PS), {}), {});
const remembered = asArray(safely("remembered pairings", () => parse(ps(REMEMBERED_PS), []), []));
const capability = safely("miracast capability", () => parse(ps(CAPABILITY_PS), {}), {});

const wirelessMonitors = pnp.filter((m) => /#Miracast$/i.test(String(m.Parent || "")));
const wiredCount = pnp.filter((m) => String(m.Status) === "OK" && !/#Miracast$/i.test(String(m.Parent || ""))).length;

// A sink is identified by MAC wherever one can be read, because the friendly
// name is the only other candidate and two receivers of the same model share it.
const sinksSeen = new Map();
for (const d of asArray(sinkDoc.devices)) {
  const mac = macOf(d.Id);
  if (!mac) continue; // a DISPLAY# interface id is the same sink seen from the other side
  sinksSeen.set(mac, { mac, friendlyName: String(d.Name || "").trim(), aepId: String(d.Id || "") });
}
for (const r of remembered) {
  const mac = macOf(`WiFiDirect#${r.Key}`) || macOf(r.Key) || (/^[0-9A-Fa-f:]{17}/.test(String(r.Key)) ? String(r.Key).slice(0, 17).toUpperCase() : null);
  if (!mac) continue;
  const prev = sinksSeen.get(mac) || { mac, friendlyName: String(r.FriendlyName || "").trim(), aepId: `WiFiDirect#${mac}` };
  prev.rememberedByWindows = true;
  if (!prev.friendlyName) prev.friendlyName = String(r.FriendlyName || "").trim();
  sinksSeen.set(mac, prev);
}
const connectedMacs = new Set(wirelessMonitors.map((m) => macOf(m.Parent)).filter(Boolean));

// ---- merge with what we already knew ----------------------------------------
//
// NOTHING IS EVER DROPPED. A receiver that is switched off today is the same
// receiver tomorrow, and a registry that forgets it the moment the TV is dark
// is not a registry - it is a snapshot with ambitions.
const prior = (() => {
  try {
    return JSON.parse(fs.readFileSync(STORE, "utf8"));
  } catch {
    return { sinks: {} };
  }
})();
const sinks = { ...(prior.sinks || {}) };
const firstTime = [];
for (const [mac, s] of sinksSeen) {
  const was = sinks[mac];
  const connected = connectedMacs.has(mac);
  if (!was) firstTime.push(s);
  sinks[mac] = {
    mac,
    friendlyName: s.friendlyName || (was && was.friendlyName) || null,
    aepId: s.aepId || (was && was.aepId) || null,
    rememberedByWindows: !!(s.rememberedByWindows || (was && was.rememberedByWindows)),
    firstSeen: (was && was.firstSeen) || now,
    lastSeen: now,
    timesSeen: ((was && was.timesSeen) || 0) + 1,
    lastConnectedAt: connected ? now : (was && was.lastConnectedAt) || null,
    connectedNow: connected,
  };
}
// A sink that is absent this round keeps everything except connectedNow.
for (const mac of Object.keys(sinks)) if (!sinksSeen.has(mac)) sinks[mac] = { ...sinks[mac], connectedNow: false };

const report = {
  checkedAt: now,
  repo: path.basename(ROOT),
  host: process.env.COMPUTERNAME || null,
  miracast: capability.line || null,
  projecting: !!sinkDoc.projecting,
  displays: mon.map((m) => {
    // Geometry alone cannot say which monitor node is which; what it can say is
    // how many screens there are and where they sit, in the numbering the board
    // and the kiosk already use. The wired/wireless split is reported beside it
    // rather than welded onto a number it cannot prove.
    return { index: m.index, x: m.x, y: m.y, width: m.width, height: m.height, primary: !!m.primary };
  }),
  counts: { screens: mon.length, wired: wiredCount, wireless: wirelessMonitors.length },
  sinks,
  readFailures,
  // Said out loud in the artefact, not only in this file's header, because the
  // next reader will be a session that never saw the measurement.
  connectNote:
    "Discovery and memory both work from a plain script; starting the projection does not. ProjectionManager.StartProjectingAsync refuses a desktop process (\"The parameter is incorrect\") because it wants view ids only a packaged app has. Auto-connect therefore needs either a packaged helper or the Connect UI driven deliberately - it is not a missing line of script.",
};

if (!DRY) {
  fs.mkdirSync(CTX, { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify({ updatedAt: now, sinks, lastReport: report }, null, 2) + "\n");
}

// A NEW RECEIVER IS NEWS. One record per sink, ever - the belt is told when a
// screen joins this machine for the first time, and never again.
let deposited = 0;
if (!DRY && firstTime.length && fs.existsSync(BELT)) {
  const beltText = fs.readFileSync(BELT, "utf8");
  for (const s of firstTime) {
    const id = `screen-first-seen-${s.mac.replace(/:/g, "")}`;
    if (beltText.includes(`"${id}"`)) continue;
    fs.appendFileSync(
      BELT,
      JSON.stringify({
        id,
        run: now,
        driver: "I4",
        tier: 2,
        kind: "deposit",
        dimension: "spirit",
        source: "screen-registry",
        subject: "the screens this machine can show on",
        claim: `A wireless display joined this machine for the first time: ${s.friendlyName || "(unnamed)"} at ${s.mac}.`,
        evidence: `Found through Windows' own wireless-display selector as ${s.aepId}. Windows keeps the pairing under SWD\\WiFiDirect, so the receiver is recognisable after a reboot. Recorded in .claude/agent-context/screens.json.`,
        recommend:
          "Nothing yet. This is the identity an automatic connect would aim at; deciding whether to build that connect is separate, and the cost is in the header of screen-registry.cjs rather than in a guess.",
        seen: true,
        confidence: "measured",
        triggers: "contract:spirit",
        owner: "spirit",
      }) + "\n",
      "utf8",
    );
    deposited++;
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify({ ...report, deposited }, null, 2));
} else {
  console.log(`screen-registry: ${report.counts.screens} screen(s) - ${report.counts.wired} wired, ${report.counts.wireless} wireless  [${report.repo}]`);
  console.log(`     miracast: ${report.miracast || "unknown"}   projecting: ${report.projecting}`);
  for (const m of report.displays) {
    console.log(`     screen ${m.index}: ${m.width}x${m.height} at ${m.x},${m.y}${m.primary ? "  (primary)" : ""}`);
  }
  const list = Object.values(sinks);
  if (!list.length) console.log("     no wireless receiver has ever been seen by this machine");
  for (const s of list) {
    console.log(
      `     sink ${s.friendlyName || "(unnamed)"}  ${s.mac}  ${s.connectedNow ? "CONNECTED" : "not connected"}` +
        `  seen ${s.timesSeen}x, first ${String(s.firstSeen).slice(0, 16)}${s.rememberedByWindows ? ", remembered by Windows" : ""}`,
    );
  }
  for (const f of readFailures) console.log(`     COULD NOT READ - ${f}`);
  if (deposited) console.log(`\n  deposited ${deposited}`);
}
process.exit(0);
