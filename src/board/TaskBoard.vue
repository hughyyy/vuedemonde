<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { BoardColumnDef, Priority, TaskCard } from "./model";
import { seedBoard } from "./model";
import { setBoardDropHandler, useBoardDrag } from "./useDragDrop";
import BoardColumn from "./BoardColumn.vue";
import TaskDialog from "./TaskDialog.vue";

/**
 * TaskBoard — the kanban surface. Owns the board state (columns, collapse,
 * add, move) and the card-detail dialog; registers the single drag-drop
 * handler consumed by cards.
 */
const { state } = useBoardDrag();

const columns = ref<BoardColumnDef[]>(seedBoard());
const collapsed = ref<Set<string>>(new Set());

/* --- card detail dialog --- */
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

/** Edits in the dialog patch the live card object → board re-renders. */
function applyPatch(patch: Partial<TaskCard>): void {
  if (selected.value) Object.assign(selected.value, patch);
}

function isCollapsed(id: string): boolean {
  return collapsed.value.has(id);
}

function toggleCollapse(id: string): void {
  const s = new Set(collapsed.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  collapsed.value = s;
}

function addCard(colId: string): void {
  const col = columns.value.find((c) => c.id === colId);
  if (!col) return;
  col.cards.push({
    id: `new-${Date.now()}-${col.cards.length + 1}`,
    title: "Untitled card",
    tags: [],
    priority: "P3" as Priority,
    assignees: [],
  });
}

function moveCard(target: { toZoneId: string; index: number }): void {
  const drag = state.drag;
  if (!drag) return;
  const from = columns.value.find((c) => c.id === drag.fromZoneId);
  if (!from) return;
  const iFrom = from.cards.findIndex((c) => c.id === drag.cardId);
  if (iFrom < 0) return;
  const [card] = from.cards.splice(iFrom, 1);
  const to = columns.value.find((c) => c.id === target.toZoneId) ?? from;
  let idx = target.index;
  if (to.id === from.id && idx > iFrom) idx -= 1;
  idx = Math.max(0, Math.min(idx, to.cards.length));
  to.cards.splice(idx, 0, card);
}

onMounted(() => setBoardDropHandler(moveCard));
onBeforeUnmount(() => setBoardDropHandler(null));
</script>

<template>
  <div class="board">
    <div class="board__track">
      <BoardColumn
        v-for="col in columns"
        :key="col.id"
        :column="col"
        :collapsed="isCollapsed(col.id)"
        @toggle-collapse="toggleCollapse(col.id)"
        @add-card="addCard(col.id)"
        @open="openCard($event)"
      />
    </div>

    <TaskDialog :card="selected" :open="dialogOpen" @close="closeCard" @update="applyPatch" />
  </div>
</template>

<style scoped>
.board {
  height: 100%;
  min-height: 0;
}
.board__track {
  display: flex;
  gap: var(--space-3);
  height: 100%;
  overflow-x: auto;
  padding-bottom: var(--space-2);
}
</style>
