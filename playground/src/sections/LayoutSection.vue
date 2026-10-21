<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  AppButton, AppInput, AppPanel, AppSelect, Card, DeferredContent, Divider,
  Fieldset, FileUpload, Fluid, MediaGallery, MeterGroup, PaneSection, ScrollArea,
  Splitter, Stepper, Toolbar, VirtualScroller, type SelectOption, type StepperItem,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

defineProps<{ print?: boolean }>();

const step = ref("s2");
const steps: StepperItem[] = [
  { id: "s1", label: "Details" },
  { id: "s2", label: "Review", optional: true },
  { id: "s3", label: "Deploy" },
];

// Splitter modelValue is a 0–1 fraction and fully controlled: a restored
// ratio re-lays-out the panes. 0.35 → left pane at 35%.
const split = ref(0.35);

const fsOpen = ref(true);
const fsClosed = ref(false);

const fluidName = ref("");
const fluidVal = ref("");
const fluidSel = ref("");
const toolSel = ref("");
const visOpts: SelectOption[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "unlisted", label: "Unlisted" },
];
const toolOpts: SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "published", label: "Published" },
];

const longList = Array.from({ length: 1000 }, (_, i) => `row-${String(i).padStart(3, "0")}`);

const gallery = Array.from({ length: 8 }, (_, i) => ({
  src: `https://picsum.photos/seed/vuedemond${i}/400/260`,
  alt: `Sample ${i + 1}`,
}));

const paneHost = ref<HTMLElement | null>(null);

// PaneSection's collapse is internal state — click the second header once so
// the catalogue shows both expanded and collapsed appearances.
onMounted(() => {
  const heads = paneHost.value?.querySelectorAll(".pane-section-head");
  (heads?.[1] as HTMLElement | undefined)?.click();
});
</script>

<template>
  <div class="wrap">
    <h2 class="sec-title">Layout</h2>

    <DemoCard class="demo span-2" title="Panels, cards, fieldsets" desc="Containers with headers, elevation, and collapse — expanded and collapsed fieldsets side by side.">
      <div class="row">
        <AppPanel title="AppPanel" subtitle="Token panel" elevation="raised" class="cell">
          <p class="p">Elevation + heading + action slot.</p>
        </AppPanel>
        <Card title="Card" subtitle="Plain container" class="cell">
          <p class="p">The bare-bones surface.</p>
        </Card>
        <Fieldset legend="Fieldset" toggleable v-model:open="fsOpen" class="cell">
          <p class="p">Collapsible grouping with a legend — this one starts open.</p>
        </Fieldset>
        <Fieldset legend="Fieldset collapsed" toggleable v-model:open="fsClosed" class="cell">
          <p class="p">Same group, collapsed to its legend (toggle to expand).</p>
        </Fieldset>
      </div>
    </DemoCard>

    <DemoCard title="Splitter / ScrollArea / VirtualScroller" desc="Controlled split panes at 35%, custom scrolling, windowed lists." class="demo span-2">
      <div class="col">
        <Splitter v-model="split" class="split-demo">
          <template #a><div class="pane">Left pane</div></template>
          <template #b><div class="pane">Right pane — {{ Math.round(split * 100) }}%</div></template>
        </Splitter>
        <div class="row stretch">
          <ScrollArea max-height="180px" class="grow">
            <p v-for="i in 40" :key="i" class="p" style="margin: 4px 0">Scroll row {{ i }}</p>
          </ScrollArea>
          <VirtualScroller :items="longList" :height="180" :item-height="26" row-class="vs-row" class="grow">
            <template #item="{ item, index }">
              <span class="vs-idx">{{ index }}</span> {{ item }}
            </template>
          </VirtualScroller>
        </div>
      </div>
    </DemoCard>

    <DemoCard title="Stepper" desc="Three steps with the middle one active (Review is optional).">
      <Stepper v-model="step" :steps="steps">
        <template #step-s1><p class="p">Details form goes here.</p></template>
        <template #step-s2><p class="p">Review the summary before deploying.</p></template>
        <template #step-s3><p class="p">Deploy to production.</p></template>
      </Stepper>
    </DemoCard>

    <DemoCard title="MeterGroup / Divider" desc="Metrics stack, then horizontal and vertical rules.">
      <div class="col">
        <MeterGroup
          :meters="[
            { label: 'CPU', value: 62, tint: 'accent' },
            { label: 'Memory', value: 84, tint: 'warn' },
            { label: 'Disk', value: 30, tint: 'ok' },
            { label: 'Network', value: 12, tint: 'info' },
          ]"
        />
        <Divider label="or" :spacing="6" />
        <div class="row v-demo">
          <span class="p">left</span>
          <Divider orientation="vertical" />
          <span class="p">right</span>
        </div>
      </div>
    </DemoCard>

    <DemoCard title="Toolbar / Fluid" desc="Grouped bar with live controls; Fluid stretches inputs full-width.">
      <div class="col">
        <Toolbar title="Workspace" class="tb">
          <template #left>
            <AppButton size="sm" variant="ghost" icon="plus">New</AppButton>
            <AppButton size="sm" variant="ghost" icon="trash" disabled>Delete</AppButton>
          </template>
          <template #right>
            <AppSelect v-model="toolSel" placeholder="Status" :options="toolOpts" />
          </template>
        </Toolbar>
        <Fluid>
          <AppInput v-model="fluidName" label="Project name" placeholder="e.g. nebula" />
          <AppInput v-model="fluidVal" label="Owner" placeholder="Fluid stretches inputs to full width" />
          <AppSelect v-model="fluidSel" label="Visibility" :options="visOpts" placeholder="Pick one" />
        </Fluid>
      </div>
    </DemoCard>

    <DemoCard title="PaneSection" desc="Collapsible sidebar-style headers — the second section is shown collapsed.">
      <div ref="paneHost" class="col">
        <PaneSection title="Filters">
          <p class="p">Refine the list by status, owner and tags.</p>
        </PaneSection>
        <PaneSection title="Saved views">
          <p class="p">Collapsed — click the header to expand.</p>
        </PaneSection>
      </div>
    </DemoCard>

    <DemoCard class="demo span-2" title="FileUpload / MediaGallery / DeferredContent" desc="File picker, image strip, lazy mounting on scroll-into-view.">
      <div class="col">
        <FileUpload accept="image/*" multiple label="Drop images" description="PNG / JPG, up to 5MB" />
        <MediaGallery :images="gallery" class="gal" />
        <p class="p">The block below mounts only when it approaches the viewport:</p>
        <DeferredContent>
          <div class="deferred-box">Heavy chart mounted lazily on scroll-into-view.</div>
        </DeferredContent>
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
  gap: 14px;
}
.stretch {
  align-items: stretch;
}
.grow {
  flex: 1;
  min-width: 0;
}
.cell {
  flex: 1 1 220px;
  min-width: 0;
}
.p {
  margin: 0;
  font-size: var(--fs-13);
  color: var(--text-2);
}
.v-demo {
  height: 40px;
  align-items: stretch;
  gap: 14px;
}
.split-demo :deep(.splitter__left),
.split-demo :deep(.splitter__right) {
  overflow: auto;
}
.pane {
  padding: 12px;
  border: 1px dashed var(--line);
  border-radius: var(--radius-md);
  text-align: center;
  color: var(--text-3);
  font-size: var(--fs-13);
  min-height: 90px;
}
.vs-row {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: var(--fs-12);
  color: var(--text-2);
  border-bottom: 1px solid var(--divider);
}
.vs-idx {
  color: var(--text-3);
  min-width: 28px;
  text-align: right;
}
.tb :deep(.app-toolbar__left),
.tb :deep(.app-toolbar__right) {
  display: flex;
  gap: 8px;
}
.gal {
  margin-top: 6px;
}
.deferred-box {
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--fs-13);
}
</style>
