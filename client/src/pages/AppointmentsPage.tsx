import { useEffect, useState } from "react";
import { CalendarX, Clock, Stethoscope } from "lucide-react";
import clsx from "clsx";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import type { Appointment, AppointmentStatus } from "../types";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-brand-100 text-brand-800",
};

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await api.get<{ appointments: Appointment[] }>("/appointments");
    setItems(data.appointments);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cancel = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    await api.delete(`/appointments/${id}`);
    await load();
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Appointments"
        description="Your upcoming and past visits."
      />
      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="card text-sm text-slate-500">
          No appointments yet. Browse providers to book one.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Stethoscope size={20} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-slate-900">
                    {a.provider.name}
                  </div>
                  <div className="text-sm text-brand-700">
                    {a.provider.specialty}
                  </div>
                  <span
                    className={clsx(
                      "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
                      STATUS_STYLES[a.status],
                    )}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                  <Clock size={14} />
                  {new Date(a.scheduledAt).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-slate-700">{a.reason}</div>
                {a.notes && (
                  <div className="mt-1 text-xs text-slate-500">{a.notes}</div>
                )}
                {a.status !== "CANCELLED" && a.status !== "COMPLETED" && (
                  <button
                    onClick={() => cancel(a.id)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                  >
                    <CalendarX size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
