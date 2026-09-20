import { reactive } from "vue";

/** Promise-based confirm service backing ConfirmDialog / ConfirmPopup. */

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

export const confirmState = reactive<{
  open: boolean;
  opts: ConfirmOptions;
  resolve: ((v: boolean) => void) | null;
}>({
  open: false,
  opts: { message: "" },
  resolve: null,
});

/** Ask the user; resolves with true when they confirm. */
export function confirm(opts: ConfirmOptions): Promise<boolean> {
  confirmState.opts = {
    title: "Confirm",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    danger: false,
    ...opts,
  };
  confirmState.open = true;
  const { promise, resolve } = Promise.withResolvers<boolean>();
  confirmState.resolve = resolve;
  return promise;
}

export function settleConfirm(v: boolean): void {
  confirmState.open = false;
  const r = confirmState.resolve;
  confirmState.resolve = null;
  r?.(v);
}
