export interface LlmConnector {
  provider: string;
  model_id: string;
  api_base_url?: string | null;
  apiKey: string;
}

export interface GenerationResult {
  text: string;
}

export async function callLlm(connector: LlmConnector, system: string, userPrompt: string, maxTokens = 1200): Promise<GenerationResult> {
  switch (connector.provider) {
    case "anthropic":
      return callAnthropic(connector, system, userPrompt, maxTokens);
    case "openai":
    case "openai_compatible":
      return callOpenAiCompatible(connector, system, userPrompt, maxTokens);
    case "google":
      return callGoogle(connector, system, userPrompt, maxTokens);
    default:
      throw new Error(`Proveedor no soportado: ${connector.provider}`);
  }
}

async function callAnthropic(connector: LlmConnector, system: string, userPrompt: string, maxTokens: number): Promise<GenerationResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": connector.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: connector.model_id,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const textBlock = data.content?.find((b: any) => b.type === "text");
  if (!textBlock) throw new Error("Respuesta de Anthropic sin bloque de texto");
  return { text: textBlock.text };
}

async function callOpenAiCompatible(connector: LlmConnector, system: string, userPrompt: string, maxTokens: number): Promise<GenerationResult> {
  const baseUrl = connector.api_base_url ?? "https://api.openai.com/v1";
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${connector.apiKey}`,
    },
    body: JSON.stringify({
      model: connector.model_id,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Respuesta sin contenido");
  return { text };
}

async function callGoogle(connector: LlmConnector, system: string, userPrompt: string, maxTokens: number): Promise<GenerationResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${connector.model_id}:generateContent?key=${connector.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: {
          maxOutputTokens: Math.max(maxTokens, 3000),
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`Google API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Respuesta de Google sin texto (posible bloqueo de safety filters)");
  return { text };
}

export interface ModelInfo {
  id: string;
  label?: string;
}

export async function listModels(
  provider: string,
  apiKey: string,
  apiBaseUrl?: string | null,
): Promise<ModelInfo[]> {
  switch (provider) {
    case "anthropic":
      return listAnthropicModels(apiKey);
    case "openai":
    case "openai_compatible":
      return listOpenAiCompatibleModels(apiKey, apiBaseUrl);
    case "google":
      return listGoogleModels(apiKey);
    default:
      throw new Error(`Proveedor no soportado: ${provider}`);
  }
}

async function listAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
  const res = await fetch("https://api.anthropic.com/v1/models", {
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.data ?? []).map((m: any) => ({ id: m.id, label: m.display_name ?? m.id }));
}

async function listOpenAiCompatibleModels(apiKey: string, apiBaseUrl?: string | null): Promise<ModelInfo[]> {
  const baseUrl = apiBaseUrl ?? "https://api.openai.com/v1";
  const res = await fetch(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.data ?? []).map((m: any) => ({ id: m.id, label: m.id }));
}

async function listGoogleModels(apiKey: string): Promise<ModelInfo[]> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!res.ok) throw new Error(`Google API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.models ?? [])
    .filter((m: any) => (m.supportedGenerationMethods ?? []).includes("generateContent"))
    .map((m: any) => ({ id: (m.name ?? "").replace(/^models\//, ""), label: m.displayName ?? m.name }));
}
