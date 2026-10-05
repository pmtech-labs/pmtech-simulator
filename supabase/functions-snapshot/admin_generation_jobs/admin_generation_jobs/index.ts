import { getSupabaseAdmin, getAuthenticatedUser } from "../_shared/supabaseAdmin.ts";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLlm } from "../_shared/llmProviders.ts";
import { tagRowsFor } from "../_shared/tagMapping.ts";
import { buildRejectionContext } from "../_shared/rejectionContext.ts";
import { pickStyleExamples } from "../_shared/fewShotExamples.ts";
import { terminologiaObligatoria } from "../_shared/terminologyDictionary.ts";

interface CreateJobBody {
  connector_id: string;
  task_ids: string[];
  approach?: "predictive" | "agile" | "hybrid";
  format?: string;
  count_requested: number;
  difficulty_min?: number;
  difficulty_max?: number;
  focus_tags?: string[];
}

const VALID_APPROACHES = ["predictive", "agile", "hybrid"];

function normalizeApproach(value: unknown): "predictive" | "agile" | "hybrid" | null {
  return typeof value === "string" && VALID_APPROACHES.includes(value)
    ? (value as "predictive" | "agile" | "hybrid")
    : null;
}

const FORBIDDEN_PATTERNS = [
  /examen\s+oficial\s+de\s+pmi/i,
  /certificación\s+oficial\s+garantizada/i,
  /avalado\s+por\s+pmi/i,
];

const ERROR_TYPE_LEAK_PATTERN = new RegExp(
  "error_type" +
    "|error de tipo" +
    "|\\b(role|sequence|analysis|approach|knowledge|interpretation|reading|wrong_document|unsupervised_delegation)\\b" +
    "|error de (rol|secuencia|an[aé]lisis|aproximaci[oó]n|conocimiento|interpretaci[oó]n|lectura)\\b" +
    "|(cae en|incurre en|corresponde a|refleja|constituye) (un |una )?error de (rol|secuencia)" +
    "|es un error de (rol|secuencia)" +
    "|falla por (rol|secuencia)",
  "i",
);

function detectErrorTypeLeak(explanation: string): boolean {
  return ERROR_TYPE_LEAK_PATTERN.test(explanation ?? "");
}

const NADA_PATTERN = /^["']?\s*(Nada|Ninguno|Ninguna)\s*[;,.]/i;
const OBVIOUS_VERB_PATTERN = /^["']?\s*(Forzar|Ignorar|Dejar de|Ocultar|Posponer|Imponer)\b/i;

function detectOptionTextIssues(options: any[]): string[] {
  const issues: string[] = [];
  for (const opt of options ?? []) {
    const text = String(opt?.text ?? "");
    if (NADA_PATTERN.test(text)) {
      issues.push(`Opción ${opt.id} empieza con el patrón prohibido "Nada;/Ninguno;": "${text.slice(0, 40)}..."`);
    }
    if (OBVIOUS_VERB_PATTERN.test(text)) {
      issues.push(`Opción ${opt.id} empieza con un verbo demasiado obvio (forzar/ignorar/dejar de/ocultar/posponer/imponer): "${text.slice(0, 40)}..."`);
    }
  }
  return issues;
}

type QuestionStyle = "normal" | "negative" | "infinitive_sequence";
function pickQuestionStyle(): QuestionStyle {
  const r = Math.random();
  if (r < 0.15) return "negative";
  if (r < 0.30) return "infinitive_sequence";
  return "normal";
}

function buildSystemPrompt(style: QuestionStyle) {
  const negativeBlock = `

MODO PREGUNTA NEGATIVA (obligatorio para esta pregunta en concreto, hallazgo real: el examen oficial
de PMI usa este patrón con frecuencia y el banco no tenía ninguna pregunta así): en vez de pedir la
MEJOR acción, esta pregunta debe pedir identificar la opción INCORRECTA o INAPROPIADA. Usa una
fórmula explícita al final del enunciado, variando entre estas construcciones reales del examen:
"¿Cuál de las siguientes acciones NO debería tomar el director del proyecto?", "Todas las siguientes
son apropiadas EXCEPTO:", "¿Cuál de las siguientes opciones NO representa una buena práctica en este
contexto?", "¿Cuál de las siguientes acciones sería inapropiada?".

En este modo la estructura de las 4 opciones se INVIERTE respecto al modo normal:
- 3 opciones deben ser acciones o prácticas genuinamente BUENAS y profesionales en este contexto
  (variantes plausibles de una buena respuesta, cada una con matices distintos pero todas correctas)
  -- NINGUNA de estas 3 lleva "error_type".
- 1 opción es la que hay que marcar: una acción o práctica realmente INAPROPIADA o incorrecta en
  este contexto -- ESTA es la que va en "correct_answer" (porque es la que el candidato debe
  seleccionar), y SÍ debe llevar su "error_type" correspondiente (el tipo de error real que la hace
  inapropiada: role/sequence/analysis/approach/knowledge/interpretation/reading/time/wrong_document/
  unsupervised_delegation, el que mejor la describa).
Debes declarar explícitamente en el JSON el campo "is_negative": true.`;

  const infinitiveBlock = `

MODO SECUENCIA DE INFINITIVOS (obligatorio para esta pregunta en concreto, hallazgo real: patrón
frecuente en el examen oficial de PMI que el banco apenas usaba): las 4 opciones deben construirse
como listas de 2 o 3 verbos en infinitivo encadenados, MUY similares entre sí en contenido y
extensión -- la dificultad debe residir en identificar el ORDEN correcto o el verbo correcto, no en
distinguir contenidos muy distintos entre opciones. Ejemplo del patrón (no copies el contenido, solo
la estructura): correcta "Analizar el impacto del cambio, documentar la decisión y aprobar la
ejecución"; distractor "Documentar la decisión, analizar el impacto del cambio y aprobar la
ejecución" (mismo contenido, orden incorrecto -- error_type "sequence"); distractor "Analizar el
impacto del cambio, aprobar la ejecución y documentar la decisión" (orden incorrecto -- error_type
"sequence"); distractor "Notificar el cambio al equipo, analizar el impacto y aprobar la ejecución"
(un verbo cambiado por otro que no corresponde en este punto del proceso -- error_type "knowledge" o
"reading" según el caso). Las 4 opciones deben tener una longitud y estructura gramatical casi
idénticas -- si una opción es visiblemente más larga o distinta en forma que las demás, pierde el
sentido del patrón.`;

  const styleInstruction = style === "negative" ? negativeBlock : style === "infinitive_sequence" ? infinitiveBlock : "";

  return `Eres un redactor experto de exámenes de certificación de project management, familiarizado con el
Exam Content Outline (ECO) 2026 de PMI. Tu única fuente de verdad es la tarea y los enablers del ECO que se
te proporcionan — NUNCA cites literalmente ni parafrasees de cerca el PMBOK u otro material protegido, y
nunca menciones marcas registradas de PMI fuera del contexto normal de un examen de práctica no oficial.
Genera escenarios realistas que evalúen juicio situacional, no memorización.

FORMATO DE TEXTO (crítico, causa de errores si se ignora): dentro de "stem", "options[].text" y
"explanation" NUNCA uses comillas dobles ("). Si necesitas citar literalmente lo que dice un
interesado o un documento, usa comillas simples (') o comillas angulares (« »). Las comillas dobles
sin escapar dentro del texto rompen el JSON de salida — evítalas por completo.

DISEÑO DE DISTRACTORES (obligatorio salvo que el MODO PREGUNTA NEGATIVA de más abajo indique lo
contrario para esta pregunta en concreto): cada opción incorrecta debe ser plausible pero fallar por
una razón concreta y clasificable en uno de estos tipos de error:
- "sequence": es una acción válida, pero no la que corresponde hacer PRIMERO.
- "role": la decisión o acción corresponde a otra persona/rol, no al director de proyecto en este contexto.
- "approach": aplica lógica predictiva en un contexto ágil, o viceversa.
- "analysis": actúa sin considerar toda la información relevante del escenario (se precipita).
- "knowledge": refleja un concepto o principio incorrecto.
- "interpretation": malinterpreta la situación descrita.
- "reading": ignora un dato o palabra decisiva del enunciado.
- "time": implica dedicar tiempo/urgencia de forma desproporcionada (o precipitarse sin analizar).
- "wrong_document": la opción invoca un artefacto/documento real del proyecto, pero NO el que gobierna
  esta situación concreta (ej. consultar el registro de riesgos cuando lo que corresponde es el plan de
  gestión de cambios).
- "unsupervised_delegation": la opción deja que un tercero (proveedor, IA/ML, o un solo miembro del
  equipo) tome o ejecute la decisión sin validación humana ni supervisión -- patrón especialmente
  relevante en preguntas sobre IA: la opción correcta NUNCA es "adoptar/aplicar el resultado de la IA
  sin más", exige análisis conjunto con el equipo o validación humana antes de actuar sobre él.
Asigna un "error_type" (uno de estos 10 valores exactos) a la opción u opciones que correspondan según
las reglas de esta sección y, si aplica, del MODO PREGUNTA NEGATIVA de más abajo. Este campo "error_type"
es SOLO metadato interno del sistema (va en el JSON, nunca en el texto que lee el candidato) -- ver más
abajo la regla de fuga de jerga, que es tan obligatoria como esta.
${styleInstruction}

TERMINOLOGÍA (obligatorio): esta pregunta se rige por PMBOK 8 (publicado ene 2026), NO por PMBOK 6/7.
NUNCA nombres un proceso concreto al estilo PMBOK 6 (ej. "Desarrollar el Cronograma", "Recopilar
Requisitos") ni uses "áreas de conocimiento" o "triple restricción" como términos -- PMBOK 8 organiza
el contenido en 7 dominios de desempeño (Gobernanza, Alcance, Cronograma, Finanzas, Interesados,
Recursos, Riesgo) y 6 principios, sin una lista cerrada de 49 procesos con nombre. EXCEPCIÓN
confirmada por la clave de respuestas real: "Realizar el control integrado de cambios" SÍ es
vocabulario vivo del examen 2026 (14 apariciones en las 180 preguntas oficiales, forma heredada que
el examen retiene aunque PMBOK 8 renombró la técnica) -- úsalo con normalidad cuando el contexto sea
control de cambios, no lo trates como un proceso PMBOK 6 prohibido.

ESTILO DE LA RESPUESTA CORRECTA (verificado contra la clave real de 152 preguntas oficiales del PMI con
respuesta confirmada, agosto 2026 -- NO uses esto como regla mecánica): el patrón de "verbo analítico +
acción" (analizar/evaluar/revisar/reunirse/consultar + acción resultante) aparece en la correcta en
aproximadamente el 40% de los casos reales -- es una tendencia real pero MINORITARIA, no la norma. El rasgo
que sí es consistente en casi todas las correctas es más amplio: una acción medida y profesional (nunca
drástica, nunca precipitada, nunca delega sin supervisión), que puede estar redactada como verbo compuesto
("analizar el impacto y ajustar...") o como un único verbo igualmente medido ("perfeccionar la lista de
trabajo pendiente", "facilitar un debate estructurado"). NO fuerces el patrón de verbo compuesto en cada
pregunta -- varía la redacción libremente, y evita que la única opción con verbo compuesto sea siempre la
correcta, porque eso vuelve la pregunta adivinable por estilo de redacción en vez de por juicio profesional
real. Las 4 opciones deben tener una extensión y nivel de detalle similares entre sí.

TEMAS A CONSIDERAR SI ENCAJAN CON LA TAREA (confirmados en el examen oficial real, no forzar en toda
pregunta): gobernanza de decisiones con IA (validar el resultado con juicio humano, nunca adoptarlo sin
más), institucionalización de lecciones aprendidas más allá del proyecto individual, juicio sobre cuándo
NO escalar aunque haya presión de un interesado sénior, integridad y transparencia de los datos de reporte,
adaptar la comunicación a audiencias con intereses divergentes sin perder coherencia, realización de
beneficios post-entrega (no solo cumplir el cronograma).

CALIDAD DE LA EXPLICACIÓN (obligatoria): la explicación debe, en un solo texto fluido:
1. Indicar cuál es la mejor respuesta (o, en el MODO PREGUNTA NEGATIVA, cuál es la opción incorrecta que
   hay que marcar) y qué dato del enunciado resulta decisivo para elegirla.
2. Explicar el razonamiento que conduce a la solución (qué principio profesional se evalúa).
3. Explicar por qué CADA una de las demás opciones es menos adecuada (o, en negativa, por qué cada una de
   las otras 3 SÍ son buenas prácticas), en lenguaje natural y profesional (ej. "es una acción válida pero
   prematura", "correspondería al patrocinador, no al director de proyecto") -- NUNCA nombrando la
   etiqueta de clasificación interna, en ningún idioma. Ver la regla de fuga de jerga más abajo, de
   cumplimiento obligatorio.
${terminologiaObligatoria()}

Responde ÚNICAMENTE con JSON válido, sin texto adicional ni backticks, con esta forma exacta:
{"stem":"...","is_negative":false,"options":[{"id":"A","text":"...","error_type":"sequence"},{"id":"B","text":"..."},{"id":"C","text":"...","error_type":"role"},{"id":"D","text":"...","error_type":"analysis"}],"correct_answer":["B"],"explanation":"...","difficulty":<entero 1-5 según se te indique, NUNCA un valor fijo por defecto>}
(el ejemplo de arriba es formato normal; en MODO PREGUNTA NEGATIVA, "is_negative" debe ser true y solo la
opción que va en "correct_answer" lleva "error_type", las otras 3 no).

Recuerda: responde SOLO el JSON, nada de texto antes o después, aunque el bloque de arriba sea largo.`;
}

function buildUserPrompt(task: any, approach: string, format: string, targetDifficulty: number, focusTags: string[], targetLetter: string, targetProcessGroup: string, targetThemes: Theme[], targetPerformanceDomain: string, targetMultiLetters: string[] | null, rejectionContext: string, style: QuestionStyle) {
  const enablers = (task.eco_enablers ?? []).map((e: any) => `- ${e.description}`).join("\n");
  const focusLine = focusTags.length > 0 ? `\nTemas transversales a entretejer si es natural: ${focusTags.join(", ")}` : "";
  const themeLine = targetThemes.length > 0
    ? `\n\nTEMÁTICA(S) (obligatorio, todas las indicadas): ${targetThemes.map((t) => THEME_INSTRUCTIONS[t]).join(" ")}`
    : "";
  const answerPositionBlock = targetMultiLetters
    ? `POSICIÓN DE LAS RESPUESTAS CORRECTAS (obligatorio, no lo cambies): debes generar EXACTAMENTE 5
opciones (A, B, C, D, E). Las opciones correctas deben ser EXACTAMENTE ${targetMultiLetters.map((l) => `"${l}"`).join(", ")}
-- es decir, "correct_answer" debe ser exactamente [${targetMultiLetters.map((l) => `"${l}"`).join(", ")}].
Las otras ${5 - targetMultiLetters.length} opciones son distractores individuales, cada uno incorrecto por
sí solo aunque pueda parecer razonable. Esta pregunta solo se considera acertada si el candidato marca
EXACTAMENTE esas ${targetMultiLetters.length} opciones, ninguna más y ninguna menos -- constrúyela así
desde el principio. El enunciado debe usar exactamente esta fórmula según N: si N=${targetMultiLetters.length} es 3, usa "Seleccione todas
las opciones que correspondan"; si N=${targetMultiLetters.length} es 2, usa la
forma cerrada "Seleccione 2 opciones".`
    : `POSICIÓN DE LA RESPUESTA CORRECTA (obligatorio, no lo cambies): la opción correcta debe quedar en la
posición "${targetLetter}". Es decir, "correct_answer" debe ser exactamente ["${targetLetter}"], y el
resto de posiciones (A, B, C, D excluyendo "${targetLetter}") deben ser los distractores (o, en MODO
PREGUNTA NEGATIVA, las otras 3 buenas prácticas). Construye tu razonamiento y el orden de las opciones
directamente para que esto sea cierto desde el principio — no generes la pregunta con la correcta en
otra posición y la corrijas después.`;
  const styleLine = style === "negative"
    ? "\n\nRECORDATORIO: esta pregunta usa el MODO PREGUNTA NEGATIVA descrito en las instrucciones del sistema -- pide la opción incorrecta, no la correcta."
    : style === "infinitive_sequence"
    ? "\n\nRECORDATORIO: esta pregunta usa el MODO SECUENCIA DE INFINITIVOS descrito en las instrucciones del sistema -- las 4 opciones deben ser listas de verbos en infinitivo muy similares entre sí."
    : "";
  const processGroupLine = targetProcessGroup === "monitoring_control"
    ? `GRUPO DE PROCESO / ÁREA DE ENFOQUE (obligatorio): el escenario debe centrarse en actividades de
Monitoreo y Control (revisión de avance, detección de desviaciones, control de cambios, informes de
desempeño). IMPORTANTE: nunca escribas que el proyecto "está" o "se encuentra" o "entró" en la etapa de
Monitoreo y Control, como si fuera una fase secuencial separada -- M&C es paralelo y continuo a
Planificación y Ejecución. Ambienta la situación en una revisión, informe o hallazgo concreto (ej. "durante
una revisión quincenal...", "al analizar el último informe de avance...") sin declarar una etapa formal.`
    : `GRUPO DE PROCESO / ÁREA DE ENFOQUE (obligatorio): el escenario debe situarse claramente en ${PROCESS_GROUP_ARTICLED_LABELS[targetProcessGroup]}
del ciclo de vida del proyecto. IMPORTANTE (hallazgo real del PO, sep 2026): PMBOK 8 llama a esto un Área
de Enfoque, NO una fase ni una etapa secuencial -- NUNCA escribas "la fase de ${PROCESS_GROUP_LABELS[targetProcessGroup]}"
ni "la etapa de ${PROCESS_GROUP_LABELS[targetProcessGroup]}"; nombra el Área de Enfoque directamente como
sustantivo (ej. "durante ${PROCESS_GROUP_ARTICLED_LABELS[targetProcessGroup]}...", "en ${PROCESS_GROUP_ARTICLED_LABELS[targetProcessGroup]} del proyecto...").
Deja claro en el propio enunciado en qué momento del proyecto ocurre la situación, para que sea
reconocible sin ambigüedad.`;
  return `Dominio ECO: ${task.eco_domains.name}
Tarea: ${task.title}
Enablers de referencia:
${enablers}

Enfoque de gestión de proyectos: ${approach}
Formato: ${format}${focusLine}${themeLine}

Genera UNA pregunta de examen tipo PMP en español (neutro, España/LATAM), situacional, evaluando esta tarea.

${answerPositionBlock}${styleLine}

DIFICULTAD (obligatorio, no lo cambies): el campo "difficulty" de tu respuesta debe ser exactamente el
número ${targetDifficulty} (escala 1-5, donde 1 es muy fácil y 5 es muy difícil). Construye el enunciado,
la longitud, la ambigüedad de las opciones y la complejidad del razonamiento requerido para que
correspondan de verdad a ese nivel de dificultad — no pongas siempre un valor intermedio por defecto.

${processGroupLine}

DOMINIO DE DESEMPEÑO (obligatorio, no lo cambies): la pregunta debe girar principalmente en torno a
"${PERFORMANCE_DOMAIN_LABELS[targetPerformanceDomain]}". Esta etiqueta es independiente de la tarea ECO
indicada arriba — no hace falta que coincidan; solo asegúrate de que el contenido real de la pregunta
(la decisión que debe tomar el candidato) esté genuinamente relacionado con "${PERFORMANCE_DOMAIN_LABELS[targetPerformanceDomain]}".${rejectionContext}${pickStyleExamples(2)}`;
}

const VALID_ERROR_TYPES = ["knowledge", "interpretation", "sequence", "role", "approach", "reading", "analysis", "time", "wrong_document", "unsupervised_delegation"];

const WEIGHTED_PROCESS_GROUPS = [
  "initiation",
  "planning", "planning", "planning",
  "execution", "execution",
  "monitoring_control", "monitoring_control", "monitoring_control",
  "closing",
] as const;
const PROCESS_GROUP_LABELS: Record<string, string> = {
  initiation: "Inicio",
  planning: "Planificación",
  execution: "Ejecución",
  monitoring_control: "Monitoreo y Control",
  closing: "Cierre",
};
const PROCESS_GROUP_ARTICLED_LABELS: Record<string, string> = {
  initiation: "el Inicio",
  planning: "la Planificación",
  execution: "la Ejecución",
  monitoring_control: "el Monitoreo y Control",
  closing: "el Cierre",
};

const PERFORMANCE_DOMAINS = ["gobernanza", "alcance", "cronograma", "finanzas", "recursos", "riesgos", "interesados"] as const;
const PERFORMANCE_DOMAIN_LABELS: Record<string, string> = {
  gobernanza: "Gobernanza",
  alcance: "Alcance",
  cronograma: "Cronograma",
  finanzas: "Finanzas",
  recursos: "Recursos",
  riesgos: "Riesgos",
  interesados: "Interesados",
};

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

function repairUnescapedQuotes(text: string): string {
  let result = "";
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escapeNext) {
      result += ch;
      escapeNext = false;
      continue;
    }
    if (ch === "\\") {
      result += ch;
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      if (!inString) {
        inString = true;
        result += ch;
      } else {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        const next = text[j];
        if (next === ":" || next === "," || next === "}" || next === "]" || j >= text.length) {
          inString = false;
          result += ch;
        } else {
          result += '\\"';
        }
      }
      continue;
    }
    result += ch;
  }
  return result;
}

function sanitizeOptions(options: any[]): any[] {
  return options.map((opt) => {
    const clean: { id: string; text: string; error_type?: string } = { id: opt.id, text: opt.text };
    if (opt.error_type && typeof opt.error_type === "string" && VALID_ERROR_TYPES.includes(opt.error_type)) {
      clean.error_type = opt.error_type;
    }
    return clean;
  });
}

function validateDraft(draft: any, targetLetter: string, targetDifficulty: number, targetMultiLetters: string[] | null, style: QuestionStyle): string[] {
  const issues: string[] = [];
  if (!draft.stem || draft.stem.length < 20) issues.push("Enunciado demasiado corto");
  if (!Array.isArray(draft.options) || draft.options.length < 2) issues.push("Menos de 2 opciones");

  const isNegative = style === "negative";
  if (isNegative && draft.is_negative !== true) {
    issues.push("Se pidió MODO PREGUNTA NEGATIVA pero el draft no declaró is_negative:true");
  }
  if (style !== "negative" && draft.is_negative === true) {
    issues.push("El draft declaró is_negative:true sin habérselo pedido");
  }

  if (targetMultiLetters) {
    if (!Array.isArray(draft.options) || draft.options.length !== 5) {
      issues.push(`mc_multi debe tener exactamente 5 opciones (llegaron ${draft.options?.length ?? 0})`);
    }
    if (!Array.isArray(draft.correct_answer) || draft.correct_answer.length !== targetMultiLetters.length) {
      issues.push(`mc_multi debe tener exactamente ${targetMultiLetters.length} respuestas correctas (llegaron ${draft.correct_answer?.length ?? 0})`);
    } else {
      const got = [...draft.correct_answer].sort();
      const want = [...targetMultiLetters].sort();
      if (JSON.stringify(got) !== JSON.stringify(want)) {
        issues.push(`Las respuestas correctas de mc_multi no coinciden con las solicitadas (pedidas: ${want.join(",")}, recibidas: ${got.join(",")})`);
      }
    }
  }
  if (!Array.isArray(draft.correct_answer) || draft.correct_answer.length === 0) {
    issues.push("correct_answer vacío");
  } else if (Array.isArray(draft.options)) {
    const ids = new Set(draft.options.map((o: any) => o.id));
    if (!draft.correct_answer.every((id: string) => ids.has(id))) {
      issues.push("correct_answer no coincide con options");
    }
    if (!targetMultiLetters && !draft.correct_answer.includes(targetLetter)) {
      issues.push(`La respuesta correcta no quedó en la posición solicitada (${targetLetter})`);
    }
    for (const opt of draft.options) {
      if (!opt.text || String(opt.text).trim().length < 3) {
        issues.push(`Opción ${opt.id} sin texto (posible corrupción de JSON)`);
      }
      const isMarkedAnswer = draft.correct_answer?.includes(opt.id);
      const shouldHaveErrorType = isNegative ? isMarkedAnswer : !isMarkedAnswer;
      if (shouldHaveErrorType) {
        if (!opt.error_type) issues.push(`Opción ${opt.id} debería llevar error_type y no lo tiene`);
        else if (!VALID_ERROR_TYPES.includes(opt.error_type)) issues.push(`Opción ${opt.id} con error_type inválido: ${opt.error_type}`);
      } else if (opt.error_type) {
        issues.push(`Opción ${opt.id} no debería llevar error_type (es una opción correcta/buena práctica) pero tiene: ${opt.error_type}`);
      }
    }
    issues.push(...detectOptionTextIssues(draft.options));
  }
  if (!draft.explanation || draft.explanation.length < 20) issues.push("Explicación ausente o corta");
  if (Number(draft.difficulty) !== targetDifficulty) {
    issues.push(`La dificultad devuelta (${draft.difficulty}) no coincide con la solicitada (${targetDifficulty})`);
  }
  const fullText = `${draft.stem ?? ""}\n${draft.explanation ?? ""}`;
  for (const p of FORBIDDEN_PATTERNS) if (p.test(fullText)) issues.push("Contiene patrón no permitido");
  if (detectErrorTypeLeak(draft.explanation ?? "")) {
    issues.push("La explicación menciona literalmente la etiqueta de clasificación interna (error_type) -- fuga de jerga, prohibido");
  }
  return issues;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getAuthenticatedUser(req);
  if (!user) return errorResponse("No autenticado", 401);
  if (!(await requireAdmin(user.id))) return errorResponse("No autorizado (requiere rol admin)", 403);

  const admin = getSupabaseAdmin();

  if (req.method === "GET") {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? url.searchParams.get("page_size") ?? 20);
    const offset = Number(
      url.searchParams.get("offset") ??
        (Number(url.searchParams.get("page") ?? 1) - 1) * limit,
    );

    const { data, error, count } = await admin
      .from("generation_jobs")
      .select("*, llm_connectors(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 500);

    const jobs = data ?? [];
    const allTaskIds = [...new Set(jobs.flatMap((j: any) => j.task_ids ?? []))];
    const { data: tasks } = allTaskIds.length
      ? await admin.from("eco_tasks").select("id, title").in("id", allTaskIds)
      : { data: [] as any[] };
    const taskTitleById = new Map((tasks ?? []).map((t: any) => [t.id, t.title]));

    const enriched = jobs.map((j: any) => ({
      ...j,
      connector_name: j.llm_connectors?.name ?? null,
      task_titles: (j.task_ids ?? []).map((id: string) => taskTitleById.get(id) ?? id),
    }));

    return jsonResponse({ data: enriched, total: count ?? enriched.length });
  }

  if (req.method !== "POST") return errorResponse("Método no soportado", 405);

  const body: CreateJobBody = await req.json();
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

  const { data: job, error: jobErr } = await admin
    .from("generation_jobs")
    .insert({
      connector_id: body.connector_id,
      requested_by: user.id,
      task_ids: body.task_ids,
      approach: normalizeApproach(body.approach),
      format: body.format === "mixed" ? "mc_single" : (body.format ?? "mc_single"),
      count_requested: body.count_requested,
      difficulty_min: body.difficulty_min ?? 1,
      difficulty_max: body.difficulty_max ?? 5,
      focus_tags: body.focus_tags ?? [],
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (jobErr) return errorResponse(jobErr.message, 500);

  const normalizedApproach = normalizeApproach(body.approach);
  const approaches = normalizedApproach ? [normalizedApproach] : ["predictive", "agile", "hybrid"];
  const MIXED_FORMATS = ["mc_single", "mc_multi"];
  const formats = body.format === "mixed" ? MIXED_FORMATS : [body.format ?? "mc_single"];
  let generated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < body.count_requested; i++) {
    const taskId = body.task_ids[i % body.task_ids.length];
    const approach = approaches[i % approaches.length];
    const format = formats[i % formats.length];
    const targetLetter = ["A", "B", "C", "D"][i % 4];
    const MC_MULTI_PAIRS = [
      ["A", "B"], ["A", "C"], ["A", "D"], ["A", "E"], ["B", "C"],
      ["B", "D"], ["B", "E"], ["C", "D"], ["C", "E"], ["D", "E"],
    ];
    const MC_MULTI_TRIPLES = [
      ["A", "B", "C"], ["A", "B", "D"], ["A", "B", "E"], ["A", "C", "D"], ["A", "C", "E"],
      ["A", "D", "E"], ["B", "C", "D"], ["B", "C", "E"], ["B", "D", "E"], ["C", "D", "E"],
    ];
    const useTriple = Math.random() < 0.35;
    const targetMultiLetters = format === "mc_multi"
      ? (useTriple ? MC_MULTI_TRIPLES[i % MC_MULTI_TRIPLES.length] : MC_MULTI_PAIRS[i % MC_MULTI_PAIRS.length])
      : null;
    const diffMin = body.difficulty_min ?? 1;
    const diffMax = body.difficulty_max ?? 5;
    const targetDifficulty = Math.floor(Math.random() * (diffMax - diffMin + 1)) + diffMin;

    const targetProcessGroup = WEIGHTED_PROCESS_GROUPS[i % WEIGHTED_PROCESS_GROUPS.length];

    const targetPerformanceDomain = PERFORMANCE_DOMAINS[i % PERFORMANCE_DOMAINS.length];

    const targetThemes = pickThemes();

    const style: QuestionStyle = targetMultiLetters ? "normal" : pickQuestionStyle();

    const { data: task } = await admin
      .from("eco_tasks")
      .select("id, title, eco_domains(name, code), eco_enablers(description)")
      .eq("id", taskId)
      .single();

    if (!task) { failed++; errors.push(`Tarea ${taskId} no encontrada`); continue; }

    const maxAttempts = 2;
    let draft: any = null;
    let lastIssues: string[] = [];
    let parseFailedBothAttempts = true;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const rejectionContext = await buildRejectionContext(admin, taskId);
        const result = await callLlm(
          { provider: connectorRow.provider, model_id: connectorRow.model_id, api_base_url: connectorRow.api_base_url, apiKey },
          buildSystemPrompt(style),
          buildUserPrompt(task, approach, format, targetDifficulty, body.focus_tags ?? [], targetLetter, targetProcessGroup, targetThemes, targetPerformanceDomain, targetMultiLetters, rejectionContext, style),
        );

        const cleaned = result.text.replace(/```json|```/g, "").trim();
        let candidate: any;
        try {
          candidate = JSON.parse(cleaned);
        } catch {
          candidate = JSON.parse(repairUnescapedQuotes(cleaned));
        }
        parseFailedBothAttempts = false;

        const issues = validateDraft(candidate, targetLetter, targetDifficulty, targetMultiLetters, style);
        if (issues.length === 0) {
          draft = candidate;
          break;
        }
        lastIssues = issues;
      } catch (attemptErr) {
        lastIssues = [`intento ${attempt}: ${(attemptErr as Error).message}`];
      }
    }

    if (!draft) {
      failed++;
      errors.push(`Ítem ${i + 1}: ${lastIssues.join("; ")} (tras ${maxAttempts} intentos)`);
      if (generated === 0 && failed >= 2 && parseFailedBothAttempts) {
        errors.push(`Lote detenido tras ${failed} fallos consecutivos: revisa el modelo/clave del conector antes de reintentar.`);
        break;
      }
      continue;
    }

    try {
      const { data: insertedQuestion } = await admin.from("questions").insert({
        item_type: "standalone",
        format,
        stem: draft.stem,
        options: sanitizeOptions(draft.options),
        correct_answer: draft.correct_answer,
        explanation: draft.explanation,
        task_id: taskId,
        approach,
        difficulty: targetDifficulty,
        process_group: targetProcessGroup,
        performance_domain: targetPerformanceDomain,
        focus_tags: [...(body.focus_tags ?? []), ...targetThemes],
        status: "draft",
        generation_job_id: job.id,
      }).select("id").single();

      if (insertedQuestion) {
        await admin.from("question_tags").insert(tagRowsFor(insertedQuestion.id, {
          domainCode: task.eco_domains.code,
          approach,
          processGroup: targetProcessGroup,
          performanceDomain: targetPerformanceDomain,
          themes: targetThemes,
          isCase: false,
          format,
        }));
      }
      generated++;
    } catch (err) {
      failed++;
      errors.push(`Ítem ${i + 1}: ${(err as Error).message}`);

      if (generated === 0 && failed >= 2) {
        errors.push(
          `Lote detenido tras ${failed} fallos consecutivos: revisa el modelo/clave del conector antes de reintentar.`,
        );
        break;
      }
    }
  }

  const { data: updatedJob, error: updateErr } = await admin
    .from("generation_jobs")
    .update({
      status: "completed",
      count_generated: generated,
      count_failed: failed,
      error_message: errors.length > 0 ? errors.slice(0, 20).join(" | ") : null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", job.id)
    .select()
    .single();

  if (updateErr) return errorResponse(updateErr.message, 500);
  return jsonResponse({ job: updatedJob });
});
