// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import BarChart from "../src/charts/BarChart.vue";

const svgH = 260;

describe("BarChart — bar geometry stays inside the plot", () => {
  it("bars span from their value top down to the baseline (never past the svg)", () => {
    const wrapper = mount(BarChart, {
      props: { labels: ["a", "b"], series: [{ name: "s", data: [50, 100] }], height: svgH },
    });
    const bars = wrapper.findAll("rect");
    expect(bars.length).toBe(2);
    for (const b of bars) {
      const y = Number(b.attributes("y"));
      const h = Number(b.attributes("height"));
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y + h).toBeLessThanOrEqual(svgH - 34 + 0.01); // inside the plot (34px bottom margin)
    }
  });

  it("a max-value bar reaches the baseline; a zero-value bar has zero height", () => {
    const wrapper = mount(BarChart, {
      props: { labels: ["a", "b"], series: [{ name: "s", data: [0, 100] }], height: svgH },
    });
    const [zero, max] = wrapper.findAll("rect");
    expect(Number(zero!.attributes("height"))).toBe(0);
    const y = Number(max!.attributes("y"));
    const h = Number(max!.attributes("height"));
    // baseline at M.top + innerH = 12 + (260-12-34) = 226
    expect(y + h).toBeCloseTo(226, 0);
  });
});
