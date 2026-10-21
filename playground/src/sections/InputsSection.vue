<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import {
  AppCheckbox, AppInput, AppOptionInput, AppRadio, AppSearchInput, AppSelect, AppTextarea, AppToggle,
  AutoComplete, CascadeSelect, Compare, DatePicker, FileUpload, FloatLabel, IconField, IftaLabel, Inplace,
  InputColor, InputGroup, InputNumber, InputOtp, InputPassword, InputTags, Knob, Listbox, Rating,
  SelectButton, Slider, ToggleButton,
  type RadioOption, type SelectOption,
} from "@vuedemonde";
import DemoCard from "../DemoCard.vue";

/** Not barrel-exported by the kit — mirror the component's option shape. */
type CascadeOption = { value: string; label: string; children?: CascadeOption[] };

const props = defineProps<{ print?: boolean }>();

if (props.print) {
  // The release renderer captures #print-section with a temporarily resized
  // viewport; the kit's popover panels close on window scroll/resize. This
  // setup runs before the kit components mount, so pre-empting the events
  // keeps the open panels (DatePicker, CascadeSelect, AutoComplete) alive.
  for (const type of ["scroll", "resize"] as const) {
    window.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
  }
}
const text = ref("");
const email = ref("ada.lovelace"); // pre-filled invalid → live error state
const notes = ref("");
const search = ref("pipeline");
const ac = ref("ap");
const optionVal = ref("alice");
const select = ref("b");
const radio = ref("r2");
const check = ref(true);
const toggle = ref(false);
const toggleOn = ref(true);
const toggleDisabled = ref(true);
const pinned = ref(true);
const seg = ref<string>("week");
const listSel = ref("banana");
const tags = ref(["vue", "dataflow", "vite"]);
const num = ref(42);
const slider = ref(60);
const rating = ref(4);
const knob = ref(3);
const compareVal = ref(0.5); // 0..1 — divider sits mid-way
const colorVal = ref("#4f9cf9");
const otp = ref("");
const pw = ref("Vuedem0nd!kit");
const dateISO = ref("2026-10-15");
const cascadeVal = ref("cad");

const selectOpts: SelectOption[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
];
const radioOpts: RadioOption[] = [
  { value: "r1", label: "Small" },
  { value: "r2", label: "Medium" },
  { value: "r3", label: "Large" },
];
const listOptions: SelectOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
];
const cascadeOpts: CascadeOption[] = [
  {
    value: "sys", label: "Systems",
    children: [
      { value: "cad", label: "CAD" },
      { value: "cam", label: "CAM" },
      { value: "plm", label: "PLM" },
    ],
  },
  {
    value: "data", label: "Data",
    children: [
      { value: "warehouse", label: "Warehouse" },
      { value: "pipeline", label: "Pipelines" },
    ],
  },
];
const knownOptions: { value: string; label: string; hint?: string }[] = [
  { value: "alice", label: "Alice Chen" },
  { value: "bob", label: "Bob Okafor" },
  { value: "cara", label: "Cara Diaz" },
  { value: "dana", label: "Dana Reyes" },
];

const acSuggestions = computed(() =>
  ["apple", "apricot", "avocado", "banana", "blueberry", "cherry", "coconut", "date", "elderberry"].filter((s) =>
    s.toLowerCase().includes(ac.value.trim().toLowerCase()),
  ),
);

/* DOM refs used to drive interactive-only states into a visible demo state:
 * the components keep their internal open/local state, so the section seeds
 * them via real events (focus/click/change) — exactly what a user would do. */
const acWrap = ref<HTMLElement | null>(null);
const dateWrap = ref<HTMLElement | null>(null);
const cascadeWrap = ref<HTMLElement | null>(null);
const otpWrap = ref<HTMLElement | null>(null);
const uploadWrap = ref<HTMLElement | null>(null);

onMounted(async () => {
  // InputOtp — populate the six cells (local state, not prop-driven).
  const otpEl = otpWrap.value;
  if (otpEl) {
    const cells = otpEl.querySelectorAll<HTMLInputElement>("input");
    ["4", "8", "2", "9", "1", "7"].forEach((d, i) => {
      const c = cells[i];
      if (!c) return;
      c.value = d;
      c.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  // FileUpload — seed a selection so the list state renders.
  const upEl = uploadWrap.value;
  if (upEl) {
    const input = upEl.querySelector<HTMLInputElement>('input[type="file"]');
    if (input) {
      const dt = new DataTransfer();
      dt.items.add(new File(['{ "kit": "vuedemonde" }'], "design-tokens.json", { type: "application/json" }));
      dt.items.add(new File(["--accent: #4f9cf9;"], "theme.css", { type: "text/css" }));
      Object.defineProperty(input, "files", { value: dt.files, configurable: true });
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
  if (!props.print) return;
  // print mode: open the normally-interactive panels so renders show them open.
  // The page may have scrolled during mount (scroll anchoring after the OTP /
  // file-list injections); the anchored panels measure the trigger in viewport
  // coords, so pin scroll to the top first (per-card audit caught a 600px+ drift).
  window.scrollTo(0, 0);
  await document.fonts?.ready;
  await nextTick();
  dateWrap.value?.querySelector<HTMLElement>(".date-picker__trigger")?.click();
  cascadeWrap.value?.querySelector<HTMLElement>(".cascade-select__trigger")?.click();
  // focus last — the trigger clicks above steal focus and would blur it closed
  acWrap.value?.querySelector<HTMLInputElement>("input")?.focus();
});
</script>

<template>
  <div class="wrap">
    <h2 class="sec-title">Inputs &amp; Forms</h2>

    <DemoCard class="span-2" title="Text entry" desc="AppInput states (normal/label/hint/error/disabled), textareas.">
      <div class="row wrap-row">
        <AppInput v-model="text" label="Search" placeholder="Start typing…" hint="Powered by AutoComplete below" />
        <AppInput v-model="email" label="Email" type="email" placeholder="you@example.com" :error="email.length > 3 && !email.includes('@') ? 'Not a valid email' : undefined" />
        <AppInput label="Disabled" :model-value="text" disabled />
      </div>
      <div class="row wrap-row">
        <AppTextarea v-model="notes" label="Notes" :rows="2" placeholder="Multi-line…" />
        <AppTextarea v-model="notes" label="Mono" :rows="2" mono placeholder="const kit = 'self-contained'" />
      </div>
    </DemoCard>

    <DemoCard class="span-2" title="Smart inputs" desc="Search with clear, free-text option input, auto-complete, tags.">
      <div class="row wrap-row">
        <AppSearchInput v-model="search" label="Search" placeholder="Filter rows…" />
        <div ref="acWrap"><AutoComplete v-model="ac" :suggestions="acSuggestions" placeholder="Type 'a'…" /></div>
      </div>
      <div class="row wrap-row">
        <AppOptionInput v-model="optionVal" :options="knownOptions" label="Assignee" placeholder="Pick or type…" />
        <InputTags v-model="tags" placeholder="Add a tag ↵" />
      </div>
    </DemoCard>

    <DemoCard title="Selection" desc="Select / Radio / Checkbox / Toggle — every checked state side by side.">
      <div class="row wrap-row">
        <AppSelect v-model="select" label="Fruit" :options="selectOpts" />
        <AppRadio v-model="radio" label="Size" :options="radioOpts" />
      </div>
      <div class="row wrap-row">
        <AppCheckbox v-model="check" label="Subscribe to updates" />
        <AppCheckbox label="Unavailable" :model-value="false" disabled />
      </div>
      <div class="row wrap-row">
        <AppToggle v-model="toggleOn" label="Dark mode sync" />
        <AppToggle v-model="toggle" label="Off by default" />
        <AppToggle v-model="toggleDisabled" label="Locked" disabled />
      </div>
    </DemoCard>

    <DemoCard title="Segment & list pickers" desc="ToggleButton, SelectButton, Listbox — one selected each.">
      <div class="row wrap-row">
        <ToggleButton v-model="pinned" label="Pinned" />
        <ToggleButton v-model="toggle" label="Unpinned" />
        <SelectButton v-model="seg" :options="[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]" />
      </div>
      <Listbox v-model="listSel" :options="listOptions" placeholder="Pick a fruit" />
    </DemoCard>

    <DemoCard title="Numeric & value controls" desc="Number steppers, slider, stars, dial, before/after, colour.">
      <div class="row wrap-row">
        <InputNumber v-model="num" label="Quantity" :min="0" :max="999" />
        <Slider v-model="slider" :min="0" :max="100" />
        <Rating v-model="rating" :max="5" />
        <Knob v-model="knob" :min="0" :max="10" label="speed" />
        <InputColor v-model="colorVal" label="Accent swatch" />
      </div>
      <Compare v-model="compareVal">
        <template #a><div class="cmp-panel cmp-a">v0.1 — light</div></template>
        <template #b><div class="cmp-panel cmp-b">v0.2 — compact</div></template>
      </Compare>
    </DemoCard>

    <DemoCard title="Masks & security" desc="OTP cells, password with strength meter — masked entry.">
      <div class="col">
        <div ref="otpWrap" class="row">
          <InputOtp v-model="otp" :length="6" />
        </div>
        <InputPassword v-model="pw" placeholder="Password" show-toggle strength />
      </div>
    </DemoCard>

    <DemoCard title="Input wrappers" desc="Grouped add-ons, floating and ifta labels, inline editing.">
      <div class="col">
        <div class="row wrap-row">
          <InputGroup>
            <template #left>https://</template>
            <AppInput v-model="text" placeholder="domain" />
            <template #right><span class="grp">:443</span></template>
          </InputGroup>
          <IconField icon="calendar" position="left">
            <AppInput v-model="text" placeholder="With leading icon" />
          </IconField>
        </div>
        <div class="row wrap-row">
          <FloatLabel>
            <AppInput v-model="text" placeholder=" " />
            <template #label>Your name</template>
          </FloatLabel>
          <IftaLabel>
            <AppInput v-model="text" placeholder=" " />
            <template #label>Ifta label</template>
          </IftaLabel>
          <Inplace>
            <template #default><span class="fake-link">{{ text || "Click to edit inline" }}</span></template>
            <template #editor>
              <AppInput v-model="text" placeholder="Inline value" />
            </template>
          </Inplace>
        </div>
      </div>
    </DemoCard>

    <DemoCard title="Date & cascade & upload" desc="Calendar trigger (panel opens in print), cascading select, file list.">
      <div class="col">
        <div class="row wrap-row">
          <div ref="dateWrap"><DatePicker v-model="dateISO" placeholder="Pick a date" /></div>
          <div ref="cascadeWrap"><CascadeSelect v-model="cascadeVal" :options="cascadeOpts" placeholder="Choose a path…" /></div>
        </div>
        <div ref="uploadWrap">
          <FileUpload label="Drop assets here or browse" description="PNG, JSON, CSS — anything under 10 MB" />
        </div>
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
  margin: 0;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.wrap-row {
  flex-wrap: wrap;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.grp {
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: var(--fs-12);
}
.fake-link {
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
  font-size: var(--fs-13);
}
.cmp-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  font-size: var(--fs-13);
  color: var(--text-2);
}
.cmp-a { background: var(--surface-2); }
.cmp-b { background: var(--accent-soft); color: var(--accent); }
</style>
