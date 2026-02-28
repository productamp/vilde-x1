import { Link } from "react-router"
import { getAllPosts, formatDate } from "@/lib/posts"

export function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      {posts.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link to={`/blog/${post.slug}`} className="group block">
                <time className="text-sm text-muted-foreground">
                  {formatDate(post.date)}
                </time>
                <h2 className="mt-1 text-xl font-semibold group-hover:underline">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-1 text-muted-foreground">{post.excerpt}</p>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
