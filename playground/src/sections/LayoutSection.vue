<script setup lang="ts">
import { ref } from "vue";
import {
  AppInput, AppPanel, Card, DeferredContent, Divider, Fieldset, FileUpload,
  Fluid, MediaGallery, MeterGroup, ScrollArea, Splitter, Stepper, Toolbar,
  VirtualScroller, type StepperItem,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

const step = ref("s2");
const steps: StepperItem[] = [
  { id: "s1", label: "Details" },
  { id: "s2", label: "Review", optional: true },
  { id: "s3", label: "Deploy" },
];

const split = ref(45);
const fluidVal = ref("");
const longList = Array.from({ length: 1000 }, (_, i) => `row-${String(i).padStart(3, "0")}`);

const gallery = Array.from({ length: 8 }, (_, i) => ({
  src: `https://picsum.photos/seed/vuedemond${i}/400/260`,
  alt: `Sample ${i + 1}`,
}));
</script>

<template>
  <div>
    <h2 class="sec-title">Layout</h2>

    <DemoCard title="Panels, cards, fieldsets" desc="Containers with headers, elevation, and collapse.">
      <div class="grid3">
        <AppPanel title="AppPanel" subtitle="Token panel" elevation="raised" style="min-width: 0">
          <p class="p">Elevation + heading + action slot.</p>
        </AppPanel>
        <Fieldset legend="Fieldset" toggleable open>
          <p class="p">Collapsible grouping with a legend.</p>
        </Fieldset>
        <Card title="Card" subtitle="Plain container">
          <p class="p">The bare-bones surface.</p>
        </Card>
      </div>
    </DemoCard>

    <DemoCard title="Splitter / ScrollArea / VirtualScroller" desc="Draggable split panes, custom scrolling, windowed lists.">
      <div class="grid3">
        <Splitter v-model="split" class="split-demo">
          <template #a><div class="pane">left</div></template>
          <template #b><div class="pane">right — {{ split }}%</div></template>
        </Splitter>
        <ScrollArea max-height="180px">
          <p v-for="i in 40" :key="i" class="p" style="margin: 4px 0">Scroll row {{ i }}</p>
        </ScrollArea>
        <VirtualScroller :items="longList" :height="180" :item-height="26" row-class="vs-row">
          <template #item="{ item, index }">
            <span class="vs-idx">{{ index }}</span> {{ item }}
          </template>
        </VirtualScroller>
      </div>
    </DemoCard>

    <DemoCard title="Stepper / MeterGroup / Divider / Toolbar / Fluid" desc="Progress + metrics + dividers.">
      <div class="col">
        <Stepper v-model="step" :steps="steps" />
        <MeterGroup
          :meters="[
            { label: 'CPU', value: 62, tint: 'accent' },
            { label: 'Memory', value: 84, tint: 'warn' },
            { label: 'Disk', value: 30, tint: 'ok' },
            { label: 'Network', value: 12, tint: 'info' },
          ]"
        />
        <Divider label="or" />
        <Toolbar title="Workspace" class="tb">
          <template #left><span class="grp-chip">New</span></template>
          <template #right><span class="grp-chip">Save</span></template>
        </Toolbar>
        <Fluid>
          <AppInput v-model="fluidVal" placeholder="Fluid stretches inputs to full width" />
        </Fluid>
      </div>
    </DemoCard>

    <DemoCard title="FileUpload / MediaGallery / DeferredContent" desc="File picker, image strip, lazy mounting on scroll-into-view.">
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
.sec-title {
  margin: 0 0 16px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.grid3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  align-items: start;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.p {
  margin: 0;
  font-size: var(--fs-13);
  color: var(--text-2);
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
.tb :deep(.toolbar__end),
.tb :deep(.toolbar__start) {
  display: flex;
  gap: 8px;
}
.grp-chip {
  font-size: var(--fs-12);
  color: var(--text-3);
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
