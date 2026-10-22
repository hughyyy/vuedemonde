// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { THEME_IDS } from "../src/theme";
import BannerPrint from "../playground/src/BannerPrint.vue";
import ThemeBuilder from "../playground/src/builder/ThemeBuilder.vue";
import BoardSection from "../playground/src/sections/BoardSection.vue";
import CalendarSection from "../playground/src/sections/CalendarSection.vue";
import ChartsSection from "../playground/src/sections/ChartsSection.vue";
import DataSection from "../playground/src/sections/DataSection.vue";
import InputsSection from "../playground/src/sections/InputsSection.vue";
import LayoutSection from "../playground/src/sections/LayoutSection.vue";
import NavigationSection from "../playground/src/sections/NavigationSection.vue";
import OverlaysSection from "../playground/src/sections/OverlaysSection.vue";
import PrimitivesSection from "../playground/src/sections/PrimitivesSection.vue";

/**
 * Render audit — the repeatable zero-rendering-error net (docs/quality-audit.md
 * §Process). Mounts every family section in print mode (all components, open
 * overlay states included) under the three catalogue themes, the theme banner
 * under all 16 themes, and the theme builder page. Any console.error /
 * console.warn (Vue warnings included) fails the case.
 */

type ConsoleSpy = { calls: unknown[][]; restore: () => void };

function capture(method: "error" | "warn"): ConsoleSpy {
  const calls: unknown[][] = [];
  const spy = vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
    calls.push(args);
  });
  return { calls, restore: () => spy.mockRestore() };
}

async function settle(wrapper: VueWrapper): Promise<void> {
  // flush the reactivity queue deterministically — mounted/print-gated opens
  // and watchers re-render within a tick or two; no wall-clock dependency
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
}

const SECTIONS: Record<string, unknown> = {
  primitives: PrimitivesSection,
  inputs: InputsSection,
  overlays: OverlaysSection,
  navigation: NavigationSection,
  data: DataSection,
  layout: LayoutSection,
  charts: ChartsSection,
  calendar: CalendarSection,
  board: BoardSection,
};

const CATALOGUE_THEMES = ["dark", "light", "thermal"] as const;

describe("audit: family sections render with zero console noise", () => {
  for (const [id, Section] of Object.entries(SECTIONS)) {
    for (const theme of CATALOGUE_THEMES) {
      it(`${id} @ ${theme}`, async () => {
        document.documentElement.dataset.theme = theme;
        const errs = capture("error");
        const warns = capture("warn");
        try {
          const wrapper = mount(Section as never, { props: { print: true } });
          await settle(wrapper as VueWrapper);
          expect(wrapper.find(".wrap").exists()).toBe(true);
          expect(errs.calls, `console.error: ${errs.calls.map((c) => c.join(" ")).join(" || ")}`).toHaveLength(0);
          expect(warns.calls, `console.warn: ${warns.calls.map((c) => c.join(" ")).join(" || ")}`).toHaveLength(0);
          wrapper.unmount();
        } finally {
          errs.restore();
          warns.restore();
        }
      });
    }
  }
});

describe("audit: theme banner renders under every theme", () => {
  for (const theme of THEME_IDS) {
    it(theme, () => {
      const errs = capture("error");
      const warns = capture("warn");
      try {
        const wrapper = mount(BannerPrint);
        expect(wrapper.find("#banner").exists()).toBe(true);
        expect(wrapper.findAll(".banner__col")).toHaveLength(THEME_IDS.length);
        expect(errs.calls, `console.error: ${errs.calls.map((c) => c.join(" ")).join(" || ")}`).toHaveLength(0);
        expect(warns.calls, `console.warn: ${warns.calls.map((c) => c.join(" ")).join(" || ")}`).toHaveLength(0);
        wrapper.unmount();
      } finally {
        errs.restore();
        warns.restore();
      }
    });
  }
});

describe("audit: theme builder page", () => {
  it("mounts and renders every anchor swatch without console noise", async () => {
    const errs = capture("error");
    const warns = capture("warn");
    try {
      const wrapper = mount(ThemeBuilder);
      await settle(wrapper as VueWrapper);
      expect(wrapper.find(".build__title").text()).toBe("Theme builder");
      // 13 anchors + 0 derived (untouched tokens are hidden behind "Show all")
      expect(wrapper.findAll('input[type="color"]')).toHaveLength(13);
      expect(wrapper.find(".bvp").exists()).toBe(true);
      expect(errs.calls, `console.error: ${errs.calls.map((c) => c.join(" ")).join(" || ")}`).toHaveLength(0);
      expect(warns.calls, `console.warn: ${warns.calls.map((c) => c.join(" ")).join(" || ")}`).toHaveLength(0);
      wrapper.unmount();
    } finally {
      errs.restore();
      warns.restore();
    }
  });
});
