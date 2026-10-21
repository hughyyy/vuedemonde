// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DatePicker from "../src/kit/DatePicker.vue";
import CascadeSelect from "../src/kit/CascadeSelect.vue";

const cascades = [
  { value: "sys", label: "Systems", children: [{ value: "cad", label: "CAD" }] },
];

describe("DatePicker / CascadeSelect — trigger semantics", () => {
  it("announces the popup type and expanded state", async () => {
    const dp = mount(DatePicker, { props: { modelValue: "" } });
    const t1 = dp.find("button");
    expect(t1.attributes("aria-haspopup")).toBe("dialog");
    expect(t1.attributes("aria-expanded")).toBe("false");
    await t1.trigger("click");
    expect(dp.find("button").attributes("aria-expanded")).toBe("true");

    const cs = mount(CascadeSelect, { props: { modelValue: "", options: cascades } });
    const t2 = cs.find("button");
    expect(t2.attributes("aria-haspopup")).toBe("listbox");
    expect(t2.attributes("aria-expanded")).toBe("false");
    await t2.trigger("click");
    expect(cs.find("button").attributes("aria-expanded")).toBe("true");
  });
});
