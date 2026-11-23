# Task 1 Brief: Root AGENTS.md

**Files:**
- Create: `AGENTS.md` (repo root: `D:\Dev\Projects\myportfoliov2\AGENTS.md`)

**Interfaces:**
- Produces: a "Where rules live" pointer naming `gateway/AGENTS.md`, `blog/AGENTS.md`, `store/AGENTS.md`; later tasks create files at exactly those paths.

## Global Constraints (bind this task)

- Platform is **Windows**: commands use `gradlew` / `npm run`, never `./gradlew`.
- Never reference Maven, Webpack, BrowserSync, H2, Gatling, Cucumber, or Protractor — unused in this repo.
- Frontend unit tests are **Vitest** (JHipster docs saying "Jest" are stale — do not copy).
- Every command written must match a script that actually exists in the root `package.json`.
- No duplication: service files add to this file's guidance, never restate it — so this file must not contain per-service detail beyond the architecture table.
- Size: ≤ 150 lines.
- No git commits (not a git repo). Do not run any git commands.
- Do not dispatch subagents; do the work yourself.

## Steps

1. **Write `AGENTS.md` with exactly these sections:**

   1. **Architecture overview** (short paragraph + table). Exact facts:
      - JHipster microservices monorepo, npm workspaces, generated from `reactive-mf.jdl` (JDL at repo root), all apps reactive (Spring WebFlux), Gradle build, OAuth2 via Keycloak, service discovery via Consul.
      - `gateway`: gateway app + microfrontend shell, port 8080, webapp dev port 9000, PostgreSQL.
      - `blog`: microservice, entities Blog/Post/Tag, port 8081, webapp dev port 9001, Neo4j.
      - `store`: microservice, entity Product, port 8082, webapp dev port 9002, MongoDB.
      - Infra: Consul 8500, Keycloak 9080/9443. Compose file: `docker-compose/docker-compose.yml`.
   2. **Source of truth rule**: `reactive-mf.jdl` drives generation; never hand-edit generated code; change the JDL and regenerate instead. Note `.yo-rc.json` holds generator config.
   3. **Commands** (all from repo root; exact script names): `npm run watch` (all three apps), `npm run ci:backend:test --workspaces --if-present`, `npm run ci:frontend:test --workspaces --if-present`, `npm run webapp:test --workspace <app>`, e2e flow `ci:e2e:prepare` → `ci:e2e:run` → `ci:e2e:teardown`, `npm run java:docker` (jib images), `npm run prettier:format` / `prettier:check`. Run npm only from the root (workspaces).
   4. **Build & test prerequisites**: use the Gradle wrapper (`gradlew` on Windows), never a system Gradle. Docker must be running for integration tests that use Testcontainers.
   5. **Conventions**: Vitest (not Jest) for frontend unit tests; Cypress for e2e; i18n — every UI string gets a translation key in the JSON i18n files, no hardcoded strings; if generated-entity tests fail validation, fix the test data, never the test architecture.
   6. **Docs caveat**: repo is JHipster 8-era; current jhipster.tech docs describe 9.x and may lag (e.g. they say Jest). When docs and repo disagree, the repo wins.
   7. **Where rules live**: per-service guidance in `gateway/AGENTS.md`, `blog/AGENTS.md`, `store/AGENTS.md`. Infra docs: `docker-compose/README-DOCKER-COMPOSE.md`, `kubernetes/K8S-README.md` (k8s uses raw manifests + kustomize + skaffold, no Helm).

2. **Verify:**
   - Run from repo root: `npm run prettier:check` → must report no errors for `AGENTS.md`.
   - Line count of `AGENTS.md` must be ≤ 150.

## Report

Write your full report to `D:\Dev\Projects\myportfoliov2\.superpowers\sdd\2026-11-23-agents-md-files\task-1-report.md`:
- What you wrote (section list)
- Verification results (prettier output summary, line count)
- Files changed
- Self-review findings (if any)
- Any issues or concerns

Then report back with ONLY (under 15 lines):
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Files created
- One-line verification summary
- Your concerns, if any
- The report file path
