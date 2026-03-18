import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Mic, Radio, Play, Camera, Video, CheckCircle, ArrowRight, ArrowLeft, Loader2, CreditCard, X, ShieldCheck, Sparkles, CalendarDays } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { LucideIcon } from "lucide-react";

interface Service {
  id: string;
  title: string;
  short_title: string;
  description: string;
  price: number;
  icon: string;
}

interface Booking {
  id: string;
  service: string;
  client_name: string;
  client_email: string;
  amount_kobo: number;
  status: string;
}

const iconMap: Record<string, LucideIcon> = { Mic, Radio, Play, Camera, Video };

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    message: "",
  });

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ["booking-services"],
    queryFn: () => apiFetch<Service[]>("/api/services"),
  });

  const selectedService = services?.find((s) => s.id === selectedServiceId);

  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");
    if (reference || trxref) handleVerify(reference || trxref || "");
  }, [searchParams]);

  const handleVerify = async (ref: string) => {
    setVerifying(true);
    try {
      const result = await apiFetch<{ status: string; booking_id: string }>("/api/paystack/verify", {
        method: "POST",
        body: JSON.stringify({ reference: ref }),
      });
      if (result.status === "success") {
        setVerificationResult({ success: true, message: "Payment verified successfully! Your session is confirmed." });
      } else {
        setVerificationResult({ success: false, message: "Payment could not be verified. Please contact support." });
      }
      setStep(4);
    } catch (err) {
      setVerificationResult({ success: false, message: "An error occurred during verification." });
      setStep(4);
    } finally {
      setVerifying(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setSubmitting(true);
    const amountKobo = selectedService.price * 100;
    try {
      const booking = await apiFetch<Booking>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          service: selectedService.title,
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone,
          preferred_date: formData.date,
          message: formData.message,
          amount_kobo: amountKobo,
        }),
      });

      const paymentData = await apiFetch<{ authorization_url?: string }>("/api/paystack/initialize", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          amount: amountKobo,
          booking_id: booking.id,
          callback_url: `${window.location.origin}/booking`,
        }),
      });

      if (paymentData?.authorization_url) {
        window.location.href = paymentData.authorization_url;
      } else {
        toast.success("Booking saved! Payment required to confirm.");
        setStep(4);
        setVerificationResult({ success: true, message: "Booking received! We'll contact you for payment." });
      }
    } catch (err) {
      toast.error("Failed to process booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const stepVariants = {
    initial: { opacity: 0, scale: 0.98, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.3 } }
  };

  if (verifying) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
          </div>
          <h2 className="font-heading text-3xl font-bold mb-3 tracking-tight">Verifying Transaction</h2>
          <p className="text-green-light max-w-sm mx-auto leading-relaxed">Securing your session. Please do not close this window or refresh the page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="px-6 md:px-12 py-16 lg:py-24 max-w-6xl mx-auto min-h-[90vh]">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Form Content */}
          <div className="flex-1 w-full order-2 lg:order-1">
            <div className="mb-12">
              <p className="font-heading text-[10px] tracking-[0.4em] text-primary mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-primary" /> 
                STEP {step} OF 3
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                {step === 1 && "Select Experience"}
                {step === 2 && "Personal Details"}
                {step === 3 && "Confirm & Pay"}
                {step === 4 && "Booking Status"}
              </h1>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loadingServices ? (
                      [1,2,3,4].map(i => <div key={i} className="h-32 bg-card animate-pulse rounded-sm border-2 border-border" />)
                    ) : (
                      (services || []).map((svc) => {
                        const Icon = iconMap[svc.icon] || Mic;
                        const selected = selectedServiceId === svc.id;
                        return (
                          <button key={svc.id} type="button" onClick={() => setSelectedServiceId(svc.id)}
                            className={`group relative flex items-center gap-5 p-6 border-2 rounded-sm text-left transition-all duration-500 overflow-hidden ${
                              selected ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(212,175,55,0.1)]" : "border-card bg-card hover:border-primary/30"
                            }`}>
                            {selected && <div className="absolute top-0 right-0 p-2 bg-primary text-primary-foreground transform translate-x-1/2 -translate-y-1/2 rotate-45"><CheckCircle className="w-3 h-3" /></div>}
                            <div className={`w-14 h-14 rounded-sm flex items-center justify-center transition-all duration-500 ${selected ? "bg-primary text-primary-foreground" : "bg-green-muted text-green-bright group-hover:bg-primary/20 group-hover:text-primary"}`}>
                              <Icon className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                              <span className="text-lg font-heading font-bold block text-foreground mb-1">{svc.title}</span>
                              <span className={`text-sm font-bold transition-colors ${selected ? "text-primary" : "text-green-light"}`}>GH₵{svc.price.toLocaleString()}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-border/50">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-green-bright" /> Prices are transparent. No hidden fees.
                    </p>
                    <button onClick={() => setStep(2)} disabled={!selectedServiceId}
                      className="px-12 py-4 bg-primary text-primary-foreground font-heading text-sm font-bold tracking-widest hover:bg-gold-light transition-all rounded-sm disabled:opacity-50 flex items-center gap-3 group shadow-xl hover:shadow-primary/20">
                      NEXT STEP <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                    <div className="space-y-2">
                      <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">Full Name</label>
                      <input type="text" required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-card border border-border rounded-sm px-4 py-4 text-foreground focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/30 shadow-inner"
                        placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">Email Address</label>
                      <input type="email" required value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-card border border-border rounded-sm px-4 py-4 text-foreground focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/30 shadow-inner"
                        placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">WhatsApp / Phone</label>
                      <input type="tel" required value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-card border border-border rounded-sm px-4 py-4 text-foreground focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/30 shadow-inner"
                        placeholder="+233..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">Session Date</label>
                      <input type="date" required min={minDate} value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-card border border-border rounded-sm px-4 py-4 text-foreground focus:outline-none focus:border-primary transition-all duration-300 shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">Tell us about your project</label>
                    <textarea value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4}
                      className="w-full bg-card border border-border rounded-sm px-4 py-4 text-foreground focus:outline-none focus:border-primary transition-all duration-300 resize-none placeholder:text-muted-foreground/30 shadow-inner"
                      placeholder="Share your vision, specific requirements, or questions..." />
                  </div>
                  <div className="flex items-center justify-between pt-8 border-t border-border/50">
                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-green-light hover:text-primary transition-colors font-heading text-[10px] tracking-widest uppercase font-bold group">
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK
                    </button>
                    <button onClick={() => setStep(3)} disabled={!formData.name || !formData.email || !formData.date}
                      className="px-12 py-4 bg-primary text-primary-foreground font-heading text-sm font-bold tracking-widest hover:bg-gold-light transition-all rounded-sm disabled:opacity-50 flex items-center gap-3 group shadow-xl">
                      REVIEW ORDER <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                  <div className="bg-card border border-primary/20 rounded-sm overflow-hidden shadow-2xl">
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-heading tracking-[0.3em] text-primary mb-1 uppercase">Selected Production</p>
                          <h3 className="text-2xl font-heading font-bold text-foreground">{selectedService?.title}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-heading tracking-[0.3em] text-muted-foreground mb-1 uppercase">Investment</p>
                          <h3 className="text-2xl font-heading font-bold text-primary">GH₵{selectedService?.price.toLocaleString()}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-border/50">
                        <div>
                          <p className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground mb-1 uppercase font-bold">Client</p>
                          <p className="text-sm font-medium">{formData.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground mb-1 uppercase font-bold">Date</p>
                          <p className="text-sm font-medium">{formData.date}</p>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                          <p className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground mb-1 uppercase font-bold">Contact</p>
                          <p className="text-sm font-medium truncate">{formData.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-sm border border-primary/10 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground mb-1 font-heading tracking-wider">Secure Payment via Paystack</p>
                      <p className="text-[11px] text-green-light leading-relaxed">Your professional session will be confirmed immediately after payment. You can pay via Mobile Money, Bank Transfer, or Debit Card.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button onClick={handleCreateBooking} disabled={submitting}
                      className="w-full py-5 bg-primary text-primary-foreground font-heading text-sm font-bold tracking-widest hover:bg-gold-light transition-all rounded-sm disabled:opacity-50 flex items-center justify-center gap-3 group shadow-2xl hover:shadow-primary/30 active:scale-[0.98]">
                      {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CreditCard className="w-6 h-6" /> PAY NOW & CONFIRM</>}
                    </button>
                    <button onClick={() => setStep(2)} disabled={submitting} className="text-center text-[10px] text-green-light hover:text-primary transition-colors uppercase tracking-[0.3em] font-bold">
                      EDIT INFORMATION
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 lg:py-20 space-y-8">
                  <div className="flex justify-center relative">
                    {verificationResult?.success ? (
                      <>
                        <div className="absolute inset-0 bg-green-bright/20 rounded-full blur-3xl animate-pulse" />
                        <div className="w-24 h-24 bg-green-bright/10 rounded-full flex items-center justify-center relative z-10 border border-green-bright/30">
                          <CheckCircle className="w-14 h-14 text-green-bright" />
                        </div>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4"><Sparkles className="w-8 h-8 text-primary" /></motion.div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-destructive/20 rounded-full blur-3xl" />
                        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center relative z-10 border border-destructive/30">
                          <X className="w-14 h-14 text-destructive" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h2 className="font-heading text-4xl font-bold tracking-tight">
                      {verificationResult?.success ? "Excellence Awaits!" : "Transaction Issue"}
                    </h2>
                    <p className="text-green-light max-w-sm mx-auto leading-relaxed font-medium">
                      {verificationResult?.message}
                    </p>
                  </div>
                  <div className="pt-8">
                    <button onClick={() => { setStep(1); setSelectedServiceId(""); setVerificationResult(null); }}
                      className="px-12 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-heading text-xs font-bold tracking-widest uppercase rounded-sm shadow-xl">
                      {verificationResult?.success ? "BOOK ANOTHER SESSION" : "TRY AGAIN"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          {step < 4 && (
             <aside className="w-full lg:w-80 order-1 lg:order-2">
                <div className="bg-card border border-border rounded-sm p-8 sticky top-32 shadow-xl">
                   <h3 className="font-heading text-xs font-bold tracking-[0.3em] uppercase mb-6 text-primary">Your Selection</h3>
                   {selectedService ? (
                     <div className="space-y-6">
                        <div className="flex gap-4 items-center">
                           <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                              {(() => { const Icon = iconMap[selectedService.icon] || Mic; return <Icon className="w-6 h-6" />; })()}
                           </div>
                           <div>
                              <p className="text-sm font-bold leading-tight">{selectedService.title}</p>
                              <p className="text-xs text-primary font-bold">GH₵{selectedService.price.toLocaleString()}</p>
                           </div>
                        </div>
                        {formData.date && (
                          <div className="flex items-center gap-3 text-xs text-green-light">
                             <CalendarDays className="w-4 h-4" />
                             <span className="font-medium">{new Date(formData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                        )}
                        <div className="pt-6 border-t border-border flex justify-between items-baseline">
                           <span className="text-[10px] font-bold tracking-widest text-muted-foreground">SUBTOTAL</span>
                           <span className="text-lg font-bold">GH₵{selectedService.price.toLocaleString()}</span>
                        </div>
                     </div>
                   ) : (
                     <p className="text-xs text-muted-foreground italic leading-relaxed">Please select a service to begin your creative journey.</p>
                   )}
                </div>
             </aside>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BookingPage;
