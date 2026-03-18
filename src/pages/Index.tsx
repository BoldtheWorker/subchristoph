import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, Mic, Video, Camera, Radio, Play, ArrowRight, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Layout from "@/components/Layout";
import HeroCarousel from "@/components/HeroCarousel";
import type { SiteContent, Service, Testimonial } from "@/integrations/supabase/types";

const iconMap: Record<string, LucideIcon> = { Mic, Radio, Play, Camera, Video };

const Index = () => {
  const { data: stats } = useQuery({
    queryKey: ["site-content-homepage"],
    queryFn: async () => {
      const data = await apiFetch<SiteContent[]>("/api/site-content");
      const map: Record<string, string> = {};
      data.filter(item => item.section === "homepage").forEach((item) => { map[item.key] = item.value; });
      return [
        { value: map.stat_1_value || "500+", label: map.stat_1_label || "Projects Completed" },
        { value: map.stat_2_value || "150+", label: map.stat_2_label || "Happy Clients" },
        { value: map.stat_3_value || "8+", label: map.stat_3_label || "Years Experience" },
        { value: map.stat_4_value || "24/7", label: map.stat_4_label || "Studio Access" },
      ];
    },
  });

  const { data: services } = useQuery({
    queryKey: ["homepage-services"],
    queryFn: () => apiFetch<Service[]>("/api/services"),
  });

  const { data: testimonials } = useQuery({
    queryKey: ["homepage-testimonials"],
    queryFn: () => apiFetch<Testimonial[]>("/api/testimonials"),
  });

  const statsList = stats || [
    { value: "500+", label: "Projects Completed" },
    { value: "150+", label: "Happy Clients" },
    { value: "8+", label: "Years Experience" },
    { value: "24/7", label: "Studio Access" },
  ];

  return (
    <Layout>
      <HeroCarousel />

      {/* Stats bar */}
      <section className="px-6 md:px-12 py-8 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsList.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground tracking-wide mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Overview */}
      <section className="px-6 md:px-12 py-24 bg-green-muted border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="font-heading text-xs tracking-[0.4em] text-primary mb-3 flex items-center gap-3">
                <span className="w-8 h-px bg-primary" /> WHAT WE DO
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Full-Service Creative Production</h2>
            </div>
            <Link to="/services" className="font-heading text-sm tracking-widest text-primary hover:text-gold-light transition-colors flex items-center gap-2 group">
              VIEW ALL SERVICES <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {(services || []).map((service, i) => {
              const Icon = iconMap[service.icon] || Mic;
              return (
                <motion.div key={service.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to="/services"
                    className="group block border border-border rounded-sm p-6 hover:border-primary/60 transition-all duration-300 bg-card hover:bg-surface-elevated hover:shadow-[0_8px_30px_-12px_hsl(var(--gold)/0.15)] h-full">
                    <div className="w-12 h-12 rounded-sm bg-green/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-green-bright group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {service.short_title || service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-12 py-24 border-t border-border bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-heading text-xs tracking-[0.4em] text-primary mb-3 flex items-center gap-3">
              <span className="w-8 h-px bg-primary" /> CLIENT VOICES
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Trusted by Creators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(testimonials || []).map((t, i) => (
              <motion.blockquote key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="border border-border rounded-sm p-8 bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-[0_8px_30px_-12px_hsl(var(--gold)/0.1)]">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground/80 leading-relaxed mb-6 italic">"{t.content}"</p>
                <footer className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green/30 flex items-center justify-center font-heading text-sm font-bold text-primary">
                    {t.client_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{t.client_name}</p>
                    <p className="text-xs text-muted-foreground">{t.client_role}</p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-24 bg-gradient-to-br from-green-muted via-green/20 to-gold-muted border-t border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Create Something <span className="text-primary">Remarkable</span>?
            </h2>
            <p className="text-green-light mb-10 max-w-lg mx-auto leading-relaxed">
              Book your studio session today and bring your creative vision to life with our world-class production team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking"
                className="inline-flex items-center justify-center px-10 py-4 bg-primary text-primary-foreground font-heading text-sm font-bold tracking-widest hover:bg-gold-light transition-all duration-300 rounded-sm hover:shadow-[0_0_30px_hsl(var(--gold)/0.3)]">
                BOOK A SESSION
              </Link>
              <Link to="/contact"
                className="inline-flex items-center justify-center px-10 py-4 border-2 border-green-light/40 text-green-light font-heading text-sm font-bold tracking-widest hover:bg-green/20 hover:border-primary/60 transition-all duration-300 rounded-sm">
                CONTACT US
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
