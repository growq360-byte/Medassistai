import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div>
        <strong>Not medical advice.</strong> MedAssist AI provides general
        information only and is not a substitute for professional diagnosis or
        treatment. Call emergency services for any medical emergency.
      </div>
    </div>
  );
}
