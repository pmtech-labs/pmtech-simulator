export function repairUnescapedQuotes(text: string): string {
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

export function parseJsonWithRepair(rawText: string): any {
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return JSON.parse(repairUnescapedQuotes(cleaned));
  }
}

export interface OptionLike {
  id: string;
  text?: string;
  error_type?: string;
}

const VALID_ERROR_TYPES = [
  "knowledge", "interpretation", "sequence", "role", "approach",
  "reading", "analysis", "time", "wrong_document", "unsupervised_delegation",
];

export function validateOptionsText(
  options: OptionLike[] | undefined | null,
  correctAnswerIds: string[] | undefined | null,
  opts: { checkErrorTypes?: boolean; minLength?: number } = {},
): string[] {
  const issues: string[] = [];
  const { checkErrorTypes = true, minLength = 3 } = opts;

  if (!Array.isArray(options) || options.length < 2) {
    issues.push("Menos de 2 opciones (o no es un array)");
    return issues;
  }

  const correctSet = new Set(correctAnswerIds ?? []);

  for (const opt of options) {
    if (!opt || typeof opt !== "object") {
      issues.push("Opcion no es un objeto valido");
      continue;
    }
    if (!opt.text || String(opt.text).trim().length < minLength) {
      issues.push(`Opcion ${opt.id ?? "?"} sin texto o con texto demasiado corto (posible corrupcion de JSON)`);
    }
    if (checkErrorTypes) {
      const isCorrect = correctSet.has(opt.id);
      if (isCorrect) {
        if (opt.error_type) {
          issues.push(`Opcion ${opt.id} es la respuesta correcta pero tiene error_type (${opt.error_type}) -- debe quitarse`);
        }
      } else {
        if (!opt.error_type) {
          issues.push(`Opcion ${opt.id} (distractor) sin error_type`);
        } else if (!VALID_ERROR_TYPES.includes(opt.error_type)) {
          issues.push(`Opcion ${opt.id} con error_type invalido: ${opt.error_type}`);
        }
      }
    }
  }

  const ids = new Set(options.map((o) => o?.id));
  if (correctAnswerIds && !correctAnswerIds.every((id) => ids.has(id))) {
    issues.push("correct_answer no coincide con ninguna de las options");
  }

  return issues;
}

export function validateNonEmptyLabels(labels: unknown, expectedCount: number, minLength = 2): string[] {
  const issues: string[] = [];
  if (!Array.isArray(labels) || labels.length !== expectedCount) {
    issues.push(`Se esperaban ${expectedCount} etiquetas, llegaron ${Array.isArray(labels) ? labels.length : "no-array"}`);
    return issues;
  }
  labels.forEach((label, idx) => {
    if (typeof label !== "string" || label.trim().length < minLength) {
      issues.push(`Etiqueta en posicion ${idx} vacia o demasiado corta (posible corrupcion de JSON): ${JSON.stringify(label)}`);
    }
  });
  return issues;
}
