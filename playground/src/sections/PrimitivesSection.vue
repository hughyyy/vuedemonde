<script setup lang="ts">
import { ref } from "vue";
import {
  AppAvatar, AppBadge, AppButton, AppChip, AppIcon, AppMessage, AppProgress,
  AvatarStack, Divider, Skeleton, type IconName,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

defineProps<{ print?: boolean }>();

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
        <AppButton size="md" icon="star">Medium</AppButton>
        <AppButton icon="plus">With icon</AppButton>
        <AppButton icon="settings" title="Icon only" aria-label="Settings" />
        <AppButton :loading="loading" icon="spinner" @click="fakeLoad">Load me</AppButton>
        <AppButton disabled>Disabled</AppButton>
      </div>
    </DemoCard>

    <DemoCard title="AppBadge" desc="Every status tint in one row, plus priorities and the dot variant.">
      <div class="col">
        <div class="row">
          <AppBadge tint="neutral">neutral</AppBadge>
          <AppBadge tint="ok">ok</AppBadge>
          <AppBadge tint="warn">warn</AppBadge>
          <AppBadge tint="err">err</AppBadge>
          <AppBadge tint="run">run</AppBadge>
          <AppBadge tint="info">info</AppBadge>
          <AppBadge tint="accent">accent</AppBadge>
          <AppBadge dot>dot</AppBadge>
        </div>
        <div class="row">
          <AppBadge tint="p0">P0</AppBadge>
          <AppBadge tint="p1">P1</AppBadge>
          <AppBadge tint="p2">P2</AppBadge>
          <AppBadge tint="p3">P3</AppBadge>
        </div>
      </div>
    </DemoCard>

    <DemoCard title="AppChip" desc="Tints, icon chips, closable and selected states.">
      <div class="col">
        <div class="row">
          <AppChip icon="node">node</AppChip>
          <AppChip tint="accent" icon="star">starred</AppChip>
          <AppChip tint="info" icon="inbox">inbox</AppChip>
          <AppChip tint="run" icon="run">running</AppChip>
        </div>
        <div class="row">
          <AppChip tint="ok" closable>dismiss me</AppChip>
          <AppChip tint="warn" selected>selected</AppChip>
          <AppChip tint="err" closable>remove</AppChip>
        </div>
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

    <DemoCard title="AppProgress / Skeleton" desc="Determinate ~40% and indeterminate bars side by side, spinner, loading placeholders.">
      <div class="col">
        <div class="row">
          <AppProgress :value="40" label="Uploading…" class="grow" />
          <AppProgress label="Indeterminate" class="grow" />
        </div>
        <AppProgress variant="spinner" :value="32" label="Compiling" size="sm" />
        <div class="row">
          <Skeleton shape="circle" width="40px" height="40px" />
          <Skeleton shape="box" width="120px" height="60px" />
          <Skeleton shape="text" :lines="3" width="180px" />
        </div>
      </div>
    </DemoCard>

    <DemoCard title="AppAvatar / AvatarStack" desc="Initials by name with tints and sizes; stacks collapse into +N.">
      <div class="row">
        <AppAvatar name="Ada Lovelace" size="sm" tint="neutral" />
        <AppAvatar name="Katherine Johnson" size="md" tint="ok" />
        <AppAvatar name="Grace Hopper" size="md" tint="info" />
        <AppAvatar name="Alan Turing" size="lg" tint="warn" />
        <AppAvatar name="Barbara Liskov" size="lg" tint="accent" />
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

    <DemoCard class="demo span-2" title="Divider" desc="Horizontal rule with centred label and vertical separators.">
      <div class="col">
        <Divider label="or" :spacing="6" />
        <div class="row v-demo">
          <span class="v-tag">Alpha</span>
          <Divider orientation="vertical" />
          <span class="v-tag">Beta</span>
          <Divider orientation="vertical" />
          <span class="v-tag">Gamma</span>
        </div>
      </div>
    </DemoCard>

    <DemoCard title="AppIcon" desc="The bundled 29-icon stroke set — any size, currentColor." class="demo span-2">
      <div class="icons">
        <span v-for="n in iconRow" :key="n" class="icon-cell" :title="n">
          <AppIcon :name="n" :size="20" />
          <span class="icon-tag">{{ n }}</span>
        </span>
      </div>
    </DemoCard>
  </div>
</template>

<style scoped>
.wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 14px;
  align-items: start;
}
.wrap > .sec-title {
  grid-column: 1 / -1;
}
.span-2 { grid-column: span 2; }
.span-3 { grid-column: 1 / -1; }
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
.grow {
  flex: 1;
  min-width: 0;
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
.v-demo {
  height: 48px;
  align-items: stretch;
  gap: 14px;
}
.v-tag {
  align-self: center;
  font-size: var(--fs-12);
  color: var(--text-2);
}
</style>
