<script setup lang="ts">
import { ref } from "vue";
import { AppIcon } from "./index";

export type CascadeOption = { value: string; label: string; children?: CascadeOption[] };

/** CascadeSelect — pick from a nested option tree along a breadcrumb path. */

const props = withDefaults(
  defineProps<{
    options: CascadeOption[];
    modelValue?: string;
    placeholder?: string;
    width?: number;
  }>(),
  { placeholder: "Select…", width: 240 },
);

const emit = defineEmits<{ "update:modelValue": [v: string] }>();

const open = ref(false);
const triggerEl = ref<HTMLElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const pos = ref({ top: "-9999px", left: "-9999px" });
const level = ref<CascadeOption[]>(props.options);
const selectedPath = ref<CascadeOption[]>([]);

function findChain(opts: CascadeOption[], id: string): CascadeOption[] {
  for (const o of opts) {
    if (o.value === id) return [o];
    if (o.children?.length) {
      const sub = findChain(o.children, id);
      if (sub.length) return [o, ...sub];
    }
  }
  return [];
}

function place(): void {
  const t = triggerEl.value;
  if (!t) return;
  const r = t.getBoundingClientRect();
  pos.value = { top: `${Math.round(r.bottom + 4)}px`, left: `${Math.max(8, Math.min(r.left, window.innerWidth - props.width - 8))}px` };
}

function toggle(): void {
  open.value = !open.value;
  if (open.value) {
    level.value = selectedPath.value.length ? (selectedPath.value[selectedPath.value.length - 1]!.children ?? props.options) : props.options;
    place();
  }
}

function onPick(o: CascadeOption): void {
  if (o.children?.length) {
    level.value = o.children;
  } else {
    selectedPath.value = findChain(props.options, o.value);
    emit("update:modelValue", o.value);
    open.value = false;
  }
}

function goTo(i: number): void {
  const path = selectedPath.value.slice(0, i);
  const base = path.length ? path[path.length - 1]!.children ?? props.options : props.options;
  level.value = base;
}

function onGlobalDown(e: MouseEvent): void {
  if (!open.value) return;
  const t = e.target as Node;
  if (panelEl.value?.contains(t) || triggerEl.value?.contains(t)) return;
  open.value = false;
}

function onWindow(): void {
  if (open.value) open.value = false;
}

// global listeners registered at setup via a small helper
import { onBeforeUnmount, onMounted } from "vue";
onMounted(() => {
  document.addEventListener("mousedown", onGlobalDown);
  window.addEventListener("scroll", onWindow, true);
  window.addEventListener("resize", onWindow);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onGlobalDown);
  window.removeEventListener("scroll", onWindow, true);
  window.removeEventListener("resize", onWindow);
});

const label = () => selectedPath.value.map((o) => o.label).join(" / ");
</script>

<template>
  <div class="cascade-select">
    <button ref="triggerEl" class="cascade-select__trigger" type="button" :aria-haspopup="'listbox'" :aria-expanded="open" @click="toggle">
      <span class="cascade-select__value" :class="{ 'is-empty': !selectedPath.length }">{{ selectedPath.length ? label() : placeholder }}</span>
      <AppIcon name="chevron-down" :size="13" class="cascade-select__chevron" />
    </button>

    <Teleport to="body">
      <Transition name="menu-pop">
        <div v-if="open" ref="panelEl" class="cascade-select__panel" role="listbox" :style="pos" @keydown.esc="open = false">
          <div v-if="selectedPath.length" class="cascade-select__crumbs">
            <button
              v-for="(p, i) in selectedPath"
              :key="p.value"
              type="button"
              @click="goTo(i)"
            >
              {{ p.label }}
            </button>
            <span class="cascade-select__crumb-arrow">›</span>
          </div>
          <ul class="cascade-select__list">
            <li
              v-for="o in level"
              :key="o.value"
              class="cascade-select__item"
              :class="{ 'is-leaf': !o.children?.length }"
              @click="onPick(o)"
            >
              <span class="cascade-select__label">{{ o.label }}</span>
              <AppIcon v-if="o.children?.length" name="chevron-right" :size="13" class="cascade-select__arrow" />
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.cascade-select {
  display: inline-flex;
}
.cascade-select__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-width: 200px;
  max-width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 400 var(--fs-14)/1.4 var(--font-body);
  cursor: pointer;
}
.cascade-select__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cascade-select__value.is-empty {
  color: var(--text-3);
}
.cascade-select__chevron {
  color: var(--text-3);
}
.cascade-select__panel {
  position: fixed;
  z-index: 1200;
  width: 240px;
  padding: var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
  max-height: 320px;
  overflow-y: auto;
}
.cascade-select__crumbs {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: wrap;
  padding: var(--space-1) var(--space-2);
  border-bottom: 1px solid var(--divider);
  margin-bottom: var(--space-1);
}
.cascade-select__crumbs button {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--accent);
  font: 400 var(--fs-12)/1.6 var(--font-body);
  cursor: pointer;
}
.cascade-select__crumb-arrow {
  color: var(--text-3);
}
.cascade-select__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.cascade-select__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--text);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  cursor: pointer;
}
.cascade-select__item:hover {
  background: var(--surface-2);
}
.cascade-select__item.is-leaf:hover {
  background: var(--accent-soft);
  color: var(--accent);
}
.cascade-select__arrow {
  color: var(--text-3);
}
</style>
