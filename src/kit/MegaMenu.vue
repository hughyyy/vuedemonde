<script setup lang="ts">
import { AppIcon, Popover } from "./index";
import type { MegaItem } from "./types";

/** MegaMenu — horizontal bar where one item opens a wide multi-column panel. */

withDefaults(
  defineProps<{
    items: MegaItem[];
  }>(),
  {},
);

const emit = defineEmits<{ select: [id: string] }>();
</script>

<template>
  <nav class="mega" role="menubar" aria-label="Mega menu">
    <template v-for="it in items" :key="it.id">
      <Popover v-if="it.columns?.length" :align="'start'" :width="480" placement="bottom">
        <template #trigger="{ toggle, open }">
          <button class="mega__root" type="button" :aria-haspopup="'menu'" :aria-expanded="open" @click="toggle">
            <AppIcon v-if="it.icon" :name="it.icon" :size="15" />
            {{ it.label }}
          </button>
        </template>
        <div class="mega__panel">
          <section v-for="col in it.columns" :key="col.title ?? col.items[0]?.id" class="mega__col">
            <h4 v-if="col.title" class="mega__col-title">{{ col.title }}</h4>
            <button
              v-for="c in col.items"
              :key="c.id"
              class="mega__item"
              type="button"
              @click="emit('select', c.id)"
            >
              <AppIcon v-if="c.icon" :name="c.icon" :size="14" class="mega__item-icon" />
              {{ c.label }}
            </button>
          </section>
        </div>
      </Popover>
      <button v-else class="mega__root" type="button" @click="emit('select', it.id)">
        <AppIcon v-if="it.icon" :name="it.icon" :size="15" />
        {{ it.label }}
      </button>
    </template>
  </nav>
</template>

<style scoped>
.mega {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
}
.mega__root {
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
.mega__root:hover {
  background: var(--surface-2);
  color: var(--text);
}
.mega__panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
  min-width: 320px;
}
.mega__col {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.mega__col-title {
  margin: 0 0 var(--space-1);
  font: 600 var(--fs-11)/1.4 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3);
}
.mega__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-13)/1.6 var(--font-body);
  text-align: left;
  cursor: pointer;
}
.mega__item:hover {
  background: var(--surface-2);
}
.mega__item-icon {
  color: var(--text-3);
}
</style>
