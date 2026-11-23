# gateway/AGENTS.md

## Role

Gateway app and microfrontend shell for `blog` and `store`. Listens on port 8080 (webapp dev
server on 9000) and is backed by PostgreSQL, the only SQL database in the repo.

## Structure map

- `src/main/java` - Spring WebFlux / Spring Cloud Gateway backend.
- `src/main/webapp` - React microfrontend shell (Vitest for unit tests).
- `src/main/resources/config/application-*.yml` - per-profile configuration.
- `build.gradle` - Gradle build; `gradle/` holds the wrapper.
- `src/test` - backend tests.

## Commands

Run from the repo root; `--workspace gateway` keeps each command scoped to this app.

- `npm run watch --workspace gateway` - webapp dev server plus the backend.
- `npm run backend:unit:test --workspace gateway` - backend unit and integration tests.
- `npm run webapp:test --workspace gateway` - frontend unit tests.
- `npm run e2e:headless --workspace gateway` - Cypress e2e run, headless.
- `npm run docker:db:up --workspace gateway` - start PostgreSQL from `src/main/docker/postgresql.yml`.

## Gotchas

### Liquibase workflow

- Every schema change lives under `src/main/resources/config/liquibase/`.
- Add a new date-prefixed changelog named `yyyyMMddHHmmss_description.xml` and register it in `master.xml`.
- No raw SQL outside changelogs.

### Routing

- Spring Cloud Gateway routes to `blog` and `store` through Consul.
- Readiness of the microservices is checked through the gateway at
  `/services/blog/management/health/readiness` and `/services/store/management/health/readiness`.
- The `ci:server:await` script in `blog` and `store` polls those gateway paths on port 8080, which
  is why their `package.json` names port 8080 even though their own backends use 8081 and 8082.
