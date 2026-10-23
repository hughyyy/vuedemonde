// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, withDirectives, type Directive } from "vue";
import { mount } from "@vue/test-utils";
import { FormDirectives, animateOnScroll, keyFilter, mask, ripple, styleClass } from "../src/kit/directives";

/** Renders `<tag>` carrying a directive bound to `arg` as its value. */
const Host = defineComponent({
  props: {
    dir: { type: Object as () => Directive, required: true },
    arg: { type: String, default: "" },
    value: { type: String, default: "" },
    tag: { type: String, default: "input" },
  },
  setup(props) {
    return () =>
      withDirectives(
        h(props.tag, { value: props.tag === "input" ? props.value : undefined }),
        [[props.dir, props.arg]],
      );
  },
});

function mountHost(dir: Directive, arg = "", value = "", tag = "input") {
  return mount(Host, { props: { dir, arg, value, tag } });
}

describe("v-mask — input formatting", () => {
  it("formats digits around literal separators", async () => {
    const w = mountHost(mask, "###-####");
    const el = w.element as HTMLInputElement;
    el.value = "12345678";
    await w.find("input").trigger("input");
    expect(el.value).toBe("123-4567");
  });

  it("drops characters that overflow the pattern", async () => {
    const w = mountHost(mask, "###-####");
    const el = w.element as HTMLInputElement;
    el.value = "123456789";
    await w.find("input").trigger("input");
    expect(el.value).toBe("123-4567");
  });

  it("strips characters that do not fit the slot type", async () => {
    const w = mountHost(mask, "###");
    const el = w.element as HTMLInputElement;
    el.value = "1a2b3";
    await w.find("input").trigger("input");
    expect(el.value).toBe("123");
  });

  it("skips letter slots for digits and vice versa", async () => {
    const letters = mountHost(mask, "AAA");
    const le = letters.element as HTMLInputElement;
    le.value = "ab1";
    await letters.find("input").trigger("input");
    expect(le.value).toBe("ab");

    const digits = mountHost(mask, "###");
    const de = digits.element as HTMLInputElement;
    de.value = "1a2";
    await digits.find("input").trigger("input");
    expect(de.value).toBe("12");
  });

  it("X accepts any alphanumeric character", async () => {
    const w = mountHost(mask, "XX-XX");
    const el = w.element as HTMLInputElement;
    el.value = "a1-b2";
    await w.find("input").trigger("input");
    expect(el.value).toBe("a1-b2");
  });

  it("leaves the value alone when the pattern is empty", async () => {
    const w = mountHost(mask, "");
    const el = w.element as HTMLInputElement;
    el.value = "123";
    await w.find("input").trigger("input");
    expect(el.value).toBe("123");
  });
});

describe("v-key-filter — keystroke allow-lists", () => {
  function dispatch(el: Element, data: string | null): boolean {
    const e = new InputEvent("beforeinput", { data, cancelable: true, bubbles: true });
    el.dispatchEvent(e);
    return e.defaultPrevented;
  }

  it("blocks disallowed single characters and allows allowed ones", () => {
    const w = mountHost(keyFilter, "int");
    const el = w.element;
    expect(dispatch(el, "x")).toBe(true);
    expect(dispatch(el, " ")).toBe(true);
    expect(dispatch(el, "-")).toBe(true); // "-" alone is not a valid int
    expect(dispatch(el, "5")).toBe(false);
    expect(dispatch(el, "-5")).toBe(false); // multi-char input passes through
  });

  it("honours a custom regexp rule", () => {
    const ReHost = defineComponent({
      setup() {
        const re = /^[0-9]$/;
        return () => withDirectives(h("input"), [[keyFilter, re]]);
      },
    });
    const rw = mount(ReHost);
    expect(dispatch(rw.element, "a")).toBe(true);
    expect(dispatch(rw.element, "7")).toBe(false);
  });

  it("never blocks deletions or multi-character input (compositions/paste)", () => {
    const w = mountHost(keyFilter, "pint");
    const el = w.element;
    expect(dispatch(el, null)).toBe(false);
    expect(dispatch(el, "abc")).toBe(false);
  });

  it("an unknown preset allows everything through", () => {
    const w = mountHost(keyFilter, "nope");
    const el = w.element;
    expect(dispatch(el, "~")).toBe(false);
  });
});

describe("v-ripple — material ripple span lifecycle", () => {
  it("appends a .ripple span on pointerdown and removes it on animationend", async () => {
    const w = mountHost(ripple);
    const el = w.element as HTMLElement;
    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 10, clientY: 10 }));
    const span = el.querySelector(".ripple");
    expect(span).not.toBeNull();
    span!.dispatchEvent(new Event("animationend"));
    expect(el.querySelector(".ripple")).toBeNull();
  });
});

describe("v-style-class — click toggles", () => {
  it("toggles the bound class on each click", () => {
    const w = mountHost(styleClass, "active", "", "div");
    const el = w.element;
    expect(el.classList.contains("active")).toBe(false);
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(el.classList.contains("active")).toBe(true);
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(el.classList.contains("active")).toBe(false);
  });
});

describe("v-animate-on-scroll — reveal on intersection", () => {
  type ObserverCb = (entries: { isIntersecting: boolean }[]) => void;
  let cb: ObserverCb = () => {};
  const observe = vi.fn();
  const disconnect = vi.fn();
  class FakeIO {
    constructor(c: ObserverCb) {
      cb = c;
    }
    observe = observe;
    disconnect = disconnect;
    unobserve() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [0.2];
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    cb = () => {};
    observe.mockClear();
    disconnect.mockClear();
  });

  it("adds is-visible when intersecting and keeps it once", () => {
    vi.stubGlobal("IntersectionObserver", FakeIO);
    const w = mountHost(animateOnScroll, undefined, "", "div");
    const el = w.element;
    expect(el.classList.contains("aos-init")).toBe(true);
    expect(el.classList.contains("is-visible")).toBe(false);
    expect(observe).toHaveBeenCalledWith(el);

    cb([{ isIntersecting: true }]);
    expect(el.classList.contains("is-visible")).toBe(true);
    expect(disconnect).toHaveBeenCalled(); // once: true by default

    cb([{ isIntersecting: false }]);
    expect(el.classList.contains("is-visible")).toBe(true); // stays revealed
  });

  it("with once: false the class follows the intersection state", () => {
    vi.stubGlobal("IntersectionObserver", FakeIO);
    const w = mount(
      defineComponent({
        setup() {
          return () => withDirectives(h("div"), [[animateOnScroll, { animation: "aos-zoom", once: false }]]);
        },
      }),
    );
    const el = w.element;
    expect(el.classList.contains("aos-zoom")).toBe(true);
    cb([{ isIntersecting: true }]);
    expect(el.classList.contains("is-visible")).toBe(true);
    expect(disconnect).not.toHaveBeenCalled();
    cb([{ isIntersecting: false }]);
    expect(el.classList.contains("is-visible")).toBe(false);
    cb([{ isIntersecting: true }]);
    expect(el.classList.contains("is-visible")).toBe(true);
  });
});

describe("FormDirectives installer", () => {
  it("registers all five directives", () => {
    const registered: string[] = [];
    FormDirectives.install({ directive: (name) => registered.push(name) });
    expect(registered).toEqual(["mask", "key-filter", "ripple", "animate-on-scroll", "style-class"]);
  });
});
