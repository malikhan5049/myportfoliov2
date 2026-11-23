# blog/AGENTS.md

## Role

Microservice behind the gateway. Owns the entities `Blog`, `Post`, and `Tag`, where `Post` to
`Tag` is many-to-many. Listens on port 8081 (webapp dev server on 9001) and persists to Neo4j.

## Structure map

- `src/main/java` - Spring WebFlux backend.
- `src/main/webapp` - React frontend (Vitest for unit tests).
- `src/main/resources/config/` - per-profile configuration.
- `build.gradle` - Gradle build; `gradle/` holds the wrapper.
- `src/test` - backend tests.

## Commands

Run from the repo root; `--workspace blog` keeps each command scoped to this app.

- `npm run watch --workspace blog` - webapp dev server plus the backend.
- `npm run backend:unit:test --workspace blog` - backend unit and integration tests.
- `npm run webapp:test --workspace blog` - frontend unit tests.
- `npm run e2e:headless --workspace blog` - Cypress e2e run, headless.
- `npm run docker:db:up --workspace blog` - start Neo4j from `src/main/docker/neo4j.yml`.

## Gotchas

- Backend integration tests use Neo4j Testcontainers, so Docker must be running before
  `backend:unit:test`.
- Graph schema changes belong in neo4j-migrations; do not ad-hoc Cypher scripts against a live
  database.
- There is no Liquibase here. SQL changelog work belongs to `gateway`.
- `ci:server:await` waits on the gateway (port 8080), not on this app's own port, because the
  readiness endpoint is proxied through the gateway.
