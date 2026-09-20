import { reactive } from "vue";

export type ToastKind = "info" | "ok" | "warn" | "err";

export type Toast = { id: number; kind: ToastKind; message: string };

const toasts = reactive<Toast[]>([]);

let seq = 0;
const DURATION_MS = 4000;

/** Push a toast; it auto-dismisses after DURATION_MS. */
export function notify(kind: ToastKind, message: string): void {
  const id = ++seq;
  toasts.push({ id, kind, message });
  window.setTimeout(() => dismiss(id), DURATION_MS);
}

export function dismiss(id: number): void {
  const i = toasts.findIndex((t) => t.id === id);
  if (i >= 0) toasts.splice(i, 1);
}

export { toasts };
