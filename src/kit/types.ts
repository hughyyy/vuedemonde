/** Shared option/prop types for the kit components (re-exported by index.ts). */

import type { IconName } from "./icons";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type RadioOption = { value: string; label: string; disabled?: boolean };

export type TabDef = { id: string; label: string; badge?: string | number; disabled?: boolean };

export type AccordionItem = { id: string; title: string };

export type MenuAction = {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
  /** Renders a check glyph on the right — for radio-style pickers (e.g. themes). */
  checked?: boolean;
};

export type TimelineItem = {
  id: string;
  title: string;
  time?: string;
  icon?: IconName;
  tint?: "ok" | "warn" | "err" | "info" | "run" | "accent";
  content?: string;
};

export type ColumnDef = {
  field: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
};

export type TreeNode = {
  id: string;
  label: string;
  icon?: IconName;
  children?: TreeNode[];
  /** starts expanded when set (also: `expandAll` on the consumer). */
  expanded?: boolean;
  /** extra cell values for TreeTable. */
  row?: Record<string, unknown>;
  disabled?: boolean;
};

export type OrgNode = {
  id: string;
  label: string;
  role?: string;
  icon?: IconName;
  tint?: "accent" | "ok" | "info" | "warn";
  children?: OrgNode[];
};

export type BreadcrumbItem = { id: string; label: string; disabled?: boolean };

export type MenubarItem = { id: string; label: string; icon?: IconName; children?: MenuAction[] };

export type TieredItem = {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  danger?: boolean;
  children?: TieredItem[];
};

export type MegaColumn = { title?: string; items: { id: string; label: string; icon?: IconName }[] };
export type MegaItem = { id: string; label: string; icon?: IconName; columns?: MegaColumn[] };

export type DockItem = { id: string; label: string; icon: IconName };

export type CommandItem = { id: string; label: string; icon?: IconName; group?: string; keywords?: string };

export type StepperItem = { id: string; label: string; optional?: boolean };

export type MenuSeparator = { id: string; separator: true };

export type MenuItem = MenuAction | MenuSeparator;
