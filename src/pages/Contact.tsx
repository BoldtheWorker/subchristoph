import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import Layout from "@/components/Layout";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { SiteContent } from "@/integrations/supabase/types";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: content } = useQuery({
    queryKey: ["site-content-contact"],
    queryFn: async () => {
      const data = await apiFetch<SiteContent[]>("/api/site-content");
      const map: Record<string, string> = {};
      data.filter((item) => item.section === "contact").forEach((item) => { map[item.key] = item.value; });
      return map;
    },
  });

  const c = content || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call for contact form
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSent(true);
    setSubmitting(false);
    toast.success("Message sent! We'll get back to you shortly.");
  };

  return (
    <Layout>
      <section className="px-6 md:px-12 py-16 lg:py-24 max-w-6xl mx-auto min-h-[85vh]">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Info Side */}
          <div className="lg:w-1/3 space-y-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="font-heading text-[10px] tracking-[0.4em] text-primary mb-4 flex items-center gap-3 font-bold uppercase">
                <span className="w-8 h-px bg-primary" /> CONTACT
              </p>
              <h1 className="font-heading text-5xl font-bold text-foreground mb-6 tracking-tight">Let's Connect<span className="text-primary">.</span></h1>
              <p className="text-green-light leading-relaxed">Whether you have a specific project in mind or just want to explore possibilities, our team is ready to help you bring your vision to life.</p>
            </motion.div>

            <div className="space-y-8">
              {[
                { icon: MapPin, label: "Studio Location", value: c.contact_location || "Lagos, Nigeria" },
                { icon: Mail, label: "Email Address", value: c.contact_email || "info@christophstudios.com" },
                { icon: Phone, label: "Phone & WhatsApp", value: c.contact_phone || "+234 000 000 0000" },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="group flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-green-muted border border-green/40 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/40 transition-all duration-500">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1">{item.label}</p>
                    <p className="text-foreground font-medium group-hover:text-primary transition-colors">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="flex-1 bg-card border border-border rounded-sm p-8 md:p-12 shadow-2xl relative overflow-hidden">
             {/* Decorative background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             
             <AnimatePresence mode="wait">
               {sent ? (
                 <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-green-bright/20 rounded-full blur-3xl animate-pulse" />
                      <div className="w-20 h-20 bg-green-bright/10 rounded-full flex items-center justify-center relative z-10 border border-green-bright/30">
                        <CheckCircle className="w-10 h-10 text-green-bright" />
                      </div>
                      <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-primary" />
                    </div>
                    <h2 className="font-heading text-3xl font-bold mb-3 tracking-tight">Message Received</h2>
                    <p className="text-green-light max-w-xs mx-auto mb-8">Thank you for reaching out. A member of our team will contact you within 24 hours.</p>
                    <button onClick={() => setSent(false)} className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-primary hover:text-gold-light transition-colors">
                      SEND ANOTHER MESSAGE
                    </button>
                 </motion.div>
               ) : (
                 <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase font-bold">Your Name</label>
                        <input type="text" required placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                          className="w-full bg-background border border-border rounded-sm px-4 py-4 text-foreground text-sm focus:outline-none focus:border-primary transition-all shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase font-bold">Email Address</label>
                        <input type="email" required placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                          className="w-full bg-background border border-border rounded-sm px-4 py-4 text-foreground text-sm focus:outline-none focus:border-primary transition-all shadow-inner" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase font-bold">Subject</label>
                      <input type="text" placeholder="Creative Inquiry" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                        className="w-full bg-background border border-border rounded-sm px-4 py-4 text-foreground text-sm focus:outline-none focus:border-primary transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase font-bold">Message</label>
                      <textarea required rows={5} placeholder="Share your vision with us..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                        className="w-full bg-background border border-border rounded-sm px-4 py-4 text-foreground text-sm focus:outline-none focus:border-primary transition-all resize-none shadow-inner" />
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full px-8 py-5 bg-primary text-primary-foreground font-heading text-sm font-bold tracking-[0.2em] hover:bg-gold-light transition-all rounded-sm shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-3 group active:scale-[0.98]">
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> INITIATE DIALOGUE</>}
                    </button>
                 </motion.form>
               )}
             </AnimatePresence>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
