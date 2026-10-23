// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import EventDialog from "../src/calendar/EventDialog.vue";
import type { CalendarEvent } from "../src/calendar/model";

const ev = (over: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: "e1",
  title: "Platform sync",
  start: new Date(2026, 4, 13, 9, 30),
  end: new Date(2026, 4, 13, 10, 15),
  tint: "indigo",
  allDay: false,
  location: "Studio",
  ...over,
});

/** Stub the kit form controls so the dialog's emit contract is exercised exactly. */
const stubs = {
  AppDialog: {
    props: { open: Boolean },
    template: '<div class="fake-dialog" v-if="open"><slot /><div class="fake-footer"><slot name="footer" /></div></div>',
  },
  AppInput: {
    props: { modelValue: String, label: String },
    emits: ["update:modelValue"],
    template: '<label><span>{{ label }}</span><input :value="modelValue" @input="$emit(\'update:modelValue\', ($event.target).value)" /></label>',
  },
  AppSelect: {
    props: { modelValue: String, label: String, options: Array },
    emits: ["update:modelValue"],
    template: '<label><span>{{ label }}</span><select :value="modelValue" @change="$emit(\'update:modelValue\', ($event.target).value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option></select></label>',
  },
  AppToggle: {
    props: { modelValue: Boolean, label: String },
    emits: ["update:modelValue"],
    template: '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', ($event.target).checked)" /><span>{{ label }}</span></label>',
  },
  AppButton: {
    emits: ["click"],
    template: "<button @click=\"$emit('click')\"><slot /></button>",
  },
};

const mountDialog = (props: { event: CalendarEvent | null; open: boolean }) =>
  mount(EventDialog, { props, global: { stubs } });

describe("EventDialog — detail form", () => {
  it("renders nothing while closed and the form when open", () => {
    const closed = mountDialog({ event: ev(), open: false });
    expect(closed.find(".fake-dialog").exists()).toBe(false);
    const open = mountDialog({ event: ev(), open: true });
    expect(open.find(".fake-dialog").exists()).toBe(true);
    expect(open.find(".ev-dialog").exists()).toBe(true);
  });

  it("pre-fills title, location and shows the time range for timed events", () => {
    const w = mountDialog({ event: ev(), open: true });
    const inputs = w.findAll("input");
    expect(inputs[0]!.element.getAttribute("value")).toBe("Platform sync"); // title
    expect(inputs[1]!.element.getAttribute("value")).toBe("Studio"); // location
    expect(w.find(".ev-dialog__value").text()).toBe("09:30 – 10:15");
    expect(w.find(".ev-dialog__label").text()).toBe("When");
  });

  it("declares all-day events as 'All day' instead of a time range", () => {
    const w = mountDialog({ event: ev({ allDay: true }), open: true });
    expect(w.find(".ev-dialog__value").text()).toBe("All day");
  });

  it("editing the title emits an update patch", async () => {
    const w = mountDialog({ event: ev(), open: true });
    await w.findAll("input")[0].setValue("Renamed");
    expect(w.emitted("update")!.at(-1)).toEqual([{ title: "Renamed" }]);
  });

  it("editing the location emits a patch and clearing sends undefined", async () => {
    const w = mountDialog({ event: ev(), open: true });
    await w.findAll("input")[1].setValue("Zoom");
    expect(w.emitted("update")!.at(-1)).toEqual([{ location: "Zoom" }]);
    await w.findAll("input")[1].setValue("");
    expect(w.emitted("update")!.at(-1)).toEqual([{ location: undefined }]);
  });

  it("changing the colour select emits a tint patch", async () => {
    const w = mountDialog({ event: ev(), open: true });
    await w.find("select").setValue("rose");
    expect(w.emitted("update")!.at(-1)).toEqual([{ tint: "rose" }]);
  });

  it("toggling all-day emits an allDay patch", async () => {
    const w = mountDialog({ event: ev(), open: true });
    await w.find('input[type="checkbox"]').setValue(true);
    expect(w.emitted("update")!.at(-1)).toEqual([{ allDay: true }]);
  });

  it("the Done button closes without a patch", async () => {
    const w = mountDialog({ event: ev(), open: true });
    await w.find("button").trigger("click");
    expect(w.emitted("close")).toHaveLength(1);
    expect(w.emitted("update")).toBeUndefined();
  });

  it("a null event while open renders no form but keeps the close path", async () => {
    const w = mountDialog({ event: null, open: true });
    expect(w.find(".ev-dialog").exists()).toBe(false);
    await w.find("button").trigger("click");
    expect(w.emitted("close")).toHaveLength(1);
  });
});
