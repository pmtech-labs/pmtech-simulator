export interface LlmConnector { provider: string; model_id: string; api_base_url?: string | null; apiKey: string; }
export interface GenerationResult { text: string; }

export async function callLlm(connector: LlmConnector, system: string, userPrompt: string, maxTokens = 1200): Promise<GenerationResult> {
  switch (connector.provider) {
    case "anthropic": return callAnthropic(connector, system, userPrompt, maxTokens);
    case "openai": case "openai_compatible": return callOpenAiCompatible(connector, system, userPrompt, maxTokens);
    case "google": return callGoogle(connector, system, userPrompt, maxTokens);
    default: throw new Error(`Proveedor no soportado: ${connector.provider}`);
  }
}

async function callAnthropic(connector: LlmConnector, system: string, userPrompt: string, maxTokens: number): Promise<GenerationResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": connector.apiKey, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: connector.model_id, max_tokens: maxTokens, system, messages: [{ role: "user", content: userPrompt }] }) });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const textBlock = data.content?.find((b: any) => b.type === "text");
  if (!textBlock) throw new Error("Respuesta de Anthropic sin bloque de texto");
  return { text: textBlock.text };
}

async function callOpenAiCompatible(connector: LlmConnector, system: string, userPrompt: string, maxTokens: number): Promise<GenerationResult> {
  const baseUrl = connector.api_base_url ?? "https://api.openai.com/v1";
  const isReasoningFamily = /^(o1|o3|o4|gpt-5|gpt-6)/i.test(connector.model_id);
  const tokenParam = isReasoningFamily ? "max_completion_tokens" : "max_tokens";
  const res = await fetch(`${baseUrl}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${connector.apiKey}` }, body: JSON.stringify({ model: connector.model_id, messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }], [tokenParam]: maxTokens }) });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Respuesta sin contenido");
  return { text };
}

async function callGoogle(connector: LlmConnector, system: string, userPrompt: string, maxTokens: number): Promise<GenerationResult> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${connector.model_id}:generateContent?key=${connector.apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: userPrompt }] }], systemInstruction: { parts: [{ text: system }] }, generationConfig: { maxOutputTokens: Math.max(maxTokens, 3000), thinkingConfig: { thinkingLevel: "low" } } }) });
  if (!res.ok) throw new Error(`Google API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Respuesta de Google sin texto (posible bloqueo de safety filters)");
  return { text };
}
