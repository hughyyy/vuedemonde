<script setup lang="ts">
import { AppButton, AppDialog, AppInput, AppSelect, AppToggle } from "../kit";
import type { SelectOption } from "../kit";
import type { CalendarEvent, EventTint } from "./model";
import { EVENT_TINTS, fmtTime } from "./model";

const props = defineProps<{
  event: CalendarEvent | null;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  update: [patch: Partial<CalendarEvent>];
}>();

const TINTS: SelectOption[] = (Object.keys(EVENT_TINTS) as EventTint[]).map((t) => ({ value: t, label: t }));
</script>

<template>
  <AppDialog :open="open" title="Event details" size="sm" @close="emit('close')">
    <template v-if="event">
      <div class="ev-dialog">
        <AppInput
          :model-value="event.title"
          label="Title"
          @update:model-value="(v: string) => emit('update', { title: v })"
        />
        <div class="ev-dialog__time">
          <span class="ev-dialog__label">When</span>
          <span class="ev-dialog__value">
            <template v-if="event.allDay">All day</template>
            <template v-else>{{ fmtTime(event.start) }} – {{ fmtTime(event.end) }}</template>
          </span>
        </div>
        <AppInput
          :model-value="event.location ?? ''"
          label="Location"
          placeholder="Room, link…"
          @update:model-value="(v: string) => emit('update', { location: v || undefined })"
        />
        <AppSelect
          :model-value="event.tint ?? 'indigo'"
          label="Colour"
          :options="TINTS"
          @update:model-value="(v: string) => emit('update', { tint: v as EventTint })"
        />
        <AppToggle
          :model-value="!!event.allDay"
          label="All-day"
          @update:model-value="(v: boolean) => emit('update', { allDay: v })"
        />
      </div>
    </template>
    <template #footer>
      <AppButton variant="ghost" @click="emit('close')">Done</AppButton>
    </template>
  </AppDialog>
</template>

<style scoped>
.ev-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.ev-dialog__time {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-2);
}
.ev-dialog__label {
  font: 500 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
}
.ev-dialog__value {
  font: 500 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
</style>
