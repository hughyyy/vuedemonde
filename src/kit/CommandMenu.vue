<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { AppIcon } from "./index";
import type { CommandItem } from "./types";

/** CommandMenu — command palette (⌘K style): filter + keyboard navigation. */

const props = withDefaults(
  defineProps<{
    open: boolean;
    items: CommandItem[];
    placeholder?: string;
  }>(),
  { placeholder: "Type a command…" },
);

const emit = defineEmits<{ "update:open": [v: boolean]; select: [id: string] }>();

const q = ref("");
const active = ref(0);

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  if (!s) return props.items;
  return props.items.filter((it) => it.label.toLowerCase().includes(s) || (it.keywords ?? "").toLowerCase().includes(s) || (it.group ?? "").toLowerCase().includes(s));
});

watch(
  () => props.open,
  (v) => {
    if (v) {
      q.value = "";
      active.value = 0;
      void (document.querySelector("[data-cmd-input]") as HTMLInputElement | null)?.focus();
    }
  },
);

function onKeydown(e: KeyboardEvent): void {
  const n = filtered.value.length;
  if (!n) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    active.value = (active.value + 1) % n;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    active.value = (active.value - 1 + n) % n;
  } else if (e.key === "Enter") {
    e.preventDefault();
    const it = filtered.value[active.value];
    if (it) emit("select", it.id);
  } else if (e.key === "Escape") {
    emit("update:open", false);
  }
}

function onPick(it: CommandItem): void {
  emit("select", it.id);
}

function onGlobal(e: KeyboardEvent): void {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    emit("update:open", !props.open);
  }
}

onMounted(() => window.addEventListener("keydown", onGlobal));
onBeforeUnmount(() => window.removeEventListener("keydown", onGlobal));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="cmd-menu" @mousedown.self="emit('update:open', false)">
        <div class="cmd-menu__box" role="dialog" aria-label="Commands">
          <div class="cmd-menu__search">
            <AppIcon name="search" :size="15" class="cmd-menu__search-icon" />
            <input
              v-model="q"
              data-cmd-input
              class="cmd-menu__input"
              type="text"
              :placeholder="placeholder"
              @keydown="onKeydown"
            />
          </div>
          <div v-if="filtered.length" class="cmd-menu__list">
            <button
              v-for="(it, i) in filtered"
              :key="it.id"
              class="cmd-menu__item"
              :class="{ 'is-active': i === active }"
              type="button"
              @mouseenter="active = i"
              @click="onPick(it)"
            >
              <AppIcon v-if="it.icon" :name="it.icon" :size="15" class="cmd-menu__item-icon" />
              <span class="cmd-menu__label">{{ it.label }}</span>
              <span v-if="it.group" class="cmd-menu__group">{{ it.group }}</span>
            </button>
          </div>
          <div v-else class="cmd-menu__empty">No commands match</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cmd-menu {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 12vh;
  background: var(--overlay);
}
.cmd-menu__box {
  width: min(560px, 90vw);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  box-shadow: var(--shadow-modal);
  overflow: hidden;
}
.cmd-menu__search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--line);
  color: var(--text-3);
}
.cmd-menu__input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-15)/1.4 var(--font-body);
}
.cmd-menu__input:focus {
  outline: none;
}
.cmd-menu__list {
  max-height: 320px;
  overflow-y: auto;
  padding: var(--space-1);
}
.cmd-menu__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  text-align: left;
  cursor: pointer;
}
.cmd-menu__item.is-active,
.cmd-menu__item:hover {
  background: var(--accent-soft);
}
.cmd-menu__item-icon {
  color: var(--text-3);
}
.cmd-menu__item.is-active .cmd-menu__item-icon {
  color: var(--accent);
}
.cmd-menu__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cmd-menu__group {
  font: 400 var(--fs-11)/1.4 var(--font-body);
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.cmd-menu__empty {
  padding: var(--space-5);
  text-align: center;
  color: var(--text-3);
  font: 400 var(--fs-13)/1.4 var(--font-body);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-2) var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
