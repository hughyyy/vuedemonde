<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  AppChip, AppVirtualList, DataTable, DataView, MeterGroup, OrderList, OrgChart, Paginator, PickList,
  TermSession, Terminal, TextEditor, Timeline, Tree, TreeSelect, TreeTable, VirtualScroller, notify,
  type ColumnDef, type OrgNode, type TermTransport, type TermTransportApi,
  type TimelineItem, type TreeNode,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

/** Not barrel-exported by the kit — mirror the component's item shape. */
type MeterItem = {
  label: string;
  value: number;
  max?: number;
  tint?: "ok" | "warn" | "err" | "info" | "run" | "accent";
};

const props = defineProps<{ print?: boolean }>();

if (props.print) {
  // The release renderer captures #print-section with a temporarily resized
  // viewport; the kit's popover panels close on window scroll/resize. This
  // setup runs before the kit components mount, so pre-empting the events
  // keeps the open TreeSelect panel alive.
  for (const type of ["scroll", "resize"] as const) {
    window.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
  }
}

const cols: ColumnDef[] = [
  { field: "name", header: "Name", sortable: true },
  { field: "status", header: "Status", align: "center" },
  { field: "progress", header: "Progress", align: "right", width: "90px" },
];
const rows: Record<string, unknown>[] = [
  { name: "Research", status: "done", progress: 100 },
  { name: "Draft", status: "active", progress: 64 },
  { name: "Review", status: "waiting", progress: 20 },
  { name: "Ship", status: "blocked", progress: 5 },
];

const page = ref(1); // second page active in the standalone Paginator

/* Tree: expanded AND collapsed AND disabled nodes. */
const tree: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: "folder",
    expanded: true,
    children: [
      { id: "src-kit", label: "kit", icon: "folder", children: [{ id: "src-kit-b", label: "AppButton.vue", icon: "node" }, { id: "src-kit-t", label: "DataTable.vue", icon: "node" }] },
      { id: "src-charts", label: "charts", icon: "folder", children: [{ id: "src-chart-bar", label: "BarChart.vue", icon: "node" }] }, // collapsed
    ],
  },
  { id: "docs", label: "docs", icon: "folder", disabled: true },
];
/* TreeTable: mixed expanded/collapsed rows with cells. */
const treeRows: TreeNode[] = [
  { id: "r1", label: "Ada Lovelace", row: { role: "Analyst", team: "Core" }, expanded: true, children: [{ id: "r1a", label: "Grace Hopper", row: { role: "Engineer", team: "Platform" } }] },
  { id: "r2", label: "Alan Turing", row: { role: "Lead", team: "Core" }, children: [{ id: "r2a", label: "Barbara Liskov", row: { role: "Engineer", team: "Platform" } }] }, // collapsed
];
const treeCols: ColumnDef[] = [
  { field: "role", header: "Role" },
  { field: "team", header: "Team" },
];
const treeSel = ref<string>("src-kit-b"); // shown in the TreeSelect trigger

const orderList = ref(["Alpha", "Beta", "Gamma", "Delta"]);
const pickSource = ref(["🍎 Apple", "🍒 Cherry", "🥝 Kiwi"]);
const pickTarget = ref(["🍌 Banana"]);

const timeline: TimelineItem[] = [
  { id: "t1", title: "Scaffold", time: "09:00", icon: "check", tint: "ok", content: "Repo + build config." },
  { id: "t2", title: "Port kit", time: "10:30", icon: "node", tint: "run", content: "Components across." },
  { id: "t3", title: "Interface", time: "12:15", icon: "eye", tint: "info", content: "Playground catalogue." },
  { id: "t4", title: "Tune tokens", time: "13:40", icon: "warn", tint: "warn", content: "Contrast pass." },
  { id: "t5", title: "Cut release", time: "15:05", icon: "star", tint: "accent", content: "Tag v0.2.0." },
];

const meters: MeterItem[] = [
  { label: "CPU", value: 64, tint: "ok" },
  { label: "Mem", value: 82, tint: "warn" },
  { label: "Disk", value: 47, tint: "info" },
  { label: "Net", value: 21, tint: "accent" },
];

const vscrollItems = Array.from({ length: 80 }, (_, i) => `row #${i + 1} — ${i % 5 === 0 ? "flagged" : "plain"} entry`);
const vlistItems = Array.from({ length: 14 }, (_, i) => ({
  title: `Turn ${i + 1}`,
  body: i % 3 === 0 ? "A longer transcript entry with a few sentences of prose to vary the measured height." : "Short line.",
}));

const html = ref("<p>Edit me — rich content with <strong>formatting</strong>.</p>");

const org: OrgNode = {
  id: "ceo",
  label: "Chief",
  tint: "accent",
  children: [
    { id: "pd", label: "Product", children: [{ id: "pm", label: "PM", tint: "info" }, { id: "ux", label: "Design" }] },
    { id: "eng", label: "Engineering", icon: "node", children: [{ id: "fe", label: "Frontend" }, { id: "be", label: "Backend", tint: "ok" }] },
  ],
};

/* Terminal — live static demo: a real TermSession + TermTransport feed the
 * kit Terminal (no `sources`), so the rows are genuinely parsed ANSI runs. */
const termSession = new TermSession({ id: "demo", label: "release run" });
let termApi: TermTransportApi | null = null;
const termTransport: TermTransport = {
  id: "demo",
  label: "release run",
  attach(api: TermTransportApi) {
    termApi = api;
  },
  dispose() {},
};

/* DOM seam used to drive interactive-only states (sort arrow, TreeSelect panel). */
const tableWrap = ref<HTMLElement | null>(null);
const treeSelectWrap = ref<HTMLElement | null>(null);

onMounted(() => {
  // CR-overwrite progress line, then the happy path — real styled terminal rows.
  termSession.append("$ npm run release\n"); // exercises the standalone session feed too
  const s = termApi;
  if (s) {
    s.append("$ npm run release\n");
    s.append("\u001b[90m▸ build 0%\u001b[0m\r\u001b[90m▸ build 47%\u001b[0m\r\u001b[90m▸ build 88%\u001b[0m\r\u001b[32m✓ build ok\u001b[0m \u001b[90min 1.84s\u001b[0m\n");
    s.append("\u001b[33m▲ theme.css  18.2 kB\u001b[0m\n");
    s.append("\u001b[32m✓ kit.js     61.4 kB gzip\u001b[0m\n");
    s.append("  ➜  \u001b[36mLocal:\u001b[0m  \u001b[4mhttp://localhost:5199/\u001b[0m\n");
  }
  if (!props.print) return;
  // DataTable — activate the sort arrow on the first sortable column.
  tableWrap.value?.querySelector<HTMLElement>("thead th.is-sortable")?.click();
  // TreeSelect — open its teleported tree panel.
  treeSelectWrap.value?.querySelector<HTMLElement>(".tree-select__trigger")?.click();
});
</script>

<template>
  <div class="wrap">
    <h2 class="sec-title">Data Display</h2>

    <DemoCard class="span-2" title="DataTable + Paginator" desc="Headers, sortable column (arrow active), 4 rows; page 2 active.">
      <div ref="tableWrap">
        <DataTable
          selectable
          :columns="cols"
          :data="rows"
          @row-select="(r: Record<string, unknown>) => notify('info', `Row: ${String(r['name'])}`)"
        >
          <template #cell="{ col, value }">
            <AppChip v-if="col.field === 'status'" :tint="value === 'done' ? 'ok' : value === 'blocked' ? 'err' : 'run'">{{ String(value) }}</AppChip>
            <span v-else>{{ String(value) }}</span>
          </template>
        </DataTable>
      </div>
      <Paginator v-model:page="page" :page-count="4" :total="40" :page-size="10" size="sm" style="margin-top: 8px" />
    </DemoCard>

    <DemoCard class="span-3" title="Tree / TreeTable / TreeSelect" desc="Expanded + collapsed + disabled nodes; value picked; panel opens in print.">
      <div class="grid3">
        <Tree :nodes="tree" selectable :selected-id="treeSel ?? undefined" @select="treeSel = $event" />
        <TreeTable :nodes="treeRows" :columns="treeCols" selectable :expand-all="false" />
        <div ref="treeSelectWrap">
          <TreeSelect v-model="treeSel" :nodes="tree" placeholder="Choose a node…" />
        </div>
      </div>
    </DemoCard>

    <DemoCard class="span-3" title="OrderList / PickList / DataView" desc="Reorderable rows, two-list transfer, list layout.">
      <div class="grid3">
        <OrderList v-model="orderList">
          <template #item="{ item }">📍 {{ String(item) }}</template>
        </OrderList>
        <PickList v-model:source="pickSource" v-model:target="pickTarget" />
        <DataView :items="orderList" layout="list">
          <template #item="{ item }">
            <div class="dv-row">{{ String(item) }}</div>
          </template>
        </DataView>
      </div>
    </DemoCard>

    <DemoCard class="span-2" title="VirtualScroller" desc="80-row windowed list (static first rows — scroll state can't render).">
      <VirtualScroller :items="vscrollItems" :height="200">
        <template #item="{ item }">
          <div class="vs-row">{{ String(item) }}</div>
        </template>
      </VirtualScroller>
    </DemoCard>

    <DemoCard class="span-3" title="AppVirtualList / Timeline / MeterGroup" desc="Dynamic-height rows, tinted activity stream, stacked meter.">
      <div class="grid3">
        <div class="vlist-box">
          <AppVirtualList :items="vlistItems">
            <template #item="{ item }">
              <div class="vl-entry">
                <p class="vl-title">{{ (item as { title: string }).title }}</p>
                <p class="vl-body">{{ (item as { body: string }).body }}</p>
              </div>
            </template>
          </AppVirtualList>
        </div>
        <div>
          <Timeline :items="timeline" />
        </div>
        <div>
          <MeterGroup :meters="meters" />
        </div>
      </div>
    </DemoCard>

    <DemoCard class="span-2" title="OrgChart" desc="Two-level hierarchy with tinted leaders.">
      <OrgChart :data="org" selectable />
    </DemoCard>

    <DemoCard class="span-2" title="Terminal" desc="Live static demo — real TermSession + transport feed, ANSI-styled rows.">
      <Terminal :transport="termTransport" title="release run" height="210px" />
    </DemoCard>

    <DemoCard class="span-2" title="TextEditor" desc="Tiny rich-text editor (contenteditable) with a toolbar.">
      <TextEditor v-model="html" placeholder="Write something…" toolbar />
    </DemoCard>
  </div>
</template>

<style scoped>
.wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 14px;
  align-items: start;
}
.wrap > .sec-title {
  grid-column: 1 / -1;
}
.span-2 { grid-column: span 2; }
.span-3 { grid-column: 1 / -1; }
.sec-title {
  margin: 0;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.grid3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}
.dv-row {
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  margin-bottom: 6px;
  font-size: var(--fs-13);
}
.vs-row {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
  border-bottom: 1px solid var(--line);
  font-size: var(--fs-12);
  color: var(--text-2);
  font-family: var(--font-mono);
}
.vlist-box {
  height: 240px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
}
.vl-entry {
  padding: 8px 12px;
  border-bottom: 1px solid var(--line);
}
.vl-title {
  margin: 0 0 2px;
  font-size: var(--fs-13);
  font-weight: var(--fw-600);
  color: var(--text);
}
.vl-body {
  margin: 0;
  font-size: var(--fs-12);
  color: var(--text-3);
}
</style>
