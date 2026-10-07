// Edge Function: admin_generate_enhanced_matching_question
//
// POST -> genera preguntas de emparejamiento mejorado (enhanced_matching) de forma
// segura, igual que admin_generate_matching_question pero con un diagrama SVG junto
// a cada término del lado izquierdo. El CÓDIGO decide qué 4-6 ESTRUCTURAS
// ORGANIZATIVAS de un catálogo fijo de 6 (funcional, matricial débil/equilibrada/
// fuerte, proyectizada, compuesta) se incluyen en esta pregunta y construye sus SVG
// a partir de plantillas ya verificadas -- la IA SOLO aporta, para cada estructura ya
// elegida por código, una definición corta en sus propias palabras que la distinga
// de las demás (nunca elige las estructuras, nunca dibuja nada).
//
// Este es el ÚNICO generador de enhanced_matching del banco. Formato añadido
// (ago 2026) porque no existía ningún generador para él -- la única pregunta previa
// de este formato en el banco se creó fuera del pipeline estándar.

import { getSupabaseAdmin, getAuthenticatedUser } from "../_shared/supabaseAdmin.ts";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLlm } from "../_shared/llmProviders.ts";
import { tagRowsFor } from "../_shared/tagMapping.ts";
import { buildRejectionContext } from "../_shared/rejectionContext.ts";
import { terminologiaCompacta } from "../_shared/terminologyDictionary.ts";
import { parseJsonWithRepair } from "../_shared/questionIntegrity.ts";

interface CreateEnhancedMatchingBody {
  connector_id: string;
  task_ids: string[];
  count_requested: number;
  pairs_per_question?: number;
  difficulty_min?: number;
  difficulty_max?: number;
  focus_tags?: string[];
}

const PROCESS_GROUPS = ["initiation", "planning", "execution", "monitoring_control", "closing"] as const;
const WEIGHTED_PROCESS_GROUPS = [
  "initiation",
  "planning", "planning", "planning",
  "execution", "execution",
  "monitoring_control", "monitoring_control", "monitoring_control",
  "closing",
] as const;
const PERFORMANCE_DOMAINS = ["gobernanza", "alcance", "cronograma", "finanzas", "recursos", "riesgos", "interesados"] as const;
type Theme = "entrega_valor" | "sostenibilidad" | "ia";
const VALID_THEMES: Theme[] = ["entrega_valor", "sostenibilidad", "ia"];
function pickThemes(): Theme[] {
  const themes: Theme[] = [];
  if (Math.random() < 0.5) themes.push("entrega_valor");
  if (Math.random() < 0.1) themes.push("sostenibilidad");
  if (Math.random() < 0.1) themes.push("ia");
  return themes;
}
function resolveDifficulty(diffMin?: number, diffMax?: number): number {
  const lo = diffMin ?? 2;
  const hi = diffMax ?? 3;
  const min = Math.min(lo, hi);
  const max = Math.max(lo, hi);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function resolveThemes(focusTags: string[] | undefined): Theme[] {
  if (focusTags !== undefined) {
    return focusTags.filter((t): t is Theme => (VALID_THEMES as string[]).includes(t));
  }
  return pickThemes();
}

type StructureKey = "functional" | "weak_matrix" | "balanced_matrix" | "strong_matrix" | "projectized" | "composite";
const ALL_STRUCTURES: StructureKey[] = ["functional", "weak_matrix", "balanced_matrix", "strong_matrix", "projectized", "composite"];
const STRUCTURE_LABELS: Record<StructureKey, string> = {
  functional: "Organización funcional",
  weak_matrix: "Matricial débil",
  balanced_matrix: "Matricial equilibrada",
  strong_matrix: "Matricial fuerte",
  projectized: "Organización proyectizada",
  composite: "Organización compuesta",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickStructures(count: number): StructureKey[] {
  return shuffle(ALL_STRUCTURES).slice(0, Math.min(count, ALL_STRUCTURES.length));
}

function buildStructureSvg(key: StructureKey): string {
  const box = (x: number, y: number, w: number, h: number, fill: string, stroke: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`;
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6b7280"/>`;
  const label = (x: number, y: number, text: string, size = 7) =>
    `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${text}</text>`;

  switch (key) {
    case "functional":
      return `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
        ${box(60, 10, 40, 20, "#f3f4f6", "#9ca3af")}${label(80, 24, "Dirección")}
        ${line(80, 30, 80, 45)}${line(20, 45, 140, 45)}
        ${line(20, 45, 20, 55)}${line(80, 45, 80, 55)}${line(140, 45, 140, 55)}
        ${box(5, 55, 30, 20, "#f3f4f6", "#9ca3af")}${label(20, 68, "Depto. A", 6)}
        ${box(65, 55, 30, 20, "#f3f4f6", "#9ca3af")}${label(80, 68, "Depto. B", 6)}
        ${box(125, 55, 30, 20, "#f3f4f6", "#9ca3af")}${label(140, 68, "Depto. C", 6)}
      </svg>`;
    case "weak_matrix":
      return `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
        ${box(60, 10, 40, 20, "#f3f4f6", "#9ca3af")}${label(80, 24, "Dirección")}
        ${line(80, 30, 80, 45)}${line(20, 45, 140, 45)}
        ${line(20, 45, 20, 55)}${line(80, 45, 80, 55)}${line(140, 45, 140, 55)}
        ${box(5, 55, 30, 20, "#f3f4f6", "#9ca3af")}${label(20, 68, "Depto. A", 6)}
        ${box(65, 55, 30, 20, "#fef3c7", "#d97706")}${label(80, 65, "Depto. B", 6)}${label(80, 72, "(coord. PM)", 5)}
        ${box(125, 55, 30, 20, "#f3f4f6", "#9ca3af")}${label(140, 68, "Depto. C", 6)}
      </svg>`;
    case "balanced_matrix":
      return `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
        ${box(30, 10, 40, 18, "#f3f4f6", "#9ca3af")}${label(50, 23, "Dir. funcional", 6)}
        ${box(90, 10, 40, 18, "#dbeafe", "#2563eb")}${label(110, 23, "Director PM", 6)}
        ${line(50, 28, 50, 40)}${line(110, 28, 110, 40)}
        ${line(20, 40, 140, 40)}
        ${line(20, 40, 20, 50)}${line(80, 40, 80, 50)}${line(140, 40, 140, 50)}
        ${box(5, 50, 30, 30, "#fef3c7", "#d97706")}${label(20, 63, "Recurso", 6)}${label(20, 70, "reporta a", 5)}${label(20, 76, "ambos", 5)}
        ${box(65, 50, 30, 30, "#fef3c7", "#d97706")}${label(80, 63, "Recurso", 6)}${label(80, 70, "reporta a", 5)}${label(80, 76, "ambos", 5)}
        ${box(125, 50, 30, 30, "#fef3c7", "#d97706")}${label(140, 63, "Recurso", 6)}${label(140, 70, "reporta a", 5)}${label(140, 76, "ambos", 5)}
      </svg>`;
    case "strong_matrix":
      return `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
        ${box(30, 10, 40, 18, "#f3f4f6", "#9ca3af")}${label(50, 23, "Dir. funcional", 6)}
        ${box(90, 10, 40, 18, "#2563eb", "#1e40af")}<text x="110" y="23" font-size="6" text-anchor="middle" fill="#fff">PMO / Director PM</text>
        ${line(50, 28, 50, 40)}${line(110, 28, 110, 40)}
        ${line(20, 40, 140, 40)}
        ${line(20, 40, 20, 50)}${line(80, 40, 80, 50)}${line(140, 40, 140, 50)}
        ${box(5, 50, 30, 30, "#dbeafe", "#2563eb")}${label(20, 68, "Recurso", 6)}
        ${box(65, 50, 30, 30, "#dbeafe", "#2563eb")}${label(80, 68, "Recurso", 6)}
        ${box(125, 50, 30, 30, "#dbeafe", "#2563eb")}${label(140, 68, "Recurso", 6)}
      </svg>`;
    case "projectized":
      return `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
        ${box(60, 10, 40, 20, "#dbeafe", "#2563eb")}${label(80, 24, "Director PM")}
        ${line(80, 30, 80, 45)}${line(20, 45, 140, 45)}
        ${line(20, 45, 20, 55)}${line(80, 45, 80, 55)}${line(140, 45, 140, 55)}
        ${box(5, 55, 30, 20, "#dbeafe", "#2563eb")}${label(20, 68, "Equipo", 6)}
        ${box(65, 55, 30, 20, "#dbeafe", "#2563eb")}${label(80, 68, "Equipo", 6)}
        ${box(125, 55, 30, 20, "#dbeafe", "#2563eb")}${label(140, 68, "Equipo", 6)}
      </svg>`;
    case "composite":
      return `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
        ${box(60, 5, 40, 16, "#f3f4f6", "#9ca3af")}${label(80, 16, "Dirección", 6)}
        ${line(80, 21, 80, 32)}${line(20, 32, 140, 32)}
        ${line(20, 32, 20, 40)}${line(80, 32, 80, 40)}${line(140, 32, 140, 40)}
        ${box(5, 40, 30, 16, "#f3f4f6", "#9ca3af")}${label(20, 50, "Depto. A", 5)}
        ${box(65, 40, 30, 16, "#fef3c7", "#d97706")}${label(80, 50, "Matricial", 5)}
        ${box(125, 40, 30, 16, "#dbeafe", "#2563eb")}${label(140, 50, "Equipo dedicado", 4.5)}
        ${box(105, 65, 50, 25, "#dbeafe", "#2563eb")}${label(130, 76, "Proyecto especial", 5)}${label(130, 84, "(equipo propio)", 5)}
        ${line(140, 56, 130, 65)}
      </svg>`;
  }
}

function buildSystemPrompt(zonesCount: number, labels: string[]): string {
  return `Eres un redactor experto de exámenes de certificación de project management, familiarizado con el
Exam Content Outline (ECO) 2026 de PMI. NUNCA cites literalmente ni parafrasees de cerca el PMBOK u otro
material protegido.

Tu tarea es escribir, para cada una de estas ${zonesCount} estructuras organizativas ya elegidas (NO las
cambies ni añadas otras), una definición corta en tus propias palabras que describa su característica
distintiva de forma inequívoca -- que un lector pueda emparejarla con la estructura correcta sin dudas,
distinguiéndola claramente de las otras ${zonesCount - 1}:

${labels.map((l, i) => `${i + 1}. ${l}`).join("\n")}

Enfócate en: quién tiene la autoridad sobre el proyecto (director de proyecto vs. gerente funcional), a
quién reportan los recursos, y el grado de dedicación del equipo al proyecto.
${terminologiaCompacta()}

Responde ÚNICAMENTE con JSON válido, sin texto adicional ni backticks:
{
  "stem": "Empareja cada estructura organizativa con su característica distintiva",
  "definitions": [
    {"structure_label": "...", "definition": "..."}
  ]
}
El array "definitions" debe tener EXACTAMENTE ${zonesCount} elementos, en el MISMO orden que la lista de
arriba, con "structure_label" copiado tal cual de cada línea.`;
}

function buildUserPrompt(task: any, targetThemes: Theme[], rejectionContext: string): string {
  const enablers = (task.eco_enablers ?? []).map((e: any) => `- ${e.description}`).join("\n");
  const themeLine = targetThemes.length > 0
    ? `\n\nTemática(s) a integrar si es natural en el enunciado (nunca en las definiciones técnicas): ${targetThemes.join(", ")}`
    : "";
  return `Dominio ECO: ${task.eco_domains.name}
Tarea: ${task.title}
Enablers de referencia (contexto, las definiciones deben ser técnicamente correctas sobre estructuras
organizativas independientemente de esta tarea concreta):
${enablers}${themeLine}${rejectionContext}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse("Método no soportado", 405);

  const user = await getAuthenticatedUser(req);
  if (!user) return errorResponse("No autenticado", 401);
  if (!(await requireAdmin(user.id))) return errorResponse("No autorizado (requiere rol admin)", 403);

  const admin = getSupabaseAdmin();
  const body: CreateEnhancedMatchingBody = await req.json();
  if (!body.connector_id || !body.task_ids?.length || !body.count_requested) {
    return errorResponse("Faltan campos requeridos (connector_id, task_ids, count_requested)", 400);
  }

  const { data: connectorRow, error: connectorErr } = await admin
    .from("llm_connectors")
    .select("id, provider, model_id, api_base_url, secret_id, is_active")
    .eq("id", body.connector_id)
    .single();
  if (connectorErr || !connectorRow) return errorResponse("Conector no encontrado", 404);
  if (!connectorRow.is_active) return errorResponse("El conector está desactivado", 409);

  const { data: apiKey, error: keyErr } = await admin.rpc("vault_read_secret_for_connector", {
    p_secret_id: connectorRow.secret_id,
  });
  if (keyErr || !apiKey) return errorResponse("No se pudo leer la API key del conector", 500);

  let generated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < body.count_requested; i++) {
    const taskId = body.task_ids[i % body.task_ids.length];
    const pairsCount = Math.min(body.pairs_per_question ?? (4 + Math.floor(Math.random() * 3)), 6);
    const targetProcessGroup = WEIGHTED_PROCESS_GROUPS[i % WEIGHTED_PROCESS_GROUPS.length];
    const targetPerformanceDomain = PERFORMANCE_DOMAINS[i % PERFORMANCE_DOMAINS.length];
    const targetThemes = resolveThemes(body.focus_tags);
    const targetDifficulty = resolveDifficulty(body.difficulty_min, body.difficulty_max);

    const structures = pickStructures(pairsCount);
    const labels = structures.map((s) => STRUCTURE_LABELS[s]);

    const { data: task } = await admin
      .from("eco_tasks")
      .select("id, title, eco_domains(name, code), eco_enablers(description)")
      .eq("id", taskId)
      .single();
    if (!task) { failed++; errors.push(`Ítem ${i + 1}: tarea no encontrada`); continue; }

    try {
      const rejectionContext = await buildRejectionContext(admin, taskId);
      const result = await callLlm(
        { provider: connectorRow.provider, model_id: connectorRow.model_id, api_base_url: connectorRow.api_base_url, apiKey },
        buildSystemPrompt(pairsCount, labels),
        buildUserPrompt(task, targetThemes, rejectionContext),
        1500,
      );

      let draft: any;
      try {
        draft = parseJsonWithRepair(result.text);
      } catch (parseErr) {
        failed++;
        errors.push(`Ítem ${i + 1}: JSON inválido incluso tras reparación (${(parseErr as Error).message})`);
        continue;
      }

      if (!draft.stem || !Array.isArray(draft.definitions) || draft.definitions.length !== pairsCount) {
        failed++;
        errors.push(`Ítem ${i + 1}: estructura inválida (esperaba ${pairsCount} definiciones, llegaron ${draft.definitions?.length ?? 0})`);
        continue;
      }

      const defByLabel = new Map<string, string>();
      for (const d of draft.definitions) {
        if (d?.structure_label) defByLabel.set(String(d.structure_label).trim(), String(d.definition ?? "").trim());
      }
      const missingOrInvalid = labels.some((l) => !defByLabel.has(l) || defByLabel.get(l)!.length < 15);
      if (missingOrInvalid || defByLabel.size !== labels.length) {
        failed++;
        errors.push(`Ítem ${i + 1}: definiciones no cubren exactamente las ${pairsCount} etiquetas pedidas, o alguna es demasiado corta`);
        continue;
      }

      const left = structures.map((s, idx) => ({ id: `s${idx + 1}`, svg: buildStructureSvg(s), label: STRUCTURE_LABELS[s] }));
      const rightShuffled = shuffle(structures.map((s, idx) => ({ id: `d${idx + 1}`, label: defByLabel.get(STRUCTURE_LABELS[s])!, originalIdx: idx })));
      const right = rightShuffled.map((r: any) => ({ id: r.id, label: r.label }));
      const correctPairs = structures.map((_: any, idx: number) => {
        const match: any = rightShuffled.find((r: any) => r.originalIdx === idx);
        return [`s${idx + 1}`, match.id];
      });
      const correctAnswer = correctPairs.map(([l, r]: [string, string]) => `${l}:${r}`);
      const options = left.map((l: any) => ({ id: l.id, text: l.label }));

      const explanation = structures
        .map((s) => `"${STRUCTURE_LABELS[s]}": ${defByLabel.get(STRUCTURE_LABELS[s])}`)
        .join(" ");

      const { data: insertedQuestion } = await admin.from("questions").insert({
        item_type: "standalone",
        format: "enhanced_matching",
        stem: draft.stem,
        options,
        correct_answer: correctAnswer,
        explanation,
        task_id: taskId,
        approach: "predictive",
        difficulty: targetDifficulty,
        process_group: targetProcessGroup,
        performance_domain: targetPerformanceDomain,
        focus_tags: targetThemes,
        status: "draft",
        practicum_payload: { left, right, correctPairs },
      }).select("id").single();

      if (insertedQuestion) {
        await admin.from("question_tags").insert(tagRowsFor(insertedQuestion.id, {
          domainCode: task.eco_domains.code,
          approach: "predictive",
          processGroup: targetProcessGroup,
          performanceDomain: targetPerformanceDomain,
          themes: targetThemes,
          isCase: false,
          format: "enhanced_matching",
        }));
      }
      generated++;
    } catch (err) {
      failed++;
      errors.push(`Ítem ${i + 1}: ${(err as Error).message}`);
    }
  }

  return jsonResponse({ generated, failed, errors: errors.slice(0, 20) });
});
