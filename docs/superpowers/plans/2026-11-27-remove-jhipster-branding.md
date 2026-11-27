# Remove JHipster Branding From the User Experience — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nothing a user of the running system sees says "JHipster" any more. Home pages, browser error page, startup console banner, navbar/loading/hero images, PWA manifest icons and the Keycloak login page all read **My App Store**. JHipster may remain in code, comments, config keys and generator files.

**Architecture:** Purely presentational change, applied identically to three React/Vite frontends (`gateway/`, `blog/`, `store/`) plus one Keycloak realm JSON. New brand assets are generated once and copied into each app's `content/images/`; each app then repoints 6 reference sites (home i18n, home component, index.html, manifest, loading CSS, header + home SCSS) at them, replaces `banner.txt`, and deletes its 21 old `jhipster`-named image files. No framework, config-key, module-path or test-architecture change.

**Tech Stack:** React 18 + TypeScript + Vite (webapp), JSON i18n (`react-jhipster` `Translate`), SCSS, plain HTML, Spring Boot `banner.txt` (ASCII + `${...}` placeholders), Keycloak 24 realm import JSON, Vitest (frontend unit tests), PowerShell `System.Drawing` (icon resizing), ripgrep (`rg`) for verification sweeps.

**Spec:** `docs/superpowers/specs/2026-11-27-remove-jhipster-branding-design.md`

## Global Constraints

- Platform is **Windows**. Shell is PowerShell; use the Gradle wrapper `gradlew`, never a system `gradle`. Run npm only from the repo root (`npm run webapp:test --workspace gateway|blog|store`).
- Frontend unit tests are **Vitest**, run from the repo root: `npm run webapp:test --workspace gateway` (likewise `blog`, `store`). Never run the full workspace suite for a single-app change.
- Brand string is exactly **My App Store** (capital M, capital A, capital S) everywhere user-visible.
- Only the `en` locale exists — do not add or touch other locales.
- **Do not touch:** any `jhipster.*` config key, `react-jhipster` imports, `app/shared/jhipster/` module paths, code comments, `global.json` `jhipster-needle-*` keys *and* values, any `README*.md`, `.yo-rc.json`, `reactive-mf.jdl`, build scripts, `package.json`.
- **Do not touch** the Keycloak realm **id** `jhipster` (docker-compose auth wiring depends on it) — only display names and role descriptions change.
- Keep the HTML needle marker comment in `index.html` (dev-only generator needle) and keep the debugging-guidance block on the error page; only the id (`jhipster-error` → `app-error`), wording and outbound links change.
- New asset filenames are fixed: `my-app-store-logo.png`, `my-app-store-icon-192.png`, `my-app-store-icon-256.png`, `my-app-store-icon-384.png`, `my-app-store-icon-512.png`, `my-app-store-hero.svg`.
- Every UI string goes through an i18n key — no hardcoded English in `home.tsx`.
- If a test or snapshot fails after an edit, fix the **test data / expectation**, never the test architecture (repo `AGENTS.md` rule).
- One commit per task (Tasks 1–5). Task 6 commits nothing when clean.
- Never push to `main`; work happens on the feature branch created in Task 1.

## Review Focus

- **A leftover visible "JHipster" anywhere** (home page, error page, banner, Keycloak): reviewer greps instead of trusting the diff. Test: Task 6 Step 2 sweep — must return zero hits outside `global.json` needles, `jhipster.*` config and code comments.
- **Broken image references after deletion** — a strict Vite build fails or the navbar/loading/hero renders blank. Test: Task 2–4 Step "no orphan references" grep + `npm run webapp:test --workspace <app>`; also `npm run build --workspace <app>` if the importer is a TS import.
- **`banner.txt` corrupting Spring Boot startup** — a mangled `${spring-boot.version}` / `${AnsiColor.X}` placeholder breaks the banner or the ANSI colouring. Test: Task 2 Step 3 full-file read of the rewritten banner, comparing placeholder count against the original.
- **Keycloak realm import failing** — invalid JSON or a changed realm id. Test: Task 5 Step 3 `Get-Content | ConvertFrom-Json` parse + explicit assertion that `"id": "jhipster"` is unchanged.
- **Scope creep into framework config** — a "helpful" rename of `jhipster.registry.*` or `global.json` values silently breaks the generator/framework. Test: Task 6 Step 3 `git diff --stat` must not list `.yo-rc.json`, `package.json`, `reactive-mf.jdl` or any `application*.yml`.
- **Manifest icon mismatch** — PWA install icon 404s because the file name or the size set is wrong. Test: Task 2–4 Step "manifest ↔ files" cross-check.

---

### Task 1: Brand image assets (orchestrator-generated) + feature branch

**Executor note:** image *generation* cannot be done by a subagent. The orchestrator session generates the images, then the resize script produces the manifest sizes. This task is complete when the 6 files exist in all three apps with correct pixel dimensions.

**Files:**
- Create (repo root staging): `docs/superpowers/assets/my-app-store-logo.png`, `docs/superpowers/assets/my-app-store-icon-512.png`, `docs/superpowers/assets/my-app-store-hero.svg`
- Create (PowerShell helper): `C:\Users\user\AppData\Local\Temp\opencode\resize-brand-icons.ps1`
- Create in each of `gateway/`, `blog/`, `store/`: `src/main/webapp/content/images/my-app-store-logo.png`, `my-app-store-icon-{192,256,384,512}.png`, `my-app-store-hero.svg` (18 files total)

**Interfaces:**
- Produces: the exact six filenames every later task references. Later tasks must not invent variant names.
- Produces: a branch `feature/remove-jhipster-branding` that all commits land on.

- [ ] **Step 1: Create the feature branch**

Run from repo root:
```
git switch -c feature/remove-jhipster-branding
```
Expected: `Switched to a new branch 'feature/remove-jhipster-branding'`. Confirm with `git branch --show-current`.

- [ ] **Step 2: Generate the logo and the 512 icon (orchestrator session)**

Generate two images with the image-generation tool and save them into `docs/superpowers/assets/`:

- `my-app-store-logo.png` — prompt: *"Square app logo, flat vector style, 1024×1024, a simple white storefront glyph with an awning on a solid deep-indigo (#1b2a4a) rounded-square background, centred with generous padding, no text, no letters, crisp edges, high contrast, suitable for a small navbar logo."*
- `my-app-store-icon-512.png` — prompt: *"App icon, flat vector style, exactly 512×512, same deep-indigo (#1b2a4a) rounded-square background with the white storefront glyph, slightly bolder stroke and more padding than a navbar logo so it reads at 192px, no text, no gradients, no shadows."*
- `my-app-store-hero.svg` — do **not** generate; hand-write a neutral vector (see Step 4).

Expected: both PNGs exist and report 512×512 or larger with a 1:1 aspect ratio. Verify:
```powershell
Add-Type -AssemblyName System.Drawing
Get-ChildItem docs/superpowers/assets/*.png | ForEach-Object {
  $i = [System.Drawing.Image]::FromFile($_.FullName); "{0} {1}x{2}" -f $_.Name,$i.Width,$i.Height; $i.Dispose() }
```

- [ ] **Step 3: Downscale the icon to the manifest sizes with a PowerShell System.Drawing script**

Create `C:\Users\user\AppData\Local\Temp\opencode\resize-brand-icons.ps1`:

```powershell
Add-Type -AssemblyName System.Drawing
param([string]$Source = "V:\Dev\Projects\myportfoliov2\docs\superpowers\assets\my-app-store-icon-512.png",
      [string[]]$Targets = @("gateway","blog","store"))
$img = [System.Drawing.Image]::FromFile($Source)
foreach ($app in $Targets) {
  $dir = "V:\Dev\Projects\myportfoliov2\$app\src\main\webapp\content\images"
  if (-not (Test-Path $dir)) { throw "missing $dir" }
  Copy-Item "V:\Dev\Projects\myportfoliov2\docs\superpowers\assets\my-app-store-logo.png" (Join-Path $dir "my-app-store-logo.png") -Force
  Copy-Item $Source (Join-Path $dir "my-app-store-icon-512.png") -Force
  Copy-Item "V:\Dev\Projects\myportfoliov2\docs\superpowers\assets\my-app-store-hero.svg" (Join-Path $dir "my-app-store-hero.svg") -Force
  foreach ($size in 192,256,384) {
    $bmp = New-Object System.Drawing.Bitmap($size,$size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $size, $size)
    $g.Dispose()
    $bmp.Save((Join-Path $dir "my-app-store-icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
  }
}
$img.Dispose()
```

Note: PowerShell requires `param()` before `Add-Type` in a script file — if the interpreter errors, move the `param(...)` block to the top of the file.

Run: `powershell -ExecutionPolicy Bypass -File C:\Users\user\AppData\Local\Temp\opencode\resize-brand-icons.ps1`

- [ ] **Step 4: Author the neutral hero SVG**

Create `docs/superpowers/assets/my-app-store-hero.svg` — a wide (e.g. `viewBox="0 0 640 480"`) abstract composition in the brand indigo palette: a large rounded storefront outline, three simple product tiles, and a subtle grid of dots. **No text, no JHipster/Spring/Java shapes, no external `href`.** Keep it under 40 lines so it reads as a deliberate asset, not a traced photo.

- [ ] **Step 5: Verify all 18 asset files and their pixel sizes**

Run:
```powershell
Add-Type -AssemblyName System.Drawing
foreach ($app in "gateway","blog","store") {
  "== $app"
  Get-ChildItem "V:\Dev\Projects\myportfoliov2\$app\src\main\webapp\content\images\my-app-store-*" |
    ForEach-Object {
      if ($_.Extension -eq ".png") {
        $i = [System.Drawing.Image]::FromFile($_.FullName); "{0} {1}x{2}" -f $_.Name,$i.Width,$i.Height; $i.Dispose()
      } else { "{0} {1} bytes" -f $_.Name,$_.Length }
    }
}
```
Expected per app: `my-app-store-logo.png` (square), `my-app-store-icon-192.png` 192×192, `-256` 256×256, `-384` 384×384, `-512` 512×512, `my-app-store-hero.svg` non-empty. 6 files × 3 apps = 18 lines of output.

- [ ] **Step 6: Commit the assets**

```
git add docs/superpowers/assets gateway/src/main/webapp/content/images blog/src/main/webapp/content/images store/src/main/webapp/content/images
git commit -m "feat(branding): add My App Store logo, PWA icons and hero art"
```

---

### Task 2: Rebrand the gateway webapp

**Files (all under `gateway/`):**
- Modify: `src/main/webapp/i18n/en/home.json`, `src/main/webapp/app/modules/home/home.tsx`, `src/main/webapp/index.html`, `src/main/webapp/manifest.webapp`, `src/main/webapp/content/css/loading.css`, `src/main/webapp/app/shared/layout/header/header-components.tsx`, `src/main/webapp/app/modules/home/home.scss`, `src/main/resources/banner.txt`
- Delete: the 21 `src/main/webapp/content/images/*jhipster*` files

**Interfaces:**
- Consumes: the six `my-app-store-*` filenames from Task 1.
- Produces: the exact set of edits Tasks 3 and 4 replicate (same sections, same wording) — keep them byte-identical except for the app name in commit messages.

- [ ] **Step 1: Rewrite `i18n/en/home.json`**

Read the file first. Keep `home.title`, `home.subtitle`, `home.logged.message`; **delete** `home.question`, the whole `home.link` object, `home.like`, `home.github`. Add `home.intro`. Target content:

```json
{
  "home": {
    "title": "Welcome to My App Store",
    "subtitle": "Your applications in one place",
    "logged": {
      "message": "You are logged in as user \"{{username}}\"."
    },
    "intro": "Use the navigation above to explore the store, read the blog and manage your account."
  }
}
```
Verify it parses: `node -e "JSON.parse(require('fs').readFileSync('gateway/src/main/webapp/i18n/en/home.json','utf8')); console.log('ok')"` → `ok`, and `rg -n -i jhipster gateway/src/main/webapp/i18n/en/home.json` → no output.

- [ ] **Step 2: Rewrite the home component `app/modules/home/home.tsx`**

Read the file (gateway line numbers run ~4 higher than blog/store; locate by content, not by line). Changes:
1. Replace the `home.title` fallback children `Welcome, Java Hipster!` with `Welcome to My App Store` (keep the `<Translate contentKey="home.title">` wrapper).
2. Replace the `home.subtitle` fallback `This is your homepage` with `Your applications in one place`.
3. Delete the whole block that renders `home.question`, the `<ul>` of marketing links (`jhipster.tech`, Stack Overflow, GitHub issues, Gitter, Twitter) and the `home.like` / `home.github` "give us a star" sentence.
4. In its place render one neutral paragraph:
   ```tsx
   <p>
     <Translate contentKey="home.intro">Use the navigation above to explore the store, read the blog and manage your account.</Translate>
   </p>
   ```
5. If a now-unused import (e.g. a `FontAwesomeIcon` used only by those links) would trip lint/TS `noUnusedLocals`, remove **that import only** — do not touch any `react-jhipster` import.

Verify: `rg -n -i "jhipster|Java Hipster" gateway/src/main/webapp/app/modules/home/home.tsx` → no output.

- [ ] **Step 3: Replace `src/main/resources/banner.txt`**

Read the **entire** current file first and count every `${...}` placeholder and every `AnsiColor` escape line. Keep the Spring Boot-generated structure intact: the `${spring-boot.version}` line, the profile line, the full `${AnsiColor.*}` palette definitions and the blank padding lines. Only the branding block changes. Target centre block:

```
:: My App Store ::                        Running Spring Boot ${spring-boot.version} ::
:: Running with Spring profile(s) : ${spring.profiles.active} ::
```
Replace the two JHipster lines (`:: JHipster 🤓 ::` and `:: https://www.jhipster.tech ::`) with the two lines above; leave `${AnsiColor.DEFAULT}` and every other placeholder byte-identical. If the file also hardcodes a `JHipster` ASCII art string, swap it for a plain block-letter `MY APP STORE` of the same line width so the banner does not wrap.

Verify: `rg -n -i jhipster gateway/src/main/resources/banner.txt` → no output, and re-read the file confirming `${spring-boot.version}` and `${spring.profiles.active}` are both still present.

- [ ] **Step 4: Rebrand `src/main/webapp/index.html`**

Read the file (line numbers below are from the inventory; locate by content). Edits:
1. Keep the needle comment (the `jhipster-needle-*` HTML comment) **unchanged** — it is a generator marker.
2. `<div id="jhipster-error">` → `<div id="app-error">` (keep all classes).
3. Error headline/body copy: replace any "JHipster" wording with "My App Store" (e.g. "An error has occurred! My App Store is unable to reach the server."). Keep the debugging guidance block and its wording otherwise intact.
4. Delete every outbound JHipster link: JHipster homepage, "questions on Stack Overflow", "issues on GitHub", "chat room", "contributing guidelines", Twitter — delete the whole `<li>`/`<p>` elements, do not leave empty anchors.
5. Update the tail script selector at the bottom of the file: `document.getElementById('jhipster-error')` → `document.getElementById('app-error')` (and any `querySelector('#jhipster-error')` equivalent).

Verify: `rg -n -i jhipster gateway/src/main/webapp/index.html` returns **exactly one** line — the kept needle comment. Also confirm `rg -c "app-error" gateway/src/main/webapp/index.html` ≥ 2 (div + script).

- [ ] **Step 5: Repoint `manifest.webapp` at the new icons**

Read the file. The four `icons[].src` values currently point at `content/images/jhipster_family_member_0_head-{192,256,384,512}.png`; change them to `content/images/my-app-store-icon-{192,256,384,512}.png` respectively, keeping `sizes` and `type` untouched. If the manifest has a top-level `logo`/`shortcuts[].icons` entry referencing a jhipster image, repoint it to `content/images/my-app-store-logo.png`.

Verify: `rg -n -i jhipster gateway/src/main/webapp/manifest.webapp` → no output; and all four `src` values resolve to files that exist under `gateway/src/main/webapp/`.

- [ ] **Step 6: Repoint the loading spinner and the navbar logo**

- `src/main/webapp/content/css/loading.css` — change `url('/content/images/logo-jhipster.png')` to `url('/content/images/my-app-store-logo.png')` (keep the `!important`, sizing and animation untouched).
- `src/main/webapp/app/shared/layout/header/header-components.tsx` — change only the image import specifier (`.../logo-jhipster.png` → `.../my-app-store-logo.png`); keep the local binding name (`logo`) and all JSX/markup identical.

- [ ] **Step 7: Repoint the home hero background**

In `src/main/webapp/app/modules/home/home.scss` change the `background-image: url('/content/images/jhipster_family_member_0.svg')` (gateway uses member 0) to `url('/content/images/my-app-store-hero.svg')`. Keep every other declaration (`background-size`, `min-height`, gradients) unchanged.

- [ ] **Step 8: Delete the 21 old JHipster images**

```powershell
Get-ChildItem gateway/src/main/webapp/content/images -Filter "*jhipster*" | Remove-Item -Force
```
Expected: 21 files deleted — `logo-jhipster.png`, `jhipster_family_member_{0,1,2,3}.svg`, `jhipster_family_member_{0,1,2,3}_head-{192,256,384,512}.png`.

Verify no orphan references: `rg -n -i "jhipster_family|logo-jhipster" gateway/src/main/webapp gateway/src/main/resources` → no output.

- [ ] **Step 9: Run the gateway frontend test suite**

Run from repo root: `npm run webapp:test --workspace gateway`
Expected: all suites pass, exit code 0. If a snapshot/test asserts on old copy, update the expectation/data — never the test architecture.

- [ ] **Step 10: Commit**

```
git add -A gateway/src/main/webapp gateway/src/main/resources/banner.txt
git commit -m "feat(gateway): rebrand user-facing UI to My App Store"
```

---

### Task 3: Rebrand the blog webapp

**Files (all under `blog/`):** identical set to Task 2, with blog's own line numbers.

**Interfaces:**
- Consumes: Task 1 assets; Task 2's exact wording, so the three apps stay consistent.
- Produces: blog parity — a reviewer diffing `gateway/` vs `blog/` changes should see only app-specific line offsets and the `member_2` hero reference.

- [ ] **Step 1: Apply the Task 2 Step 1 `home.json` rewrite to `blog/src/main/webapp/i18n/en/home.json`**

Byte-identical target JSON to Task 2. Verify: parses via `node -e`, `rg -n -i jhipster .../home.json` → no output.

- [ ] **Step 2: Apply the Task 2 Step 2 `home.tsx` rewrite to `blog/src/main/webapp/app/modules/home/home.tsx`**

Same five edits (title fallback, subtitle fallback, delete marketing block, insert `home.intro` paragraph, drop only provably-unused imports). Blog's JHipster URLs sit from ~L73 (blog/store are the unshifted layout). Verify: `rg -n -i "jhipster|Java Hipster" blog/src/main/webapp/app/modules/home/home.tsx` → no output.

- [ ] **Step 3: Replace `blog/src/main/resources/banner.txt`**

Read the full file, then apply the same two replacement lines as Task 2 Step 3, preserving every `${...}` placeholder and ANSI line. Verify: `rg -n -i jhipster blog/src/main/resources/banner.txt` → no output; `${spring-boot.version}` still present.

- [ ] **Step 4: Rebrand `blog/src/main/webapp/index.html`**

Same five edits as Task 2 Step 4: keep the needle comment, `jhipster-error` → `app-error` (div + JS selector), neutral error copy, delete the JHipster question/contribution links. Verify: `rg -n -i jhipster blog/src/main/webapp/index.html` → exactly one line (the needle comment).

- [ ] **Step 5: Repoint `blog/src/main/webapp/manifest.webapp`**

`icons[].src` → `content/images/my-app-store-icon-{192,256,384,512}.png`. Previously blog used `jhipster_family_member_2_head-*`; the member-number distinction disappears — all three apps share one icon set. Verify: `rg -n -i jhipster blog/src/main/webapp/manifest.webapp` → no output.

- [ ] **Step 6: Repoint `blog/src/main/webapp/content/css/loading.css` and `blog/src/main/webapp/app/shared/layout/header/header-components.tsx`**

Same two single-specifier changes as Task 2 Step 6.

- [ ] **Step 7: Repoint the blog hero (`blog/src/main/webapp/app/modules/home/home.scss`)**

`jhipster_family_member_2.svg` (blog is member 2) → `my-app-store-hero.svg`. Keep all other declarations.

- [ ] **Step 8: Delete blog's 21 JHipster images**

```powershell
Get-ChildItem blog/src/main/webapp/content/images -Filter "*jhipster*" | Remove-Item -Force
```
Verify: `rg -n -i "jhipster_family|logo-jhipster" blog/src/main/webapp blog/src/main/resources` → no output.

- [ ] **Step 9: Run the blog frontend test suite**

Run from repo root: `npm run webapp:test --workspace blog`
Expected: all suites pass, exit code 0.

- [ ] **Step 10: Commit**

```
git add -A blog/src/main/webapp blog/src/main/resources/banner.txt
git commit -m "feat(blog): rebrand user-facing UI to My App Store"
```

---

### Task 4: Rebrand the store webapp

**Files (all under `store/`):** identical set to Task 2.

**Interfaces:**
- Consumes: Task 1 assets; Task 2 wording.
- Produces: store parity; after this task every `content/images/` directory holds exactly one brand asset set and zero `*jhipster*` files.

- [ ] **Step 1: Apply the `home.json` rewrite to `store/src/main/webapp/i18n/en/home.json`**

Byte-identical target JSON to Task 2. Verify: parses via `node -e`; `rg -n -i jhipster .../home.json` → no output.

- [ ] **Step 2: Apply the `home.tsx` rewrite to `store/src/main/webapp/app/modules/home/home.tsx`**

Same five edits as Task 2 Step 2. Verify: `rg -n -i "jhipster|Java Hipster" store/src/main/webapp/app/modules/home/home.tsx` → no output.

- [ ] **Step 3: Replace `store/src/main/resources/banner.txt`**

Read the full file, apply the same two replacement lines, preserve every `${...}` placeholder and ANSI line. Verify: no `jhipster` match; `${spring-boot.version}` present.

- [ ] **Step 4: Rebrand `store/src/main/webapp/index.html`**

Same five edits as Task 2 Step 4. Verify: `rg -n -i jhipster store/src/main/webapp/index.html` → exactly one line (the needle comment).

- [ ] **Step 5: Repoint `store/src/main/webapp/manifest.webapp`**

`icons[].src` → `content/images/my-app-store-icon-{192,256,384,512}.png` (previously `jhipster_family_member_1_head-*`). Verify: no `jhipster` match; all four targets exist on disk.

- [ ] **Step 6: Repoint `store/src/main/webapp/content/css/loading.css` and `store/src/main/webapp/app/shared/layout/header/header-components.tsx`**

Same two single-specifier changes as Task 2 Step 6.

- [ ] **Step 7: Repoint the store hero (`store/src/main/webapp/app/modules/home/home.scss`)**

`jhipster_family_member_1.svg` (store is member 1) → `my-app-store-hero.svg`.

- [ ] **Step 8: Delete store's 21 JHipster images**

```powershell
Get-ChildItem store/src/main/webapp/content/images -Filter "*jhipster*" | Remove-Item -Force
```
Verify: `rg -n -i "jhipster_family|logo-jhipster" store/src/main/webapp store/src/main/resources` → no output.

- [ ] **Step 9: Run the store frontend test suite**

Run from repo root: `npm run webapp:test --workspace store`
Expected: all suites pass, exit code 0.

- [ ] **Step 10: Commit**

```
git add -A store/src/main/webapp store/src/main/resources/banner.txt
git commit -m "feat(store): rebrand user-facing UI to My App Store"
```

---

### Task 5: Keycloak realm display names

**Files:**
- Modify: `docker-compose/realm-config/jhipster-realm.json` (filename unchanged — only its contents)

**Interfaces:**
- Consumes: nothing.
- Produces: Keycloak login page and admin console read "My App Store"; the realm id `jhipster` is untouched so docker-compose/Keycloak wiring keeps working.

- [ ] **Step 1: Change the realm display names**

Read the file. Edit exactly:
- `"displayName": "JHipster"` → `"displayName": "My App Store"`.
- `"displayNameHtml": "<div class=\"kc-logo-text\"><span>JHipster</span></div>"` → keep the `<div class="kc-logo-text">` structure and change only the span text to `My App Store`.

Do **not** change line 2's `"id": "jhipster"` or `"realm": "jhipster"`.

- [ ] **Step 2: Neutralise the role and claim descriptions**

- line ~53 `"Jhipster administrator role"` → `"Administrator role"`
- line ~71 `"Jhipster user role"` → `"User role"`
- line ~989 `"Jhipster specific claims"` → `"Application-specific claims"`

Leave every role *name*, `clientId`, `redirectUris`, `secret` and user record unchanged.

- [ ] **Step 3: Verify the JSON is still valid and the realm id is intact**

```powershell
$j = Get-Content docker-compose/realm-config/jhipster-realm.json -Raw | ConvertFrom-Json
"id=$($j.id) display=$($j.displayName) html=$($j.displayNameHtml) roles=$($j.roles.realm.Count)"
```
Expected: `id=jhipster`, `display=My App Store`, `html` contains `My App Store` and `kc-logo-text`, role count unchanged from before the edit. Any parse error means the file is broken — fix before committing.

- [ ] **Step 4: Confirm no user-facing JHipster wording remains**

`rg -n -i jhipster docker-compose/realm-config/jhipster-realm.json`
Expected: only structural identifiers — `"id": "jhipster"`, `"realm": "jhipster"`, plus resource/client paths that legitimately contain `jhipster`. **No** `JHipster`, `Jhipster administrator`, `Jhipster user`, `Jhipster specific claims`.

- [ ] **Step 5: Commit**

```
git add docker-compose/realm-config/jhipster-realm.json
git commit -m "feat(keycloak): display My App Store on the login page and neutralise role descriptions"
```

---

### Task 6: Final verification sweep

**Files:** none created; this task only verifies. Commit nothing if clean.

**Interfaces:**
- Consumes: the finished state of Tasks 1–5.
- Produces: the evidence the orchestrator needs to declare the feature done.

- [ ] **Step 1: Run all three frontend suites**

```
npm run webapp:test --workspace gateway
npm run webapp:test --workspace blog
npm run webapp:test --workspace store
```
Expected: three green runs, exit code 0 each. Record the pass/fail counts.

- [ ] **Step 2: User-facing grep sweep — must come back empty**

```powershell
rg -n -i "jhipster|java hipster" `
  gateway/src/main/webapp/index.html gateway/src/main/webapp/manifest.webapp `
  gateway/src/main/webapp/i18n/en/home.json gateway/src/main/webapp/app/modules/home `
  gateway/src/main/webapp/app/shared/layout/header gateway/src/main/webapp/content/css `
  gateway/src/main/resources/banner.txt `
  blog/src/main/webapp/index.html blog/src/main/webapp/manifest.webapp `
  blog/src/main/webapp/i18n/en/home.json blog/src/main/webapp/app/modules/home `
  blog/src/main/webapp/app/shared/layout/header blog/src/main/webapp/content/css `
  blog/src/main/resources/banner.txt `
  store/src/main/webapp/index.html store/src/main/webapp/manifest.webapp `
  store/src/main/webapp/i18n/en/home.json store/src/main/webapp/app/modules/home `
  store/src/main/webapp/app/shared/layout/header store/src/main/webapp/content/css `
  store/src/main/resources/banner.txt
```
Expected: **exactly three hits**, one per app — the preserved `jhipster-needle-*` HTML comment in `index.html`. Anything else is a leak; return to the owning task.

- [ ] **Step 3: Image sweep — must come back empty**

```powershell
rg --files gateway/src/main/webapp/content/images blog/src/main/webapp/content/images store/src/main/webapp/content/images | Select-String -Pattern "jhipster"
```
Expected: no output (all 63 old files gone, 18 new files present).

- [ ] **Step 4: Scope-drift check**

`git diff --stat main...HEAD`
Expected: files touched are confined to `gateway/src/main/**`, `blog/src/main/**`, `store/src/main/**`, `docker-compose/realm-config/jhipster-realm.json`, `docs/superpowers/**`. Any `.yo-rc.json`, `package.json`, `reactive-mf.jdl`, `application*.yml`, `global.json` or `README*.md` entry means a constraint was violated — revert that file.

- [ ] **Step 5: Optional formatting gate (touched files only)**

`npm run prettier:check` from repo root. If it flags only pre-existing files you did not touch, ignore; if it flags a file you edited, run `npm run prettier:format` and amend/commit that formatting fix into the owning task's commit (interactive rebase or a follow-up `style:` commit on the branch).

- [ ] **Step 6: Close out**

No commit when Steps 1–4 are clean. Report: three suite results, the three expected needle-comment hits, zero image hits, and the `git diff --stat` file list.

---

## Definition of Done

- All six `my-app-store-*` assets present, correctly sized, in all three apps; all 63 `*jhipster*` images deleted.
- `home.json` / `home.tsx` / `index.html` / `manifest.webapp` / `loading.css` / `header-components.tsx` / `home.scss` / `banner.txt` rebranded identically across gateway, blog and store.
- Keycloak realm shows "My App Store"; realm id still `jhipster`.
- Three green `npm run webapp:test --workspace <app>` runs.
- Grep sweeps in Task 6 return only the three intentional needle comments and nothing else.
- `global.json` needles, `jhipster.*` config, `react-jhipster` imports, `app/shared/jhipster/` paths and all READMEs untouched.
