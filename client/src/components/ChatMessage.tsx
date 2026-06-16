import clsx from "clsx";
import Markdown from "react-markdown";
import { Bot, User } from "lucide-react";

interface Props {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt?: string;
  streaming?: boolean;
}

export default function ChatMessage({ role, content, createdAt, streaming }: Props) {
  const isUser = role === "USER";
  return (
    <div className={clsx("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Bot size={16} />
        </div>
      )}
      <div className={clsx("max-w-[80%]", isUser && "order-first")}>
        <div
          className={clsx(
            "rounded-2xl px-4 py-3 text-sm shadow-sm",
            isUser
              ? "bg-brand-600 text-white"
              : "bg-white text-slate-900 border border-slate-100",
          )}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{content}</span>
          ) : content ? (
            <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-slate-900">
              <Markdown>{content}</Markdown>
            </div>
          ) : streaming ? (
            <span className="inline-block h-4 w-1.5 animate-pulse rounded bg-brand-400" />
          ) : null}
        </div>
        {createdAt && (
          <div
            className={clsx(
              "mt-1 text-[10px] text-slate-400",
              isUser ? "text-right" : "text-left",
            )}
          >
            {formatTime(createdAt)}
          </div>
        )}
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
          <User size={16} />
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60_000) return "just now";
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
