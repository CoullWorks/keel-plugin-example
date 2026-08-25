# Contributing to keel-plugin-example

This is the reference **plugin** for [keel](https://github.com/coullworks/keel):
it demonstrates every extension point keel offers, over keel's subprocess + JSON
protocol. The best contribution is to fork it, add or sharpen an extension point,
and open a pull request.

## Fork it

Fork on GitHub, or clone and point keel at it:

```sh
git clone https://github.com/coullworks/keel-plugin-example
cd keel-plugin-example/ui && pnpm install && pnpm build   # build the two UI bundles
keel plugins add ../keel-plugin-example                   # fetch + validate; runs no code
keel plugins trust example                                # allow it to run its own executables
keel example                                              # run its command
```

## Add or change an extension point

Extension points are declared in `config/register.yaml` and backed by shell
executables in `bin/` and/or React components in `ui/src/`. keel serves the built
bundles from `ui/dist/` (not committed) — after any UI change, rebuild:

```sh
cd ui && pnpm install && pnpm build
```

## Before you open a pull request

- `shellcheck bin/*` is clean (CI runs it).
- `cd ui && pnpm build` produces `ui/dist/page.js` + `ui/dist/screen.js`.
- `keel plugins test . --strict` passes (the plugin-standard conformance check).
- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:` …) so release-please can version.

## Ground rules

MIT licensed. Be respectful (see `CODE_OF_CONDUCT.md`). Report security issues
privately (see `SECURITY.md`).
