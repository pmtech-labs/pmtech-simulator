import { supabase } from "@/integrations/supabase/client";

/** Mensajes del asistente de ayuda (no se persisten en base de datos). */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const CHATBOT_WELCOME =
  "¡Hola! Puedo ayudarte con dudas sobre planes, el simulacro, tu cuenta o el diploma. Para dudas de contenido de gestión de proyectos, mejor practica en el simulador — ahí tienes explicación y diagnóstico verificados.";

const FALLBACK_REPLY = "Lo siento, no pude procesar tu pregunta. Contacta con soporte.";

/** Envía un mensaje al asistente incluyendo el historial de la conversación. */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("faq_chatbot", {
      method: "POST",
      body: { message, history },
    });
    if (error) return FALLBACK_REPLY;
    return (data?.reply as string | undefined) ?? FALLBACK_REPLY;
  } catch {
    return FALLBACK_REPLY;
  }
}

/** Reporta un problema detectado en una pregunta del banco. */
export async function reportQuestionIssue(
  questionId: string,
  comment: string,
  examId?: string,
): Promise<boolean> {
  const { error } = await supabase.functions.invoke("report_question_issue", {
    method: "POST",
    body: { question_id: questionId, comment, exam_id: examId },
  });
  return !error;
}
