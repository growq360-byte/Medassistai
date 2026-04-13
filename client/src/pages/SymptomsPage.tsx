import { FormEvent, useEffect, useState } from "react";
import { AlertOctagon, Loader2 } from "lucide-react";
import clsx from "clsx";
import PageHeader from "../components/PageHeader";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { api, ApiError } from "../lib/api";
import type { SymptomAssessment, Urgency } from "../types";

const URGENCY_STYLES: Record<Urgency, string> = {
  LOW: "bg-emerald-100 text-emerald-800 border-emerald-200",
  MODERATE: "bg-amber-100 text-amber-800 border-amber-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  EMERGENCY: "bg-red-100 text-red-800 border-red-200",
};

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SymptomAssessment[]>([]);

  const loadHistory = async () => {
    const data = await api.get<{ history: SymptomAssessment[] }>(
      "/symptoms/history",
    );
    setHistory(data.history);
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const list = symptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post<{ assessment: SymptomAssessment }>("/symptoms/assess", {
        symptoms: list,
        severity,
        duration,
        notes: notes || undefined,
      });
      setSymptoms("");
      setDuration("");
      setNotes("");
      await loadHistory();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Assessment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Symptom checker"
        description="Share how you're feeling and MedAssist will provide general guidance."
      />
      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Symptoms (comma-separated)</label>
            <input
              className="input"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. headache, fatigue, mild fever"
              required
            />
          </div>
          <div>
            <label className="label">Severity</label>
            <select
              className="input"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as typeof severity)}
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
          <div>
            <label className="label">Duration</label>
            <input
              className="input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 2 days, since this morning"
              required
            />
          </div>
          <div>
            <label className="label">Additional notes (optional)</label>
            <textarea
              className="input min-h-[90px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else to share with the assistant?"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Assessing…
              </>
            ) : (
              "Get assessment"
            )}
          </button>
        </form>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">History</h2>
          {history.length === 0 && (
            <div className="card text-sm text-slate-500">
              No assessments yet. Submit one on the left to get started.
            </div>
          )}
          {history.map((item) => (
            <div key={item.id} className="card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">
                  {item.symptoms.join(", ")}
                </div>
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
                    URGENCY_STYLES[item.urgency],
                  )}
                >
                  {item.urgency === "EMERGENCY" && <AlertOctagon size={12} />}
                  {item.urgency}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {item.severity} · {item.duration} ·{" "}
                {new Date(item.createdAt).toLocaleString()}
              </div>
              <div className="whitespace-pre-wrap text-sm text-slate-700">
                {item.aiAssessment}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
