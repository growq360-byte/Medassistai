import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Mic, MicOff, Plus, Send, Trash2 } from "lucide-react";
import clsx from "clsx";
import { api, streamChat } from "../lib/api";
import type { ChatMessage as ChatMessageType, Conversation, ConversationSummary } from "../types";
import DisclaimerBanner from "../components/DisclaimerBanner";
import ChatMessage from "../components/ChatMessage";
import { useSpeechToText } from "../hooks/useSpeechToText";

export default function ChatPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const voice = useSpeechToText(
    useCallback((text: string) => setInput((prev) => (prev ? prev + " " + text : text)), []),
  );

  const loadConversations = useCallback(async () => {
    const data = await api.get<{ conversations: ConversationSummary[] }>(
      "/chat/conversations",
    );
    setConversations(data.conversations);
    return data.conversations;
  }, []);

  const loadConversation = useCallback(async (conversationId: string) => {
    const data = await api.get<{ conversation: Conversation }>(
      `/chat/conversations/${conversationId}`,
    );
    setActive(data.conversation);
  }, []);

  useEffect(() => {
    void loadConversations().then((list) => {
      if (!id && list.length > 0) {
        navigate(`/chat/${list[0].id}`, { replace: true });
      }
    });
  }, [id, loadConversations, navigate]);

  useEffect(() => {
    if (id) void loadConversation(id);
    else setActive(null);
  }, [id, loadConversation]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [active?.messages.length, sending]);

  const createConversation = async () => {
    const { conversation } = await api.post<{ conversation: ConversationSummary }>(
      "/chat/conversations",
      {},
    );
    await loadConversations();
    navigate(`/chat/${conversation.id}`);
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm("Delete this conversation?")) return;
    await api.delete(`/chat/conversations/${conversationId}`);
    const list = await loadConversations();
    if (id === conversationId) {
      navigate(list.length > 0 ? `/chat/${list[0].id}` : "/chat", { replace: true });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !id || sending) return;
    const content = input.trim();
    setInput("");
    setError(null);
    setSending(true);

    // Optimistically append user + empty assistant messages.
    const userMsg: ChatMessageType = {
      id: `tmp-u-${Date.now()}`,
      conversationId: id,
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };
    const assistantMsg: ChatMessageType = {
      id: `tmp-a-${Date.now()}`,
      conversationId: id,
      role: "ASSISTANT",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setActive((prev) =>
      prev ? { ...prev, messages: [...prev.messages, userMsg, assistantMsg] } : prev,
    );

    try {
      await streamChat(id, content, (delta) => {
        setActive((prev) => {
          if (!prev) return prev;
          const messages = [...prev.messages];
          const last = messages[messages.length - 1];
          messages[messages.length - 1] = { ...last, content: last.content + delta };
          return { ...prev, messages };
        });
      });
      // Reload from server to get canonical IDs and refreshed title.
      await loadConversation(id);
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full">
      <aside className="flex w-72 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div className="text-sm font-semibold text-slate-900">Conversations</div>
          <button onClick={createConversation} className="btn-secondary px-2 py-1 text-xs">
            <Plus size={14} /> New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-slate-500">
              No conversations yet.
            </div>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={clsx(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                c.id === id ? "bg-brand-50 text-brand-800" : "hover:bg-slate-100",
              )}
            >
              <button
                onClick={() => navigate(`/chat/${c.id}`)}
                className="flex-1 truncate text-left"
                title={c.title}
              >
                {c.title}
              </button>
              <button
                onClick={() => deleteConversation(c.id)}
                className="opacity-0 transition group-hover:opacity-100"
                aria-label="Delete conversation"
              >
                <Trash2 size={14} className="text-slate-500 hover:text-red-600" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col">
        <div className="border-b border-slate-200 bg-white px-8 py-4">
          <h1 className="text-lg font-semibold text-slate-900">
            {active?.title ?? "Select or start a conversation"}
          </h1>
          <p className="text-xs text-slate-500">
            Powered by Claude — informational only, not medical advice.
          </p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="mx-auto max-w-3xl space-y-4">
            <DisclaimerBanner />
            {!active && (
              <div className="card text-center text-slate-500">
                Start a new conversation from the left to begin.
              </div>
            )}
            {active?.messages.map((m, i) => (
              <ChatMessage
                key={m.id}
                role={m.role as "USER" | "ASSISTANT"}
                content={m.content}
                createdAt={m.id.startsWith("tmp-") ? undefined : m.createdAt}
                streaming={
                  sending &&
                  i === active.messages.length - 1 &&
                  m.role === "ASSISTANT"
                }
              />
            ))}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {active && (
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-4"
          >
            <div className="mx-auto flex max-w-3xl items-end gap-2">
              <textarea
                className="input min-h-[48px] flex-1 resize-none"
                rows={2}
                placeholder="Describe how you're feeling, ask a question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSubmit(e as unknown as FormEvent);
                  }
                }}
              />
              {voice.supported && (
                <button
                  type="button"
                  onClick={voice.toggle}
                  className={clsx(
                    "btn rounded-lg p-2",
                    voice.listening
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100",
                  )}
                  title={voice.listening ? "Stop recording" : "Voice input"}
                >
                  {voice.listening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}
              <button className="btn-primary" disabled={sending || !input.trim()}>
                <Send size={16} />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
            {voice.listening && (
              <div className="mx-auto mt-2 max-w-3xl text-center text-xs text-red-600 animate-pulse">
                Listening… speak now. Click the mic button to stop.
              </div>
            )}
            {voice.error && (
              <div className="mx-auto mt-2 max-w-3xl text-center text-xs text-red-600">
                {voice.error}
              </div>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
