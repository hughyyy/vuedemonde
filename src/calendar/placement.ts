import type { CalendarEvent } from "./model";
import { sameDay } from "./model";

/** Time-grid placement math shared by the Week (Scheduler) and Day (Granular) views. */

export type PlacedEvent = {
  event: CalendarEvent;
  top: number; // px from the top of the grid
  height: number; // px
  left: number; // % of the day column
  width: number; // %
};

function toMin(d: Date): number {
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

/**
 * Position a day's events in an [hourStart, hourEnd) grid @ hourPx per hour.
 * Overlaps are shifted into lanes; each tile occupies 100/maxLanes % width.
 */
export function placeDay(
  day: Date,
  events: CalendarEvent[],
  hourStart = 8,
  hourEnd = 22,
  hourPx = 44,
  minH = 20,
): PlacedEvent[] {
  const totalMin = (hourEnd - hourStart) * 60;
  const totalPx = (hourEnd - hourStart) * hourPx;
  const on = events
    .filter((e) => !e.allDay && sameDay(e.start, day))
    .map((e) => {
      const s = Math.max(toMin(e.start), hourStart * 60);
      const dur = Math.max(0, toMin(e.end) - toMin(e.start));
      const t = Math.min(dur, totalMin);
      return { e, s, t };
    })
    .sort((a, b) => a.s - b.s);

  const laneEnd: number[] = [];
  const laneOf: number[] = on.map((it) => {
    let li = laneEnd.findIndex((end) => end <= it.s);
    if (li === -1) {
      li = laneEnd.length;
      laneEnd.push(0);
    }
    laneEnd[li] = Math.max(laneEnd[li], it.s + it.t + 1); // 1-minute gap between tiles
    return li;
  });

  const lanes = Math.max(1, laneEnd.length);
  const widthPct = 100 / lanes;
  return on.map((it, i) => ({
    event: it.e,
    top: ((it.s - hourStart * 60) / totalMin) * totalPx,
    height: Math.max(minH, (it.t / totalMin) * totalPx),
    left: laneOf[i] * widthPct,
    width: widthPct,
  }));
}

/** Current-time marker offset for `day`, or null when outside the grid window. */
export function nowTop(day: Date, hourStart = 8, hourEnd = 22, hourPx = 44, now = new Date()): number | null {
  if (!sameDay(day, now)) return null;
  const m = toMin(now);
  if (m < hourStart * 60 || m > hourEnd * 60) return null;
  const totalMin = (hourEnd - hourStart) * 60;
  return ((m - hourStart * 60) / totalMin) * (hourEnd - hourStart) * hourPx;
}
