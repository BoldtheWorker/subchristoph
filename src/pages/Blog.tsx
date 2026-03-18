import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import type { BlogPost } from "@/integrations/supabase/types";

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => apiFetch<BlogPost[]>("/api/blog"),
  });

  return (
    <Layout>
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-heading text-sm tracking-[0.3em] text-gold-light mb-3">BLOG</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Media Insights</h1>
          <p className="text-green-light mb-12">Articles, tips, and behind-the-scenes from our studio.</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-2 border-green/40 rounded-sm p-6 animate-pulse">
                <div className="h-48 bg-muted rounded-sm mb-4" />
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-6 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : !posts?.length ? (
          <p className="text-muted-foreground text-center py-12">No articles published yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border-2 border-green/40 rounded-sm overflow-hidden hover:border-primary transition-colors group"
              >
                {post.cover_image_url && (
                  <div className="h-48 overflow-hidden">
                    <img src={post.cover_image_url} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {post.category && (
                      <span className="font-heading text-[10px] tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-sm">
                        {post.category.toUpperCase()}
                      </span>
                    )}
                    {post.published_at && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(post.published_at), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  <h2 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-green-light line-clamp-2">{post.excerpt}</p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Blog;
