import { onBeforeUnmount, watch, type Ref } from "vue";

/**
 * Focus trap + Escape-close for a modal shell (U6).
 *
 * The modal root is typically `v-if`-mounted, so the composable reacts to the
 * ref becoming non-null: when the modal opens it moves focus to the first
 * focusable element; while open, Tab / Shift+Tab stay inside and Escape calls
 * `onClose`. Apply to custom modals that don't use the kit `AppDialog` (which
 * has its own trap). The caller owns the `role="dialog"`/`aria-modal` markup.
 */
export function useModalTrap(root: Ref<HTMLElement | null>, onClose: () => void): void {
  function onKeydown(e: KeyboardEvent): void {
    if (!root.value) return; // modal not open — don't intercept
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const focusables = root.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Focus the modal's first focusable as soon as it appears (v-if open).
  const stopWatch = watch(root, (el) => {
    const f = el?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    f?.focus();
  });

  window.addEventListener("keydown", onKeydown);
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", onKeydown);
    stopWatch();
  });
}
