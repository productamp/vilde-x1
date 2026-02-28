import { parseFrontmatter } from "./frontmatter"

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
}

const postFiles = import.meta.glob("/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

function parsePost(filePath: string, raw: string): Post {
  const slug = filePath.replace("/content/blog/", "").replace(/\.md$/, "")
  const { data, content } = parseFrontmatter(raw)
  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    excerpt: data.excerpt || "",
    content,
  }
}

export function getAllPosts(): Post[] {
  return Object.entries(postFiles)
    .map(([path, raw]) => parsePost(path, raw))
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPostBySlug(slug: string): Post | undefined {
  const key = `/content/blog/${slug}.md`
  const raw = postFiles[key]
  if (!raw) return undefined
  return parsePost(key, raw)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString))
}
