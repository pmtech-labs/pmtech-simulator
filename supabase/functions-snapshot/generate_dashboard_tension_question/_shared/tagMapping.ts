const DOMAIN_TO_DO: Record<string, string> = {
  people: "DOPE",
  process: "DOPR",
  business_environment: "DOEN",
};

const APPROACH_TO_CI: Record<string, string> = {
  predictive: "CIPR",
  agile: "CIAH",
  hybrid: "CIAH",
};

const PROCESS_GROUP_TO_AE: Record<string, string> = {
  initiation: "AEIN",
  planning: "AEPL",
  execution: "AEEJ",
  monitoring_control: "AEMC",
  closing: "AECI",
};

const PERFORMANCE_DOMAIN_TO_DD: Record<string, string> = {
  gobernanza: "DDGO",
  alcance: "DDAL",
  cronograma: "DDCR",
  finanzas: "DDFI",
  recursos: "DDRE",
  riesgos: "DDRI",
  interesados: "DDIN",
};

const THEME_TO_NT: Record<string, string> = {
  entrega_valor: "NTEV",
  sostenibilidad: "NTSO",
  ia: "NTIA",
};

export interface TagInputs {
  domainCode: string;
  approach: string;
  processGroup: string;
  performanceDomain: string;
  themes: string[];
  isCase: boolean;
  format: string;
}

export function buildTagCodes(inputs: TagInputs): string[] {
  const codes: string[] = [];

  const doCode = DOMAIN_TO_DO[inputs.domainCode];
  if (doCode) codes.push(doCode);

  const ciCode = APPROACH_TO_CI[inputs.approach];
  if (ciCode) codes.push(ciCode);

  const aeCode = PROCESS_GROUP_TO_AE[inputs.processGroup];
  if (aeCode) codes.push(aeCode);

  const ddCode = PERFORMANCE_DOMAIN_TO_DD[inputs.performanceDomain];
  if (ddCode) codes.push(ddCode);

  if (inputs.isCase) {
    codes.push("FOCE");
  } else if (inputs.format === "mc_single") {
    codes.push("FOTU");
  } else if (inputs.format === "mc_multi") {
    codes.push("FOTM");
  } else {
    codes.push("FOIN");
  }

  for (const theme of inputs.themes) {
    const ntCode = THEME_TO_NT[theme];
    if (ntCode) codes.push(ntCode);
  }

  const hasSpecificTheme = inputs.themes.some((t) => THEME_TO_NT[t]);
  if (!hasSpecificTheme) codes.push("NTRE");

  return codes;
}

export function tagRowsFor(questionId: string, inputs: TagInputs): { question_id: string; tag_code: string }[] {
  return buildTagCodes(inputs).map((tag_code) => ({ question_id: questionId, tag_code }));
}
