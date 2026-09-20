<script setup lang="ts">
import { AppIcon, Popover } from "./index";
import type { MenuAction, MenubarItem } from "./types";

const props = withDefaults(
  defineProps<{
    items: MenubarItem[];
  }>(),
  {},
);

const emit = defineEmits<{ select: [id: string] }>();

function onPick(action: MenuAction): void {
  emit("select", action.id);
}
</script>

<template>
  <nav class="menubar" role="menubar" aria-label="Menu">
    <template v-for="it in items" :key="it.id">
      <Popover v-if="it.children?.length" :align="'start'" placement="bottom">
        <template #trigger="{ toggle }">
          <button class="menubar__root" type="button" role="menuitem" @click="toggle">
            <AppIcon v-if="it.icon" :name="it.icon" :size="15" class="menubar__icon" />
            {{ it.label }}
            <AppIcon name="chevron-down" :size="11" class="menubar__caret" />
          </button>
        </template>
        <div class="menubar__panel">
          <button
            v-for="c in it.children!"
            :key="c.id"
            class="menubar__item"
            :class="{ 'is-danger': c.danger }"
            type="button"
            @click="onPick(c)"
          >
            <AppIcon v-if="c.icon" :name="c.icon" :size="14" class="menubar__item-icon" />
            <span class="menubar__item-label">{{ c.label }}</span>
          </button>
        </div>
      </Popover>
      <button v-else class="menubar__root" type="button" role="menuitem" @click="emit('select', it.id)">
        <AppIcon v-if="it.icon" :name="it.icon" :size="15" class="menubar__icon" />
        {{ it.label }}
      </button>
    </template>
  </nav>
</template>

<style scoped>
.menubar {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
}
.menubar__root {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  font: 500 var(--fs-13)/1.6 var(--font-body);
  cursor: pointer;
}
.menubar__root:hover {
  background: var(--surface-2);
  color: var(--text);
}
.menubar__caret {
  color: var(--text-3);
}
.menubar__panel {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 160px;
}
.menubar__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  text-align: left;
  cursor: pointer;
}
.menubar__item:hover {
  background: var(--surface-2);
}
.menubar__item.is-danger {
  color: var(--err);
}
.menubar__item-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
