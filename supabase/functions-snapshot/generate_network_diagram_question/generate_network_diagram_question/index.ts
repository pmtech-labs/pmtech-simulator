// Edge Function: generate_network_diagram_question
//
// POST -> genera preguntas de diagrama de red (CPM/PDM) de forma determinista:
//   1. La topología de la red y las duraciones se generan/randomizan por código.
//   2. El cálculo de ruta crítica (forward/backward pass, ES/EF/LS/LF, holgura) se hace
//      con un algoritmo determinista en este mismo archivo -- NUNCA se le pide a un LLM
//      que calcule ni verifique esta matemática.
//   3. Los 4 distractores se construyen con plantillas deterministas ligadas al tipo de
//      error, usando los datos reales calculados -- nunca texto libre de un LLM.
//   4. El SVG del diagrama se genera programáticamente a partir de los mismos datos.
//
// No se usa ningún conector LLM en esta función. generation_job_id queda NULL.
//
// Fiabilidad (ago 2026, hallazgo real de una revisión de preguntas ya publicadas/rechazadas
// por el PO): la explicación generada citaba literalmente "(error de tipo reading)" /
// "(error de tipo knowledge)" / "(error de tipo analysis)" -- jerga interna de clasificación
// visible para el candidato, y además solo repetía un fragmento truncado (40 caracteres) del
// texto de cada opción en vez de explicar POR QUÉ falla. Se sustituyó por frases naturales
// y completas, específicas para cada combinación de rama (crítica / holgura suficiente /
// holgura agotada) y tipo de error, sin mencionar nunca la etiqueta interna.
//
// Fiabilidad (ago 2026, segundo hallazgo real -- 3 preguntas rechazadas por el PO): en la
// TOPOLOGIES[0] (9 actividades), la actividad I depende de E y H, pero E está en el nivel 2
// y H en el nivel 3 -- la arista E->I salta el nivel 3. Como E, H e I caen siempre en la
// primera fila de su nivel respectivo (por el orden de construcción del array), la línea
// recta E->I pasaba visualmente por encima de la caja de H el 100% de las veces que se
// elegía esta topología, generando la falsa impresión de que E dependia de H. Se añadió
// detección de colisión línea-caja y enrutado en codo (por el hueco entre filas) para
// cualquier arista cuya línea recta atraviese la caja de un nodo que no sea su origen ni
// su destino.

import { getSupabaseAdmin, getAuthenticatedUser } from "../_shared/supabaseAdmin.ts";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { tagRowsFor } from "../_shared/tagMapping.ts";

interface ActivityDef {
  id: string;
  preds: string[];
}

const TOPOLOGIES: ActivityDef[][] = [
  [
    { id: "A", preds: [] }, { id: "B", preds: [] },
    { id: "C", preds: ["A"] }, { id: "D", preds: ["A", "B"] },
    { id: "E", preds: ["C"] }, { id: "F", preds: ["D"] }, { id: "G", preds: ["D"] },
    { id: "H", preds: ["F", "G"] }, { id: "I", preds: ["E", "H"] },
  ],
  [
    { id: "A", preds: [] },
    { id: "B", preds: ["A"] }, { id: "C", preds: ["A"] },
    { id: "D", preds: ["B", "C"] },
    { id: "E", preds: ["D"] }, { id: "F", preds: ["E"] },
  ],
  [
    { id: "A", preds: [] },
    { id: "B", preds: ["A"] },
    { id: "C", preds: ["B"] }, { id: "D", preds: ["B"] }, { id: "G", preds: ["B"] },
    { id: "E", preds: ["C", "D"] },
    { id: "F", preds: ["E", "G"] },
  ],
];

const PROJECT_CONTEXTS = [
  "un hospital que implementa un nuevo sistema de registro electrónico",
  "una empresa que construye un puente peatonal",
  "un equipo que desarrolla una nueva aplicación móvil",
  "una planta industrial que renueva su línea de producción",
  "una universidad que digitaliza su proceso de matrícula",
  "una empresa de logística que abre un nuevo centro de distribución",
  "un ayuntamiento que renueva el alumbrado público de la ciudad",
  "una aerolínea que actualiza su sistema de check-in",
];

interface CpmNode {
  id: string;
  dur: number;
  preds: string[];
  succs: string[];
  es: number; ef: number; ls: number; lf: number; float: number;
}

function computeCpm(topology: ActivityDef[], durations: Record<string, number>): { nodes: Record<string, CpmNode>; projectDuration: number } {
  const nodes: Record<string, CpmNode> = {};
  for (const a of topology) {
    nodes[a.id] = { id: a.id, dur: durations[a.id], preds: a.preds, succs: [], es: 0, ef: 0, ls: 0, lf: 0, float: 0 };
  }
  for (const a of topology) {
    for (const p of a.preds) nodes[p].succs.push(a.id);
  }
  for (const a of topology) {
    const n = nodes[a.id];
    n.es = a.preds.length === 0 ? 0 : Math.max(...a.preds.map((p) => nodes[p].ef));
    n.ef = n.es + n.dur;
  }
  const projectDuration = Math.max(...Object.values(nodes).map((n) => n.ef));
  for (const a of [...topology].reverse()) {
    const n = nodes[a.id];
    n.lf = n.succs.length === 0 ? projectDuration : Math.min(...n.succs.map((s) => nodes[s].ls));
    n.ls = n.lf - n.dur;
    n.float = n.ls - n.es;
  }
  return { nodes, projectDuration };
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildNetworkSvg(topology: ActivityDef[], nodes: Record<string, CpmNode>): string {
  const W = 100, H = 50, colGap = 140, rowGap = 90;
  const level: Record<string, number> = {};
  for (const a of topology) {
    level[a.id] = a.preds.length === 0 ? 0 : Math.max(...a.preds.map((p) => level[p])) + 1;
  }
  const byLevel: Record<number, string[]> = {};
  for (const a of topology) {
    (byLevel[level[a.id]] ??= []).push(a.id);
  }
  const pos: Record<string, { x: number; y: number }> = {};
  for (const [lvl, ids] of Object.entries(byLevel)) {
    ids.forEach((id, idx) => {
      pos[id] = { x: 20 + Number(lvl) * colGap, y: 20 + idx * rowGap };
    });
  }
  const maxY = Math.max(...Object.values(pos).map((p) => p.y)) + H + 20;
  const maxX = Math.max(...Object.values(pos).map((p) => p.x)) + W + 20;

  const box = (id: string) => {
    const n = nodes[id];
    const { x, y } = pos[id];
    const crit = n.float === 0;
    const fill = crit ? "#dbeafe" : "#f3f4f6";
    const stroke = crit ? "#2563eb" : "#9ca3af";
    const third = H / 3;
    return `<g>
      <rect x="${x}" y="${y}" width="${W}" height="${H}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <line x1="${x}" y1="${y + third}" x2="${x + W}" y2="${y + third}" stroke="${stroke}" stroke-width="1"/>
      <line x1="${x}" y1="${y + 2 * third}" x2="${x + W}" y2="${y + 2 * third}" stroke="${stroke}" stroke-width="1"/>
      <line x1="${x + W / 3}" y1="${y}" x2="${x + W / 3}" y2="${y + third}" stroke="${stroke}" stroke-width="0.75"/>
      <line x1="${x + 2 * W / 3}" y1="${y}" x2="${x + 2 * W / 3}" y2="${y + third}" stroke="${stroke}" stroke-width="0.75"/>
      <line x1="${x + W / 3}" y1="${y + 2 * third}" x2="${x + W / 3}" y2="${y + H}" stroke="${stroke}" stroke-width="0.75"/>
      <line x1="${x + 2 * W / 3}" y1="${y + 2 * third}" x2="${x + 2 * W / 3}" y2="${y + H}" stroke="${stroke}" stroke-width="0.75"/>
      <text x="${x + W / 6}" y="${y + third - 6}" font-size="9" text-anchor="middle">${n.es}</text>
      <text x="${x + W / 2}" y="${y + third - 6}" font-size="9" text-anchor="middle">${n.dur}</text>
      <text x="${x + 5 * W / 6}" y="${y + third - 6}" font-size="9" text-anchor="middle">${n.ef}</text>
      <text x="${x + W / 2}" y="${y + 2 * third - 6}" font-size="10" font-weight="bold" text-anchor="middle">${id}</text>
      <text x="${x + W / 6}" y="${y + H - 6}" font-size="9" text-anchor="middle">${n.ls}</text>
      <text x="${x + W / 2}" y="${y + H - 6}" font-size="9" text-anchor="middle">${n.float}</text>
      <text x="${x + 5 * W / 6}" y="${y + H - 6}" font-size="9" text-anchor="middle">${n.lf}</text>
    </g>`;
  };

  // Detección de colisión: ¿la línea recta entre dos puntos atraviesa la caja (con margen)
  // de algún nodo que no sea el propio origen o destino de la arista? Se muestrea la línea
  // en pasos cortos y se comprueba si algún punto muestreado cae dentro de esa caja.
  function segmentHitsBox(x1: number, y1: number, x2: number, y2: number, bx: number, by: number, bw: number, bh: number, margin = 4): boolean {
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      if (px >= bx - margin && px <= bx + bw + margin && py >= by - margin && py <= by + bh + margin) {
        return true;
      }
    }
    return false;
  }

  function findBlockingNode(fromId: string, toId: string, x1: number, y1: number, x2: number, y2: number): string | null {
    for (const id of Object.keys(pos)) {
      if (id === fromId || id === toId) continue;
      const p = pos[id];
      if (segmentHitsBox(x1, y1, x2, y2, p.x, p.y, W, H)) return id;
    }
    return null;
  }

  const arrow = (a: string, b: string) => {
    const pa = pos[a], pb = pos[b];
    const x1 = pa.x + W, y1 = pa.y + H / 2;
    const x2 = pb.x, y2 = pb.y + H / 2;

    const blocker = findBlockingNode(a, b, x1, y1, x2, y2);
    if (!blocker) {
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arrowhead)"/>`;
    }

    // Hay un nodo intermedio en el camino directo: enruta en codo por el hueco entre filas
    // (por debajo de la fila de origen, o por encima si el origen ya está en la última fila)
    // para no atravesar visualmente la caja del nodo bloqueador.
    const laneBelow = pa.y + H + rowGap / 2;
    const laneAbove = pa.y - rowGap / 2;
    const useBelow = laneAbove < 0 || Math.random() < 0.5;
    const laneY = useBelow ? laneBelow : laneAbove;
    const stub = 14;
    const points = [
      `${x1},${y1}`,
      `${x1 + stub},${y1}`,
      `${x1 + stub},${laneY}`,
      `${x2 - stub},${laneY}`,
      `${x2 - stub},${y2}`,
      `${x2},${y2}`,
    ].join(" ");
    return `<polyline points="${points}" fill="none" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arrowhead)"/>`;
  };

  const boxes = topology.map((a) => box(a.id)).join("");
  const arrows = topology.flatMap((a) => a.preds.map((p) => arrow(p, a.id))).join("");

  return `<svg viewBox="0 0 ${maxX} ${maxY}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#6b7280"/></marker></defs>${boxes}${arrows}</svg>`;
}

interface GeneratedQuestion {
  stem: string;
  options: { id: string; text: string; error_type?: string }[];
  correct_answer: string[];
  explanation: string;
  difficulty: number;
  practicum_payload: { chart_type: string; diagram_svg: string };
}

interface Distractor {
  text: string;
  error_type: string;
  /** Frase natural y completa que explica por qué esta opción falla -- nunca menciona
   * la etiqueta interna de error_type, solo razona sobre los datos del diagrama. */
  explain: string;
}

function generateOne(): GeneratedQuestion {
  const topology = TOPOLOGIES[randInt(0, TOPOLOGIES.length - 1)];
  const durations: Record<string, number> = {};
  for (const a of topology) durations[a.id] = randInt(3, 15);

  const { nodes, projectDuration } = computeCpm(topology, durations);
  const ids = topology.map((a) => a.id);
  const context = PROJECT_CONTEXTS[randInt(0, PROJECT_CONTEXTS.length - 1)];

  const criticalIds = ids.filter((id) => nodes[id].float === 0);
  const nonCriticalIds = ids.filter((id) => nodes[id].float > 0);

  const useCritical = nonCriticalIds.length === 0 || Math.random() < 0.6;

  let correctText: string;
  let distractors: Distractor[];
  let delay: number;
  let target: string;

  if (useCritical) {
    target = criticalIds[randInt(0, criticalIds.length - 1)];
    delay = randInt(2, 8);
    const newDuration = projectDuration + delay;
    correctText = `El proyecto pasa a durar ${newDuration} días, porque ${target} forma parte de la ruta crítica (holgura total = 0).`;

    const otherCritical = criticalIds.filter((id) => id !== target);
    const analysisTarget = otherCritical.length > 0 ? otherCritical[randInt(0, otherCritical.length - 1)] : ids.find((id) => id !== target)!;

    distractors = [
      {
        text: `No afecta a la duración del proyecto porque ${target} tiene holgura positiva.`,
        error_type: "reading",
        explain: `interpreta mal el diagrama: la holgura total de ${target} es cero, no positiva, por eso está en la ruta crítica y cualquier retraso repercute directamente en la fecha de fin del proyecto`,
      },
      {
        text: `Solo afecta a las actividades no críticas del proyecto, no a su fecha de fin.`,
        error_type: "knowledge",
        explain: `confunde el concepto de ruta crítica: cuando la actividad retrasada SÍ es crítica, el retraso siempre se traslada a la fecha de fin del proyecto, no solo a otras actividades`,
      },
      {
        text: `El proyecto se retrasa, pero la actividad ${analysisTarget} deja de ser crítica y absorbe parte del retraso.`,
        error_type: "analysis",
        explain: `se precipita al suponer, sin ningún dato del diagrama que lo respalde, que ${analysisTarget} dejaría de ser crítica y absorbería parte del retraso`,
      },
    ];
  } else {
    target = nonCriticalIds[randInt(0, nonCriticalIds.length - 1)];
    const float = nodes[target].float;
    const noImpact = float >= 2 && Math.random() < 0.5;

    if (noImpact) {
      delay = randInt(1, float - 1 || 1);
      const newFloat = float - delay;
      correctText = `El proyecto sigue durando ${projectDuration} días: la actividad ${target} tenía ${float} día(s) de holgura, así que un retraso de ${delay} día(s) la deja con ${newFloat} día(s) de holgura restante, sin afectar la fecha de fin del proyecto ni volverse crítica.`;
      distractors = [
        {
          text: `El proyecto pasa a durar ${projectDuration + delay} días porque cualquier retraso afecta directamente la fecha de fin.`,
          error_type: "reading",
          explain: `interpreta mal el diagrama: como ${target} tenía ${float} día(s) de holgura disponible, un retraso de ${delay} día(s) queda absorbido sin cambiar la fecha de fin del proyecto`,
        },
        {
          text: `La actividad ${target} pasa a formar parte de la ruta crítica de inmediato.`,
          error_type: "knowledge",
          explain: `confunde el concepto de holgura: una actividad solo se vuelve crítica cuando agota por completo su holgura, y aquí a ${target} todavía le queda holgura disponible`,
        },
        {
          text: `El proyecto termina antes de lo previsto porque ${target} tenía holgura disponible sin usar.`,
          error_type: "analysis",
          explain: `se precipita: tener holgura disponible da margen para absorber retrasos, pero no acorta la duración total del proyecto`,
        },
      ];
    } else {
      delay = float + randInt(1, 6);
      const overrun = delay - float;
      const newDuration = projectDuration + overrun;
      correctText = `El proyecto se retrasa ${overrun} día(s), pasando a durar ${newDuration} días: la actividad ${target} solo tenía ${float} día(s) de holgura, así que el retraso de ${delay} días la agota y además añade ${overrun} día(s) que sí impactan la fecha de fin del proyecto.`;
      distractors = [
        {
          text: `El proyecto se retrasa exactamente ${delay} días, la misma magnitud que el retraso de ${target}.`,
          error_type: "reading",
          explain: `interpreta mal el diagrama: parte de esos ${delay} días de retraso quedan absorbidos por la holgura disponible de ${target} (${float} día(s)), y solo el exceso (${overrun} día(s)) repercute en la fecha de fin`,
        },
        {
          text: `No afecta al proyecto porque ${target} no está en la ruta crítica original.`,
          error_type: "knowledge",
          explain: `confunde el concepto de holgura: al agotarla por completo, ${target} pasa a formar parte de la ruta crítica y el exceso de retraso sí afecta la fecha de fin`,
        },
        {
          text: `El retraso se compensa automáticamente ajustando la ruta crítica sin impacto en la fecha de fin.`,
          error_type: "analysis",
          explain: `se precipita al suponer una compensación automática que ningún dato del diagrama respalda`,
        },
      ];
    }
  }

  const letters = shuffle(["A", "B", "C", "D"]);
  const optionEntries = [
    { text: correctText, error_type: undefined as string | undefined },
    ...distractors,
  ];
  const options = optionEntries.map((opt, idx) => ({
    id: letters[idx],
    text: opt.text,
    ...(opt.error_type ? { error_type: opt.error_type } : {}),
  }));
  const correctLetter = letters[0];

  const stem = `En ${context}, se ha modelado el proyecto con el diagrama de red que se muestra a continuación, usando el método de diagramación por precedencia (PDM), con las fechas de inicio y fin tempranas y tardías ya calculadas. Si la actividad ${target} se retrasa ${delay} día(s), ¿qué ocurre?`;

  const explanation = `${correctText} ` +
    distractors.map((d) => `La opción "${d.text}" ${d.explain}.`).join(" ");

  const diagramSvg = buildNetworkSvg(topology, nodes);
  const difficulty = randInt(3, 5);

  return {
    stem,
    options,
    correct_answer: [correctLetter],
    explanation,
    difficulty,
    practicum_payload: { chart_type: "network_diagram", diagram_svg: diagramSvg },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse("Método no soportado", 405);

  const user = await getAuthenticatedUser(req);
  if (!user) return errorResponse("No autenticado", 401);
  if (!(await requireAdmin(user.id))) return errorResponse("No autorizado (requiere rol admin)", 403);

  const body: { task_id: string; count?: number; approach?: string } = await req.json();
  if (!body.task_id) return errorResponse("Falta el campo task_id", 400);

  const count = Math.min(Math.max(body.count ?? 5, 1), 30);
  const admin = getSupabaseAdmin();

  const { data: task, error: taskErr } = await admin.from("eco_tasks").select("id, eco_domains(code)").eq("id", body.task_id).single();
  if (taskErr || !task) return errorResponse("Tarea ECO no encontrada", 404);

  const insertedIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const q = generateOne();
    const { data, error } = await admin
      .from("questions")
      .insert({
        item_type: "standalone",
        format: "graphic_based",
        stem: q.stem,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        task_id: body.task_id,
        approach: body.approach ?? "predictive",
        difficulty: q.difficulty,
        process_group: "monitoring_control",
        performance_domain: "cronograma",
        status: "draft",
        practicum_payload: q.practicum_payload,
        generation_job_id: null,
      })
      .select("id")
      .single();
    if (!error && data) {
      insertedIds.push(data.id);
      await admin.from("question_tags").insert(tagRowsFor(data.id, {
        domainCode: (task as any).eco_domains?.code ?? "process",
        approach: body.approach ?? "predictive",
        processGroup: "monitoring_control",
        performanceDomain: "cronograma",
        themes: [],
        isCase: false,
        format: "graphic_based",
      }));
    }
  }

  return jsonResponse({ generated: insertedIds.length, requested: count, question_ids: insertedIds });
});
