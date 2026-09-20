<script setup lang="ts" generic="T">
import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * VirtualScroller — windows a large flat list into the visible rows only.
 * Rows are absolutely positioned in a full-height spacer; the parent (or a
 * fixed height prop) provides the scrolling viewport. Generic over `T`, so the
 * scoped slot's `item` is typed for the caller's row shape.
 */

const props = withDefaults(
  defineProps<{
    items: T[];
    itemHeight?: number;
    /** rows to render above/below the viewport. */
    overscan?: number;
    /** explicit viewport height (px); else fills the parent. */
    height?: number;
    rowClass?: string;
  }>(),
  { itemHeight: 36, overscan: 4 },
);

const viewportEl = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const viewH = ref(props.height ?? 0);

let ro: ResizeObserver | null = null;

function measure(): void {
  if (viewportEl.value) viewH.value = viewportEl.value.clientHeight;
}

onMounted(() => {
  measure();
  ro = new ResizeObserver(measure);
  if (viewportEl.value) ro.observe(viewportEl.value);
});
onBeforeUnmount(() => ro?.disconnect());

const total = () => props.items.length;

const start = () => Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan);
const end = () => Math.min(total(), Math.ceil((scrollTop.value + viewH.value) / props.itemHeight) + props.overscan);

function onScroll(): void {
  if (viewportEl.value) scrollTop.value = viewportEl.value.scrollTop;
}

/** Scroll the viewport so row `index` is visible (centred-ish). */
function scrollToIndex(index: number): void {
  if (viewportEl.value) {
    viewportEl.value.scrollTop = Math.max(0, index * props.itemHeight - viewportEl.value.clientHeight / 2);
    scrollTop.value = viewportEl.value.scrollTop;
  }
}

defineExpose({ scrollToIndex });
</script>

<template>
  <div
    ref="viewportEl"
    class="vscroll"
    :style="height ? { height: height + 'px' } : undefined"
    @scroll.passive="onScroll"
  >
    <div class="vscroll__spacer" :style="{ height: total() * itemHeight + 'px' }">
      <div
        v-for="i in end() - start()"
        :key="start() + i - 1"
        class="vscroll__row"
        :class="rowClass"
        :style="{ top: (start() + i - 1) * itemHeight + 'px', height: itemHeight + 'px' }"
      >
        <slot name="item" :item="items[start() + i - 1]" :index="start() + i - 1" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vscroll {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.vscroll__spacer {
  position: relative;
}
.vscroll__row {
  position: absolute;
  left: 0;
  right: 0;
  overflow: hidden;
}
</style>
