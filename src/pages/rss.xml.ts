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
