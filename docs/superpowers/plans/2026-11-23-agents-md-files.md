# AGENTS.md Files Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a root `AGENTS.md` plus one per service workspace (`gateway`, `blog`, `store`) giving AI agents correctly-scoped guidance for this JHipster microservices monorepo.

**Architecture:** Hierarchical AGENTS.md set. Root file always loads and carries repo-wide guidance; service files load lazily when an agent touches that workspace and add (never repeat) root guidance. Identical section structure across the three service files.

**Tech Stack:** Markdown only. Verification via the repo's Prettier setup (it covers `*.md`).

**Spec:** `docs/superpowers/specs/2026-11-23-agents-md-design.md`

## Global Constraints

- Platform is **Windows**: commands use `gradlew` / `npm run`, never `./gradlew`.
- Never reference Maven, Webpack, BrowserSync, H2, Gatling, Cucumber, or Protractor — unused in this repo.
- Frontend unit tests are **Vitest** (docs saying "Jest" are stale — do not copy).
- Every command written in a file must match a script that actually exists in the relevant `package.json`.
- No duplication: a service file adds to root guidance, never restates it.
- Applies-to-2-or-more-services rule: shared guidance goes in root only.
- Size: root ≤ 150 lines, each service file ≤ 100 lines.
- No commit steps: the working directory is not currently an initialized git repository.

## Review Focus

- A command in any file that doesn't exist in the corresponding `package.json` — an agent would run it and fail. Test: Task 5 spot-check step.
- Root file repeating service detail (ports table is the allowed exception) — bloats every session. Test: Task 5 duplication scan.
- Service file repeating root content verbatim. Test: Task 5 duplication scan.
- Line-count ceilings exceeded. Test: Task 5.
- Windows-incorrect command forms (`./gradlew`) anywhere. Test: Task 5 grep.

---

### Task 1: Root AGENTS.md

**Files:**
- Create: `AGENTS.md`

**Interfaces:**
- Produces: the "Where rules live" pointer naming `gateway/AGENTS.md`, `blog/AGENTS.md`, `store/AGENTS.md`; later tasks' files must match those three paths.

- [ ] **Step 1: Write `AGENTS.md` with exactly these sections**

1. **Architecture overview** (short paragraph + table). Exact facts:
   - JHipster microservices monorepo, npm workspaces, generated from `reactive-mf.jdl` (JDL at repo root), all apps reactive (WebFlux), Gradle build, OAuth2 via Keycloak, service discovery via Consul.
   - `gateway`: gateway app + microfrontend shell, port 8080, webapp dev port 9000, PostgreSQL.
   - `blog`: microservice, entities Blog/Post/Tag, port 8081, webapp dev port 9001, Neo4j.
   - `store`: microservice, entity Product, port 8082, webapp dev port 9002, MongoDB.
   - Infra: Consul 8500, Keycloak 9080/9443. Compose: `docker-compose/docker-compose.yml`.
2. **Source of truth rule**: `reactive-mf.jdl` drives generation; never hand-edit generated code; change the JDL and regenerate instead. Note `.yo-rc.json` holds generator config.
3. **Commands** (all from repo root; exact script names): `npm run watch` (all three apps), `npm run ci:backend:test --workspaces --if-present`, `npm run ci:frontend:test --workspaces --if-present`, `npm run webapp:test --workspace <app>`, e2e flow `ci:e2e:prepare` → `ci:e2e:run` → `ci:e2e:teardown`, `npm run java:docker` (jib images), `npm run prettier:format` / `prettier:check`. Run npm only from the root (workspaces).
4. **Build & test prerequisites**: use the Gradle wrapper (`gradlew` on Windows), never a system Gradle. Docker must be running for integration tests that use Testcontainers. 
5. **Conventions**: Vitest (not Jest) for frontend unit tests; Cypress for e2e; i18n — every UI string gets a translation key in the JSON i18n files, no hardcoded strings; if generated-entity tests fail validation, fix the test data, never the test architecture.
6. **Docs caveat**: repo is JHipster 8-era; current jhipster.tech docs describe 9.x and may lag (e.g. they say Jest). When docs and repo disagree, the repo wins.
7. **Where rules live**: per-service guidance in `gateway/AGENTS.md`, `blog/AGENTS.md`, `store/AGENTS.md`. Infra docs: `docker-compose/README-DOCKER-COMPOSE.md`, `kubernetes/K8S-README.md` (k8s uses raw manifests + kustomize + skaffold, no Helm).

- [ ] **Step 2: Verify root file**

Run: `npm run prettier:check` (from root)
Expected: no errors for `AGENTS.md`. Line count ≤ 150 (`read` the file).

### Task 2: gateway/AGENTS.md

**Files:**
- Create: `gateway/AGENTS.md`

**Interfaces:**
- Consumes: paths named in Task 1's "Where rules live" (must be exactly `gateway/AGENTS.md`).

- [ ] **Step 1: Write `gateway/AGENTS.md` with exactly these sections**

1. **Role line**: Gateway app + microfrontend shell for blog/store. Port 8080, webapp dev port 9000, PostgreSQL. Only app with a SQL database.
2. **Structure map**: backend `src/main/java`, React webapp `src/main/webapp`, config `src/main/resources/config/application-*.yml`, Gradle `build.gradle` + `gradle/`, tests `src/test`.
3. **Commands** (this workspace only): `npm run watch --workspace gateway`, `npm run backend:unit:test --workspace gateway`, `npm run webapp:test --workspace gateway`, `npm run e2e:headless --workspace gateway`, db via `npm run docker:db:up --workspace gateway` (postgresql.yml).
4. **Liquibase workflow**: schema changes go in `src/main/resources/config/liquibase/` — new date-prefixed changelog (`yyyyMMddHHmmss_description.xml`) registered in `master.xml`. No raw SQL outside changelogs.
5. **Routing**: Spring Cloud Gateway routes to blog/store via Consul; readiness for blog/store is checked through the gateway at `/services/blog|/services/store/management/health/readiness` (workspace scripts `ci:server:await:*` target gateway on 8080 — this is why `blog`/`store` package.json scripts mention port 8080).

- [ ] **Step 2: Verify gateway file**

Run: `npm run prettier:check` — Expected: clean for `gateway/AGENTS.md`. Line count ≤ 100.

### Task 3: blog/AGENTS.md

**Files:**
- Create: `blog/AGENTS.md`

**Interfaces:**
- Consumes: paths named in Task 1's "Where rules live" (must be exactly `blog/AGENTS.md`).

- [ ] **Step 1: Write `blog/AGENTS.md` with exactly these sections**

1. **Role line**: Microservice behind the gateway. Owns entities Blog, Post, Tag (Post↔Tag many-to-many). Port 8081, webapp dev port 9001, Neo4j.
2. **Structure map**: same shape as gateway (`src/main/java`, `src/main/webapp`, `src/main/resources/config/`, `build.gradle`, `src/test`).
3. **Commands** (this workspace only): `npm run watch --workspace blog`, `npm run backend:unit:test --workspace blog`, `npm run webapp:test --workspace blog`, `npm run e2e:headless --workspace blog`, db via `npm run docker:db:up --workspace blog` (neo4j.yml).
4. **Gotchas**: integration tests use Neo4j Testcontainers → **Docker must be running**. Schema changes go through neo4j-migrations, not ad-hoc Cypher scripts. No Liquibase here (that's gateway's SQL workflow).

- [ ] **Step 2: Verify blog file**

Run: `npm run prettier:check` — Expected: clean for `blog/AGENTS.md`. Line count ≤ 100.

### Task 4: store/AGENTS.md

**Files:**
- Create: `store/AGENTS.md`

**Interfaces:**
- Consumes: paths named in Task 1's "Where rules live" (must be exactly `store/AGENTS.md`).

- [ ] **Step 1: Write `store/AGENTS.md` with exactly these sections**

1. **Role line**: Microservice behind the gateway. Owns entity Product. Port 8082, webapp dev port 9002, MongoDB.
2. **Structure map**: same shape as gateway (`src/main/java`, `src/main/webapp`, `src/main/resources/config/`, `build.gradle`, `src/test`).
3. **Commands** (this workspace only): `npm run watch --workspace store`, `npm run backend:unit:test --workspace store`, `npm run webapp:test --workspace store`, `npm run e2e:headless --workspace store`, db via `npm run docker:db:up --workspace store` (mongodb.yml).
4. **Gotchas**: integration tests use embedded MongoDB → no Docker needed for backend tests (unlike blog). Backend is reactive MongoDB (Spring Data reactive) — no Liquibase, no JPA; don't introduce blocking JPA patterns.

- [ ] **Step 2: Verify store file**

Run: `npm run prettier:check` — Expected: clean for `store/AGENTS.md`. Line count ≤ 100.

### Task 5: Cross-file verification

**Files:**
- Modify (if needed): any of the four files above.

**Interfaces:**
- Consumes: all four files from Tasks 1–4.

- [ ] **Step 1: Duplication scan** — `grep` the three service files for content that merely restates root sections (architecture table rows, global conventions). Remove restatements; service files add only service-specific detail.
- [ ] **Step 2: Command audit** — `grep` every `npm run X` occurrence in the four files; confirm each `X` exists in the matching `package.json` (root or workspace as written).
- [ ] **Step 3: Windows-form check** — `grep` the four files for `./gradlew`, `./mvnw`, `mvn ` — Expected: no matches.
- [ ] **Step 4: Final prettier pass**

Run: `npm run prettier:check`
Expected: clean across all `*.md`.

- [ ] **Step 5: Report** — list files created with line counts.
