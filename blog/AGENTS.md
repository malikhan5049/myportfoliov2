# blog/AGENTS.md

## Role

Microservice behind the gateway. Owns `Blog`, `Post`, and `Tag` (`Post` ↔ `Tag` is many-to-many). Port 8081 (webapp dev server 9001); persists to Neo4j.

## Structure map

- `src/main/java` — Spring WebFlux backend.
- `src/main/webapp` — React frontend (Vitest unit tests).
- `src/main/resources/config/` — per-profile configuration.
- `build.gradle` — Gradle build; `gradle/` holds the wrapper. `src/test` — backend tests.

## Commands

Run from the repo root; `--workspace blog` scopes each command to this app.

- `npm run watch --workspace blog` — webapp dev server plus the backend.
- `npm run backend:unit:test --workspace blog` — backend unit and integration tests.
- `npm run webapp:test --workspace blog` — frontend unit tests.
- `npm run e2e:headless --workspace blog` — Cypress e2e run, headless.
- `npm run docker:db:up --workspace blog` — start Neo4j from `src/main/docker/neo4j.yml`.

## Gotchas

- Backend integration tests use Neo4j Testcontainers, so Docker must be running before `backend:unit:test`.
- Graph schema changes belong in neo4j-migrations; do not run ad-hoc Cypher scripts against a live database.
- No Liquibase here — SQL changelog work belongs to `gateway`.
- `ci:server:await` waits on the gateway (port 8080), not this app's own port, because the readiness endpoint is proxied through the gateway.
