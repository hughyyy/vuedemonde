/**
 * Audit-suite environment shims — happy-dom lacks a couple of browser APIs
 * that mounted components touch; stub them inertly so the suite reports on
 * component behaviour, not environment gaps.
 */

class InertResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  (globalThis as Record<string, unknown>).ResizeObserver = InertResizeObserver;
}

const media = window.matchMedia;
if (!media) {
  const stub = {
    matches: false,
    media: "",
    onchange: null,
    addListener(): void {},
    removeListener(): void {},
    addEventListener(): void {},
    removeEventListener(): void {},
    dispatchEvent(): boolean {
      return false;
    },
  };
  window.matchMedia = () => stub;
}
