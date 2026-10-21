// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import LineChart from "../src/charts/LineChart.vue";

const seriesPath = (wrapper: VueWrapper) => {
  const paths = wrapper.findAll("path");
  // fill=false → the only path is the series stroke
  return paths[0]?.attributes("d") ?? "";
};

describe("LineChart — gaps", () => {
  it("a null point breaks the line into two strokes instead of dipping to zero", () => {
    const wrapper = mount(LineChart, {
      props: {
        labels: ["a", "b", "c", "d", "e"],
        series: [{ name: "s", points: [1, null, 3, 2, 4] }],
      },
    });
    const d = seriesPath(wrapper);
    expect(d.match(/M/g)?.length).toBe(2);
    expect(d).not.toContain("NaN");
  });

  it("a continuous series stays a single stroke", () => {
    const wrapper = mount(LineChart, {
      props: {
        labels: ["a", "b", "c", "d", "e"],
        series: [{ name: "s", points: [1, 2, 3, 2, 4] }],
      },
    });
    expect(seriesPath(wrapper).match(/M/g)?.length).toBe(1);
  });

  it("a flat series still gets a band — no NaN in the path", () => {
    const wrapper = mount(LineChart, {
      props: { labels: ["a", "b", "c"], series: [{ name: "s", points: [42, 42, 42] }] },
    });
    expect(seriesPath(wrapper)).not.toContain("NaN");
  });
});

describe("LineChart — thresholds", () => {
  it("draws a dashed labelled rule and pulls the threshold into the y-domain", () => {
    const wrapper = mount(LineChart, {
      props: {
        labels: ["a", "b", "c", "d"],
        series: [{ name: "s", points: [1, 2, 3, 2] }],
        thresholds: [{ value: 6, label: "crit", color: "#ff0000" }],
      },
    });
    const rule = wrapper.find("line.chart__threshold");
    expect(rule.exists()).toBe(true);
    expect(rule.attributes("stroke")).toBe("#ff0000");
    expect(wrapper.text()).toContain("crit");
    // threshold sits above the highest point (smaller y = higher on screen): domain includes 6
    const ruleY = Number(rule.attributes("y1"));
    const circleYs = wrapper.findAll("circle").map((c) => Number(c.attributes("cy")));
    expect(ruleY).toBeLessThan(Math.min(...circleYs));
  });
});

describe("LineChart — domain", () => {
  it("min pins the y-domain to a floor (0 forces a zero baseline)", () => {
    const noFloor = mount(LineChart, {
      props: { labels: ["a", "b"], series: [{ name: "s", points: [5, 6] }] },
    });
    const withFloor = mount(LineChart, {
      props: { labels: ["a", "b"], series: [{ name: "s", points: [5, 6] }], min: 0 },
    });
    // y-axis labels: first tick label differs when the domain starts at 0
    const firstTick = (w: VueWrapper) =>
      w.findAll('text[text-anchor="end"]')[0]?.text() ?? "";
    expect(firstTick(noFloor)).not.toBe("0");
    expect(firstTick(withFloor)).toBe("0");
  });

  it("time mode renders epoch-ms labels as HH:MM", () => {
    const wrapper = mount(LineChart, {
      props: {
        labels: ["1700000000000", "1700000060000", "1700000120000"],
        series: [{ name: "s", points: [1, 2, 3] }],
        time: true,
      },
    });
    for (const tick of wrapper.findAll('text[text-anchor="middle"]')) {
      expect(tick.text()).toMatch(/^\d{2}:\d{2}$/);
    }
  });
});
