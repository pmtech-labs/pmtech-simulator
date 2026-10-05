const LOTE_A_STYLE_EXAMPLES: string[] = [
  `Ejemplo de estilo (situacional, predictivo):
"A los miembros del equipo del proyecto les preocupa que un nuevo recurso no parezca adecuado para una tarea asignada. ¿Cómo debería responder el director del proyecto a esta preocupación?"
A. Comuníquese con la alta gerencia para discutir la posibilidad de reasignar el nuevo recurso a un proyecto diferente.
B. Programe tiempo para conversar con el nuevo recurso para evaluar sus habilidades y comprender su nivel de conocimiento.
C. Pida a los miembros del equipo que documenten las deficiencias relacionadas con la tarea que muestra el recurso.
D. Comuníquese con el patrocinador del proyecto para resaltar estas inquietudes y decidir la respuesta adecuada.`,
  `Ejemplo de estilo (ágil, dependencia entre equipos):
"Durante una iteración ágil, la Tarea 1 no se puede completar a tiempo debido a desafíos inesperados. Otro equipo dentro del proyecto depende de la finalización oportuna de la Tarea 1 para cumplir con su parte del proyecto. ¿Cómo debería resolver este problema el director del proyecto?"
A. Reúnase con ambos equipos por separado y pídales que encuentren una manera de cumplir con los plazos requeridos y completar el proyecto a tiempo.
B. Reúnase con el propietario del producto para volver a priorizar el backlog de la iteración, de modo que no afecte a otros equipos u obligaciones.
C. Aumentar el número de miembros del equipo para el equipo del proyecto y aumentar la duración de la iteración, asegurando que el trabajo se completará de acuerdo con el cronograma.
D. Informe a los miembros del equipo que desea que hagan lo mejor posible en circunstancias difíciles y asegúrese de tener en cuenta los desafíos de la iteración en las lecciones aprendidas.`,
];

const LOTE_B_STYLE_EXAMPLES: string[] = [
  `Ejemplo de estilo oficial PMI (ágil, acción retrospectiva):
"Un equipo de proyecto olvidó completar una tarea planificada en una iteración. Durante una reunión de coordinación diaria 3 días después, el equipo se dio cuenta de que la tarea no se había completado. Más tarde ese día, el equipo completó la tarea. ¿Qué debería hacer el director del proyecto para evitar esta situación en el futuro?"
A. Analizar el problema durante la retrospectiva.
B. Abordar el problema en la demostración.
C. Analizar el problema en la siguiente planificación de la iteración.
D. Enviar un correo electrónico al equipo.`,
  `Ejemplo de estilo oficial PMI (gobernanza de IA -- origen del error_type "unsupervised_delegation"):
"Un proyecto farmacéutico incluye un equipo ágil de médicos que analizan escaneos de tejido humano de pacientes que participan en ensayos clínicos de medicamentos. El director ejecutivo quiere aprovechar la tecnología de aprendizaje automático (ML), porque se demostró que es más rápida y precisa que el análisis de escaneo realizado por humanos. ¿Cómo debe proceder el dueño del producto en respuesta a la solicitud del director ejecutivo?"
A. Registrar el riesgo en el registro de riesgos y planificar el análisis de una respuesta en la retrospectiva.
B. Trabajar con el equipo para planificar cómo pueden aprovechar el ML según los datos.
C. Facilitar la capacitación en ML para que los miembros del equipo de proyecto demuestren una mentalidad de crecimiento y se preparen para el cambio.
D. Pedir al equipo que realice un análisis FODA que respalde la validación realizada por humanos.`,
];

export const GENERAL_STYLE_EXAMPLES: string[] = [...LOTE_A_STYLE_EXAMPLES, ...LOTE_B_STYLE_EXAMPLES, ...LOTE_B_STYLE_EXAMPLES];

export const MATCHING_STYLE_EXAMPLES: string[] = [
  `Ejemplo de estilo oficial PMI (lote B, respuesta a riesgos + propósito):
"Asocie cada respuesta a los riesgos con su propósito principal."
- Aceptar → No tomar medidas inmediatas más allá del monitoreo.
- Evitar → Eliminar la amenaza por completo.
- Mitigar → Reducir la probabilidad o el impacto de un riesgo.
- Transferir → Transferir la propiedad del riesgo a un tercero.`,
];

export const CASE_CLUSTER_REFERENCE = `Ejemplo de referencia completo (caso oficial real del PMI, escenario + 5 preguntas):

ESCENARIO: "Una organización multinacional de tamaño mediano lanza una iniciativa de
transformación estratégica para mejorar la colaboración entre funciones y acelerar la
entrega de valor. Se le asigna como director del proyecto tras la aprobación del acta
de constitución. Aunque los patrocinadores están de acuerdo en la necesidad de la
transformación, surgen interpretaciones distintas de qué significa el éxito."

PREGUNTA 1 (beat: tensión inicial de valor): "Al comienzo de la iniciativa, el equipo
de liderazgo sénior expresa puntos de vista diferentes sobre cómo se ve el éxito. ¿Qué
debería hacer el director del proyecto?" → correcta: facilitar un debate estructurado
con los interesados clave para alinearse en resultados y valor como grupo.

Nota de mecánica: cada pregunta reference brevemente la situación ya planteada y añade
UN dato incremental nuevo -- ninguna repite el texto completo del escenario.`;

export function pickStyleExamples(count = 2): string {
  const shuffled = [...GENERAL_STYLE_EXAMPLES].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, count);
  return `\n\nESTILO DE REFERENCIA (solo tono y construcción del enunciado -- NUNCA copies hechos, datos ni terminología PMBOK 6 de aquí; usa tu propio contenido siguiendo únicamente ESTE estilo narrativo):\n${picked.join("\n\n")}`;
}

export function matchingStyleReference(): string {
  const picked = MATCHING_STYLE_EXAMPLES[Math.floor(Math.random() * MATCHING_STYLE_EXAMPLES.length)];
  return `\n\nESTILO DE REFERENCIA (solo tono y construcción de los pares -- NUNCA copies hechos ni terminología PMBOK 6 de aquí; usa tu propio contenido siguiendo únicamente ESTE estilo):\n${picked}`;
}

export function caseClusterReference(): string { return `\n\n${CASE_CLUSTER_REFERENCE}`; }
