# Security Policy

## Reporting a vulnerability

Report privately, never in a public issue. Use GitHub's **Security** tab and
click **Report a vulnerability** to open a private advisory only the maintainers
can see. We aim to acknowledge within three working days.

## What this is

keel-plugin-example is a keel plugin: it ships executables (`bin/`) that keel runs
over a subprocess + JSON protocol, plus two React UI bundles the studio mounts.
`keel plugins add` only **fetches and validates** — nothing runs. keel never runs
a plugin's code until you `keel plugins trust` it, and each capability (`net`,
`secrets`, `exec`) is granted separately.

## Scope worth a close look

- the executables in `bin/` and what they do
- the capabilities `config/register.yaml` requests
- the UI bundles in `ui/dist/` that the studio mounts

## Supported versions

Ships from its latest release; older tags are not maintained.
