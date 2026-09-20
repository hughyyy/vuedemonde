/** Calendar model, date/range utils, and seed — shared by the three views. */

export type EventTint = "indigo" | "orange" | "emerald" | "rose" | "sky" | "amber";

/** Pastel event tints (soft bg + readable text of the same hue). */
export const EVENT_TINTS = {
  indigo: { bg: "rgba(99,102,241,0.14)", text: "#6366f1" },
  orange: { bg: "rgba(249,115,22,0.16)", text: "#f97316" },
  emerald: { bg: "rgba(16,185,129,0.15)", text: "#10b981" },
  rose: { bg: "rgba(244,63,94,0.14)", text: "#e11d48" },
  sky: { bg: "rgba(14,165,233,0.14)", text: "#0369a1" },
  amber: { bg: "rgba(245,158,11,0.15)", text: "#b45309" },
} as const;

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  tint?: EventTint;
  allDay?: boolean;
  location?: string;
};

/* --- date helpers --- */

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Week containing d; weeks start Sunday (matches the reference grid). */
export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** 6 weeks × 7 days covering the month, padded with adjacent-month days. */
export function monthMatrix(anchor: Date): Date[][] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) row.push(addDays(gridStart, w * 7 + i));
    weeks.push(row);
  }
  return weeks;
}

export function weekDays(anchor: Date): Date[] {
  const s = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(s, i));
}

/* --- formatting --- */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function fmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function fmtMonthTitle(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtWeekTitle(anchor: Date): string {
  const a = startOfWeek(anchor);
  const b = addDays(a, 6);
  const sameMonth = a.getMonth() === b.getMonth();
  return `${sameMonth ? "" : MONTHS[a.getMonth()].slice(0, 3) + " "}${a.getDate()} – ${sameMonth ? MONTHS[b.getMonth()].slice(0, 3) + " " : ""}${b.getDate()}, ${b.getFullYear()}`;
}

export function fmtDayTitle(d: Date): string {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()} ${d.getFullYear()}`;
}

/* --- seed --- */

let seq = 0;
export function ev(id: string, title: string, start: Date, end: Date, tint: EventTint, allDay = false, location?: string): CalendarEvent {
  return { id: `${id}-${++seq}`, title, start, end, tint, allDay, location };
}

/** Demo events around today so every view shows content. */
export function seedEvents(now = new Date()): CalendarEvent[] {
  const t = startOfDay(now);
  const at = (day: number, h: number, m = 0) => {
    const d = addDays(t, day);
    d.setHours(h, m, 0, 0);
    return d;
  };
  return [
    ev("sync", "Platform sync", at(0, 9, 0), at(0, 9, 45), "indigo", false, "Ops room 2"),
    ev("standup", "Stand-up", at(0, 9, 45), at(0, 10, 15), "sky", false, "Zoom"),
    ev("design", "Design review — tokens", at(0, 11, 0), at(0, 12, 0), "rose", false, "Studio"),
    ev("launch", "Q3 launch freeze", at(2, 0, 0), at(2, 0, 0), "rose", true),
    ev("ops", "Field dispatch briefing", at(2, 14, 0), at(2, 15, 30), "orange"),
    ev("release", "Release cut v0.2", at(3, 16, 0), at(3, 17, 0), "emerald"),
    ev("plan", "Sprint planning", at(-1, 10, 0), at(-1, 11, 30), "indigo"),
    ev("retro", "Sprint retro", at(4, 15, 0), at(4, 16, 0), "amber"),
    ev("check", "Infra window — Sydney", at(5, 13, 0), at(5, 14, 30), "emerald", false, "DC-1"),
    ev("mtg", "Stakeholder update", at(6, 12, 30), at(6, 13, 15), "sky"),
  ];
}
