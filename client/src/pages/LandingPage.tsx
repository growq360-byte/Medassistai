import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  Heart,
  Lock,
  MessageSquare,
  Shield,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: MessageSquare,
    title: "AI Medical Chat",
    description:
      "Have natural conversations about your health. Our AI assistant powered by Claude provides thoughtful, evidence-based health information in real time.",
  },
  {
    icon: Activity,
    title: "Symptom Checker",
    description:
      "Describe your symptoms and receive a structured triage assessment with urgency guidance — so you know when to see a doctor.",
  },
  {
    icon: Users,
    title: "Provider Directory",
    description:
      "Browse qualified healthcare providers across specialties and book appointments directly through the platform.",
  },
  {
    icon: Calendar,
    title: "Appointment Management",
    description:
      "Schedule, reschedule, and manage all your medical appointments in one place with real-time status updates.",
  },
  {
    icon: Heart,
    title: "Patient Profiles",
    description:
      "Maintain a comprehensive health profile including allergies, medications, and conditions — used to personalize AI responses.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description:
      "Your health data stays on your device. JWT-encrypted sessions, bcrypt-hashed passwords, and zero third-party tracking.",
  },
];

const stats = [
  { value: "24/7", label: "AI availability" },
  { value: "6+", label: "Medical specialties" },
  { value: "<2s", label: "Response time" },
  { value: "100%", label: "Private & secure" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/register";
  const ctaLabel = user ? "Go to Dashboard" : "Get Started Free";

  return (
    <div className="min-h-full bg-white">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Stethoscope size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900">MedAssist AI</span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-brand-700"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.1),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center lg:py-36">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
            <Zap size={14} />
            Revolutionary Healthcare AI Platform
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Transform Healthcare with{" "}
            <span className="bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Intelligence
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Get instant health guidance, manage appointments, check symptoms, and
            maintain your medical profile — all in one secure platform powered by
            Claude AI.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={ctaLink}
              className="btn bg-brand-600 px-8 py-3 text-base text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700"
            >
              {ctaLabel}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="btn border border-slate-300 bg-white px-8 py-3 text-base text-slate-700 hover:bg-slate-50"
            >
              <Bot size={18} />
              Try the Demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Demo account available — no signup required to explore.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold text-brand-600">{value}</div>
              <div className="mt-1 text-sm text-slate-600">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Everything you need for smarter health management
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A complete suite of AI-powered tools designed with your well-being in mind.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Get started in 3 simple steps
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create your account",
                desc: "Sign up in seconds with your email. No credit card required.",
              },
              {
                step: "2",
                title: "Complete your profile",
                desc: "Add your health info so the AI can give you personalized guidance.",
              },
              {
                step: "3",
                title: "Start chatting",
                desc: "Ask health questions, check symptoms, or book an appointment.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-16 text-white shadow-xl">
          <Shield size={40} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold sm:text-4xl">
            Your health companion, always available
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            MedAssist AI is free to use for personal health management. Not a
            substitute for professional medical advice — always consult a
            qualified clinician for diagnoses and treatment.
          </p>
          <Link
            to={ctaLink}
            className="btn mt-8 bg-white px-8 py-3 text-base font-semibold text-brand-700 hover:bg-brand-50"
          >
            {ctaLabel}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Stethoscope size={16} className="text-brand-600" />
            <span>&copy; {new Date().getFullYear()} MedAssist AI</span>
          </div>
          <div className="text-xs text-slate-500">
            Built with Claude AI &middot; Not medical advice
          </div>
        </div>
      </footer>
    </div>
  );
}
