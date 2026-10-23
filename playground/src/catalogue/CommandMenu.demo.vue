<script setup lang="ts">
/** Catalogue demo: the command palette open over its backdrop. */
import { onMounted, ref } from "vue";
import { AppButton, CommandMenu, type CommandItem } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const items: CommandItem[] = [
  { id: "new", label: "New workflow", icon: "plus", group: "Create", keywords: "add" },
  { id: "run", label: "Run workflow", icon: "run", group: "Create", keywords: "execute start" },
  { id: "deploy", label: "Deploy pipeline", icon: "node", group: "Create", keywords: "ship release" },
  { id: "settings", label: "Open settings", icon: "settings", group: "Jump", keywords: "prefs config" },
  { id: "team", label: "Invite teammate", icon: "users", group: "Jump", keywords: "member share" },
  { id: "theme", label: "Switch theme", icon: "theme", group: "Jump", keywords: "skin colour" },
];

const open = ref(false);
const picked = ref("");

function onSelect(id: string): void {
  open.value = false;
  picked.value = id;
}

onMounted(() => {
  if (props.print) open.value = true;
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-row">
      <AppButton icon="search" @click="open = true">Command palette</AppButton>
      <span class="cat-label">{{ picked ? `ran: ${picked}` : "⌘K toggles the palette" }}</span>
    </div>
    <CommandMenu v-model:open="open" :items="items" @select="onSelect" />
  </div>
</template>
