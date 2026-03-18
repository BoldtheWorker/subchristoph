import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import Layout from "@/components/Layout";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  media_url: string | null;
  is_featured: boolean;
  sort_order: number;
}

const categories = ["All", "Audio", "Podcast", "Livestream", "Photography", "Video"];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: items, isLoading } = useQuery({
    queryKey: ["portfolio-items"],
    queryFn: () => apiFetch<PortfolioItem[]>("/api/portfolio"),
  });

  const filtered = items?.filter((item) => 
    activeCategory === "All" || item.category === activeCategory
  ) || [];

  return (
    <Layout>
      <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-heading text-sm tracking-[0.3em] text-gold-light mb-3">PORTFOLIO</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Our Work</h1>
          <p className="text-green-light mb-10">A curated selection of projects across our service lines.</p>
        </motion.div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-heading text-xs tracking-widest px-4 py-2 border-2 rounded-sm transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-green/40 text-green-light hover:border-primary hover:text-primary"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-card animate-pulse rounded-sm border-2 border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="border-2 border-green/40 rounded-sm bg-card overflow-hidden hover:border-primary transition-all group"
                >
                  <div className="aspect-video bg-green-muted relative overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px] text-primary tracking-[0.3em] font-heading font-bold">
                          {item.category.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-background/80 backdrop-blur-sm text-[10px] font-heading font-bold tracking-widest text-primary px-3 py-1 rounded-sm border border-primary/20">
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-green-light line-clamp-2 leading-relaxed">
                      {item.description || "No description provided."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-sm">
            <p className="text-muted-foreground font-heading italic">No items found in this category.</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Portfolio;
