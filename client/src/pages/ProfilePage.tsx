import { FormEvent, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { api, ApiError } from "../lib/api";
import type { PatientProfile } from "../types";

export default function ProfilePage() {
  const [form, setForm] = useState({
    dateOfBirth: "",
    sex: "",
    bloodType: "",
    heightCm: "",
    weightKg: "",
    allergies: "",
    medications: "",
    conditions: "",
    emergencyContact: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ profile: PatientProfile }>("/patients/me");
        setForm({
          dateOfBirth: data.profile.dateOfBirth
            ? data.profile.dateOfBirth.slice(0, 10)
            : "",
          sex: data.profile.sex ?? "",
          bloodType: data.profile.bloodType ?? "",
          heightCm: data.profile.heightCm?.toString() ?? "",
          weightKg: data.profile.weightKg?.toString() ?? "",
          allergies: data.profile.allergies.join(", "),
          medications: data.profile.medications.join(", "),
          conditions: data.profile.conditions.join(", "),
          emergencyContact: data.profile.emergencyContact ?? "",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const payload = {
        dateOfBirth: form.dateOfBirth
          ? new Date(form.dateOfBirth).toISOString()
          : null,
        sex: form.sex || null,
        bloodType: form.bloodType || null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        allergies: splitList(form.allergies),
        medications: splitList(form.medications),
        conditions: splitList(form.conditions),
        emergencyContact: form.emergencyContact || null,
      };
      await api.put<{ profile: PatientProfile }>("/patients/me", payload);
      setMessage({ kind: "ok", text: "Profile updated." });
    } catch (err) {
      setMessage({
        kind: "err",
        text: err instanceof ApiError ? err.message : "Update failed",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading…</div>;

  return (
    <div className="p-8">
      <PageHeader
        title="Patient profile"
        description="Kept private to you. Used to personalize AI responses."
      />
      <form onSubmit={handleSubmit} className="card max-w-3xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" type="date" value={form.dateOfBirth}
            onChange={(v) => setForm({ ...form, dateOfBirth: v })} />
          <Field label="Sex" value={form.sex}
            onChange={(v) => setForm({ ...form, sex: v })} placeholder="female / male / other" />
          <Field label="Blood type" value={form.bloodType}
            onChange={(v) => setForm({ ...form, bloodType: v })} placeholder="O+, A-, ..." />
          <Field label="Height (cm)" type="number" value={form.heightCm}
            onChange={(v) => setForm({ ...form, heightCm: v })} />
          <Field label="Weight (kg)" type="number" value={form.weightKg}
            onChange={(v) => setForm({ ...form, weightKg: v })} />
          <Field label="Emergency contact" value={form.emergencyContact}
            onChange={(v) => setForm({ ...form, emergencyContact: v })} />
        </div>
        <Field label="Allergies (comma-separated)" value={form.allergies}
          onChange={(v) => setForm({ ...form, allergies: v })} />
        <Field label="Medications (comma-separated)" value={form.medications}
          onChange={(v) => setForm({ ...form, medications: v })} />
        <Field label="Conditions (comma-separated)" value={form.conditions}
          onChange={(v) => setForm({ ...form, conditions: v })} />

        {message && (
          <div
            className={
              message.kind === "ok"
                ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            }
          >
            {message.text}
          </div>
        )}
        <button className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function splitList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
