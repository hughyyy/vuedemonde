/** TaskBoard data model + seed — prototype board state (later mappable to runs/projects). */

export type Priority = "P0" | "P1" | "P2" | "P3";

export type Assignee = { name: string };

export type TaskCard = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  priority: Priority;
  due?: string;
  assignees: Assignee[];
};

export type BoardColumnDef = {
  id: string;
  title: string;
  /** 3px top accent (flat-2.0 column colour, e.g. #3b82f6). */
  accent: string;
  cards: TaskCard[];
};

export const PRIORITY_TINTS = { P0: "p0", P1: "p1", P2: "p2", P3: "p3" } as const;

export type CardTint = (typeof PRIORITY_TINTS)[Priority];

/** Summary stat shown in the board toolbar. */
export type BoardStat = { label: string; value: number; tint?: "ok" | "warn" | "err" | "info" | "run" };

/** A horizontal lane (LaneBoard) — a band of cards grouped by team/project. */
export type LaneDef = {
  id: string;
  title: string;
  subtitle?: string;
  /** lane marker accent (left bar / dot). */
  accent: string;
  summary?: BoardStat[];
  cards: TaskCard[];
};

export function priorityTint(p: Priority): CardTint {
  return PRIORITY_TINTS[p];
}

let seq = 0;
function cid(id: string): string {
  return `${id}-${++seq}`;
}

function card(id: string, title: string, tags: string[], priority: Priority, due?: string, assignees: string[] = [], description?: string): TaskCard {
  return { id: cid(id), title, description, tags, priority, due, assignees: assignees.map((name) => ({ name })) };
}

/** Seven-stage pipeline mirroring the reference board (Ideas → Shipped). */export function seedBoard(): BoardColumnDef[] {
  return [
    {
      id: "ideas",
      title: "Ideas",
      accent: "#3b82f6",
      cards: [
        card(
          "idea1",
          "Persona-based onboarding paths",
          ["activation", "research"],
          "P2",
          undefined,
          ["Sam West", "Jae Doe"],
          "Walk new users through their first workflow by persona: researcher, marketer, operations. Measure completion and re-activation.",
        ),
        card("idea2", "Export runs as markdown", ["docs", "nice-to-have"], "P3", "Sep 30", ["Ari N."], "One-click copy of the run transcript as a portable markdown file."),
        card("idea3", "Dark-mode dashboard polish", ["ui", "polish"], "P2", undefined, ["Jae Doe"]),
      ],
    },
    {
      id: "discovery",
      title: "Discovery",
      accent: "#f59e0b",
      cards: [
        card("disc1", "Provider capability map", ["research", "models"], "P1", "Oct 3", ["Sam West"]),
        card("disc2", "Low-blue theme contrast audit", ["accessibility", "ui"], "P2", undefined, ["Ari N.", "Sam West"]),
      ],
    },
    {
      id: "ready",
      title: "Ready",
      accent: "#f97316",
      cards: [
        card("rdy1", "Artifact storage — build-own JSON", ["storage", "B1"], "P1", "Oct 5", ["M. Lee"]),
      ],
    },
    {
      id: "building",
      title: "Building",
      accent: "#94a3b8",
      cards: [
        card("bld1", "Virtual scroller (U11)", ["ui", "perf"], "P2", undefined, ["Jae Doe", "Ari N.", "Sam West"]),
        card("bld2", "Accent runtime → settings", ["ui", "U12"], "P2", "Oct 7", ["Ari N."]),
      ],
    },
    {
      id: "blocked",
      title: "Blocked",
      accent: "#ef4444",
      cards: [
        card("blk1", "Mock Jira/Confluence API", ["external", "A1"], "P0", undefined, ["M. Lee"]),
      ],
    },
    {
      id: "validation",
      title: "Validation",
      accent: "#10b981",
      cards: [
        card("val1", "Sidebar hover-expand a11y pass", ["testing", "ui"], "P3", "Oct 10", ["Sam West"]),
      ],
    },
    {
      id: "shipped",
      title: "Shipped",
      accent: "#22c55e",
      cards: [
        card("shp1", "Live reasoning streaming (C5)", ["runs", "ui"], "P1", undefined, ["Ari N.", "Sam West", "Jae Doe", "M. Lee"], "Stream the model's reasoning trace into the live output window — throttled deltas, accent token for the trace."),
        card("shp2", "Design tokens + component kit", ["foundation"], "P2", "Sep 20", ["Ari N."]),
      ],
    },
  ];
}

/** Field-operations lanes: horizontal bands grouping cards by team/project. */
export function seedLanes(): LaneDef[] {
  return [
    {
      id: "horizon",
      title: "Horizon Roadmap",
      subtitle: "Q3 launch command center",
      accent: "#6366f1",
      summary: [
        { label: "initiatives", value: 12, tint: "info" },
        { label: "shipping", value: 3, tint: "run" },
        { label: "blocked", value: 1, tint: "err" },
      ],
      cards: [
        card("hor1", "Q3 launch checklist", ["launch"], "P0", "Oct 1", ["M. Lee"], "Gate items for the October launch window."),
        card("hor2", "Data migration pipeline", ["infra"], "P1", "Oct 4", ["Sam West"], "Mirror + verify the sealed store upgrade."),
        card("hor3", "Support escalation ladder", ["workflows"], "P2", undefined, ["Jae Doe", "Ari N."]),
        card("hor4", "Changelog + release notes", ["docs"], "P3", "Oct 8", ["Ari N."]),
      ],
    },
    {
      id: "europe",
      title: "Europe — field ops",
      subtitle: "Week of Sep 21",
      accent: "#0ea5e9",
      summary: [
        { label: "active", value: 5, tint: "ok" },
        { label: "on hold", value: 2, tint: "warn" },
      ],
      cards: [
        card("eu1", "Berlin office rollout", ["deploy"], "P1", "Sep 22", ["Sam West"]),
        card("eu2", "Lyon connectivity issues", ["networking"], "P0", "Sep 21", ["M. Lee", "Sam West"], "Intermittent drops on the Lyon relay — diagnose and fail over."),
        card("eu3", "Stockroom cycle count", ["ops"], "P3", "Sep 24", ["Jae Doe"]),
      ],
    },
    {
      id: "apac",
      title: "APAC — field ops",
      subtitle: "Week of Sep 21",
      accent: "#10b981",
      summary: [
        { label: "active", value: 3, tint: "ok" },
        { label: "blocked", value: 1, tint: "err" },
      ],
      cards: [
        card("apac1", "Singapore onboarding batch", ["training"], "P2", "Sep 23", ["Ari N."]),
        card("apac2", "Sydney datacenter window", ["infra"], "P1", "Sep 27", ["M. Lee"]),
      ],
    },
  ];
}
