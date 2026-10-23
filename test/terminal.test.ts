// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { AnsiParser, ansiColorCss, splitAt, XTERM256, type TermRun } from "../src/kit/terminal/ansi";
import { TermSession } from "../src/kit/terminal/session";
import type { TermTransport, TermTransportApi } from "../src/kit/terminal/transports";
import Terminal from "../src/kit/Terminal.vue";

/** Flatten a parser's committed lines to plain text (runs joined, one line each). */
function textOf(p: AnsiParser): string {
  const lines = p.lines.map((l) => l.runs.map((r) => r.text).join(""));
  return lines.join("\n");
}

/** The parser's current in-progress line's runs (the "pending" content). */
function pendingRuns(p: AnsiParser): TermRun[] {
  return p.current.runs;
}

describe("Terminal ANSI parser", () => {
  it("commits lines on LF and keeps an in-progress line", () => {
    const p = new AnsiParser();
    p.push("hello\nworld");
    expect(textOf(p)).toBe("hello");
    expect(p.current.runs.map((r) => r.text).join("")).toBe("world");
    expect(p.lines).toHaveLength(1);
  });

  it("plain text passes through untouched", () => {
    const p = new AnsiParser();
    p.push("alpha\nbeta");
    expect(p.lines[0].runs).toEqual([{ text: "alpha", style: {} }]);
    expect(textOf(p)).toBe("alpha");
  });

  it("routes colours to fgIndex (16-colour SGR)", () => {
    const p = new AnsiParser();
    p.push("\x1b[31mred\x1b[0mplain");
    const runs = pendingRuns(p);
    expect(runs[0]).toMatchObject({ text: "red", style: { fgIndex: 1 } });
    expect(runs[runs.length - 1].style.fgIndex).toBeUndefined();
  });

  it("SGR bold + colour produce a styled run with a 16-col palette index", () => {
    const p = new AnsiParser();
    p.push("\x1b[1;34mbold-blue\x1b[0m");
    const runs = pendingRuns(p);
    expect(runs[0]).toMatchObject({ text: "bold-blue", style: { bold: true, fgIndex: 4 } });
  });

  it("text after a reset keeps its leading whitespace as its own run", () => {
    const p = new AnsiParser();
    p.push("\x1b[1;31mbold red\x1b[0m done\n");
    expect(p.lines[0].runs.map((r) => r.text)).toEqual(["bold red", " done"]);
  });

  it("parses truecolour (38;2;r;g;b)", () => {
    const p = new AnsiParser();
    p.push("\x1b[38;2;10;20;30mX");
    expect(pendingRuns(p)[0].style.fgRgb).toEqual([10, 20, 30]);
  });

  it("parses 256-colour (38;5;n)", () => {
    const p = new AnsiParser();
    p.push("\x1b[38;5;196mX");
    expect(pendingRuns(p)[0].style.fgIndex).toBe(196);
    expect(ansiColorCss(196, [])).toBe(XTERM256[196]);
  });

  it("a CR overwrites the line in place (progress-bar semantics)", () => {
    const p = new AnsiParser();
    p.push("10%");
    p.push("\r");
    p.push("20%");
    p.push("\r30%\n");
    expect(textOf(p)).toBe("30%");
  });

  it("backspace steps the cursor and the next char overwrites", () => {
    const p = new AnsiParser();
    p.push("abc\b\bXY\n");
    expect(textOf(p)).toBe("aXY");
  });

  it("erase-in-line (CSI K) clears to end of line", () => {
    const p = new AnsiParser();
    p.push("hello\x1b[2Kworld\n");
    expect(textOf(p)).toBe("world");
  });

  it("clear-screen (CSI 2 J) wipes the buffer", () => {
    const p = new AnsiParser();
    p.push("a\nb\x1b[2Jc\n");
    expect(textOf(p)).toBe("c");
  });

  it("holds an incomplete escape across chunk boundaries", () => {
    const p = new AnsiParser();
    p.push("\x1b[31");
    expect(textOf(p)).toBe("");
    p.push("mX");
    expect(pendingRuns(p)[0].style.fgIndex).toBe(1);
  });

  it("tabs advance to the next 8-column stop", () => {
    const p = new AnsiParser();
    p.push("a\tb\n");
    const line = p.lines[0];
    expect(line.runs.map((r) => r.text).join("")).toBe("a       b");
  });

  it("drops other C0 controls and ignores private CSI modes", () => {
    const p = new AnsiParser();
    p.push("ab\x07cd\x1b[?25l\x1b[?1049hX\n");
    expect(textOf(p)).toBe("abcdX");
  });

  it("never leaks raw escape sequences into the styled text", () => {
    const p = new AnsiParser();
    p.push("\x1b[32mgreen\x1b[0m \x1b[38;5;82mok\x1b[m\n");
    const all = p.lines[0].runs
      .map((r) => r.text)
      .join("")
      .replace(/\s+$/, "");
    expect(all).toBe("green ok");
    expect(all).not.toContain("\x1b");
    expect(p.lines[0].runs.some((r) => r.style.fgIndex === 2)).toBe(true);
  });

  it("splits a run straddling the column boundary", () => {
    const p = new AnsiParser();
    p.push("\x1b[32mabcdef\n");
    const [head, tail] = splitAt(p.lines[0], 2);
    expect(head[0].text).toBe("ab");
    expect(tail[0].text).toBe("cdef");
    expect(head[0].style.fgIndex).toBe(2);
  });

  it("splitAt at column 0 and beyond the width keeps runs intact", () => {
    const p = new AnsiParser();
    p.push("abc\n");
    const [head0, tail0] = splitAt(p.lines[0], 0);
    expect(head0).toEqual([]);
    expect(tail0[0].text).toBe("abc");
    const [headW, tailW] = splitAt(p.lines[0], 99);
    expect(headW[0].text).toBe("abc");
    expect(tailW).toEqual([]);
  });

  it("parses background colours: 16 (48;n), bright (100..107), 256 (48;5), truecolour (48;2)", () => {
    const p = new AnsiParser();
    p.push("\x1b[41mbg-red\x1b[0m\x1b[48;5;21mbg-256\x1b[0m\x1b[48;2;1;2;3mbg-rgb\x1b[0m\x1b[107mbg-bright\x1b[0m");
    const runs = pendingRuns(p);
    expect(runs[0].style.bgIndex).toBe(1);
    expect(runs[1].style.bgIndex).toBe(21);
    expect(runs[2].style.bgRgb).toEqual([1, 2, 3]);
    expect(runs[3].style.bgIndex).toBe(15);
  });

  it("tracks bold/dim/italic/underline/inverse and their resets (22/23/24/27)", () => {
    const p = new AnsiParser();
    p.push("\x1b[1;3;4;7mcombo\x1b[22;23;24;27mplain");
    const runs = pendingRuns(p);
    expect(runs[0].style).toMatchObject({ bold: true, italic: true, underline: true, inverse: true });
    expect(runs[1].style).toEqual({});
  });

  it("resets fg/bg selectively via 39/49", () => {
    const p = new AnsiParser();
    p.push("\x1b[31;44mstyled\x1b[39mfg-clear\x1b[49mbg-clear");
    const runs = pendingRuns(p);
    expect(runs[0].style).toMatchObject({ fgIndex: 1, bgIndex: 4 });
    expect(runs[1].style).toEqual({ bgIndex: 4 });
    expect(runs[2].style).toEqual({});
  });

  it("an empty or malformed SGR (\x1b[m, \x1b[;m) resets nothing and renders nothing", () => {
    const p = new AnsiParser();
    p.push("a\x1b[mb\x1b[;mc\n");
    expect(textOf(p)).toBe("abc");
    const q = new AnsiParser();
    q.push("\x1b[9999mnoop\x1b[0m");
    expect(pendingRuns(q)[0].text).toBe("noop");
  });

  it("drops malformed 38/48 sequences without consuming the next parameter", () => {
    const p = new AnsiParser();
    // 38;X (unknown mode) then 31 — the 31 must still colour the text
    p.push("\x1b[38;9;31mred?");
    expect(pendingRuns(p)[0].style.fgIndex).toBe(1);
  });

  it("bright foreground 90..97 maps to indices 8..15", () => {
    const p = new AnsiParser();
    p.push("\x1b[91mbright");
    expect(pendingRuns(p)[0].style.fgIndex).toBe(9);
  });

  it("CSI n C advances the cursor (beyond content); CSI n D steps back and overwrites", () => {
    const p = new AnsiParser();
    p.push("abc\x1b[2CXY\n"); // cursor forward 2 past the end — appends
    expect(textOf(p)).toBe("abcXY");
    const q = new AnsiParser();
    q.push("abc\x1b[2DXY\n"); // back 2 then write over
    expect(textOf(q)).toBe("aXY");
  });

  it("CSI 1 K erases to the start of the line; CSI 0 K erases from the cursor to the end", () => {
    const p = new AnsiParser();
    p.push("abcdef\x1b[1Krest\n");
    expect(textOf(p)).toBe("      rest");
    const q = new AnsiParser();
    q.push("abcdef\x1b[1D\x1b[0Kg\n"); // back 1, erase from cursor 5, write g
    expect(textOf(q)).toBe("abcdeg");
  });

  it("ESC c (RIS) and CSI 3 J clear the whole buffer", () => {
    const p = new AnsiParser();
    p.push("keep?");
    p.push("\x1bcfresh\n");
    expect(textOf(p)).toBe("fresh");
    const q = new AnsiParser();
    q.push("a\nb\x1b[3Jc");
    expect(q.lines).toHaveLength(0);
    expect(pendingRuns(q)[0].text).toBe("c");
  });

  it("OSC title sequences and DCS are swallowed entirely", () => {
    const p = new AnsiParser();
    p.push("\x1b]0;My Title\x07after-bel");
    p.push("\x1b]0;Other\x1b\\after-st");
    p.push("\x1bP1;2|payload\x1b\\done\n");
    expect(textOf(p)).toBe("after-belafter-stdone");
  });

  it("stamps startedAt from the injected clock on the line that begins", () => {
    let t = 1000;
    const p = new AnsiParser({ now: () => t });
    p.push("first\n"); // commits line 0 (clock 1000) and opens line 1 (clock 1000)
    t = 2000;
    p.push("second\n"); // commits line 1, opens the current line at clock 2000
    expect(p.lines[0].startedAt).toBe(1000);
    expect(p.lines[1].startedAt).toBe(1000);
    expect(p.current.startedAt).toBe(2000);
  });

  it("ansiColorCss maps palette 0..15 from the caller and 16..255 from xterm; out-of-range falls back", () => {
    const palette = ["#a", "#b", "#c", "#d", "#e", "#f", "#g", "#h"];
    expect(ansiColorCss(0, palette)).toBe("#a");
    expect(ansiColorCss(7, palette)).toBe("#h");
    expect(ansiColorCss(16, palette)).toBe(XTERM256[16]);
    expect(ansiColorCss(300, palette)).toBe("#h"); // out of range → palette[7]
    expect(ansiColorCss(300, [])).toBe("#cccccc"); // empty palette → default
    expect(XTERM256).toHaveLength(256);
    expect(XTERM256[231]).toBe("#ffffff");
    expect(XTERM256[232]).toBe("#080808");
    expect(XTERM256[255]).toBe("#eeeeee");
  });
});

describe("TermSession", () => {
  it("caps the scrollback to the ring size", () => {
    const s = new TermSession({ id: "t", label: "T", scrollbackMax: 3, followTail: false });
    s.append("l1\nl2\nl3\nl4\nl5");
    expect(s.totalLines).toBe(4); // 3 committed (ring) + current
    expect(s.text()).toBe("l2\nl3\nl4\nl5");
  });

  it("extracts plain text and notifies on change", () => {
    const s = new TermSession({ id: "t", label: "T" });
    const seen: string[] = [];
    s.onChange(() => seen.push(s.text()));
    s.append("a\nb\n");
    s.append("c");
    expect(seen.filter(Boolean).at(-1)).toBe("a\nb\nc");
  });

  it("clear() resets the buffer", () => {
    const s = new TermSession({ id: "t", label: "T" });
    s.append("x\ny");
    s.clear();
    expect(s.text()).toBe("");
  });

  it("stamps each line with the source of the chunk that began it", () => {
    const s = new TermSession({ id: "t", label: "T" });
    s.append("one\n", "server");
    s.append("two\n", "vite");
    s.append("three", "vite"); // the in-progress line keeps vite's tag
    expect(s.lineAt(0).source).toBe("server");
    expect(s.lineAt(1).source).toBe("vite");
    expect(s.lineAt(2).source).toBe("vite");
  });

  it("append accepts raw bytes via TextDecoder", () => {
    const s = new TermSession({ id: "t", label: "T" });
    s.append(new TextEncoder().encode("héllo\n"));
    expect(s.text()).toBe("héllo");
  });

  it("an empty chunk is a no-op: no content, no notification", () => {
    const s = new TermSession({ id: "t", label: "T" });
    s.append("", "server");
    expect(s.text()).toBe("");
    const fn = vi.fn();
    s.onChange(fn);
    s.append("");
    expect(fn).not.toHaveBeenCalled();
  });

  it("scrollbackMax of 0 keeps only the in-progress line", () => {
    const s = new TermSession({ id: "t", label: "T", scrollbackMax: 0, followTail: false });
    s.append("a\nb");
    expect(s.totalLines).toBe(1);
    expect(s.text()).toBe("b");
  });

  it("lineAt past the committed lines returns the in-progress line; text() trims trailing spaces", () => {
    const s = new TermSession({ id: "t", label: "T" });
    s.append("a\nb  \n");
    expect(s.lineAt(99)).toBe(s.lineAt(2));
    expect(s.text()).toBe("a\nb");
  });

  it("unsubscribe stops notifications; clear() notifies listeners once", () => {
    const s = new TermSession({ id: "t", label: "T" });
    const fn = vi.fn();
    const off = s.onChange(fn);
    s.append("x");
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    s.append("y");
    expect(fn).toHaveBeenCalledTimes(1);
    s.clear();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(s.text()).toBe("");
  });

  it("dispose() detaches every listener", () => {
    const s = new TermSession({ id: "t", label: "T" });
    const fn = vi.fn();
    s.onChange(fn);
    s.dispose();
    s.append("x");
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("Terminal transports seam", () => {
  /** A minimal scripted transport shaped exactly like what Terminal.vue uses:
   * `id`/`label`, `attach({ append })`, optional `send`, `dispose`. */
  function scriptedTransport() {
    let api: TermTransportApi | null = null;
    const sent: string[] = [];
    const transport: TermTransport = {
      id: "script",
      label: "Scripted",
      attach(a) {
        api = a;
      },
      send: (data) => sent.push(data),
      dispose() {},
    };
    return { transport, sent, feed: (data: string, source?: string) => api?.append(data, source) };
  }

  it("attaches to a TermSession via the append shape Terminal.vue uses", () => {
    const s = new TermSession({ id: "t", label: "T" });
    const t = scriptedTransport();
    t.transport.attach({ append: (d, src) => s.append(d, src) });
    t.feed("one\n");
    t.feed("\x1b[32mtwo", "vite");
    expect(s.text()).toBe("one\ntwo");
    expect(s.lineAt(1).source).toBe("vite");
  });

  it("lets the host send input lines back through the optional send()", () => {
    const s = new TermSession({ id: "t", label: "T" });
    const t = scriptedTransport();
    t.transport.attach({ append: (d) => s.append(d) });
    s.append("$ echo hi\n");
    t.transport.send?.("echo hi");
    expect(t.sent).toEqual(["echo hi"]);
    t.transport.dispose();
  });

  it("a transport without send() still attaches (read-only feed)", () => {
    const s = new TermSession({ id: "t", label: "T" });
    const transport: TermTransport = {
      id: "ro",
      label: "Read-only",
      attach(api) {
        api.append("hello from feed\n");
      },
      dispose() {},
    };
    transport.attach({ append: (d) => s.append(d) });
    expect(s.text()).toBe("hello from feed");
  });
});

describe("Terminal.vue (kit component)", () => {
  it("renders ANSI-styled runs fed through a transport, with no raw escapes", async () => {
    const { transport, feed } = (() => {
      let api: TermTransportApi | null = null;
      const t: TermTransport = {
        id: "t",
        label: "T",
        attach(a) {
          api = a;
        },
        dispose() {},
      };
      return { transport: t, feed: (d: string) => api?.append(d) };
    })();

    const wrapper = mount(Terminal, {
      props: { transport, title: "Terminal", showTimestamps: false, height: "200px" },
    });
    feed("plain line\n\x1b[1;31mbold red\x1b[0m done\n");
    await nextTick();

    const spans = wrapper.findAll(".term-run");
    // happy-dom's textContent drops a text node's leading space; content is
    // verified exactly at the parser level — here assert the rendered run set
    // and styles, and confirm the literal " done" node via the html source.
    expect(spans.map((s) => s.text().trim())).toEqual(["plain line", "bold red", "done"]);
    expect(wrapper.findAll(".term-row")[1].html()).toContain("> done</span>");
    expect(spans[1].attributes("style") ?? "").toContain("color: var(--term-ansi-1)");
    expect(wrapper.find(".term-row").text().trim()).toBe("plain line");
    expect(wrapper.text()).not.toContain("\x1b");

    wrapper.unmount();
  });

  it("hides the input bar when the transport has no send()", async () => {
    const transport: TermTransport = {
      id: "t",
      label: "T",
      attach() {},
      dispose() {},
    };
    const wrapper = mount(Terminal, { props: { transport, showTimestamps: false } });
    await nextTick();
    expect(wrapper.find(".term-input").exists()).toBe(false);
    wrapper.unmount();
  });

  it("picks the ANSI palette from the resolved background, not the theme id", async () => {
    // `light` is one of many light themes; the others previously fell through to
    // the dark ANSI palette because only the literal id "light" was matched.
    const style = document.createElement("style");
    style.textContent = `:root { --bg: #101418; }
      [data-theme="mint"] { --bg: #f0f7f2; }
      [data-theme="matrix"] { --bg: #020603; }`;
    document.head.append(style);
    const transport: TermTransport = { id: "t", label: "T", attach() {}, dispose() {} };
    const mountFor = async (theme: string): Promise<string[]> => {
      document.documentElement.dataset.theme = theme;
      const wrapper = mount(Terminal, { props: { transport, showTimestamps: false } });
      await nextTick();
      const classes = wrapper.classes();
      wrapper.unmount();
      return classes;
    };
    try {
      expect(await mountFor("mint")).toContain("term-light");
      expect(await mountFor("matrix")).toContain("term-dark");
      expect(await mountFor("never-shipped")).toContain("term-dark"); // :root fallback
    } finally {
      style.remove();
      delete document.documentElement.dataset.theme;
    }
  });
});
