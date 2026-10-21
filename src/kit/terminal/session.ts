/**
 * TermSession — the per-terminal buffer owning an AnsiParser plus a capped
 * scrollback, a follow-tail flag, and change notifications. This is the unit
 * transports stream into (see ./transports.ts) and the Terminal.vue kit
 * component subscribes to for rendering.
 *
 * The design keeps the parser dumb and pure (no timers/DOM); the session adds
 * the scrollback ring + notification. All sources — demo generators, SSE, a
 * run's live output, a future xterm.js backend — funnel through `append`.
 */

import { AnsiParser, type TermLine } from "./ansi";

export const DEFAULT_SCROLLBACK = 5000;

export class TermSession {
  readonly id: string;
  label: string;
  scrollbackMax: number;
  followTail: boolean;

  private parser = new AnsiParser();
  private readonly listeners = new Set<(s: TermSession) => void>();

  constructor(opts: { id: string; label: string; scrollbackMax?: number; followTail?: boolean }) {
    this.id = opts.id;
    this.label = opts.label;
    this.scrollbackMax = opts.scrollbackMax ?? DEFAULT_SCROLLBACK;
    this.followTail = opts.followTail ?? true;
  }

  /** Feed raw text or bytes. Splits across chunks are handled by the parser.
   * `source` tags the producer so each resulting line is stamped (a combined
   * multi-source terminal prefixes `[source]` per line). */
  append(chunk: string | Uint8Array, source?: string): void {
    const text = typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
    if (!text) return;
    this.parser.push(text, source);
    this.trimScrollback();
    this.notify();
  }

  clear(): void {
    this.parser.clear();
    this.notify();
  }

  /** Subscribe to content changes; returns an unsubscribe fn. */
  onChange(fn: (s: TermSession) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  dispose(): void {
    this.listeners.clear();
  }

  /* ---- read surface for the renderer -------------------------------- */

  /** Total renderable lines, including the always-present in-progress line. */
  get totalLines(): number {
    return this.parser.lines.length + 1;
  }

  lineAt(index: number): TermLine {
    const completed = this.parser.lines.length;
    if (index < completed) return this.parser.lines[index];
    return this.parser.current;
  }

  /** Plain-text rendering (copy / tests / diffing). Trailing spaces trimmed;
   * an empty current line (no trailing newline yet) is not included. */
  text(): string {
    const parts: string[] = [];
    for (const l of this.parser.lines) {
      parts.push(l.runs.map((r) => r.text).join("").replace(/\s+$/, ""));
    }
    const cur = this.parser.current.runs.map((r) => r.text).join("").replace(/\s+$/, "");
    if (cur) parts.push(cur);
    return parts.join("\n");
  }

  private trimScrollback(): void {
    const overflow = this.parser.lines.length - this.scrollbackMax;
    if (overflow > 0) this.parser.lines.splice(0, overflow);
  }

  private notify(): void {
    for (const fn of this.listeners) fn(this);
  }
}
