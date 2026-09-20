/**
 * Inline SVG icon set — authored for the app (spec §9 #3 lean: no icon lib).
 * Stroke-based (24 viewBox), currentColor, stroke-width 2, round caps/joins.
 */
export type IconName =
  | "run" | "stop" | "plus" | "settings" | "close" | "chevron-down"
  | "chevron-right" | "chevron-left" | "chevron-up" | "search" | "info" | "check" | "warn"
  | "trash" | "edit" | "copy" | "spinner" | "folder" | "node" | "theme"
  | "question"
  | "home" | "inbox" | "bell" | "chart" | "users" | "calendar" | "credit"
  | "star" | "more" | "sidebar" | "moon" | "eye";

const PATHS: Record<IconName, string[]> = {
  run: [
    "M6 5.5v13a1 1 0 0 0 1.53.85l10.4-6.5a1 1 0 0 0 0-1.7L7.53 4.65A1 1 0 0 0 6 5.5Z",
  ],
  stop: ["M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"],
  plus: ["M12 5v14M5 12h14"],
  settings:
    ["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
     "M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.07 3.2l.06.06a1.7 1.7 0 0 0 1.87.34h.08a1.7 1.7 0 0 0 1-1.55V2a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"],
  close: ["M6 6l12 12M18 6L6 18"],
  "chevron-down": ["M6 9l6 6 6-6"],
  "chevron-right": ["M9 6l6 6-6 6"],
  "chevron-left": ["M15 18l-6-6 6-6"],
  "chevron-up": ["M6 15l6-6 6 6"],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z", "m21 21-4.3-4.3"],
  info: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 16v-6", "M12 8h.01"],
  check: ["M4 12.5l5 5L20 6.5"],
  warn: ["M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z", "M12 9v4", "M12 17h.01"],
  trash: ["M3 6h18", "M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M10 11v6", "M14 11v6"],
  edit: ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"],
  copy: ["M8 8h12v12H8z", "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"],
  spinner: ["M12 3a9 9 0 1 0 9 9"],
  folder: ["M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"],
  node: ["M12 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2 2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", "M12 17v4", "M8 21h8"],
  theme: ["M12 3a9 9 0 1 0 0 18c.7 0 1.4-.1 2-.3A7 7 0 0 0 16 7a7 7 0 0 0-4-4Z"],
  question: ["M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3", "M12 17h.01"],
  home: ["M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5.5v-6.5h-5V21H4a1 1 0 0 1-1-1Z"],
  inbox: ["M2 12h5l2 3h6l2-3h5", "M5.4 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.1Z"],
  bell: ["M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z", "M13.7 21a2 2 0 0 1-3.4 0"],
  chart: ["M18 20V10", "M12 20V4", "M6 20v-6"],
  users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M23 21v-2a4 4 0 0 0-3-3.9", "M16 3.1a4 4 0 0 1 0 7.8"],
  calendar: ["M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z", "M2 9.5h20", "M8 2.5v3", "M16 2.5v3"],
  credit: ["M2 5h20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z", "M1 9.5h22", "M5 15h4"],
  star: ["M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6-4.3-4.2 6-.9Z"],
  more: ["M12 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", "M12 20.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"],
  sidebar: ["M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z", "M9 4v16"],
  moon: ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"],
  eye: ["M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
};

export function iconPaths(name: IconName): string[] {
  return PATHS[name];
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[];
