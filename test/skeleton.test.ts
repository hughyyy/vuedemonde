// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../src/kit/Skeleton.vue";

describe("Skeleton — decorative contract", () => {
  it("hides single shapes and text-line modes from assistive tech", () => {
    const box = mount(Skeleton);
    expect(box.attributes("aria-hidden")).toBe("true");
    const text = mount(Skeleton, { props: { shape: "text", lines: 3 } });
    expect(text.find(".skeleton-text").attributes("aria-hidden")).toBe("true");
  });
});
