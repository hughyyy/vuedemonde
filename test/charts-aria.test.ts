// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import BarChart from "../src/charts/BarChart.vue";
import DonutChart from "../src/charts/DonutChart.vue";
import LineChart from "../src/charts/LineChart.vue";
import RadarChart from "../src/charts/RadarChart.vue";

const img = (w: VueWrapper) => w.find("svg").attributes("aria-label");

describe("charts — accessible image labels", () => {
  it("exposes an optional label on every chart svg", () => {
    const bar = mount(BarChart, { props: { labels: ["a"], series: [{ name: "s", values: [1] }], ariaLabel: "Monthly revenue" } });
    expect(img(bar)).toBe("Monthly revenue");
    const donut = mount(DonutChart, { props: { data: [{ label: "x", value: 1 }], ariaLabel: "Disk usage" } });
    expect(img(donut)).toBe("Disk usage");
    const line = mount(LineChart, { props: { labels: ["a", "b"], series: [{ name: "s", points: [1, 2] }], ariaLabel: "Latency" } });
    expect(img(line)).toBe("Latency");
    const radar = mount(RadarChart, { props: { labels: ["a", "b"], series: [{ name: "s", values: [1, 2] }], ariaLabel: "Skills" } });
    expect(img(radar)).toBe("Skills");
  });
});
