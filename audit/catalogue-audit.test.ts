// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { COMPONENT_DEMOS, CATALOGUE_GROUPS } from "../playground/src/catalogue";
import { CATALOGUE_THEMES } from "../scripts/catalogue-themes.mjs";

/**
 * Catalogue render audit — the per-component counterpart of the family-section
 * audit. Every demo is mounted under every catalogue theme (six: three dark,
 * three light) in print mode, and any console error/warning (Vue warnings
 * included) fails the case.
 *
 * This is what catches a demo that only works on a neutral grey theme, or one
 * whose print-gated overlay throws when opened.
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
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
}

const ids = Object.keys(COMPONENT_DEMOS);

describe("audit: catalogue registry", () => {
  it("covers every group and renders a non-empty demo", () => {
    expect(ids.length).toBeGreaterThan(100);
    const used = new Set(Object.values(COMPONENT_DEMOS).map((e) => e.group));
    for (const group of CATALOGUE_GROUPS) expect(used, `group ${group}`).toContain(group);
  });
});

describe("audit: every catalogue demo renders under every catalogue theme", () => {
  for (const id of ids) {
    const entry = COMPONENT_DEMOS[id]!;
    for (const theme of CATALOGUE_THEMES) {
      it(`${id} @ ${theme}`, async () => {
        document.documentElement.dataset.theme = theme;
        const errs = capture("error");
        const warns = capture("warn");
        let wrapper: VueWrapper | undefined;
        try {
          wrapper = mount(entry.demo as never, { props: { print: true } });
          await settle(wrapper);
          // Every demo must render something: an empty demo is a broken image.
          expect(wrapper.html().length, `${id} rendered nothing`).toBeGreaterThan(80);
          expect(errs.calls, `console.error: ${errs.calls.map((c) => c.join(" ")).join(" || ")}`).toHaveLength(0);
          expect(warns.calls, `console.warn: ${warns.calls.map((c) => c.join(" ")).join(" || ")}`).toHaveLength(0);
        } finally {
          wrapper?.unmount();
          errs.restore();
          warns.restore();
          delete document.documentElement.dataset.theme;
        }
      });
    }
  }
});
