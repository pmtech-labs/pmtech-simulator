export type DomainCode = "people" | "process" | "business";

export type ProcessGroup =
  | "initiation"
  | "planning"
  | "execution"
  | "monitoring_control"
  | "closing";

export type PerformanceDomain =
  | "gobernanza"
  | "alcance"
  | "cronograma"
  | "finanzas"
  | "recursos"
  | "riesgos"
  | "interesados";

export type FocusTag = "entrega_valor" | "sostenibilidad" | "ia";


export type QuestionFormat =
  | "mc_single"
  | "mc_multi"
  | "matching"
  | "enhanced_matching"
  | "pulldown"
  | "graphic_based"
  | "hotspot";

/** Payload de preguntas con gráfico/artefacto (formato graphic_based). */
export interface GraphicPayload {
  /** Campo abierto: hoy se renderiza "earned_value" y "network_diagram". */
  chart_type: string;
  evChart?: {
    labels: string[];
    pv: number[];
    ev: number[];
    ac: number[];
  };
  /** SVG inline completo para diagramas de red PDM/CPM (ilustrativo, no interactivo). */
  diagram_svg?: string;
}

/** Payload de preguntas hotspot: SVG inline + zonas clicables en % */
export interface HotspotPayload {
  diagram_svg: string;
  hotspots: {
    id: string;
    label: string;
    x_pct: number;
    y_pct: number;
    w_pct: number;
    h_pct: number;
    correct?: boolean;
  }[];
}

/** Diagnóstico de tipo de error devuelto por `submit_answer` en modos formativos. */
export type ErrorType =
  | "knowledge"
  | "interpretation"
  | "sequence"
  | "role"
  | "approach"
  | "reading"
  | "analysis"
  | "time";

/** Sección cronometrada independiente del examen completo (full_sim). */
export interface ExamSection {
  sectionNumber: number;
  count: number;
  seconds: number;
}

export interface Option {
  id: string;
  label: string;
}

/**
 * Payload de emparejamiento. En "enhanced_matching" al menos un lado incluye
 * un gráfico SVG inline (`svg`) en lugar de solo texto.
 */
export interface MatchingItem {
  id: string;
  label: string;
  /** SVG inline opcional (emparejamiento mejorado). */
  svg?: string;
}

export interface MatchingPayload {
  left: MatchingItem[];
  right: MatchingItem[];
  correctPairs: [string, string][];
}


export interface CaseCluster {
  id: string;
  title: string;
  scenarioText: string[];
  /** Serie de valor ganado para el gráfico SVG interactivo (opcional) */
  evChart?: {
    labels: string[];
    pv: number[];
    ev: number[];
    ac: number[];
  };
}

export interface Question {
  id: string;
  itemType: "standalone" | "case_child" | "practicum";
  format: QuestionFormat;
  clusterId?: string;
  stem: string;
  options?: Option[];
  matching?: MatchingPayload;
  /** Payload de gráfico para formato graphic_based */
  graphic?: GraphicPayload;
  /** Payload de diagrama con zonas clicables para formato hotspot */
  hotspot?: HotspotPayload;
  /** ids de opción correctos, o pares correctos para matching */
  correctAnswer: string[];
  taskCode: string;
  taskTitle: string;
  domain: DomainCode;
  approach: "predictive" | "agile" | "hybrid";
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Sección del examen completo a la que pertenece el ítem (1-3). */
  sectionNumber?: number;
  /** Grupo de proceso (Inicio, Planificación…). */
  processGroup?: ProcessGroup;
  /** Dominio de desempeño (Gobernanza, Alcance…). */
  performanceDomain?: PerformanceDomain;
  /** Temáticas transversales (entrega de valor, sostenibilidad, IA). */
  focusTags?: FocusTag[];
  /** Diagnóstico de error asociado a fallar este ítem (modos formativos). */
  errorType?: ErrorType;

  explanation: {
    correct: string;
    distractors: { optionId: string; text: string }[];
    reference: string;
  };
}

export type AnswerValue = string[] | Record<string, string>;

export interface ExamState {
  answers: Record<string, AnswerValue>;
  flagged: Record<string, boolean>;
}
