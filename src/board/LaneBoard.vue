<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { LaneDef, Priority, TaskCard } from "./model";
import { seedLanes } from "./model";
import { setBoardDropHandler, useBoardDrag } from "./useDragDrop";
import BoardCard from "./BoardCard.vue";
import TaskDialog from "./TaskDialog.vue";
import { AppBadge, AppIcon } from "../kit";

/**
 * LaneBoard — the horizontal-lane board ("Field Operations" view).
 * Lanes are horizontal bands (team/project rows) with a header (title,
 * subtitle, summary) and a left→right card row; drag-and-drop reuses the same
 * drag engine as TaskBoard (horizontal drop indexing).
 */
const { state } = useBoardDrag();

const lanes = ref<LaneDef[]>(seedLanes());
const indicator = computed(() => state.indicator);

/* --- card detail dialog (shared with TaskBoard) --- */
const selected = ref<TaskCard | null>(null);
const dialogOpen = ref(false);

function openCard(card: TaskCard): void {
  selected.value = card;
  dialogOpen.value = true;
}

function closeCard(): void {
  dialogOpen.value = false;
  selected.value = null;
}

function applyPatch(patch: Partial<TaskCard>): void {
  if (selected.value) Object.assign(selected.value, patch);
}

function isOver(id: string): boolean {
  return indicator.value?.zoneId === id;
}

function isDropAt(id: string, i: number): boolean {
  const ind = indicator.value;
  return !!ind && ind.zoneId === id && ind.index === i;
}

function addCard(laneId: string): void {
  const lane = lanes.value.find((l) => l.id === laneId);
  if (!lane) return;
  lane.cards.push({
    id: `new-${Date.now()}-${lane.cards.length + 1}`,
    title: "Untitled card",
    tags: [],
    priority: "P3" as Priority,
    assignees: [],
  });
}

function moveCard(target: { toZoneId: string; index: number }): void {
  const drag = state.drag;
  if (!drag) return;
  const from = lanes.value.find((l) => l.id === drag.fromZoneId);
  if (!from) return;
  const iFrom = from.cards.findIndex((c) => c.id === drag.cardId);
  if (iFrom < 0) return;
  const [card] = from.cards.splice(iFrom, 1);
  const to = lanes.value.find((l) => l.id === target.toZoneId) ?? from;
  let idx = target.index;
  if (to.id === from.id && idx > iFrom) idx -= 1;
  idx = Math.max(0, Math.min(idx, to.cards.length));
  to.cards.splice(idx, 0, card);
}

onMounted(() => setBoardDropHandler(moveCard));
onBeforeUnmount(() => setBoardDropHandler(null));
</script>

<template>
  <div class="lane-board">
    <section
      v-for="lane in lanes"
      :key="lane.id"
      class="lane"
      :class="{ 'is-over': isOver(lane.id) }"
      :data-drop-zone="lane.id"
      :style="{ '--lane-accent': lane.accent }"
    >
      <header class="lane__head">
        <span class="lane__mark" aria-hidden="true" />
        <div class="lane__titles">
          <h3 class="lane__title">{{ lane.title }}</h3>
          <p v-if="lane.subtitle" class="lane__subtitle">{{ lane.subtitle }}</p>
        </div>
        <span v-if="lane.summary?.length" class="lane__summary">
          <span v-for="s in lane.summary" :key="s.label" class="lane__stat">
            <AppBadge :tint="s.tint ?? 'neutral'">{{ s.value }}</AppBadge>
            <span class="lane__stat-label">{{ s.label }}</span>
          </span>
        </span>
        <span class="lane__spacer" />
        <button
          class="lane__add"
          type="button"
          :aria-label="`Add card to ${lane.title}`"
          @click="addCard(lane.id)"
        >
          <AppIcon name="plus" :size="14" />
        </button>
      </header>

      <div class="lane__cards" :class="{ 'is-over': isOver(lane.id) }" data-card-list data-orientation="horizontal">
        <template v-for="(card, i) in lane.cards" :key="card.id">
          <div v-if="isDropAt(lane.id, i)" class="lane__drop" />
          <BoardCard :card="card" :zone-id="lane.id" @open="openCard(card)" />
        </template>
        <div v-if="isDropAt(lane.id, lane.cards.length)" class="lane__drop" />
        <div v-if="!lane.cards.length" class="lane__empty">Drop cards here</div>
      </div>
    </section>

    <TaskDialog :card="selected" :open="dialogOpen" @close="closeCard" @update="applyPatch" />
  </div>
</template>

<style scoped>
.lane-board {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
  overflow-y: auto;
}
.lane {
  border: 1px solid var(--line);
  border-left: 3px solid var(--lane-accent);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  flex: none;
}
.lane__head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
}
.lane__mark {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--lane-accent);
}
.lane__titles {
  min-width: 0;
}
.lane__title {
  margin: 0;
  font: 600 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lane__subtitle {
  margin: 0;
  font: 400 var(--fs-11)/1.4 var(--font-body);
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lane__summary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: var(--space-3);
}
.lane__stat {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font: 400 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-3);
  white-space: nowrap;
}
.lane__spacer {
  flex: 1;
}
.lane__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
}
.lane__add:hover {
  background: var(--surface-2);
  color: var(--text);
}
.lane__cards {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  overflow-x: auto;
  min-height: 60px;
  border-top: 1px solid var(--divider);
}
.lane__cards.is-over {
  background: var(--accent-soft);
}
.lane__cards :deep(.board-card) {
  width: 260px;
  flex: none;
}
.lane__drop {
  flex: none;
  align-self: stretch;
  width: 4px;
  margin: 0 2px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}
.lane__empty {
  padding: var(--space-4) var(--space-2);
  border: 1px dashed var(--line);
  border-radius: var(--radius-md);
  color: var(--text-3);
  font: 400 var(--fs-12)/1.4 var(--font-body);
  text-align: center;
  flex: 1;
}
</style>
