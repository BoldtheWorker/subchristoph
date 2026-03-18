import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import Layout from "@/components/Layout";
import type { SiteContent } from "@/integrations/supabase/types";

const About = () => {
  const { data: content } = useQuery({
    queryKey: ["site-content-about"],
    queryFn: async () => {
      const data = await apiFetch<SiteContent[]>("/api/site-content");
      const map: Record<string, string> = {};
      data.filter((item) => item.section === "about").forEach((item) => { map[item.key] = item.value; });
      return map;
    },
  });

  const c = content || {};

  return (
    <Layout>
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-heading text-sm tracking-[0.3em] text-gold-light mb-3">ABOUT</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-8">Our Story</h1>
        </motion.div>

        <div className="space-y-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                {c.story_title || "Built by Creators, for Creators"}
              </h2>
              <p className="text-green-light leading-relaxed mb-4">
                {c.story_p1 || "Christoph Media Hub was founded with a singular vision: to provide world-class creative production services in Lagos, Nigeria."}
              </p>
              <p className="text-green-light leading-relaxed">
                {c.story_p2 || "From our acoustically engineered recording rooms to our broadcast-ready live streaming setup, every element has been designed to remove barriers between artists and their best work."}
              </p>
            </div>
            <div className="border-2 border-green/40 rounded-sm p-8 bg-green-muted">
              <h3 className="font-heading text-lg font-bold text-primary mb-6">Mission & Vision</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-heading text-sm font-bold tracking-widest text-gold-light mb-2">MISSION</h4>
                  <p className="text-green-light text-sm leading-relaxed">
                    {c.mission || "To empower creators with premium production tools, expert guidance, and a creative environment that elevates every project."}
                  </p>
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold tracking-widest text-gold-light mb-2">VISION</h4>
                  <p className="text-green-light text-sm leading-relaxed">
                    {c.vision || "To be West Africa's most trusted creative production hub, setting the standard for quality and innovation."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="border-t border-green/30 pt-16">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Precision", desc: "Every detail matters. From mic placement to color grading, we pursue perfection in every signal path." },
                { title: "Authenticity", desc: "We celebrate original voices. Our role is to amplify your vision, not impose our own." },
                { title: "Excellence", desc: "No shortcuts. We invest in the best equipment, talent, and processes to deliver world-class results." },
              ].map((val) => (
                <div key={val.title} className="border-l-2 border-primary pl-6">
                  <h3 className="font-heading text-lg font-bold text-green-light mb-2">{val.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-sm bg-gradient-to-br from-green-muted to-gold-muted border-2 border-green/30 p-8 md:p-12">
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">Why Choose Christoph Media Hub</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "State-of-the-art equipment and acoustically treated spaces",
                "Experienced engineers and production professionals",
                "End-to-end service from concept to delivery",
                "Competitive pricing with transparent packages",
                "Fast turnaround without compromising quality",
                "Centrally located in Lagos for easy access",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-green-light text-sm">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
