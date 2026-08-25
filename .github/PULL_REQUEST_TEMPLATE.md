## What this changes


## Why


## Checklist
- [ ] `shellcheck bin/*` is clean
- [ ] UI changed? `cd ui && pnpm build` produces `ui/dist/page.js` + `ui/dist/screen.js`
- [ ] `keel plugins test . --strict` passes
- [ ] Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, …) so release-please can version
