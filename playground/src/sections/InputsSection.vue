<script setup lang="ts">
import { computed, ref } from "vue";
import {
  AppCheckbox, AppInput, AppRadio, AppSelect, AppTextarea, AppToggle,
  AutoComplete, Compare, DatePicker, FloatLabel, IconField, IftaLabel, Inplace,
  InputColor, InputGroup, InputNumber, InputOtp, InputPassword, InputTags,
  Listbox, Rating, SelectButton, Slider, ToggleButton,
  type RadioOption, type SelectOption,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

const text = ref("");
const email = ref("");
const notes = ref("");
const select = ref("b");
const radio = ref("r2");
const check = ref(true);
const toggle = ref(false);

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

const tags = ref(["vue", "dataflow"]);
const num = ref(42);
const slider = ref(60);
const rating = ref(4);
const knob = ref(3);
const listSel = ref<string>("banana");
const dateISO = ref("");
const colorVal = ref("#4f9cf9");
const pw = ref("");
const otp = ref("");
const seg = ref<string>("week");
const compareVal = ref(50);

const suggestions = computed(() =>
  ["apple", "apricot", "avocado", "banana", "blueberry", "cherry", "coconut", "date", "elderberry"].filter((s) => s.startsWith(text.value.toLowerCase())),
);

const listOptions: SelectOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
];
</script>

<template>
  <div>
    <h2 class="sec-title">Inputs &amp; Forms</h2>

    <DemoCard title="Text entry" desc="AppInput / AppTextarea with labels, hints, errors, sizes; auto-complete, tags.">
      <div class="grid">
        <AppInput v-model="text" label="Search" placeholder="Start typing… (try 'a')" hint="Powered by AutoComplete suggestions below" />
        <AppInput v-model="email" label="Email" type="email" placeholder="you@example.com" :error="email.length > 3 && !email.includes('@') ? 'Not a valid email' : undefined" />
        <AppInput label="Disabled" :model-value="text" disabled />
        <AppTextarea v-model="notes" label="Notes" :rows="3" placeholder="Multi-line…" />
        <AppTextarea v-model="notes" label="Mono" :rows="2" mono placeholder="const kit = 'self-contained'" />
      </div>
      <AppInput v-model="text" placeholder="Auto-complete fruits" />
      <AutoComplete v-model="text" :suggestions="suggestions" placeholder="Type 'b'…" />
      <InputTags v-model="tags" placeholder="Add a tag ↵" />
    </DemoCard>

    <DemoCard title="Selection" desc="Select / Radio / Checkbox / Toggle / segmented buttons / listbox.">
      <div class="grid">
        <AppSelect v-model="select" label="Fruit" :options="selectOpts" />
        <AppRadio v-model="radio" label="Size" :options="radioOpts" />
        <AppCheckbox v-model="check" label="Subscribe to updates" />
        <AppCheckbox label="Unavailable" :model-value="false" disabled />
        <AppToggle v-model="toggle" label="Dark mode sync" />
        <ToggleButton v-model="toggle" label="Pinned (ToggleButton)" />
        <SelectButton v-model="seg" :options="[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]" />
        <Listbox v-model="listSel" :options="listOptions" placeholder="Pick a fruit" />
      </div>
    </DemoCard>

    <DemoCard title="Numeric & value controls" desc="Number input, slider, rating, knob, compare, colour.">
      <div class="grid">
        <InputNumber v-model="num" label="Quantity" :min="0" :max="999" />
        <Slider v-model="slider" :min="0" :max="100" />
        <Rating v-model="rating" :max="5" />
        <Knob v-model="knob" :min="0" :max="10" label="speed" />
        <Compare v-model="compareVal" />
        <InputColor v-model="colorVal" label="Accent swatch" />
      </div>
    </DemoCard>

    <DemoCard title="Masks & security" desc="OTP cells, password with strength meter, numeric key-filter.">
      <div class="grid">
        <InputOtp v-model="otp" :length="6" />
        <InputPassword v-model="pw" placeholder="Password" show-toggle strength />
        <IconField icon="calendar" position="left">
          <AppInput v-model="text" placeholder="With icon field" />
        </IconField>
        <InputGroup>
          <template #left>https://</template>
          <AppInput v-model="text" placeholder="domain" />
        </InputGroup>
      </div>
    </DemoCard>

    <DemoCard title="Labels & placeholders" desc="Floating and Ifta labels, inline editing.">
      <div class="grid">
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
        <DatePicker v-model="dateISO" placeholder="Pick a date" />
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 10px;
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
</style>
