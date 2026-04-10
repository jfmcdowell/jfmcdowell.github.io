# Astro Blog Migration — Design Spec

**Document Type:** Product/Technical Design  
**Last Updated:** April 9, 2026  
**Status:** Approved  
**Prepared By:** Justin McDowell  
**Feature/Initiative:** Port jfmcdowell.github.io from Jekyll to Astro

---

## 0. Strategic Alignment

**A personal site rebuild targeting the intersection of Bold to Win's structure and Dr. Drang's soul.** The current Jekyll/Hyde blog has been dormant since 2014 (posts) and 2017 (last commit). This is not a theme swap. It is a fresh start on a modern stack — a practitioner's workshop with the door open.

**Current state:** A Jekyll site with 6 blog posts about Enterprise Architecture, the Hyde theme, no build tooling, no type safety, and a stale brand ("99 Summers"). Hosted on GitHub Pages via Jekyll's built-in support.

**Target state:** An Astro static site with four content types (blog, notes, talks, links), a curated landing page, modern tooling (Biome, TypeScript, Pagefind), and a brand that reflects who the author is now. Still hosted on GitHub Pages, deployed via GitHub Actions.

**The blend:**
- Bold to Win's *architecture* — organized, multi-content-type, curated landing, intentional about how it presents
- Dr. Drang's *values* — practitioner-first, code-forward, writing is the product, minimal design, no hustle, quiet authority

---

## 1. Conjecture

Personal blogs built on decade-old Jekyll themes carry dead weight. The framework is in maintenance mode. The theme was never yours — it was a fork of Hyde. The content model is a flat list of posts with no room for the different kinds of things you actually produce: talks, quick notes, curated links.

Modern static site generators like Astro solve this with content collections — typed, schema-validated, multi-collection content that lives in the repo as Markdown. You get the authoring simplicity of Jekyll with the type safety and component model of a modern frontend framework.

The blog doesn't need a platform. It doesn't need a CMS. It needs a clean Astro project with content collections, a handful of layouts and components, and a CI pipeline that deploys on push.

---

## 2. Who Is This For?

| Audience | What They Get |
|---|---|
| The author (Justin) | A site that's fast to write for, easy to evolve, and reflects current interests — not a 2013 EA blog frozen in amber |
| Readers who find a post via search | A fast, readable page with no pop-ups, no newsletter gate, no cookie banners. The content, presented well. |
| Peers and collaborators | A professional presence that shows what you think about and work on — blog posts, talks, notes, curated links |

---

## 3. Content Architecture

Four content collections, all defined in `src/content.config.ts` (Astro v5 convention) with Zod schemas.

### 3.1 Blog (`src/content/blog/`)

Long-form posts. Shows the work — code, architecture, ideas.

```yaml
title: string (required)
description: string (required)
pubDate: date (required)
updatedDate: date (optional)
tags: string[] (optional)
draft: boolean (default false)
```

### 3.2 Notes (`src/content/notes/`)

Short-form TIL, scratch pad. Lower bar to publish than blog.

```yaml
title: string (required)
pubDate: date (required)
tags: string[] (optional)
draft: boolean (default false)
```

### 3.3 Talks (`src/content/talks/`)

Conference talks, meetups, podcasts. Links out to slides/recordings.

```yaml
title: string (required)
event: string (required)
pubDate: date (required)
slides: url (optional)
recording: url (optional)
description: string (optional)
tags: string[] (optional)
draft: boolean (default false)
```

### 3.4 Links (`src/content/links/`)

Curated bookmarks with commentary. Pinboard replacement.

```yaml
title: string (required)
url: url (required)
pubDate: date (required)
commentary: string (optional)
tags: string[] (optional)
draft: boolean (default false)
```

### 3.5 Shared Conventions

All four collections normalize on:
- `pubDate` (not `date`) for the primary date field
- `tags: string[]` (optional) — lowercase, kebab-case, used for unified tag index
- `draft: boolean` (default false) — drafts excluded from production builds

Tags are validated at the schema level with a Zod refinement: `z.array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)).optional()`. This ensures lowercase kebab-case at build time — a tag like `AWS` or `foo bar` is a build error, not a silent routing bug.

This normalization means a single helper can sort/filter across collections for the landing page, tag pages, and RSS feed without per-collection branching.

---

## 4. Site Structure & Routing

### 4.1 Pages

```
/                         → Curated landing (hero + latest blog, recent notes, recent links, talks)
/blog/                    → Blog index (paginated)
/blog/[slug]/             → Individual post
/notes/                   → Notes index (compact list)
/notes/[slug]/            → Individual note
/talks/                   → Talks index
/talks/[slug]/            → Individual talk detail
/links/                   → Links index (compact, Pinboard-style)
/tags/                    → Tag index (all tags across all content types)
/tags/[tag]/              → All content matching a tag, grouped by type
/about/                   → Static about page
/rss.xml                  → RSS feed (blog + notes combined, sorted by pubDate)
```

### 4.2 Landing Page

Not a reverse-chronological feed. A composed page:

1. Hero — name, tagline, one sentence
2. Latest blog post (featured)
3. Recent notes (3-5, compact)
4. Recent links (3-5, compact)
5. Talks (if any exist)

### 4.3 Old Content

The 6 Jekyll posts (2013-2014) migrate into `src/content/blog/` with original dates preserved. No URL redirects — the old URLs are dead and unlinked. Clean break.

---

## 5. Layouts & Components

### 5.1 Layouts

```
src/layouts/
├── Base.astro            → HTML shell, <head>, header, footer, meta/OG
└── Post.astro            → Base + article wrapper, date, tags
```

- `Base` handles the HTML document, global styles, theme toggle, meta tags, OG tags
- `Post` wraps blog posts, notes, and talk detail pages

### 5.2 Components

```
src/components/
├── Header.astro          → Site name + nav (Blog, Notes, Talks, Links, About)
├── Footer.astro          → Copyright, RSS link, social links
├── Card.astro            → Universal content preview (props control what renders)
├── TagList.astro         → Inline tag pills
└── ThemeToggle.astro     → Dark/light mode switch
```

Pure `.astro` files. No framework components (React, Svelte). Minimal client JS: theme toggle and Pagefind search widget (loaded async, ~5KB gzipped).

---

## 6. Styling

### 6.1 Approach

CSS custom properties. No framework. No Tailwind.

```
src/styles/
├── variables.css         → Color, spacing, typography tokens (light + dark)
├── global.css            → Reset, base typography, prose styles
└── utilities.css         → Layout helpers (sr-only, container, etc.)
```

Component-specific styles live scoped in `.astro` `<style>` tags.

### 6.2 Design Tokens

- **Typography:** System font stack (`system-ui, -apple-system, sans-serif`), monospace for code
- **Measure:** `65ch` max-width for prose
- **Spacing:** Scale: `0.5rem`, `1rem`, `2rem`, `4rem`
- **Colors:** Light and dark themes via `[data-theme]` attribute. Accent color TBD with brand.
- **Principle:** Neutral palette, writing leads. No decoration for decoration's sake.

---

## 7. Tooling

### 7.1 Dev Stack

| Tool | Purpose |
|------|---------|
| Astro | Static site framework |
| TypeScript | Type safety (strict mode, `astro/tsconfigs/strictest`) |
| Biome | Lint + format (JS/TS/CSS/JSON) |
| markdownlint-cli2 | Content quality (dev dependency, runs in `pnpm check` and CI) |
| Pagefind | Client-side search (dev dependency, runs post-build) |
| pnpm | Package manager |

### 7.2 npm Scripts

```json
{
  "dev": "astro dev",
  "build": "astro build && pnpm exec pagefind --site dist",
  "preview": "astro preview",
  "check": "biome check . && astro check && pnpm exec markdownlint-cli2 'src/content/**/*.{md,mdx}'",
  "format": "biome format --write ."
}
```

### 7.3 Config Files

```
astro.config.ts           → Site config: output: static, site: https://jfmcdowell.github.io
tsconfig.json             → extends astro/tsconfigs/strictest, path alias @/* → src/*
biome.json                → Lint rules, format settings (borrowed from biome repo)
.editorconfig             → Consistent editor settings
.markdownlint.json        → Markdown lint rules
```

**Astro config requirements for GitHub Pages:**
- `site` must be set before RSS, OG images, or canonical URLs work correctly. Set to `https://jfmcdowell.github.io` at launch. If a custom domain is added later, update `site` in `astro.config.ts` and add a `CNAME` file to `public/` — no other code changes needed.
- `base` is `/` for custom domains and repo-root GitHub Pages (this repo is `jfmcdowell.github.io`, so no base path needed).
- `output: 'static'` — no SSR.

---

## 8. CI/CD

Single GitHub Actions workflow. Deploys on push to `main`.

**Pipeline:**
1. `pnpm install`
2. `pnpm check` (Biome + astro check)
3. `pnpm build` (Astro build + Pagefind index)
4. Deploy to GitHub Pages

**CI hygiene (borrowed from Biome):**
- Pin GitHub Action versions by SHA
- Concurrency groups with `cancel-in-progress: true`
- Minimal `GITHUB_TOKEN` permissions
- Path filtering where useful

---

## 9. What This Is Not

- **Not a docs site.** No Starlight, no sidebar navigation, no versioned content.
- **Not a platform.** No CMS, no database, no server-side rendering, no user accounts.
- **Not a newsletter product.** No email capture, no Substack integration. If added later, it's additive.
- **Not a portfolio with case studies.** The blog and talks *are* the portfolio. No separate showcase section.
- **Not a design exercise.** Minimal, readable, fast. The writing is the point.

---

## 10. Performance & Accessibility

- Target Lighthouse 95+ across all categories
- Static output only (`output: 'static'`)
- System fonts — no FOUT, no external font requests
- Images via Astro's `<Image />` pipeline (WebP/AVIF)
- Semantic HTML: `<article>`, `<nav>`, `<main>`, `<aside>`
- Skip-to-content link on every page
- WCAG 2.1 AA compliance
- Minimal client JS: theme toggle + Pagefind search (async loaded)

---

## 11. Open Decisions

| Decision | Status | Notes |
|----------|--------|-------|
| Brand name | TBD | Replacing "99 Summers" |
| Accent color | TBD | Depends on brand — design in browser |
| Custom domain | Deferred | Launch on `https://jfmcdowell.github.io`. Custom domain is a post-launch CNAME change — no code changes needed, just DNS + `site` value update in `astro.config.ts`. |
| Search | Included | Pagefind as dev dependency, async-loaded widget |

---

## 12. Next Steps

1. Write implementation plan (invoke writing-plans skill)
2. Scaffold Astro project with content collections and tooling
3. Build Base layout + Header/Footer
4. Build landing page
5. Migrate old posts, add sample content for notes/links/talks
6. Wire up GitHub Actions deployment
7. Pick brand name and accent color (visual session in browser)
8. Cut over from Jekyll
