// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import ConfirmDialog from "../src/kit/ConfirmDialog.vue";
import DialogHost from "../src/kit/DialogHost.vue";
import { confirm, confirmState, settleConfirm } from "../src/kit/confirm";
import { closeDialog, dialogs, openDialog } from "../src/kit/dialogs";

/** Inline stub (render fn — no runtime compiler available) that reports its
 *  props and lets the test fire the host-wired close event. */
const StubDialog = defineComponent({
  name: "StubDialog",
  props: { text: { type: String, default: "" } },
  emits: ["close"],
  render() {
    return h(
      "button",
      { class: "stub-dialog__close", onClick: () => this.$emit("close") },
      `stub:${this.text}`,
    );
  },
});

let wrappers: VueWrapper[] = [];

function resetConfirmState(): void {
  confirmState.open = false;
  confirmState.resolve = null;
  confirmState.opts = { message: "" };
}

beforeEach(() => {
  resetConfirmState();
  dialogs.splice(0, dialogs.length);
});

describe("ConfirmDialog — service-backed confirm flow", () => {
  function mountDialog() {
    const w = mount(ConfirmDialog, { global: { stubs: { teleport: true } } });
    wrappers.push(w);
    return w;
  }

  function buttonByText(w: VueWrapper, text: string) {
    return w.findAll(".app-button").find((b) => b.text().trim() === text)!;
  }

  it("renders the pending confirm message and resolves true on Confirm", async () => {
    const p = confirm({ message: "Delete this run?" });
    const w = mountDialog();
    expect(w.find(".app-dialog").exists()).toBe(true);
    expect(w.find(".confirm-dialog__msg").text()).toBe("Delete this run?");
    expect(w.find(".app-dialog__title").text()).toBe("Confirm");
    await buttonByText(w, "Confirm").trigger("click");
    await expect(p).resolves.toBe(true);
    expect(w.find(".app-dialog").exists()).toBe(false); // settled dialog closes
  });

  it("Cancel resolves false", async () => {
    const p = confirm({ message: "Keep going?" });
    const w = mountDialog();
    await buttonByText(w, "Cancel").trigger("click");
    await expect(p).resolves.toBe(false);
    expect(confirmState.resolve).toBeNull();
  });

  it("custom labels, title and danger render on the dialog", async () => {
    const p = confirm({ message: "Go?", title: "Really?", confirmLabel: "Yes, delete", cancelLabel: "Keep", danger: true });
    const w = mountDialog();
    expect(w.find(".app-dialog__title").text()).toBe("Really?");
    expect(buttonByText(w, "Yes, delete").classes()).toContain("is-danger");
    expect(buttonByText(w, "Keep").classes()).toContain("is-ghost");
    await buttonByText(w, "Yes, delete").trigger("click");
    await expect(p).resolves.toBe(true);
  });

  it("a confirm() issued before mounting is picked up later (reactive state)", async () => {
    const p = confirm({ message: "Late mount?" });
    expect(confirmState.open).toBe(true);
    const w = mountDialog();
    expect(w.find(".confirm-dialog__msg").text()).toBe("Late mount?");
    await buttonByText(w, "Confirm").trigger("click");
    await expect(p).resolves.toBe(true);
  });

  it("after settling, a new confirm() opens the dialog again (reuse)", async () => {
    const first = confirm({ message: "First?" });
    const w = mountDialog();
    await buttonByText(w, "Cancel").trigger("click");
    await expect(first).resolves.toBe(false);
    const second = confirm({ message: "Second?" });
    await w.vm.$nextTick();
    expect(w.find(".app-dialog").exists()).toBe(true);
    expect(w.find(".confirm-dialog__msg").text()).toBe("Second?");
    await buttonByText(w, "Confirm").trigger("click");
    await expect(second).resolves.toBe(true);
  });

  it("the dialog close button also settles as a cancel", async () => {
    const p = confirm({ message: "Close via X?" });
    const w = mountDialog();
    await w.find(".app-dialog__close").trigger("click");
    await expect(p).resolves.toBe(false);
  });

  it("with no pending confirm the dialog stays closed", () => {
    const w = mountDialog();
    expect(w.find(".app-dialog").exists()).toBe(false);
    expect(settleConfirm(true)).toBeUndefined(); // no crash / no state flip
    expect(w.find(".app-dialog").exists()).toBe(false);
  });
});

describe("DialogHost — dynamic dialog registry", () => {
  function mountHost() {
    const w = mount(DialogHost, { global: { stubs: { teleport: true } } });
    wrappers.push(w);
    return w;
  }

  it("renders an opened spec with title, wrapper and bound props", async () => {
    const id = openDialog({ component: StubDialog, title: "Rename", width: "lg", props: { text: "new-name" } });
    const w = mountHost();
    expect(w.find(".app-dialog").exists()).toBe(true);
    expect(w.find(".app-dialog.is-lg").exists()).toBe(true);
    expect(w.find(".app-dialog__title").text()).toBe("Rename");
    expect(w.find(".stub-dialog__close").text()).toBe("stub:new-name");
    expect(id).toBeGreaterThan(0);
  });

  it("two dialogs render stacked in open order", async () => {
    openDialog({ component: StubDialog, title: "First", props: { text: "1" } });
    openDialog({ component: StubDialog, title: "Second", props: { text: "2" } });
    const w = mountHost();
    const titles = w.findAll(".app-dialog__title").map((t) => t.text());
    expect(titles).toEqual(["First", "Second"]);
  });

  it("a dialog's own close event removes exactly that dialog", async () => {
    const a = openDialog({ component: StubDialog, title: "First", props: { text: "1" } });
    openDialog({ component: StubDialog, title: "Second", props: { text: "2" } });
    const w = mountHost();
    await w.find(".stub-dialog__close").trigger("click"); // fires close on the first stub
    expect(dialogs.map((d) => d.id)).toEqual([a + 1]);
    expect(w.findAll(".app-dialog__title").map((t) => t.text())).toEqual(["Second"]);
  });

  it("the dialog close button calls closeDialog for its own id", async () => {
    const a = openDialog({ component: StubDialog, title: "First", props: { text: "1" } });
    openDialog({ component: StubDialog, title: "Second", props: { text: "2" } });
    const w = mountHost();
    await w.findAll(".app-dialog__close")[0].trigger("click");
    expect(dialogs.map((d) => d.id)).toEqual([a + 1]);
    expect(w.findAll(".app-dialog")).toHaveLength(1);
  });

  it("closeDialog(id) removes only the requested dialog and updates the DOM", async () => {
    const a = openDialog({ component: StubDialog, title: "First", props: { text: "1" } });
    const b = openDialog({ component: StubDialog, title: "Second", props: { text: "2" } });
    const w = mountHost();
    closeDialog(b);
    await w.vm.$nextTick();
    expect(w.findAll(".app-dialog__title").map((t) => t.text())).toEqual(["First"]);
    expect(w.find(".stub-dialog__close").text()).toBe("stub:1");
    closeDialog(a);
    await w.vm.$nextTick();
    expect(w.find(".app-dialog").exists()).toBe(false);
  });
});

afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
  resetConfirmState();
  dialogs.splice(0, dialogs.length);
  document.body.innerHTML = "";
});
