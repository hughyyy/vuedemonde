// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DonutChart from "../src/charts/DonutChart.vue";
import RadarChart from "../src/charts/RadarChart.vue";

describe("DonutChart — proportional ring segments", () => {
  it("renders one path per slice with palette or explicit colours and a total", () => {
    const w = mount(DonutChart, { props: { data: [{ label: "a", value: 30 }, { label: "b", value: 70 }] } });
    const paths = w.findAll("path");
    expect(paths).toHaveLength(2);
    expect(paths[0].attributes("fill")).toBe("#4f9cf9"); // palette[0]
    expect(paths[1].attributes("fill")).toBe("#f97316"); // palette[1]
    expect(w.find(".chart__total").text()).toBe("100");
    expect(w.find(".chart__total-label").text()).toBe("total");
    expect(paths[0].find("title").text()).toBe("a: 30");
  });

  it("honours per-slice colours and maps every slice to a title", () => {
    const w = mount(DonutChart, { props: { data: [{ label: "x", value: 1, color: "#ff0000" }, { label: "y", value: 2 }] } });
    const paths = w.findAll("path");
    expect(paths[0].attributes("fill")).toBe("#ff0000");
    expect(paths.find((p) => p.find("title").text() === "y: 2")).toBeTruthy();
  });

  it("a single slice sweeps the whole ring", () => {
    const w = mount(DonutChart, { props: { data: [{ label: "only", value: 5 }] } });
    const d = w.find("path").attributes("d")!;
    expect(d.startsWith("M")).toBe(true);
    expect(w.find(".chart__total").text()).toBe("5");
  });

  it("an all-zero dataset renders slivers instead of crashing, with clamped total", () => {
    const w = mount(DonutChart, { props: { data: [{ label: "z1", value: 0 }, { label: "z2", value: 0 }] } });
    expect(w.findAll("path")).toHaveLength(2);
    expect(w.find(".chart__total").text()).toBe("1"); // total is max(1, sum)
    expect(w.findAll("path")[0].find("title").text()).toBe("z1: 0");
  });

  it("an empty dataset renders no segments", () => {
    const w = mount(DonutChart, { props: { data: [] } });
    expect(w.findAll("path")).toHaveLength(0);
    expect(w.find(".chart__total").text()).toBe("1"); // total is max(1, 0)
  });

  it("pie mode draws filled sectors from the centre and omits the total text", () => {
    const w = mount(DonutChart, { props: { data: [{ label: "a", value: 1 }], pie: true } });
    const d = w.find("path").attributes("d")!;
    expect(d.startsWith("M80,80")).toBe(true); // centre point for size 160
    expect(w.find(".chart__total").exists()).toBe(false);
  });

  it("spacing only applies with more than one slice and keeps two segments", () => {
    const w = mount(DonutChart, { props: { data: [{ label: "a", value: 1 }, { label: "b", value: 1 }], spacing: 6 } });
    expect(w.findAll("path")).toHaveLength(2);
    const single = mount(DonutChart, { props: { data: [{ label: "a", value: 3 }], spacing: 6 } });
    expect(single.find("path").attributes("d")).toContain("A79,79");
  });

  it("exposes size and the accessible label on the svg", () => {
    const w = mount(DonutChart, { props: { data: [{ label: "a", value: 1 }], size: 200, ariaLabel: "Throughput" } });
    const svg = w.find("svg");
    expect(svg.attributes("width")).toBe("200");
    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-label")).toBe("Throughput");
  });
});

describe("RadarChart — radial grid and polygons", () => {
  const labels = ["Speed", "Cost", "Reliability"];
  const series = [{ name: "alpha", values: [3, 4, 5] }];

  it("renders rings, an axis per category, labels and one polygon per series", () => {
    const w = mount(RadarChart, { props: { labels, series } });
    expect(w.findAll("path")).toHaveLength(1 + 4); // rings(4) + polygon(1)
    expect(w.findAll("line")).toHaveLength(3);
    expect(w.findAll(".chart__label").map((t) => t.text())).toEqual(labels);
    const poly = w.find("path[fill-opacity='0.16']");
    expect(poly.exists()).toBe(true);
    expect(poly.find("title").text()).toBe("alpha — 3, 4, 5");
    expect(poly.attributes("stroke")).toBe("#4f9cf9");
  });

  it("explicit max fixes the scale; otherwise niceMax rounds the peak", () => {
    // first vertex uses values[0]=3; radius = 280/2 - 24 = 116
    const topOf = (max: number) => `M140,${140 - 116 * (3 / max)}`;
    const capped = mount(RadarChart, { props: { labels, series, max: 10 } });
    expect(capped.find("path[fill-opacity='0.16']").attributes("d")).toContain(topOf(10));
    const auto = mount(RadarChart, { props: { labels, series } });
    expect(auto.find("path[fill-opacity='0.16']").attributes("d")).toContain(topOf(5)); // niceMax(5)
    for (const w of [capped, auto]) {
      expect(w.find("path[fill-opacity='0.16']").attributes("d")).not.toContain("NaN");
    }
  });

  it("fewer than 3 categories still builds a stable polygon (n clamps to 3)", () => {
    const w = mount(RadarChart, { props: { labels: ["A", "B"], series: [{ name: "s", values: [1, 2] }] } });
    expect(w.findAll("line")).toHaveLength(3);
    expect(w.find("path[fill-opacity='0.16']").attributes("d")).not.toContain("NaN");
  });

  it("an all-zero series doesn't divide by zero and draws no NaN", () => {
    const w = mount(RadarChart, { props: { labels, series: [{ name: "flat", values: [0, 0, 0] }] } });
    const d = w.find("path[fill-opacity='0.16']").attributes("d")!;
    expect(d).not.toContain("NaN");
    expect(d).not.toContain("Infinity");
  });

  it("an empty values array yields a bare polygon (edge)", () => {
    const w = mount(RadarChart, { props: { labels, series: [{ name: "empty", values: [] }] } });
    const d = w.find("path[fill-opacity='0.16']").attributes("d")!;
    expect(d.endsWith("Z")).toBe(true);
  });

  it("no series renders the grid only; no labels renders no labels", () => {
    const w = mount(RadarChart, { props: { labels, series: [] } });
    expect(w.findAll("path[fill-opacity='0.16']")).toHaveLength(0);
    expect(w.findAll("line")).toHaveLength(3);
    const noLabels = mount(RadarChart, { props: { labels: [], series: [{ name: "s", values: [1] }] } });
    expect(noLabels.findAll(".chart__label")).toHaveLength(0);
    expect(noLabels.find("path[fill-opacity='0.16']").exists()).toBe(true);
  });
});
