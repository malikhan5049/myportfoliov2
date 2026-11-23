# AGENTS.md structure for the myportfoliov2 monorepo — short design

Date: 2026-11-23

## Intent and why

Give AI coding agents persistent, correctly-scoped guidance for this JHipster
microservices monorepo (npm workspaces `gateway`, `blog`, `store`; JDL
`reactive-mf.jdl` is the generation source of truth).

## Approaches considered

1. **Single root AGENTS.md** — simple, but bloats every session with
   service-irrelevant detail and grows linearly per service.
2. **Hierarchical: root + one per service** — chosen. Matches how the repo is
   already organized; OpenCode loads the root always and nested files lazily
   (nearest-first) when the agent touches that area; other tools (Codex,
   Claude Code fallback) behave similarly.
3. **Root + `instructions` globs in opencode.json** — OpenCode-specific,
   less portable.

## Chosen design

Four files: `AGENTS.md` (root), `gateway/AGENTS.md`, `blog/AGENTS.md`,
`store/AGENTS.md`. No files under `docker-compose/`/`kubernetes/` yet — their
existing READMEs cover them; root points to those.

- Root: architecture map (ports 8080/8081/8082, PostgreSQL/Neo4j/MongoDB,
  Consul 8500, Keycloak 9080, webapp dev ports 9000-9002), JDL-as-source-of-
  truth rule, root npm scripts as the only entry point, Gradle-wrapper rule
  (Windows: `gradlew`), Docker required for Testcontainers-based integration
  tests, i18n rule, Vitest-not-Jest / repo-over-docs rule, pointers to infra
  READMEs and service files.
- Service files (identical structure, ~60-80 lines): role line, structure
  map, this-service commands, service gotchas (db compose file per service;
  gateway: Liquibase changelog + master.xml, Spring Cloud Gateway routing;
  blog: Neo4j Testcontainers need Docker, neo4j-migrations; store: embedded
  Mongo, no Docker for tests; all: route via gateway, never hardcode service
  URLs; Cypress needs full stack up).
- Maintenance rules: no duplication (service files add, never repeat);
  two-or-more rule (applies to 2+ services → root); keep root < ~150 lines,
  service files < ~100.

## Non-goals

- Not generating CLAUDE.md copies (Claude Code falls back to AGENTS.md).
- Not documenting Maven/Webpack/H2/Gatling/Cucumber/Protractor (unused here).
- Not adding CI pipelines or lint changes.

## What's left to the builder

Exact wording and ordering within the agreed section structure; verifying
every command against the actual package.json scripts before writing it.
