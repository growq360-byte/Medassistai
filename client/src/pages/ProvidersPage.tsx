import { FormEvent, useEffect, useMemo, useState } from "react";
import { Mail, Phone, Search, UserRound } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { api, ApiError } from "../lib/api";
import type { Provider } from "../types";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Provider | null>(null);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");

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

  const specialties = useMemo(
    () => [...new Set(providers.map((p) => p.specialty))].sort(),
    [providers],
  );

  const filtered = useMemo(() => {
    let list = providers;
    if (specialty) list = list.filter((p) => p.specialty === specialty);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q),
      );
    }
    return list;
  }, [providers, specialty, search]);

  return (
    <div className="p-8">
      <PageHeader
        title="Providers"
        description="Browse our clinicians and book an appointment."
      />

      {/* Search & filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, specialty, or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-full sm:w-48"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          <option value="">All specialties</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-sm text-slate-500">
          No providers match your search. Try a different filter.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
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
