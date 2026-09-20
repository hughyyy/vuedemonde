<script setup lang="ts">
import { AppIcon } from "./index";
import type { TimelineItem } from "./types";

withDefaults(
  defineProps<{
    items: TimelineItem[];
  }>(),
  {},
);
</script>

<template>
  <ol class="timeline">
    <li v-for="(it, i) in items" :key="it.id" class="timeline__entry">
      <span class="timeline__rail" aria-hidden="true">
        <span class="timeline__dot" :class="it.tint ? `is-${it.tint}` : ''">
          <AppIcon v-if="it.icon" :name="it.icon" :size="11" />
        </span>
        <span v-if="i < items.length - 1" class="timeline__line" />
      </span>
      <div class="timeline__body">
        <div class="timeline__head">
          <span class="timeline__title">{{ it.title }}</span>
          <span v-if="it.time" class="timeline__time">{{ it.time }}</span>
        </div>
        <p v-if="it.content" class="timeline__content">{{ it.content }}</p>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.timeline__entry {
  display: flex;
  gap: var(--space-3);
}
.timeline__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: none;
  width: 24px;
}
.timeline__dot {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  color: var(--text-3);
  border: 1px solid var(--line);
  flex: none;
}
.timeline__dot.is-ok {
  background: var(--ok-soft);
  color: var(--ok);
  border-color: transparent;
}
.timeline__dot.is-warn {
  background: var(--warn-soft);
  color: var(--warn);
  border-color: transparent;
}
.timeline__dot.is-err {
  background: var(--err-soft);
  color: var(--err);
  border-color: transparent;
}
.timeline__dot.is-info {
  background: var(--info-soft);
  color: var(--info);
  border-color: transparent;
}
.timeline__dot.is-run {
  background: var(--run-soft);
  color: var(--run);
  border-color: transparent;
}
.timeline__dot.is-accent {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: transparent;
}
.timeline__line {
  flex: 1;
  width: 2px;
  margin: 2px 0;
  background: var(--divider);
}
.timeline__body {
  padding-bottom: var(--space-4);
  min-width: 0;
}
.timeline__head {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}
.timeline__title {
  font: 500 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
}
.timeline__time {
  font: 400 var(--fs-11)/1.4 var(--font-body);
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
.timeline__content {
  margin: var(--space-1) 0 0;
  font: 400 var(--fs-12)/1.5 var(--font-body);
  color: var(--text-2);
}
</style>
