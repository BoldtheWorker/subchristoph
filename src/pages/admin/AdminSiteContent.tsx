import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Save } from "lucide-react";
import type { SiteContent } from "@/integrations/supabase/types";

const sections = [
  { id: "homepage", label: "Homepage Stats" },
  { id: "about", label: "About Page" },
  { id: "contact", label: "Contact Info" },
];

const AdminSiteContent = () => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("homepage");

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-site-content"],
    queryFn: () => apiFetch<SiteContent[]>("/site-content"),
  });

  const updateContent = useMutation({
    mutationFn: async ({ section, key, value }: { section: string; key: string; value: string }) => {
      await apiFetch("/site-content", { method: "PATCH", body: JSON.stringify({ section, key, value }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
      toast.success("Content saved");
    },
    onError: (e) => toast.error(e.message),
  });

  const sectionContent = content?.filter((c) => c.section === activeSection) || [];

  const labelMap: Record<string, string> = {
    stat_1_value: "Stat 1 Value", stat_1_label: "Stat 1 Label",
    stat_2_value: "Stat 2 Value", stat_2_label: "Stat 2 Label",
    stat_3_value: "Stat 3 Value", stat_3_label: "Stat 3 Label",
    stat_4_value: "Stat 4 Value", stat_4_label: "Stat 4 Label",
    story_title: "Story Title", story_p1: "Story Paragraph 1", story_p2: "Story Paragraph 2",
    mission: "Mission Statement", vision: "Vision Statement",
    contact_email: "Contact Email", contact_phone: "Contact Phone", contact_location: "Studio Location",
  };

  if (isLoading) return <p className="text-green-light">Loading...</p>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Site Content</h1>

      <div className="flex gap-2 mb-6">
        {sections.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 font-heading text-xs tracking-widest rounded-sm transition-colors ${
              activeSection === s.id ? "bg-primary text-primary-foreground" : "border border-green/40 text-green-light hover:border-primary"
            }`}>
            {s.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {sectionContent.map((item) => (
          <ContentField
            key={item.id}
            label={labelMap[item.key] || item.key}
            value={item.value}
            isLong={item.key.includes("_p") || item.key === "mission" || item.key === "vision"}
            onSave={(value) => updateContent.mutate({ section: item.section, key: item.key, value })}
          />
        ))}
      </div>
    </div>
  );
};

const ContentField = ({ label, value, isLong, onSave }: { label: string; value: string; isLong: boolean; onSave: (v: string) => void }) => {
  const [val, setVal] = useState(value);
  const changed = val !== value;

  return (
    <div className="border-2 border-green/40 rounded-sm p-4 bg-card">
      <label className="text-xs text-green-light font-heading tracking-widest mb-2 block">{label.toUpperCase()}</label>
      {isLong ? (
        <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3}
          className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary resize-none" />
      ) : (
        <input value={val} onChange={(e) => setVal(e.target.value)}
          className="w-full bg-background border-2 border-green/40 rounded-sm px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
      )}
      {changed && (
        <button onClick={() => onSave(val)}
          className="mt-2 flex items-center gap-2 px-4 py-1.5 bg-green text-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-green-light transition-colors">
          <Save className="h-3 w-3" /> SAVE
        </button>
      )}
    </div>
  );
};

export default AdminSiteContent;
