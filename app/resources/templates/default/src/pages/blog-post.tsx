import { useParams, Navigate, Link } from "react-router"
import { getPostBySlug, formatDate } from "@/lib/posts"
import { markdownToHtml } from "@/lib/markdown"

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) return <Navigate to="/blog" replace />

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link
        to="/blog"
        className="text-sm text-muted-foreground hover:underline"
      >
        &larr; Back to Blog
      </Link>
      <header className="mt-6">
        <time className="text-sm text-muted-foreground">
          {formatDate(post.date)}
        </time>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-2 text-lg text-muted-foreground">{post.excerpt}</p>
        )}
      </header>
      <div
        className="prose mt-8"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
      />
    </article>
  )
}
