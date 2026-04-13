import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Calendar,
  MessageSquare,
  Users,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { useAuth } from "../context/AuthContext";

const cards = [
  {
    to: "/chat",
    icon: MessageSquare,
    title: "Chat with MedAssist",
    description: "Ask health questions and get conversational guidance.",
  },
  {
    to: "/symptoms",
    icon: Activity,
    title: "Symptom checker",
    description: "Get a triage assessment with urgency guidance.",
  },
  {
    to: "/providers",
    icon: Users,
    title: "Browse providers",
    description: "Find a clinician and book an appointment.",
  },
  {
    to: "/appointments",
    icon: Calendar,
    title: "Your appointments",
    description: "View and manage upcoming visits.",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="p-8">
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="What would you like to do today?"
      />
      <div className="mb-6">
        <DisclaimerBanner />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ to, icon: Icon, title, description }) => (
          <Link
            to={to}
            key={to}
            className="group card flex items-start gap-4 transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon size={22} />
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-slate-900">{title}</div>
              <div className="text-sm text-slate-600">{description}</div>
            </div>
            <ArrowRight
              size={18}
              className="mt-1 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
