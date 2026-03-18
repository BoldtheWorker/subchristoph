import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Eye, EyeOff } from "lucide-react";
import type { FaqItem } from "@/integrations/supabase/types";

const AdminFAQ = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: "", answer: "" });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-faq"],
    queryFn: () => apiFetch<FaqItem[]>("/faq"),
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editId) {
        await apiFetch(`/faq/${editId}`, { method: "PATCH", body: JSON.stringify(form) });
      } else {
        await apiFetch("/faq", { method: "POST", body: JSON.stringify({ ...form, sort_order: (items?.length || 0) + 1 }) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      resetForm();
      toast.success(editId ? "FAQ updated" : "FAQ added");
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/faq/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      toast.success("Deleted");
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      await apiFetch(`/faq/${id}`, { method: "PATCH", body: JSON.stringify({ is_published }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      toast.success("Updated");
    },
  });

  const resetForm = () => {
    setForm({ question: "", answer: "" });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (item: FaqItem) => {
    setForm({ question: item.question, answer: item.answer });
    setEditId(item.id);
    setShowForm(true);
  };

  if (isLoading) return <p className="text-green-light">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">FAQ Management</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-gold-light transition-colors">
          {showForm ? <><X className="h-4 w-4" /> CANCEL</> : <><Plus className="h-4 w-4" /> ADD</>}
        </button>
      </div>

      {showForm && (
        <div className="border-2 border-primary/30 rounded-sm p-6 bg-card mb-6 space-y-4">
          <input placeholder="Question" value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
          <textarea placeholder="Answer" value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4}
            className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary resize-none" />
          <button onClick={() => upsert.mutate()} disabled={!form.question || !form.answer}
            className="px-6 py-2 bg-green text-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-green-light transition-colors disabled:opacity-50">
            {editId ? "UPDATE" : "SAVE"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items?.map((item) => (
          <div key={item.id} className="border-2 border-green/40 rounded-sm p-5 bg-card flex items-center justify-between group">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading text-sm font-bold text-foreground">{item.question}</h3>
                {!item.is_published && <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">HIDDEN</span>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.answer}</p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => togglePublish.mutate({ id: item.id, is_published: !item.is_published })}
                className="p-2 text-green-light hover:text-primary transition-colors">
                {item.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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

export default AdminFAQ;
