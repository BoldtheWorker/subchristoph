import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Layout from "@/components/Layout";
import type { FaqItem } from "@/integrations/supabase/types";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faq-items"],
    queryFn: () => apiFetch<FaqItem[]>("/api/faq"),
  });

  return (
    <Layout>
      <section className="px-6 md:px-12 py-16 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-heading text-sm tracking-[0.3em] text-gold-light mb-3">FAQ</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-green-light mb-12">
            Common questions about our services, process, and studio.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 border-green/40 rounded-sm p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {faqs?.map((faq, i) => (
              <div key={faq.id} className="border-2 border-green/40 rounded-sm overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-green-muted transition-colors"
                >
                  <span className="font-heading text-sm font-bold text-foreground pr-4">{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 text-primary shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-5 pb-5 text-sm text-green-light leading-relaxed border-l-2 border-primary ml-5">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default FAQ;
