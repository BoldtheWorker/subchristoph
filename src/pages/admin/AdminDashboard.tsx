import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Image, FileText, LogOut, MessageSquare, Wrench, HelpCircle, Globe, Menu, X } from "lucide-react";
import AdminBookings from "./AdminBookings";
import AdminPortfolio from "./AdminPortfolio";
import AdminBlog from "./AdminBlog";
import AdminTestimonials from "./AdminTestimonials";
import AdminServices from "./AdminServices";
import AdminFAQ from "./AdminFAQ";
import AdminSiteContent from "./AdminSiteContent";
import AdminCarousel from "./AdminCarousel";

const tabs = [
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "portfolio", label: "Portfolio", icon: Image },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "services", label: "Services", icon: Wrench },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "content", label: "Site Content", icon: Globe },
  { id: "carousel", label: "Hero Carousel", icon: Image },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const selectTab = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-green-muted border-b border-green/40 px-4 py-3 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Christoph<span className="text-primary">.</span>
        </h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-foreground">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 border-r-2 border-green/40 bg-green-muted p-6 flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} pt-16 lg:pt-6`}>
        <div className="mb-8 hidden lg:block">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Christoph<span className="text-primary">.</span>
          </h2>
          <p className="text-xs text-green-light mt-1">Admin Dashboard</p>
        </div>

        <nav className="space-y-1 flex-1 overflow-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-heading font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-green/30 text-primary border border-primary/30"
                  : "text-green-light hover:bg-green/20 hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <button onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-sm font-heading text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-background/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto mt-14 lg:mt-0">
        {activeTab === "bookings" && <AdminBookings />}
        {activeTab === "portfolio" && <AdminPortfolio />}
        {activeTab === "blog" && <AdminBlog />}
        {activeTab === "testimonials" && <AdminTestimonials />}
        {activeTab === "services" && <AdminServices />}
        {activeTab === "faq" && <AdminFAQ />}
        { activeTab === "content" && <AdminSiteContent />}
        { activeTab === "carousel" && <AdminCarousel />}
      </main>
    </div>
  );
};

export default AdminDashboard;
