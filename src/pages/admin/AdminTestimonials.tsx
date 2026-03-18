import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Star, Pencil, X } from "lucide-react";
import type { Testimonial } from "@/integrations/supabase/types";

const AdminTestimonials = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ client_name: "", client_role: "", content: "", rating: 5 });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => apiFetch<Testimonial[]>("/testimonials"),
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editId) {
        await apiFetch(`/testimonials/${editId}`, { method: "PATCH", body: JSON.stringify(form) });
      } else {
        await apiFetch("/testimonials", { method: "POST", body: JSON.stringify({ ...form, sort_order: (items?.length || 0) + 1 }) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      resetForm();
      toast.success(editId ? "Testimonial updated" : "Testimonial added");
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/testimonials/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast.success("Deleted");
    },
  });

  const resetForm = () => {
    setForm({ client_name: "", client_role: "", content: "", rating: 5 });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (item: Testimonial) => {
    setForm({ client_name: item.client_name, client_role: item.client_role || "", content: item.content, rating: item.rating });
    setEditId(item.id);
    setShowForm(true);
  };

  if (isLoading) return <p className="text-green-light">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Testimonials</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-gold-light transition-colors">
          {showForm ? <><X className="h-4 w-4" /> CANCEL</> : <><Plus className="h-4 w-4" /> ADD</>}
        </button>
      </div>

      {showForm && (
        <div className="border-2 border-primary/30 rounded-sm p-6 bg-card mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Client Name" value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
            <input placeholder="Role / Title" value={form.client_role}
              onChange={(e) => setForm({ ...form, client_role: e.target.value })}
              className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
          </div>
          <textarea placeholder="Testimonial content" value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3}
            className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary resize-none" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-light">Rating:</span>
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}>
                <Star className={`h-5 w-5 ${r <= form.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <button onClick={() => upsert.mutate()} disabled={!form.client_name || !form.content}
            className="px-6 py-2 bg-green text-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-green-light transition-colors disabled:opacity-50">
            {editId ? "UPDATE" : "SAVE"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items?.map((item) => (
          <div key={item.id} className="border-2 border-green/40 rounded-sm p-5 bg-card flex items-center justify-between group">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading text-sm font-bold text-foreground">{item.client_name}</h3>
                <span className="text-xs text-muted-foreground">· {item.client_role}</span>
              </div>
              <p className="text-sm text-green-light italic">"{item.content}"</p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(item)} className="p-2 text-green-light hover:text-primary transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove.mutate(item.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;
