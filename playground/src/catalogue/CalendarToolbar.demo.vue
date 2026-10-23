<script setup lang="ts">
/** Catalogue demo: the toolbar wired to local state, in the month and week shapes. */
import { computed, ref } from "vue";
import { CalendarToolbar, type CalendarViewId } from "@vuedemonde";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ORIGIN = new Date(2026, 0, 5);

const monthAnchor = ref(new Date(ORIGIN));
const monthView = ref<CalendarViewId>("traditional");
const weekAnchor = ref(new Date(ORIGIN));
const weekView = ref<CalendarViewId>("scheduler");

function step(view: "month" | "week", dir: 1 | -1): void {
  const anchor = view === "month" ? monthAnchor : weekAnchor;
  const v = view === "month" ? monthView : weekView;
  const next = new Date(anchor.value.getTime());
  if (v.value === "traditional") next.setMonth(next.getMonth() + dir);
  else if (v.value === "scheduler") next.setDate(next.getDate() + 7 * dir);
  else next.setDate(next.getDate() + dir);
  anchor.value = next;
}

function reset(view: "month" | "week"): void {
  if (view === "month") monthAnchor.value = new Date(ORIGIN);
  else weekAnchor.value = new Date(ORIGIN);
}

const monthTitle = computed(() => {
  const a = monthAnchor.value;
  const stem = `${MONTHS[a.getMonth()]} ${a.getDate()}`;
  if (monthView.value === "traditional") return `${MONTHS[a.getMonth()]} ${a.getFullYear()}`;
  if (monthView.value === "scheduler") return `Week of ${stem}`;
  return `${stem}, ${a.getFullYear()}`;
});

const weekTitle = computed(() => {
  const a = weekAnchor.value;
  const stem = `${MONTHS[a.getMonth()]} ${a.getDate()}`;
  if (weekView.value === "traditional") return `${MONTHS[a.getMonth()]} ${a.getFullYear()}`;
  if (weekView.value === "scheduler") return `Week of ${stem}`;
  return `${stem}, ${a.getFullYear()}`;
});
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <span class="cat-label">month</span>
      <CalendarToolbar
        :title="monthTitle"
        :view="monthView"
        @prev="step('month', -1)"
        @next="step('month', 1)"
        @today="reset('month')"
        @update:view="monthView = $event"
      />
    </div>
    <div class="cat-col">
      <span class="cat-label">week</span>
      <CalendarToolbar
        :title="weekTitle"
        :view="weekView"
        @prev="step('week', -1)"
        @next="step('week', 1)"
        @today="reset('week')"
        @update:view="weekView = $event"
      />
    </div>
  </div>
</template>
