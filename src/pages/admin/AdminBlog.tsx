import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff, Pencil, X, ImagePlus } from "lucide-react";
import { format } from "date-fns";
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  created_at: string;
}

const AdminBlog = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", excerpt: "", category: "", cover_image_url: "" });
  const [uploading, setUploading] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => apiFetch<BlogPost[]>("/blog"),
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const payload = { ...form, slug };
      if (editId) {
        await apiFetch(`/blog/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/blog", { method: "POST", body: JSON.stringify(payload) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      resetForm();
      toast.success(editId ? "Post updated" : "Post created");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      await apiFetch(`/blog/${id}`, { method: "PATCH", body: JSON.stringify({ is_published }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success("Post updated");
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/blog/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success("Post deleted");
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
      setForm({ ...form, cover_image_url: fullUrl });
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", slug: "", content: "", excerpt: "", category: "", cover_image_url: "" });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      category: post.category || "",
      cover_image_url: post.cover_image_url || "",
    });
    setEditId(post.id);
    setShowForm(true);
  };

  if (isLoading) return <p className="text-green-light">Loading posts...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Blog Posts</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-gold-light transition-colors">
          {showForm ? <><X className="h-4 w-4" /> CANCEL</> : <><Plus className="h-4 w-4" /> NEW POST</>}
        </button>
      </div>

      {showForm && (
        <div className="border-2 border-primary/30 rounded-sm p-6 bg-card mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Post Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
            <input placeholder="Category" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
          </div>
          <input placeholder="Excerpt (short summary)" value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />

          {/* Cover Image Upload */}
          <div>
            <label className="text-xs text-green-light font-heading tracking-widest mb-2 block">COVER IMAGE</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-green/40 rounded-sm cursor-pointer hover:border-primary transition-colors">
                <ImagePlus className="h-4 w-4 text-green-light" />
                <span className="text-sm text-green-light">{uploading ? "Uploading..." : "Upload Image"}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {form.cover_image_url && (
                <div className="relative">
                  <img src={form.cover_image_url} alt="Cover" className="h-20 w-32 object-cover rounded-sm border border-green/40" />
                  <button onClick={() => setForm({ ...form, cover_image_url: "" })}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <textarea placeholder="Content (supports plain text)" value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10}
            className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary resize-none" />
          <button onClick={() => upsert.mutate()} disabled={!form.title || !form.content}
            className="px-6 py-2 bg-green text-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-green-light transition-colors disabled:opacity-50">
            {editId ? "UPDATE POST" : "SAVE POST"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {posts?.map((post) => (
          <div key={post.id} className="border-2 border-green/40 rounded-sm p-5 bg-card flex items-start gap-4 group">
            {post.cover_image_url && (
              <img src={post.cover_image_url} alt={post.title} className="w-20 h-14 object-cover rounded-sm border border-green/40 shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-heading text-sm font-bold text-foreground">{post.title}</h3>
                {post.is_published ? (
                  <span className="text-[10px] font-heading tracking-widest text-green-bright bg-green/20 px-2 py-0.5 rounded-sm">PUBLISHED</span>
                ) : (
                  <span className="text-[10px] font-heading tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">DRAFT</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {post.category && <span className="text-primary mr-2">{post.category}</span>}
                {format(new Date(post.created_at), "MMM d, yyyy")}
              </p>
              {post.excerpt && <p className="text-xs text-green-light mt-1 line-clamp-1">{post.excerpt}</p>}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => startEdit(post)} className="p-2 text-green-light hover:text-primary transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => togglePublish.mutate({ id: post.id, is_published: !post.is_published })}
                className="p-2 text-green-light hover:text-primary transition-colors"
                title={post.is_published ? "Unpublish" : "Publish"}>
                {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button onClick={() => deletePost.mutate(post.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBlog;
