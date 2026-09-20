<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
import type { OrgNode } from "./types";

defineOptions({ name: "OrgNodeView" });

const props = defineProps<{
  node: OrgNode;
  level: number;
  selectable: boolean;
  selectedId?: string;
}>();

const emit = defineEmits<{ select: [id: string] }>();
</script>

<template>
  <div class="org-node">
    <button
      class="org-node__box"
      :class="[`is-${node.tint ?? 'accent'}`, { 'has-children': !!node.children?.length, 'is-selected': selectable && selectedId === node.id }]"
      type="button"
      @click="emit('select', node.id)"
    >
      <span v-if="node.icon" class="org-node__icon"><AppIcon :name="node.icon" :size="16" /></span>
      <span class="org-node__text">
        <span class="org-node__label">{{ node.label }}</span>
        <span v-if="node.role" class="org-node__role">{{ node.role }}</span>
      </span>
    </button>

    <div v-if="node.children?.length" class="org-node__children">
      <OrgNodeView
        v-for="c in node.children"
        :key="c.id"
        :node="c"
        :level="level + 1"
        :selectable="selectable"
        :selected-id="selectedId"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.org-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.org-node__box {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 120px;
  max-width: 210px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-card);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  z-index: 1;
}
.org-node__box:hover {
  box-shadow: var(--shadow-raised);
}
.org-node__box.has-children::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  width: 1px;
  height: 14px;
  background: var(--line);
}
.org-node__box.is-accent .org-node__icon {
  color: var(--accent);
}
.org-node__box.is-ok .org-node__icon {
  color: var(--ok);
}
.org-node__box.is-info .org-node__icon {
  color: var(--info);
}
.org-node__box.is-warn .org-node__icon {
  color: var(--warn);
}
.org-node__box.is-selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.org-node__icon {
  display: grid;
  place-items: center;
  flex: none;
}
.org-node__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.org-node__label {
  font: 500 var(--fs-13)/1.4 var(--font-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.org-node__role {
  font: 400 var(--fs-11)/1.4 var(--font-body);
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.org-node__children {
  position: relative;
  display: flex;
  gap: var(--space-4);
  padding-top: 14px;
}
.org-node__children::before {
  content: "";
  position: absolute;
  top: 0;
  left: 8px;
  right: 8px;
  height: 1px;
  background: var(--line);
}
.org-node__children > .org-node::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 14px;
  background: var(--line);
}
</style>
