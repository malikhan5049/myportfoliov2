# Tasks 2–4 Brief (batched): Service AGENTS.md files

Create **three files** with an **identical section structure** (Role, Structure map, Commands, Gotchas). Each adds to the root `AGENTS.md` guidance — never restate architecture-table facts or global conventions beyond the one-line role summary. Each file ≤ 100 lines.

**Files:**
- Create: `D:\Dev\Projects\myportfoliov2\gateway\AGENTS.md`
- Create: `D:\Dev\Projects\myportfoliov2\blog\AGENTS.md`
- Create: `D:\Dev\Projects\myportfoliov2\store\AGENTS.md`

## Global Constraints (bind this task)

- Platform is **Windows**: commands use `gradlew` / `npm run`, never `./gradlew`.
- Never reference Maven, Webpack, BrowserSync, H2, Gatling, Cucumber, or Protractor.
- Frontend unit tests are **Vitest** (never "Jest").
- Every command written must match a script that actually exists in that workspace's `package.json`.
- No duplication of root `AGENTS.md` content (architecture facts, global conventions).
- No git commits; do not run git commands. Do not dispatch subagents.

## File 1: `gateway/AGENTS.md` — sections

1. **Role**: Gateway app + microfrontend shell for blog/store. Port 8080, webapp dev port 9000, PostgreSQL. Only app with a SQL database.
2. **Structure map**: backend `src/main/java`, React webapp `src/main/webapp`, config `src/main/resources/config/application-*.yml`, Gradle `build.gradle` + `gradle/`, tests `src/test`.
3. **Commands** (this workspace only): `npm run watch --workspace gateway`, `npm run backend:unit:test --workspace gateway`, `npm run webapp:test --workspace gateway`, `npm run e2e:headless --workspace gateway`, db via `npm run docker:db:up --workspace gateway` (postgresql.yml).
4. **Liquibase workflow**: schema changes go in `src/main/resources/config/liquibase/` — new date-prefixed changelog (`yyyyMMddHHmmss_description.xml`) registered in `master.xml`. No raw SQL outside changelogs.
5. **Routing**: Spring Cloud Gateway routes to blog/store via Consul; readiness for blog/store is checked through the gateway at `/services/blog|/services/store/management/health/readiness` (workspace scripts `ci:server:await:*` target gateway on 8080 — this is why blog/store package.json scripts mention port 8080).

## File 2: `blog/AGENTS.md` — sections

1. **Role**: Microservice behind the gateway. Owns entities Blog, Post, Tag (Post↔Tag many-to-many). Port 8081, webapp dev port 9001, Neo4j.
2. **Structure map**: same shape as gateway (`src/main/java`, `src/main/webapp`, `src/main/resources/config/`, `build.gradle`, `src/test`).
3. **Commands** (this workspace only): `npm run watch --workspace blog`, `npm run backend:unit:test --workspace blog`, `npm run webapp:test --workspace blog`, `npm run e2e:headless --workspace blog`, db via `npm run docker:db:up --workspace blog` (neo4j.yml).
4. **Gotchas**: integration tests use Neo4j Testcontainers → **Docker must be running**. Schema changes go through neo4j-migrations, not ad-hoc Cypher scripts. No Liquibase here (that's gateway's SQL workflow).

## File 3: `store/AGENTS.md` — sections

1. **Role**: Microservice behind the gateway. Owns entity Product. Port 8082, webapp dev port 9002, MongoDB.
2. **Structure map**: same shape as gateway (`src/main/java`, `src/main/webapp`, `src/main/resources/config/`, `build.gradle`, `src/test`).
3. **Commands** (this workspace only): `npm run watch --workspace store`, `npm run backend:unit:test --workspace store`, `npm run webapp:test --workspace store`, `npm run e2e:headless --workspace store`, db via `npm run docker:db:up --workspace store` (mongodb.yml).
4. **Gotchas**: integration tests use embedded MongoDB → no Docker needed for backend tests (unlike blog). Backend is reactive MongoDB (Spring Data reactive) — no Liquibase, no JPA; don't introduce blocking JPA patterns.

## Verification (after all three files)

- Run from repo root: `npm run prettier:check` → no errors for the three new files (if only they are flagged, `npm run prettier:format` and re-check).
- Each file ≤ 100 lines.
- Spot-check: every `npm run X --workspace Y` you wrote exists as script `X` in `Y/package.json`.

## Report

Write your full report to `D:\Dev\Projects\myportfoliov2\.superpowers\sdd\2026-11-23-agents-md-files\task-2-4-report.md`:
- Per file: section list, line count, any deviation from the brief
- Verification results (prettier summary, command spot-check outcome)
- Self-review findings, concerns

Then report back with ONLY (under 15 lines):
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Files created
- One-line verification summary
- Your concerns, if any
- The report file path
