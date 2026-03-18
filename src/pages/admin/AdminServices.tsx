import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";
interface Service {
  id: string;
  title: string;
  short_title: string | null;
  description: string | null;
  icon: string;
  price: number;
  sub_services: string[];
  is_active: boolean;
}

const iconOptions = ["Mic", "Radio", "Play", "Camera", "Video"];

const AdminServices = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", short_title: "", description: "", icon: "Mic", price: 0, sub_services: "" });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => apiFetch<Service[]>("/services/all"),
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        short_title: form.short_title,
        description: form.description,
        icon: form.icon,
        price: form.price,
        sub_services: form.sub_services.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editId) {
        await apiFetch(`/services/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/services", { method: "POST", body: JSON.stringify({ ...payload, sort_order: (items?.length || 0) + 1 }) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      resetForm();
      toast.success(editId ? "Service updated" : "Service added");
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/services/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Deleted");
    },
  });

  const resetForm = () => {
    setForm({ title: "", short_title: "", description: "", icon: "Mic", price: 0, sub_services: "" });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (item: Service) => {
    setForm({
      title: item.title,
      short_title: item.short_title || "",
      description: item.description || "",
      icon: item.icon,
      price: item.price,
      sub_services: (item.sub_services || []).join(", "),
    });
    setEditId(item.id);
    setShowForm(true);
  };

  if (isLoading) return <p className="text-green-light">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Services & Pricing</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-gold-light transition-colors">
          {showForm ? <><X className="h-4 w-4" /> CANCEL</> : <><Plus className="h-4 w-4" /> ADD</>}
        </button>
      </div>

      {showForm && (
        <div className="border-2 border-primary/30 rounded-sm p-6 bg-card mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Service Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
            <input placeholder="Short Title (e.g. Audio)" value={form.short_title}
              onChange={(e) => setForm({ ...form, short_title: e.target.value })}
              className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
            <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary">
              {iconOptions.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <textarea placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
            className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary resize-none" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-green-light mb-1 block">Price (GH₵)</label>
              <input type="number" value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-green-light mb-1 block">Sub-services (comma separated)</label>
              <input placeholder="Recording, Mixing, Mastering" value={form.sub_services}
                onChange={(e) => setForm({ ...form, sub_services: e.target.value })}
                className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <button onClick={() => upsert.mutate()} disabled={!form.title}
            className="px-6 py-2 bg-green text-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-green-light transition-colors disabled:opacity-50">
            {editId ? "UPDATE" : "SAVE"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items?.map((item) => (
          <div key={item.id} className="border-2 border-green/40 rounded-sm p-5 bg-card flex items-center justify-between group">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-heading text-sm font-bold text-foreground">{item.title}</h3>
                <span className="text-xs text-primary font-heading">GH₵{item.price.toLocaleString()}</span>
                {!item.is_active && <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">INACTIVE</span>}
              </div>
              <p className="text-xs text-muted-foreground">{(item.sub_services || []).join(" · ")}</p>
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

export default AdminServices;
