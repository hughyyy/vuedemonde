<script setup lang="ts">
import { AppDialog } from "./index";
import { dialogs, closeDialog } from "./dialogs";

/** Host for the DynamicDialog service — mount once at app root. */
</script>

<template>
  <template v-for="d in dialogs" :key="d.id">
    <AppDialog :open="true" :title="d.title ?? 'Dialog'" :size="d.width ?? 'md'" @close="closeDialog(d.id)">
      <component :is="d.component" v-bind="d.props ?? {}" @close="closeDialog(d.id)" />
    </AppDialog>
  </template>
</template>
