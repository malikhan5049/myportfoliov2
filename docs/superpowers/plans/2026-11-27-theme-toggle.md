# Theme Toggle (light / dark / system) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an identical Light/Dark/System theme switch to the navbar of all three apps (gateway, blog, store), persisted in `localStorage`, defaulting to System, with no flash of wrong theme.

**Architecture:** Bootstrap 5.3 color modes driven by `data-bs-theme` on `<html>`. Each app owns a small duplicated theme module (`app/shared/theme/`) + a `ThemeMenu` dropdown in its sidebar (`app/shared/layout/menus/theme.tsx`), wrapped at the app shell level. An inline boot script in each `index.html` applies the theme before first paint. Exposed federation modules stay theme-agnostic: when embedded in the gateway, the host's `<html>` attribute governs.

**Tech Stack:** React 19, react-bootstrap 2.10.10, Bootstrap 5.3.8, react-jhipster (`Translate`/`translate`), Vitest 5. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-27-theme-toggle-design.md`

## Global Constraints

- No new npm dependencies; use Bootstrap 5.3 built-in color modes only.
- Theme stored under raw `localStorage` key `portfolio-theme` (plain `window.localStorage`, NOT `react-jhipster` `Storage` — the inline boot script must read the same key with plain JS).
- Valid stored values: `'light' | 'dark' | 'system'` only; anything else (or absent/unavailable) behaves as `'system'`.
- Always set `data-bs-theme` explicitly to `'light'` or `'dark'` on `document.documentElement` (never remove the attribute) so `[data-bs-theme='dark']` SCSS selectors are deterministic.
- Every UI string via i18n keys; `en` is the only locale — keys go in `<app>/src/main/webapp/i18n/en/global.json` under `global.menu.theme`.
- Translation pattern: menus use `translate('...')` for prop strings and `<Translate contentKey="...">fallback</Translate>` for JSX (react-jhipster), like `menus/locale.tsx` / `menus/account.tsx`.
- Icons: FontAwesome (`@fortawesome/react-fontawesome`, string icon names like `icon="flag"` in `menus/locale.tsx:10`).
- Do NOT touch the exposed federation modules (`app/entities/routes.tsx`, `app/entities/menu.tsx` or anything they import) in blog/store — no provider, no `document.documentElement` access there.
- Tests: Vitest. Run one app's suite with `npm run webapp:test --workspace gateway` (likewise `blog`, `store`); a single file: `npm run webapp:test --workspace gateway -- src/main/webapp/app/shared/theme/theme.spec.tsx`.
- Run `npm run prettier:format` from repo root before each commit that touches code.
- Work on a feature branch; never push to `main`.

## Review Focus

The spec implies these inputs/failure modes; each is pinned by a test in the named task:

1. **Corrupted/unknown localStorage value** (e.g. `"banana"`) — expected: behaves exactly as `system`, app stays usable. Pinned in Task 1 (`theme.spec.tsx`).
2. **localStorage unavailable** (privacy mode throws on access) — expected: fallback to `system`, no crash; boot script must try/catch. Pinned in Task 1 (provider) and Task 3 (boot script is plain try/catch, verified by build + manual check).
3. **OS scheme change while page is open in system mode** — expected: theme updates live without user action. Pinned in Task 1 (`theme.spec.tsx` via mocked `matchMedia` listener).
4. **Embedded microfrontend must not override the host theme** — expected: blog/store exposed modules contain zero theme code. Pinned in Task 6 (grep verification step).
5. **Pages with hard-coded brand colors in dark mode** (sidebar `header.scss` uses `darken($header-color, 20%)`; also `home.scss`, `password-strength-bar.scss`) — expected: readable in both themes. QA checklist in Task 6, fixes as dark-scoped SCSS.

---

### Task 1: Gateway — theme module (`ThemeProvider` + `useTheme`)

**Files:**
- Create: `gateway/src/main/webapp/app/shared/theme/theme.tsx`
- Test: `gateway/src/main/webapp/app/shared/theme/theme.spec.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces (used by Tasks 2–5):
  - `export type Theme = 'light' | 'dark' | 'system'`
  - `export const THEME_STORAGE_KEY = 'portfolio-theme'`
  - `export type ResolvedTheme = 'light' | 'dark'`
  - `export interface IThemeContextValue { theme: Theme; resolvedTheme: ResolvedTheme; setTheme: (theme: Theme) => void }`
  - `export const ThemeProvider = (props: { children: React.ReactNode }) => ...`
  - `export const useTheme = (): IThemeContextValue => ...` (throws if used outside provider)

- [ ] **Step 1: Write the failing test** `theme.spec.tsx`

  Mock `window.matchMedia` at the top of the spec (jsdom has none):

  ```tsx
  const listeners = new Set<MediaQueryListEventListener>();
  const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: (_: string, cb: MediaQueryListEventListener) => listeners.add(cb),
    removeEventListener: (_: string, cb: MediaQueryListEventListener) => listeners.delete(cb),
  }));
  beforeEach(() => { localStorage.clear(); listeners.clear(); vi.stubGlobal('matchMedia', matchMediaMock); });
  ```

  Tests, using a probe component `const Probe = () => { const { theme, resolvedTheme, setTheme } = useTheme(); return <button onClick={() => setTheme('dark')}>{`${theme}:${resolvedTheme}`}</button>; }` rendered inside `<ThemeProvider>`:

  1. `resolves system to light when matchMedia says light` → initial render shows `system:light`.
  2. `resolves system to dark when matchMedia says dark` → with `matchMediaMock` returning `matches: true`, initial render shows `system:dark` and `document.documentElement.getAttribute('data-bs-theme')` is `'dark'`.
  3. `falls back to system for unknown stored values` → seed `localStorage.setItem('portfolio-theme', 'banana')` → renders `system:light`.
  4. `honors stored light/dark choices` → seed `'dark'` → renders `dark:dark`; seed `'light'` → renders `light:light`.
  5. `setTheme persists and applies` → click button → `localStorage.getItem('portfolio-theme')` is `'dark'`, `data-bs-theme` is `'dark'`, label shows `dark:dark`.
  6. `follows OS change live while in system mode` → after initial render in system mode, fire a listener from `listeners` (simulating `change`) with `matches: true` → label becomes `system:dark`.
  7. `useTheme throws outside provider` → expect `render(<Probe />)` without provider to throw (use `render` inside `expect(...).toThrow` or catch via error boundary).
  8. `falls back to system when localStorage access throws` → `vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); })` → renders `system:light`, no crash; also `setTheme` must not crash in this state (click → label updates, no persistence expected).

- [ ] **Step 2: Run test to verify it fails**

  Run: `npm run webapp:test --workspace gateway -- src/main/webapp/app/shared/theme/theme.spec.tsx`
  Expected: FAIL — cannot resolve `./theme` / `ThemeProvider` not defined.

- [ ] **Step 3: Implement `theme.tsx`**

  React context + provider; exact exports per Interfaces. Body algorithm (the only non-obvious part):

  ```tsx
  const readStoredTheme = (): Theme => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    } catch {
      return 'system';
    }
  };
  ```

  Provider: `useState<Theme>(readStoredTheme)`; one effect that (a) computes `resolvedTheme` = `theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme`, (b) sets `document.documentElement.setAttribute('data-bs-theme', resolvedTheme)`, (c) subscribes to the media query's `change` event and forces a re-render while `theme === 'system'` (cleanup unsubscribes). `setTheme` validates via the same whitelist, persists to `localStorage` (try/catch), and sets state.

- [ ] **Step 4: Run test to verify it passes**

  Run: `npm run webapp:test --workspace gateway -- src/main/webapp/app/shared/theme/theme.spec.tsx`
  Expected: PASS (all 8 tests).

- [ ] **Step 5: Format and commit**

  ```bash
  npm run prettier:format
  git add gateway/src/main/webapp/app/shared/theme/
  git commit -m "feat(gateway): add theme provider with light/dark/system support"
  ```

### Task 2: Gateway — `ThemeMenu` dropdown + i18n keys

**Files:**
- Create: `gateway/src/main/webapp/app/shared/layout/menus/theme.tsx`
- Modify: `gateway/src/main/webapp/app/shared/layout/menus/index.ts` (add export)
- Modify: `gateway/src/main/webapp/i18n/en/global.json` (add `global.menu.theme`)
- Test: `gateway/src/main/webapp/app/shared/layout/menus/theme.spec.tsx`

**Interfaces:**
- Consumes (from Task 1): `useTheme` from `app/shared/theme/theme`.
- Consumes (existing): `NavDropdown` from `./menu-components` (props: `icon: string`, `name`, children = `DropdownItem`s, pattern at `menus/locale.tsx:10`); `translate` from `react-jhipster`.
- Produces: `export const ThemeMenu = () => ...` — rendered by Task 3 inside the sidebar `<Nav>`.

- [ ] **Step 1: Add i18n keys** to `gateway/src/main/webapp/i18n/en/global.json`, inside the `"menu"` object (next to `"account"`):

  ```json
  "theme": {
    "main": "Theme",
    "light": "Light",
    "dark": "Dark",
    "system": "System"
  }
  ```

- [ ] **Step 2: Write the failing test** `theme.spec.tsx`

  Render recipe follows the app's header spec: `render(<Provider store={initStore()}><MemoryRouter><ThemeProvider><ThemeMenu /></ThemeProvider></MemoryRouter></Provider>)` (redux Provider present because `menu-components` uses react-bootstrap/Nav internals consistent with other menus). Tests:

  1. `renders a theme toggle` → screen shows the translated "Theme" name (query by text `theme`, the `Translate` fallback).
  2. `marks the active theme` → open the dropdown (react-bootstrap Dropdown toggle via `fireEvent.click` on the toggle element) → the item matching the current theme (`system` by default) has class `active`.
  3. `clicking Dark sets theme` → click the "Dark" item → `document.documentElement.getAttribute('data-bs-theme')` is `'dark'` and `localStorage.getItem('portfolio-theme')` is `'dark'`.

  Seed/clear `localStorage` and stub `matchMedia` in `beforeEach` as in Task 1.

- [ ] **Step 3: Run test to verify it fails**

  Run: `npm run webapp:test --workspace gateway -- src/main/webapp/app/shared/layout/menus/theme.spec.tsx`
  Expected: FAIL — `./theme` menu module missing.

- [ ] **Step 4: Implement `menus/theme.tsx`**

  Same shape as `menus/locale.tsx`: `<NavDropdown icon="circle-half-stroke" name={translate('global.menu.theme.main')}>` with three `DropdownItem`s (`active={theme === 'light' | 'dark' | 'system'}`, `onClick={() => setTheme(...)}`), each labeled with `<Translate contentKey="global.menu.theme.light|dark|system">`. Get `theme`/`setTheme` from `useTheme()`.

- [ ] **Step 5: Export it** — add `export { ThemeMenu } from './theme';` to `gateway/src/main/webapp/app/shared/layout/menus/index.ts` (follow the existing export style in that file).

- [ ] **Step 6: Run test to verify it passes**

  Run: `npm run webapp:test --workspace gateway -- src/main/webapp/app/shared/layout/menus/theme.spec.tsx`
  Expected: PASS (all 3 tests).

- [ ] **Step 7: Format and commit**

  ```bash
  npm run prettier:format
  git add gateway/src/main/webapp/app/shared/layout/menus/ gateway/src/main/webapp/i18n/en/global.json
  git commit -m "feat(gateway): add theme menu dropdown to navbar menus"
  ```

### Task 3: Gateway — wire provider, integrate header, boot script

**Files:**
- Modify: `gateway/src/main/webapp/app/index.tsx` (wrap tree in `ThemeProvider`, around `<Provider store={store}>` at L41)
- Modify: `gateway/src/main/webapp/app/shared/layout/header/header.tsx:60` (remove `data-bs-theme="dark"`), `header.tsx:67` (add `<ThemeMenu />` after `<LocaleMenu ... />`)
- Modify: `gateway/src/main/webapp/app/shared/layout/header/header.spec.tsx` (wrap render in `ThemeProvider`; import from `app/shared/theme/theme`)
- Modify: `gateway/src/main/webapp/index.html` (inline boot script in `<head>`, before the module script at L15)

**Interfaces:**
- Consumes (Task 1): `ThemeProvider` from `app/shared/theme/theme`.
- Consumes (Task 2): `ThemeMenu` from `app/shared/layout/menus`.
- Produces: a fully themed gateway app.

- [ ] **Step 1: Write the failing header spec additions**

  In `header.spec.tsx`: wrap the existing `render(...)` JSX in `<ThemeProvider>` (inside the existing Provider/MemoryRouter wrappers). Add one test: `navbar has no hardcoded data-bs-theme` → `container.querySelector('nav[data-cy="navbar"]')` has `getAttribute('data-bs-theme') === null`. Run existing suite first — if any existing test asserts the old `data-bs-theme="dark"`, update that assertion to the new expectation instead of deleting the test.

- [ ] **Step 2: Run test to verify it fails**

  Run: `npm run webapp:test --workspace gateway -- src/main/webapp/app/shared/layout/header/header.spec.tsx`
  Expected: FAIL — `ThemeProvider` not mounted / attribute still present.

- [ ] **Step 3: Implement the wiring**

  1. `header.tsx` L60: `<nav data-cy="navbar" className="jh-sidebar">` (attribute removed).
  2. `header.tsx` after L67 `<LocaleMenu ... />`: add `<ThemeMenu />`.
  3. `index.tsx` L41: wrap — `<Provider store={store}><ThemeProvider>...existing children...</ThemeProvider></Provider>` (order irrelevant to behavior; keep minimal diff).
  4. `index.html` `<head>` before the module script (L15):

  ```html
  <script>
    (function () {
      var stored = null;
      try { stored = localStorage.getItem('portfolio-theme'); } catch (e) {}
      var dark =
        stored === 'dark' ||
        ((!stored || stored === 'system') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    })();
  </script>
  ```

- [ ] **Step 4: Run tests to verify they pass**

  Run: `npm run webapp:test --workspace gateway`
  Expected: PASS — full gateway frontend suite green.

- [ ] **Step 5: Format and commit**

  ```bash
  npm run prettier:format
  git add gateway/src/main/webapp/
  git commit -m "feat(gateway): wire theme provider, navbar toggle and no-flash boot script"
  ```

### Task 4: Blog — replicate Tasks 1–3

**Files:** identical relative paths under `blog/src/main/webapp/...` (theme module, theme spec, menus/theme.tsx + theme.spec.tsx, menus/index.ts, i18n/en/global.json, app/index.tsx, header.tsx + header.spec.tsx, index.html).

**Interfaces:**
- Consumes/Produces: same exports as Tasks 1–2, under `blog/`.

- [ ] **Step 1: Port the theme module** — copy `theme.tsx` and `theme.spec.tsx` from gateway (Task 1, same content, no path changes needed — imports are `app/...` aliases resolved per app).
- [ ] **Step 2: Run**: `npm run webapp:test --workspace blog -- src/main/webapp/app/shared/theme/theme.spec.tsx` → PASS.
- [ ] **Step 3: Port the theme menu + i18n keys** (Task 2, Steps 1–5; blog's `global.json` has the same `global.menu` shape).
- [ ] **Step 4: Run**: `npm run webapp:test --workspace blog -- src/main/webapp/app/shared/layout/menus/theme.spec.tsx` → PASS.
- [ ] **Step 5: Wire provider, header and boot script** (Task 3, Steps 1–4 — blog's `index.tsx` Provider is at L29, `header.tsx` lines match gateway's exactly).
- [ ] **Step 6: Run full suite**: `npm run webapp:test --workspace blog` → PASS.
- [ ] **Step 7: Format and commit**

  ```bash
  npm run prettier:format
  git add blog/src/main/webapp/
  git commit -m "feat(blog): add light/dark/system theme toggle"
  ```

### Task 5: Store — replicate Tasks 1–3

**Files:** identical relative paths under `store/src/main/webapp/...`.

**Interfaces:** same as Task 4, under `store/`.

- [ ] **Step 1: Port the theme module** (Task 1 content) → `npm run webapp:test --workspace store -- src/main/webapp/app/shared/theme/theme.spec.tsx` → PASS.
- [ ] **Step 2: Port the theme menu + i18n keys** (Task 2) → `npm run webapp:test --workspace store -- src/main/webapp/app/shared/layout/menus/theme.spec.tsx` → PASS.
- [ ] **Step 3: Wire provider, header and boot script** (Task 3; store's `index.tsx` Provider is at L29) → `npm run webapp:test --workspace store` → PASS.
- [ ] **Step 4: Format and commit**

  ```bash
  npm run prettier:format
  git add store/src/main/webapp/
  git commit -m "feat(store): add light/dark/system theme toggle"
  ```

### Task 6: Monorepo verification + dark-mode QA

**Files:**
- Modify (only if QA finds breakage): brand-color SCSS — `*/src/main/webapp/app/shared/layout/header/header.scss`, `home.scss`, `password-strength-bar.scss` (dark-scoped selectors)

**Interfaces:** consumes everything; produces a verified branch.

- [ ] **Step 1: Run the whole frontend suite**: `npm run webapp:test` (root, all workspaces) → PASS.
- [ ] **Step 2: Verify the MF boundary**: grep blog/store exposed modules for theme code — `grep -r "data-bs-theme\|useTheme\|ThemeProvider\|documentElement" blog/src/main/webapp/app/entities store/src/main/webapp/app/entities` → expected: no matches (matches only allowed in shared/theme, menus, header, index.html).
- [ ] **Step 3: Manual QA checklist** (dev servers via `npm run watch`, ports 9000/9001/9002):

  1. Each app standalone: toggle Light → page + sidebar go light; Dark → dark; System → follows OS; toggle OS scheme while page open → updates live; reload → no flash of wrong theme.
  2. Gateway with embedded blog/store pages: switching theme in gateway navbar themes embedded entity pages.
  3. Dark mode readability pass: sidebar (brand `$header-color` + `darken()`), home page, password strength bar, tables/cards/forms.
  4. Broken spots fixed with dark-scoped SCSS, e.g. `[data-bs-theme='dark'] .jh-sidebar { ... }` in `header.scss` — minimal overrides only.
- [ ] **Step 4: Format and commit (if SCSS changed)**

  ```bash
  npm run prettier:format
  git add */src/main/webapp/app/
  git commit -m "fix: dark-mode contrast adjustments for brand colors"
  ```
