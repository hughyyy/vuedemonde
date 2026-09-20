// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import PaneSection from "../src/kit/PaneSection.vue";

describe("PaneSection (D3 labelled-section primitive)", () => {
  it("renders its title and its slotted content", () => {
    const w = mount(PaneSection, {
      props: { title: "Looping" },
      slots: { default: "<label class='check'>Max runs</label>" },
    });
    expect(w.text()).toContain("Looping");
    expect(w.find("label.check").exists()).toBe(true);
  });

  it("collapses/expands the body on the header click", async () => {
    const w = mount(PaneSection, {
      props: { title: "Identification" },
      slots: { default: "<input class='name' />" },
    });
    const body = () => w.find(".pane-section-body");
    expect(body().attributes("style") ?? "").not.toContain("display: none");
    await w.find(".pane-section-head").trigger("click");
    expect(body().attributes("style")).toContain("display: none");
    await w.find(".pane-section-head").trigger("click");
    expect(body().attributes("style") ?? "").not.toContain("display: none");
  });
});
