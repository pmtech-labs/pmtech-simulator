// Edge Function: admin_generate_case_cluster
import { getSupabaseAdmin, getAuthenticatedUser } from "../_shared/supabaseAdmin.ts";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLlm } from "../_shared/llmProviders.ts";
import { tagRowsFor } from "../_shared/tagMapping.ts";
import { buildRejectionContext } from "../_shared/rejectionContext.ts";
import { pickStyleExamples, caseClusterReference } from "../_shared/fewShotExamples.ts";
import { terminologiaObligatoria } from "../_shared/terminologyDictionary.ts";

interface CreateClusterJobBody {
  connector_id: string;
  task_ids: string[];
  approach?: "predictive" | "agile" | "hybrid";
  clusters_requested: number;
  questions_per_cluster?: number;
  difficulty_min?: number;
  difficulty_max?: number;
}

const VALID_APPROACHES = ["predictive", "agile", "hybrid"];
const VALID_ERROR_TYPES = ["knowledge", "interpretation", "sequence", "role", "approach", "reading", "analysis", "time", "wrong_document", "unsupervised_delegation"];
const FORBIDDEN_PATTERNS = [
  /examen\s+oficial\s+de\s+pmi/i,
  /certificaci[oó]n\s+oficial\s+garantizada/i,
  /avalado\s+por\s+pmi/i,
];

const ERROR_TYPE_LEAK_PATTERN = new RegExp(
  "error_type" +
    "|error de tipo" +
    "|\\b(role|sequence|analysis|approach|knowledge|interpretation|reading|wrong_document|unsupervised_delegation)\\b" +
    "|\\berror de (rol|secuencia|an[aá]lisis|aproximaci[oó]n|conocimiento|interpretaci[oó]n|lectura)\\b" +
    "|\\bfalla por\\b.{0,3}\\b(rol|role|time|tiempo)\\b",
  "i",
);
function detectErrorTypeLeak(explanation: string): boolean { return ERROR_TYPE_LEAK_PATTERN.test(explanation ?? ""); }

const NADA_PATTERN = /^["']?\s*(Nada|Ninguno|Ninguna)\s*[;,.]/i;
const OBVIOUS_VERB_PATTERN = /^["']?\s*(Forzar|Ignorar|Dejar de|Ocultar|Posponer|Imponer)\b/i;
function detectOptionTextIssues(options: any[]): string[] {
  const issues: string[] = [];
  for (const opt of options ?? []) {
    const text = String(opt?.text ?? "");
    if (NADA_PATTERN.test(text)) issues.push(`Opción ${opt.id} empieza con "Nada;/Ninguno;"`);
    if (OBVIOUS_VERB_PATTERN.test(text)) issues.push(`Opción ${opt.id} empieza con un verbo demasiado obvio`);
  }
  return issues;
}

function sanitizeOptions(options: any[]): any[] {
  return options.map((opt) => {
    const clean: { id: string; text: string; error_type?: string } = { id: opt.id, text: opt.text };
    if (opt.error_type && typeof opt.error_type === "string" && VALID_ERROR_TYPES.includes(opt.error_type)) clean.error_type = opt.error_type;
    return clean;
  });
}

const WEIGHTED_PROCESS_GROUPS = ["initiation","planning","planning","planning","execution","execution","monitoring_control","monitoring_control","monitoring_control","closing"] as const;
const PROCESS_GROUP_LABELS: Record<string, string> = { initiation: "Inicio", planning: "Planificación", execution: "Ejecución", monitoring_control: "Monitoreo y Control", closing: "Cierre" };
const PROCESS_GROUP_ARTICLED_LABELS: Record<string, string> = { initiation: "el Inicio", planning: "la Planificación", execution: "la Ejecución", monitoring_control: "el Monitoreo y Control", closing: "el Cierre" };
const PERFORMANCE_DOMAINS = ["gobernanza","alcance","cronograma","finanzas","recursos","riesgos","interesados"] as const;
const PERFORMANCE_DOMAIN_LABELS: Record<string, string> = { gobernanza: "Gobernanza", alcance: "Alcance", cronograma: "Cronograma", finanzas: "Finanzas", recursos: "Recursos", riesgos: "Riesgos", interesados: "Interesados" };

type Theme = "entrega_valor" | "sostenibilidad" | "ia";
function pickThemes(): Theme[] {
  const themes: Theme[] = [];
  if (Math.random() < 0.5) themes.push("entrega_valor");
  if (Math.random() < 0.1) themes.push("sostenibilidad");
  if (Math.random() < 0.1) themes.push("ia");
  return themes;
}
const THEME_INSTRUCTIONS: Record<string, string> = {
  entrega_valor: "El escenario debe integrar de forma natural el concepto de entrega basada en el valor.",
  sostenibilidad: "El escenario debe integrar de forma natural una consideración de sostenibilidad.",
  ia: "El escenario debe integrar de forma natural el uso de inteligencia artificial como herramienta de apoyo.",
};

function normalizeApproach(value: unknown): "predictive" | "agile" | "hybrid" | null {
  return typeof value === "string" && VALID_APPROACHES.includes(value) ? (value as any) : null;
}

const CASE_STUDY_BEATS = [
  "Tensión inicial de valor: desacuerdo entre interesados sobre qué significa exito o qué se debe priorizar (velocidad/coste vs. calidad/sostenibilidad/experiencia).",
  "Interesados nuevos o con niveles de compromiso desiguales: coordinación difícil entre partes que no estaban alineadas desde el principio.",
  "Presión externa (mercado, competidor, dato nuevo, exigencia de mostrar avances rápido) que tensiona la necesidad de rigor/gobernanza.",
  "Crisis operativa o impedimento crítico que exige repriorizar o resolver algo urgente sin perder de vista el objetivo de valor.",
  "Cierre: institucionalización de mejoras/lecciones más allá del proyecto, o realización de beneficios a largo plazo -- con la duda de si se sostendrá o se revertirá.",
];
function pickBeatsForCount(count: number): string[] {
  if (count <= 1) return [CASE_STUDY_BEATS[0]];
  return Array.from({ length: count }, (_, i) => CASE_STUDY_BEATS[Math.round((i * (CASE_STUDY_BEATS.length - 1)) / (count - 1))]);
}

type QuestionStyle = "normal" | "negative" | "infinitive_sequence";
function pickStylesForCluster(count: number): QuestionStyle[] {
  const styles: QuestionStyle[] = Array.from({ length: count }, () => "normal");
  let usedNegative = false; let usedInfinitive = false;
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (!usedNegative && r < 0.15) { styles[i] = "negative"; usedNegative = true; }
    else if (!usedInfinitive && r < 0.30) { styles[i] = "infinitive_sequence"; usedInfinitive = true; }
  }
  return styles;
}

function buildSystemPrompt(): string {
  return `Eres un redactor experto de exámenes de certificación de project management, familiarizado con el
Exam Content Outline (ECO) 2026 de PMI. NUNCA cites literalmente ni parafrasees de cerca el PMBOK u otro
material protegido, y nunca menciones marcas registradas de PMI fuera del contexto normal de un examen de
práctica no oficial. Genera contenido situacional que evalúe juicio, no memorización.

Tu tarea es generar un CASO/ESCENARIO completo con varias preguntas asociadas, tal como se define en el
ECO 2026: un enunciado de escenario único y detallado (con un proyecto concreto, personajes con nombre,
datos específicos), seguido de varias preguntas independientes que se responden EN EL CONTEXTO de ese
mismo escenario -- cada pregunta plantea una decisión o análisis distinto sobre la misma situación.

FORMATO DE TEXTO (crítico): dentro de "scenario_text", "stem", "options[].text" y "explanation" NUNCA
uses comillas dobles ("). Usa comillas simples (') o comillas angulares (« ») si necesitas citar algo.

DISEÑO DE DISTRACTORES (obligatorio en cada pregunta, salvo MODO PREGUNTA NEGATIVA, ver más abajo): cada
opción incorrecta debe fallar por una razón clasificable en uno de estos 10 tipos: "sequence" (acción
válida pero prematura), "role" (corresponde a otro rol), "approach" (lógica predictiva en contexto ágil o
viceversa), "analysis" (se precipita sin analizar toda la información), "knowledge" (concepto incorrecto),
"interpretation" (malinterpreta la situación), "reading" (ignora un dato clave del enunciado), "time"
(urgencia desproporcionada), "wrong_document" (invoca un artefacto/documento real del proyecto pero NO el
que gobierna esta situación concreta), "unsupervised_delegation" (deja que un tercero decida o ejecute sin
validación humana; en preguntas sobre IA la opción correcta NUNCA es "adoptar el resultado sin más"). Este
error_type es SOLO metadato interno del JSON, nunca debe aparecer como palabra en el texto que lee el
candidato -- ver la regla de fuga de jerga más abajo.

MODO PREGUNTA NEGATIVA (aplica SOLO a la pregunta para la que se indique explícitamente más abajo): en vez
de pedir la MEJOR acción, esa pregunta debe pedir identificar la opción INCORRECTA o INAPROPIADA ("¿Cuál
de las siguientes acciones NO debería tomar el director del proyecto?", "Todas las siguientes son
apropiadas EXCEPTO:"). En esa pregunta 3 opciones son buenas prácticas genuinas (sin "error_type") y 1
opción -- la que va en "correct_answer" -- es la práctica inapropiada, con su "error_type". Marca esa
pregunta con "is_negative": true; el resto llevan "is_negative": false.

MODO SECUENCIA DE INFINITIVOS (aplica SOLO a la pregunta indicada más abajo): las 4 opciones deben
construirse como listas de 2-3 verbos en infinitivo encadenados, MUY similares en contenido y extensión --
la dificultad reside en el orden o verbo correcto, no en contenidos distintos.

ESTILO DE LA RESPUESTA CORRECTA (tendencia natural, NO regla mecánica, no aplica en MODO SECUENCIA DE
INFINITIVOS): la opción correcta rara vez es una acción única y drástica -- tiende a combinar un verbo de
análisis con la acción resultante. Varía la redacción; evita que el estilo por sí solo delate la correcta.

TEMAS A CONSIDERAR SI ENCAJAN: gobernanza de decisiones con IA, institucionalización de lecciones
aprendidas, juicio sobre cuándo NO escalar, integridad/transparencia de datos, adaptar comunicación a
audiencias divergentes, realización de beneficios post-entrega.

TERMINOLOGÍA (obligatorio): el caso se rige por PMBOK 8 (ene 2026), NO por PMBOK 6/7. NUNCA nombres un
proceso concreto al estilo PMBOK 6 ni uses "áreas de conocimiento" o "triple restricción". EXCEPCIÓN:
"Realizar el control integrado de cambios" SÍ es vocabulario vivo del examen 2026, úsalo con normalidad.
${terminologiaObligatoria()}

Responde ÚNICAMENTE con JSON válido, sin texto adicional ni backticks, con esta forma exacta:
{
  "scenario_title": "...",
  "scenario_text": "...",
  "questions": [
    { "stem": "...", "is_negative": false, "options": [{"id":"A","text":"...","error_type":"sequence"},{"id":"B","text":"..."},{"id":"C","text":"...","error_type":"role"},{"id":"D","text":"...","error_type":"analysis"}], "correct_answer": ["B"], "explanation": "...", "difficulty": 3 }
  ]
}`;
}

function buildUserPrompt(task: any, approach: string, questionsCount: number, targetLetters: string[], targetDifficulties: number[], targetProcessGroup: string, targetThemes: Theme[], targetPerformanceDomain: string, targetStyles: QuestionStyle[], rejectionContext: string): string {
  const enablers = (task.eco_enablers ?? []).map((e: any) => `- ${e.description}`).join("\n");
  const themeLine = targetThemes.length > 0 ? `\n\nTEMÁTICA(S) (obligatorio, todas): ${targetThemes.map((t) => THEME_INSTRUCTIONS[t]).join(" ")}` : "";
  const perQuestionBeats = pickBeatsForCount(questionsCount);
  const perQuestionRules = targetLetters.map((letter, idx) => {
    const styleNote = targetStyles[idx] === "negative" ? " Esta pregunta usa el MODO PREGUNTA NEGATIVA (is_negative:true)." : targetStyles[idx] === "infinitive_sequence" ? " Esta pregunta usa el MODO SECUENCIA DE INFINITIVOS." : "";
    return `  - Pregunta ${idx + 1} (beat narrativo: ${perQuestionBeats[idx]}): la respuesta correcta debe quedar en la posición "${letter}" (correct_answer=["${letter}"]), y su "difficulty" debe ser exactamente ${targetDifficulties[idx]}.${styleNote}`;
  }).join("\n");
  const processGroupLine = targetProcessGroup === "monitoring_control"
    ? `GRUPO DE PROCESO / ÁREA DE ENFOQUE (obligatorio): el escenario debe centrarse en actividades de
Monitoreo y Control (revisión de avance, control de cambios, informes de desempeño). IMPORTANTE: nunca
escribas que el proyecto "está"/"se encuentra"/"entró" en la etapa de Monitoreo y Control como si fuera una
fase secuencial separada -- es paralela y continua a Planificación y Ejecución.`
    : `GRUPO DE PROCESO / ÁREA DE ENFOQUE (obligatorio): el escenario completo debe situarse claramente en
${PROCESS_GROUP_ARTICLED_LABELS[targetProcessGroup]} del ciclo de vida del proyecto. IMPORTANTE (hallazgo
real del PO, sep 2026): PMBOK 8 reorganizó estos antiguos grupos de procesos en Áreas de Enfoque, que NO
son fases ni etapas secuenciales -- NUNCA escribas "la fase de ${PROCESS_GROUP_LABELS[targetProcessGroup]}"
ni "la etapa de ${PROCESS_GROUP_LABELS[targetProcessGroup]}"; nombra el Área de Enfoque directamente como
sustantivo (ej. "durante ${PROCESS_GROUP_ARTICLED_LABELS[targetProcessGroup]}...", "en ${PROCESS_GROUP_ARTICLED_LABELS[targetProcessGroup]} del proyecto...")
(no aplica a fases genuinas de un proyecto real por etapas, ej. "fase de diseño").`;
  return `Dominio ECO: ${task.eco_domains.name}
Tarea principal: ${task.title}
Enablers de referencia:
${enablers}

Enfoque de gestión de proyectos: ${approach}
Genera un caso/escenario en español (neutro, España/LATAM) con EXACTAMENTE ${questionsCount} preguntas
asociadas, relacionadas con esta tarea (pueden tocar matices distintos de la misma situación).${themeLine}

${processGroupLine}

DOMINIO DE DESEMPEÑO (obligatorio): el caso debe girar principalmente en torno a
"${PERFORMANCE_DOMAIN_LABELS[targetPerformanceDomain]}" (etiqueta independiente de la tarea ECO indicada).

MECÁNICA DEL CLUSTER (confirmada en casos oficiales reales del PMI, obligatorio): las preguntas NO
repiten el texto del escenario -- cada una referencia brevemente "el caso" o la situación ya planteada y
añade UN dato incremental nuevo que hace avanzar la narrativa según el beat indicado para esa pregunta.

REGLAS OBLIGATORIAS POR PREGUNTA (no las cambies, constrúyelas desde el principio así):
${perQuestionRules}

No generes ninguna pregunta con la respuesta correcta en otra posición y la corrijas después.${rejectionContext}${caseClusterReference()}${pickStyleExamples(1)}`;
}

function repairUnescapedQuotes(text: string): string {
  let result = ""; let inString = false; let escapeNext = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escapeNext) { result += ch; escapeNext = false; continue; }
    if (ch === "\\") { result += ch; escapeNext = true; continue; }
    if (ch === '"') {
      if (!inString) { inString = true; result += ch; }
      else {
        let j = i + 1; while (j < text.length && /\s/.test(text[j])) j++;
        const next = text[j];
        if (next === ":" || next === "," || next === "}" || next === "]" || j >= text.length) { inString = false; result += ch; }
        else { result += '\\"'; }
      }
      continue;
    }
    result += ch;
  }
  return result;
}

function validateQuestion(q: any, targetLetter: string, targetDifficulty: number, style: QuestionStyle): string[] {
  const issues: string[] = [];
  if (!q.stem || q.stem.length < 20) issues.push("Enunciado demasiado corto");
  if (!Array.isArray(q.options) || q.options.length < 2) issues.push("Menos de 2 opciones");
  const isNegative = style === "negative";
  if (isNegative && q.is_negative !== true) issues.push("Se pidió MODO PREGUNTA NEGATIVA pero no declaró is_negative:true");
  if (!isNegative && q.is_negative === true) issues.push("Declaró is_negative:true sin habérselo pedido");
  if (!Array.isArray(q.correct_answer) || q.correct_answer.length === 0) { issues.push("correct_answer vacío"); }
  else if (Array.isArray(q.options)) {
    const ids = new Set(q.options.map((o: any) => o.id));
    if (!q.correct_answer.every((id: string) => ids.has(id))) issues.push("correct_answer no coincide con options");
    if (!q.correct_answer.includes(targetLetter)) issues.push(`Respuesta correcta no en posición ${targetLetter}`);
    for (const opt of q.options) {
      if (!opt.text || String(opt.text).trim().length < 3) issues.push(`Opción ${opt.id} sin texto`);
      const isMarkedAnswer = q.correct_answer?.includes(opt.id);
      const shouldHaveErrorType = isNegative ? isMarkedAnswer : !isMarkedAnswer;
      if (shouldHaveErrorType) {
        if (!opt.error_type) issues.push(`Opción ${opt.id} debería llevar error_type y no lo tiene`);
        else if (!VALID_ERROR_TYPES.includes(opt.error_type)) issues.push(`error_type inválido: ${opt.error_type}`);
      } else if (opt.error_type) issues.push(`Opción ${opt.id} no debería llevar error_type pero tiene: ${opt.error_type}`);
    }
    issues.push(...detectOptionTextIssues(q.options));
  }
  if (!q.explanation || q.explanation.length < 20) issues.push("Explicación ausente o corta");
  if (Number(q.difficulty) !== targetDifficulty) issues.push(`difficulty ${q.difficulty} != ${targetDifficulty}`);
  if (detectErrorTypeLeak(q.explanation ?? "")) issues.push("La explicación menciona literalmente la etiqueta de clasificación interna -- fuga de jerga, prohibido");
  return issues;
}

async function attemptCluster(connector: { provider: string; model_id: string; api_base_url: string | null; apiKey: string }, task: any, approach: string, questionsCount: number, targetLetters: string[], targetDifficulties: number[], targetProcessGroup: string, targetThemes: Theme[], targetPerformanceDomain: string, targetStyles: QuestionStyle[], rejectionContext: string): Promise<{ ok: true; draft: any } | { ok: false; errorMsg: string }> {
  const result = await callLlm(connector, buildSystemPrompt(), buildUserPrompt(task, approach, questionsCount, targetLetters, targetDifficulties, targetProcessGroup, targetThemes, targetPerformanceDomain, targetStyles, rejectionContext), 5000);
  const cleaned = result.text.replace(/```json|```/g, "").trim();
  let draft: any;
  try { draft = JSON.parse(cleaned); } catch {
    try { draft = JSON.parse(repairUnescapedQuotes(cleaned)); }
    catch (parseErr) { return { ok: false, errorMsg: `JSON inválido (${(parseErr as Error).message}) — fragmento: ${cleaned.slice(0, 200)}` }; }
  }
  if (!draft.scenario_text || !Array.isArray(draft.questions) || draft.questions.length !== questionsCount) {
    return { ok: false, errorMsg: `estructura inválida (esperaba ${questionsCount} preguntas, llegaron ${draft.questions?.length ?? 0})` };
  }
  const allIssues: string[] = [];
  draft.questions.forEach((q: any, idx: number) => {
    const issues = validateQuestion(q, targetLetters[idx], targetDifficulties[idx], targetStyles[idx]);
    if (issues.length > 0) allIssues.push(`pregunta ${idx + 1}: ${issues.join("; ")}`);
    const fullText = `${q.stem ?? ""}\n${q.explanation ?? ""}`;
    for (const p of FORBIDDEN_PATTERNS) if (p.test(fullText)) allIssues.push(`pregunta ${idx + 1}: patrón no permitido`);
  });
  if (allIssues.length > 0) return { ok: false, errorMsg: allIssues.join(" | ") };
  return { ok: true, draft };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse("Método no soportado", 405);
  const user = await getAuthenticatedUser(req);
  if (!user) return errorResponse("No autenticado", 401);
  if (!(await requireAdmin(user.id))) return errorResponse("No autorizado (requiere rol admin)", 403);
  const admin = getSupabaseAdmin();
  const body: CreateClusterJobBody = await req.json();
  if (!body.connector_id || !body.task_ids?.length || !body.clusters_requested) return errorResponse("Faltan campos requeridos (connector_id, task_ids, clusters_requested)", 400);
  const { data: connectorRow, error: connectorErr } = await admin.from("llm_connectors").select("id, provider, model_id, api_base_url, secret_id, is_active").eq("id", body.connector_id).single();
  if (connectorErr || !connectorRow) return errorResponse("Conector no encontrado", 404);
  if (!connectorRow.is_active) return errorResponse("El conector está desactivado", 409);
  const { data: apiKey, error: keyErr } = await admin.rpc("vault_read_secret_for_connector", { p_secret_id: connectorRow.secret_id });
  if (keyErr || !apiKey) return errorResponse("No se pudo leer la API key del conector", 500);
  const normalizedApproach = normalizeApproach(body.approach);
  const approaches = normalizedApproach ? [normalizedApproach] : ["predictive", "agile", "hybrid"];
  const diffMin = body.difficulty_min ?? 2; const diffMax = body.difficulty_max ?? 4;
  let clustersCreated = 0; let clustersFailed = 0; const errors: string[] = [];
  for (let c = 0; c < body.clusters_requested; c++) {
    const taskId = body.task_ids[c % body.task_ids.length];
    const approach = approaches[c % approaches.length];
    const questionsCount = body.questions_per_cluster ?? 5;
    const targetLetters = Array.from({ length: questionsCount }, (_, idx) => ["A", "B", "C", "D"][(c + idx) % 4]);
    const targetDifficulties = Array.from({ length: questionsCount }, () => Math.floor(Math.random() * (diffMax - diffMin + 1)) + diffMin);
    const targetProcessGroup = WEIGHTED_PROCESS_GROUPS[c % WEIGHTED_PROCESS_GROUPS.length];
    const targetPerformanceDomain = PERFORMANCE_DOMAINS[c % PERFORMANCE_DOMAINS.length];
    const targetThemes = pickThemes();
    const targetStyles = pickStylesForCluster(questionsCount);
    const { data: task } = await admin.from("eco_tasks").select("id, title, eco_domains(name, code), eco_enablers(description)").eq("id", taskId).single();
    if (!task) { clustersFailed++; errors.push(`Cluster ${c + 1}: tarea no encontrada`); continue; }
    const connector = { provider: connectorRow.provider, model_id: connectorRow.model_id, api_base_url: connectorRow.api_base_url, apiKey };
    const maxAttempts = 2; let draft: any = null; let lastErrorMsg = "";
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const rejectionContext = await buildRejectionContext(admin, taskId);
        const attemptResult = await attemptCluster(connector, task, approach, questionsCount, targetLetters, targetDifficulties, targetProcessGroup, targetThemes, targetPerformanceDomain, targetStyles, rejectionContext);
        if (attemptResult.ok) { draft = attemptResult.draft; break; }
        lastErrorMsg = attemptResult.errorMsg;
      } catch (attemptErr) { lastErrorMsg = `intento ${attempt}: ${(attemptErr as Error).message}`; }
    }
    if (!draft) { clustersFailed++; errors.push(`Cluster ${c + 1}: ${lastErrorMsg} (tras ${maxAttempts} intentos)`); continue; }
    try {
      const { data: cluster, error: clusterErr } = await admin.from("case_clusters").insert({ title: draft.scenario_title ?? `Caso ${c + 1}`, scenario_text: draft.scenario_text, status: "draft" }).select("id").single();
      if (clusterErr || !cluster) { clustersFailed++; errors.push(`Cluster ${c + 1}: error al crear case_clusters (${clusterErr?.message})`); continue; }
      const rows = draft.questions.map((q: any, idx: number) => ({
        item_type: "case_child", format: "mc_single", cluster_id: cluster.id, stem: q.stem, options: sanitizeOptions(q.options),
        correct_answer: q.correct_answer, explanation: q.explanation, task_id: taskId, approach, difficulty: targetDifficulties[idx],
        process_group: targetProcessGroup, performance_domain: targetPerformanceDomain, focus_tags: targetThemes, status: "draft",
      }));
      const { data: insertedQuestions, error: questionsErr } = await admin.from("questions").insert(rows).select("id");
      if (questionsErr) { clustersFailed++; errors.push(`Cluster ${c + 1}: error al insertar preguntas (${questionsErr.message})`); await admin.from("case_clusters").delete().eq("id", cluster.id); continue; }
      if (insertedQuestions) {
        const tagRows = insertedQuestions.flatMap((q: any) => tagRowsFor(q.id, { domainCode: task.eco_domains.code, approach, processGroup: targetProcessGroup, performanceDomain: targetPerformanceDomain, themes: targetThemes, isCase: true, format: "mc_single" }));
        await admin.from("question_tags").insert(tagRows);
      }
      clustersCreated++;
    } catch (err) { clustersFailed++; errors.push(`Cluster ${c + 1}: ${(err as Error).message}`); }
  }
  return jsonResponse({ clusters_created: clustersCreated, clusters_failed: clustersFailed, errors: errors.slice(0, 20) });
});
