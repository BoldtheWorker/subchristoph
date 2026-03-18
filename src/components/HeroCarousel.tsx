import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

import studioImg from "@/assets/carousel-studio.jpg";
import podcastImg from "@/assets/carousel-podcast.jpg";
import livestreamImg from "@/assets/carousel-livestream.jpg";
import photographyImg from "@/assets/carousel-photography.jpg";

interface SlideData {
  id: string;
  image_url: string;
  label: string;
  heading: string;
  description: string;
  cta_text: string;
  cta_link: string;
  secondary_text: string;
  secondary_link: string;
}

const fallbackSlides = [
  {
    image_url: studioImg,
    label: "AUDIO PRODUCTION",
    heading: "Where Creative|Vision Meets|Precision.",
    description: "Premium audio recording, mixing, mastering, and beat production in Lagos, Nigeria.",
    cta_text: "BOOK A SESSION", cta_link: "/booking",
    secondary_text: "EXPLORE SERVICES", secondary_link: "/services",
  },
  {
    image_url: podcastImg,
    label: "PODCAST STUDIO",
    heading: "Your Voice.|Your Story.|Amplified.",
    description: "Professional podcast recording, editing, branding, and distribution — all under one roof.",
    cta_text: "START YOUR PODCAST", cta_link: "/booking",
    secondary_text: "LEARN MORE", secondary_link: "/services",
  }
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const { data: remoteSlides, isLoading } = useQuery({
    queryKey: ["homepage-carousel"],
    queryFn: () => apiFetch<SlideData[]>("/api/carousel"),
  });

  const slides = remoteSlides?.length ? remoteSlides : fallbackSlides;

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (isLoading) return (
    <div className="h-[100vh] flex items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  const slide = slides[current];
  const headingLines = slide.heading.split("|");

  const imageVariants = {
    enter: (dir: number) => ({ opacity: 0, scale: 1.1, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } },
    exit: (dir: number) => ({ opacity: 0, scale: 0.98, x: dir > 0 ? -60 : 60, transition: { duration: 0.5 } }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 40 },
    center: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Background images */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={slide.image_url}
            alt={slide.label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="max-w-2xl"
          >
            <p className="font-heading text-xs tracking-[0.4em] text-primary mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-primary" />
              {slide.label}
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] text-foreground mb-6">
              {headingLines.map((line, i) => (
                <span key={i} className="block">
                  {i === headingLines.length - 1 ? (
                    <span className="text-primary">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h1>
            <p className="text-base md:text-lg text-green-light max-w-lg mb-10 leading-relaxed">
              {slide.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={slide.cta_link}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-primary-foreground font-heading text-sm font-bold tracking-widest hover:bg-gold-light transition-all duration-300 rounded-sm hover:shadow-[0_0_30px_hsl(var(--gold)/0.3)]"
              >
                {slide.cta_text}
              </Link>
              <Link
                to={slide.secondary_link}
                className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-green-light/40 text-green-light font-heading text-sm font-bold tracking-widest hover:bg-green/20 hover:border-primary/60 transition-all duration-300 rounded-sm"
              >
                {slide.secondary_text}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="absolute bottom-8 right-6 md:right-12 z-20 flex items-center gap-3">
        <button
          onClick={prev}
          className="w-11 h-11 border border-foreground/20 rounded-full flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors backdrop-blur-sm bg-background/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="w-11 h-11 border border-foreground/20 rounded-full flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors backdrop-blur-sm bg-background/20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative h-3 flex items-center"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span
              className={`block h-[2px] rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-primary"
                  : "w-3 bg-foreground/30 group-hover:bg-foreground/60"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-8 left-6 md:left-12 z-20 font-heading text-xs tracking-widest text-foreground/40">
        <span className="text-primary font-bold">{String(current + 1).padStart(2, "0")}</span>
        <span className="mx-1">/</span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
};

export default HeroCarousel;
