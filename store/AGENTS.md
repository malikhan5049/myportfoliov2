# store/AGENTS.md

## Role

Microservice behind the gateway. Owns `Product`. Port 8082 (webapp dev server 9002); persists to MongoDB.

## Structure map

- `src/main/java` — Spring WebFlux backend.
- `src/main/webapp` — React frontend (Vitest unit tests).
- `src/main/resources/config/` — per-profile configuration.
- `build.gradle` — Gradle build; `gradle/` holds the wrapper. `src/test` — backend tests.

## Commands

Run from the repo root; `--workspace store` scopes each command to this app.

- `npm run watch --workspace store` — webapp dev server plus the backend.
- `npm run backend:unit:test --workspace store` — backend unit and integration tests.
- `npm run webapp:test --workspace store` — frontend unit tests.
- `npm run e2e:headless --workspace store` — Cypress e2e run, headless.
- `npm run docker:db:up --workspace store` — start MongoDB from `src/main/docker/mongodb.yml`.

## Gotchas

- Backend integration tests use embedded MongoDB, so no Docker is needed for backend tests — unlike `blog`.
- The backend is reactive Spring Data MongoDB: no Liquibase, no JPA. Do not introduce blocking JPA-style patterns such as `JpaRepository` or blocking repositories.
- `ci:server:await` waits on the gateway (port 8080), not this app's own port, because the readiness endpoint is proxied through the gateway.
