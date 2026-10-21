<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { AppIcon } from "./index";

/** DatePicker — text trigger + popover month grid (self-contained). */

const props = withDefaults(
  defineProps<{
    modelValue?: string; // ISO yyyy-mm-dd
    placeholder?: string;
  }>(),
  { modelValue: "", placeholder: "Pick a date" },
);

const emit = defineEmits<{ "update:modelValue": [v: string] }>();

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const open = ref(false);
const anchor = ref(props.modelValue ? fromISO(props.modelValue) : new Date());
const triggerEl = ref<HTMLElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const pos = ref({ top: "-9999px", left: "-9999px" });

function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const label = computed(() => {
  if (!props.modelValue) return "";
  const d = fromISO(props.modelValue);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
});

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

const cells = computed(() => {
  const first = new Date(anchor.value.getFullYear(), anchor.value.getMonth(), 1);
  const s = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    return d;
  });
});

function place(): void {
  const t = triggerEl.value;
  if (!t) return;
  const r = t.getBoundingClientRect();
  const left = Math.max(8, Math.min(r.left, window.innerWidth - 300));
  pos.value = { top: `${Math.round(r.bottom + 4)}px`, left: `${Math.round(left)}px` };
}

function toggle(): void {
  open.value = !open.value;
  if (open.value) place();
}

function onPick(d: Date): void {
  emit("update:modelValue", toISO(d));
  open.value = false;
}

function nav(dir: 1 | -1): void {
  anchor.value = new Date(anchor.value.getFullYear(), anchor.value.getMonth() + dir, 1);
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

function onKeydown(e: KeyboardEvent): void {
  if (open.value && e.key === "Escape") open.value = false;
}

function isToday(d: Date): boolean {
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

onMounted(() => {
  document.addEventListener("mousedown", onGlobalDown);
  window.addEventListener("scroll", onWindow, true);
  window.addEventListener("resize", onWindow);
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onGlobalDown);
  window.removeEventListener("scroll", onWindow, true);
  window.removeEventListener("resize", onWindow);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="date-picker">
    <button ref="triggerEl" class="date-picker__trigger" type="button" :aria-haspopup="'dialog'" :aria-expanded="open" @click="toggle">
      <AppIcon name="calendar" :size="14" class="date-picker__icon" />
      <span class="date-picker__value" :class="{ 'is-empty': !label }">{{ label || placeholder }}</span>
      <AppIcon name="chevron-down" :size="12" class="date-picker__chevron" />
    </button>

    <Teleport to="body">
      <Transition name="menu-pop">
        <div v-if="open" ref="panelEl" class="date-picker__panel" role="dialog" :style="pos" @keydown.esc="open = false">
          <div class="date-picker__head">
            <button type="button" aria-label="Previous month" @click="nav(-1)"><AppIcon name="chevron-left" :size="13" /></button>
            <span class="date-picker__month">{{ MONTHS[anchor.getMonth()] }} {{ anchor.getFullYear() }}</span>
            <button type="button" aria-label="Next month" @click="nav(1)"><AppIcon name="chevron-right" :size="13" /></button>
          </div>
          <div class="date-picker__weekdays">
            <span v-for="d in DAYS" :key="d">{{ d }}</span>
          </div>
          <div class="date-picker__grid">
            <button
              v-for="(d, i) in cells"
              :key="i"
              class="date-picker__day"
              :class="{
                'is-outside': d.getMonth() !== anchor.getMonth(),
                'is-today': isToday(d),
                'is-selected': modelValue === toISO(d),
              }"
              type="button"
              @click="onPick(d)"
            >
              {{ d.getDate() }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.date-picker {
  display: inline-flex;
}
.date-picker__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 180px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 400 var(--fs-14)/1.4 var(--font-body);
  cursor: pointer;
}
.date-picker__icon {
  color: var(--text-3);
}
.date-picker__value {
  flex: 1;
  text-align: left;
}
.date-picker__value.is-empty {
  color: var(--text-3);
}
.date-picker__chevron {
  color: var(--text-3);
}
.date-picker__panel {
  position: fixed;
  z-index: 1200;
  width: 272px;
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
}
.date-picker__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}
.date-picker__head button {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
}
.date-picker__head button:hover {
  background: var(--surface-2);
}
.date-picker__month {
  font: 600 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
}
.date-picker__weekdays,
.date-picker__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.date-picker__weekdays span {
  text-align: center;
  font: 600 var(--fs-10)/1.6 var(--font-body);
  color: var(--text-3);
}
.date-picker__day {
  display: grid;
  place-items: center;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-12)/1 var(--font-body);
  cursor: pointer;
}
.date-picker__day:hover {
  background: var(--surface-2);
}
.date-picker__day.is-outside {
  color: var(--text-3);
}
.date-picker__day.is-today {
  box-shadow: inset 0 0 0 1px var(--accent);
}
.date-picker__day.is-selected {
  background: var(--accent-gradient);
  color: var(--accent-ink);
  font-weight: var(--fw-700);
}
</style>
