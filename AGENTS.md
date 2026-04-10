# Agent Guidelines

Rules for all agents working in this repository. Follow these equally regardless of provider.

---

## 1. Tool Preferences

### Search and Navigation

Use modern CLI tools over legacy equivalents:

| Use | Instead of | Why |
|-----|-----------|-----|
| `rg` (ripgrep) | `grep` | Faster, respects `.gitignore`, better defaults |
| `fd` (fd-find) | `find` | Simpler syntax, faster, respects `.gitignore` |

When dedicated agent tools exist (Grep, Glob, Read), prefer those for simple lookups. Fall back to `rg` and `fd` via shell when their advanced features are needed (multiline, complex filtering, etc.).

### LSP (Language Server Protocol)

Use LSP tools wherever possible for semantic accuracy:

- **Go to definition** — resolve symbols to declarations, don't guess from text search
- **Find references** — get all usages of a symbol across the codebase
- **Hover/type info** — confirm types and signatures before making changes
- **Diagnostics** — catch errors and warnings in real-time

LSP results are authoritative. They understand code semantically, not just textually. When LSP is available for the current language, use it as the primary navigation and verification tool.

### MCP Tools

Use available MCP tools when they fit the task. Check what's available in the current session before falling back to shell commands.

---

## 2. Project Stack

This is an Astro static site deployed to GitHub Pages.

| Layer | Tool |
|-------|------|
| Framework | [Astro](https://astro.build/) |
| Language | TypeScript (strict) |
| Styling | CSS custom properties (no Tailwind) |
| Linting/Formatting | [Biome](https://biomejs.dev/) |
| Markdown linting | markdownlint |
| Package manager | pnpm |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |

---

## 3. Code Quality

### Biome

Biome handles both linting and formatting for JS/TS/CSS/JSON. One tool, no Prettier/ESLint split.

- Run `pnpm check` before pushing — it runs Biome's lint + format check
- Fix auto-fixable issues with `pnpm check --write`
- All warnings are errors in CI

### TypeScript

- Strict mode enabled (`"strict": true`)
- No `any` unless explicitly justified with a comment explaining why
- Prefer Astro's built-in type utilities for props and content collections

### Markdown

- All content is authored in Markdown (`.md`) or MDX (`.mdx`)
- Front matter is validated by Astro content collections — schema violations are build errors
- markdownlint-cli2 runs as part of `pnpm check` — violations are CI-blocking

---

## 4. Project Structure

```
src/
├── components/      # Reusable Astro components
├── content/         # Content collections
│   ├── blog/        # Long-form posts (.md)
│   ├── notes/       # Short-form TIL (.md)
│   ├── talks/       # Conference talks, meetups (.md)
│   └── links/       # Curated bookmarks (.md)
├── content.config.ts # Collection schemas (Astro v5 convention — lives in src/)
├── layouts/         # Page layouts
├── pages/           # File-based routing
├── styles/          # Global styles
└── utils/           # Shared utilities
public/              # Static assets (images, fonts, favicon)
```

**Conventions:**
- Components use PascalCase filenames: `PostCard.astro`
- Content files use kebab-case: `my-blog-post.md`
- Layouts are named for their purpose: `BaseLayout.astro`, `BlogPost.astro`
- Pages mirror URL structure: `src/pages/blog/[...slug].astro`

---

## 5. Content Authoring

### Blog Post Front Matter

Every blog post requires this front matter:

```yaml
---
title: "Post Title"
description: "A short description for SEO and social cards"
pubDate: 2026-04-09
tags: ["tag1", "tag2"]
draft: false
---
```

- `draft: true` posts are excluded from production builds
- `pubDate` uses ISO 8601 date format
- `tags` is an array of lowercase strings

### Images

- Store post-specific images in `src/content/blog/_images/` or colocated with posts
- Use Astro's `<Image />` component for optimization — never raw `<img>` tags for local images
- All images must have meaningful `alt` text

---

## 6. Git Conventions

### Commit Messages

Use semantic prefixes:

| Prefix | Use |
|--------|-----|
| `feat:` | New feature or content |
| `fix:` | Bug fix |
| `content:` | New or updated blog post |
| `refactor:` | Code restructuring, no behavior change |
| `docs:` | Documentation only |
| `chore:` | Housekeeping (deps, config, CI) |
| `style:` | Formatting, whitespace (no logic change) |

### Branching

- `main` is the production branch — deploys automatically via GitHub Actions
- Feature work uses `feat/<slug>` branches
- Content uses `content/<slug>` branches

---

## 7. CI/CD

GitHub Actions deploys on push to `main`. The pipeline:

1. Install dependencies (`pnpm install`)
2. Lint and format check (`pnpm check`)
3. Type check (`astro check`)
4. Build (`astro build`)
5. Deploy to GitHub Pages

### Path Filtering

CI jobs should use path filters to avoid unnecessary runs:

- Content changes → skip type check, run build only
- Config changes → full pipeline
- Docs-only changes → skip build entirely

### CI Hygiene (borrowed from Biome)

- Pin GitHub Action versions by SHA, not tag
- Use concurrency groups with `cancel-in-progress: true`
- Set `GITHUB_TOKEN` permissions to minimum required

---

## 8. Dependencies

- Keep dependencies minimal — Astro's built-in features cover most needs
- Audit before adding any new package: does Astro already handle this?
- Use `pnpm` exclusively — no `npm` or `yarn` lockfiles
- Run `pnpm update --interactive` periodically to stay current

---

## 9. Performance

- Target Lighthouse score of 95+ across all categories
- Use Astro's static output (`output: 'static'`) — no SSR unless explicitly required
- Inline critical CSS, defer non-critical styles
- Prefer system font stacks or self-hosted fonts over Google Fonts CDN
- Images use modern formats (WebP/AVIF) via Astro's image pipeline

---

## 10. Accessibility

- All pages must pass WCAG 2.1 AA
- Semantic HTML: use `<article>`, `<nav>`, `<main>`, `<aside>` appropriately
- Skip-to-content link on every page
- Color contrast ratios enforced in component design
- Interactive elements must be keyboard navigable
