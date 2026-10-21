<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  AppButton, AppDialog, AppMessage, AppTooltip, BlockUI, CommandMenu, ConfirmPopup,
  ContextMenu, Drawer, openDialog, Popover, ToastHost, confirm, notify,
  type CommandItem, type MenuAction,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

const props = defineProps<{ print?: boolean }>();

const dialogOpen = ref(false);
const drawerOpen = ref(false);
const popOpen = ref(false);
const cmdOpen = ref(false);
const blocked = ref(props.print); // print renders show the blocked mask state
const cp = ref<InstanceType<typeof ConfirmPopup> | null>(null);
const ctxHost = ref<HTMLElement | null>(null);

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

// Print/catalogue mode: open every overlay state so the render shows each
// component in its open state without any interaction. The CommandMenu stays
// closed (its full-screen backdrop would bury the other open states); it is
// trigger-driven live, like AppTooltip/BlockUI. Interactive mode keeps the
// trigger-button demos unchanged.
onMounted(() => {
  if (!props.print) return;
  dialogOpen.value = true;
  drawerOpen.value = true;
  popOpen.value = true;
  notify("ok", "Workflow saved");
  notify("err", "Connection to the runner was lost");
  void cp.value?.prompt();
  // ContextMenu opens on a contextmenu pointer event — synthesize one on its
  // wrapper so the anchored panel renders, positioned next to the trigger.
  const el = ctxHost.value?.querySelector(".context-menu");
  if (el) {
    const r = el.getBoundingClientRect();
    el.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: Math.min(r.left + 40, window.innerWidth - 200),
        clientY: r.bottom,
      }),
    );
  }
});
</script>

<template>
  <div class="wrap">
    <h2 class="sec-title">Overlays &amp; Feedback</h2>

    <DemoCard title="AppDialog" desc="Modal with focus trap, Escape-to-close, and a footer slot.">
      <div class="row">
        <AppButton @click="dialogOpen = true">Open dialog</AppButton>
        <AppDialog :open="dialogOpen" title="Edit workflow" size="md" @close="dialogOpen = false">
          <p class="pp">A focused modal shell: returns focus on close, traps Tab inside, closes on Escape.</p>
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
          <p class="pp">Slides in from the right with the token overlay and shadow.</p>
          <AppButton size="sm" variant="ghost" @click="drawerOpen = false">Close</AppButton>
        </Drawer>
      </div>
    </DemoCard>

    <DemoCard class="demo span-2" title="Popover / ConfirmPopup / ContextMenu" desc="Anchored floating panels — opened in print mode, trigger-driven live.">
      <div class="col">
        <!-- triggers spaced across the full-width card so the anchored panels
             open side by side instead of stacking (print render) -->
        <div class="row" style="justify-content: space-between; gap: 24px">
          <Popover v-model:open="popOpen" :width="240" placement="bottom">
            <template #trigger="{ toggle }">
              <AppButton variant="secondary" size="sm" @click="toggle">Popover</AppButton>
            </template>
            <p class="pp">A lightweight anchored panel. Everything is token-driven.</p>
          </Popover>

          <!-- in print the open dialog sits below the trigger row; opening the
               popup upward keeps the two states from covering each other -->
          <ConfirmPopup ref="cp" message="Archive this card?" confirm-label="Archive" :placement="print ? 'top' : 'bottom'">
            <AppButton variant="ghost" size="sm" danger @click="cp?.prompt()">Confirm popup</AppButton>
          </ConfirmPopup>

          <span ref="ctxHost" class="ctx-host">
            <ContextMenu :items="ctxItems" @select="(id: string) => notify('info', `Context menu → ${id}`)">
              <AppButton variant="ghost" size="sm" icon="more">Right-click me</AppButton>
            </ContextMenu>
          </span>
        </div>
      </div>
    </DemoCard>

    <DemoCard title="CommandMenu" desc="Search-style palette with groups and keyboard hints.">
      <div class="row">
        <AppButton icon="search" @click="cmdOpen = true">⌘K — command palette</AppButton>
        <CommandMenu :open="cmdOpen" :items="cmdItems" @update:open="cmdOpen = $event" @select="(id: string) => { cmdOpen = false; notify('ok', `Command: ${id}`); }" />
      </div>
    </DemoCard>

    <DemoCard class="demo span-2" title="ToastHost" desc="Fixed top-right stack — fire toasts live, or they pre-render in print mode.">
      <div class="col">
        <div class="row">
          <AppButton size="sm" @click="notify('ok', 'Workflow saved')">Notify ok</AppButton>
          <AppButton size="sm" variant="secondary" @click="notify('err', 'Connection lost')">Notify err</AppButton>
          <AppButton size="sm" variant="ghost" @click="notify('warn', 'Token expiring')">Notify warn</AppButton>
        </div>
        <ToastHost />
      </div>
    </DemoCard>

    <DemoCard title="AppTooltip" desc="Hover-only (also keyboard-focusable) — place your cursor over a button to reveal the bubble.">
      <div class="row">
        <AppTooltip text="Top tooltip" placement="top">
          <AppButton size="sm" variant="ghost">Hover top</AppButton>
        </AppTooltip>
        <AppTooltip text="Bottom tooltip" placement="bottom">
          <AppButton size="sm" variant="ghost">Hover bottom</AppButton>
        </AppTooltip>
        <AppTooltip text="Right tooltip" placement="right">
          <AppButton size="sm" variant="ghost">Right</AppButton>
        </AppTooltip>
        <AppTooltip text="Left tooltip" placement="left">
          <AppButton size="sm" variant="ghost">Left</AppButton>
        </AppTooltip>
      </div>
    </DemoCard>

    <DemoCard title="BlockUI" desc="Blocks interaction with an optional message — toggle to watch the pane go inert.">
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
.col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pp {
  margin: 0;
  font-size: var(--fs-13);
  color: var(--text-2);
}
.ctx-host {
  display: inline-flex;
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
