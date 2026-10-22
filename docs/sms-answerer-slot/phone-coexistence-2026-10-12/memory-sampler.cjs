// Samples memory for the SMS bridge app and llama-server on the phone, every
// few seconds, until the stop file appears. Reads only /proc and dumpsys.
const fs = require("fs");
const { execFileSync } = require("child_process");
const [out, stopFile, serial] = process.argv.slice(2);
const sh = (cmd) => {
  try {
    return execFileSync("adb", ["-s", serial, "shell", cmd], { encoding: "utf8" });
  } catch {
    return "";
  }
};
const kb = (text, key) => Number((text.match(new RegExp(`${key}:\\s+(\\d+) kB`)) || [])[1] || 0);
const mb = (n) => Math.round(n / 1024);
const rows = [];
const sample = () => {
  const text = sh(
    "echo BRIDGE_PID=$(pidof org.alliance.smsbridge); echo LLAMA_PID=$(pidof llama-server);" +
      "echo ---B; cat /proc/$(pidof org.alliance.smsbridge)/status 2>/dev/null; echo ADJ_B=$(cat /proc/$(pidof org.alliance.smsbridge)/oom_score_adj 2>/dev/null);" +
      "echo ---L; cat /proc/$(pidof llama-server)/status 2>/dev/null; echo ADJ_L=$(cat /proc/$(pidof llama-server)/oom_score_adj 2>/dev/null);" +
      "echo ---M; cat /proc/meminfo; echo ---T; dumpsys battery | grep -E 'level|temperature'",
  );
  const [head, rest1] = text.split("---B");
  const [b, rest2] = (rest1 || "").split("---L");
  const [l, rest3] = (rest2 || "").split("---M");
  const [m, t] = (rest3 || "").split("---T");
  const row = {
    at: new Date().toISOString(),
    bridge_pid: Number((head.match(/BRIDGE_PID=(\d+)/) || [])[1] || 0),
    llama_pid: Number((head.match(/LLAMA_PID=(\d+)/) || [])[1] || 0),
    bridge_rss_mb: mb(kb(b || "", "VmRSS")),
    bridge_swap_mb: mb(kb(b || "", "VmSwap")),
    bridge_oom_adj: Number(((b || "").match(/ADJ_B=(-?\d+)/) || [])[1] ?? NaN),
    llama_rss_mb: mb(kb(l || "", "VmRSS")),
    llama_peak_mb: mb(kb(l || "", "VmHWM")),
    llama_swap_mb: mb(kb(l || "", "VmSwap")),
    llama_oom_adj: Number(((l || "").match(/ADJ_L=(-?\d+)/) || [])[1] ?? NaN),
    mem_available_mb: mb(kb(m || "", "MemAvailable")),
    mem_free_mb: mb(kb(m || "", "MemFree")),
    swap_free_mb: mb(kb(m || "", "SwapFree")),
    swap_total_mb: mb(kb(m || "", "SwapTotal")),
    battery_level: Number(((t || "").match(/level: (\d+)/) || [])[1] || 0),
    battery_temp_c: Number(((t || "").match(/temperature: (\d+)/) || [])[1] || 0) / 10,
  };
  rows.push(row);
  fs.writeFileSync(out, JSON.stringify(rows, null, 2) + "\n");
};
(async () => {
  while (!fs.existsSync(stopFile)) {
    sample();
    await new Promise((r) => setTimeout(r, 4000));
  }
  sample();
})();
