<script setup lang="ts">
import { ref } from "vue";
import {
  AppChip, DataTable, DataView, OrderList, OrgChart, Paginator, PickList,
  Terminal, TextEditor, Timeline, Tree, TreeSelect, TreeTable, notify,
  type ColumnDef, type OrgNode, type TreeNode, type TimelineItem,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

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

const page = ref(0);

const tree: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: "folder",
    expanded: true,
    children: [
      { id: "src-kit", label: "kit", icon: "folder", children: [{ id: "src-kit-b", label: "AppButton.vue", icon: "node" }, { id: "src-kit-t", label: "DataTable.vue", icon: "node" }] },
      { id: "src-charts", label: "charts", icon: "folder" },
    ],
  },
  { id: "docs", label: "docs", icon: "folder" },
];
const treeRows: TreeNode[] = [
  { id: "r1", label: "Ada Lovelace", row: { role: "Analyst", team: "Core" }, expanded: true, children: [{ id: "r1a", label: "Grace Hopper", row: { role: "Engineer", team: "Platform" } }] },
];
const treeCols: ColumnDef[] = [
  { field: "role", header: "Role" },
  { field: "team", header: "Team" },
];
const treeSel = ref<string | null>(null);

const orderList = ref(["Alpha", "Beta", "Gamma", "Delta"]);
const pickSource = ref(["🍎 Apple", "🍌 Banana", "🍒 Cherry", "🥝 Kiwi"]);
const pickTarget = ref<string[]>([]);

const timeline: TimelineItem[] = [
  { id: "t1", title: "Scaffold", time: "09:00", icon: "check", tint: "ok", content: "Repo + build config." },
  { id: "t2", title: "Port kit", time: "10:30", icon: "node", tint: "run", content: "Components across." },
  { id: "t3", title: "Interface", time: "12:15", icon: "eye", tint: "info", content: "Playground catalogue." },
];

const termLines = ["$ npm run dev", "  vite v7 ready in 320ms", "  ➜  Local:  http://localhost:5199"];
const termText = ref("");

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
</script>

<template>
  <div>
    <h2 class="sec-title">Data Display</h2>

    <DemoCard title="DataTable + Paginator" desc="Sortable columns, cell slots, row selection, pagination.">
      <DataTable
        selectable
        :columns="cols"
        :data="rows"
        :page-size="3"
        @row-select="(r: Record<string, unknown>) => notify('info', `Row: ${String(r['name'])}`)"
      >
        <template #cell="{ col, value }">
          <AppChip v-if="col.field === 'status'" :tint="value === 'done' ? 'ok' : value === 'blocked' ? 'err' : 'run'">{{ String(value) }}</AppChip>
          <span v-else>{{ String(value) }}</span>
        </template>
      </DataTable>
      <Paginator v-model:page="page" :page-count="4" :total="40" size="sm" style="margin-top: 8px" />
    </DemoCard>

    <DemoCard title="Tree / TreeTable / TreeSelect" desc="Nested data with selection and expand control.">
      <div class="grid3">
        <Tree :nodes="tree" selectable :selected-id="treeSel ?? undefined" @select="treeSel = $event" />
        <TreeTable :nodes="treeRows" :columns="treeCols" selectable :expand-all="true" />
        <TreeSelect :nodes="tree" placeholder="Choose a node…" />
      </div>
    </DemoCard>

    <DemoCard title="OrderList / PickList / DataView" desc="Orderable rows, two-list transfer, card/list toggle.">
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

    <DemoCard title="Timeline / OrgChart" desc="Activity stream and organisation hierarchy.">
      <div class="grid3">
        <Timeline :items="timeline" />
        <OrgChart :data="org" selectable />
        <Terminal :lines="termLines" prompt="❯" height="160px" @command="(c: string) => { termText += '❯ ' + c + '\n'; }" />
      </div>
    </DemoCard>

    <DemoCard title="TextEditor" desc="A tiny rich-text editor (contenteditable) with a toolbar.">
      <TextEditor v-model="html" placeholder="Write something…" toolbar />
    </DemoCard>
  </div>
</template>

<style scoped>
.sec-title {
  margin: 0 0 16px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.grid3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
</style>
