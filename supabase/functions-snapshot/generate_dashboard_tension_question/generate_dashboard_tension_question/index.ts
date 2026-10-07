// Edge Function: generate_dashboard_tension_question
//
// ago 2026 (fix de fondo del requisito numerico): con Gemini la tasa de fallo
// por "sin tension numerica real" subio a ~60%. Diagnostico: el requisito
// anterior permitia polaridad ambigua por metrica (metric_a podia subir O
// bajar segun si "mejorar" significaba mas o menos), pero la validacion en
// codigo solo compara el SIGNO numerico crudo del cambio, sin conocer la
// polaridad semantica. Si el modelo elegia dos metricas que numericamente se
// movian en el mismo sentido (aunque semanticamente hubiera tension real), la
// validacion lo rechazaba. Fix: se elimino la ambiguedad -- ahora la regla es
// absoluta: ambas metricas deben ser del mismo tipo de polaridad (mas alto es
// mejor), metric_a SIEMPRE sube y metric_b SIEMPRE baja, sin excepciones.

import { getSupabaseAdmin, getAuthenticatedUser } from "../_shared/supabaseAdmin.ts";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLlm } from "../_shared/llmProviders.ts";
import { tagRowsFor } from "../_shared/tagMapping.ts";
import { buildRejectionContext } from "../_shared/rejectionContext.ts";
import { parseJsonWithRepair } from "../_shared/questionIntegrity.ts";

interface CreateDashboardBody {
  connector_id: string;
  task_ids: string[];
  count_requested: number;
  difficulty_min?: number;
  difficulty_max?: number;
  focus_tags?: string[];
}

const WEIGHTED_PROCESS_GROUPS = [
  "initiation",
  "planning", "planning", "planning",
  "execution", "execution",
  "monitoring_control", "monitoring_control", "monitoring_control",
  "closing",
] as const;
const PROCESS_GROUP_LABELS: Record<string, string> = {
  initiation: "Inicio", planning: "Planificacion", execution: "Ejecucion",
  monitoring_control: "Monitoreo y Control", closing: "Cierre",
};
const PERFORMANCE_DOMAINS = ["gobernanza", "alcance", "cronograma", "finanzas", "recursos", "riesgos", "interesados"] as const;
const PERFORMANCE_DOMAIN_LABELS: Record<string, string> = {
  gobernanza: "Gobernanza", alcance: "Alcance", cronograma: "Cronograma", finanzas: "Finanzas",
  recursos: "Recursos", riesgos: "Riesgos", interesados: "Interesados",
};

type Theme = "entrega_valor" | "sostenibilidad" | "ia";
const VALID_THEMES: Theme[] = ["entrega_valor", "sostenibilidad", "ia"];
function pickThemes(): Theme[] {
  const themes: Theme[] = [];
  if (Math.random() < 0.5) themes.push("entrega_valor");
  if (Math.random() < 0.35) themes.push("sostenibilidad");
  if (Math.random() < 0.1) themes.push("ia");
  return themes;
}
const THEME_INSTRUCTIONS: Record<string, string> = {
  entrega_valor: "El escenario debe integrar de forma natural el concepto de entrega basada en el valor.",
  sostenibilidad: "Una de las dos metricas del dashboard deberia ser de sostenibilidad si encaja de forma natural. Recuerda: debe ser una metrica donde MAS ALTO sea mejor (ej. porcentaje de energia renovable usada, puntuacion de impacto social), nunca una donde mas alto sea peor (nunca toneladas de CO2 emitidas directamente -- si necesitas ese concepto, usa reduccion acumulada de emisiones en porcentaje).",
  ia: "El escenario debe integrar de forma natural el uso de inteligencia artificial como herramienta de apoyo. ATENCION (error frecuente a evitar): NO hagas que las dos metricas sean ambas sobre el propio uso o adopcion de la IA, tienden a moverse juntas. En su lugar, UNA metrica se relaciona con la IA (velocidad, cobertura o eficiencia que la IA esta mejorando -- esta es metric_a, sube) y la OTRA es una consecuencia humana u organizativa que se resiente porque se usa mas IA (confianza del equipo, calidad percibida, validacion manual efectiva, moral del equipo -- esta es metric_b, baja) -- asi la tension es real y ambas metricas siguen siendo del tipo mas alto es mejor.",
};

function resolveDifficulty(diffMin?: number, diffMax?: number): number {
  const lo = diffMin ?? 3;
  const hi = diffMax ?? 4;
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

const OPTION_ROLES = ["correct", "extreme", "passive", "disproportionate"] as const;
type OptionRole = typeof OPTION_ROLES[number];
const ROLE_TO_ERROR_TYPE: Record<Exclude<OptionRole, "correct">, string> = {
  extreme: "analysis",
  passive: "reading",
  disproportionate: "time",
};

const ERROR_TYPE_LEAK_PATTERN = new RegExp(
  "error_type" +
    "|error de tipo" +
    "|\\b(role|sequence|analysis|approach|knowledge|interpretation|reading|wrong_document|unsupervised_delegation)\\b" +
    "|\\berror de (rol|secuencia|an[aá]lisis|aproximaci[oó]n|conocimiento|interpretaci[oó]n|lectura)\\b" +
    "|\\bfalla por\\b.{0,3}\\b(rol|role|time|tiempo)\\b",
  "i",
);
function detectErrorTypeLeak(explanation: string): boolean {
  return ERROR_TYPE_LEAK_PATTERN.test(explanation ?? "");
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildSystemPrompt(): string {
  return "Eres un redactor experto de examenes de certificacion de project management, familiarizado con el Exam Content Outline (ECO) 2026 de PMI. NUNCA cites literalmente ni parafrasees de cerca el PMBOK u otro material protegido.\n\n" +
    "Tu tarea es generar el contenido para una pregunta tipo dashboard -- un panel muestra DOS metricas del proyecto evolucionando en direcciones opuestas al mismo tiempo (una mejora, otra empeora), y el candidato debe resolver la tension, NO elegir un bando. La respuesta correcta NUNCA es abandonar una metrica por la otra, ni ignorar la senal de alerta, ni escalar innecesariamente -- es una accion compuesta que analiza ambas tendencias y ajusta prioridades sin sacrificar ninguna por completo.\n\n" +
    "Debes aportar SOLO texto y rangos numericos -- el grafico real y los valores exactos de cada punto los construye el codigo, tu nunca dibujas el grafico ni inventas la serie completa.\n\n" +
    "REQUISITO NUMERICO (critico, la causa mas frecuente de rechazo -- LEE CON ATENCION, es una regla ABSOLUTA y SIN EXCEPCIONES, no la conviertas en un condicional ni la reinterpretes):\n\n" +
    "Paso 1 -- elige el TIPO de ambas metricas: metric_a y metric_b deben ser SIEMPRE del mismo tipo de polaridad, aquel en el que un valor MAS ALTO es intrinsecamente mejor. Ejemplos validos: satisfaccion del cliente, calidad percibida, cobertura de pruebas, velocidad del equipo, cumplimiento normativo (%), disponibilidad del sistema, confianza del cliente o del equipo, retencion, NPS, porcentaje de entregables a tiempo, adopcion de una herramienta, moral del equipo, madurez de un proceso. NUNCA nombres metric_a o metric_b con una metrica donde mas bajo sea mejor -- estan PROHIBIDOS como nombre directo: defectos, quejas, incidentes, rotacion, horas extra, retrabajo, tiempo de resolucion, costes, retrasos. Si el escenario necesita ese concepto, invierte el nombre: en vez de Defectos por sprint usa Tasa de aceptacion de entregables (%); en vez de Quejas de clientes usa Satisfaccion del cliente (%); en vez de Horas extra del equipo usa Capacidad disponible del equipo (%).\n\n" +
    "Paso 2 -- una vez elegido ese tipo uniforme para ambas metricas, la direccion es fija y no admite excepcion: metric_a SIEMPRE mejora Y su end_value SIEMPRE es MAYOR que start_value (sube). metric_b SIEMPRE empeora Y su end_value SIEMPRE es MENOR que start_value (baja). Nunca inviertas cual de las dos sube y cual baja.\n\n" +
    "Paso 3 -- magnitud: la diferencia entre start_value y end_value de CADA metrica debe ser de AL MENOS un 20% en valor absoluto respecto al start_value (o al menos 1 punto completo si la unidad son puntos enteros y el 20% seria menor que 1). Nunca generes un cambio pequeno o ambiguo.\n\n" +
    "Ejemplo numerico completo y valido: metric_a { name: Satisfaccion del cliente, unit: pts, start_value: 62, end_value: 81 } (sube un 30%, mejora) junto con metric_b { name: Moral del equipo, unit: pts, start_value: 78, end_value: 55 } (baja un 29%, empeora). Ambas son del mismo tipo de polaridad (mas alto es mejor en las dos); la unica diferencia es que una sube y la otra baja. Los numeros concretos son solo un ejemplo de magnitud -- inventa valores propios coherentes con el escenario, pero SIEMPRE con metric_a subiendo y metric_b bajando, nunca al reves.\n\n" +
    "FORMATO DE TEXTO (critico): dentro de stem, options[].text y explanation NUNCA uses comillas dobles. Si necesitas citar algo, usa comillas simples o comillas angulares. Las comillas dobles sin escapar dentro del texto rompen el JSON de salida -- evitalas por completo.\n\n" +
    "Genera EXACTAMENTE 4 opciones, cada una con un role de estos 4 (uno de cada, sin repetir), y CADA UNA con texto completo y sustancial (nunca vacio ni truncado):\n" +
    "- correct: vision equilibrada/holistica que sopesa corto y largo plazo, analiza ambas tendencias y ajusta prioridades -- nunca es una accion unica y drastica, tiende a combinar verbos (analizar X y ajustar Y).\n" +
    "- extreme: reaccion extrema -- abandona o elimina por completo una de las dos metricas para optimizar solo la otra.\n" +
    "- passive: status quo/pasivo -- seguir igual porque la metrica que mejora luce bien, ignorando la senal de alerta de la metrica que empeora.\n" +
    "- disproportionate: escalar a un comite o pausar el proyecto de forma innecesaria para algo que se gestiona perfectamente a nivel de proyecto.\n\n" +
    "TERMINOLOGIA (obligatorio): esto se rige por PMBOK 8 (publicado ene 2026), NO por PMBOK 6/7. NUNCA nombres un proceso concreto al estilo PMBOK 6 ni uses areas de conocimiento o triple restriccion.\n\n" +
    "FUGA DE JERGA INTERNA EN LA EXPLICACION (prohibido, tan obligatorio como el resto): la palabra role de cada opcion (correct/extreme/passive/disproportionate) y el error_type interno que el codigo le asocia (analysis/reading/time) son SOLO metadatos del sistema -- el candidato NUNCA debe verlos como palabra suelta en explanation, en ningun idioma. Al conectar por que cada opcion incorrecta falla, usa exclusivamente los nombres descriptivos en espanol extrema, pasiva o desproporcionada, NUNCA las palabras en ingles analysis, reading, time, role, sequence, approach, knowledge, interpretation, wrong_document ni unsupervised_delegation, ni sus traducciones al espanol como etiqueta (rol, secuencia, analisis usado como clasificacion), ni construcciones como falla por X con esas palabras. Relee tu explicacion antes de responder y comprueba que no aparece ninguna de esas palabras sueltas, en ningun idioma.\n\n" +
    "Responde UNICAMENTE con JSON valido, sin texto adicional ni backticks, y NUNCA truncado -- termina siempre con la llave de cierre final:\n" +
    '{\n' +
    '  "stem": "Escenario situacional que termina pidiendo la mejor accion ante el dashboard descrito",\n' +
    '  "metric_a": {"name": "nombre corto de la metrica que MEJORA (sube)", "unit": "unidad corta", "start_value": 0, "end_value": 0},\n' +
    '  "metric_b": {"name": "nombre corto de la metrica que EMPEORA (baja)", "unit": "unidad corta", "start_value": 0, "end_value": 0},\n' +
    '  "options": [\n' +
    '    {"role": "correct", "text": "..."},\n' +
    '    {"role": "extreme", "text": "..."},\n' +
    '    {"role": "passive", "text": "..."},\n' +
    '    {"role": "disproportionate", "text": "..."}\n' +
    '  ],\n' +
    '  "explanation": "Por que la opcion correcta resuelve la tension, y por que cada una de las otras 3 falla, conectandolo con su rol (extrema/pasiva/desproporcionada)"\n' +
    '}';
}

function buildUserPrompt(task: any, targetThemes: Theme[], targetProcessGroup: string, targetPerformanceDomain: string, rejectionContext: string): string {
  const enablers = (task.eco_enablers ?? []).map((e: any) => `- ${e.description}`).join("\n");
  const themeLine = targetThemes.length > 0
    ? `\n\nTEMATICA(S) (obligatorio, todas): ${targetThemes.map((t) => THEME_INSTRUCTIONS[t]).join(" ")}`
    : "";
  return `Dominio ECO: ${task.eco_domains.name}
Tarea: ${task.title}
Enablers de referencia:
${enablers}${themeLine}

GRUPO DE PROCESO / AREA DE ENFOQUE (obligatorio): el escenario debe situarse claramente en la etapa de "${PROCESS_GROUP_LABELS[targetProcessGroup]}" del ciclo de vida del proyecto.

DOMINIO DE DESEMPENO (obligatorio): la pregunta debe girar principalmente en torno a "${PERFORMANCE_DOMAIN_LABELS[targetPerformanceDomain]}" (etiqueta independiente de la tarea ECO indicada).

Genera un escenario situacional en espanol (neutro, Espana/LATAM) relacionado con esta tarea donde el candidato observa un dashboard con dos metricas en tension (una mejora y sube, la otra empeora y baja, ambas del mismo tipo de polaridad segun el REQUISITO NUMERICO) y debe decidir la mejor accion.${rejectionContext}`;
}

interface Metric { name: string; unit: string; start_value: number; end_value: number }

function buildDashboardSvg(periods: number, metricA: Metric, seriesA: number[], metricB: Metric, seriesB: number[]): string {
  const W = 480, panelH = 130, gap = 30, padL = 50, padR = 20, padT = 25, padB = 25;
  const chartW = W - padL - padR;

  function panelSvg(metric: Metric, series: number[], yOffset: number, color: string): string {
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const chartH = panelH - padT - padB;
    const stepX = chartW / (periods - 1);
    const points = series.map((v, i) => {
      const x = padL + i * stepX;
      const y = yOffset + padT + chartH - ((v - min) / range) * chartH;
      return { x, y, v };
    });
    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
    const dots = points.map((p, i) =>
      `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${color}"/>` +
      `<text x="${p.x}" y="${p.y - 8}" font-size="10" text-anchor="middle" fill="#374151">${p.v}${metric.unit}</text>` +
      `<text x="${p.x}" y="${yOffset + panelH - 4}" font-size="9" text-anchor="middle" fill="#6b7280">P${i + 1}</text>`
    ).join("");
    return `
      <text x="${padL}" y="${yOffset + 14}" font-size="12" font-weight="bold" fill="#111827">${metric.name}</text>
      <line x1="${padL}" y1="${yOffset + padT}" x2="${padL}" y2="${yOffset + panelH - padB}" stroke="#d1d5db"/>
      <line x1="${padL}" y1="${yOffset + panelH - padB}" x2="${padL + chartW}" y2="${yOffset + panelH - padB}" stroke="#d1d5db"/>
      <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="2"/>
      ${dots}`;
  }

  const panelA = panelSvg(metricA, seriesA, 0, "#2563eb");
  const panelB = panelSvg(metricB, seriesB, panelH + gap, "#dc2626");
  const totalH = panelH * 2 + gap;
  return `<svg viewBox="0 0 ${W} ${totalH}" xmlns="http://www.w3.org/2000/svg">${panelA}${panelB}</svg>`;
}

function buildSeries(periods: number, start: number, end: number, jitterPct: number): number[] {
  const series: number[] = [];
  for (let i = 0; i < periods; i++) {
    const t = i / (periods - 1);
    const base = start + (end - start) * t;
    const jitter = i === 0 || i === periods - 1 ? 0 : (Math.random() * 2 - 1) * Math.abs(end - start) * jitterPct;
    series.push(Math.round((base + jitter) * 10) / 10);
  }
  series[0] = start;
  series[periods - 1] = end;
  return series;
}

interface AttemptResult {
  ok: boolean;
  errorMsg?: string;
  draft?: any;
}

async function attemptGeneration(
  connector: { provider: string; model_id: string; api_base_url: string | null; apiKey: string },
  task: any,
  targetThemes: Theme[],
  targetProcessGroup: string,
  targetPerformanceDomain: string,
  rejectionContext: string,
): Promise<AttemptResult> {
  const result = await callLlm(
    connector,
    buildSystemPrompt(),
    buildUserPrompt(task, targetThemes, targetProcessGroup, targetPerformanceDomain, rejectionContext),
    3500,
  );

  let draft: any;
  try {
    draft = parseJsonWithRepair(result.text);
  } catch (parseErr) {
    return { ok: false, errorMsg: `JSON invalido incluso tras reparacion (${(parseErr as Error).message})` };
  }

  const roles: OptionRole[] = (draft.options ?? []).map((o: any) => o.role);
  const hasAllRoles = OPTION_ROLES.every((r) => roles.filter((x) => x === r).length === 1);
  if (!draft.stem || !draft.metric_a || !draft.metric_b || !Array.isArray(draft.options) || draft.options.length !== 4 || !hasAllRoles || !draft.explanation) {
    return { ok: false, errorMsg: `estructura invalida (roles recibidos: ${roles.join(",")})` };
  }

  const optionTextIssues: string[] = [];
  for (const opt of draft.options) {
    if (!opt.text || String(opt.text).trim().length < 10) {
      optionTextIssues.push(`opcion con role="${opt.role}" sin texto valido o demasiado corta`);
    }
  }
  if (optionTextIssues.length > 0) {
    return { ok: false, errorMsg: optionTextIssues.join("; ") };
  }
  if (String(draft.explanation).trim().length < 20) {
    return { ok: false, errorMsg: "explicacion ausente o demasiado corta" };
  }
  if (detectErrorTypeLeak(draft.explanation)) {
    return { ok: false, errorMsg: "la explicacion menciona literalmente la etiqueta de clasificacion interna (error_type/role, en ingles o espanol) -- fuga de jerga, prohibido" };
  }

  const metricA: Metric = draft.metric_a;
  const metricB: Metric = draft.metric_b;
  if (
    typeof metricA.start_value !== "number" || typeof metricA.end_value !== "number" ||
    typeof metricB.start_value !== "number" || typeof metricB.end_value !== "number" ||
    !metricA.name || !metricB.name
  ) {
    return { ok: false, errorMsg: "metric_a/metric_b con campos numericos o nombres invalidos" };
  }

  if (metricA.end_value <= metricA.start_value) {
    return { ok: false, errorMsg: `metric_a debe subir (end_value > start_value); recibido start=${metricA.start_value}, end=${metricA.end_value}` };
  }
  if (metricB.end_value >= metricB.start_value) {
    return { ok: false, errorMsg: `metric_b debe bajar (end_value < start_value); recibido start=${metricB.start_value}, end=${metricB.end_value}` };
  }
  const pctChangeA = (metricA.end_value - metricA.start_value) / (Math.abs(metricA.start_value) || 1);
  const pctChangeB = (metricB.end_value - metricB.start_value) / (Math.abs(metricB.start_value) || 1);
  if (Math.abs(pctChangeA) < 0.05 || Math.abs(pctChangeB) < 0.05) {
    return { ok: false, errorMsg: "cambio numerico demasiado pequeno en alguna de las 2 metricas" };
  }

  return { ok: true, draft };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse("Metodo no soportado", 405);

  const user = await getAuthenticatedUser(req);
  if (!user) return errorResponse("No autenticado", 401);
  if (!(await requireAdmin(user.id))) return errorResponse("No autorizado (requiere rol admin)", 403);

  const admin = getSupabaseAdmin();
  const body: CreateDashboardBody = await req.json();
  if (!body.connector_id || !body.task_ids?.length || !body.count_requested) {
    return errorResponse("Faltan campos requeridos (connector_id, task_ids, count_requested)", 400);
  }

  const { data: connectorRow, error: connectorErr } = await admin
    .from("llm_connectors")
    .select("id, provider, model_id, api_base_url, secret_id, is_active")
    .eq("id", body.connector_id)
    .single();
  if (connectorErr || !connectorRow) return errorResponse("Conector no encontrado", 404);
  if (!connectorRow.is_active) return errorResponse("El conector esta desactivado", 409);

  const { data: apiKey, error: keyErr } = await admin.rpc("vault_read_secret_for_connector", {
    p_secret_id: connectorRow.secret_id,
  });
  if (keyErr || !apiKey) return errorResponse("No se pudo leer la API key del conector", 500);

  let generated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < body.count_requested; i++) {
    const taskId = body.task_ids[i % body.task_ids.length];
    const targetProcessGroup = WEIGHTED_PROCESS_GROUPS[i % WEIGHTED_PROCESS_GROUPS.length];
    const targetPerformanceDomain = PERFORMANCE_DOMAINS[i % PERFORMANCE_DOMAINS.length];
    const targetThemes = resolveThemes(body.focus_tags);
    const targetDifficulty = resolveDifficulty(body.difficulty_min, body.difficulty_max);

    const { data: task } = await admin
      .from("eco_tasks")
      .select("id, title, eco_domains(name, code), eco_enablers(description)")
      .eq("id", taskId)
      .single();
    if (!task) { failed++; errors.push(`Item ${i + 1}: tarea no encontrada`); continue; }

    try {
      const rejectionContext = await buildRejectionContext(admin, taskId);
      const connector = { provider: connectorRow.provider, model_id: connectorRow.model_id, api_base_url: connectorRow.api_base_url, apiKey };

      const maxAttempts = 3;
      let attemptResult: AttemptResult = { ok: false };
      let lastErrorMsg = "";
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        attemptResult = await attemptGeneration(connector, task, targetThemes, targetProcessGroup, targetPerformanceDomain, rejectionContext);
        if (attemptResult.ok) break;
        lastErrorMsg = attemptResult.errorMsg ?? "motivo desconocido";
      }

      if (!attemptResult.ok || !attemptResult.draft) {
        failed++;
        errors.push(`Item ${i + 1}: ${lastErrorMsg} (tras ${maxAttempts} intentos)`);
        continue;
      }

      const draft = attemptResult.draft;
      const metricA: Metric = draft.metric_a;
      const metricB: Metric = draft.metric_b;

      const letters = ["A", "B", "C", "D"];
      for (let k = letters.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [letters[k], letters[j]] = [letters[j], letters[k]];
      }
      const optionsByRole = new Map<OptionRole, any>(draft.options.map((o: any) => [o.role as OptionRole, o]));
      const options = OPTION_ROLES.map((role, idx) => ({
        id: letters[idx],
        text: optionsByRole.get(role).text,
        ...(role !== "correct" ? { error_type: ROLE_TO_ERROR_TYPE[role] } : {}),
      })).sort((a, b) => a.id.localeCompare(b.id));
      const correctLetter = letters[OPTION_ROLES.indexOf("correct")];

      const periods = randInt(5, 6);
      const seriesA = buildSeries(periods, metricA.start_value, metricA.end_value, 0.08);
      const seriesB = buildSeries(periods, metricB.start_value, metricB.end_value, 0.08);
      const diagramSvg = buildDashboardSvg(periods, metricA, seriesA, metricB, seriesB);

      const { data: insertedQuestion } = await admin.from("questions").insert({
        item_type: "standalone",
        format: "graphic_based",
        stem: draft.stem,
        options,
        correct_answer: [correctLetter],
        explanation: draft.explanation,
        task_id: taskId,
        approach: "hybrid",
        difficulty: targetDifficulty,
        process_group: targetProcessGroup,
        performance_domain: targetPerformanceDomain,
        focus_tags: targetThemes,
        status: "draft",
        practicum_payload: {
          chart_type: "dashboard_tension",
          diagram_svg: diagramSvg,
          metric_a: { ...metricA, series: seriesA },
          metric_b: { ...metricB, series: seriesB },
        },
      }).select("id").single();

      if (insertedQuestion) {
        await admin.from("question_tags").insert(tagRowsFor(insertedQuestion.id, {
          domainCode: task.eco_domains.code,
          approach: "hybrid",
          processGroup: targetProcessGroup,
          performanceDomain: targetPerformanceDomain,
          themes: targetThemes,
          isCase: false,
          format: "graphic_based",
        }));
      }
      generated++;
    } catch (err) {
      failed++;
      errors.push(`Item ${i + 1}: ${(err as Error).message}`);
    }
  }

  return jsonResponse({ generated, failed, errors: errors.slice(0, 20) });
});
