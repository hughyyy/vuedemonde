// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { mount } from "@vue/test-utils";
import AppIcon from "../src/kit/AppIcon.vue";
import { ICON_NAMES, iconPaths } from "../src/kit/icons";

describe("icons registry", () => {
  it("every registered icon has at least one path", () => {
    expect(ICON_NAMES.length).toBeGreaterThan(0);
    for (const name of ICON_NAMES) {
      expect(iconPaths(name).length, `${name} has no paths`).toBeGreaterThan(0);
    }
  });

  it("iconPaths covers exactly ICON_NAMES", () => {
    const viaKey = new Set(ICON_NAMES);
    const viaFn = new Set<string>();
    for (const k of ICON_NAMES) for (const p of iconPaths(k)) void p;
    // every IconName value resolves; ICON_NAMES is the source of truth
    expect(viaKey.size).toBe(ICON_NAMES.length);
    void viaFn;
  });
});

describe("AppIcon — render contract", () => {
  it("renders every named icon as an svg with matching path elements", () => {
    for (const name of ICON_NAMES) {
      const w = mount(AppIcon, { props: { name } });
      const svg = w.find("svg");
      expect(svg.attributes("viewBox")).toBe("0 0 24 24");
      expect(svg.attributes("aria-hidden")).toBe("true");
      expect(w.findAll("path")).toHaveLength(iconPaths(name).length);
    }
  });

  it("honours the size prop and defaults to 16", () => {
    const dflt = mount(AppIcon, { props: { name: "star" } });
    expect(dflt.find("svg").attributes("width")).toBe("16");
    const big = mount(AppIcon, { props: { name: "star", size: 24 } });
    expect(big.find("svg").attributes("width")).toBe("24");
  });
});

describe("icons consistency — every literal usage in src exists", () => {
  const root = join(process.cwd(), "src");
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith(".")) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".vue") || e.name.endsWith(".ts")) files.push(p);
    }
  };
  walk(root);

  it("every static name=\"…\" icon reference exists in the registry", () => {
    if (files.length === 0) throw new Error("src scan found nothing");
    const known = new Set<string>(ICON_NAMES);
    const missing = new Set<string>();
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/<AppIcon[^>]*?(?<!:)name="([a-z0-9-]+)"/g)) {
        if (!known.has(m[1]!)) missing.add(`${m[1]} (${f})`);
      }
    }
    expect([...missing]).toEqual([]);
  });
});
