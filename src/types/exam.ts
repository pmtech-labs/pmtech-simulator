export type DomainCode = "people" | "process" | "business";

export type QuestionFormat = "mc_single" | "mc_multi" | "matching";

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
  /** Serie de valor ganado para el gráfico SVG interactivo */
  evChart: {
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
