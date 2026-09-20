<script setup lang="ts">
import { computed } from "vue";
import type { BoardColumnDef } from "./model";
import { useBoardDrag } from "./useDragDrop";
import BoardCard from "./BoardCard.vue";
import { AppIcon } from "../kit";

const props = defineProps<{
  column: BoardColumnDef;
  collapsed: boolean;
}>();

const emit = defineEmits<{ "toggle-collapse": []; "add-card": []; open: [card: BoardColumnDef["cards"][number]] }>();

const { state } = useBoardDrag();
const indicator = computed(() => state.indicator);
const isOver = computed(() => indicator.value?.zoneId === props.column.id);

function isDropAt(i: number): boolean {
  const ind = indicator.value;
  return !!ind && ind.zoneId === props.column.id && ind.index === i;
}
</script>

<template>
  <section
    class="board-col"
    :class="{ 'is-collapsed': collapsed, 'is-over': isOver }"
    :data-drop-zone="column.id"
    :style="{ '--col-accent': column.accent }"
  >
    <header class="board-col__head">
      <h3 class="board-col__title">{{ column.title }}</h3>
      <span class="board-col__count">{{ column.cards.length }}</span>
      <span class="board-col__spacer" />
      <button
        class="board-col__act"
        type="button"
        :aria-label="`Collapse ${column.title} column`"
        @click="emit('toggle-collapse')"
      >
        <AppIcon name="chevron-down" :size="14" class="board-col__chevron" :class="{ 'is-open': !collapsed }" />
      </button>
      <button
        class="board-col__act"
        type="button"
        :aria-label="`Add card to ${column.title}`"
        @click="emit('add-card')"
      >
        <AppIcon name="plus" :size="14" />
      </button>
    </header>

    <div v-if="!collapsed" class="board-col__cards" data-card-list data-orientation="vertical">
      <template v-for="(card, i) in column.cards" :key="card.id">
        <div v-if="isDropAt(i)" class="board-col__drop" />
        <BoardCard :card="card" :zone-id="column.id" @open="emit('open', card)" />
      </template>
      <div v-if="isDropAt(column.cards.length)" class="board-col__drop" />
      <div v-if="!column.cards.length" class="board-col__empty">Drop cards here</div>
    </div>
    <div v-else class="board-col__collapsed" data-card-list data-orientation="vertical">{{ column.cards.length }}</div>
  </section>
</template>

<style scoped>
.board-col {
  display: flex;
  flex-direction: column;
  flex: none;
  width: 272px;
  max-height: 100%;
  border: 1px solid var(--line);
  border-top: 3px solid var(--col-accent);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
}
.board-col__head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
}
.board-col__title {
  margin: 0;
  font: 600 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.board-col__count {
  flex: none;
  min-width: 18px;
  padding: 0 var(--space-1);
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  color: var(--text-3);
  font: 600 var(--fs-11)/1.6 var(--font-body);
  text-align: center;
}
.board-col__spacer {
  flex: 1;
}
.board-col__act {
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
.board-col__act:hover {
  background: var(--surface-2);
  color: var(--text);
}
.board-col__chevron {
  transition: transform var(--dur-2) var(--ease-out);
}
.board-col__chevron.is-open {
  transform: rotate(180deg);
}
.board-col__cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2);
  overflow-y: auto;
  min-height: 60px;
}
.board-col.is-over .board-col__cards {
  background: var(--accent-soft);
}
.board-col__drop {
  height: 4px;
  margin: 0 2px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
  flex: none;
}
.board-col__empty {
  padding: var(--space-4) var(--space-2);
  border: 1px dashed var(--line);
  border-radius: var(--radius-md);
  color: var(--text-3);
  font: 400 var(--fs-12)/1.4 var(--font-body);
  text-align: center;
}
.board-col__collapsed {
  display: grid;
  place-items: center;
  min-height: 60px;
  color: var(--text-3);
  font: 600 var(--fs-13)/1.4 var(--font-body);
}
</style>
