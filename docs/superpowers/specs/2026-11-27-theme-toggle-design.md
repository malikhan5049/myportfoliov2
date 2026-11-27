# Theme toggle (light / dark / system) — design

Date: 2026-11-27 · Status: draft for approval

## Intent

Give users a working light/dark/system theme across the portfolio application.
Today there is no theme implementation anywhere in the repo; the only
theme-adjacent code is a hardcoded `data-bs-theme="dark"` on the navbar
(`*/src/main/webapp/app/shared/layout/header/header.tsx:58`, all three apps)
and a static PWA `<meta name="theme-color">` in each `index.html`.

## Why / context

The repo is a JHipster 9.4.0 microservices monorepo with module federation:

- Blog/store expose only `entities-routes` / `entities-menu`; the gateway
  lazy-loads them (`gateway/src/main/webapp/app/routes.tsx:19-21`) and mounts
  them **into the same DOM document** — no iframes, no shadow DOM.
- Bootstrap 5.3.8 is a shared singleton across all apps (one copy in the page).
- Embedded microfrontends do not render their own headers — the gateway navbar
  is the only navbar users see in production.
- Blog/store can run standalone (own `index.html` + header) on dev ports
  9001/9002 — and in production they are standalone user-facing products, not
  just dev conveniences.

Because everything renders in one document with one Bootstrap copy, a single
`data-bs-theme` attribute on `<html>` themes all apps at once, including
embedded microfrontend content. Bootstrap 5.3's built-in color modes are the
reused implementation; JHipster itself ships no theme feature (its sanctioned
theming point is `_bootstrap-variables.scss`).

## Usage reality (from the product owner)

- Blog and store are **full standalone products**, user-facing directly by end
  users; the gateway is used for shared/admin tasks (mostly by admins, but
  end users may use it too).
- Therefore all three apps need complete theme support (own toggle in own
  navbar, own provider, own boot script) — not gateway-only with dev snippets.
- Cross-app consistency: each app persists the same storage key name. If apps
  are served same-origin in production the choices even sync automatically;
  otherwise the **System** default keeps apps consistent for most users
  (their OS preference is shared), and explicit overrides are per app — the
  same behavior users expect from independent products.

## Goals

- A **Light / Dark / System** switch in each app's own navbar (gateway, blog,
  store — all three are user-facing standalone apps).
- Default **System**: follows `prefers-color-scheme`, live (OS changes apply
  while the page is open).
- Persisted choice in `localStorage` under one shared key name; explicit
  light/dark overrides system.
- No flash of wrong theme on load (inline boot script before first paint).
- Embedded blog/store content in the gateway themes automatically — the host's
  `<html data-bs-theme>` wins; exposed federation modules stay theme-agnostic.
- Every UI string via i18n keys in all locale JSON files.
- Identical behavior and look of the toggle across the three apps.

## Non-goals

- A federated shared theme module or shared npm workspace package (rejected:
  cross-origin boot coupling / a new structural pattern the repo doesn't use;
  revisit if a fourth app appears — see Approach C).
- Server-side persistence of the theme preference (e.g. Keycloak user
  attributes) — localStorage is enough for v1; a future enhancement if
  cross-device sync is wanted.
- Custom color palettes / Bootswatch themes.
- Theming the admin docs iframe (out of scope).

## Approach (chosen: A, extended to all apps)

**A. Same self-contained theme implementation in each app (chosen).** Each of
the three apps gets its own theme context + hook, its own navbar toggle, its
own boot script, all sharing one storage key name and identical behavior.
This matches the repo's existing structure: there is no shared workspace
package — code is duplicated per app and bridged via federation
`shareMappings`; even i18n reducers are deliberately per-app.

- **B. Per-app switches with a gateway-only provider** — partially rejected:
  a gateway-owned provider alone no longer fits, since blog/store are
  user-facing standalone; and separate providers that both touch `<html>`
  would fight when embedded.
- **C. Federated shared theme module** (gateway exposes `./theme`, others
  consume) — rejected: blog/store standalone boots would need the gateway's
  remote entry cross-origin at startup, adding CORS and availability coupling
  for ~100 lines of duplicated, stable code. A shared npm workspace package
  would be the cleaner reuse path but introduces a new structural pattern the
  repo doesn't use today — revisit if a fourth app appears.

## Design

- **Theme model** (identical in all three apps): `'light' | 'dark' | 'system'`,
  stored under a single localStorage key (e.g. `portfolio-theme`). Resolved
  theme = stored choice, or `matchMedia('(prefers-color-scheme: dark)')` when
  `system`/unset.
- **Each app (gateway, blog, store)**:
  - Small theme context + `useTheme` hook (React 19 context; follows the
    existing `app/shared/*` structure) — duplicated per app by design.
  - Effect applies resolved theme to `document.documentElement`
    (`data-bs-theme="light|dark"`) and listens for OS scheme changes while in
    `system` mode (cleanup on unmount).
  - Toggle in that app's `header.tsx` navbar (replacing the hardcoded
    `data-bs-theme="dark"` on the `<Navbar>`): compact dropdown/segmented
    control with Light / Dark / System entries, sun/moon/auto icons.
  - Inline boot script in each app's `index.html` (reads the storage key →
    sets `data-bs-theme` on `<html>` before first paint) to avoid FOUC.
  - i18n keys (e.g. `global.theme.light|dark|system`, `global.theme.title`)
    added to every locale JSON.
- **Microfrontend boundary (critical)**: the provider lives at each app's
  shell level (`app.tsx` / `index.html` boot script). The exposed federation
  modules (`entities-routes`, `entities-menu`) must **not** mount a provider
  or touch `document.documentElement` — when embedded, the host's `<html>`
  attribute governs and remote content inherits it automatically.
- **Styling**: rely on Bootstrap 5.3 built-in dark color mode; fix brand
  colors that break in dark (e.g. `header.scss` `darken($header-color, ...)`)
  with dark-scoped overrides where needed — discovered during implementation,
  not pre-designed.
- **Navbar dark styling**: the current hardcoded dark navbar becomes
  theme-following (light navbar in light mode). If the brand look must stay
  dark regardless, that is a one-line revert + `header.scss` tweak.

## Constraints

- Bootstrap 5.3.8 / react-bootstrap 2.10.10 / sass 1.77.6 as-is; no new deps.
- JHipster 9 generated structure; never hand-edit generated code outside the
  sanctioned customization points (`_bootstrap-variables.scss`, app-level code).
- Tests: Vitest specs for the theme hook/context and each app's header
  toggle; update the existing `header.spec.tsx` files (may assert the old
  `data-bs-theme`).
- Work on a feature branch + PR; never push to `main`.
- Removed assumption: blog/store ARE user-facing standalone products — all
  three apps get the full implementation.

## Left to the builder

- Exact file placement/naming following existing shared-layout patterns.
- Dark-mode QA pass over each standalone app AND the gateway with embedded
  entity pages; fix any broken brand colors with dark-scoped SCSS.
- Deciding dropdown vs. segmented control for the toggle (either is fine;
  pick what fits the navbar).
- Whether brand-color tokens should move to CSS custom properties
  (`color-mode()` mixin) if plain Bootstrap dark leaves too many hard-coded
  `$var` colors broken.
