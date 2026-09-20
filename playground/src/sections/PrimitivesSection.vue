<script setup lang="ts">
import { ref } from "vue";
import {
  AppAvatar, AppBadge, AppButton, AppChip, AppIcon, AppMessage, AppProgress,
  AvatarStack, Divider, Skeleton, type IconName,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

const loading = ref(false);
function fakeLoad(): void {
  loading.value = true;
  window.setTimeout(() => (loading.value = false), 1600);
}

const iconRow: IconName[] = [
  "run", "stop", "plus", "settings", "close", "chevron-down", "search", "info",
  "check", "warn", "trash", "edit", "copy", "spinner", "folder", "node", "theme",
  "home", "inbox", "bell", "chart", "users", "calendar", "credit", "star",
  "more", "sidebar", "moon", "eye",
];
</script>

<template>
  <div class="wrap">
    <h2 class="sec-title">Primitives</h2>

    <DemoCard title="AppButton" desc="Variants, sizes, icon, loading and disabled states.">
      <div class="row">
        <AppButton>Primary</AppButton>
        <AppButton variant="secondary">Secondary</AppButton>
        <AppButton variant="ghost">Ghost</AppButton>
        <AppButton variant="danger">Danger</AppButton>
        <AppButton size="sm">Small</AppButton>
        <AppButton icon="plus">With icon</AppButton>
        <AppButton :loading="loading" icon="spinner" @click="fakeLoad">Load me</AppButton>
        <AppButton disabled>Disabled</AppButton>
      </div>
    </DemoCard>

    <DemoCard title="AppIcon" desc="The bundled 29-icon stroke set — any size, currentColor.">
      <div class="icons">
        <span v-for="n in iconRow" :key="n" class="icon-cell" :title="n">
          <AppIcon :name="n" :size="20" />
          <span class="icon-tag">{{ n }}</span>
        </span>
      </div>
    </DemoCard>

    <DemoCard title="AppBadge / AppChip" desc="Status tints, dotted notifications and closable chips.">
      <div class="row">
        <AppBadge tint="neutral">neutral</AppBadge>
        <AppBadge tint="accent">accent</AppBadge>
        <AppBadge tint="ok">ok</AppBadge>
        <AppBadge tint="warn">warn</AppBadge>
        <AppBadge tint="err">err</AppBadge>
        <AppBadge tint="run">run</AppBadge>
        <AppBadge tint="info">info</AppBadge>
        <AppBadge tint="p0">P0</AppBadge>
        <AppBadge tint="p1">P1</AppBadge>
        <AppBadge tint="p2">P2</AppBadge>
        <AppBadge tint="p3">P3</AppBadge>
        <AppBadge dot>dot</AppBadge>
      </div>
      <Divider :spacing="14" />
      <div class="row">
        <AppChip icon="node">node</AppChip>
        <AppChip tint="accent" icon="star">starred</AppChip>
        <AppChip tint="ok" closable>dismiss me</AppChip>
        <AppChip tint="warn" selected>selected</AppChip>
        <AppChip tint="err" closable>remove</AppChip>
      </div>
    </DemoCard>

    <DemoCard title="AppAvatar / AvatarStack" desc="Initial-based avatars with optional images, tints, stacks.">
      <div class="row">
        <AppAvatar name="Ada Lovelace" size="lg" tint="accent" />
        <AppAvatar name="Grace Hopper" src="" tint="info" />
        <AppAvatar name="Katherine Johnson" size="md" tint="ok" />
        <AppAvatar name="Alan Turing" size="lg" tint="warn" />
        <Divider orientation="vertical" />
        <AvatarStack
          :people="[
            { name: 'Ada Lovelace' }, { name: 'Grace Hopper' }, { name: 'Alan Turing' },
            { name: 'Barbara Liskov' }, { name: 'Frances Allen' },
          ]"
          size="md"
          :max="3"
        />
      </div>
    </DemoCard>

    <DemoCard title="AppMessage" desc="Inline alerts with icon, tint and dismissal.">
      <div class="col">
        <AppMessage kind="info" title="Heads up" dismissible>Sync is due in 5 minutes.</AppMessage>
        <AppMessage kind="ok" title="Saved">All changes are persisted.</AppMessage>
        <AppMessage kind="warn" title="Warning" icon="warn">The provider token is expiring.</AppMessage>
        <AppMessage kind="err" title="Error" dismissible>Connection to the runner was lost.</AppMessage>
      </div>
    </DemoCard>

    <DemoCard title="AppProgress / Skeleton" desc="Determinate + indeterminate bars, spinners, loading placeholders.">
      <div class="col">
        <AppProgress :value="65" label="Uploading…" />
        <AppProgress label="Indeterminate" />
        <AppProgress variant="spinner" :value="32" label="Compiling" size="sm" />
        <div class="row">
          <Skeleton shape="circle" width="40px" height="40px" />
          <Skeleton shape="box" width="120px" height="60px" />
          <Skeleton shape="text" :lines="3" width="180px" />
        </div>
      </div>
    </DemoCard>
  </div>
</template>

<style scoped>
.sec-title {
  margin: 0 0 16px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.icons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}
.icon-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text-2);
}
.icon-tag {
  font-size: 10px;
  color: var(--text-3);
}
</style>
