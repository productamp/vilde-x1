import { Routes, Route } from "react-router"
import { RootLayout } from "@/layouts/root-layout"
import { HomePage } from "@/pages/home"
import { BlogPage } from "@/pages/blog"
import { BlogPostPage } from "@/pages/blog-post"

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
      </Route>
    </Routes>
  )
}
