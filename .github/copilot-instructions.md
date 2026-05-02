# ELBTRONIKA Copilot Instructions

These instructions are mandatory for coding agents operating in this repository.

## Primary Protocol References

Read these before meaningful implementation work:

1. `engineering-harness/ULTRAPLAN_AGENT_PREFLIGHT.md`
2. `engineering-harness/PRE_FLIGHT_PROTOCOL.md`
3. `engineering-harness/COPILOT_AGENT_PREFLIGHT.md`

If task scope includes auth, payments, deletion, MCP side effects, or public readiness claims, also read:

- `engineering-harness/HERMES_TRUST_HARNESS.md`

## Minimum Working Contract

1. Confirm branch and working tree state before edits.
2. Identify exact files and verification command before implementation.
3. Use minimal, targeted edits with repository conventions.
4. Run relevant verification for changed behavior.
5. Keep docs and memory artifacts aligned with verified outcomes.

## Windows Command Notes

Use `.cmd` launchers for package tooling on this machine, for example:

- `pnpm.cmd`
- `npx.cmd`
- `npm.cmd`
- `node_modules\.bin\biome.cmd`
