import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Booking } from "@/integrations/supabase/types";

const statusColors: Record<string, string> = {
  pending_payment: "bg-gold-muted text-primary border-primary/30",
  paid: "bg-green/20 text-green-bright border-green/40",
  confirmed: "bg-green/30 text-green-light border-green-light/40",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const AdminBookings = () => {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => apiFetch<Booking[]>("/bookings"),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Record<string, unknown> = { status };
      if (notes !== undefined) updates.admin_notes = notes;
      await apiFetch(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking updated");
    },
    onError: () => toast.error("Failed to update booking"),
  });


  if (isLoading) return <p className="text-green-light">Loading bookings...</p>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Bookings</h1>

      {!bookings?.length ? (
        <p className="text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border-2 border-green/40 rounded-sm p-6 bg-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">{booking.client_name}</h3>
                  <p className="text-sm text-green-light">{booking.client_email} · {booking.client_phone}</p>
                </div>
                <span className={`text-xs font-heading tracking-widest px-3 py-1 rounded-sm border ${statusColors[booking.status] || ""}`}>
                  {booking.status.toUpperCase().replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="text-foreground font-medium">{booking.service}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="text-foreground font-medium">{format(new Date(booking.preferred_date), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="text-foreground font-medium">{booking.amount_kobo ? `GH₵${(booking.amount_kobo / 100).toLocaleString()}` : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reference</p>
                  <p className="text-foreground font-medium text-xs">{booking.paystack_reference || "—"}</p>
                </div>
              </div>

              {booking.message && (
                <p className="text-sm text-muted-foreground mb-4 italic">"{booking.message}"</p>
              )}

              {(booking.status === "paid") && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus.mutate({ id: booking.id, status: "confirmed" })}
                    className="px-4 py-2 bg-green text-foreground font-heading text-xs tracking-widest rounded-sm hover:bg-green-light transition-colors"
                  >
                    CONFIRM
                  </button>
                  <button
                    onClick={() => updateStatus.mutate({ id: booking.id, status: "rejected" })}
                    className="px-4 py-2 border border-destructive text-destructive font-heading text-xs tracking-widest rounded-sm hover:bg-destructive/10 transition-colors"
                  >
                    REJECT
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
