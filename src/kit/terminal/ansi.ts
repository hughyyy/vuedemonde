/**
 * Terminal ANSI parser — turns a VT-ish byte/string stream into styled lines.
 *
 * Self-built on purpose (docs/spec-terminal-component.md): a streaming, line
 * oriented SGR renderer. It faithfully renders what real process output emits
 * — colours (16 / 256 / 24-bit), `\r`-overwritten progress lines, backspaces,
 * tabs, erase-in-line, clear-screen — WITHOUT the full grid/cursor-addressing
 * semantics of a terminal emulator (that is the future emulator backend slot,
 * e.g. xterm.js, behind the same `TermSession` interface).
 *
 * Model: a buffer of `TermLine`s. Each line is a list of styled runs plus a
 * write `cursor` column and the `width` in columns. `\r` resets the cursor to
 * column 0 and subsequent text overwrites (progress-bar semantics); `\b` steps
 * left (overwrite too). Newlines commit the current line and start a fresh one.
 *
 * The parser is pure: `push(chunk)` mutates internal state only; no timers, no
 * DOM. All rendering/colouring decisions are applied elsewhere (the component
 * maps ANSI indices onto design tokens).
 */

export type TermStyle = {
  /** ANSI palette index 0..255 (16 base + 256-colour table). */
  fgIndex?: number;
  bgIndex?: number;
  /** 24-bit RGB, when the stream emitted 38;2;… / 48;2;… (truecolour). */
  fgRgb?: readonly [number, number, number];
  bgRgb?: readonly [number, number, number];
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  inverse?: boolean;
};

export type TermRun = { text: string; style: TermStyle };

/** A line of terminal content as styled runs. `cursor` is the write column,
 * `width` the content width in columns (may exceed the render viewport);
 * `startedAt` is the epoch-ms time the line began (for the optional per-line
 * timestamps the terminal can prefix, on by default); `source` is the producer
 * tag of the chunk that started the line (for a combined multi-source feed,
 * so the terminal can prefix `[source]` per line). */
export type TermLine = { runs: TermRun[]; cursor: number; width: number; startedAt?: number; source?: string };

export function blankLine(): TermLine {
  return { runs: [], cursor: 0, width: 0 };
}

/** Standard xterm 256-colour table (indices 16..255), as `#rrggbb`. */
export const XTERM256: readonly string[] = (() => {
  const table: string[] = new Array(256).fill("#000000");
  // 16..231 — 6×6×6 colour cube
  const levels = [0x00, 0x5f, 0x87, 0xaf, 0xd7, 0xff];
  let i = 16;
  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels) {
        table[i++] = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      }
    }
  }
  // 232..255 — grayscale ramp ((n*10)+8, 8..238)
  for (let k = 0; k < 24; k++) {
    const v = 8 + k * 10;
    table[i++] = `#${[v, v, v].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }
  return table;
})();

/** Resolve an ANSI palette index to a CSS colour. Indices 0..15 come from the
 * caller-supplied `palette16` (theme-dependent, so the component maps those
 * onto design tokens); 16..255 come from the fixed xterm table. */
export function ansiColorCss(index: number, palette16: readonly string[]): string {
  if (index >= 16 && index < 256) return XTERM256[index];
  return palette16[index] ?? palette16[7] ?? "#cccccc";
}

function sameStyle(a: TermStyle, b: TermStyle): boolean {
  return (
    a.fgIndex === b.fgIndex &&
    a.bgIndex === b.bgIndex &&
    (a.fgRgb?.[0] ?? -1) === (b.fgRgb?.[0] ?? -1) &&
    (a.fgRgb?.[1] ?? -1) === (b.fgRgb?.[1] ?? -1) &&
    (a.fgRgb?.[2] ?? -1) === (b.fgRgb?.[2] ?? -1) &&
    (a.bgRgb?.[0] ?? -1) === (b.bgRgb?.[0] ?? -1) &&
    (a.bgRgb?.[1] ?? -1) === (b.bgRgb?.[1] ?? -1) &&
    (a.bgRgb?.[2] ?? -1) === (b.bgRgb?.[2] ?? -1) &&
    a.bold === b.bold &&
    a.dim === b.dim &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.inverse === b.inverse
  );
}

/** Split a line's runs at `col`, returning `[head, tail]` covering [0,col) and
 * [col,width). The shared (sub-)run is split when it straddles the boundary. */
export function splitAt(line: TermLine, col: number): [TermRun[], TermRun[]] {
  const head: TermRun[] = [];
  const tail: TermRun[] = [];
  let used = 0;
  for (const r of line.runs) {
    const end = used + r.text.length;
    if (end <= col) {
      head.push(r);
    } else if (used >= col) {
      tail.push(r);
    } else {
      // straddles the boundary
      const cut = col - used;
      head.push({ text: r.text.slice(0, cut), style: r.style });
      tail.push({ text: r.text.slice(cut), style: r.style });
    }
    used = end;
  }
  return [head, tail];
}

function blankOutPrefixRun(runs: TermRun[], col: number): TermRun[] {
  // Replace the [0, col) region with same-length spaces (keep per-run styles).
  const [head, tail] = splitAt({ runs, cursor: col, width: col }, col);
  const blanked = head
    .map((r) => ({ text: " ".repeat(r.text.length), style: r.style }))
    .filter((r) => r.text.length > 0);
  return [...blanked, ...tail];
}

/** The parser. One instance per terminal session. Feed it string chunks (the
 * caller decodes Uint8Array); completed lines accumulate in `lines`. */
export class AnsiParser {
  /** Completed (committed) lines — the scrollback source. */
  lines: TermLine[] = [];
  /** The in-progress line (always present, even when empty). */
  current: TermLine;

  private style: TermStyle = {};
  private buf = "";
  /** Injectable clock (tests pass a deterministic one; default real time). */
  private readonly now: () => number;
  /** The source tag of the current push; line starts are stamped with it. */
  private pendingSource: string | undefined;

  /** Max content width a single line may reach before the parser clamps the
   * cursor (a runaway `CSI <n> C` must not blow through memory). */
  readonly maxWidth = 4096;

  constructor(opts: { now?: () => number } = {}) {
    this.now = opts.now ?? Date.now;
    this.current = this.newLine();
  }

  /** A fresh line stamped with its start time; its source tag is claimed at
   * the first actual write (see emitChar), so a line created by one chunk's
   * newline is never mis-attributed to another chunk's source. */
  private newLine(): TermLine {
    return { runs: [], cursor: 0, width: 0, startedAt: this.now() };
  }

  /** Feed a chunk of text. Incomplete trailing escape sequences are held until
   * the next chunk completes them (transports may split anywhere). The source
   * tag is per-chunk (absent clears it): each line is stamped with the source
   * of the FIRST chunk that writes into it, so an untagged chunk never borrows
   * an earlier chunk's tag. */
  push(chunk: string, source?: string): void {
    this.pendingSource = source;
    this.buf += chunk;
    let i = 0;
    let state: "text" | "esc" | "csi" | "osc" | "dcs" = "text";
    let escStart = -1;
    let params = "";
    let prefix = "";

    const buf = this.buf;
    while (i < buf.length) {
      const ch = buf[i];
      if (state === "text") {
        if (ch === "\x1b") {
          state = "esc";
          escStart = i;
        } else {
          this.emitTextChar(ch);
        }
        i++;
        continue;
      }
      if (state === "esc") {
        if (ch === "\x1b") {
          i++;
          continue; // doubled ESC: still waiting for the real sequence
        }
        if (ch === "[") {
          state = "csi";
          params = "";
          prefix = "";
          i++;
        } else if (ch === "]") {
          state = "osc";
          i++;
        } else if (ch === "P") {
          state = "dcs";
          i++;
        } else if (ch === "c") {
          this.clear();
          state = "text";
          i++;
        } else {
          state = "text";
          i++;
        }
        continue;
      }
      if (state === "csi") {
        if (ch === "\x1b") {
          state = "esc";
          continue;
        }
        if (ch === "?" || ch === ">" || ch === "=") {
          prefix += ch;
          i++;
          continue;
        }
        if ((ch >= "0" && ch <= "9") || ch === ";" || ch === ":") {
          params += ch;
          i++;
          continue;
        }
        const code = ch.charCodeAt(0);
        if (code >= 0x40 && code <= 0x7e) {
          if (prefix !== "?") this.csi(params, ch); // private modes (?1049h etc.) ignored
          state = "text";
          i++;
          continue;
        }
        i++;
        continue;
      }
      // osc / dcs — collect until BEL or ST; contents ignored (title/OSC etc.)
      if (ch === "\x07") {
        state = "text";
        i++;
      } else if (ch === "\x1b") {
        if (i + 1 < buf.length && buf[i + 1] === "\\") {
          state = "text";
          i += 2;
        } else {
          state = "text";
          i++;
        }
      } else {
        i++;
      }
    }

    if (state !== "text") {
      // An escape sequence is incomplete at the tail — keep from its ESC so the
      // next chunk completes it.
      this.buf = escStart >= 0 ? this.buf.slice(escStart) : this.buf;
    } else {
      this.buf = "";
    }
  }

  /** Wipe the whole buffer (ESC c / CSI 2 J / CSI 3 J / clear). */
  clear(): void {
    this.lines = [];
    this.current = this.newLine();
    this.style = {};
  }

  /* ---- primitive cursor/text ops ------------------------------------ */

  private pushRun(text: string, style: TermStyle): void {
    if (!text) return;
    const last = this.current.runs[this.current.runs.length - 1];
    if (last && sameStyle(last.style, style)) {
      last.text += text;
    } else {
      // Snapshot the live style: SGR mutations below (`delete`/key writes on
      // `this.style`) must never rewrite runs already committed — without the
      // copy, a later `\x1b[22m`/`\x1b[39m` would strip earlier runs' styles
      // retroactively and adjacent runs would merge despite a style change.
      this.current.runs.push({ text, style: { ...style } });
    }
    this.current.cursor += text.length;
    this.current.width += text.length;
    if (this.current.width > this.maxWidth) this.current.width = this.maxWidth;
  }

  private truncateAt(col: number): void {
    if (col >= this.current.width) return;
    const [head] = splitAt(this.current, col);
    this.current.runs = head;
    this.current.width = col;
  }

  private emitChar(ch: string): void {
    // stamp the line with the producing source at its first write
    if (this.current.source === undefined && this.pendingSource !== undefined) {
      this.current.source = this.pendingSource;
    }
    if (this.current.cursor < this.current.width) this.truncateAt(this.current.cursor);
    this.pushRun(ch, this.style);
  }

  /** Route one character from the text state; handles C0 controls. */
  private emitTextChar(ch: string): void {
    if (ch === "\n") {
      this.newline();
    } else if (ch === "\r") {
      this.current.cursor = 0;
    } else if (ch === "\b") {
      this.back();
    } else if (ch === "\t") {
      this.tab();
    } else if (ch.charCodeAt(0) < 0x20) {
      // other C0 controls (BEL, NUL, …) — dropped by the streaming renderer
    } else {
      this.emitChar(ch);
    }
  }

  private tab(): void {
    const stop = (Math.floor(this.current.cursor / 8) + 1) * 8;
    if (stop <= this.current.cursor) return;
    this.emitSpaces(stop - this.current.cursor);
  }

  private emitSpaces(n: number): void {
    for (let k = 0; k < n; k++) this.emitChar(" ");
  }

  private newline(): void {
    this.lines.push(this.current);
    this.current = this.newLine();
    if (this.lines.length > 10_000_000) {
      // pathological guard; not the normal cap (that lives in the session)
      this.lines.splice(0, this.lines.length - 10_000_000);
    }
  }

  private eraseLine(mode: number): void {
    if (mode === 2) {
      this.current = blankLine();
      return;
    }
    if (mode === 1) {
      // erase to beginning: blank [0, cursor)
      this.current.runs = blankOutPrefixRun(this.current.runs, this.current.cursor);
      return;
    }
    // mode 0 (default): erase from cursor to end of line
    const col = this.current.cursor;
    this.truncateAt(col);
    this.current.cursor = col;
  }

  /* ---- CSI / SGR ----------------------------------------------------- */

  private csi(paramsStr: string, final: string): void {
    const parsed = paramsStr.split(";").map((p) => {
      const first = p.split(":")[0];
      const n = Number.parseInt(first, 10);
      return Number.isFinite(n) ? n : 0;
    });
    if (parsed.length === 0) parsed.push(0);
    const ps = (idx: number, def: number): number => parsed[idx] ?? def;

    switch (final) {
      case "m":
        this.sgr(parsed);
        break;
      case "D": {
        for (let k = 0; k < Math.max(1, ps(0, 1)); k++) this.back();
        break;
      }
      case "C": {
        const n = Math.max(1, ps(0, 1));
        this.current.cursor = Math.min(this.maxWidth, this.current.cursor + n);
        break;
      }
      case "B":
      case "E": {
        for (let k = 0; k < Math.max(1, ps(0, 1)); k++) this.newline();
        break;
      }
      case "G":
        this.current.cursor = Math.max(0, ps(0, 1) - 1);
        break;
      case "K":
        this.eraseLine(ps(0, 0));
        break;
      case "J":
        if (parsed[0] === 2 || parsed[0] === 3) this.clear();
        break;
      // A/F (up), H/f (position), d/S/T/s/u and friends need a grid — ignored
      // by the streaming renderer (documented limitation).
      default:
        break;
    }
  }

  private back(): void {
    if (this.current.cursor > 0) this.current.cursor -= 1;
  }

  private sgr(ns: number[]): void {
    let i = 0;
    while (i < ns.length) {
      const n = ns[i];
      switch (n) {
        case 0:
          this.style = {};
          break;
        case 1:
          this.style.bold = true;
          break;
        case 2:
          this.style.dim = true;
          break;
        case 3:
          this.style.italic = true;
          break;
        case 4:
          this.style.underline = true;
          break;
        case 7:
          this.style.inverse = true;
          break;
        case 22:
          delete this.style.bold;
          delete this.style.dim;
          break;
        case 23:
          delete this.style.italic;
          break;
        case 24:
          delete this.style.underline;
          break;
        case 27:
          delete this.style.inverse;
          break;
        case 39:
          delete this.style.fgIndex;
          delete this.style.fgRgb;
          break;
        case 49:
          delete this.style.bgIndex;
          delete this.style.bgRgb;
          break;
        default:
          if (n >= 30 && n <= 37) {
            this.style.fgIndex = n - 30;
            delete this.style.fgRgb;
          } else if (n >= 40 && n <= 47) {
            this.style.bgIndex = n - 40;
            delete this.style.bgRgb;
          } else if (n >= 90 && n <= 97) {
            this.style.fgIndex = n - 90 + 8;
            delete this.style.fgRgb;
          } else if (n >= 100 && n <= 107) {
            this.style.bgIndex = n - 100 + 8;
            delete this.style.bgRgb;
          } else if (n === 38 || n === 48) {
            const isFg = n === 38;
            // 38;5;i  /  38;2;r;g;b
            const mode = ns[i + 1];
            if (mode === 5) {
              const idx = ns[i + 2];
              if (Number.isFinite(idx) && idx >= 0) {
                if (isFg) {
                  this.style.fgIndex = idx;
                  delete this.style.fgRgb;
                } else {
                  this.style.bgIndex = idx;
                  delete this.style.bgRgb;
                }
              }
              i += 2;
            } else if (mode === 2) {
              const [r, g, b] = [ns[i + 2], ns[i + 3], ns[i + 4]];
              if ([r, g, b].every((v) => Number.isFinite(v))) {
                const rgb: [number, number, number] = [r, g, b];
                if (isFg) {
                  this.style.fgRgb = rgb;
                  delete this.style.fgIndex;
                } else {
                  this.style.bgRgb = rgb;
                  delete this.style.bgIndex;
                }
              }
              i += 4;
            } else {
              i += 1;
            }
            // fallthrough (the incremented sub-params were consumed above)
          } else {
            // remaining numeric SGR params (e.g. 5 blink, 8 hidden, 21/53/…) ignored
          }
          break;
      }
      i += 1;
    }
  }
}
