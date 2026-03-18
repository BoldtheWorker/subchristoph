import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, ImagePlus, Eye, EyeOff, MoveUp, MoveDown } from "lucide-react";

interface CarouselSlide {
  id: string;
  image_url: string;
  label: string;
  heading: string;
  description: string;
  cta_text: string;
  cta_link: string;
  secondary_text: string;
  secondary_link: string;
  sort_order: number;
  is_published: boolean;
}

const AdminCarousel = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    label: "",
    heading: "",
    description: "",
    image_url: "",
    cta_text: "BOOK A SESSION",
    cta_link: "/booking",
    secondary_text: "EXPLORE SERVICES",
    secondary_link: "/services",
    sort_order: 0,
  });

  const { data: slides, isLoading } = useQuery({
    queryKey: ["admin-carousel"],
    queryFn: () => apiFetch<CarouselSlide[]>("/api/carousel/all"),
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editId) {
        await apiFetch(`/api/carousel/${editId}`, { method: "PATCH", body: JSON.stringify(form) });
      } else {
        await apiFetch("/api/carousel", { method: "POST", body: JSON.stringify({ ...form, sort_order: (slides?.length || 0) + 1 }) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      resetForm();
      toast.success(editId ? "Slide updated" : "Slide created");
    },
    onError: (e: Error) => toast.error(`Error: ${e.message}`),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/carousel/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      toast.success("Slide deleted");
    },
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, is_published }: { id: string, is_published: boolean }) => 
      apiFetch(`/api/carousel/${id}`, { method: "PATCH", body: JSON.stringify({ is_published }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-carousel"] }),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { url } = await apiFetch<{ url: string }>("/api/upload", {
        method: "POST",
        body: formData,
      });
      const API_BASE = import.meta.env.VITE_API_URL || "";
      setForm({ ...form, image_url: `${API_BASE}${url}` });
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      label: "",
      heading: "",
      description: "",
      image_url: "",
      cta_text: "BOOK A SESSION",
      cta_link: "/booking",
      secondary_text: "EXPLORE SERVICES",
      secondary_link: "/services",
      sort_order: 0,
    });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (slide: CarouselSlide) => {
    setForm({
      label: slide.label,
      heading: slide.heading,
      description: slide.description,
      image_url: slide.image_url,
      cta_text: slide.cta_text,
      cta_link: slide.cta_link,
      secondary_text: slide.secondary_text,
      secondary_link: slide.secondary_link,
      sort_order: slide.sort_order,
    });
    setEditId(slide.id);
    setShowForm(true);
  };

  if (isLoading) return <p className="text-primary animate-pulse">Loading slides...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">Hero Carousel</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-gold-light transition-colors"
        >
          {showForm ? <><X className="h-4 w-4" /> CANCEL</> : <><Plus className="h-4 w-4" /> ADD SLIDE</>}
        </button>
      </div>

      {showForm && (
        <div className="border-2 border-primary/20 rounded-sm p-6 bg-card space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">Label</label>
              <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors"
                placeholder="e.g. AUDIO PRODUCTION" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">Heading (use | for line breaks)</label>
              <input value={form.heading} onChange={e => setForm({ ...form, heading: e.target.value })}
                className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors"
                placeholder="Where Creative|Vision Meets|Precision" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors h-24 resize-none"
              placeholder="Keep it concise and impactful" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-primary">
              <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">Primary CTA (Text | Link)</label>
              <div className="flex gap-2">
                <input value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-xs outline-none" placeholder="Text" />
                <input value={form.cta_link} onChange={e => setForm({ ...form, cta_link: e.target.value })} className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-xs outline-none" placeholder="Link" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase">Secondary CTA (Text | Link)</label>
              <div className="flex gap-2">
                <input value={form.secondary_text} onChange={e => setForm({ ...form, secondary_text: e.target.value })} className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-xs outline-none" placeholder="Text" />
                <input value={form.secondary_link} onChange={e => setForm({ ...form, secondary_link: e.target.value })} className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-xs outline-none" placeholder="Link" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-heading tracking-[0.2em] text-muted-foreground uppercase mb-2 block">Background Image</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-primary/50 transition-colors">
                <ImagePlus className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{uploading ? "Uploading..." : "Click to upload"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {form.image_url && (
                <div className="relative group">
                  <img src={form.image_url} alt="Preview" className="h-20 w-32 object-cover rounded-sm border border-border" />
                  <button onClick={() => setForm({ ...form, image_url: "" })}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => upsert.mutate()}
            disabled={!form.image_url || !form.heading}
            className="w-full py-3 bg-green text-foreground font-heading text-xs font-bold tracking-widest rounded-sm hover:bg-green-light transition-colors disabled:opacity-50"
          >
            {editId ? "UPDATE SLIDE" : "CREATE SLIDE"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {slides?.map((slide, i) => (
          <div key={slide.id} className="group border border-border rounded-sm p-4 bg-card hover:border-primary/40 transition-all flex items-center gap-6">
            <div className="relative w-40 h-24 overflow-hidden rounded-sm border border-border shrink-0">
              <img src={slide.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-heading text-sm font-bold text-foreground truncate">{slide.heading.replace(/\|/g, " ")}</h3>
                {!slide.is_published && (
                  <span className="flex items-center gap-1 text-[8px] font-heading tracking-[0.2em] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    <EyeOff className="h-2.5 w-2.5" /> DRAFT
                  </span>
                )}
              </div>
              <p className="text-[10px] text-primary font-heading tracking-widest uppercase mb-1">{slide.label}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{slide.description}</p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => toggleStatus.mutate({ id: slide.id, is_published: !slide.is_published })}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title={slide.is_published ? "Unpublish" : "Publish"}
              >
                {slide.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => startEdit(slide)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove.mutate(slide.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {slides?.length === 0 && !showForm && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-sm">
            <p className="text-muted-foreground text-sm">No carousel slides found.</p>
            <button onClick={() => setShowForm(true)} className="text-primary hover:text-gold-light font-bold text-xs mt-2 transition-colors">Create your first slide</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCarousel;
