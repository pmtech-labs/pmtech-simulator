export type DomainCode = "people" | "process" | "business";

export type QuestionFormat =
  | "mc_single"
  | "mc_multi"
  | "matching"
  | "pulldown"
  | "graphic_based"
  | "hotspot";

/** Payload de preguntas con gráfico/artefacto (formato graphic_based). */
export interface GraphicPayload {
  /** Campo abierto: hoy solo se renderiza "earned_value". */
  chart_type: string;
  evChart?: {
    labels: string[];
    pv: number[];
    ev: number[];
    ac: number[];
  };
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

export interface MatchingPayload {
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
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
  /** ids de opción correctos, o pares correctos para matching */
  correctAnswer: string[];
  taskCode: string;
  taskTitle: string;
  domain: DomainCode;
  approach: "predictive" | "agile" | "hybrid";
  difficulty: 1 | 2 | 3;
  /** Sección del examen completo a la que pertenece el ítem (1-3). */
  sectionNumber?: number;
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
