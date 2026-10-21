// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
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

  it("splitAt splits a run straddling the column boundary", () => {
    const p = new AnsiParser();
    p.push("\x1b[32mabcdef\n");
    const [head, tail] = splitAt(p.lines[0], 2);
    expect(head[0].text).toBe("ab");
    expect(tail[0].text).toBe("cdef");
    expect(head[0].style.fgIndex).toBe(2);
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
    const s = new TermSession({ id: "t", label: "T", scrollbackMax: 100 });
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
});
