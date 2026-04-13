export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  patientProfile?: PatientProfile | null;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth?: string | null;
  sex?: string | null;
  bloodType?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContact?: string | null;
}

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export type Urgency = "LOW" | "MODERATE" | "HIGH" | "EMERGENCY";

export interface SymptomAssessment {
  id: string;
  userId: string;
  symptoms: string[];
  severity: string;
  duration: string;
  notes?: string | null;
  aiAssessment: string;
  urgency: Urgency;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface Appointment {
  id: string;
  userId: string;
  providerId: string;
  provider: Provider;
  scheduledAt: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string | null;
}
