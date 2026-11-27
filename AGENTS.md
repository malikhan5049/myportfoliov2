# AGENTS.md

Repo-wide guidance for AI agents working in this repository. Per-service detail lives in each app's own `AGENTS.md` (`gateway/`, `blog/`, `store/`).

## Architecture

JHipster microservices monorepo built with npm workspaces, generated from `reactive-mf.jdl` (repo root). Every app is reactive (Spring WebFlux) and builds with Gradle. Auth is OAuth2 via Keycloak; service discovery uses Consul.

| App       | Kind                          | HTTP port | Webapp dev port | Database   | Entities        |
| --------- | ----------------------------- | --------- | --------------- | ---------- | --------------- |
| `gateway` | gateway + microfrontend shell | 8080      | 9000            | PostgreSQL | —               |
| `blog`    | microservice                  | 8081      | 9001            | Neo4j      | Blog, Post, Tag |
| `store`   | microservice                  | 8082      | 9002            | MongoDB    | Product         |

Infrastructure via Docker Compose (`docker-compose/docker-compose.yml`): Consul 8500, Keycloak 9080 (HTTPS 9443).

## Source of truth

`reactive-mf.jdl` drives generation; each app's `.yo-rc.json` holds its generator config. Never hand-edit generated code — change the JDL and regenerate instead.

## Commands

Run npm only from the repo root; the root workspaces forward to each app.

- `npm run watch` — dev servers for all three apps.
- `npm run ci:backend:test --workspaces --if-present` / `npm run ci:frontend:test --workspaces --if-present` — backend / frontend tests.
- `npm run webapp:test --workspace <app>` — frontend tests for a single app.
- e2e flow: `ci:e2e:prepare` → `ci:e2e:run` → `ci:e2e:teardown` (all via `npm run`).
- `npm run java:docker` — build the jib container images.
- `npm run prettier:format` / `npm run prettier:check` — format / verify formatting.

## Build & test prerequisites

Use the Gradle wrapper shipped with each app (`gradlew` on Windows); never a system Gradle installation. Docker must be running for integration tests that use Testcontainers.

## Worktrees

- Create all git worktrees inside the repo root's `.worktrees/` folder (e.g. `git worktree add .worktrees/<branch-name>`), never anywhere else. `.worktrees/` must be gitignored so `git status` stays clean.
- **Never run `npm install` inside a worktree.** Worktrees reuse the main checkout's dependencies instead:
  - Link the root `node_modules` into the worktree with a junction (no admin rights needed):
    `cmd /c mklink /J .worktrees\<name>\node_modules ..\..\node_modules`
  - Node/Vite parent-directory resolution picks up the root `node_modules` anyway, but the junction also makes `npm run` scripts resolve `.bin` shims reliably.
- If a worktree changes any `package.json`, install in the **main checkout** — not the worktree (through the junction it would write into the main `node_modules`).
- Gradle needs no sharing: caches are global (`~/.gradle`) and each worktree builds into its own directories.

## Conventions

- Frontend unit tests use Vitest — not the outdated test runner named in upstream docs. e2e tests use Cypress.
- i18n: every UI string gets a translation key in the JSON i18n files; never hardcode strings.
- If a generated-entity test fails validation, fix the test data — never the test architecture.
- Module federation: in each app's `module-federation.config.ts`, shared-mapping `import` paths must be relative to the Vite `root` (`src/main/webapp`), e.g. `` `./${map}` `` — never prefix them with `./src/main/webapp/`, or the virtual `mf-localSharedImportMap` imports resolve to a doubled path and the dev server fails.

## Git & PR workflow

- Default branch is `main`. **Never push directly to `main`** — every change, no matter how small, goes through a feature branch and a pull request. Enforcement lives in the GitHub repo settings (branch protection / rulesets), not in any file here.
- Dependabot is pre-configured in `.github/dependabot.yml` (monthly, currently disabled via `open-pull-requests-limit: 0`); see the comments in that file to enable it.

## Where rules live

- Per-service guidance: `gateway/AGENTS.md`, `blog/AGENTS.md`, `store/AGENTS.md`.
- Infrastructure docs: `docker-compose/README-DOCKER-COMPOSE.md`, `kubernetes/K8S-README.md`.
- Kubernetes uses raw manifests with kustomize and skaffold — no Helm.
