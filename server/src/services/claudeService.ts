import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env.js";

const MODEL = "claude-opus-4-6";
const MAX_TOKENS = 1024;

const CHAT_SYSTEM_PROMPT = `You are MedAssist AI, a careful, empathetic medical information assistant.

Core rules — these always apply:
- You are NOT a licensed clinician and must NOT provide a diagnosis, prescribe medication, or replace professional medical advice.
- Begin or end every response with a brief reminder to consult a qualified healthcare professional for personal medical decisions.
- If the user describes symptoms suggesting an emergency (chest pain, stroke signs, severe bleeding, difficulty breathing, suicidal ideation, anaphylaxis, severe trauma, etc.), clearly advise them to call emergency services immediately and be explicit about why.
- Ask clarifying questions when the user's situation is ambiguous before offering general information.
- Provide evidence-based, plainly-worded explanations. Avoid jargon unless you define it.
- Respect privacy. Do not ask for information you don't need.
- Never fabricate studies, drug dosages, or guidelines. If unsure, say so.

Tone: warm, concise, non-alarmist, and patient-centered. Use short paragraphs and bullet points when they help readability.`;

const SYMPTOM_SYSTEM_PROMPT = `You are MedAssist AI's symptom triage assistant. You receive a structured description of a patient's current symptoms and any relevant profile context. Produce a concise, well-structured assessment with these sections:

1. Summary — a one-sentence recap of what the patient described.
2. Possible considerations — plain-language explanations of common (not necessarily definitive) reasons these symptoms may occur. Do not diagnose.
3. Self-care suggestions — general, conservative measures when appropriate.
4. When to seek care — clear triggers that should prompt a visit or urgent care.
5. Urgency — end your response with a single line in this exact format:
   URGENCY: <LOW|MODERATE|HIGH|EMERGENCY>

Rules:
- Always include the disclaimer that this is not a diagnosis.
- If any red flags for emergencies are present, set URGENCY to EMERGENCY and advise calling emergency services at the top of the response.
- Keep the whole response under 350 words.`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set; AI features are unavailable.",
      );
    }
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Stream a Claude chat reply. Yields text deltas as they arrive.
 */
export async function* streamChatReply(history: ChatTurn[]) {
  const anthropic = getClient();
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: "text",
        text: CHAT_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

export interface AssessSymptomsInput {
  symptoms: string[];
  severity: string;
  duration: string;
  notes?: string;
  patientContext?: string;
}

export interface AssessSymptomsResult {
  assessment: string;
  urgency: "LOW" | "MODERATE" | "HIGH" | "EMERGENCY";
}

export async function assessSymptoms(
  input: AssessSymptomsInput,
): Promise<AssessSymptomsResult> {
  const anthropic = getClient();
  const userMessage = [
    `Symptoms: ${input.symptoms.join(", ")}`,
    `Severity (patient-reported): ${input.severity}`,
    `Duration: ${input.duration}`,
    input.notes ? `Additional notes: ${input.notes}` : null,
    input.patientContext ? `Patient context: ${input.patientContext}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: "text",
        text: SYMPTOM_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();

  const urgency = parseUrgency(text);
  return { assessment: text, urgency };
}

function parseUrgency(text: string): AssessSymptomsResult["urgency"] {
  const match = text.match(/URGENCY:\s*(LOW|MODERATE|HIGH|EMERGENCY)/i);
  if (!match) return "LOW";
  return match[1].toUpperCase() as AssessSymptomsResult["urgency"];
}
