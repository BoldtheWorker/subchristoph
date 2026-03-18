import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, Mic, Radio, Play, Camera, Video } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Layout from "@/components/Layout";
import type { Service } from "@/integrations/supabase/types";

const iconMap: Record<string, LucideIcon> = { Mic, Radio, Play, Camera, Video };

const Services = () => {
  const [soloId, setSoloId] = useState<string | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => apiFetch<Service[]>("/api/services"),
  });

  return (
    <Layout>
      <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="font-heading text-sm tracking-[0.3em] text-gold-light mb-3">SERVICES</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">The Signal Path</h1>
          <p className="text-green-light max-w-xl">
            Each service is a channel on the desk. Solo one to dive deep, or view the full mix.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col lg:flex-row gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 border-2 border-green/40 rounded-sm p-6 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-sm mb-6" />
                <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            {services?.map((service) => {
              const isSolo = soloId === service.id;
              const isFaded = soloId !== null && !isSolo;
              const Icon = iconMap[service.icon] || Mic;

              return (
                <motion.div key={service.id} layout
                  className={`channel-strip border-2 rounded-sm p-6 lg:p-8 flex-1 transition-all ${
                    isFaded ? "faded" : "solo"
                  } ${isSolo ? "lg:flex-[2] border-primary bg-green-muted" : "border-green/40 bg-card hover:border-green-light"}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${isSolo ? "bg-primary/20" : "bg-green/30"}`}>
                      <Icon className={`h-4 w-4 ${isSolo ? "text-primary" : "text-green-bright"}`} />
                    </div>
                    <button onClick={() => setSoloId(soloId === service.id ? null : service.id)}
                      className={`font-heading text-[10px] tracking-[0.2em] px-3 py-1 border-2 rounded-sm transition-colors ${
                        isSolo ? "bg-primary text-primary-foreground border-primary" : "border-green-light text-green-light hover:border-primary hover:text-primary"
                      }`}>
                      SOLO
                    </button>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                    {isSolo ? service.title : (service.short_title || service.title)}
                  </h3>
                  <AnimatePresence>
                    {(isSolo || soloId === null) && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                        <p className="text-sm text-green-light leading-relaxed mb-4">{service.description}</p>
                        {isSolo && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                            <ul className="space-y-2 mb-6">
                              {(service.sub_services || []).map((sub: string) => (
                                <li key={sub} className="flex items-center gap-2 text-sm text-foreground/80">
                                  <span className="w-2 h-2 rounded-full bg-primary" />{sub}
                                </li>
                              ))}
                            </ul>
                            <p className="text-sm text-primary font-heading font-bold mb-4">
                              From GH₵{service.price.toLocaleString()}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isSolo && (
                    <Link to="/booking"
                      className="inline-flex items-center justify-center w-full px-6 py-2.5 bg-primary text-primary-foreground font-heading text-xs font-bold tracking-widest hover:bg-gold-light transition-colors rounded-sm">
                      BOOK THIS SERVICE
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Services;
