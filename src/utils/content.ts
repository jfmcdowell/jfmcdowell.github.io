import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

type AnyEntry =
  | CollectionEntry<"blog">
  | CollectionEntry<"notes">
  | CollectionEntry<"talks">
  | CollectionEntry<"links">;

function isPublished(entry: { data: { draft?: boolean } }): boolean {
  return !entry.data.draft;
}

export async function getPublishedBlogPosts() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getPublishedNotes() {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  return notes.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getPublishedTalks() {
  const talks = await getCollection("talks", ({ data }) => !data.draft);
  return talks.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getPublishedLinks() {
  const links = await getCollection("links", ({ data }) => !data.draft);
  return links.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
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
    entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return {
    blog: sortByDate(blog),
    notes: sortByDate(notes),
    talks: sortByDate(talks),
    links: sortByDate(links),
  };
}
