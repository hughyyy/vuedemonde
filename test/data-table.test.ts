// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DataTable from "../src/kit/DataTable.vue";

const columns = [
  { field: "name", header: "Name", sortable: true },
  { field: "age", header: "Age" },
];
const data = [
  { name: "beta", age: 2 },
  { name: "alpha", age: 1 },
];

describe("DataTable — sort and selection contract", () => {
  it("announces sort state on columnheaders and sorts via the header button", async () => {
    const wrapper = mount(DataTable, { props: { columns, data } });
    const th = wrapper.find("th");
    expect(th.attributes("aria-sort")).toBe("none");
    await th.find("button").trigger("click");
    expect(th.attributes("aria-sort")).toBe("ascending");
    expect(wrapper.find("tbody tr td").text()).toBe("alpha"); // sorted
    await th.find("button").trigger("click");
    expect(th.attributes("aria-sort")).toBe("descending");
  });

  it("makes selectable rows keyboard-operable with aria-selected", async () => {
    const wrapper = mount(DataTable, { props: { columns, data, selectable: true } });
    const row = wrapper.find("tbody tr");
    expect(row.attributes("tabindex")).toBe("0");
    expect(row.attributes("aria-selected")).toBe("false");
    await row.trigger("keydown", { key: "Enter" });
    const emitted = wrapper.emitted("row-select");
    expect(emitted?.[0]?.[0]).toEqual(data[0]!);
    expect(row.attributes("aria-selected")).toBe("true");
  });
});
