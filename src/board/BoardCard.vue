<script setup lang="ts">
import { ref } from "vue";
import type { TaskCard } from "./model";
import { priorityTint } from "./model";
import { startBoardDrag } from "./useDragDrop";
import { AppBadge, AppChip, AppIcon, AvatarStack } from "../kit";

const props = defineProps<{
  card: TaskCard;
  /** owning drop-zone id (column or lane). */
  zoneId: string;
}>();

const emit = defineEmits<{ open: [] }>();

const rootEl = ref<HTMLElement | null>(null);

let down: { x: number; y: number } | null = null;

function onPointerDown(e: PointerEvent): void {
  // never start a drag from an interactive element inside the card
  const target = e.target as HTMLElement;
  if (target.closest("button, a, input, select, textarea, .app-menu")) return;
  if (e.button !== 0) return;
  down = { x: e.clientX, y: e.clientY };
  if (!rootEl.value) return;
  startBoardDrag(rootEl.value, props.card.id, props.zoneId, e);
}

/** A plain click (no real drag) opens the card detail dialog. */
function onClick(e: MouseEvent): void {
  const dist = down ? Math.hypot(e.clientX - down.x, e.clientY - down.y) : 0;
  down = null;
  if (dist < 6) emit("open");
}
</script>

<template>
  <article
    ref="rootEl"
    class="board-card"
    :data-card-id="card.id"
    role="button"
    tabindex="0"
    @pointerdown="onPointerDown"
    @click="onClick"
    @keydown.enter.prevent="emit('open')"
    @keydown.space.prevent="emit('open')"
  >
    <div v-if="card.tags.length" class="board-card__tags">
      <AppChip v-for="t in card.tags" :key="t" class="board-card__tag">{{ t }}</AppChip>
    </div>
    <p class="board-card__title">{{ card.title }}</p>
    <div class="board-card__foot">
      <span class="board-card__badges">
        <AppBadge :tint="priorityTint(card.priority)">{{ card.priority }}</AppBadge>
        <AppChip v-if="card.due" class="board-card__due">{{ card.due }}</AppChip>
      </span>
      <AvatarStack v-if="card.assignees.length" :people="card.assignees" size="sm" />
    </div>
    <AppIcon name="more" :size="14" class="board-card__grip" />
  </article>
</template>

<style scoped>
.board-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-card);
  cursor: grab;
  transition: border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  user-select: none;
  touch-action: none;
}
.board-card:hover {
  border-color: var(--line-strong);
  box-shadow: var(--shadow-raised);
}
.board-card:active {
  cursor: grabbing;
}
.board-card__grip {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  color: var(--text-3);
  opacity: 0;
  transition: opacity var(--dur-1) var(--ease-out);
  pointer-events: none;
}
.board-card:hover .board-card__grip {
  opacity: 0.65;
}
.board-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.board-card__tag {
  font-size: var(--fs-11);
}
.board-card__title {
  margin: 0;
  font: 500 var(--fs-13)/1.45 var(--font-body);
  color: var(--text);
  overflow-wrap: anywhere;
}
.board-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.board-card__badges {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.board-card__due {
  font-size: var(--fs-11);
}
</style>
