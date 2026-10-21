<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  AppAccordion, AppButton, AppMenu, AppTabs, Breadcrumb, Carousel, DeferredContent, Dock, MegaMenu, Menubar,
  ScrollTop, TieredMenu, notify,
  type AccordionItem, type BreadcrumbItem, type DockItem, type MegaItem,
  type MenubarItem, type MenuItem, type TabDef, type TieredItem,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

const props = defineProps<{ print?: boolean }>();

if (props.print) {
  // The release renderer captures #print-section with a temporarily resized
  // viewport; the kit's popover panels close on window resize. Pre-empt it in
  // setup (before kit mounts) so the open AppMenu/TieredMenu survive. Scroll
  // events are left alone — ScrollTop's floating trigger needs them.
  window.addEventListener("resize", (e) => e.stopImmediatePropagation(), true);
}

const tab = ref("analytics"); // second tab active; "settings" disabled
const tabs: TabDef[] = [
  { id: "overview", label: "Overview" },
  { id: "analytics", label: "Analytics", badge: 12 },
  { id: "settings", label: "Settings", disabled: true },
];

const accordOpen = ref<string | null>("a"); // first item open, rest closed
const accordItems: AccordionItem[] = [
  { id: "a", title: "Identity" },
  { id: "b", title: "Execution" },
  { id: "c", title: "Outputs" },
];

const menuItems: MenuItem[] = [
  { id: "new", label: "New", icon: "plus", shortcut: "⌘N" },
  { id: "edit", label: "Edit", icon: "edit", shortcut: "⌘E" },
  { id: "sp", separator: true },
  { id: "delete", label: "Delete", icon: "trash", danger: true },
];
const menuOpen = ref(false); // controlled open state — print renders it open

const menubarItems: MenubarItem[] = [
  { id: "m-file", label: "File", children: [{ id: "m-open", label: "Open…", icon: "folder" }, { id: "m-save", label: "Save", icon: "check" }] },
  { id: "m-edit", label: "Edit", children: [{ id: "m-undo", label: "Undo" }, { id: "m-redo", label: "Redo" }] },
  { id: "m-view", label: "View", children: [{ id: "m-theme", label: "Theme", icon: "theme" }] },
];

const tieredItems: TieredItem[] = [
  { id: "t1", label: "Move", icon: "settings", children: [{ id: "t1a", label: "Left" }, { id: "t1b", label: "Right" }] },
  { id: "t2", label: "Duplicate", icon: "copy" },
  { id: "t3", label: "Archive", icon: "folder", children: [{ id: "t3a", label: "To inbox" }, { id: "t3b", label: "To vault" }] },
];

const megaItems: MegaItem[] = [
  { id: "g1", label: "Product", icon: "node", columns: [{ title: "Manage", items: [{ id: "g1a", label: "Library", icon: "folder" }, { id: "g1b", label: "Catalog", icon: "inbox" }] }] },
  { id: "g2", label: "Community", icon: "users", columns: [{ title: "Explore", items: [{ id: "g2a", label: "Guides", icon: "info" }, { id: "g2b", label: "Events", icon: "calendar" }] }] },
];

const dockItems: DockItem[] = [
  { id: "d-run", label: "Run", icon: "run" },
  { id: "d-charts", label: "Charts", icon: "chart" },
  { id: "d-cal", label: "Calendar", icon: "calendar" },
  { id: "d-users", label: "Users", icon: "users" },
  { id: "d-settings", label: "Settings", icon: "settings" },
];

const crumbs: BreadcrumbItem[] = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "alpha", label: "Alpha" },
];

function pick(id: string): void {
  notify("info", `Selected: ${id}`);
}

const slides = ["Slide one — token dark", "Slide two — accent glow", "Slide three — everything moves"];

const tieredWrap = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!props.print) return;
  // ScrollTop needs a scrolled window to reveal its floating trigger. The
  // scroll event closes popover panels (capture listener), so open the menus
  // a beat later, once the scroll has settled.
  window.scrollTo({ top: 60, behavior: "instant" });
  setTimeout(() => {
    menuOpen.value = true; // AppMenu — controlled open state
    tieredWrap.value?.querySelector<HTMLElement>("[role='button']")?.click(); // TieredMenu — teleported panel
  }, 60);
});
</script>

<template>
  <div class="wrap">
    <h2 class="sec-title">Navigation</h2>

    <DemoCard class="span-2" title="AppTabs / AppAccordion" desc="Second tab active, third disabled; accordion: first open, others closed.">
      <AppTabs v-model="tab" :tabs="tabs">
        <template #panel-overview>
          <p class="note">Overview panel — metrics, status and shortcuts.</p>
        </template>
        <template #panel-analytics>
          <p class="note">Analytics panel — <span class="strong">12 unread</span> events this sprint.</p>
        </template>
      </AppTabs>
      <AppAccordion v-model="accordOpen" :items="accordItems">
        <template #panel-a>
          <p class="note">Identity — avatar, name, handle and role fields live here.</p>
        </template>
        <template #panel-b>
          <p class="note">Execution — schedules and runners (closed in this render).</p>
        </template>
        <template #panel-c>
          <p class="note">Outputs — logs, artifacts and exports (closed in this render).</p>
        </template>
      </AppAccordion>
    </DemoCard>

    <DemoCard class="span-3" title="Menubar / MegaMenu" desc="Top-level command bars — plain, no submenus open.">
      <div class="col">
        <Menubar :items="menubarItems" @select="pick" />
        <MegaMenu :items="megaItems" @select="pick" />
      </div>
    </DemoCard>

    <DemoCard class="demo span-2" title="Popover menus & Dock" desc="Action menu (open in print), tiered cascade (open in print), dock.">
      <div class="row wrap-row">
        <AppMenu v-model="menuOpen" :items="menuItems" placement="bottom" @select="pick">
          <AppButton variant="secondary" size="sm" icon="more">Menu</AppButton>
        </AppMenu>
        <div ref="tieredWrap">
          <TieredMenu :items="tieredItems" @select="pick">
            <AppButton variant="ghost" size="sm">Tiered menu ▾</AppButton>
          </TieredMenu>
        </div>
      </div>
      <Dock :items="dockItems" @select="pick" />
    </DemoCard>

    <DemoCard class="span-2" title="Breadcrumb / ScrollTop / DeferredContent" desc="Trail, floating back-to-top trigger, lazily-rendered slot.">
      <div class="col">
        <div class="row">
          <Breadcrumb :items="crumbs" @select="pick" style="flex: 1" />
          <ScrollTop :threshold="10" />
        </div>
        <DeferredContent>
          <div class="deferred-card">
            <p class="note">Loaded — this slot deferred until scrolled into view.</p>
          </div>
          <template #placeholder>
            <div class="deferred-card is-ph">
              <span class="ph-label">⟳ deferred placeholder…</span>
            </div>
          </template>
        </DeferredContent>
      </div>
    </DemoCard>

    <DemoCard class="span-2" title="Carousel" desc="Slide strip with prev/next + dots.">
      <Carousel :items="slides" class="car">
        <template #item="{ item }">
          <div class="car-slide">{{ String(item) }}</div>
        </template>
      </Carousel>
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
.note {
  margin: 10px 0 0;
  font-size: var(--fs-12);
  color: var(--text-3);
}
.strong {
  color: var(--accent);
  font-weight: var(--fw-700);
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.wrap-row {
  flex-wrap: wrap;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.car :deep(.carousel__slide) {
  padding: 4px;
}
.car-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 110px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--fs-14);
}
.deferred-card {
  padding: 12px 14px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  min-height: 52px;
}
.deferred-card.is-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
}
.ph-label {
  font-family: var(--font-mono);
  font-size: var(--fs-12);
}
</style>
