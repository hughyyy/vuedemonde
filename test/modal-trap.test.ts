// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref, type PropType } from "vue";
import { mount } from "@vue/test-utils";
import { useModalTrap } from "../src/kit/useModalTrap";

const Shell = defineComponent({
  props: {
    open: { type: Boolean, default: true },
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null);
    useModalTrap(root, props.onClose);
    return () =>
      props.open
        ? h(
            "div",
            { ref: root, role: "dialog" },
            [
              h("button", "first"),
              h("input", { type: "text", placeholder: "mid" }),
              h("a", { href: "#tail" }, "tail"),
            ],
          )
        : h("div", { role: "dialog" }, [h("button", "ghost")]);
  },
});

function mountShell(onClose = vi.fn()) {
  const wrapper = mount(Shell, { props: { onClose }, attachTo: document.body });
  return { wrapper, onClose };
}

function key(key: string, shift = false): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey: shift, cancelable: true }));
}

describe("useModalTrap — focus containment + Escape", () => {
  it("focuses the first focusable when the modal appears", async () => {
    const { wrapper } = mountShell();
    await wrapper.vm.$nextTick();
    const first = wrapper.find("button");
    expect(document.activeElement).toBe(first.element);
    wrapper.unmount();
  });

  it("Escape closes once and only while the modal is present", async () => {
    const { wrapper, onClose } = mountShell();
    key("Escape");
    expect(onClose).toHaveBeenCalledTimes(1);
    // modal closed → the trap is inert
    await wrapper.setProps({ open: false });
    key("Escape");
    expect(onClose).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it("Escape does not fire while the root ref is detached (before mount)", () => {
    const onClose = vi.fn();
    // component that never attaches a root: trap must stay inert
    const Bare = defineComponent({
      setup() {
        const root = ref<HTMLElement | null>(null);
        useModalTrap(root, onClose);
        return () => h("div");
      },
    });
    const w = mount(Bare, { attachTo: document.body });
    key("Escape");
    expect(onClose).not.toHaveBeenCalled();
    w.unmount();
  });

  it("Tab from the last element wraps to the first; Shift+Tab from the first wraps back", async () => {
    const { wrapper } = mountShell();
    await wrapper.vm.$nextTick();
    const [first, , last] = wrapper.findAll<HTMLElement>("button, input, a");
    last.element.focus();
    key("Tab");
    expect(document.activeElement).toBe(first.element);
    first.element.focus();
    key("Tab", true);
    expect(document.activeElement).toBe(last.element);
    wrapper.unmount();
  });

  it("Tab with a single focusable does not loop into an infinite event", async () => {
    const Single = defineComponent({
      setup() {
        const root = ref<HTMLElement | null>(null);
        useModalTrap(root, vi.fn());
        return () => h("div", { ref: root }, [h("button", "only")]);
      },
    });
    const wrapper = mount(Single, { attachTo: document.body });
    await wrapper.vm.$nextTick();
    const only = wrapper.find("button");
    only.element.focus();
    // first === last: both branches guard on equality, so this must not throw
    key("Tab");
    expect(document.activeElement).toBe(only.element);
    wrapper.unmount();
  });

  it("Tab with no focusables is a no-op", async () => {
    const Empty = defineComponent({
      setup() {
        const root = ref<HTMLElement | null>(null);
        useModalTrap(root, vi.fn());
        return () => h("div", { ref: root }, [h("p", "nothing here")]);
      },
    });
    const wrapper = mount(Empty, { attachTo: document.body });
    await wrapper.vm.$nextTick();
    expect(() => key("Tab")).not.toThrow();
    wrapper.unmount();
  });

  it("removes its keydown listener on unmount", async () => {
    const { wrapper, onClose } = mountShell();
    wrapper.unmount();
    key("Escape");
    expect(onClose).not.toHaveBeenCalled();
  });
});
