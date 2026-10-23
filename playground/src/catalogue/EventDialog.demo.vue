<script setup lang="ts">
/** Catalogue demo: the event dialog open on a populated event (opens when printing). */
import { ref } from "vue";
import { AppButton, EventDialog, ev, type CalendarEvent } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const event = ref<CalendarEvent | null>(
  ev("design", "Design review — tokens", new Date(2026, 0, 5, 11, 0), new Date(2026, 0, 5, 12, 0), "rose", false, "Studio"),
);
const open = ref(false);

if (props.print) open.value = true;

function applyPatch(patch: Partial<CalendarEvent>): void {
  if (event.value) Object.assign(event.value, patch);
}
</script>

<template>
  <div class="cat-demo">
    <EventDialog :event="event" :open="open" @close="open = false" @update="applyPatch" />
    <div class="cat-row">
      <AppButton size="sm" variant="secondary" @click="open = true">Open event</AppButton>
      <span class="cat-label">title, time, location and tint are editable</span>
    </div>
  </div>
</template>
