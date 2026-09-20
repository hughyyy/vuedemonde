import { reactive } from "vue";

/**
 * Pointer-based drag & drop for the taskboard / laneboard.
 *
 * A module-scope singleton drives the interaction so any component can read
 * the live drag state / drop indicator without prop drilling. The active board
 * (columns OR lanes) registers the single drop handler; cards start drags via
 * `startBoardDrag`. The dragged card is cloned into a fixed-position mirror
 * that follows the cursor (styling lives in `style.css` as `.board-drag-mirror`).
 *
 * Drop zones are marked with `data-drop-zone` + a zone id; the card list inside
 * carries `data-card-list` and an orientation (`vertical` for columns,
 * `horizontal` for lanes) that decides insertion indexing.
 */

export type DragState = { cardId: string; fromZoneId: string } | null;

export type DropIndicator = { zoneId: string; index: number } | null;

export type DropTarget = { toZoneId: string; index: number };

const state = reactive<{ drag: DragState; indicator: DropIndicator }>({
  drag: null,
  indicator: null,
});

let dropHandler: ((target: DropTarget) => void) | null = null;

export function setBoardDropHandler(fn: ((target: DropTarget) => void) | null): void {
  dropHandler = fn;
}

let mirror: HTMLElement | null = null;
let moveListener: ((e: PointerEvent) => void) | null = null;
let upListener: ((e: PointerEvent) => void) | null = null;

function computeIndicator(clientX: number, clientY: number): DropIndicator {
  if (!state.drag) return null;
  const el = document.elementFromPoint(clientX, clientY);
  if (!el) return null;
  let node: HTMLElement | null = el as HTMLElement;
  let zoneRoot: HTMLElement | null = null;
  while (node && node !== document.body) {
    if (node.hasAttribute("data-drop-zone")) {
      zoneRoot = node;
      break;
    }
    node = node.parentElement;
  }
  if (!zoneRoot) return null;
  const zoneId = zoneRoot.getAttribute("data-drop-zone")!;
  const list = zoneRoot.querySelector<HTMLElement>("[data-card-list]");
  if (!list) return { zoneId, index: 0 };
  const horizontal = list.dataset["orientation"] === "horizontal";
  let index = 0;
  for (const child of Array.from(list.children) as HTMLElement[]) {
    if (child.dataset["cardId"] === state.drag.cardId) continue;
    const r = child.getBoundingClientRect();
    const mid = horizontal ? r.left + r.width / 2 : r.top + r.height / 2;
    if ((horizontal ? clientX : clientY) < mid) break;
    index++;
  }
  return { zoneId, index };
}

function onPointerMove(e: PointerEvent): void {
  if (mirror) {
    mirror.style.left = `${e.clientX + 8}px`;
    mirror.style.top = `${e.clientY + 8}px`;
  }
  state.indicator = computeIndicator(e.clientX, e.clientY);
}

function onPointerUp(): void {
  const drag = state.drag;
  if (drag && state.indicator && dropHandler) {
    dropHandler({ toZoneId: state.indicator.zoneId, index: state.indicator.index });
  }
  cleanup();
}

function cleanup(): void {
  if (moveListener) window.removeEventListener("pointermove", moveListener);
  if (upListener) window.removeEventListener("pointerup", upListener);
  moveListener = null;
  upListener = null;
  mirror?.remove();
  mirror = null;
  state.drag = null;
  state.indicator = null;
}

/** Begin a drag from a card element (see BoardCard). */
export function startBoardDrag(el: HTMLElement, cardId: string, fromZoneId: string, e: PointerEvent): void {
  if (state.drag) cleanup();
  state.drag = { cardId, fromZoneId };
  mirror = el.cloneNode(true) as HTMLElement;
  mirror.classList.add("board-drag-mirror");
  document.body.appendChild(mirror);
  mirror.style.left = `${e.clientX + 8}px`;
  mirror.style.top = `${e.clientY + 8}px`;
  moveListener = onPointerMove;
  upListener = onPointerUp;
  window.addEventListener("pointermove", moveListener);
  window.addEventListener("pointerup", upListener);
  e.preventDefault();
}

export function cancelBoardDrag(): void {
  cleanup();
}

export function useBoardDrag() {
  return { state, start: startBoardDrag, cancel: cancelBoardDrag, setDropHandler: setBoardDropHandler };
}
