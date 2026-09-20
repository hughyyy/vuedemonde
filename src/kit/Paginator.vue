<script setup lang="ts">
import { computed } from "vue";
import AppIcon from "./AppIcon.vue";

const props = withDefaults(
  defineProps<{
    /** 0-based current page. */
    page: number;
    pageCount: number;
    /** display "a–b of N". */
    total?: number;
    pageSize?: number;
    size?: "sm" | "md";
  }>(),
  { total: 0, pageSize: 0, size: "md" },
);

const emit = defineEmits<{ "update:page": [page: number] }>();

/** Page numbers to show, with `null` acting as ellipsis. */
const window = computed<(number | null)[]>(() => {
  const n = props.pageCount;
  if (n <= 7) return Array.from({ length: n }, (_, i) => i);
  const cur = props.page;
  const pages = new Set<number | null>([0, n - 1, cur - 1, cur, cur + 1]);
  const sorted = Array.from(pages)
    .filter((p): p is number => typeof p === "number" && p >= 0 && p < n)
    .sort((a, b) => a - b);
  const out: (number | null)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i]!;
    if (i > 0 && p - sorted[i - 1]! > 1) out.push(null);
    out.push(p);
  }
  return out;
});

const rangeInfo = computed(() => {
  if (!props.total || !props.pageSize) return "";
  const from = props.page * props.pageSize + 1;
  const to = Math.min(from + props.pageSize - 1, props.total);
  return `${from}–${to} of ${props.total}`;
});
</script>

<template>
  <nav class="paginator" :class="`is-${size}`" aria-label="Pagination">
    <button
      class="paginator__btn"
      type="button"
      aria-label="Previous page"
      :disabled="page <= 0"
      @click="emit('update:page', page - 1)"
    >
      <AppIcon name="chevron-left" :size="14" />
    </button>

    <template v-for="(p, i) in window" :key="p === null ? `e${i}` : p">
      <button
        v-if="p !== null"
        class="paginator__num"
        :class="{ 'is-active': p === page }"
        type="button"
        :aria-current="p === page ? 'page' : undefined"
        @click="emit('update:page', p)"
      >
        {{ p + 1 }}
      </button>
      <span v-else class="paginator__ellipsis">…</span>
    </template>

    <button
      class="paginator__btn"
      type="button"
      aria-label="Next page"
      :disabled="page >= pageCount - 1"
      @click="emit('update:page', page + 1)"
    >
      <AppIcon name="chevron-right" :size="14" />
    </button>

    <span v-if="rangeInfo" class="paginator__info">{{ rangeInfo }}</span>
  </nav>
</template>

<style scoped>
.paginator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
.paginator.is-sm .paginator__btn,
.paginator.is-sm .paginator__num {
  min-width: 24px;
  height: 24px;
  font-size: var(--fs-12);
}
.paginator__btn,
.paginator__num {
  display: inline-grid;
  place-items: center;
  min-width: 28px;
  height: 28px;
  padding: 0 var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text-2);
  font: 500 var(--fs-13)/1 var(--font-body);
  cursor: pointer;
  transition: background var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
}
.paginator__btn:hover:not(:disabled),
.paginator__num:hover {
  background: var(--surface-2);
  color: var(--text);
  border-color: var(--line-strong);
}
.paginator__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.paginator__num.is-active {
  background: var(--accent-gradient);
  border-color: transparent;
  color: var(--accent-ink);
}
.paginator__ellipsis {
  color: var(--text-3);
  padding: 0 2px;
}
.paginator__info {
  margin-left: var(--space-2);
  font: 400 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
</style>
