# AGENTS.md

Repo-wide guidance for AI agents working in this repository. Per-service detail lives in each
app's own `AGENTS.md` (see [Where rules live](#where-rules-live)).

## Architecture overview

This is a JHipster microservices monorepo built with npm workspaces, generated from
`reactive-mf.jdl` (at the repo root). Every application is reactive (Spring WebFlux) and builds
with Gradle. Authentication is OAuth2 via Keycloak; service discovery uses Consul.

| App       | Kind                          | HTTP port | Webapp dev port | Database   | Entities        |
| --------- | ----------------------------- | --------- | --------------- | ---------- | --------------- |
| `gateway` | gateway + microfrontend shell | 8080      | 9000            | PostgreSQL | —               |
| `blog`    | microservice                  | 8081      | 9001            | Neo4j      | Blog, Post, Tag |
| `store`   | microservice                  | 8082      | 9002            | MongoDB    | Product         |

Infrastructure runs via Docker Compose (`docker-compose/docker-compose.yml`): Consul on port
8500, Keycloak on 9080 (HTTPS 9443).

## Source of truth

`reactive-mf.jdl` drives generation. Never hand-edit generated code — change the JDL and
regenerate instead. Each app's `.yo-rc.json` holds its generator configuration.

## Commands

Run npm only from the repo root; the root workspaces forward to each app.

- `npm run watch` — dev servers for all three apps.
- `npm run ci:backend:test --workspaces --if-present` — backend tests.
- `npm run ci:frontend:test --workspaces --if-present` — frontend unit tests.
- `npm run webapp:test --workspace <app>` — frontend tests for a single app.
- e2e flow: `ci:e2e:prepare` → `ci:e2e:run` → `ci:e2e:teardown` (all via `npm run`).
- `npm run java:docker` — build the jib container images.
- `npm run prettier:format` / `npm run prettier:check` — format / verify formatting.

## Build & test prerequisites

Use the Gradle wrapper shipped with each app (`gradlew` on Windows); never a system Gradle
installation. Docker must be running for integration tests that use Testcontainers.

## Conventions

- Frontend unit tests use Vitest — not the outdated test runner named in upstream docs.
- e2e tests use Cypress.
- i18n: every UI string gets a translation key in the JSON i18n files; never hardcode strings.
- If a generated-entity test fails validation, fix the test data — never the test architecture.
- Module federation: in each app's `module-federation.config.ts`, shared-mapping `import` paths must be relative to the Vite `root` (`src/main/webapp`), e.g. `` `./${map}` `` — never prefix them with `./src/main/webapp/`, or the virtual `mf-localSharedImportMap` imports resolve to a doubled path and the dev server fails.


## Where rules live

- Per-service guidance: `gateway/AGENTS.md`, `blog/AGENTS.md`, `store/AGENTS.md`.
- Infrastructure docs: `docker-compose/README-DOCKER-COMPOSE.md`, `kubernetes/K8S-README.md`.
- Kubernetes uses raw manifests with kustomize and skaffold — no Helm.
