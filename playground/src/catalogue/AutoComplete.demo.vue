<script setup lang="ts">
/** Catalogue demo: suggestion field — the focused field is opened in print so
 *  the filtered panel lands in the capture. */
import { computed, nextTick, onMounted, ref } from "vue";
import { AutoComplete } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const query = ref("ap");
const chosen = ref("billing");
const wrap = ref<HTMLElement | null>(null);

const repositories = [
  "api-gateway", "apollo-web", "app-shell", "billing",
  "beacon-agent", "console", "design-tokens",
];
const matches = computed(() =>
  repositories.filter((r) => r.includes(query.value.trim().toLowerCase())),
);

onMounted(async () => {
  if (!props.print) return;
  await nextTick();
  wrap.value?.querySelector<HTMLInputElement>("input")?.focus();
});
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill">
      <div class="cat-label">After picking — panel closed</div>
      <AutoComplete
        v-model="chosen"
        :suggestions="repositories"
        aria-label="Selected repository"
        placeholder="Repository"
      />
    </div>
    <div ref="wrap" class="cat-fill">
      <div class="cat-label">Typing “ap” — filtered suggestions</div>
      <AutoComplete
        v-model="query"
        :suggestions="matches"
        aria-label="Repository"
        placeholder="Start typing a repository"
      />
    </div>
    <div style="height: 120px" />
  </div>
</template>
