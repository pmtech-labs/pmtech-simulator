import type { ChatMessage } from "@/services/supportService";

/**
 * Persistencia local de la conversación con el asistente, para que al cambiar
 * de ruta el candidato recupere el hilo sin perder el contexto.
 */

const STORAGE_KEY = "pmtech:chatbot-session";
/** Caducidad de la conversación guardada (4 h). */
const MAX_AGE_MS = 4 * 60 * 60 * 1000;
/** Límite de mensajes conservados para no llenar el almacenamiento. */
const MAX_MESSAGES = 40;

interface StoredChat {
  savedAt: number;
  open: boolean;
  messages: ChatMessage[];
}

export function loadChatSession(): { messages: ChatMessage[]; open: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChat;
    if (!Array.isArray(parsed?.messages) || !parsed.messages.length) return null;
    if (Date.now() - (parsed.savedAt ?? 0) > MAX_AGE_MS) {
      clearChatSession();
      return null;
    }
    return { messages: parsed.messages, open: Boolean(parsed.open) };
  } catch {
    return null;
  }
}

export function saveChatSession(messages: ChatMessage[], open: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        open,
        messages: messages.slice(-MAX_MESSAGES),
      } satisfies StoredChat),
    );
  } catch {
    /* almacenamiento no disponible: el chat sigue funcionando sin persistencia */
  }
}

export function clearChatSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
