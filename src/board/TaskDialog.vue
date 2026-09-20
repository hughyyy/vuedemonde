<script setup lang="ts">
import { ref } from "vue";
import {
  AppAvatar,
  AppButton,
  AppChip,
  AppDialog,
  AppIcon,
  AppInput,
  AppSelect,
  AppTextarea,
} from "../kit";
import type { SelectOption } from "../kit";
import type { Priority, TaskCard } from "./model";

const props = defineProps<{
  card: TaskCard | null;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  update: [patch: Partial<TaskCard>];
}>();

const PRIORITIES: SelectOption[] = [
  { value: "P0", label: "P0 — critical" },
  { value: "P1", label: "P1 — high" },
  { value: "P2", label: "P2 — normal" },
  { value: "P3", label: "P3 — low" },
];

const newTag = ref("");
const newAssignee = ref("");

function addTag(): void {
  const t = newTag.value.trim();
  if (t && props.card) emit("update", { tags: [...props.card.tags, t] });
  newTag.value = "";
}

function removeTag(i: number): void {
  if (!props.card) return;
  const tags = props.card.tags.filter((_, x) => x !== i);
  emit("update", { tags });
}

function addAssignee(): void {
  const name = newAssignee.value.trim();
  if (name && props.card) emit("update", { assignees: [...props.card.assignees, { name }] });
  newAssignee.value = "";
}

function removeAssignee(i: number): void {
  if (!props.card) return;
  emit("update", { assignees: props.card.assignees.filter((_, x) => x !== i) });
}
</script>

<template>
  <AppDialog :open="open" title="Task details" size="md" @close="emit('close')">
    <template v-if="card">
      <div class="task-dialog">
        <AppInput
          :model-value="card.title"
          label="Title"
          @update:model-value="(v: string) => emit('update', { title: v })"
        />
        <AppTextarea
          :model-value="card.description ?? ''"
          label="Description"
          :rows="4"
          @update:model-value="(v: string) => emit('update', { description: v })"
        />
        <div class="task-dialog__grid">
          <AppSelect
            :model-value="card.priority"
            label="Priority"
            :options="PRIORITIES"
            @update:model-value="(v: string) => emit('update', { priority: v as Priority })"
          />
          <AppInput
            :model-value="card.due ?? ''"
            label="Due"
            placeholder="YYYY-MM-DD"
            @update:model-value="(v: string) => emit('update', { due: v || undefined })"
          />
        </div>

        <div class="task-dialog__field">
          <span class="task-dialog__label">Tags</span>
          <div v-if="card.tags.length" class="task-dialog__chips">
            <AppChip v-for="(t, i) in card.tags" :key="t" closable @close="removeTag(i)">{{ t }}</AppChip>
          </div>
          <div class="task-dialog__add">
            <AppInput
              v-model="newTag"
              size="sm"
              placeholder="Add tag…"
              @keydown.enter.prevent="addTag"
            />
            <AppButton variant="ghost" size="sm" icon="plus" @click="addTag">Tag</AppButton>
          </div>
        </div>

        <div class="task-dialog__field">
          <span class="task-dialog__label">Assignees</span>
          <div class="task-dialog__asg">
            <div v-for="(a, i) in card.assignees" :key="a.name" class="task-dialog__asg-row">
              <AppAvatar :name="a.name" size="sm" />
              <span class="task-dialog__asg-name">{{ a.name }}</span>
              <button class="task-dialog__asg-remove" type="button" :aria-label="`Remove ${a.name}`" @click="removeAssignee(i)">
                <AppIcon name="close" :size="10" />
              </button>
            </div>
          </div>
          <div class="task-dialog__add">
            <AppInput
              v-model="newAssignee"
              size="sm"
              placeholder="Add assignee…"
              @keydown.enter.prevent="addAssignee"
            />
            <AppButton variant="ghost" size="sm" icon="plus" @click="addAssignee">Add</AppButton>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <AppButton variant="ghost" @click="emit('close')">Done</AppButton>
    </template>
  </AppDialog>
</template>

<style scoped>
.task-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.task-dialog__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.task-dialog__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.task-dialog__label {
  font: 500 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
}
.task-dialog__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.task-dialog__add {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  max-width: 320px;
}
.task-dialog__asg {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.task-dialog__asg-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  max-width: 320px;
}
.task-dialog__asg-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 400 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
}
.task-dialog__asg-remove {
  display: inline-flex;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
}
.task-dialog__asg-remove:hover {
  color: var(--err);
}
</style>
