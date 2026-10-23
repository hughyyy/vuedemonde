// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { closeDialog, dialogs, openDialog } from "../src/kit/dialogs";
import { confirm, confirmState, settleConfirm } from "../src/kit/confirm";
import { dismiss, notify, toasts } from "../src/kit/toasts";

function clearToasts(): void {
  toasts.splice(0, toasts.length);
}

describe("toasts service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearToasts();
  });
  afterEach(() => {
    vi.useRealTimers();
    clearToasts();
  });

  it("notify pushes a kind+message toast with an id", () => {
    notify("err", "Boom");
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ kind: "err", message: "Boom" });
    expect(toasts[0]!.id).toBeGreaterThan(0);
  });

  it("keeps toasts in insertion order with unique ids", () => {
    notify("info", "one");
    notify("warn", "two");
    expect(toasts.map((t) => t.message)).toEqual(["one", "two"]);
    expect(toasts[0]!.id).not.toBe(toasts[1]!.id);
  });

  it("auto-dismisses after the duration", () => {
    notify("ok", "bye");
    expect(toasts).toHaveLength(1);
    vi.advanceTimersByTime(4000);
    expect(toasts).toHaveLength(0);
  });

  it("does not dismiss early", () => {
    notify("ok", "sticky for now");
    vi.advanceTimersByTime(3999);
    expect(toasts).toHaveLength(1);
  });

  it("dismiss removes only the matching toast", () => {
    notify("info", "one");
    notify("info", "two");
    dismiss(toasts[0]!.id);
    expect(toasts.map((t) => t.message)).toEqual(["two"]);
  });

  it("dismiss of an unknown id and an already-dismissed toast are no-ops", () => {
    notify("info", "one");
    dismiss(9999);
    expect(toasts).toHaveLength(1);
    const id = toasts[0]!.id;
    dismiss(id);
    dismiss(id);
    expect(toasts).toHaveLength(0);
  });
});

describe("confirm service", () => {
  beforeEach(() => {
    confirmState.open = false;
    confirmState.resolve = null;
    confirmState.opts = { message: "" };
  });

  it("opens with defaults merged under custom options and resolves on confirm", async () => {
    const p = confirm({ message: "Delete?" });
    expect(confirmState.open).toBe(true);
    expect(confirmState.opts).toMatchObject({
      message: "Delete?",
      title: "Confirm",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      danger: false,
    });
    settleConfirm(true);
    await expect(p).resolves.toBe(true);
    expect(confirmState.open).toBe(false);
    expect(confirmState.resolve).toBeNull();
  });

  it("honours every custom option and resolves false on cancel", async () => {
    const p = confirm({ message: "Go?", title: "Really?", confirmLabel: "Yes", cancelLabel: "No", danger: true });
    expect(confirmState.opts).toMatchObject({ title: "Really?", confirmLabel: "Yes", cancelLabel: "No", danger: true });
    settleConfirm(false);
    await expect(p).resolves.toBe(false);
  });

  it("a later request supersedes an unsettled one (old promise never settles)", () => {
    const first = confirm({ message: "first" });
    const second = confirm({ message: "second" });
    settleConfirm(true);
    expect(confirmState.opts.message).toBe("second");
    void first; // intentionally unsettled
    void second.then(() => {});
  });

  it("settleConfirm with no pending request is a no-op", () => {
    expect(() => settleConfirm(true)).not.toThrow();
    expect(confirmState.open).toBe(false);
  });
});

describe("dialogs service", () => {
  beforeEach(() => {
    dialogs.splice(0, dialogs.length);
  });

  it("openDialog pushes a spec with a generated id and returns it", () => {
    const id = openDialog({ component: { name: "Mock" }, title: "T", width: "md", props: { a: 1 } });
    expect(typeof id).toBe("number");
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0]).toMatchObject({ id, title: "T", width: "md", props: { a: 1 } });
  });

  it("ids are unique across opens", () => {
    const first = openDialog({ component: { name: "A" } });
    const second = openDialog({ component: { name: "B" } });
    expect(dialogs.map((d) => d.id)).toEqual([first, second]);
    expect(second).not.toBe(first);
  });

  it("closeDialog removes exactly the requested dialog", () => {
    const a = openDialog({ component: { name: "A" } });
    const b = openDialog({ component: { name: "B" } });
    expect(b).toBeGreaterThan(a);
    closeDialog(a);
    expect(dialogs.map((d) => d.component)).toEqual([{ name: "B" }]);
  });

  it("closeDialog for an unknown id is a no-op", () => {
    openDialog({ component: { name: "A" } });
    closeDialog(424242);
    expect(dialogs).toHaveLength(1);
  });
});
