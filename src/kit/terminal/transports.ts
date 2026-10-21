// Terminal transport seam (vendored Terminal.vue contract). Astro's terminal
// feed is event-driven: tool output is pushed into a TermSession. A future PTY
// backend slots in behind the same interface.

export type TermTransportApi = {
  append(data: string, source?: string): void;
};

export type TermTransport = {
  id: string;
  label: string;
  attach(api: TermTransportApi): void;
  detach?: () => void;
  send?: (data: string) => void;
  resize?: (cols: number, rows: number) => void;
  dispose(): void;
};

export type TermSource = {
  id: string;
  label: string;
  transport: TermTransport | (() => TermTransport);
};
