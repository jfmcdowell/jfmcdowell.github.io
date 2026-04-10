# Astro Blog Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port jfmcdowell.github.io from Jekyll to Astro with four content types, curated landing page, and GitHub Pages deployment.

**Architecture:** Bare Astro v5 with Content Layer API, CSS custom properties for styling, Biome for code quality, Pagefind for search. No UI frameworks. Minimal client JS. Static output deployed to GitHub Pages via GitHub Actions.

**Tech Stack:** Astro 5, TypeScript (strictest), Biome, markdownlint-cli2, Pagefind, pnpm, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-04-09-astro-blog-migration-design.md`

---

## File Map

```
# New files (created by this plan)
astro.config.ts
tsconfig.json
biome.json
.editorconfig
.markdownlint.json
package.json
.gitignore                          # Replace existing Jekyll .gitignore
src/content.config.ts               # Content collection schemas
src/styles/variables.css
src/styles/global.css
src/styles/utilities.css
src/layouts/Base.astro
src/layouts/Post.astro
src/components/Header.astro
src/components/Footer.astro
src/components/ThemeToggle.astro
src/components/Card.astro
src/components/TagList.astro
src/pages/index.astro
src/pages/blog/index.astro
src/pages/blog/[slug].astro
src/pages/notes/index.astro
src/pages/notes/[slug].astro
src/pages/talks/index.astro
src/pages/talks/[slug].astro
src/pages/links/index.astro
src/pages/tags/index.astro
src/pages/tags/[tag].astro
src/pages/about.astro
src/pages/404.astro
src/pages/rss.xml.ts
src/utils/content.ts                # Shared helpers for querying/sorting content
src/content/blog/*.md               # Migrated Jekyll posts + placeholder
src/content/notes/*.md              # Sample notes
src/content/talks/*.md              # Sample talk
src/content/links/*.md              # Sample links
public/favicon.ico                  # Carry over from existing
.github/workflows/deploy.yml

# Deleted files (Jekyll artifacts removed in final task)
_config.yml
_includes/
_layouts/
_posts/
public/css/                         # Jekyll CSS (replaced by src/styles/)
index.html
about.md
atom.xml
404.html
CNAME
```

---

### Task 1: Scaffold Astro Project

**Files:**
- Create: `package.json`
- Create: `astro.config.ts`
- Create: `tsconfig.json`
- Create: `biome.json`
- Create: `.editorconfig`
- Create: `.markdownlint.json`
- Replace: `.gitignore`

- [ ] **Step 1: Initialize the Astro project with pnpm**

Run from repo root:

```bash
pnpm create astro@latest . --template minimal --install --no-git --typescript strictest
```

Use `--no-git` because the repo already has git. Use `.` to scaffold into the current directory. If the CLI prompts about existing files, proceed — we'll clean up Jekyll files in the final task.

- [ ] **Step 2: Install dev dependencies**

```bash
pnpm add -D @biomejs/biome markdownlint-cli2 pagefind @astrojs/rss
```

- [ ] **Step 3: Verify Astro scaffolded correctly**

```bash
ls src/pages/index.astro astro.config.mjs tsconfig.json
```

Expected: all three files exist. Astro may scaffold `astro.config.mjs` — we'll replace it next.

- [ ] **Step 4: Replace astro.config with TypeScript version**

Delete the scaffolded config and create `astro.config.ts`:

```typescript
// astro.config.ts
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jfmcdowell.github.io",
  output: "static",
  compressHTML: true,
  build: {
    format: "directory",
  },
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
```

```bash
rm -f astro.config.mjs
```

- [ ] **Step 5: Update tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strictest",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 6: Create biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": {
    "clientKind": "git",
    "enabled": true,
    "useIgnoreFile": true
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "style": {
        "useConst": "error",
        "noParameterAssign": "error"
      },
      "correctness": {
        "noUndeclaredDependencies": "error"
      },
      "suspicious": {
        "noVar": "error"
      }
    }
  },
  "files": {
    "ignore": ["dist/**", "node_modules/**", ".astro/**"]
  }
}
```

- [ ] **Step 7: Create .editorconfig**

```ini
root = true

[*]
end_of_line = lf
trim_trailing_whitespace = true
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 8: Create .markdownlint.json**

```json
{
  "default": true,
  "MD013": false,
  "MD033": false,
  "MD041": false
}
```

`MD013` (line length) is disabled — prose wraps naturally. `MD033` (inline HTML) is disabled — Astro content may include HTML. `MD041` (first line h1) is disabled — front matter comes first.

- [ ] **Step 9: Update package.json scripts**

Add these scripts to the `package.json` that `create astro` generated:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pnpm exec pagefind --site dist",
    "preview": "astro preview",
    "check": "biome check . && astro check && pnpm exec markdownlint-cli2 'src/content/**/*.{md,mdx}'",
    "format": "biome format --write ."
  }
}
```

- [ ] **Step 10: Replace .gitignore**

```
# Astro
dist/
.astro/

# Dependencies
node_modules/

# Environment
.env
.env.*

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo
```

- [ ] **Step 11: Verify the scaffold builds**

```bash
pnpm run build
```

Expected: Build succeeds. Pagefind may warn about no content — that's fine for now.

- [ ] **Step 12: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.ts tsconfig.json biome.json .editorconfig .markdownlint.json .gitignore src/
git commit -m "chore: scaffold Astro project with tooling configs"
```

---

### Task 2: Content Collection Schemas

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/blog/.gitkeep`
- Create: `src/content/notes/.gitkeep`
- Create: `src/content/talks/.gitkeep`
- Create: `src/content/links/.gitkeep`

- [ ] **Step 1: Create content.config.ts with all four collection schemas**

```typescript
// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const tagSchema = z
  .array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Tags must be lowercase kebab-case"))
  .optional();

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: tagSchema,
    draft: z.boolean().default(false),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: tagSchema,
    draft: z.boolean().default(false),
  }),
});

const talks = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/talks" }),
  schema: z.object({
    title: z.string(),
    event: z.string(),
    pubDate: z.coerce.date(),
    slides: z.string().url().optional(),
    recording: z.string().url().optional(),
    description: z.string().optional(),
    tags: tagSchema,
    draft: z.boolean().default(false),
  }),
});

const links = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/links" }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    pubDate: z.coerce.date(),
    commentary: z.string().optional(),
    tags: tagSchema,
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, notes, talks, links };
```

- [ ] **Step 2: Create .gitkeep files for empty content directories**

```bash
mkdir -p src/content/blog src/content/notes src/content/talks src/content/links
touch src/content/blog/.gitkeep src/content/notes/.gitkeep src/content/talks/.gitkeep src/content/links/.gitkeep
```

- [ ] **Step 3: Verify types generate**

```bash
pnpm astro sync
```

Expected: Completes without errors. Generates `.astro/` types directory.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: add content collection schemas for blog, notes, talks, links"
```

---

### Task 3: Content Utility Helpers

**Files:**
- Create: `src/utils/content.ts`

- [ ] **Step 1: Create shared content query helpers**

```typescript
// src/utils/content.ts
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type AnyEntry =
  | CollectionEntry<"blog">
  | CollectionEntry<"notes">
  | CollectionEntry<"talks">
  | CollectionEntry<"links">;

function getPubDate(entry: AnyEntry): Date {
  return entry.data.pubDate;
}

function isPublished(entry: { data: { draft?: boolean } }): boolean {
  return !entry.data.draft;
}

export async function getPublishedBlogPosts() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) => getPubDate(b).valueOf() - getPubDate(a).valueOf());
}

export async function getPublishedNotes() {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  return notes.sort((a, b) => getPubDate(b).valueOf() - getPubDate(a).valueOf());
}

export async function getPublishedTalks() {
  const talks = await getCollection("talks", ({ data }) => !data.draft);
  return talks.sort((a, b) => getPubDate(b).valueOf() - getPubDate(a).valueOf());
}

export async function getPublishedLinks() {
  const links = await getCollection("links", ({ data }) => !data.draft);
  return links.sort((a, b) => getPubDate(b).valueOf() - getPubDate(a).valueOf());
}

export async function getAllTags(): Promise<Map<string, number>> {
  const [blog, notes, talks, links] = await Promise.all([
    getCollection("blog", isPublished),
    getCollection("notes", isPublished),
    getCollection("talks", isPublished),
    getCollection("links", isPublished),
  ]);

  const tagCounts = new Map<string, number>();
  const allEntries: AnyEntry[] = [...blog, ...notes, ...talks, ...links];

  for (const entry of allEntries) {
    for (const tag of entry.data.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return tagCounts;
}

export async function getEntriesByTag(tag: string): Promise<{
  blog: CollectionEntry<"blog">[];
  notes: CollectionEntry<"notes">[];
  talks: CollectionEntry<"talks">[];
  links: CollectionEntry<"links">[];
}> {
  const hasTag = (entry: AnyEntry) =>
    isPublished(entry) && (entry.data.tags ?? []).includes(tag);

  const [blog, notes, talks, links] = await Promise.all([
    getCollection("blog", hasTag),
    getCollection("notes", hasTag),
    getCollection("talks", hasTag),
    getCollection("links", hasTag),
  ]);

  const sortByDate = <T extends AnyEntry>(entries: T[]) =>
    entries.sort((a, b) => getPubDate(b).valueOf() - getPubDate(a).valueOf());

  return {
    blog: sortByDate(blog),
    notes: sortByDate(notes),
    talks: sortByDate(talks),
    links: sortByDate(links),
  };
}
```

- [ ] **Step 2: Verify type check passes**

```bash
pnpm astro check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/content.ts
git commit -m "feat: add shared content query and tag helpers"
```

---

### Task 4: CSS Foundation

**Files:**
- Create: `src/styles/variables.css`
- Create: `src/styles/global.css`
- Create: `src/styles/utilities.css`

- [ ] **Step 1: Create variables.css**

```css
/* src/styles/variables.css */
:root {
  /* Typography */
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --line-height-body: 1.6;
  --line-height-heading: 1.25;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-s: 0.5rem;
  --space-m: 1rem;
  --space-l: 2rem;
  --space-xl: 4rem;

  /* Layout */
  --measure: 65ch;
  --page-gutter: var(--space-l);
}

/* Light theme (default) */
:root,
:root[data-theme="light"] {
  --color-bg: #fafafa;
  --color-text: #1a1a1a;
  --color-muted: #6b6b6b;
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  --color-border: #e5e5e5;
  --color-surface: #ffffff;
  --color-code-bg: #f3f4f6;
}

/* Dark theme */
:root[data-theme="dark"] {
  --color-bg: #141414;
  --color-text: #e5e5e5;
  --color-muted: #999999;
  --color-accent: #60a5fa;
  --color-accent-hover: #93bbfd;
  --color-border: #2a2a2a;
  --color-surface: #1c1c1c;
  --color-code-bg: #1e1e1e;
}
```

- [ ] **Step 2: Create global.css**

```css
/* src/styles/global.css */
@import "./variables.css";
@import "./utilities.css";

/* Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height-body);
  color: var(--color-text);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

/* Typography */
h1, h2, h3, h4 {
  line-height: var(--line-height-heading);
  font-weight: 700;
}

h1 { font-size: var(--font-size-2xl); }
h2 { font-size: var(--font-size-xl); }
h3 { font-size: var(--font-size-lg); }

a {
  color: var(--color-accent);
  text-decoration: none;
}

a:hover {
  color: var(--color-accent-hover);
  text-decoration: underline;
}

/* Prose — for rendered Markdown */
.prose {
  max-width: var(--measure);
}

.prose > * + * {
  margin-top: var(--space-m);
}

.prose h2,
.prose h3,
.prose h4 {
  margin-top: var(--space-l);
}

.prose ul,
.prose ol {
  padding-left: var(--space-l);
}

.prose blockquote {
  border-left: 3px solid var(--color-border);
  padding-left: var(--space-m);
  color: var(--color-muted);
  font-style: italic;
}

.prose pre {
  background-color: var(--color-code-bg);
  padding: var(--space-m);
  border-radius: 4px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}

.prose code {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  background-color: var(--color-code-bg);
  padding: 0.15em 0.3em;
  border-radius: 3px;
}

.prose pre code {
  background: none;
  padding: 0;
}

.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.prose hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--space-l) 0;
}
```

- [ ] **Step 3: Create utilities.css**

```css
/* src/styles/utilities.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.container {
  max-width: calc(var(--measure) + var(--page-gutter) * 2);
  margin-inline: auto;
  padding-inline: var(--page-gutter);
}

.muted {
  color: var(--color-muted);
}

.text-sm {
  font-size: var(--font-size-sm);
}
```

- [ ] **Step 4: Verify CSS files are valid**

```bash
pnpm exec biome check src/styles/
```

Expected: No errors (Biome lints CSS).

- [ ] **Step 5: Commit**

```bash
git add src/styles/
git commit -m "feat: add CSS foundation with variables, global styles, and utilities"
```

---

### Task 5: Base Layout

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/ThemeToggle.astro`

- [ ] **Step 1: Create ThemeToggle.astro**

```astro
---
// src/components/ThemeToggle.astro
---

<button
  id="theme-toggle"
  type="button"
  aria-label="Toggle dark mode"
>
  <span class="icon-light" aria-hidden="true">&#9788;</span>
  <span class="icon-dark" aria-hidden="true">&#9790;</span>
</button>

<style>
  button {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    font-size: 1.2rem;
    line-height: 1;
  }

  button:hover {
    background-color: var(--color-surface);
  }

  :root[data-theme="light"] .icon-light,
  :root[data-theme="dark"] .icon-dark {
    display: none;
  }

  :root[data-theme="light"] .icon-dark,
  :root[data-theme="dark"] .icon-light {
    display: inline;
  }
</style>

<script is:inline>
  (function () {
    const theme = localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);

    document.addEventListener("DOMContentLoaded", () => {
      const toggle = document.getElementById("theme-toggle");
      if (!toggle) return;
      toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });
    });
  })();
</script>
```

- [ ] **Step 2: Create Header.astro**

```astro
---
// src/components/Header.astro
import ThemeToggle from "./ThemeToggle.astro";

const navItems = [
  { href: "/blog/", label: "Blog" },
  { href: "/notes/", label: "Notes" },
  { href: "/talks/", label: "Talks" },
  { href: "/links/", label: "Links" },
  { href: "/about/", label: "About" },
];

const currentPath = Astro.url.pathname;
---

<header class="site-header">
  <nav class="container" aria-label="Main navigation">
    <a href="/" class="site-name">jfmcdowell</a>
    <ul role="list">
      {navItems.map(({ href, label }) => (
        <li>
          <a href={href} aria-current={currentPath.startsWith(href) ? "page" : undefined}>
            {label}
          </a>
        </li>
      ))}
    </ul>
    <ThemeToggle />
  </nav>
</header>

<style>
  .site-header {
    border-bottom: 1px solid var(--color-border);
    padding-block: var(--space-m);
  }

  nav {
    display: flex;
    align-items: center;
    gap: var(--space-m);
  }

  .site-name {
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
    margin-right: auto;
  }

  ul {
    display: flex;
    gap: var(--space-m);
    list-style: none;
  }

  a[aria-current="page"] {
    color: var(--color-text);
    font-weight: 600;
  }

  @media (max-width: 640px) {
    nav {
      flex-wrap: wrap;
    }

    .site-name {
      width: 100%;
    }

    ul {
      gap: var(--space-s);
    }
  }
</style>
```

- [ ] **Step 3: Create Footer.astro**

```astro
---
// src/components/Footer.astro
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="container">
    <p>&copy; {year} Justin McDowell</p>
    <nav aria-label="Footer">
      <a href="/rss.xml">RSS</a>
    </nav>
  </div>
</footer>

<style>
  .site-footer {
    border-top: 1px solid var(--color-border);
    padding-block: var(--space-l);
    margin-top: var(--space-xl);
    color: var(--color-muted);
    font-size: var(--font-size-sm);
  }

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  nav {
    display: flex;
    gap: var(--space-m);
  }
</style>
```

- [ ] **Step 4: Create Base.astro layout**

```astro
---
// src/layouts/Base.astro
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import "@/styles/global.css";

interface Props {
  title: string;
  description?: string;
}

const { title, description = "Justin McDowell's personal site" } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalURL} />
    <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <a href="#main-content" class="sr-only">Skip to content</a>
    <Header />
    <main id="main-content" class="container">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 5: Replace the scaffolded index.astro with a placeholder**

```astro
---
// src/pages/index.astro
import Base from "@/layouts/Base.astro";
---

<Base title="jfmcdowell">
  <h1>Site coming soon.</h1>
</Base>
```

- [ ] **Step 6: Verify the dev server renders**

```bash
pnpm dev
```

Open `http://localhost:4321` in a browser. Verify: header with nav, footer, skip-to-content link, theme toggle works, light/dark mode switches.

- [ ] **Step 7: Verify build passes**

```bash
pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/layouts/ src/components/ src/pages/index.astro
git commit -m "feat: add Base layout with Header, Footer, and ThemeToggle"
```

---

### Task 6: Post Layout + Card + TagList Components

**Files:**
- Create: `src/layouts/Post.astro`
- Create: `src/components/Card.astro`
- Create: `src/components/TagList.astro`

- [ ] **Step 1: Create TagList.astro**

```astro
---
// src/components/TagList.astro
interface Props {
  tags: string[];
}

const { tags } = Astro.props;
---

{tags.length > 0 && (
  <ul class="tag-list" role="list">
    {tags.map((tag) => (
      <li>
        <a href={`/tags/${tag}/`}>{tag}</a>
      </li>
    ))}
  </ul>
)}

<style>
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    list-style: none;
  }

  a {
    display: inline-block;
    padding: 0.1em 0.5em;
    font-size: var(--font-size-sm);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 3px;
    color: var(--color-muted);
    text-decoration: none;
  }

  a:hover {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
</style>
```

- [ ] **Step 2: Create Card.astro**

```astro
---
// src/components/Card.astro
import TagList from "./TagList.astro";

interface Props {
  title: string;
  href: string;
  pubDate: Date;
  description?: string;
  tags?: string[];
  /** For links — the external URL */
  externalUrl?: string;
  /** For talks — the event name */
  event?: string;
  /** For links — short commentary */
  commentary?: string;
}

const { title, href, pubDate, description, tags, externalUrl, event, commentary } = Astro.props;

const dateStr = pubDate.toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});
---

<article class="card">
  <header>
    <a href={href} class="card-title">{title}</a>
    <div class="card-meta muted text-sm">
      <time datetime={pubDate.toISOString()}>{dateStr}</time>
      {event && <span> &middot; {event}</span>}
    </div>
  </header>
  {description && <p class="card-description">{description}</p>}
  {commentary && <p class="card-description">{commentary}</p>}
  {externalUrl && (
    <p class="text-sm">
      <a href={externalUrl} target="_blank" rel="noopener noreferrer">{externalUrl}</a>
    </p>
  )}
  {tags && tags.length > 0 && <TagList tags={tags} />}
</article>

<style>
  .card {
    padding-block: var(--space-m);
  }

  .card + .card {
    border-top: 1px solid var(--color-border);
  }

  .card-title {
    font-weight: 600;
    color: var(--color-text);
    text-decoration: none;
  }

  .card-title:hover {
    color: var(--color-accent);
  }

  .card-description {
    margin-top: var(--space-xs);
    color: var(--color-muted);
  }
</style>
```

- [ ] **Step 3: Create Post.astro layout**

```astro
---
// src/layouts/Post.astro
import Base from "./Base.astro";
import TagList from "@/components/TagList.astro";

interface Props {
  title: string;
  description?: string;
  pubDate: Date;
  updatedDate?: Date;
  tags?: string[];
}

const { title, description, pubDate, updatedDate, tags } = Astro.props;

const dateStr = pubDate.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const updatedStr = updatedDate?.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
---

<Base title={title} description={description}>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="muted text-sm">
        <time datetime={pubDate.toISOString()}>{dateStr}</time>
        {updatedStr && <span> (updated {updatedStr})</span>}
      </p>
      {tags && tags.length > 0 && <TagList tags={tags} />}
    </header>
    <div class="prose">
      <slot />
    </div>
  </article>
</Base>

<style>
  header {
    margin-bottom: var(--space-l);
  }

  h1 {
    margin-bottom: var(--space-s);
  }
</style>
```

- [ ] **Step 4: Verify type check**

```bash
pnpm astro check
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Post.astro src/components/Card.astro src/components/TagList.astro
git commit -m "feat: add Post layout, Card, and TagList components"
```

---

### Task 7: Blog Pages

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Create blog index page**

```astro
---
// src/pages/blog/index.astro
import Base from "@/layouts/Base.astro";
import Card from "@/components/Card.astro";
import { getPublishedBlogPosts } from "@/utils/content";

const posts = await getPublishedBlogPosts();
---

<Base title="Blog" description="Long-form posts on technology, architecture, and ideas.">
  <h1>Blog</h1>
  <section>
    {posts.length === 0 && <p class="muted">No posts yet.</p>}
    {posts.map((post) => (
      <Card
        title={post.data.title}
        href={`/blog/${post.id}/`}
        pubDate={post.data.pubDate}
        description={post.data.description}
        tags={post.data.tags}
      />
    ))}
  </section>
</Base>

<style>
  h1 {
    margin-bottom: var(--space-l);
  }
</style>
```

- [ ] **Step 2: Create blog post detail page**

```astro
---
// src/pages/blog/[slug].astro
import { getCollection, render } from "astro:content";
import Post from "@/layouts/Post.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<Post
  title={post.data.title}
  description={post.data.description}
  pubDate={post.data.pubDate}
  updatedDate={post.data.updatedDate}
  tags={post.data.tags}
>
  <Content />
</Post>
```

- [ ] **Step 3: Verify type check**

```bash
pnpm astro check
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/
git commit -m "feat: add blog index and post detail pages"
```

---

### Task 8: Notes Pages

**Files:**
- Create: `src/pages/notes/index.astro`
- Create: `src/pages/notes/[slug].astro`

- [ ] **Step 1: Create notes index page**

```astro
---
// src/pages/notes/index.astro
import Base from "@/layouts/Base.astro";
import Card from "@/components/Card.astro";
import { getPublishedNotes } from "@/utils/content";

const notes = await getPublishedNotes();
---

<Base title="Notes" description="Short-form notes, TIL, and scratch pad.">
  <h1>Notes</h1>
  <section>
    {notes.length === 0 && <p class="muted">No notes yet.</p>}
    {notes.map((note) => (
      <Card
        title={note.data.title}
        href={`/notes/${note.id}/`}
        pubDate={note.data.pubDate}
        tags={note.data.tags}
      />
    ))}
  </section>
</Base>

<style>
  h1 {
    margin-bottom: var(--space-l);
  }
</style>
```

- [ ] **Step 2: Create note detail page**

```astro
---
// src/pages/notes/[slug].astro
import { getCollection, render } from "astro:content";
import Post from "@/layouts/Post.astro";

export async function getStaticPaths() {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  return notes.map((note) => ({
    params: { slug: note.id },
    props: { note },
  }));
}

const { note } = Astro.props;
const { Content } = await render(note);
---

<Post
  title={note.data.title}
  pubDate={note.data.pubDate}
  tags={note.data.tags}
>
  <Content />
</Post>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/notes/
git commit -m "feat: add notes index and detail pages"
```

---

### Task 9: Talks Pages

**Files:**
- Create: `src/pages/talks/index.astro`
- Create: `src/pages/talks/[slug].astro`

- [ ] **Step 1: Create talks index page**

```astro
---
// src/pages/talks/index.astro
import Base from "@/layouts/Base.astro";
import Card from "@/components/Card.astro";
import { getPublishedTalks } from "@/utils/content";

const talks = await getPublishedTalks();
---

<Base title="Talks" description="Conference talks, meetups, and presentations.">
  <h1>Talks</h1>
  <section>
    {talks.length === 0 && <p class="muted">No talks yet.</p>}
    {talks.map((talk) => (
      <Card
        title={talk.data.title}
        href={`/talks/${talk.id}/`}
        pubDate={talk.data.pubDate}
        event={talk.data.event}
        description={talk.data.description}
        tags={talk.data.tags}
      />
    ))}
  </section>
</Base>

<style>
  h1 {
    margin-bottom: var(--space-l);
  }
</style>
```

- [ ] **Step 2: Create talk detail page**

```astro
---
// src/pages/talks/[slug].astro
import { getCollection, render } from "astro:content";
import Post from "@/layouts/Post.astro";

export async function getStaticPaths() {
  const talks = await getCollection("talks", ({ data }) => !data.draft);
  return talks.map((talk) => ({
    params: { slug: talk.id },
    props: { talk },
  }));
}

const { talk } = Astro.props;
const { Content } = await render(talk);
---

<Post
  title={talk.data.title}
  description={talk.data.description}
  pubDate={talk.data.pubDate}
  tags={talk.data.tags}
>
  <p class="muted text-sm">
    {talk.data.event}
    {talk.data.slides && <span> &middot; <a href={talk.data.slides}>Slides</a></span>}
    {talk.data.recording && <span> &middot; <a href={talk.data.recording}>Recording</a></span>}
  </p>
  <Content />
</Post>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/talks/
git commit -m "feat: add talks index and detail pages"
```

---

### Task 10: Links Page

**Files:**
- Create: `src/pages/links/index.astro`

- [ ] **Step 1: Create links index page**

Links are external — the Card links to the external URL directly, not a detail page.

```astro
---
// src/pages/links/index.astro
import Base from "@/layouts/Base.astro";
import Card from "@/components/Card.astro";
import { getPublishedLinks } from "@/utils/content";

const links = await getPublishedLinks();
---

<Base title="Links" description="Curated bookmarks and reading.">
  <h1>Links</h1>
  <section>
    {links.length === 0 && <p class="muted">No links yet.</p>}
    {links.map((link) => (
      <Card
        title={link.data.title}
        href={link.data.url}
        pubDate={link.data.pubDate}
        externalUrl={link.data.url}
        commentary={link.data.commentary}
        tags={link.data.tags}
      />
    ))}
  </section>
</Base>

<style>
  h1 {
    margin-bottom: var(--space-l);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/links/
git commit -m "feat: add links index page"
```

---

### Task 11: Tag Pages

**Files:**
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag].astro`

- [ ] **Step 1: Create tags index page**

```astro
---
// src/pages/tags/index.astro
import Base from "@/layouts/Base.astro";
import { getAllTags } from "@/utils/content";

const tagCounts = await getAllTags();
const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
---

<Base title="Tags" description="Browse content by tag.">
  <h1>Tags</h1>
  {sortedTags.length === 0 && <p class="muted">No tags yet.</p>}
  <ul class="tag-grid" role="list">
    {sortedTags.map(([tag, count]) => (
      <li>
        <a href={`/tags/${tag}/`}>{tag} <span class="muted">({count})</span></a>
      </li>
    ))}
  </ul>
</Base>

<style>
  h1 {
    margin-bottom: var(--space-l);
  }

  .tag-grid {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
  }

  a {
    display: inline-block;
    padding: 0.25em 0.75em;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    text-decoration: none;
    color: var(--color-text);
  }

  a:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
</style>
```

- [ ] **Step 2: Create tag detail page**

```astro
---
// src/pages/tags/[tag].astro
import Base from "@/layouts/Base.astro";
import Card from "@/components/Card.astro";
import { getAllTags, getEntriesByTag } from "@/utils/content";

export async function getStaticPaths() {
  const tagCounts = await getAllTags();
  return [...tagCounts.keys()].map((tag) => ({
    params: { tag },
  }));
}

const { tag } = Astro.params;
const { blog, notes, talks, links } = await getEntriesByTag(tag);
---

<Base title={`Tagged: ${tag}`} description={`All content tagged with "${tag}".`}>
  <h1>Tagged: {tag}</h1>

  {blog.length > 0 && (
    <section>
      <h2>Blog</h2>
      {blog.map((post) => (
        <Card
          title={post.data.title}
          href={`/blog/${post.id}/`}
          pubDate={post.data.pubDate}
          description={post.data.description}
        />
      ))}
    </section>
  )}

  {notes.length > 0 && (
    <section>
      <h2>Notes</h2>
      {notes.map((note) => (
        <Card
          title={note.data.title}
          href={`/notes/${note.id}/`}
          pubDate={note.data.pubDate}
        />
      ))}
    </section>
  )}

  {talks.length > 0 && (
    <section>
      <h2>Talks</h2>
      {talks.map((talk) => (
        <Card
          title={talk.data.title}
          href={`/talks/${talk.id}/`}
          pubDate={talk.data.pubDate}
          event={talk.data.event}
        />
      ))}
    </section>
  )}

  {links.length > 0 && (
    <section>
      <h2>Links</h2>
      {links.map((link) => (
        <Card
          title={link.data.title}
          href={link.data.url}
          pubDate={link.data.pubDate}
          externalUrl={link.data.url}
        />
      ))}
    </section>
  )}
</Base>

<style>
  h1 {
    margin-bottom: var(--space-l);
  }

  section {
    margin-bottom: var(--space-l);
  }

  h2 {
    margin-bottom: var(--space-s);
    padding-bottom: var(--space-xs);
    border-bottom: 1px solid var(--color-border);
  }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/tags/
git commit -m "feat: add tag index and tag detail pages"
```

---

### Task 12: About Page + 404

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/pages/404.astro`

- [ ] **Step 1: Create about page**

```astro
---
// src/pages/about.astro
import Base from "@/layouts/Base.astro";
---

<Base title="About" description="About Justin McDowell.">
  <article class="prose">
    <h1>About</h1>
    <p>
      I'm Justin McDowell. I write about technology, architecture, and the
      things I learn along the way. This site is where I share long-form posts,
      short notes, talks, and links to things I find interesting.
    </p>
    <p>
      Previously, I wrote about Enterprise Architecture and human-centered
      enterprise design. These days my interests have broadened, but the
      through-line remains: making complex systems understandable and useful for
      the people who work with them.
    </p>
  </article>
</Base>
```

- [ ] **Step 2: Create 404 page**

```astro
---
// src/pages/404.astro
import Base from "@/layouts/Base.astro";
---

<Base title="Not Found">
  <h1>404</h1>
  <p>Page not found. <a href="/">Go home</a>.</p>
</Base>

<style>
  h1 {
    font-size: 4rem;
    margin-bottom: var(--space-s);
  }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro src/pages/404.astro
git commit -m "feat: add about and 404 pages"
```

---

### Task 13: Migrate Jekyll Posts + Sample Content

**Files:**
- Create: `src/content/blog/enterprise-architecture-scaling-pinterest.md`
- Create: `src/content/blog/building-better-enterprises.md`
- Create: `src/content/blog/intersection.md`
- Create: `src/content/blog/enterprise-architecture-human-api.md`
- Create: `src/content/blog/human-centered-architecture.md`
- Create: `src/content/blog/intersection-book-review.md`
- Create: `src/content/notes/sample-note.md`
- Create: `src/content/talks/sample-talk.md`
- Create: `src/content/links/sample-link.md`
- Delete: `src/content/blog/.gitkeep`
- Delete: `src/content/notes/.gitkeep`
- Delete: `src/content/talks/.gitkeep`
- Delete: `src/content/links/.gitkeep`

- [ ] **Step 1: Migrate the 6 Jekyll posts**

For each file in `_posts/`, convert to the new schema. Strip the date prefix from the filename (Astro uses `pubDate` in front matter, not filename). Preserve the original content and links. Add `description` field (required by blog schema) — write a one-sentence summary for each.

Read each file from `_posts/`, rewrite its front matter, and save to `src/content/blog/`. The body content stays identical.

Example for `_posts/2013-11-03-Human-Centered-Architecture.md` → `src/content/blog/human-centered-architecture.md`:

```markdown
---
title: "Human Centered Architecture"
description: "Enterprise Architecture needs to become more human-centered, borrowing from service design and usability testing."
pubDate: 2013-11-03
tags: ["enterprise-architecture", "design"]
---

[Christine Outram][7], a human-centered smart city...
(rest of body unchanged)
```

Repeat for all 6 posts. Convert each `categories` array from Jekyll front matter into `tags` (lowercase, kebab-case).

- [ ] **Step 2: Create sample note**

```markdown
---
title: "First note"
pubDate: 2026-04-09
tags: ["meta"]
---

This is a placeholder note. Replace with real content.
```

Save to `src/content/notes/first-note.md`.

- [ ] **Step 3: Create sample talk**

```markdown
---
title: "Sample Talk"
event: "Example Conference 2026"
pubDate: 2026-04-09
description: "A placeholder talk entry."
tags: ["meta"]
---

This is a placeholder talk. Replace with real content.
```

Save to `src/content/talks/sample-talk.md`.

- [ ] **Step 4: Create sample link**

```markdown
---
title: "Astro Documentation"
url: "https://docs.astro.build"
pubDate: 2026-04-09
commentary: "The official Astro docs — well-written and comprehensive."
tags: ["astro", "web"]
---
```

Save to `src/content/links/astro-docs.md`.

- [ ] **Step 5: Remove .gitkeep files**

```bash
rm src/content/blog/.gitkeep src/content/notes/.gitkeep src/content/talks/.gitkeep src/content/links/.gitkeep
```

- [ ] **Step 6: Verify content schemas validate**

```bash
pnpm astro check
```

Expected: No errors. If any post has a tag that doesn't match the kebab-case regex, fix it.

- [ ] **Step 7: Verify markdownlint passes**

```bash
pnpm exec markdownlint-cli2 'src/content/**/*.{md,mdx}'
```

Expected: Clean or only cosmetic warnings from migrated posts (fix any errors).

- [ ] **Step 8: Commit**

```bash
git add src/content/
git commit -m "content: migrate Jekyll posts and add sample notes, talks, links"
```

---

### Task 14: Landing Page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Build the curated landing page**

Replace the placeholder `src/pages/index.astro`:

```astro
---
// src/pages/index.astro
import Base from "@/layouts/Base.astro";
import Card from "@/components/Card.astro";
import {
  getPublishedBlogPosts,
  getPublishedNotes,
  getPublishedLinks,
  getPublishedTalks,
} from "@/utils/content";

const posts = await getPublishedBlogPosts();
const notes = await getPublishedNotes();
const links = await getPublishedLinks();
const talks = await getPublishedTalks();

const latestPost = posts[0];
const recentNotes = notes.slice(0, 5);
const recentLinks = links.slice(0, 5);
---

<Base title="jfmcdowell" description="Justin McDowell's personal site — blog, notes, talks, and links.">
  <section class="hero">
    <h1>Justin McDowell</h1>
    <p class="muted">Writing about technology, architecture, and the things I learn along the way.</p>
  </section>

  {latestPost && (
    <section>
      <h2>Latest Post</h2>
      <Card
        title={latestPost.data.title}
        href={`/blog/${latestPost.id}/`}
        pubDate={latestPost.data.pubDate}
        description={latestPost.data.description}
        tags={latestPost.data.tags}
      />
      <p class="section-link"><a href="/blog/">All posts &rarr;</a></p>
    </section>
  )}

  {recentNotes.length > 0 && (
    <section>
      <h2>Recent Notes</h2>
      {recentNotes.map((note) => (
        <Card
          title={note.data.title}
          href={`/notes/${note.id}/`}
          pubDate={note.data.pubDate}
          tags={note.data.tags}
        />
      ))}
      <p class="section-link"><a href="/notes/">All notes &rarr;</a></p>
    </section>
  )}

  {recentLinks.length > 0 && (
    <section>
      <h2>Links</h2>
      {recentLinks.map((link) => (
        <Card
          title={link.data.title}
          href={link.data.url}
          pubDate={link.data.pubDate}
          externalUrl={link.data.url}
          commentary={link.data.commentary}
        />
      ))}
      <p class="section-link"><a href="/links/">All links &rarr;</a></p>
    </section>
  )}

  {talks.length > 0 && (
    <section>
      <h2>Talks</h2>
      {talks.map((talk) => (
        <Card
          title={talk.data.title}
          href={`/talks/${talk.id}/`}
          pubDate={talk.data.pubDate}
          event={talk.data.event}
        />
      ))}
      <p class="section-link"><a href="/talks/">All talks &rarr;</a></p>
    </section>
  )}
</Base>

<style>
  .hero {
    margin-bottom: var(--space-xl);
    padding-bottom: var(--space-l);
    border-bottom: 1px solid var(--color-border);
  }

  .hero h1 {
    margin-bottom: var(--space-s);
  }

  section {
    margin-bottom: var(--space-xl);
  }

  h2 {
    margin-bottom: var(--space-s);
  }

  .section-link {
    margin-top: var(--space-m);
    font-size: var(--font-size-sm);
  }
</style>
```

- [ ] **Step 2: Verify in dev server**

```bash
pnpm dev
```

Open `http://localhost:4321`. Verify: hero section, latest blog post, recent notes, recent links, talks. All links work.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build curated landing page with all content sections"
```

---

### Task 15: RSS Feed

**Files:**
- Create: `src/pages/rss.xml.ts`

- [ ] **Step 1: Create RSS feed endpoint**

```typescript
// src/pages/rss.xml.ts
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPublishedBlogPosts, getPublishedNotes } from "@/utils/content";

export async function GET(context: APIContext) {
  const posts = await getPublishedBlogPosts();
  const notes = await getPublishedNotes();

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    ...notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.pubDate,
      description: note.data.title,
      link: `/notes/${note.id}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: "jfmcdowell",
    description: "Justin McDowell's blog and notes.",
    site: context.site!.toString(),
    items,
  });
}
```

- [ ] **Step 2: Verify RSS generates**

```bash
pnpm run build && cat dist/rss.xml | head -20
```

Expected: Valid XML with `<rss>` root, `<channel>` with title, and `<item>` entries for blog posts and notes.

- [ ] **Step 3: Commit**

```bash
git add src/pages/rss.xml.ts
git commit -m "feat: add RSS feed for blog posts and notes"
```

---

### Task 16: Pagefind Search

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Add Pagefind search widget to Header**

Add a search element to the header nav, between the nav links and theme toggle:

In `src/components/Header.astro`, add after the `</ul>` and before `<ThemeToggle />`:

```astro
<div id="search" class="search-container"></div>
```

Add to the `<style>` block:

```css
.search-container {
  flex-shrink: 0;
}
```

Add after the closing `</style>`:

```astro
<script>
  async function loadPagefind() {
    const pagefind = await import("/pagefind/pagefind-ui.js");
    new pagefind.PagefindUI({
      element: "#search",
      showSubResults: false,
      showImages: false,
    });
  }
  loadPagefind();
</script>

<style is:global>
  .pagefind-ui__search-input {
    font-family: var(--font-body) !important;
    font-size: var(--font-size-sm) !important;
    border: 1px solid var(--color-border) !important;
    border-radius: 4px !important;
    background: var(--color-surface) !important;
    color: var(--color-text) !important;
    padding: 0.25rem 0.5rem !important;
    width: 12rem !important;
  }
</style>
```

- [ ] **Step 2: Verify Pagefind works**

```bash
pnpm run build && pnpm preview
```

Open `http://localhost:4321`. Type in the search box — it should find indexed content. Note: Pagefind only works after build, not in dev mode.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add Pagefind search to site header"
```

---

### Task 17: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create deployment workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - name: Setup pnpm
        uses: pnpm/action-setup@fe02b34f77f8bc703c22d82ef6900f5160f89e7e # v4.0.0

      - name: Setup Node
        uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0
        with:
          node-version-file: package.json
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check
        run: pnpm check

      - name: Build
        run: pnpm build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa # v3.0.1
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac553fd0d31 # v4.0.5
```

- [ ] **Step 2: Add node version to package.json**

Add to `package.json` top level (not inside scripts):

```json
"packageManager": "pnpm@10.0.0",
"engines": {
  "node": ">=22"
}
```

The exact pnpm version should match what's installed locally. Check with:

```bash
pnpm --version
```

- [ ] **Step 3: Verify workflow YAML is valid**

```bash
cat .github/workflows/deploy.yml | head -5
```

Expected: `name: Deploy to GitHub Pages` as the first non-comment line.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml package.json
git commit -m "chore: add GitHub Actions workflow for Pages deployment"
```

---

### Task 18: Full Build Verification

- [ ] **Step 1: Run the full check pipeline**

```bash
pnpm check
```

Expected: Biome check passes, astro check passes, markdownlint-cli2 passes. If markdownlint-cli2 glob doesn't match files, try without quotes:

```bash
pnpm exec markdownlint-cli2 src/content/**/*.md
```

If needed, update the `check` script in `package.json` to use the working form.

- [ ] **Step 2: Run a full build**

```bash
pnpm run build
```

Expected: Astro builds all pages, Pagefind indexes the content. Check dist/ has the expected structure:

```bash
ls dist/blog/ dist/notes/ dist/talks/ dist/links/ dist/tags/ dist/about/ dist/rss.xml
```

- [ ] **Step 3: Preview locally**

```bash
pnpm preview
```

Open `http://localhost:4321`. Walk through:
- Landing page shows hero + all sections
- Blog index lists posts, clicking through works
- Notes/talks/links indexes work
- Tag pages show grouped content
- About page renders
- 404 page renders at `/nonexistent/`
- RSS feed renders at `/rss.xml`
- Theme toggle works on every page
- Search finds content

- [ ] **Step 4: Commit any fixes**

```bash
git add -u
git commit -m "fix: address build verification issues"
```

(Only if fixes were needed.)

---

### Task 19: Clean Up Jekyll Files

**Files:**
- Delete: `_config.yml`
- Delete: `_includes/` (entire directory)
- Delete: `_layouts/` (entire directory)
- Delete: `_posts/` (entire directory)
- Delete: `public/css/` (Jekyll CSS — not the Astro `public/` directory)
- Delete: `index.html` (Jekyll index — Astro has `src/pages/index.astro`)
- Delete: `about.md` (Jekyll about — Astro has `src/pages/about.astro`)
- Delete: `atom.xml` (replaced by `rss.xml`)
- Delete: `404.html` (replaced by `src/pages/404.astro`)
- Delete: `CNAME` (custom domain deferred)
- Delete: `README.md` (optional — replace with updated content if desired)
- Keep: `public/favicon.ico` (carried over)
- Keep: `public/apple-touch-icon-144-precomposed.png` (carried over)
- Keep: `LICENSE.md`
- Keep: `AGENTS.md`, `CLAUDE.md` (symlink)
- Keep: `docs/` (specs and plans)

- [ ] **Step 1: Remove Jekyll files**

```bash
rm -rf _config.yml _includes/ _layouts/ _posts/ public/css/ atom.xml CNAME
rm index.html about.md 404.html
```

- [ ] **Step 2: Verify build still passes after cleanup**

```bash
pnpm run build
```

Expected: Build succeeds — no references to deleted files.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove Jekyll files after Astro migration"
```

---

### Task 20: Rename Default Branch to main

The repo currently uses `master`. GitHub Actions workflow targets `main`. Either rename the branch or update the workflow.

- [ ] **Step 1: Rename branch**

```bash
git branch -m master main
```

- [ ] **Step 2: Push and set upstream**

```bash
git push -u origin main
```

- [ ] **Step 3: Update default branch on GitHub**

Go to repo Settings > Branches > Default branch. Change from `master` to `main`.

- [ ] **Step 4: Enable GitHub Pages with Actions source**

Go to repo Settings > Pages. Under "Build and deployment", change Source to "GitHub Actions".

- [ ] **Step 5: Verify deployment**

Push a small change (or the existing commits) and verify the Actions workflow runs and the site deploys to `https://jfmcdowell.github.io`.
