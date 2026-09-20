import type { Directive } from "vue";

/**
 * v-mask + v-key-filter — input-formatting directives.
 * Register globally: `app.use(FormDirectives)` or `app.directive("mask", mask)`.
 */

/** `v-mask="'###-####'"` — `#` = digit, `A` = letter, `X` = any, else literal. */
export const mask: Directive<HTMLInputElement, string> = {
  mounted(el, binding) {
    el.addEventListener("input", () => {
      const pat = binding.value;
      if (!pat) return;
      const digitsAndLetters = el.value.replace(/[^0-9a-zA-Z]/g, "");
      let out = "";
      let d = 0;
      for (const ch of pat) {
        if (ch === "#") out += /\d/.test(digitsAndLetters[d] ?? "") ? digitsAndLetters[d++]! : "";
        else if (ch === "A") out += /[a-zA-Z]/.test(digitsAndLetters[d] ?? "") ? digitsAndLetters[d++]! : "";
        else if (ch === "X") out += digitsAndLetters[d] ?? "";
        else out += ch;
      }
      el.value = out;
    });
  },
};

const PRESETS: Record<string, RegExp> = {
  pint: /^[0-9]$/,
  int: /^-?[0-9]$/,
  alpha: /^[a-zA-Z]$/,
  alphanum: /^[0-9a-zA-Z]$/,
  email: /^[0-9a-zA-Z@._-]$/,
};

/** v-key-filter="'int'" or v-key-filter="/^[0-9]$/" — blocks disallowed keystrokes. */
export const keyFilter: Directive<HTMLInputElement, string | RegExp> = {
  mounted(el, binding) {
    el.addEventListener("beforeinput", (e) => {
      const data = (e as InputEvent).data;
      if (data == null || data.length !== 1) return; // deletions / compositions
      const rule = binding.value;
      const re = rule instanceof RegExp ? rule : PRESETS[rule];
      if (re && !re.test(data)) e.preventDefault();
    });
  },
};

/** v-ripple — material ripple on pointer-down (needs the global `.ripple` CSS). */
export const ripple: Directive<HTMLElement> = {
  mounted(el) {
    el.style.position = el.style.position || "relative";
    el.style.overflow = el.style.overflow === "visible" ? "hidden" : el.style.overflow;
    el.addEventListener("pointerdown", (e) => {
      const r = el.getBoundingClientRect();
      const d = Math.max(r.width, r.height);
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = `${d}px`;
      span.style.left = `${e.clientX - r.left - d / 2}px`;
      span.style.top = `${e.clientY - r.top - d / 2}px`;
      el.appendChild(span);
      span.addEventListener("animationend", () => span.remove());
    });
  },
};

export type AosOptions = { animation?: string; once?: boolean };

/** v-animate-on-scroll — adds `.is-visible` when scrolled into view. */
export const animateOnScroll: Directive<HTMLElement, AosOptions | undefined> = {
  mounted(el, binding) {
    el.classList.add("aos-init", binding.value?.animation ?? "aos-fade-up");
    const once = binding.value?.once !== false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-visible");
          if (once) io.disconnect();
        } else if (!once) {
          el.classList.remove("is-visible");
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
  },
};

/** v-style-class="'active'" — toggles the class on each click. */
export const styleClass: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    el.addEventListener("click", () => el.classList.toggle(binding.value));
  },
};

export const FormDirectives = {
  install(app: { directive: (name: string, d: unknown) => void }) {
    app.directive("mask", mask);
    app.directive("key-filter", keyFilter);
    app.directive("ripple", ripple);
    app.directive("animate-on-scroll", animateOnScroll);
    app.directive("style-class", styleClass);
  },
};
