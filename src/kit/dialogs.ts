import { reactive, type Component } from "vue";

/** DynamicDialog service — open arbitrary components in dialogs at runtime. */

export type DialogSpec = {
  id: number;
  component: Component;
  title?: string;
  width?: "sm" | "md" | "lg";
  props?: Record<string, unknown>;
};

export const dialogs = reactive<DialogSpec[]>([]);

let seq = 0;

export function openDialog(spec: Omit<DialogSpec, "id">): number {
  const id = ++seq;
  dialogs.push({ ...spec, id });
  return id;
}

export function closeDialog(id: number): void {
  const i = dialogs.findIndex((d) => d.id === id);
  if (i >= 0) dialogs.splice(i, 1);
}
