<script setup lang="ts">
import { ref } from "vue";
import {
  AppAccordion, AppButton, AppMenu, AppTabs, Breadcrumb, Carousel, Dock, MegaMenu, Menubar,
  ScrollTop, TieredMenu, notify,
  type AccordionItem, type BreadcrumbItem, type DockItem, type MegaItem,
  type MenubarItem, type MenuItem, type TabDef, type TieredItem,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

const tab = ref("overview");
const tabs: TabDef[] = [
  { id: "overview", label: "Overview" },
  { id: "analytics", label: "Analytics", badge: 12 },
  { id: "settings", label: "Settings", disabled: true },
];

const accordOpen = ref<string | null>("b");
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
</script>

<template>
  <div>
    <h2 class="sec-title">Navigation</h2>

    <DemoCard title="AppTabs / AppAccordion" desc="Tabs with badges, single-expand accordions.">
      <div class="split">
        <div class="half">
          <AppTabs v-model="tab" :tabs="tabs" />
          <p class="note">Active tab: {{ tab }}</p>
          <AppAccordion v-model="accordOpen" :items="accordItems" />
        </div>
        <div class="half">
          <div class="note-block">
            <p class="note">Accordion open: {{ accordOpen }}</p>
          </div>
        </div>
      </div>
    </DemoCard>

    <DemoCard title="AppMenu & menubars" desc="Popover menu, top menubar, tiered cascade, mega menu, dock.">
      <div class="col">
        <AppMenu :items="menuItems" placement="bottom" @select="pick">
          <AppButton variant="secondary" size="sm" icon="more">Menu</AppButton>
        </AppMenu>
        <Menubar :items="menubarItems" @select="pick" />
        <TieredMenu :items="tieredItems" @select="pick">
          <AppButton variant="ghost" size="sm">Tiered menu ▾</AppButton>
        </TieredMenu>
        <MegaMenu :items="megaItems" @select="pick" />
        <Dock :items="dockItems" @select="pick" />
      </div>
    </DemoCard>

    <DemoCard title="Breadcrumb / ScrollTop" desc="Trail navigation and a scroll-to-top affordance.">
      <div class="row">
        <Breadcrumb :items="crumbs" @select="pick" style="flex: 1" />
        <ScrollTop :threshold="10" />
      </div>
    </DemoCard>

    <DemoCard title="Carousel" desc="Slide strip with prev/next + dots, optional autoplay.">
      <Carousel :items="slides" class="car">
        <template #item="{ item }">
          <div class="car-slide">{{ String(item) }}</div>
        </template>
      </Carousel>
    </DemoCard>
  </div>
</template>

<style scoped>
.sec-title {
  margin: 0 0 16px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.half {
  min-width: 0;
}
.note {
  margin: 14px 0;
  font-size: var(--fs-12);
  color: var(--text-3);
}
.note-block {
  border: 1px dashed var(--line);
  border-radius: var(--radius-md);
  padding: 14px;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.row {
  display: flex;
  align-items: center;
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
</style>
