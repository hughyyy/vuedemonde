#!/usr/bin/env node
/**
 * Regenerates the README "Visual catalogue" tables from the rendered composites.
 *
 * Run after `npm run render:release`. It reads which composites exist on disk
 * (so it cannot cite a missing image) and groups them in registry order using
 * the same group labels as the playground sidebar.
 *
 * Ids come from the playground manifest rather than a duplicated list — see
 * `playground/src/App.vue` (`__CATALOGUE_MANIFEST__`) — so adding a component
 * cannot silently omit it from the README.
 *
 * Usage: node scripts/catalogue-readme.mjs [--check]
 *   --check  exit 1 if README is stale (for CI)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const README = join(ROOT, "README.md");
const COMPONENTS = join(ROOT, "docs", "assets", "components");
const START = "<!-- catalogue:start -->";
const END = "<!-- catalogue:end -->";

/** Section heading per registry group, in README order. */
const GROUP_TITLES = {
  primitives: "Primitives",
  inputs: "Inputs & Forms",
  overlays: "Overlays & Feedback",
  navigation: "Navigation",
  data: "Data Display",
  layout: "Layout",
  charts: "Charts",
  calendar: "Calendar",
  board: "Board",
};

/** `AppTextarea` → `app-textarea`; must match render-release.mjs. */
function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

const manifestPath = join(ROOT, "docs", "catalogue-manifest.json");
if (!existsSync(manifestPath)) {
  console.error("✗ docs/catalogue-manifest.json missing — run `npm run render:release` first");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const byGroup = new Map(Object.keys(GROUP_TITLES).map((g) => [g, []]));
for (const entry of manifest) {
  const file = `docs/assets/components/${kebab(entry.id)}.webp`;
  if (!existsSync(join(ROOT, file))) {
    console.error(`✗ ${entry.id}: ${file} not rendered — re-run \`npm run render:release\``);
    process.exit(1);
  }
  byGroup.get(entry.group)?.push({ id: entry.id, file });
}

const cells = manifest.length;
const rows = manifest.reduce((n, e) => n + (e.wide ? 1 : 0), 0);
const parts = [];
parts.push(
  `All **${cells} exported components** in six themes each — dark row\n` +
    `(\`dark\` / \`thermal\` / \`bubblegum\`) above light row (\`light\` / \`sunshine\` / \`mint\`).\n` +
    `Regenerate with \`npm run render:release && node scripts/catalogue-readme.mjs\`.\n`,
);
for (const [group, title] of Object.entries(GROUP_TITLES)) {
  const items = byGroup.get(group) ?? [];
  if (!items.length) continue;
  parts.push(`### ${title}\n`);
  for (const item of items) {
    parts.push(`#### ${item.id}\n`);
    parts.push(`![${item.id} — six themes](${item.file})\n`);
  }
}

const block = `${START}\n${parts.join("\n")}\n${END}`;
const readme = readFileSync(README, "utf8");
const from = readme.indexOf(START);
const to = readme.indexOf(END);
if (from < 0 || to < 0) {
  console.error(`✗ README is missing the ${START} / ${END} markers`);
  process.exit(1);
}
const next = readme.slice(0, from) + block + readme.slice(to + END.length);

if (process.argv.includes("--check")) {
  if (next !== readme) {
    console.error("✗ README catalogue is stale — run `node scripts/catalogue-readme.mjs`");
    process.exit(1);
  }
  console.log(`✓ README catalogue up to date (${cells} components)`);
} else {
  writeFileSync(README, next);
  console.log(`✓ README catalogue: ${cells} components in ${Object.keys(GROUP_TITLES).length} groups`);
}
