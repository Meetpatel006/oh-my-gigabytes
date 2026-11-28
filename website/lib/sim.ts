import { VERSION } from "./site";

export type Seg = { t: string; c?: string };
export type Line = Seg[];

type Tier = "review" | "info" | "protected";
type Finding = {
  path: string;
  size: number;
  tier: Tier;
  category: string;
  rule: string;
  reason: string;
  changed: string;
  evidence: string;
  effects: string;
  regen: string;
  warnings: string;
  suggest: boolean;
};
type Node = { size: number; files: number; dir: boolean; regen?: boolean; guard?: string };
type Choice = { label: string; tone?: string; key?: string; act: string };
type Menu = { title: string; tone: string; body: [string, string?][]; choices: Choice[]; cursor: number; paths?: string[] };
type Logged = { path: string; size: number; source?: "auto" | "docker" };
type DockerItem = { kind: string; name: string; size: number };
type AutoDelete = { on: boolean; days: number; risky: boolean; plugged: boolean; last: string };
type Pending = { every: number; risky: boolean; battery: boolean };

export type Sim = {
  screen: "shell" | "tui";
  shell: Line[];
  scanned: boolean;
  scan: { done: number; inShell: boolean } | null;
  tab: number;
  cursor: number[];
  dir: string;
  tier: number;
  details: boolean;
  help: boolean;
  trash: string[];
  auto: string[];
  selected: string[];
  dismissed: string[];
  gone: string[];
  freed: number;
  log: Logged[];
  deleted: Logged[];
  menu: Menu | null;
  message: string;
  theme: Theme;
  autoTrash: boolean;
  day: number;
  added: Record<string, number>;
  held: string[];
  autoDel: AutoDelete;
  docker: DockerItem[];
  schedule: boolean;
  pending: Pending | null;
};

export type Theme = "auto" | "dark" | "light";
const THEMES: Theme[] = ["auto", "dark", "light"];
const nextTheme = (t: Theme) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length];

const KiB = 1024;
const MiB = KiB * 1024;
const GiB = MiB * 1024;
const TOTAL_FILES = 1_012_000;
const ENTRIES = 1_009_437;
const RATE = 70_510;
export const SCAN_STEP = 63_250;

export function bytes(value: number): string {
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let amount = value;
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  return `${amount.toFixed(2)} ${units[unit]}`;
}

const g = (n: number) => Math.round(n * GiB);
const m = (n: number) => Math.round(n * MiB);

const TREE: Record<string, Node> = {
  "~": { size: g(212.48), files: ENTRIES, dir: true },
  "~/Library": { size: g(64.2), files: 412_880, dir: true, guard: "~/Library itself is a standard macOS folder" },
  "~/Library/Developer": { size: g(24.1), files: 201_330, dir: true },
  "~/Library/Developer/Xcode": { size: g(21.3), files: 188_020, dir: true },
  "~/Library/Developer/Xcode/DerivedData": { size: g(18.62), files: 160_311, dir: true, regen: true },
  "~/Library/Developer/Xcode/iOS DeviceSupport": { size: g(2.68), files: 27_709, dir: true, regen: true },
  "~/Library/Application Support": { size: g(22.1), files: 98_102, dir: true },
  "~/Library/Caches": { size: g(6.4), files: 61_004, dir: true },
  "~/Library/Logs": { size: m(912), files: 3_410, dir: true },
  "~/Library/Logs/Homebrew": { size: m(212.4), files: 1_288, dir: true },
  "~/code": { size: g(38.4), files: 244_190, dir: true },
  "~/code/game": { size: g(9.1), files: 31_870, dir: true },
  "~/code/game/target": { size: g(4.31), files: 28_115, dir: true, regen: true },
  "~/code/game/src": { size: m(3.1), files: 212, dir: true },
  "~/code/old-api": { size: g(2.9), files: 61_540, dir: true },
  "~/code/old-api/node_modules": { size: g(1.27), files: 60_903, dir: true, regen: true },
  "~/code/website": { size: g(1.1), files: 19_220, dir: true },
  "~/Movies": { size: g(21.3), files: 214, dir: true, guard: "a standard folder" },
  "~/Movies/demo-recording.mov": { size: g(2.9), files: 1, dir: false },
  "~/.colima": { size: g(9.8), files: 41, dir: true, guard: "container or VM disk; clean Docker data with omg docker" },
  "~/.ollama": { size: g(7.4), files: 38, dir: true },
  "~/.ollama/models": { size: g(7.4), files: 36, dir: true },
  "~/Documents": { size: g(6.2), files: 8_204, dir: true, guard: "a standard folder" },
  "~/.npm": { size: g(4.02), files: 120_410, dir: true },
  "~/.npm/_cacache": { size: g(3.88), files: 119_870, dir: true, regen: true },
  "~/.cargo": { size: g(3.1), files: 88_015, dir: true },
  "~/.cargo/registry": { size: g(2.14), files: 81_442, dir: true, regen: true },
  "~/Downloads": { size: g(3.4), files: 920, dir: true },
  "~/.nvm": { size: g(1.2), files: 41_330, dir: true },
  "~/.nvm/versions": { size: g(1.19), files: 41_300, dir: true },
  "~/.nvm/versions/node": { size: g(1.19), files: 41_300, dir: true },
  "~/.nvm/versions/node/v18.20.4": { size: m(96.2), files: 6_010, dir: true },
  "~/.nvm/versions/node/v22.21.1": { size: m(102.7), files: 6_240, dir: true },
  "~/code/old-fork": { size: g(1.84), files: 22_410, dir: true },
  "~/Downloads/Docker.dmg": { size: m(498.6), files: 1, dir: false },
  "~/.codex": { size: m(201.3), files: 1_904, dir: true },
  "~/.codex/sessions": { size: m(199.8), files: 1_880, dir: true },
  "~/.codex/sessions/2026": { size: m(199.8), files: 1_880, dir: true },
  "~/.codex/sessions/2026/11": { size: m(15.3), files: 142, dir: true },
  "~/.codex/sessions/2026/09": { size: m(184.5), files: 1_738, dir: true },
  "~/.vscode": { size: m(612.4), files: 30_118, dir: true },
  "~/.vscode/extensions": { size: m(611.9), files: 30_102, dir: true },
  "~/.vscode/extensions/ms-python.python-2026.8.0": { size: m(141.7), files: 6_820, dir: true },
  "~/.vscode/extensions/ms-python.python-2026.10.0": { size: m(144.2), files: 6_905, dir: true },
};

const FINDINGS: Finding[] = [
  {
    path: "~/Library/Developer/Xcode/DerivedData", size: g(18.62), tier: "review", category: "build_artifacts",
    rule: "Xcode DerivedData", reason: "Xcode build output and indexes; rebuilt on the next build", changed: "12d ago",
    evidence: "directory named DerivedData under ~/Library/Developer/Xcode", effects: "the next build of each project is slower",
    regen: "Xcode rebuilds it", warnings: "quit Xcode first", suggest: true,
  },
  {
    path: "~/.colima", size: g(9.8), tier: "protected", category: "containers",
    rule: "Container VM", reason: "container VM disk; clean Docker data with omg docker instead", changed: "1h ago",
    evidence: "directory named .colima in your home folder", effects: "every container, image and volume would be lost",
    regen: "no", warnings: "never deleted by omg", suggest: false,
  },
  {
    path: "~/.ollama/models", size: g(7.4), tier: "info", category: "ml_models",
    rule: "Ollama models", reason: "downloaded models; listed for you, never suggested", changed: "34d ago",
    evidence: "directory ~/.ollama/models", effects: "models must be downloaded again",
    regen: "ollama pull", warnings: "file times cannot tell when a model was last used", suggest: false,
  },
  {
    path: "~/code/game/target", size: g(4.31), tier: "review", category: "build_artifacts",
    rule: "Cargo target", reason: "Rust build output beside Cargo.toml", changed: "41d ago",
    evidence: "target next to Cargo.toml, 50 MB or more", effects: "the next cargo build starts from scratch",
    regen: "cargo build", warnings: "", suggest: true,
  },
  {
    path: "~/.npm/_cacache", size: g(3.88), tier: "review", category: "package_caches",
    rule: "npm cache", reason: "npm download cache; filled again on demand", changed: "2d ago",
    evidence: "directory ~/.npm/_cacache", effects: "the next installs download packages again",
    regen: "npm install", warnings: "", suggest: true,
  },
  {
    path: "~/Movies/demo-recording.mov", size: g(2.9), tier: "info", category: "large_files",
    rule: "Large file", reason: "a large file; size alone is not a reason to delete it", changed: "88d ago",
    evidence: "file of 1 GiB or more", effects: "the file is gone",
    regen: "no", warnings: "check it yourself first", suggest: false,
  },
  {
    path: "~/.cargo/registry", size: g(2.14), tier: "review", category: "package_caches",
    rule: "Cargo registry cache", reason: "downloaded crates and their sources", changed: "6d ago",
    evidence: "directory ~/.cargo/registry", effects: "crates are downloaded again on the next build",
    regen: "cargo fetch", warnings: "", suggest: true,
  },
  {
    path: "~/code/old-api/node_modules", size: g(1.27), tier: "review", category: "build_artifacts",
    rule: "Stale dependencies", reason: "dependencies of a project untouched for 94 days", changed: "94d ago",
    evidence: "node_modules beside package.json, project unchanged 30+ days", effects: "the project needs npm install before it runs",
    regen: "npm install", warnings: "", suggest: false,
  },
  {
    path: "~/Library/Logs/Homebrew", size: m(212.4), tier: "review", category: "logs_and_temp",
    rule: "Old logs", reason: "log files not modified for 12 days", changed: "12d ago",
    evidence: "direct item of ~/Library/Logs, 1 MB+, 7+ days old", effects: "old log history is gone",
    regen: "written again as needed", warnings: "", suggest: true,
  },
  {
    path: "~/.nvm/versions/node/v18.20.4", size: m(96.2), tier: "review", category: "old_tool_versions",
    rule: "Older nvm version", reason: "older Node version; a newer one is installed", changed: "61d ago",
    evidence: "nvm version folder unchanged 30 days, newer line present", effects: "nvm use 18 needs a reinstall",
    regen: "nvm install 18", warnings: "", suggest: true,
  },
  {
    path: "~/code/old-fork", size: g(1.84), tier: "review", category: "unused_clones",
    rule: "Unused Git clone", reason: "a clone untouched for 73 days with nothing that is not on its remote", changed: "73d ago",
    evidence: "every branch on the remote, no stash or local tag, every file matches Git's index", effects: "the folder is gone; clone it again to get it back",
    regen: "git clone", warnings: "a whole repository; omg clean never takes it", suggest: false,
  },
  {
    path: "~/Downloads/Docker.dmg", size: m(498.6), tier: "review", category: "old_downloads",
    rule: "Old installer", reason: "a disk image in Downloads, not opened for 52 days", changed: "52d ago",
    evidence: "installer or disk image in ~/Downloads, 10 MB+, 30+ days old", effects: "download it again if you need it",
    regen: "download it again", warnings: "listed for you, never suggested", suggest: false,
  },
  {
    path: "~/.codex/sessions/2026/09", size: m(184.5), tier: "review", category: "session_history",
    rule: "Old Codex sessions", reason: "session transcripts older than 7 days", changed: "58d ago",
    evidence: "Codex session store, items 7+ days old, 1 MB+", effects: "those old sessions can no longer be resumed",
    regen: "no", warnings: "", suggest: true,
  },
  {
    path: "~/.vscode/extensions/ms-python.python-2026.8.0", size: m(141.7), tier: "review", category: "old_tool_versions",
    rule: "Older VS Code extension", reason: "an older version of an extension; the newer one is installed", changed: "39d ago",
    evidence: "same extension id with a newer version a day old or more", effects: "none; VS Code uses the newer version",
    regen: "no need", warnings: "", suggest: true,
  },
];

const WELCOME = "Welcome to OMG: it finds it, explains it, and you decide. Press m for options.";
export const TAB_NAMES = ["Overview", "Browse", "Findings", "OMG Trash", "Deleted"];
const TIERS = ["all", "review", "info", "protected"] as const;

export function initial(): Sim {
  return {
    screen: "shell",
    shell: [],
    scanned: false,
    scan: null,
    tab: 0,
    cursor: [0, 0, 0, 0, 0],
    dir: "~",
    tier: 0,
    details: false,
    help: false,
    trash: [],
    auto: [],
    selected: [],
    dismissed: [],
    gone: [],
    freed: 0,
    log: [],
    deleted: [],
    menu: null,
    message: WELCOME,
    theme: "auto",
    autoTrash: true,
    day: 0,
    added: {},
    held: [],
    autoDel: { on: false, days: 7, risky: false, plugged: true, last: "never" },
    docker: DOCKER,
    schedule: false,
    pending: null,
  };
}

const DOCKER: DockerItem[] = [
  { kind: "build cache", name: "a8k2m1x0q9", size: g(2.64) },
  { kind: "dangling image", name: "sha256:3f1a9c2e7b10", size: g(1.21) },
  { kind: "dangling image", name: "sha256:9be04d51aa62", size: m(412.3) },
];
const DOCKER_KEPT = "Never touched: 3 volume(s) (1.80 GiB), 1 running container(s), and images in use.";

const PERIODS = [1, 7, 30, 180];
const periodName = (d: number) => (d === 1 ? "1 day" : d === 7 ? "7 days" : d === 30 ? "1 month" : "6 months");
const risky = (path: string) => FINDINGS.find((f) => f.path === path)?.category === "unused_clones";

function daysLeft(sim: Sim, path: string): number {
  return sim.autoDel.days - (sim.day - (sim.added[path] ?? sim.day));
}

function eligible(sim: Sim, path: string): boolean {
  return !sim.held.includes(path) && !guardOf(path) && (sim.autoDel.risky || !risky(path));
}

const dueItems = (sim: Sim) => sim.trash.filter((p) => eligible(sim, p) && daysLeft(sim, p) <= 0);

function nextLine(sim: Sim): string {
  const due = dueItems(sim);
  if (due.length) return `Next run takes ${due.length} item(s), ≈ ${bytes(due.reduce((n, p) => n + sizeOf(sim, p), 0))}.`;
  const waits = sim.trash.filter((p) => eligible(sim, p)).map((p) => daysLeft(sim, p));
  if (waits.length) return `Nothing is due yet; the next item is due in ${Math.min(...waits)} day(s).`;
  return "Nothing in OMG Trash is waiting for auto delete.";
}

function standing(sim: Sim, path: string): string {
  if (sim.held.includes(path)) return "kept";
  if (risky(path) && !sim.autoDel.risky) return "left";
  const left = daysLeft(sim, path);
  return left <= 0 ? "due" : `in ${left}`;
}

function standingTag(sim: Sim, path: string): string {
  const st = standing(sim, path);
  if (st === "kept") return "  · kept from auto delete";
  if (st === "left") return "  · left for you (needs the wider permission)";
  if (st === "due") return "  · auto delete: next run";
  return `  · auto delete ${st} day(s)`;
}

function standingText(sim: Sim, path: string): string {
  const st = standing(sim, path);
  if (st === "kept") return "kept: you chose to keep it out of auto delete";
  if (st === "left") return "left for you: a whole repository, application data or a toolchain, which needs --include-risky";
  if (st === "due") return "due: the next run deletes it, after checking it again";
  return `waiting: due ${st} day(s)`;
}

function autoRun(sim: Sim): [Sim, number, number] {
  const due = dueItems(sim);
  if (!due.length) return [sim, 0, 0];
  const items: Logged[] = due.map((p) => ({ path: p, size: sizeOf(sim, p), source: "auto" }));
  const total = items.reduce((n, i) => n + i.size, 0);
  const next = clampCursor({
    ...sim,
    gone: [...sim.gone, ...due],
    log: [...items, ...sim.log],
    deleted: [...items, ...sim.deleted],
    trash: sim.trash.filter((p) => !due.includes(p)),
    auto: sim.auto.filter((p) => !due.includes(p)),
    selected: sim.selected.filter((p) => !due.includes(p)),
    freed: sim.freed + total,
    autoDel: { ...sim.autoDel, last: `deleted ${items.length} item(s), ≈ ${bytes(total)}` },
  });
  return [next, items.length, total];
}

const autoMessage = (n: number, total: number) => `OMG auto-deleted ${n} item(s), about ${bytes(total)}.`;

function addToTrash(sim: Sim, paths: string[]): Pick<Sim, "trash" | "added"> {
  const added = { ...sim.added };
  for (const p of paths) added[p] = sim.day;
  return { trash: [...sim.trash, ...paths], added };
}

const s = (t: string, c?: string): Seg => ({ t, c });
const chars = (t: string) => [...t];
const width = (line: Line) => line.reduce((n, seg) => n + chars(seg.t).length, 0);
const pad = (text: string, n: number) => text + " ".repeat(Math.max(0, n - chars(text).length));
const lpad = (text: string, n: number) => " ".repeat(Math.max(0, n - chars(text).length)) + text;

function truncateMiddle(text: string, w: number): string {
  const c = chars(text);
  if (c.length <= w || w < 8) return c.slice(0, Math.max(0, w)).join("");
  const keep = w - 1;
  const head = Math.floor(keep / 3);
  const tail = keep - head;
  return c.slice(0, head).join("") + "…" + c.slice(c.length - tail).join("");
}

function count(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function shortCount(n: number): string {
  if (n <= 9_999) return count(n);
  if (n <= 999_999) return `${Math.round(n / 1e3)}K`;
  return `${(n / 1e6).toFixed(2)}M`;
}

function duration(secs: number): string {
  const v = Math.max(0, Math.floor(secs));
  if (v < 60) return `${v}s`;
  if (v < 3600) return `${Math.floor(v / 60)}m ${v % 60}s`;
  return `${Math.floor(v / 3600)}h ${Math.floor((v % 3600) / 60)}m`;
}

function bar(fraction: number, w: number): string {
  const parts = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉"];
  const cells = Math.round(Math.min(1, Math.max(0, fraction)) * w * 8);
  const full = Math.floor(cells / 8);
  const part = cells % 8;
  let out = "█".repeat(Math.min(full, w));
  if (full < w && part > 0) out += parts[part];
  return out + " ".repeat(Math.max(0, w - chars(out).length));
}

const alive = (sim: Sim, path: string) => !sim.gone.some((p) => path === p || path.startsWith(p + "/"));
function node(sim: Sim, path: string): Node | undefined {
  const n = TREE[path];
  if (!n || !alive(sim, path)) return undefined;
  const lost = sim.deleted.reduce((sum, d) => (d.path.startsWith(path + "/") ? sum + d.size : sum), 0);
  return { ...n, size: Math.max(0, n.size - lost) };
}
const children = (sim: Sim, dir: string) =>
  Object.keys(TREE)
    .filter((p) => p.startsWith(dir + "/") && !p.slice(dir.length + 1).includes("/") && alive(sim, p))
    .map((p) => ({ path: p, ...node(sim, p)! }))
    .sort((a, b) => b.size - a.size);
const findings = (sim: Sim) => FINDINGS.filter((f) => alive(sim, f.path));
const shownFindings = (sim: Sim) => findings(sim).filter((f) => sim.tier === 0 || f.tier === TIERS[sim.tier]);
const sizeOf = (sim: Sim, path: string) => node(sim, path)?.size ?? 0;
const guardOf = (path: string) => TREE[path]?.guard;
const nameOf = (path: string) => path.slice(path.lastIndexOf("/") + 1);

function suggest(sim: Sim): [Sim, number] {
  if (!sim.autoTrash) return [sim, 0];
  const add = findings(sim)
    .filter((f) => f.suggest && !sim.trash.includes(f.path) && !sim.dismissed.includes(f.path))
    .map((f) => f.path);
  return [{ ...sim, ...addToTrash(sim, add), auto: [...sim.auto, ...add] }, add.length];
}

function finishScan(sim: Sim): Sim {
  const [next, added] = suggest({ ...sim, scan: null, scanned: true });
  if (sim.scan?.inShell) {
    return {
      ...next,
      shell: [
        ...next.shell,
        ...json([
          ["id", "7"],
          ["state", '"complete"'],
          ["entries", String(ENTRIES)],
          ["errors", "0"],
          ["excluded", "312"],
          ["elapsed_ms", "14210"],
        ]),
        ...(added ? [[s(`omg: ${added} item(s) are suggested in OMG Trash (nothing deleted; review with \`omg\`)`, "dim")]] : []),
      ],
    };
  }
  const waiting = added ? ` ${added} cache folder(s) waiting in OMG Trash (press 4).` : "";
  return { ...next, message: `Scan complete: ${count(ENTRIES)} entries, 0 unreadable folders.${waiting}` };
}

export function tick(sim: Sim): Sim {
  if (!sim.scan) return sim;
  const done = sim.scan.done + SCAN_STEP;
  if (done >= TOTAL_FILES) return finishScan(sim);
  return { ...sim, scan: { ...sim.scan, done } };
}

export function finishNow(sim: Sim): Sim {
  return sim.scan ? finishScan(sim) : sim;
}

function startScan(sim: Sim, inShell: boolean): Sim {
  if (sim.scan) return { ...sim, message: "A scan is already running." };
  return { ...sim, scan: { done: 0, inShell }, message: "", menu: null, help: false };
}

function planDelete(sim: Sim, paths: string[]): Sim {
  if (!paths.length) return sim;
  const ok = paths.filter((p) => !guardOf(p));
  const denied = paths.filter((p) => guardOf(p));
  const total = ok.reduce((n, p) => n + sizeOf(sim, p), 0);
  const body: [string, string?][] = [];
  if (ok.length) {
    body.push([`${ok.length} item(s) · ≈ ${bytes(total)} · this cannot be undone`, "danger"]);
    ok.slice(0, 6).forEach((p) => body.push([`  ${p}  (${bytes(sizeOf(sim, p))})`]));
    if (ok.length > 6) body.push([`  … and ${ok.length - 6} more`]);
  } else {
    body.push(["nothing here can be deleted", "warn"]);
  }
  denied.slice(0, 4).forEach((p) => body.push([`skipped ${p}: protected (${guardOf(p)})`, "warn"]));
  const choices: Choice[] = [{ label: "Cancel", act: "cancel" }];
  if (ok.length) choices.push({ label: "Yes, delete permanently", tone: "danger", act: "delete" });
  return { ...sim, menu: { title: "Are you sure?", tone: "danger", body, choices, cursor: 0, paths: ok } };
}

function remove(sim: Sim, paths: string[]): Sim {
  const items = paths.map((p) => ({ path: p, size: sizeOf(sim, p) }));
  const total = items.reduce((n, i) => n + i.size, 0);
  return clampCursor({
    ...sim,
    menu: null,
    details: false,
    gone: [...sim.gone, ...paths],
    log: [...items, ...sim.log],
    deleted: [...items, ...sim.deleted],
    trash: sim.trash.filter((p) => !paths.includes(p)),
    selected: [],
    freed: sim.freed + total,
    message: `Deleted ${items.length} item(s), ≈ ${bytes(total)}`,
  });
}

function ask(sim: Sim, title: string, body: string, yes: string, act: string): Sim {
  const choices: Choice[] = [
    { label: "Cancel", act: "dismiss" },
    { label: yes, tone: "danger", act },
  ];
  return { ...sim, menu: { title, tone: "warn", body: [[body]], choices, cursor: 0 } };
}

function askUnmarkAll(sim: Sim): Sim {
  if (!sim.trash.length) return sim;
  return ask(
    sim,
    "Remove everything from OMG Trash?",
    `${sim.trash.length} item(s) leave the list. Nothing is deleted from disk.`,
    "Yes, remove all from the list",
    "unmark-all",
  );
}

function unmarkAll(sim: Sim): Sim {
  const n = sim.trash.length;
  return clampCursor({
    ...sim,
    trash: [],
    auto: [],
    selected: [],
    held: [],
    dismissed: [...sim.dismissed, ...sim.trash],
    message: `Removed ${n} item(s) from OMG Trash. Nothing changed on disk.`,
  });
}

function forget(sim: Sim): Sim {
  const i = sim.cursor[4];
  if (!sim.log[i]) return sim;
  return clampCursor({
    ...sim,
    log: sim.log.filter((_, j) => j !== i),
    message: "Removed the line from the deleted log.",
  });
}

function askClearLog(sim: Sim): Sim {
  if (!sim.log.length) return sim;
  return ask(
    sim,
    "Clear the deleted log?",
    `${sim.log.length} line(s) are removed from the record. Nothing changes on disk.`,
    "Yes, clear the log",
    "clear-log",
  );
}

function listLength(sim: Sim, tab = sim.tab): number {
  if (!sim.scanned) return 0;
  if (tab === 1) return children(sim, sim.dir).length;
  if (tab === 2) return shownFindings(sim).length;
  if (tab === 3) return sim.trash.length;
  if (tab === 4) return sim.log.length;
  return 0;
}

function clampCursor(sim: Sim): Sim {
  return { ...sim, cursor: sim.cursor.map((c, tab) => Math.max(0, Math.min(c, listLength(sim, tab) - 1))) };
}

function current(sim: Sim): string | undefined {
  const i = sim.cursor[sim.tab];
  if (sim.tab === 1) return children(sim, sim.dir)[i]?.path;
  if (sim.tab === 2) return shownFindings(sim)[i]?.path;
  if (sim.tab === 3) return sim.trash[i];
  return undefined;
}

function toggleTrash(sim: Sim, path: string | undefined): Sim {
  if (!path) return sim;
  if (sim.trash.includes(path)) {
    return {
      ...sim,
      trash: sim.trash.filter((p) => p !== path),
      auto: sim.auto.filter((p) => p !== path),
      selected: sim.selected.filter((p) => p !== path),
      held: sim.held.filter((p) => p !== path),
      dismissed: [...sim.dismissed, path],
      message: "Removed from OMG Trash.",
    };
  }
  if (guardOf(path)) return { ...sim, message: `⚠ ${path} is protected: ${guardOf(path)}` };
  return { ...sim, ...addToTrash(sim, [path]), message: "Added to OMG Trash. Nothing changed on disk." };
}

function toggleHold(sim: Sim, path: string | undefined): Sim {
  if (!path) return sim;
  if (!sim.autoDel.on) return { ...sim, message: "Auto delete is off. Set it up in the menu (m)." };
  if (sim.held.includes(path))
    return { ...sim, held: sim.held.filter((p) => p !== path), message: "Auto delete may take this item again once it is due." };
  return { ...sim, held: [...sim.held, path], message: "Kept: auto delete will not take this item. It stays in OMG Trash." };
}

function autoMenu(sim: Sim): Sim {
  const a = sim.autoDel;
  if (!a.on) {
    const choices: Choice[] = [
      { label: "Cancel", act: "dismiss" },
      ...PERIODS.map((d) => ({ label: `Delete what has been in OMG Trash for ${periodName(d)}…`, act: `auto-ask:${d}:0` })),
    ];
    const body: [string, string?][] = [
      ["OMG can delete what waits in OMG Trash for you, in the background, after the period you choose. It asks your permission first."],
      ["Items that changed since you added them wait again, and you can keep any item out or turn it all off at any time."],
    ];
    return { ...sim, menu: { title: "Auto delete", tone: "brand", body, choices, cursor: 0 } };
  }
  const choices: Choice[] = [
    { label: "Close", act: "dismiss" },
    { label: "Turn auto delete off now", tone: "danger", act: "auto-off" },
    ...PERIODS.filter((d) => d !== a.days).map((d) => ({ label: `Change the period to ${periodName(d)}`, act: `auto-period:${d}` })),
    {
      label: a.plugged ? "Only while plugged in: ON (also run on battery)" : "Only while plugged in: OFF (wait for power)",
      act: "auto-plugged",
    },
    a.risky
      ? { label: "Repositories, app data and toolchains: INCLUDED (leave them for me)", act: "auto-narrow" }
      : { label: "Repositories, app data and toolchains: LEFT FOR YOU (include them…)", tone: "warn", act: `auto-ask:${a.days}:1` },
  ];
  const body: [string, string?][] = [
    [`On: items are deleted once they have been in OMG Trash for ${periodName(a.days)}, unchanged.`],
    [nextLine(sim)],
    [`Last run: ${a.last}`],
  ];
  return { ...sim, menu: { title: "Auto delete", tone: "brand", body, choices, cursor: 0 } };
}

function autoAsk(sim: Sim, days: number, wide: boolean): Sim {
  const plugged = sim.autoDel.on ? sim.autoDel.plugged : true;
  const body: [string, string?][] = [
    [`OMG will permanently delete items that have been in OMG Trash for ${periodName(days)}, in the background, without asking each time.`, "danger"],
    ["Only items that have not changed since they were added. An item that changed waits again."],
    ["Every item is checked again right before it is deleted. Protected items are never deleted."],
    [wide ? "Whole repositories, application data and toolchains are included." : "Whole repositories, application data and toolchains are left for you."],
    [plugged ? "It runs only while the computer is plugged in." : "It runs on battery power too."],
    ["You get a notification after every run that deletes something. Press K in OMG Trash to keep an item out, and turn it off any time from this menu."],
    ["Deleted items do not go to the system Trash and cannot be restored.", "danger"],
  ];
  const choices: Choice[] = [
    { label: "Cancel", act: "dismiss" },
    { label: "Yes, I give permission", tone: "danger", act: `auto-grant:${days}:${wide ? 1 : 0}` },
  ];
  return { ...sim, menu: { title: "Allow auto delete?", tone: "danger", body, choices, cursor: 0 } };
}

function grant(sim: Sim, days: number, wide: boolean, plugged: boolean): Sim {
  return { ...sim, autoDel: { ...sim.autoDel, on: true, days, risky: wide, plugged } };
}

function revoke(sim: Sim): Sim {
  return { ...sim, autoDel: { ...sim.autoDel, on: false, risky: false } };
}

function dockerPlan(sim: Sim): Sim {
  if (!sim.docker.length) return { ...sim, message: `Docker: no dangling images or unused build cache to remove. ${DOCKER_KEPT}` };
  const total = sim.docker.reduce((n, d) => n + d.size, 0);
  const body: [string, string?][] = [
    [`${sim.docker.length} item(s) · ≈ ${bytes(total)} · removed by Docker itself, no undo`, "danger"],
    ...sim.docker.map((d): [string] => [`  ${d.kind}  ${d.name}  (${bytes(d.size)})`]),
    [DOCKER_KEPT],
    ["Docker's disk on this machine may take a while to shrink after this.", "warn"],
  ];
  const choices: Choice[] = [
    { label: "Cancel", act: "dismiss" },
    { label: "Yes, remove through Docker", tone: "danger", act: "docker-yes" },
  ];
  return { ...sim, menu: { title: "Remove unused Docker data?", tone: "danger", body, choices, cursor: 0 } };
}

function dockerRemove(sim: Sim): [Sim, number, number] {
  const items: Logged[] = sim.docker.map((d) => ({ path: `${d.kind} ${d.name}`, size: d.size, source: "docker" }));
  const total = items.reduce((n, i) => n + i.size, 0);
  return [{ ...sim, docker: [], log: [...items, ...sim.log], freed: sim.freed + total }, items.length, total];
}

function optionsMenu(sim: Sim): Sim {
  const choices: Choice[] = [];
  const path = current(sim);
  if (path) {
    choices.push({ label: "Add to / remove from OMG Trash (saves the path only)", key: " ", act: "toggle" });
    choices.push({ label: "Delete permanently…", key: "d", act: "delete-one", tone: "danger" });
  }
  if (sim.tab === 2 && path) {
    choices.push({ label: "Dry-run preview", key: "p", act: "preview" });
    choices.push({ label: "Show in file manager", key: "o", act: "open" });
  }
  if (sim.tab === 3 && sim.trash.length) {
    choices.push({ label: "Delete selected permanently…", key: "d", act: "delete-selected", tone: "danger" });
    choices.push({ label: "Empty OMG Trash permanently…", key: "D", act: "empty", tone: "danger" });
    if (sim.autoDel.on && path)
      choices.push({
        label: sim.held.includes(path) ? "Let auto delete take this item again" : "Keep this item from auto delete",
        key: "K",
        act: "hold",
      });
    choices.push({ label: "Remove from OMG Trash", key: "u", act: "unmark" });
    choices.push({ label: "Remove everything from OMG Trash…", key: "U", act: "unmark-all-ask" });
  }
  if (sim.tab === 4 && sim.log.length) {
    choices.push({ label: "Remove this line from the log", key: "u", act: "forget" });
    choices.push({ label: "Clear the deleted log…", key: "U", act: "clear-log-ask" });
  }
  choices.push({ label: "Clean unused Docker data…", act: "docker" });
  choices.push({ label: "Scan now", key: "r", act: "scan" });
  choices.push({
    label: sim.autoTrash
      ? "Auto-add caches to OMG Trash on scan: ON (turn off)"
      : "Auto-add caches to OMG Trash on scan: OFF (turn on)",
    act: "auto-trash",
  });
  choices.push({
    label: sim.autoDel.on
      ? `Auto delete: ON, after ${periodName(sim.autoDel.days)} in OMG Trash (change or turn off…)`
      : "Auto delete: OFF (set up…)",
    act: "auto-menu",
  });
  choices.push({ label: `Theme: ${sim.theme} (change to ${nextTheme(sim.theme)})`, act: "theme" });
  choices.push({ label: "Full rescan", key: "R", act: "scan" });
  TAB_NAMES.forEach((name, i) => {
    if (i !== sim.tab) choices.push({ label: `Go to ${name}`, act: `go:${i}` });
  });
  choices.push({ label: "Keyboard shortcuts", key: "?", act: "help" });
  choices.push({ label: "Quit", key: "q", act: "quit" });
  return { ...sim, menu: { title: "Options", tone: "brand", body: [], choices, cursor: 0 } };
}

function choose(sim: Sim, c: Choice): Sim {
  const menu = sim.menu!;
  const closed = { ...sim, menu: null };
  const path = current(sim);
  const [act, a1, a2] = c.act.split(":");
  if (act === "go") return { ...closed, tab: Number(a1), details: false };
  if (act === "auto-ask") return autoAsk(closed, Number(a1), a2 === "1");
  if (act === "auto-grant") {
    const plugged = sim.autoDel.on ? sim.autoDel.plugged : true;
    const next = grant(closed, Number(a1), a2 === "1", plugged);
    const message = sim.autoDel.on
      ? "Auto delete settings saved."
      : `Auto delete is on: items in OMG Trash for ${periodName(Number(a1))} are deleted in the background.`;
    return { ...next, message };
  }
  if (act === "auto-period")
    return { ...closed, autoDel: { ...sim.autoDel, days: Number(a1) }, message: "Auto delete settings saved." };
  switch (c.act) {
    case "auto-menu":
      return autoMenu(closed);
    case "auto-off":
      return { ...revoke(closed), message: "Auto delete is off. Nothing will be deleted automatically." };
    case "auto-plugged":
      return { ...closed, autoDel: { ...sim.autoDel, plugged: !sim.autoDel.plugged }, message: "Auto delete settings saved." };
    case "auto-narrow":
      return { ...closed, autoDel: { ...sim.autoDel, risky: false }, message: "Auto delete settings saved." };
    case "hold":
      return toggleHold(closed, path);
    case "docker-yes": {
      const [next, n, total] = dockerRemove(closed);
      return { ...next, message: `Docker removed ${n} item(s), ≈ ${bytes(total)}` };
    }
    case "cancel":
      return { ...closed, message: "Cancelled. Nothing was deleted." };
    case "dismiss":
      return closed;
    case "unmark-all-ask":
      return askUnmarkAll(closed);
    case "unmark-all":
      return unmarkAll(closed);
    case "forget":
      return forget(closed);
    case "clear-log-ask":
      return askClearLog(closed);
    case "clear-log":
      return clampCursor({ ...closed, log: [], message: "Cleared the deleted log. Nothing changed on disk." });
    case "delete":
      return remove(sim, menu.paths ?? []);
    case "delete-one":
      return planDelete(closed, path ? [path] : []);
    case "delete-selected":
      return planDelete(closed, closed.selected.length ? [...closed.selected] : path ? [path] : []);
    case "empty":
      return planDelete(closed, [...closed.trash]);
    case "unmark":
      return clampCursor(toggleTrash(closed, path));
    case "preview":
      return path ? { ...closed, message: `Dry-run preview: ${path} · ${bytes(sizeOf(sim, path))} · nothing will change` } : closed;
    case "open":
      return { ...closed, message: "The real app opens this folder in your file manager. The demo has no files to show." };
    case "docker":
      return dockerPlan(closed);
    case "scan":
      return startScan(closed, false);
    case "auto-trash": {
      const on = !sim.autoTrash;
      return {
        ...closed,
        autoTrash: on,
        message: on
          ? "Scans will add cache folders to OMG Trash (nothing is deleted without asking)."
          : "Scans will no longer add anything to OMG Trash.",
      };
    }
    case "theme": {
      const theme = nextTheme(sim.theme);
      return { ...closed, theme, message: `Theme set to ${theme}.` };
    }
    case "help":
      return { ...closed, help: true };
    case "toggle":
      return toggleTrash(closed, path);
    case "quit":
      return quit(sim);
  }
  return closed;
}

export function key(sim: Sim, k: string): Sim {
  if (sim.screen !== "tui") return sim;
  const menu = sim.menu;
  if (menu) {
    const n = menu.choices.length;
    if (k === "ArrowDown" || k === "j") return { ...sim, menu: { ...menu, cursor: Math.min(n - 1, menu.cursor + 1) } };
    if (k === "ArrowUp" || k === "k") return { ...sim, menu: { ...menu, cursor: Math.max(0, menu.cursor - 1) } };
    if (k === "Escape" || k === "q") return menu.paths ? choose(sim, menu.choices[0]) : { ...sim, menu: null };
    if (k === "Enter") return choose(sim, menu.choices[menu.cursor]);
    if (/^[1-9]$/.test(k) && Number(k) <= n) return choose(sim, menu.choices[Number(k) - 1]);
    return sim;
  }
  if (sim.help) return { ...sim, help: false };
  if (sim.scan && k === "Escape") return { ...sim, scan: null, message: "Stopping the scan… the previous index stays valid." };
  if (/^[1-5]$/.test(k)) return { ...sim, tab: Number(k) - 1, details: false };
  if (k === "Tab") return { ...sim, tab: (sim.tab + 1) % 5, details: false };
  if (k === "q") return quit(sim);
  if (k === "?") return { ...sim, help: true };
  if (k === "m") return optionsMenu(sim);
  if (k === "r" || k === "R") return startScan(sim, false);
  if (!sim.scanned) return sim;

  const n = listLength(sim);
  const move = (d: number) => {
    const cursor = [...sim.cursor];
    cursor[sim.tab] = Math.max(0, Math.min(n - 1, cursor[sim.tab] + d));
    return { ...sim, cursor, details: false };
  };
  if (k === "ArrowDown" || k === "j") return move(1);
  if (k === "ArrowUp" || k === "k") return move(-1);
  if (k === "PageDown") return move(10);
  if (k === "PageUp") return move(-10);

  const path = current(sim);
  if (sim.tab === 1) {
    if ((k === "Enter" || k === "ArrowRight") && path && children(sim, path).length) {
      const cursor = [...sim.cursor];
      cursor[1] = 0;
      return { ...sim, dir: path, cursor };
    }
    if ((k === "Backspace" || k === "ArrowLeft") && sim.dir !== "~") {
      const up = sim.dir.slice(0, sim.dir.lastIndexOf("/"));
      const cursor = [...sim.cursor];
      cursor[1] = Math.max(0, children(sim, up).findIndex((c) => c.path === sim.dir));
      return { ...sim, dir: up, cursor };
    }
  }
  if (sim.tab === 2) {
    if (k === "t") return clampCursor({ ...sim, tier: (sim.tier + 1) % TIERS.length, details: false });
    if ((k === "Enter" || k === "ArrowRight") && path) return { ...sim, details: !sim.details };
    if ((k === "Escape" || k === "Backspace" || k === "ArrowLeft") && sim.details) return { ...sim, details: false };
    if (k === "p" && path) return { ...sim, message: `Dry-run preview: ${path} · ${bytes(sizeOf(sim, path))} · nothing will change` };
  }
  if (k === " " && (sim.tab === 1 || sim.tab === 2)) return toggleTrash(sim, path);
  if (sim.tab === 3) {
    if (k === " " && path) {
      const selected = sim.selected.includes(path) ? sim.selected.filter((p) => p !== path) : [...sim.selected, path];
      return { ...sim, selected };
    }
    if (k === "u" && path) return clampCursor(toggleTrash(sim, path));
    if (k === "K") return toggleHold(sim, path);
    if (k === "U") return askUnmarkAll(sim);
    if (k === "D") return planDelete(sim, [...sim.trash]);
    if (k === "d") return planDelete(sim, sim.selected.length ? [...sim.selected] : path ? [path] : []);
  }
  if (sim.tab === 4) {
    if (k === "u") return forget(sim);
    if (k === "U") return askClearLog(sim);
  }
  if (k === "d" && (sim.tab === 1 || sim.tab === 2) && path) return planDelete(sim, [path]);
  return sim;
}

function quit(sim: Sim): Sim {
  return { ...sim, screen: "shell", menu: null, help: false, scan: null };
}

const json = (pairs: [string, string][]): Line[] => [
  [s("{")],
  ...pairs.map(([k, v], i) => [
    s(`  "${k}"`, "brand"),
    s(": "),
    s(v, v.startsWith('"') ? "good" : undefined),
    s(i < pairs.length - 1 ? "," : ""),
  ]),
  [s("}")],
];

const UNEXPLAINED = ["~/Library/Application Support", "~/Movies", "~/Documents", "~/Library/Caches", "~/code/website", "~/Downloads"];
const CLEAN_CATEGORIES = ["package_caches", "build_artifacts", "logs_and_temp", "old_tool_versions"];

export function run(sim: Sim, input: string): Sim {
  const cmd = input.trim().replace(/\s+/g, " ");
  const echo: Line = [s("$ ", "good"), s(input)];
  const out = (lines: Line[]): Sim => ({ ...sim, shell: [...sim.shell, echo, ...lines] });
  const dim = (t: string): Line => [s(t, "dim")];
  if (sim.pending) {
    const p = sim.pending;
    const last = sim.shell[sim.shell.length - 1] ?? [];
    const shell = [...sim.shell.slice(0, -1), [...last, s(input)]];
    if (cmd !== "yes") return { ...sim, pending: null, shell: [...shell, [s("omg: auto delete stays off")]] };
    const next = grant({ ...sim, pending: null }, p.every, p.risky, !p.battery);
    return {
      ...next,
      shell: [...shell, [s(`omg: auto delete is on. Items in OMG Trash for ${p.every} day(s) are deleted in the background.`)]],
    };
  }
  if (!cmd) return { ...sim, shell: [...sim.shell, echo] };
  if (cmd === "clear") return { ...sim, shell: [] };
  if (cmd === "omg" || cmd === "omg tui") return { ...sim, shell: [...sim.shell, echo], screen: "tui" };
  if (cmd === "help" || cmd === "omg help" || cmd === "omg --help")
    return out([
      dim("A pretend terminal with sample data. Try:"),
      [s("  omg", "brand"), s("               the interface (r scan, 1-5 views, q quit)", "dim")],
      [s("  omg scan", "brand"), s("          index the sample home folder", "dim")],
      [s("  omg status", "brand"), s("        totals and freed so far", "dim")],
      [s("  omg findings", "brand"), s("      what can be cleaned and why", "dim")],
      [s("  omg grew", "brand"), s("          what grew since the scan before", "dim")],
      [s("  omg unexplained", "brand"), s("   the biggest folders no finding explains", "dim")],
      [s("  omg tree ~/code", "brand"), s("    folder totals, biggest first", "dim")],
      [s("  omg trash", "brand"), s("         what waits in OMG Trash", "dim")],
      [s("  omg clean --category package_caches", "brand")],
      [s("  omg auto-delete on", "brand"), s("  delete what waited in OMG Trash (asks first)", "dim")],
      [s("  omg auto-delete status --items", "brand")],
      [s("  wait 7d", "brand"), s("           let 7 days pass (demo only)", "dim")],
      [s("  omg docker clean", "brand"), s("  unused Docker data, removed by Docker", "dim")],
      [s("  omg schedule enable", "brand"), s("  a daily scan that never deletes", "dim")],
      [s("  omg history", "brand"), s("  ·  ", "dim"), s("omg trends", "brand"), s("  ·  ", "dim"), s("omg catalog status", "brand"), s("  ·  ", "dim"), s("omg prune", "brand")],
      [s("  omg theme light", "brand"), s("   colours: auto, dark or light", "dim")],
      [s("  omg doctor", "brand"), s("  ·  ", "dim"), s("ls", "brand"), s("  ·  ", "dim"), s("clear", "brand")],
    ]);
  if (cmd === "omg theme") return out([[s(sim.theme)]]);
  if (cmd.startsWith("omg theme ")) {
    const name = cmd.slice(10) as Theme;
    if (!THEMES.includes(name))
      return out([[s(`error: invalid value '${name}' for '[NAME]'`, "danger")], dim("  [possible values: auto, dark, light]")]);
    return { ...out([[s(name)]]), theme: name };
  }
  if (cmd === "omg --version" || cmd === "omg -V") return out([[s(`omg ${VERSION}`)]]);
  if (cmd === "ls" || cmd === "ls ~") return out([[s(children(sim, "~").map((c) => nameOf(c.path)).join("  "))]]);
  if (cmd.startsWith("omg scan")) return startScan(out([]), true);
  const needScan = () => out([[s("omg: nothing is indexed yet; run ", "warn"), s("omg scan", "brand"), s(" first", "warn")]]);
  if (cmd === "omg status") {
    if (!sim.scanned) return needScan();
    return out(
      json([
        ["state", '"complete"'],
        ["entries", String(ENTRIES)],
        ["indexed_bytes", String(sizeOf(sim, "~"))],
        ["omg_trash_items", String(sim.trash.length)],
        ["freed_total_bytes", String(sim.freed)],
        ["index_bytes", String(m(148.3))],
      ]),
    );
  }
  if (cmd === "omg findings") {
    if (!sim.scanned) return needScan();
    return out([
      dim("tier        estimate   category          path"),
      ...findings(sim).map((f) => [
        s(pad(f.tier, 10), tierTone(f.tier)),
        s(lpad(bytes(f.size), 10)),
        s("  " + pad(f.category, 18), "dim"),
        s(f.path),
      ]),
      dim("(the real command prints JSON; shortened here)"),
    ]);
  }
  if (cmd === "omg grew") {
    if (!sim.scanned) return needScan();
    return out([
      dim("since the scan before:"),
      [s("  +2.31 GiB    ", "warn"), s("~/Library/Developer/Xcode/DerivedData")],
      [s("  +640.12 MiB  ", "warn"), s("~/.npm/_cacache")],
      [s("  +212.40 MiB  ", "warn"), s("~/code/game/target")],
    ]);
  }
  if (cmd === "omg unexplained") {
    if (!sim.scanned) return needScan();
    const rows = UNEXPLAINED.filter((p) => alive(sim, p))
      .map((p) => {
        const size = sizeOf(sim, p);
        const covered = findings(sim).reduce((n, f) => (f.path.startsWith(p + "/") ? n + sizeOf(sim, f.path) : n), 0);
        return { p, size, left: Math.max(0, size - covered) };
      })
      .filter((r) => r.left >= 256 * MiB)
      .sort((a, b) => b.left - a.left);
    return out([
      dim("allocated   unexplained   path"),
      ...rows.map((r) => [s(lpad(bytes(r.size), 10)), s(lpad(bytes(r.left), 14), "warn"), s("   " + r.p)]),
      dim("(the real command prints JSON; shortened here)"),
    ]);
  }
  if (cmd === "omg doctor")
    return out([
      [s("✓ ", "good"), s("state folder is private (0700)")],
      [s("✓ ", "good"), s("index schema 15 is supported")],
      [s("✓ ", "good"), s("catalog: bundled")],
      [s(sim.scanned ? "✓ " : "· ", sim.scanned ? "good" : "dim"), s(sim.scanned ? "last scan complete" : "no scan yet")],
      [
        s(sim.autoDel.on ? "✓ " : "· ", sim.autoDel.on ? "good" : "dim"),
        s(sim.autoDel.on ? `auto delete: on, after ${periodName(sim.autoDel.days)}; job registered` : "auto delete: off"),
      ],
      [s(sim.schedule ? "✓ " : "· ", sim.schedule ? "good" : "dim"), s(sim.schedule ? "daily scan: registered" : "daily scan: not registered")],
      dim("read-only: doctor never changes anything"),
    ]);
  const clean = cmd.match(/^omg clean --category (\S+)(?: --older-than (\d+)d?)?(?: --confirm (\S+))?$/);
  if (clean) {
    if (!sim.scanned) return needScan();
    const [, category, older, confirm] = clean;
    if (!CLEAN_CATEGORIES.includes(category))
      return out([[s(`omg: unknown category ${category}; try ${CLEAN_CATEGORIES.join(", ")}`, "warn")]]);
    const age = (f: Finding) => (f.changed.endsWith("d ago") ? parseInt(f.changed, 10) : 0);
    const picked = findings(sim).filter(
      (f) => f.category === category && f.tier === "review" && !guardOf(f.path) && (!older || age(f) >= Number(older)),
    );
    if (!picked.length) return out([dim(older ? `nothing in ${category} older than ${older} days` : `nothing in ${category}`)]);
    const fp = (category.length * 2654435761 + picked.length * 97 + sim.gone.length).toString(16).slice(-6).padStart(6, "0");
    const total = picked.reduce((n, f) => n + sizeOf(sim, f.path), 0);
    if (confirm) {
      if (confirm !== fp) return out([[s("omg: the selection changed since it was listed; nothing was deleted", "danger")]]);
      const next = remove(out([]), picked.map((f) => f.path));
      return { ...next, message: "", shell: [...next.shell, [s("✓ ", "good"), s(`deleted ${picked.length} item(s), ≈ ${bytes(total)}`)]] };
    }
    return out([
      ...picked.map((f) => [s(lpad(bytes(sizeOf(sim, f.path)), 11)), s("  " + f.path)]),
      [s(`${picked.length} item(s) · ≈ ${bytes(total)} · nothing deleted yet`, "dim")],
      [s("to delete exactly this: ", "dim"), s(`omg clean --category ${category}${older ? ` --older-than ${older}d` : ""} --confirm ${fp}`, "brand")],
    ]);
  }
  const shortened = dim("(the real command prints JSON; shortened here)");
  const waitFor = cmd.match(/^(?:wait|sleep) (\d+)(d|h)?$/);
  if (waitFor) {
    const days = waitFor[2] === "h" ? Math.floor(Number(waitFor[1]) / 24) : Number(waitFor[1]);
    if (days < 1) return out([dim("less than a day passes; nothing new is due")]);
    let next: Sim = { ...out([dim(`${days} day(s) pass…`)]), day: sim.day + days };
    if (!next.autoDel.on) return next;
    const [ran, n, total] = autoRun(next);
    next = ran;
    if (!n) return { ...next, shell: [...next.shell, dim("the auto delete job ran: nothing is due")] };
    return {
      ...next,
      message: autoMessage(n, total),
      shell: [...next.shell, [s("notification: ", "dim"), s(autoMessage(n, total), "warn")]],
    };
  }
  const auto = cmd.match(/^omg auto-delete(?: (\S+))?(.*)$/);
  if (auto) {
    const [, sub = "status", rest] = auto;
    const flags = rest.trim();
    if (sub === "status" && flags === "--items") {
      if (!sim.trash.length) return out([[s("[]")]]);
      return out([
        dim("size        path                                   explanation"),
        ...sim.trash.map((p) => [
          s(lpad(bytes(sizeOf(sim, p)), 10)),
          s("  " + pad(truncateMiddle(p, 36), 37)),
          s(" " + standingText(sim, p), "dim"),
        ]),
        shortened,
      ]);
    }
    if (sub === "status") {
      const due = dueItems(sim);
      const a = sim.autoDel;
      return out([
        ...json([
          ["enabled", String(a.on)],
          ["period_days", String(a.days)],
          ["include_risky", String(a.risky)],
          ["plugged_in_only", String(a.plugged)],
          ["due_items", String(a.on ? due.length : 0)],
          ["due_bytes", String(a.on ? due.reduce((n, p) => n + sizeOf(sim, p), 0) : 0)],
          ["kept", String(sim.held.filter((p) => sim.trash.includes(p)).length)],
          ["job", a.on ? '"registered: launchd agent dev.omg.auto-delete"' : '"not registered"'],
        ]),
        shortened,
      ]);
    }
    if (sub === "on") {
      const every = flags.match(/--every (\S+)/)?.[1] ?? "7";
      const days = Number(every.replace(/d$/, ""));
      if (!PERIODS.includes(days))
        return out([[s(`error: invalid value '${every}' for '--every <DAYS>': choose 1, 7, 30 or 180 days`, "danger")]]);
      const wide = flags.includes("--include-risky");
      const battery = flags.includes("--allow-battery");
      return {
        ...out([
          [s(`Auto delete permanently deletes items that have been in OMG Trash for ${days} day(s), in the background, without asking each time.`)],
          [s("- Only items that have not changed since they were added; changed items wait again.")],
          [s("- Every item is checked again just before deletion; protected items are never deleted.")],
          [s(`- ${wide ? "Whole repositories, application data and toolchains are included." : "Whole repositories, application data and toolchains are left for you."}`)],
          [s(`- ${battery ? "Runs on battery power too." : "Runs only while the computer is plugged in."}`)],
          [s("- You get a notification after each run that deletes something. Turn it off any time with `omg auto-delete off`.")],
          [s("Deleted items do not go to the system Trash and cannot be restored.", "danger")],
          [s("Type yes to give permission: ", "warn")],
        ]),
        pending: { every: days, risky: wide, battery },
      };
    }
    if (sub === "off") return { ...revoke(out([[s("omg: auto delete is off")]])) };
    if (sub === "run") {
      const idle = (reason: string) => out([[s(`{"ran":false,"reason":"${reason}"}`)]]);
      if (!sim.autoDel.on) return idle("auto delete is off");
      if (!sim.scanned) return needScan();
      const [next, n, total] = autoRun(out([]));
      if (!n) return idle("nothing is due");
      return {
        ...next,
        message: autoMessage(n, total),
        shell: [
          ...next.shell,
          ...json([
            ["ran", "true"],
            ["deleted", String(n)],
            ["bytes", String(total)],
            ["skipped", "0"],
            ["stopped", "false"],
          ]),
          [s("notification: ", "dim"), s(autoMessage(n, total), "warn")],
        ],
      };
    }
    return out([[s(`error: unrecognized subcommand '${sub}'`, "danger")], dim("  [possible: status, on, off, run]")]);
  }
  const sched = cmd.match(/^omg schedule(?: (\S+))?(?: --hour (\d+))?$/);
  if (sched) {
    const [, sub = "status", hour = "12"] = sched;
    if (sub === "enable")
      return {
        ...out([
          [
            s(
              `omg: a scan runs every day at ${hour.padStart(2, "0")}:00 while you are signed in; it never deletes anything. Remove it with \`omg schedule disable\``,
            ),
          ],
        ]),
        schedule: true,
      };
    if (sub === "disable")
      return { ...out([[s(sim.schedule ? "omg: daily scan removed" : "omg: no daily scan was registered")]]), schedule: false };
    return out(
      json([
        ["registered", String(sim.schedule)],
        ["detail", sim.schedule ? '"launchd agent in ~/Library/LaunchAgents"' : '"no daily scan is registered"'],
        ["executable_missing", "false"],
      ]),
    );
  }
  const docker = cmd.match(/^omg docker( clean)?(?: --confirm (\S+))?$/);
  if (docker) {
    const total = sim.docker.reduce((n, d) => n + d.size, 0);
    const fp = (sim.docker.length * 2654435761 + 4242).toString(16).slice(-6);
    if (!docker[1])
      return out([
        ...json([
          ["endpoint", '"unix:///Users/you/.colima/default/docker.sock"'],
          ["safe_to_remove_bytes", String(total)],
          ["safe_to_remove", `"${bytes(total)}"`],
          ["volumes_never_touched", "3"],
          ["running_containers", "1"],
        ]),
        dim("omg: nothing removed; review with `omg docker clean`"),
      ]);
    if (!sim.docker.length) return out([dim("omg: nothing unused to remove")]);
    if (docker[2]) {
      if (docker[2] !== fp)
        return out([
          [s("omg: Docker changed since that plan was printed, or the fingerprint is wrong; run `omg docker clean` again to review", "danger")],
        ]);
      const [next, n, removed] = dockerRemove(out([]));
      return { ...next, shell: [...next.shell, dim(`omg: Docker removed ${n} item(s), about ${bytes(removed)}; 0 kept`)] };
    }
    return out([
      ...sim.docker.map((d) => [s(lpad(bytes(d.size), 11)), s(`  ${pad(d.kind, 16)}`, "dim"), s(d.name)]),
      dim(DOCKER_KEPT),
      [
        s(`omg: nothing removed yet. To remove exactly these ${sim.docker.length} item(s) (${bytes(total)}), run the same command with `, "dim"),
        s(`--confirm ${fp}`, "brand"),
      ],
    ]);
  }
  const trash = cmd.match(/^omg trash(?: (--add|--remove) (\S+))?$/);
  if (trash) {
    if (!sim.scanned) return needScan();
    let next = sim;
    const [, flag, raw] = trash;
    if (flag) {
      const p = raw.replace(/\/$/, "");
      if (!TREE[p] || !alive(sim, p)) return out([[s(`omg: ${p}: not in the index`, "danger")]]);
      if (flag === "--add") {
        if (guardOf(p)) return out([[s(`omg: ${p} is protected: ${guardOf(p)}`, "danger")]]);
        if (!sim.trash.includes(p)) next = { ...sim, ...addToTrash(sim, [p]) };
      } else {
        if (!sim.trash.includes(p)) return out([[s(`omg: ${p} is not in OMG Trash`, "danger")]]);
        next = toggleTrash(sim, p);
      }
    }
    const lines: Line[] = next.trash.length
      ? [
          dim("id  size        source     path"),
          ...next.trash.map((p, i) => [
            s(pad(String(i + 1), 4)),
            s(lpad(bytes(sizeOf(next, p)), 10)),
            s("  " + pad(next.auto.includes(p) ? "auto" : "user", 9), "dim"),
            s("  " + p),
          ]),
          shortened,
        ]
      : [[s("[]")]];
    return { ...next, message: sim.message, shell: [...sim.shell, echo, ...lines] };
  }
  const tree = cmd.match(/^omg tree(?: (\S+))?$/);
  if (tree) {
    if (!sim.scanned) return needScan();
    const dir = (tree[1] ?? "~").replace(/\/$/, "") || "~";
    if (!TREE[dir] || !alive(sim, dir)) return out([[s(`omg: ${dir}: not in the index`, "danger")]]);
    const rows = children(sim, dir);
    if (!rows.length) return out([dim(`${dir} has no folders or files in the index`)]);
    return out([
      dim("allocated      files   name"),
      ...rows.map((c) => [s(lpad(bytes(c.size), 10)), s(lpad(shortCount(c.files), 10), "dim"), s("   " + nameOf(c.path) + (c.dir ? "/" : ""))]),
      shortened,
    ]);
  }
  if (cmd === "omg trends" || /^omg trends --days \d+$/.test(cmd)) {
    if (!sim.scanned) return needScan();
    return out([
      dim("day          indexed      volume used"),
      [s("30 days ago  "), s(lpad(bytes(g(205.64)), 10)), s(lpad(bytes(g(447.9)), 14), "dim")],
      [s("14 days ago  "), s(lpad(bytes(g(209.02)), 10)), s(lpad(bytes(g(450.2)), 14), "dim")],
      [s("today        "), s(lpad(bytes(sizeOf(sim, "~")), 10)), s(lpad(bytes(452.1 * GiB - sim.freed), 14), "dim")],
      shortened,
    ]);
  }
  if (cmd === "omg history") {
    if (!sim.log.length) return out([[s("[]")]]);
    return out([
      dim("when      source  size        path"),
      ...sim.log.map((d) => [
        s(pad("just now", 10)),
        s(pad(d.source ?? "user", 8), "dim"),
        s(lpad(bytes(d.size), 10)),
        s("  " + (d.source === "docker" ? `Docker ${d.path}` : d.path)),
      ]),
      shortened,
    ]);
  }
  if (cmd === "omg catalog" || cmd === "omg catalog status")
    return out([...json([["active", '"bundled"'], ["signed_imports", "0"], ["rollback_available", "false"]]), shortened]);
  if (cmd === "omg ignores") return out([[s("[]")]]);
  if (cmd === "omg prune") return out([[s("nothing stale remains")]]);
  if (cmd === "exit") return out([dim("this terminal lives on a web page; there is nowhere to exit to")]);
  if (cmd.startsWith("omg ")) return out([[s("omg: this demo knows only a few commands; type help", "warn")]]);
  if (cmd.startsWith("rm") || cmd.startsWith("sudo")) return out([dim("nice try. Nothing here is real.")]);
  return out([[s(`zsh: command not found: ${cmd.split(" ")[0]}`)]]);
}

function tierTone(t: Tier): string {
  return t === "review" ? "warn" : t === "protected" ? "danger" : "brand";
}

const GLYPHS: Record<string, [string, string]> = {
  O: ["█▀█", "█▄█"],
  H: ["█ █", "█▀█"],
  M: ["█▀▄▀█", "█ ▀ █"],
  Y: ["█▄█", " █ "],
  G: ["█▀▀", "█▄█"],
  I: ["█", "█"],
  A: ["▄▀█", "█▀█"],
  B: ["█▄▄", "█▄█"],
  T: ["▀█▀", " █ "],
  E: ["█▀▀", "██▄"],
  S: ["█▀", "▄█"],
};

function banner(w: number): [string, string] {
  const draw = (words: string[]): [string, string] => {
    const rows: [string, string] = ["", ""];
    words.forEach((word, i) => {
      if (i > 0) {
        rows[0] += "   ";
        rows[1] += "   ";
      }
      chars(word).forEach((c, j) => {
        if (j > 0) {
          rows[0] += " ";
          rows[1] += " ";
        }
        rows[0] += GLYPHS[c][0];
        rows[1] += GLYPHS[c][1];
      });
    });
    return rows;
  };
  const full = draw(["OH", "MY", "GIGABYTES"]);
  return chars(full[0]).length <= w ? full : draw(["OMG"]);
}

function slice(line: Line, from: number, to: number): Line {
  const out: Line = [];
  let col = 0;
  for (const seg of line) {
    const c = chars(seg.t);
    const a = Math.max(from - col, 0);
    const b = Math.min(to - col, c.length);
    if (b > a) out.push({ t: c.slice(a, b).join(""), c: seg.c });
    col += c.length;
  }
  return out;
}

function fit(line: Line, w: number): Line {
  const cut = slice(line, 0, w);
  const used = width(cut);
  return used < w ? [...cut, s(" ".repeat(w - used))] : cut;
}

function wrap(line: Line, w: number): Line[] {
  const total = width(line);
  if (total <= w) return [line];
  const text = chars(line.map((seg) => seg.t).join(""));
  const out: Line[] = [];
  let at = 0;
  while (at < total) {
    let end = Math.min(at + w, total);
    if (end < total) {
      const space = text.lastIndexOf(" ", end);
      if (space > at) end = space + 1;
    }
    out.push(slice(line, at, end));
    at = end;
  }
  return out;
}

function box(inner: Line[], cols: number, tone: string, title?: string): Line[] {
  const w = cols - 2;
  const top: Line = title
    ? [s("╭", tone), s(` ${title} `, `${tone} bold`), s("─".repeat(Math.max(0, w - chars(title).length - 2)) + "╮", tone)]
    : [s("╭" + "─".repeat(w) + "╮", tone)];
  return [top, ...inner.map((l) => [s("│", tone), ...fit(l, w), s("│", tone)]), [s("╰" + "─".repeat(w) + "╯", tone)]];
}

function header(sim: Sim, cols: number): Line[] {
  const inner = cols - 4;
  const [r1, r2] = banner(Math.max(inner - 24, 13));
  const lines: Line[] = [
    [s(" "), s(r1, "brand bold"), s(`   v${VERSION}`, "dim")],
    [s(" "), s(r2, "brand bold"), s("   find it · explain it · you decide", "dim")],
  ];
  if (!sim.scanned) {
    lines.push([s("  Nothing scanned yet. Press r to count your gigabytes.", "dim")], []);
  } else {
    lines.push([
      s("  ~"),
      s(`  ·  scanned just now  ·  ${shortCount(ENTRIES)} files  ·  ${bytes(sizeOf(sim, "~"))} indexed`, "dim"),
    ]);
    const cap = 926.3 * GiB;
    const used = 452.1 * GiB - sim.freed;
    const gauge = Math.min(36, Math.max(10, inner - 70));
    const filled = bar(used / cap, gauge).trimEnd();
    lines.push([
      s("  disk ", "dim"),
      s(filled, "brand"),
      s("░".repeat(gauge - chars(filled).length), "dim"),
      s(` ${bytes(used)} used of ${bytes(cap)}`, "bold"),
    ]);
  }
  return box(lines, cols, "dim");
}

function tabs(sim: Sim, cols: number): Line {
  const line: Line = [s(" ")];
  TAB_NAMES.forEach((full, i) => {
    let name = cols < 84 ? chars(full.split(" ").pop() ?? "").slice(0, 5).join("") : full;
    if (i === 3 && sim.trash.length) name += ` (${sim.trash.length})`;
    line.push(i === sim.tab ? s(`● ${name}`, "sel") : s(`${i + 1} ${name}`, "dim"));
    line.push(s("  "));
  });
  return line;
}

function scrollStart(cursor: number, len: number, visible: number): number {
  const v = Math.max(1, visible);
  const margin = Math.min(5, Math.floor((v - 1) / 2));
  const max = Math.max(0, len - v);
  let start = 0;
  if (cursor + margin >= start + v) start = cursor + margin + 1 - v;
  return Math.max(0, Math.min(start, max));
}

function overview(sim: Sim, w: number): Line[] {
  const out: Line[] = [[]];
  if (!sim.scanned) {
    out.push([s("  No index yet. Press r: scanning only reads metadata and never changes a file.", "dim")]);
    return out;
  }
  out.push([s("  Shared clone/snapshot space is unknown; indexed bytes are not space-freed estimates.", "warn")]);
  out.push([s("  Biggest folders", "bold")]);
  const top = children(sim, "~").slice(0, 8);
  const total = Math.max(1, top.reduce((n, c) => n + c.size, 0));
  const max = Math.max(1, ...top.map((c) => c.size));
  const bw = Math.min(30, Math.max(8, w - 44));
  for (const c of top) {
    const filled = bar(c.size / max, bw).trimEnd();
    out.push([
      s("  "),
      s(filled, "brand"),
      s("·".repeat(bw - chars(filled).length), "dim"),
      s(" " + lpad(bytes(c.size), 10), "bold"),
      s(" " + lpad(((c.size / total) * 100).toFixed(0), 4) + "%  ", "dim"),
      s(truncateMiddle(nameOf(c.path), w - (bw + 22))),
      s(c.dir ? "/" : "", "dim"),
    ]);
  }
  out.push([]);
  const list = findings(sim);
  const n = (t: Tier) => list.filter((f) => f.tier === t).length;
  const explained = list.filter((f) => f.tier !== "protected").reduce((x, f) => x + sizeOf(sim, f.path), 0);
  out.push([
    s("  Findings   ", "bold"),
    s(`● ${n("review")} review  `, "warn"),
    s(`● ${n("info")} info  `, "brand"),
    s(`● ${n("protected")} protected`, "danger"),
    s(`   ≈ ${bytes(explained)} explained`, "dim"),
  ]);
  const waiting = sim.trash.reduce((x, p) => x + sizeOf(sim, p), 0);
  const freed = sim.freed > 0 ? ` · ≈ ${bytes(sim.freed)} freed so far` : "";
  out.push([s("  OMG Trash  ", "bold"), s(`${sim.trash.length} item(s) · ≈ ${bytes(waiting)} waiting for your decision${freed}`, "dim")]);
  out.push([s("  Growth     ", "bold"), s("+6.84 GiB indexed in this scope over 30 days", "warn")]);
  if (alive(sim, "~/Library/Developer/Xcode/DerivedData"))
    out.push([s("  Grew       ", "bold"), s(`since the last scan: ${truncateMiddle("Library/Developer/Xcode/DerivedData", 32)} +2.31 GiB`, "warn")]);
  return out;
}

function pathStyle(selected: boolean, inTrash: boolean): string | undefined {
  if (inTrash) return "trash";
  return selected ? "sel" : undefined;
}

function browse(sim: Sim, w: number, h: number): Line[] {
  const crumbs: Line = [s("  ", "dim"), s("~")];
  for (const part of sim.dir.split("/").slice(1)) crumbs.push(s(" › ", "dim"), s(part));
  if (!sim.scanned) return [crumbs, [], [s("  (empty, or folder totals need a fresh scan)", "dim")]];
  const here = node(sim, sim.dir)!;
  crumbs.push(s(`   ${bytes(here.size)} · ${shortCount(here.files)} files`, "bold"));
  const items = children(sim, sim.dir);
  const out: Line[] = [crumbs, []];
  const max = Math.max(1, ...items.map((c) => c.size));
  const bw = Math.min(24, Math.max(6, w - 46));
  const visible = Math.max(1, h - 2);
  const start = scrollStart(sim.cursor[1], items.length, visible);
  items.slice(start, start + visible).forEach((c, i) => {
    const sel = start + i === sim.cursor[1];
    const inTrash = sim.trash.includes(c.path);
    const filled = bar(c.size / max, bw).trimEnd();
    out.push([
      s(sel ? "❯ " : "  ", "sel"),
      s(filled, "brand"),
      s(" ".repeat(bw - chars(filled).length)),
      s(" " + lpad(bytes(c.size), 11) + "  ", "bold"),
      s(truncateMiddle(nameOf(c.path), w - (bw + 40)) + (c.dir ? "/" : ""), pathStyle(sel, inTrash)),
      s(c.dir ? `  ${shortCount(c.files)} files` : "", "dim"),
      inTrash ? s("") : c.regen ? s(" ♻ regenerable", "good") : guardOf(c.path) ? s(" ⚠", "warn") : s(""),
    ]);
  });
  return out;
}

function details(f: Finding): Line[] {
  const row = (label: string, text: string): Line => [s(`  ${pad(label, 13)}`, "dim"), s(text)];
  return [
    [],
    [s(`  ${f.rule}`, "brand bold")],
    row("Tier", f.tier),
    row("Why", f.reason),
    row(f.category === "build_artifacts" ? "Last built" : "Last changed", f.changed),
    row("Evidence", f.evidence),
    row("Effects", f.effects),
    row("Regenerates", f.regen),
    row("Warnings", f.warnings),
    row("Source", "bundled catalog"),
    [],
    [s("  ⏎ back · space add/remove OMG Trash · d delete… · p dry-run preview", "dim")],
  ];
}

function findingsView(sim: Sim, w: number, h: number): Line[] {
  const out: Line[] = [[s(`  tier filter: ${TIERS[sim.tier]}`, "dim")]];
  const rows = sim.scanned ? shownFindings(sim) : [];
  if (!rows.length) {
    out.push([s("  No findings here. OMG reports known developer caches and large files.", "dim")]);
    return out;
  }
  if (sim.details && rows[sim.cursor[2]]) return [...out, ...details(rows[sim.cursor[2]])];
  const visible = Math.max(1, Math.floor((h - 1) / 2));
  const start = scrollStart(sim.cursor[2], rows.length, visible);
  rows.slice(start, start + visible).forEach((f, i) => {
    const sel = start + i === sim.cursor[2];
    out.push([
      s(sel ? "❯ " : "  ", "sel"),
      s(`● ${pad(f.tier, 10)}`, tierTone(f.tier)),
      s(lpad(bytes(sizeOf(sim, f.path)), 10) + "  ", "bold"),
      s(truncateMiddle(f.path, w - 29), pathStyle(sel, sim.trash.includes(f.path))),
    ]);
    out.push([s(`      ${truncateMiddle(f.reason, w - 8)}`, "dim")]);
  });
  return out;
}

function trashView(sim: Sim, w: number, h: number): Line[] {
  const total = sim.trash.reduce((n, p) => n + sizeOf(sim, p), 0);
  const out: Line[] = [
    [s(`  ${sim.trash.length} item(s) · ≈ ${bytes(total)}`, "bold"), s("   saved paths only; nothing has been moved or deleted", "dim")],
  ];
  if (sim.autoDel.on)
    out.push([
      s(`  Auto delete after ${periodName(sim.autoDel.days)}: `, "warn"),
      s(nextLine(sim), "dim"),
    ]);
  out.push([]);
  if (!sim.trash.length) {
    out.push([s("  Empty. In Browse or Findings press space to add something you want gone.", "dim")]);
    return out;
  }
  const visible = Math.max(1, h - out.length);
  const start = scrollStart(sim.cursor[3], sim.trash.length, visible);
  sim.trash.slice(start, start + visible).forEach((p, i) => {
    const sel = start + i === sim.cursor[3];
    const tag = sim.autoDel.on ? standingTag(sim, p) : sim.auto.includes(p) ? "  · suggested by scan (you did not add this)" : "";
    out.push([
      s(sel ? "❯ " : "  ", "sel"),
      s(sim.selected.includes(p) ? "◉ " : "○ ", "danger"),
      s(lpad(bytes(sizeOf(sim, p)), 10) + "  ", "bold"),
      s(truncateMiddle(p, Math.max(16, w - 18 - chars(tag).length)), sel ? "sel" : undefined),
      s(tag, "warn"),
    ]);
  });
  return out;
}

function deletedView(sim: Sim, w: number, h: number): Line[] {
  const total = sim.log.reduce((n, d) => n + d.size, 0);
  const out: Line[] = [
    [
      s(`  ${sim.log.length} deleted · ≈ ${bytes(total)}`, "bold"),
      s("   a text record only, kept for 20 days", "dim"),
    ],
    [],
  ];
  if (!sim.log.length) {
    out.push([s("  Nothing deleted in the last 20 days.", "dim")]);
    return out;
  }
  const today = new Date().toISOString().slice(0, 10);
  const autos = sim.log.findIndex((d) => d.source !== "auto");
  const autoCount = autos < 0 ? sim.log.length : autos;
  const visible = Math.max(1, h - 2 - (autoCount ? 2 : 0));
  const start = scrollStart(sim.cursor[4], sim.log.length, visible);
  sim.log.slice(start, start + visible).forEach((d, i) => {
    const n = start + i;
    if (autoCount && (n === start || n === autoCount))
      out.push([s(n < autoCount ? `  Auto-deleted (${autoCount})` : "  Deleted by you", "brand")]);
    const sel = n === sim.cursor[4];
    out.push([
      s(sel ? "❯ " : "  ", "sel"),
      s(`${today}  ${pad("just now", 9)}`, "dim"),
      s(lpad(bytes(d.size), 10) + "  ", "bold"),
      s(truncateMiddle(d.source === "docker" ? `Docker ${d.path}` : d.path, w - 42), sel ? "sel" : undefined),
    ]);
  });
  return out;
}

function help(): Line[] {
  const row = (k: string, v: string): Line => [s(`  ${pad(k, 12)}`, "brand"), s(v)];
  return [
    [],
    [s("  Shortcuts (any key closes)", "bold")],
    row("m", "options menu for the selected item and the app (also: theme auto, dark or light)"),
    row("1-5  Tab", "Overview · Browse · Findings · OMG Trash · Deleted"),
    row("j k ↑ ↓", "move        PgUp/PgDn jump"),
    row("⏎ →  ⌫ ←", "open folder / details  ·  up one folder"),
    row("space", "add / remove from OMG Trash (saves the path; nothing changes on disk)"),
    row("d", "delete permanently… (always asks; cannot be undone)"),
    row("D", "in OMG Trash: delete everything listed…"),
    row("u  U", "remove from OMG Trash  ·  remove everything (asks first)"),
    row("u  U", "in Deleted: remove a line  ·  clear the log (asks first)"),
    row("K", "in OMG Trash: keep an item from auto delete (set auto delete up in the menu, m)"),
    row("capability", "permanent delete: development-unqualified · OS Trash: unsupported"),
    row("r  R", "scan  ·  full rescan        esc stops a scan"),
    row("p i o t", "preview · show in file manager · tier filter"),
    [],
    [s("  Protected forever: .git, credentials, databases, disk images, anything outside your home.", "dim")],
  ];
}

const FRAMES = ["·", "✢", "✳", "✶", "✻", "✽"];
const VERBS = ["Weighing gigabytes", "Sniffing caches", "Counting bytes", "Measuring folders", "Gobbling inodes"];

function progress(sim: Sim, prefix = " "): Line {
  const done = sim.scan!.done;
  const step = Math.floor(done / SCAN_STEP);
  const pct = Math.min(1, done / TOTAL_FILES);
  const verb = VERBS[Math.floor(step / 5) % VERBS.length];
  const detail =
    done > 0
      ? `${bar(pct, 12)} ${count(done)} / ~${shortCount(TOTAL_FILES)} · ≤${(pct * 100).toFixed(0)}% · ${count(RATE)}/s · ~${duration((TOTAL_FILES - done) / RATE)} left`
      : `${count(done)} entries · 0/s`;
  return [s(`${prefix}${FRAMES[step % FRAMES.length]} ${verb}… `, "brand"), s(detail, "dim"), s(" (esc stops)", "dim")];
}

const OPTIONS: [string, string][][] = [
  [["r", "scan"], ["2", "browse"], ["3", "findings"], ["4", "OMG Trash"], ["m", "options"]],
  [["⏎", "open"], ["⌫", "up"], ["␣", "add / remove OMG Trash"], ["d", "delete…"], ["m", "options"]],
  [["⏎", "details"], ["␣", "add / remove OMG Trash"], ["d", "delete…"], ["p", "preview"], ["t", "tier"]],
  [["␣", "select"], ["d", "delete selected…"], ["D", "empty all…"], ["u", "remove from list"], ["U", "remove all…"]],
  [["j k", "move"], ["u", "remove line"], ["U", "clear log…"], ["m", "options"]],
];

function optionsBar(sim: Sim, cols: number): Line[] {
  const opts: [string, string][] = sim.menu
    ? [["↑↓", "choose"], ["⏎", "select"], ["esc", "cancel"]]
    : sim.tab === 3 && sim.autoDel.on
      ? [...OPTIONS[3], ["K", "keep from auto delete"]]
      : OPTIONS[sim.tab];
  const line: Line = [s(" ")];
  for (const [k, label] of opts) {
    const danger = label.startsWith("delete") || label.startsWith("empty");
    line.push(s(` ${k} `, danger ? "danger bold" : "brand bold"), s(`${label}   `, "dim"));
  }
  return box([line], cols, "dim");
}

function overlay(base: Line[], menu: Menu, cols: number): Line[] {
  const w = Math.min(cols - 6, 76);
  const inner = w - 2;
  const body: Line[] = menu.body.flatMap(([t, tone]) => wrap([s(` ${t}`, tone)], inner));
  const choices: Line[] = menu.choices.map((c, i) => {
    const sel = i === menu.cursor;
    return [
      s(sel ? " ❯ " : "   ", "sel"),
      s(`${i + 1}. `, "dim"),
      s(c.label, [sel ? "sel" : "", c.tone ?? ""].join(" ").trim() || undefined),
      s(c.key ? `   ${c.key === " " ? "space" : c.key}` : "", "dim"),
    ];
  });
  const rows = [...body, ...(body.length ? [[]] : []), ...choices];
  const panel = box(rows, w, menu.tone, menu.title);
  const x = Math.floor((cols - w) / 2);
  const y = Math.max(0, Math.floor((base.length - panel.length) / 2));
  return base.map((line, i) => {
    const p = panel[i - y];
    if (!p) return line;
    const full = fit(line, cols);
    return [...slice(full, 0, x), ...p, ...slice(full, x + w, cols)];
  });
}

export function render(sim: Sim, cols = 84, rows = 30): Line[] {
  if (sim.screen === "shell") {
    const lines = [...sim.shell];
    if (sim.scan?.inShell) lines.push(progress(sim, ""));
    return lines;
  }
  const height = Math.max(3, rows - 12);
  let body: Line[];
  if (sim.help) body = help();
  else if (sim.tab === 0) body = overview(sim, cols);
  else if (sim.tab === 1) body = browse(sim, cols, height);
  else if (sim.tab === 2) body = findingsView(sim, cols, height);
  else if (sim.tab === 3) body = trashView(sim, cols, height);
  else body = deletedView(sim, cols, height);
  body = body.flatMap((l) => wrap(l, cols)).slice(0, height);
  while (body.length < height) body.push([]);
  const status: Line = sim.scan
    ? progress(sim)
    : [s(` ${sim.message}`, sim.message.startsWith("⚠") ? "warn" : "dim")];
  let screen: Line[] = [
    ...header(sim, cols),
    tabs(sim, cols),
    ...body,
    slice(status, 0, cols),
    ...optionsBar(sim, cols),
    [s("  m options · ? shortcuts · 1-5 views · q quit", "dim")],
  ];
  if (sim.menu) screen = overlay(screen, sim.menu, cols);
  return screen;
}
