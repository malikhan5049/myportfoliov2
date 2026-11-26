# GENERATED-CODE-DEFECTS.md

Known defects shipped by the JHipster templates used by this repo, with their fixes and
reference implementations. Re-apply every entry to freshly generated code.

> Note: an earlier copy of this file was lost (it was untracked). Entries were renumbered
> from that copy; the home double-reload fix (previously entry #3) lives in
> `gateway/src/main/webapp/app/modules/home/home.tsx` + `home.spec.tsx` and should be
> re-documented here.

### 4. Swagger UI assets not served at `/swagger-ui/*` → Administration > API blank screen; microservice docs pages list all services

- **Affected files:** `vite.config.ts` (all apps), `src/main/webapp/swagger-ui/index.html`
  (blog/store)
- **Symptom:** the Administration > API page (iframe → `/swagger-ui/index.html`) shows a blank
  screen with `axios is not defined` / `SwaggerUIBundle is not defined`; requests for
  `swagger-ui-bundle.js`, `swagger-ui-standalone-preset.js`, and `axios.min.js` under
  `/swagger-ui/` 404 (dev) or resolve to the SPA fallback page.
- **Root cause:** the page's assets are supplied by a `viteStaticCopy` block in the generated
  vite config. The gateway template shipped a `rename` callback that counted directory depth
  with `path.relative(webappDir, dirname)` output, which breaks on Windows
  (backslash separators defeat the `../` strip and the `/`-split depth count), copying assets
  to `swagger-ui/node_modules/...` instead of `swagger-ui/*`. Blog/store shipped **no**
  `viteStaticCopy` block at all, so nothing served the assets — same symptom, different cause.
  Additionally, the shared `swagger-ui/index.html` performs gateway-only discovery
  (`/management/health/discoveryComposite`, `/management/jhiopenapigroups`), so a microservice's
  docs page either fails or lists every service behind the gateway instead of its own API.
- **Fix:**
  1. Every app's vite config serves the swagger UI through `viteStaticCopy` (targets:
     `swagger-ui-dist/*` minus its `index.html`, `axios/dist/axios.min.js`, and the app's own
     `src/main/webapp/swagger-ui/index.html`; `dest: 'swagger-ui'`). The `rename` callback
     wraps `path.relative` in `normalizePath(...)` before stripping `../` segments and counting
     depth, so it is path-separator agnostic (works on Windows and Unix).
  2. Blog/store `swagger-ui/index.html` pages skip multi-service discovery but keep gateway's
     definition UX scoped to their own service: they fetch
     `/services/<app>/management/jhiopenapigroups` and build one RELATIVE url per springdoc
     group (`/services/<app>/v3/api-docs/<group>`, named by `description`, sorted with
     `(default)` before `(management)`), falling back to the gateway-routed ungrouped spec
     `/services/<app>/v3/api-docs`, then to the app's own `/v3/api-docs` when the page is
     served by that app's own backend (prod on the app's port). Responses that are not
     OpenAPI documents are rejected.
- **Reference:** `gateway/vite.config.ts` (asset copy + Windows-safe rename) — already applied;
  `blog/vite.config.ts`, `store/vite.config.ts`, `blog/src/main/webapp/swagger-ui/index.html`,
  `store/src/main/webapp/swagger-ui/index.html` (scoped docs page). Note blog/store dev proxies
  target the gateway (`localhost:8080`), so their docs pages must use the `/services/<app>/`
  route rather than their own backend port.
