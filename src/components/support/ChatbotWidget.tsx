import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  CHATBOT_WELCOME,
  sendChatMessage,
  type ChatMessage,
} from "@/services/supportService";
import { cn } from "@/lib/utils";

/**
 * Widget flotante de ayuda: chat sencillo contra la Edge Function `faq_chatbot`.
 * El historial vive en el estado del componente y se envía en cada llamada.
 */
export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: CHATBOT_WELCOME },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const history = messages;
    setMessages([...history, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    const reply = await sendChatMessage(text, history);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setSending(false);
    inputRef.current?.focus();
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[min(70vh,32rem)] w-[min(92vw,22rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-panel sm:right-6">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Asistente PMTech</p>
              <p className="truncate text-[11px] opacity-80">Dudas de planes, cuenta y simulacro</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat" className="shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="w-fit rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                Escribiendo…
              </div>
            )}
          </div>

          <div className="flex items-end gap-2 border-t border-border p-3">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit();
                }
              }}
              placeholder="Escribe tu pregunta…"
              className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => void submit()}
              disabled={sending || !input.trim()}
              aria-label="Enviar mensaje"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente de ayuda"}
        className="fixed bottom-4 right-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-panel transition-transform hover:scale-105 sm:right-6"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
