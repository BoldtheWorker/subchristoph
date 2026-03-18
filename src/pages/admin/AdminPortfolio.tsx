import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
}

const categories = ["Audio", "Podcast", "Livestream", "Photography", "Video"];

const AdminPortfolio = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "Audio", image_url: "" });
  const [uploading, setUploading] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: () => apiFetch<PortfolioItem[]>("/portfolio"),
  });

  const createItem = useMutation({
    mutationFn: async (item: typeof form) => {
      await apiFetch("/portfolio", { method: "POST", body: JSON.stringify(item) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      setShowForm(false);
      setForm({ title: "", description: "", category: "Audio", image_url: "" });
      toast.success("Portfolio item added");
    },
    onError: () => toast.error("Failed to add item"),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/portfolio/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast.success("Item deleted");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { url } = await apiFetch<{ url: string }>("/upload", {
        method: "POST",
        body: formData,
      });
      const fullUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}${url}` : `http://localhost:3001${url}`;
      setForm({ ...form, image_url: fullUrl });
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (item: PortfolioItem) => {
    setForm({ title: item.title, description: item.description || "", category: item.category, image_url: item.image_url || "" });
    setEditId(item.id);
    setShowForm(true);
  };

  if (isLoading) return <p className="text-green-light">Loading portfolio...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Portfolio</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-gold-light transition-colors"
        >
          <Plus className="h-4 w-4" /> ADD ITEM
        </button>
      </div>

      {showForm && (
        <div className="border-2 border-primary/30 rounded-sm p-6 bg-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary mb-4 resize-none"
          />
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 px-4 py-2 border-2 border-green/40 rounded-sm cursor-pointer hover:border-primary transition-colors">
              <span className="text-sm text-green-light">{uploading ? "Uploading..." : "Upload Image"}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.image_url && (
              <img src={form.image_url} alt="Preview" className="h-16 w-16 object-cover rounded-sm border border-green/40" />
            )}
          </div>
          <button
            onClick={() => createItem.mutate(form)}
            disabled={!form.title}
            className="px-6 py-2 bg-green text-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-green-light transition-colors disabled:opacity-50"
          >
            SAVE ITEM
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item) => (
          <div key={item.id} className="border-2 border-green/40 rounded-sm p-4 bg-card group">
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover rounded-sm mb-3" />
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-sm font-bold text-foreground">{item.title}</h3>
                <p className="text-xs text-primary">{item.category}</p>
              </div>
              <button
                onClick={() => deleteItem.mutate(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPortfolio;
