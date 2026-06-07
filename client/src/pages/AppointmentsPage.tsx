import { FormEvent, useEffect, useState } from "react";
import { CalendarClock, CalendarX, Clock, Stethoscope } from "lucide-react";
import clsx from "clsx";
import PageHeader from "../components/PageHeader";
import { api, ApiError } from "../lib/api";
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
  const [error, setError] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api.get<{ appointments: Appointment[] }>("/appointments");
      setItems(data.appointments);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load appointments");
    }
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
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
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
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => setRescheduleId(a.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      <CalendarClock size={14} /> Reschedule
                    </button>
                    <button
                      onClick={() => cancel(a.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                    >
                      <CalendarX size={14} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rescheduleId && (
        <RescheduleModal
          appointmentId={rescheduleId}
          onClose={() => setRescheduleId(null)}
          onDone={async () => {
            setRescheduleId(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function RescheduleModal({
  appointmentId,
  onClose,
  onDone,
}: {
  appointmentId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.patch(`/appointments/${appointmentId}`, {
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reschedule failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Reschedule appointment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New date & time</label>
            <input
              type="datetime-local"
              className="input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
