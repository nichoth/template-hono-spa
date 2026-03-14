# Quickstart: Custom media breakpoint usage

1. `npm install` (if dependencies are not already installed).
2. `npm run dev` to start the Vite dev server with LightningCSS transpilation.
3. Open the app in a desktop browser and verify `.login-status` is visible at wide widths.
4. Resize the viewport to the small breakpoint (`width <= 680px`) and confirm `.login-status` hides.
5. Check `src/style.css` to ensure the rule now uses `@media (--small)` and `src/_variables.css` still defines `--small` as `width <= 680px`.
6. Run `npm test` to ensure the existing CSS/HTML tests pass after the change.
