import { FormEvent, useEffect, useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { api, ApiError } from "../lib/api";
import type { Provider } from "../types";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Provider | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ providers: Provider[] }>("/providers");
        setProviders(data.providers);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-8">
      <PageHeader
        title="Providers"
        description="Browse our clinicians and book an appointment."
      />
      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <div key={p.id} className="card flex flex-col">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <UserRound size={22} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-sm text-brand-700">{p.specialty}</div>
                </div>
              </div>
              <p className="mb-4 text-sm text-slate-600">{p.bio}</p>
              <div className="mb-4 space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Mail size={12} />
                  {p.email}
                </div>
                {p.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={12} />
                    {p.phone}
                  </div>
                )}
              </div>
              <button
                onClick={() => setBooking(p)}
                className="btn-primary mt-auto"
              >
                Book appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {booking && (
        <BookingModal provider={booking} onClose={() => setBooking(null)} />
      )}
    </div>
  );
}

function BookingModal({
  provider,
  onClose,
}: {
  provider: Provider;
  onClose: () => void;
}) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/appointments", {
        providerId: provider.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        reason,
        notes: notes || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Booking failed");
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
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Book with {provider.name}
        </h2>
        <p className="mb-4 text-sm text-slate-600">{provider.specialty}</p>

        {done ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Appointment requested. Check the Appointments page for status.
            </div>
            <button onClick={onClose} className="btn-primary w-full">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Date & time</label>
              <input
                type="datetime-local"
                className="input"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Reason for visit</label>
              <input
                className="input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                className="input min-h-[80px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button className="btn-primary" disabled={submitting}>
                {submitting ? "Booking…" : "Confirm booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
