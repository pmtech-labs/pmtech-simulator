import type { CaseCluster, DomainCode, ErrorType, ExamSection, Question } from "@/types/exam";

/**
 * DATOS SIMULADOS
 * TODO: backend — todo este módulo se sustituirá por lecturas a Supabase
 * (tablas eco_domains, eco_tasks, case_clusters, questions) vía services/examService.ts
 */

export const DOMAINS = [
  { code: "people", name: "Personas", weight: 33, token: "people" },
  { code: "process", name: "Procesos", weight: 41, token: "process" },
  { code: "business", name: "Entorno de negocio", weight: 26, token: "business" },
] as const;

export const CLUSTER: CaseCluster = {
  id: "cl-001",
  title: "Caso: Migración de plataforma logística — NorthWind Ibérica",
  scenarioText: [
    "Diriges la migración de la plataforma logística de NorthWind Ibérica a un modelo cloud. El proyecto tiene un presupuesto aprobado (BAC) de 1.200.000 € y una duración planificada de 12 meses. El enfoque es híbrido: la capa de integración se ejecuta en cascada y las aplicaciones de cliente en iteraciones de dos semanas.",
    "Al cierre del mes 6 el equipo de PMO reporta los siguientes datos acumulados: Valor Planificado (PV) 600.000 €, Valor Ganado (EV) 498.000 € y Coste Real (AC) 615.000 €. El patrocinador acaba de comunicar que la fecha de salida a producción no es negociable por un compromiso regulatorio.",
    "El equipo de integración señala que dos dependencias con un proveedor externo se han retrasado cuatro semanas y que la calidad de los datos maestros es peor de lo estimado.",
  ],
  evChart: {
    labels: ["M1", "M2", "M3", "M4", "M5", "M6"],
    pv: [100, 200, 300, 400, 500, 600],
    ev: [95, 180, 262, 340, 420, 498],
    ac: [105, 210, 315, 420, 520, 615],
  },
};

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    itemType: "case_child",
    format: "mc_single",
    clusterId: CLUSTER.id,
    stem: "Con los datos del mes 6, ¿cuál es la interpretación correcta del desempeño del proyecto y la primera acción que debe tomar la directora de proyecto?",
    options: [
      { id: "A", label: "El SPI es 0,83 y el CPI 0,81: el proyecto va retrasado y sobrecoste. Debe analizar causas raíz con el equipo y presentar al patrocinador opciones de compresión del cronograma con su impacto en coste." },
      { id: "B", label: "El CPI es superior a 1, así que solo hay un problema de cronograma. Debe añadir recursos inmediatamente al equipo de integración." },
      { id: "C", label: "Los índices están dentro de la tolerancia habitual del ±20 %. Debe continuar y volver a medir al cierre del mes 8." },
      { id: "D", label: "Debe escalar de inmediato al comité de dirección solicitando una ampliación de presupuesto del 25 % antes de analizar las causas." },
    ],
    correctAnswer: ["A"],
    taskCode: "Proceso · Tarea 5",
    taskTitle: "Gestionar el presupuesto y los recursos del proyecto",
    domain: "process",
    approach: "hybrid",
    difficulty: 3,
    sectionNumber: 1,
    errorType: "analysis",
    explanation: {
      correct:
        "SPI = EV/PV = 498.000/600.000 = 0,83 y CPI = EV/AC = 498.000/615.000 = 0,81. Ambos índices por debajo de 1 indican simultáneamente retraso y sobrecoste. El comportamiento esperado del director de proyecto es diagnosticar la causa raíz con el equipo antes de comprometer acciones, y después presentar al patrocinador alternativas cuantificadas (intensificación o ejecución rápida) con su impacto en coste y riesgo, ya que la fecha es una restricción dura.",
      distractors: [
        { optionId: "B", text: "Confunde la fórmula del CPI: 498.000/615.000 = 0,81, no es superior a 1. Además, añadir recursos sin análisis de causa raíz es intensificar a ciegas y agrava la desviación de coste (ley de Brooks)." },
        { optionId: "C", text: "No existe ninguna tolerancia estándar del ±20 % en el PMBOK; los umbrales de control se definen en el plan de gestión de costes. Esperar dos meses más ante una tendencia negativa sostenida incumple la monitorización proactiva." },
        { optionId: "D", text: "Escalar pidiendo presupuesto antes de analizar causas invierte el orden correcto: el director de proyecto resuelve primero en su ámbito y escala con datos y opciones, no con una petición abierta." },
      ],
      reference: "PMBOK · Medición del desempeño (EVM) · ECO 2026 Proceso T5",
    },
  },
  {
    id: "q2",
    itemType: "case_child",
    format: "mc_multi",
    clusterId: CLUSTER.id,
    stem: "El patrocinador mantiene la fecha regulatoria. Selecciona las DOS acciones más apropiadas para el director de proyecto en este contexto híbrido.",
    options: [
      { id: "A", label: "Repriorizar el backlog de las aplicaciones de cliente con el propietario del producto para entregar primero el alcance regulatorio mínimo viable." },
      { id: "B", label: "Reducir la cobertura de pruebas de la capa de integración para recuperar cuatro semanas." },
      { id: "C", label: "Actualizar el registro de riesgos y ejecutar una respuesta sobre la dependencia del proveedor (escalado contractual o proveedor alternativo)." },
      { id: "D", label: "Congelar la comunicación con el patrocinador hasta disponer de un plan cerrado." },
    ],
    correctAnswer: ["A", "C"],
    taskCode: "Proceso · Tarea 8",
    taskTitle: "Planificar y gestionar la calidad, el alcance y el cronograma",
    domain: "process",
    approach: "hybrid",
    difficulty: 2,
    sectionNumber: 1,
    errorType: "sequence",
    explanation: {
      correct:
        "Con fecha fija y alcance flexible en la parte ágil, la palanca correcta es repriorizar el backlog para asegurar el alcance regulatorio (A). En paralelo, la dependencia externa es un riesgo materializado que exige una respuesta registrada y accionada (C). Ambas son acciones dentro de la autoridad del director de proyecto y coherentes con un enfoque híbrido.",
      distractors: [
        { optionId: "B", text: "Sacrificar calidad para recuperar plazo traslada el coste al futuro y contradice el principio de calidad integrada; nunca es la respuesta preferida en el examen." },
        { optionId: "D", text: "Ocultar información al patrocinador rompe la gestión de interesados y la transparencia; la comunicación debe ser proactiva y continua." },
      ],
      reference: "PMBOK · Principios de calidad e interesados · ECO 2026 Proceso T8",
    },
  },
  {
    id: "q3",
    itemType: "practicum",
    format: "matching",
    stem: "Empareja cada escenario de riesgo con la respuesta más adecuada según el enfoque de gestión aplicable. Arrastra cada respuesta a su escenario.",
    matching: {
      left: [
        { id: "l1", label: "Un proveedor crítico podría no cumplir el SLA y el impacto económico excede la tolerancia de la organización." },
        { id: "l2", label: "Existe incertidumbre técnica alta sobre una integración nunca realizada por el equipo." },
        { id: "l3", label: "Una nueva normativa podría adelantar la fecha de cumplimiento, con beneficio comercial si se llega antes." },
        { id: "l4", label: "Un riesgo de baja probabilidad e impacto mínimo sobre un entregable secundario." },
      ],
      right: [
        { id: "r1", label: "Transferir: contratar seguro o cláusula de penalización con el proveedor." },
        { id: "r2", label: "Mitigar: ejecutar un spike técnico en la próxima iteración para reducir la incertidumbre." },
        { id: "r3", label: "Explotar: asignar los mejores recursos para asegurar la oportunidad." },
        { id: "r4", label: "Aceptar: registrar el riesgo y monitorizarlo sin acción proactiva." },
      ],
      correctPairs: [
        ["l1", "r1"],
        ["l2", "r2"],
        ["l3", "r3"],
        ["l4", "r4"],
      ],
    },
    correctAnswer: ["l1:r1", "l2:r2", "l3:r3", "l4:r4"],
    taskCode: "Proceso · Tarea 3",
    taskTitle: "Evaluar y gestionar los riesgos del proyecto",
    domain: "process",
    approach: "hybrid",
    difficulty: 2,
    sectionNumber: 2,
    errorType: "knowledge",
    explanation: {
      correct:
        "Las estrategias para amenazas son evitar, transferir, mitigar, escalar y aceptar; para oportunidades, explotar, compartir, mejorar, escalar y aceptar. Un impacto económico por encima de la tolerancia se traslada a un tercero (transferir); la incertidumbre técnica se reduce con un spike (mitigar); una oportunidad que se quiere asegurar al 100 % se explota; un riesgo trivial se acepta pasivamente.",
      distractors: [
        { optionId: "l1", text: "Mitigar no elimina la exposición financiera cuando el impacto supera la tolerancia: hace falta trasladar el riesgo a un tercero." },
        { optionId: "l3", text: "Una oportunidad no se 'mitiga'; las estrategias de amenaza no aplican a eventos de impacto positivo." },
      ],
      reference: "PMBOK · Respuestas a riesgos · ECO 2026 Proceso T3",
    },
  },
  {
    id: "q4",
    itemType: "standalone",
    format: "mc_single",
    stem: "Durante la tercera retrospectiva, dos personas del equipo mantienen un desacuerdo técnico que ya ha degenerado en descalificaciones personales y el resto del equipo ha dejado de participar. ¿Qué debe hacer primero el director de proyecto?",
    options: [
      { id: "A", label: "Decidir él mismo la solución técnica para cerrar el debate y recuperar el ritmo del equipo." },
      { id: "B", label: "Reunirse con ambas personas para entender los intereses de cada una y facilitar un acuerdo colaborativo centrado en el problema, no en las personas." },
      { id: "C", label: "Escalar el conflicto al responsable funcional de ambos para que aplique medidas disciplinarias." },
      { id: "D", label: "Reasignar a una de las dos personas a otro equipo para eliminar la fuente del conflicto." },
    ],
    correctAnswer: ["B"],
    taskCode: "Personas · Tarea 1",
    taskTitle: "Gestionar el conflicto",
    domain: "people",
    approach: "agile",
    difficulty: 2,
    sectionNumber: 2,
    errorType: "role",
    explanation: {
      correct:
        "La técnica preferida de resolución de conflictos es colaborar / resolver el problema: se abordan los intereses subyacentes y se busca una solución ganar-ganar centrada en el problema. El director de proyecto actúa como facilitador y servidor del equipo, empezando por comprender antes de decidir.",
      distractors: [
        { optionId: "A", text: "Imponer la solución es 'forzar': resuelve rápido pero deja resentimiento y erosiona la autoorganización del equipo ágil." },
        { optionId: "C", text: "Escalar en primera instancia elude la responsabilidad del director de proyecto y añade una connotación disciplinaria innecesaria." },
        { optionId: "D", text: "Reasignar personas es evitar el conflicto: la causa raíz permanece y el equipo pierde capacidad." },
      ],
      reference: "PMBOK · Gestión del conflicto · ECO 2026 Personas T1",
    },
  },
  {
    id: "q5",
    itemType: "standalone",
    format: "mc_single",
    stem: "A mitad de proyecto, la organización aprueba una nueva política interna de protección de datos que afecta al tratamiento de información de clientes en tu solución. ¿Cuál es la acción más apropiada?",
    options: [
      { id: "A", label: "Continuar según la línea base: la política se aplicará en el siguiente proyecto." },
      { id: "B", label: "Aplicar los cambios técnicos de inmediato para asegurar el cumplimiento antes de informar a nadie." },
      { id: "C", label: "Evaluar el impacto en alcance, cronograma, coste y riesgo, y presentar una solicitud de cambio al comité de control de cambios." },
      { id: "D", label: "Solicitar al patrocinador una exención formal de la nueva política para no alterar la línea base." },
    ],
    correctAnswer: ["C"],
    taskCode: "Entorno · Tarea 2",
    taskTitle: "Evaluar y abordar los cambios del entorno externo y de cumplimiento",
    domain: "business",
    approach: "predictive",
    difficulty: 2,
    sectionNumber: 3,
    errorType: "approach",
    explanation: {
      correct:
        "Todo cambio en requisitos de cumplimiento se analiza en términos de impacto integrado (alcance, tiempo, coste, calidad, riesgo) y se canaliza por el control integrado de cambios. El cumplimiento no es opcional, pero el camino formal preserva la trazabilidad de la línea base.",
      distractors: [
        { optionId: "A", text: "Ignorar un requisito de cumplimiento expone a la organización a sanciones y contradice la responsabilidad del director de proyecto sobre el cumplimiento." },
        { optionId: "B", text: "Ejecutar cambios sin aprobación es un cambio no autorizado ('gold plating' normativo) y rompe el control integrado de cambios." },
        { optionId: "D", text: "Pedir una exención de una política de cumplimiento no es una vía aceptable; el cumplimiento prevalece sobre la línea base." },
      ],
      reference: "PMBOK · Control integrado de cambios · ECO 2026 Entorno T2",
    },
  },
];

export const MOCK_USER = {
  name: "Elena Márquez",
  email: "elena.marquez@pmtech.es",
  initials: "EM",
  plan: "premium_6m" as const,
  planName: "Licencia Premium",
  monthsRemaining: 6,
  expiresAt: "30 de enero de 2027",
  readiness: 68,
  examsTaken: 7,
  hoursTrained: 41.5,
  questionsAnswered: 812,
  streakDays: 12,
  masteryByDomain: { people: 74, process: 66, business: 58 },
};

export const MOCK_EXAM_HISTORY = [
  { id: "ex-07", date: "24 jul 2026", mode: "Simulación completa", questions: 180, score: 71, duration: "3h 52m", status: "Aprobado", domains: ["people", "process", "business"] as DomainCode[], scoreByDomain: { people: 76, process: 70, business: 64 } },
  { id: "ex-06", date: "17 jul 2026", mode: "Práctica · Entorno", questions: 40, score: 58, duration: "48m", status: "Por debajo", domains: ["business"] as DomainCode[], scoreByDomain: { business: 58 } },
  { id: "ex-05", date: "11 jul 2026", mode: "Solo casos", questions: 25, score: 64, duration: "37m", status: "Ajustado", domains: ["process", "business"] as DomainCode[], scoreByDomain: { process: 67, business: 60 } },
  { id: "ex-04", date: "03 jul 2026", mode: "Simulación completa", questions: 180, score: 66, duration: "4h 01m", status: "Ajustado", domains: ["people", "process", "business"] as DomainCode[], scoreByDomain: { people: 70, process: 65, business: 61 } },
  { id: "ex-03", date: "27 jun 2026", mode: "Práctica · Personas", questions: 40, score: 78, duration: "44m", status: "Aprobado", domains: ["people"] as DomainCode[], scoreByDomain: { people: 78 } },
];


export const MOCK_TASK_MASTERY = [
  { code: "P-1", title: "Gestionar el conflicto", domain: "people" as const, mastery: 82 },
  { code: "P-4", title: "Empoderar al equipo", domain: "people" as const, mastery: 71 },
  { code: "PR-3", title: "Evaluar y gestionar riesgos", domain: "process" as const, mastery: 63 },
  { code: "PR-5", title: "Presupuesto y recursos", domain: "process" as const, mastery: 55 },
  { code: "BE-2", title: "Cambios de cumplimiento", domain: "business" as const, mastery: 48 },
  { code: "BE-6", title: "Valor de negocio entregado", domain: "business" as const, mastery: 52 },
];

/** Secciones cronometradas del examen completo (respuesta de start_exam en full_sim). */
export const EXAM_SECTIONS: ExamSection[] = [
  { sectionNumber: 1, count: 2, seconds: 80 * 60 },
  { sectionNumber: 2, count: 2, seconds: 80 * 60 },
  { sectionNumber: 3, count: 1, seconds: 80 * 60 },
];

export const BREAK_SECONDS = 10 * 60;

/** Resumen devuelto por finish_exam (mock). */
export const MOCK_FINISH_SUMMARY = {
  newItemsCount: 3,
  repeatedItemsCount: 2,
  /**
   * Texto fijo que devuelve el backend en `finish_exam` (campo `disclaimer`).
   * Debe mostrarse literalmente, sin parafrasear.
   */
  disclaimer:
    "Este resultado es una estimación basada en un simulador y no predice ni garantiza el resultado del examen oficial PMP®. PMI no avala ni revisa este contenido.",
  interpretationNote:
    "Un 40 % de las preguntas de esta simulación ya las habías respondido antes. Tu puntuación real en el examen oficial podría ser inferior: repite con un banco de preguntas nuevo para obtener una medida fiable de tu preparación.",
};


/** Patrón de errores acumulado del usuario (tabla user_error_type_stats). */
export const MOCK_ERROR_TYPE_STATS: { errorType: ErrorType; occurrences: number }[] = [
  { errorType: "sequence", occurrences: 34 },
  { errorType: "analysis", occurrences: 27 },
  { errorType: "role", occurrences: 21 },
  { errorType: "knowledge", occurrences: 18 },
  { errorType: "approach", occurrences: 15 },
  { errorType: "reading", occurrences: 11 },
  { errorType: "interpretation", occurrences: 9 },
  { errorType: "time", occurrences: 6 },
];
