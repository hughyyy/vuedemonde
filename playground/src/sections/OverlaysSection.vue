<script setup lang="ts">
import { ref } from "vue";
import {
  AppButton, AppDialog, AppMessage, BlockUI, CommandMenu, ConfirmPopup,
  ContextMenu, Drawer, openDialog, Popover, confirm, notify,
  type CommandItem, type MenuAction,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

const dialogOpen = ref(false);
const drawerOpen = ref(false);
const popOpen = ref(false);
const cmdOpen = ref(false);
const blocked = ref(false);
const cp = ref<InstanceType<typeof ConfirmPopup> | null>(null);

const cmdItems: CommandItem[] = [
  { id: "new", label: "New workflow", icon: "plus", group: "Create", keywords: "new add create" },
  { id: "run", label: "Run workflow", icon: "run", group: "Create", keywords: "execute start run" },
  { id: "settings", label: "Settings", icon: "settings", group: "Jump", keywords: "prefs config" },
  { id: "theme", label: "Theme", icon: "theme", group: "Jump", keywords: "skin colour" },
  { id: "delete", label: "Delete workflow", icon: "trash", group: "Danger", keywords: "remove" },
];

const ctxItems: MenuAction[] = [
  { id: "cut", label: "Cut", icon: "copy", shortcut: "⌘X" },
  { id: "copy", label: "Copy", icon: "copy", shortcut: "⌘C" },
  { id: "paste", label: "Paste", icon: "edit", shortcut: "⌘V" },
  { id: "archive", label: "Archive", shortcut: "⌘E" },
  { id: "delete", label: "Delete", icon: "trash", danger: true },
];

function demoDialog(): void {
  openDialog({
    title: "Dynamic dialog",
    width: "sm",
    component: {
      components: { AppMessage },
      template: `<div><AppMessage kind="warn">Rendered from the <code>openDialog</code> service — no <code>&lt;AppDialog&gt;</code> in your template.</AppMessage><p>Props pass through <code>v-bind</code>.</p></div>`,
    },
  });
}

async function confirmDelete(): Promise<void> {
  const ok = await confirm({ title: "Delete workflow", message: "This cannot be undone. Continue?", confirmLabel: "Delete", danger: true });
  if (ok) notify("ok", "Workflow deleted");
}
</script>

<template>
  <div>
    <h2 class="sec-title">Overlays &amp; Feedback</h2>

    <DemoCard title="AppDialog" desc="Modal with focus trap, Escape-to-close, and a footer slot.">
      <div class="row">
        <AppButton @click="dialogOpen = true">Open dialog</AppButton>
        <AppDialog :open="dialogOpen" title="Edit workflow" size="md" @close="dialogOpen = false">
          <p>A focused modal shell: returns focus on close, traps Tab inside, closes on Escape.</p>
          <template #footer>
            <AppButton variant="ghost" @click="dialogOpen = false">Cancel</AppButton>
            <AppButton @click="dialogOpen = false">Save</AppButton>
          </template>
        </AppDialog>
        <AppButton variant="secondary" @click="demoDialog">DialogHost service</AppButton>
        <AppButton variant="danger" @click="confirmDelete">confirm() Promise</AppButton>
      </div>
    </DemoCard>

    <DemoCard title="Drawer" desc="Side/bottom panel with token-driven overlay.">
      <div class="row">
        <AppButton @click="drawerOpen = true">Open drawer</AppButton>
        <Drawer :open="drawerOpen" title="Inspector" side="right" :size="320" @close="drawerOpen = false">
          <p>Slides in from the right with the token overlay and shadow.</p>
          <AppButton size="sm" variant="ghost" @click="drawerOpen = false">Close</AppButton>
        </Drawer>
      </div>
    </DemoCard>

    <DemoCard title="Popover / ConfirmPopup / ContextMenu" desc="Anchored floating panels.">
      <div class="row">
        <Popover v-model:open="popOpen" :width="240" placement="bottom">
          <template #trigger="{ toggle }">
            <AppButton variant="secondary" size="sm" @click="toggle">Popover</AppButton>
          </template>
          <p class="pp">A lightweight anchored panel. Everything is token-driven.</p>
        </Popover>

        <ConfirmPopup ref="cp" message="Archive this card?" confirm-label="Archive">
          <AppButton variant="ghost" size="sm" danger @click="cp?.prompt()">Confirm popup</AppButton>
        </ConfirmPopup>

        <ContextMenu :items="ctxItems" @select="(id: string) => notify('info', `Context menu → ${id}`)">
          <AppButton variant="ghost" size="sm" icon="more">Right-click me</AppButton>
        </ContextMenu>
      </div>
    </DemoCard>

    <DemoCard title="CommandMenu" desc="Search-style palette with groups and keyboard hints.">
      <div class="row">
        <AppButton icon="search" @click="cmdOpen = true">⌘K — command palette</AppButton>
        <CommandMenu :open="cmdOpen" :items="cmdItems" @update:open="cmdOpen = $event" @select="(id: string) => { cmdOpen = false; notify('ok', `Command: ${id}`); }" />
      </div>
    </DemoCard>

    <DemoCard title="BlockUI" desc="Blocks interaction with an optional message.">
      <div class="row">
        <AppButton @click="blocked = !blocked">{{ blocked ? "Unblock" : "Block UI" }}</AppButton>
        <BlockUI :blocked="blocked" message="Wait…" class="block-slot">
          <div class="block-pane">This pane is inert while blocked (try clicking).</div>
        </BlockUI>
      </div>
    </DemoCard>
  </div>
</template>

<style scoped>
.sec-title {
  margin: 0 0 16px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.pp {
  margin: 0;
  font-size: var(--fs-13);
  color: var(--text-2);
}
.block-slot {
  flex: 1;
}
.block-pane {
  padding: 18px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-md);
  text-align: center;
  color: var(--text-3);
  font-size: var(--fs-13);
}
</style>
