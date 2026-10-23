<script setup lang="ts">
/**
 * AppVirtualList — dynamic-height virtualiser for the transcript.
 *
 * Rows are measured after render (ResizeObserver + item refs) and the window is
 * derived from cumulative offsets, so variable-height turns scroll correctly
 * without reflowing completed rows. Kit component: additive, upstreamable.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    items: readonly unknown[];
    /** Height guess before a row is measured. */
    estimate?: number;
    /** Rows rendered beyond the viewport on each side. */
    overscan?: number;
  }>(),
  { estimate: 120, overscan: 3 },
);

const container = ref<HTMLElement | null>(null);
const itemEls = ref<HTMLElement[]>([]);
const heights = ref<number[]>([]);
const scrollTop = ref(0);
const viewport = ref(600);

const offsets = computed(() => {
  const result: number[] = [];
  let total = 0;
  for (let index = 0; index < props.items.length; index += 1) {
    result.push(total);
    total += heights.value[index] ?? props.estimate;
  }
  result.push(total);
  return result;
});

const start = computed(() => {
  let index = 0;
  while (index < props.items.length && offsets.value[index + 1]! <= scrollTop.value) index += 1;
  return Math.max(0, index - props.overscan);
});

const end = computed(() => {
  let index = start.value;
  const limit = scrollTop.value + viewport.value;
  while (index < props.items.length && offsets.value[index]! < limit) index += 1;
  return Math.min(props.items.length, index + props.overscan);
});

function measure(): void {
  itemEls.value.forEach((element, position) => {
    if (element === null) return;
    heights.value[start.value + position] = element.offsetHeight;
  });
}

function onScroll(): void {
  scrollTop.value = container.value?.scrollTop ?? 0;
}

watch([start, end, () => props.items], () => {
  void nextTick(measure);
});

let observer: ResizeObserver | undefined;
onMounted(() => {
  viewport.value = container.value?.clientHeight ?? 600;
  observer = new ResizeObserver(() => {
    viewport.value = container.value?.clientHeight ?? 600;
    measure();
  });
  if (container.value !== null) observer.observe(container.value);
  void nextTick(measure);
});
onUnmounted(() => observer?.disconnect());
</script>

<template>
  <div ref="container" class="app-vlist" @scroll.passive="onScroll">
    <div class="app-vlist__spacer" :style="{ height: `${offsets[items.length] ?? 0}px` }">
      <div class="app-vlist__window" :style="{ transform: `translateY(${offsets[start] ?? 0}px)` }">
        <div
          v-for="(item, position) in items.slice(start, end)"
          :key="start + position"
          ref="itemEls"
          class="app-vlist__item"
        >
          <!-- Named for consistency with VirtualScroller's `#item`; the default
               slot stays available so existing `<AppVirtualList>` usages that
               pass bare children keep working. -->
          <slot name="item" :item="item" :index="start + position">
            <slot :item="item" :index="start + position" />
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-vlist {
  position: relative;
  height: 100%;
  overflow-y: auto;
}
.app-vlist__spacer {
  position: relative;
  width: 100%;
}
.app-vlist__window {
  position: absolute;
  inset: 0 0 auto 0;
}
.app-vlist__item {
  min-height: 1px;
}
</style>
