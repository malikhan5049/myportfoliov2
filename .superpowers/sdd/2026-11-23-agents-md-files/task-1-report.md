# Task 1 Report: Root AGENTS.md

**Status:** DONE

## What I wrote

Created `AGENTS.md` at the repo root with exactly the seven brief sections:

1. **Architecture overview** — short paragraph (JHipster microservices monorepo, npm workspaces, generated from `reactive-mf.jdl`, reactive/Spring WebFlux, Gradle, OAuth2 via Keycloak, discovery via Consul) plus the per-app table (gateway 8080/9000/PostgreSQL, blog 8081/9001/Neo4j with Blog/Post/Tag, store 8082/9002/MongoDB with Product) and the infra line (Compose file path, Consul 8500, Keycloak 9080/9443).
2. **Source of truth** — `reactive-mf.jdl` drives generation, never hand-edit generated code, regenerate from the JDL; `.yo-rc.json` per app holds generator config.
3. **Commands** — `npm run watch`, `npm run ci:backend:test --workspaces --if-present`, `npm run ci:frontend:test --workspaces --if-present`, `npm run webapp:test --workspace <app>`, the e2e flow `ci:e2e:prepare` → `ci:e2e:run` → `ci:e2e:teardown`, `npm run java:docker`, `npm run prettier:format` / `prettier:check`; plus the "run npm only from the root" rule.
4. **Build & test prerequisites** — Gradle wrapper (`gradlew` on Windows), never a system Gradle; Docker running for Testcontainers-based integration tests.
5. **Conventions** — Vitest for frontend unit tests, Cypress for e2e, i18n translation keys for every UI string (no hardcoded strings), fix generated-entity test data rather than test architecture.
6. **Docs caveat** — repo is JHipster 8-era, current jhipster.tech docs describe 9.x and may lag; repo wins.
7. **Where rules live** — `gateway/AGENTS.md`, `blog/AGENTS.md`, `store/AGENTS.md`; infra docs `docker-compose/README-DOCKER-COMPOSE.md`, `kubernetes/K8S-README.md`; k8s uses raw manifests + kustomize + skaffold, no Helm.

## Verification results

- `npm run prettier:check` (from repo root, PowerShell):
  ```
  Checking formatting...
  All matched files use Prettier code style!
  ```
  No formatting changes were needed; `prettier:format` was not run.
- Line count: **59** lines (limit 150).
- Forbidden-term scan (`Maven`, `Webpack`, `BrowserSync`, `H2`, `Gatling`, `Cucumber`, `Protractor`, `Jest`, `./gradlew`, `yarn`, `npx`): **no matches**.
- Every script named in the Commands section exists in the root `package.json`: `watch`, `ci:backend:test`, `ci:frontend:test`, `webapp:test`, `ci:e2e:prepare`, `ci:e2e:run`, `ci:e2e:teardown`, `java:docker`, `prettier:format`, `prettier:check`.

## Files changed

- `AGENTS.md` (created)
- `.superpowers/sdd/2026-11-23-agents-md-files/task-1-report.md` (this report)

## Self-review findings

- The brief's section 5/6 phrasing names the stale frontend test runner literally, but the
  acceptance criteria forbid that word in the file. I kept the meaning ("not the outdated test
  runner named in upstream docs" / "they name a different frontend test runner") without using
  the forbidden token, so both the no-forbidden-terms check and the docs-caveat intent hold.
- No per-service detail beyond the architecture table, so the service-level files can add to
  this guidance without duplication.

## Issues or concerns

None blocking. Only note is the wording trade-off above.
