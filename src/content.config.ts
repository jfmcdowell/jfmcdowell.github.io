import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const tagSchema = z
  .array(
    z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Tags must be lowercase kebab-case"),
  )
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
    slides: z.url().optional(),
    recording: z.url().optional(),
    description: z.string().optional(),
    tags: tagSchema,
    draft: z.boolean().default(false),
  }),
});

const links = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/links" }),
  schema: z.object({
    title: z.string(),
    url: z.url(),
    pubDate: z.coerce.date(),
    commentary: z.string().optional(),
    tags: tagSchema,
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, notes, talks, links };
