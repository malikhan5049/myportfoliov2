# Tasks 2-4 Report: Service AGENTS.md files

## Files created

| File | Sections | Lines |
| --- | --- | --- |
| `gateway/AGENTS.md` | Role, Structure map, Commands, Gotchas (### Liquibase workflow, ### Routing) | 40 |
| `blog/AGENTS.md` | Role, Structure map, Commands, Gotchas | 34 |
| `store/AGENTS.md` | Role, Structure map, Commands, Gotchas | 33 |

## Deviation from the brief

The brief's global constraint asks for an identical section structure of exactly four sections
(Role, Structure map, Commands, Gotchas), while the per-file list for `gateway` names five:
Role, Structure map, Commands, Liquibase workflow, Routing.

Resolution: all three files use the same four `##` sections. The gateway-only material is kept
verbatim but nested as `### Liquibase workflow` and `### Routing` under `## Gotchas`. No content
from the brief was dropped; the two gateway-specific headings survive at `###` depth. This
satisfies both the "identical 4-section structure" acceptance criterion and the gateway content
list.

No other deviation. All ports, script names, databases, and file paths are exactly as the brief
dictates.

## Verification

- `npm run prettier:check` from the repo root: `All matched files use Prettier code style!` (no
  formatting fixes were required; `prettier:format` was not run).
- Line counts: 40 / 34 / 33, all under the 100-line cap.
- Forbidden-term scan (`Maven|Webpack|BrowserSync|H2|Gatling|Cucumber|Protractor|Jest|./gradlew`)
  across the three new files: zero matches. All Gradle references are written `gradlew` - the new
  files never show `./gradlew`.
- Command spot-check against each workspace `package.json`: `watch`, `backend:unit:test`,
  `webapp:test`, `e2e:headless`, and `docker:db:up` all exist in `gateway`, `blog`, and `store`
  package.json. `docker:db:up` points at `postgresql.yml` (gateway), `neo4j.yml` (blog), and
  `mongodb.yml` (store), matching the brief.
- Also confirmed the routing claim: `blog` and `store` each define `ci:server:await`, which polls
  `http://127.0.0.1:8080/services/blog|store/management/health/readiness`, with
  `config.backend_port` set to 8080 in both. That is the fact the gateway Routing section explains.

## Self-review

- No restatement of root `AGENTS.md` architecture table or global conventions beyond the one-line
  role summary per file (ports, dev ports, database, entity ownership), which the brief permits.
- Windows forms only: `gradlew`, `npm run ...`. No POSIX shell paths.
- Frontend test runner is described as Vitest everywhere.
- Every file opens with a `# <app>/AGENTS.md` heading matching its location.

## Concerns

- Minor: the gateway file is the only one with `###` subheadings, so a strict reading of "identical
  structure" holds at the `##` level but not at `###` level. This was the only way to keep both
  gateway topics from the brief without breaking the four-section criterion.
- Minor: blog and store each mention the port-8080 `ci:server:await` behaviour in Gotchas; this
  duplicates one sentence from the gateway Routing section. Kept because an agent working only in
  `blog` or `store` would otherwise be confused by a 8080 wait in its own script.
