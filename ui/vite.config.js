import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// Build ONE of the example plugin's two UI components as a self-contained ES
// module. Which one is chosen by the EX_ENTRY env var, so `pnpm build` runs this
// config twice (see package.json) — once per component tier:
//
//   EX_ENTRY=page   → src/page.jsx   → dist/page.js    the COMPONENT PAGE (global)
//   EX_ENTRY=screen → src/screen.jsx → dist/screen.js  the COMPONENT SCREEN (project)
//
// Two independent `build.lib` runs (rather than one build with two inputs) is
// deliberate: a single multi-entry build hoists shared code — React — into a
// separate chunk the two entries import. The keel studio serves ONLY the file
// named by `component:` and has no module resolver for such a sidecar chunk, so
// each entry must be FULLY self-contained. build.lib + a single entry inlines
// everything (React + the CSS) into one file, which is exactly the contract.
//
// The keel studio serves the built file at /plugin-assets/example/ui/dist/<f>.js
// (register.yaml `component:`), dynamic-imports it, and calls the exported
// mount(el, keel). React is BUNDLED IN (the studio provides no import map) and the
// CSS is injected from JS (vite-plugin-css-injected-by-js) so styles ship inside
// the single file rather than as a sidecar .css the studio would never load.
const ENTRY = process.env.EX_ENTRY === 'screen' ? 'screen' : 'page'

export default defineConfig({
  plugins: [
    react(),
    // Fold this entry's imported CSS into its JS bundle and inject it at runtime.
    cssInjectedByJsPlugin(),
  ],
  // A library build does NOT default NODE_ENV to production, so React would ship
  // its dev build (bigger + dev-only warnings). Pin it to production so React is
  // the minified prod build and the dev-only branches are dead-code-eliminated.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    // Only the first run empties dist; the second must NOT wipe the first's output.
    emptyOutDir: ENTRY === 'page',
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: false,
    // A library build: one entry, ESM only, fixed filename the studio points at.
    lib: {
      entry: `src/${ENTRY}.jsx`,
      formats: ['es'],
      fileName: () => `${ENTRY}.js`,
    },
    rollupOptions: {
      // React is BUNDLED, not external — the studio has no resolver for bare
      // specifiers, so nothing may be left as an import.
      external: [],
      output: {
        // A single chunk: no code-splitting, no async chunks — one file only.
        inlineDynamicImports: true,
      },
    },
  },
})
