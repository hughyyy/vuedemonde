// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ToastHost from "../src/kit/ToastHost.vue";
import { dismiss, notify, toasts } from "../src/kit/toasts";

describe("ToastHost — render + dismissal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    toasts.splice(0, toasts.length);
  });
  afterEach(() => {
    vi.useRealTimers();
    toasts.splice(0, toasts.length);
    document.body.innerHTML = "";
  });

  it("renders one message per toast with the kind class", () => {
    notify("err", "Boom");
    notify("ok", "Saved");
    const w = mount(ToastHost, { global: { stubs: { teleport: true } } });
    const messages = w.findAll(".toast-host__item");
    expect(messages).toHaveLength(2);
    expect(messages[0].text()).toContain("Boom");
    expect(messages[1].text()).toContain("Saved");
  });

  it("the close button dismisses its toast only", async () => {
    notify("info", "one");
    notify("info", "two");
    const w = mount(ToastHost, { global: { stubs: { teleport: true } } });
    const id = toasts[0]!.id;
    await w.findAll(".toast-host__item")[0].find("button").trigger("click");
    expect(toasts.map((t) => t.id)).toEqual([toasts.find((t) => t.id !== id)!.id]);
    expect(toasts.some((t) => t.id === id)).toBe(false);
  });

  it("auto-dismisses toasts after the duration", () => {
    notify("ok", "fade me");
    mount(ToastHost, { global: { stubs: { teleport: true } } });
    expect(toasts).toHaveLength(1);
    vi.advanceTimersByTime(4000);
    expect(toasts).toHaveLength(0);
  });

  it("dismiss() on an already-gone toast is a no-op", () => {
    notify("warn", "x");
    notify("warn", "y");
    mount(ToastHost, { global: { stubs: { teleport: true } } });
    dismiss(9999);
    expect(toasts).toHaveLength(2);
  });

  it("new toasts appear live while mounted", async () => {
    const w = mount(ToastHost, { global: { stubs: { teleport: true } } });
    notify("info", "late arrival");
    await w.vm.$nextTick();
    expect(w.findAll(".toast-host__item")).toHaveLength(1);
  });
});
