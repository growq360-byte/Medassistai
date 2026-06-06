import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  MessageSquare,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";
import PageHeader from "../components/PageHeader";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { Appointment } from "../types";

interface DashboardData {
  stats: {
    conversations: number;
    messages: number;
    assessments: number;
    appointments: number;
  };
  upcomingAppointments: Appointment[];
  recentAssessments: {
    id: string;
    symptoms: string;
    urgency: string;
    createdAt: string;
  }[];
}

const URGENCY_STYLES: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-800",
  MODERATE: "bg-amber-100 text-amber-800",
  HIGH: "bg-orange-100 text-orange-800",
  EMERGENCY: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await api.get<DashboardData>("/dashboard/stats");
        setData(d);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const statCards = data
    ? [
        {
          label: "Conversations",
          value: data.stats.conversations,
          icon: MessageSquare,
          color: "text-blue-600 bg-blue-50",
          to: "/chat",
        },
        {
          label: "Messages sent",
          value: data.stats.messages,
          icon: TrendingUp,
          color: "text-brand-600 bg-brand-50",
          to: "/chat",
        },
        {
          label: "Assessments",
          value: data.stats.assessments,
          icon: Activity,
          color: "text-purple-600 bg-purple-50",
          to: "/symptoms",
        },
        {
          label: "Appointments",
          value: data.stats.appointments,
          icon: Calendar,
          color: "text-amber-600 bg-amber-50",
          to: "/appointments",
        },
      ]
    : [];

  const quickActions = [
    {
      to: "/chat",
      icon: MessageSquare,
      title: "Chat with MedAssist",
      description: "Ask health questions and get conversational guidance.",
    },
    {
      to: "/symptoms",
      icon: Activity,
      title: "Check symptoms",
      description: "Get a triage assessment with urgency guidance.",
    },
    {
      to: "/providers",
      icon: Stethoscope,
      title: "Book appointment",
      description: "Find a clinician and schedule a visit.",
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Here's your health dashboard overview."
      />
      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      {/* Stats grid */}
      {data && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, color, to }) => (
            <Link
              key={label}
              to={to}
              className="card flex items-center gap-4 transition hover:shadow-md"
            >
              <div
                className={clsx(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  color,
                )}
              >
                <Icon size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-sm text-slate-600">{label}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Quick actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {quickActions.map(({ to, icon: Icon, title, description }) => (
              <Link
                to={to}
                key={to}
                className="group card flex flex-col items-start gap-3 transition hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {title}
                  </div>
                  <div className="text-xs text-slate-600">{description}</div>
                </div>
                <ArrowRight
                  size={14}
                  className="mt-auto text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming appointments */}
          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              Upcoming appointments
            </h2>
            {!data || data.upcomingAppointments.length === 0 ? (
              <div className="card text-sm text-slate-500">
                No upcoming appointments.{" "}
                <Link
                  to="/providers"
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Book one
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {data.upcomingAppointments.map((a) => (
                  <div key={a.id} className="card flex items-center gap-3 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <Stethoscope size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {a.provider.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={10} />
                        {new Date(a.scheduledAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent assessments */}
          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              Recent assessments
            </h2>
            {!data || data.recentAssessments.length === 0 ? (
              <div className="card text-sm text-slate-500">
                No assessments yet.{" "}
                <Link
                  to="/symptoms"
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Run one
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentAssessments.map((a) => {
                  let symptoms: string[];
                  try {
                    symptoms = JSON.parse(a.symptoms);
                  } catch {
                    symptoms = [a.symptoms];
                  }
                  return (
                    <div key={a.id} className="card py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {Array.isArray(symptoms)
                            ? symptoms.join(", ")
                            : a.symptoms}
                        </div>
                        <span
                          className={clsx(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                            URGENCY_STYLES[a.urgency] ?? URGENCY_STYLES.LOW,
                          )}
                        >
                          {a.urgency}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
