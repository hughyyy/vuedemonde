/** `?raw` CSS imports (Vite) — the theme builder loads `theme.css` verbatim. */
declare module "*.css?raw" {
  const css: string;
  export default css;
}
