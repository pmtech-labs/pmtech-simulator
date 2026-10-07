const LOTE_A_STYLE_EXAMPLES: string[] = [
  `Ejemplo de estilo (situacional, predictivo):
"A los miembros del equipo del proyecto les preocupa que un nuevo recurso no parezca adecuado para una tarea asignada. ¿Cómo debería responder el director del proyecto a esta preocupación?"
A. Comuníquese con la alta gerencia para discutir la posibilidad de reasignar el nuevo recurso a un proyecto diferente.
B. Programe tiempo para conversar con el nuevo recurso para evaluar sus habilidades y comprender su nivel de conocimiento.
C. Pida a los miembros del equipo que documenten las deficiencias relacionadas con la tarea que muestra el recurso.
D. Comuníquese con el patrocinador del proyecto para resaltar estas inquietudes y decidir la respuesta adecuada.`,
  `Ejemplo de estilo (multi-respuesta, "escoge dos"):
"Se pide a un miembro clave del equipo que se traslade a otro proyecto durante la mitad de un proyecto técnico. El equipo cree que es un movimiento imprudente y expresa preocupación. ¿Qué dos acciones ayudarán a resolver el problema? (Escoge dos.)"
A. Discuta el conflicto con el patrocinador del proyecto y formule una respuesta.
B. Utilizar herramientas y técnicas de coaching para motivar al equipo del proyecto.
C. Reemplazar al miembro clave del equipo con un nuevo recurso que tenga las mismas habilidades.
D. Reúnase con la junta de control de cambios (CCB) para discutir el cambio solicitado.
E. Participar en el proceso de gestión de cambios para resolver el problema de los recursos.`,
  `Ejemplo de estilo (ágil, priorización por valor):
"Un gerente de proyecto debe asegurarse de que el equipo ofrezca valor comercial dentro de los plazos requeridos. El gerente se enteró recientemente de que las partes interesadas clave están preocupadas de que el plan de lanzamiento actual no satisfaga las necesidades comerciales urgentes. ¿Qué puede hacer el director del proyecto para responder eficazmente a las inquietudes de las partes interesadas?"
A. Renegociar el alcance con el patrocinador del proyecto después de examinar la estructura de desglose del trabajo (WBS).
B. En consulta con las partes interesadas y los miembros del equipo, identifique el producto mínimo viable necesario para el lanzamiento.
C. Determine el índice de desempeño del cronograma (SPI) y luego eleve el riesgo del cronograma al patrocinador del proyecto.
D. Monitorear el progreso usando un gráfico de evolución después de modificar la línea base del cronograma para cumplir con los requisitos de las partes interesadas.`,
  `Ejemplo de estilo (identificación de conocimiento, muestreo):
"Un proyecto se encuentra en fase de ejecución. Sobre la base del modelo aprobado originalmente, se desarrollaron 1000 productos. El equipo del proyecto elige al azar 100 productos para evaluarlos con el plan de calidad. ¿Qué está llevando a cabo el equipo del proyecto?"
A. Controlar las adquisiciones
B. Muestreo estadístico
C. Auditoría de procesos
D. Aseguramiento de calidad`,
  `Ejemplo de estilo (identificación de conocimiento, respuesta a riesgos):
"Se está planificando un proyecto en una zona remota con acceso limitado a vehículos y equipos. El director del proyecto propone que la empresa entregue todo el equipo pesado por sí misma a pesar de los importantes gastos. El director del proyecto asumirá la plena responsabilidad de esta actividad. ¿Qué tipo de respuesta al riesgo está demostrando el director del proyecto?"
A. Transferir
B. Mitigar
C. Aceptar
D. Evitar`,
  `Ejemplo de estilo (identificación de conocimiento, técnica de estimación):
"El director del proyecto ha verificado que se han definido los paquetes de trabajo de los componentes y se han identificado las limitaciones para cada componente. ¿Qué técnica de estimación debería utilizar el director del proyecto para obtener una estimación de costes precisa del proyecto?"
A. Análoga
B. Tres puntos
C. De abajo hacia arriba
D. Paramétrica`,
  `Ejemplo de estilo (ágil, plan de interesados):
"El jefe de Proyecto aplica un enfoque ágil para una entrega ajustada en el calendario. Necesita revisar el plan de gestión de interesados para que siga los principios ágiles. ¿Qué debería hacer para conseguirlo?"
A. Diseñar un sistema de comunicación digital que permita enviar, revisar y escalar issues de forma virtual.
B. Eliminar capas innecesarias de gestión para promover comunicación directa entre el equipo de proyecto y los interesados.
C. Modificar las plantillas para incluir el burndown y la progresión en el avance del backlog, y promover el uso de stand ups.
D. Incrementar el número de talleres formales de trabajo para cubrir todas las cuestiones de todos los interesados, inclídos los clientes y el sponsor.`,
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
  `Ejemplo de estilo oficial PMI (umbral de escalación -- cuándo NO escalar):
"Durante la ejecución, un problema del proyecto se mantiene dentro de las tolerancias de desempeño definidas, pero está llamando más atención de los interesados sénior. Los miembros del equipo sugieren escalar el problema de inmediato para evitar un escrutinio futuro. ¿Qué debería hacer el director del proyecto?"
A. Escalar el problema a la gobernanza de inmediato para demostrar transparencia.
B. Continuar con la gestión del problema a nivel de proyecto mientras se monitorean los umbrales de tolerancia.
C. Solicitar un cambio formal para ampliar las tolerancias de los problemas y reducir la presión del escalamiento.
D. Transferir la propiedad del problema a los interesados sénior para compartir la responsabilidad.`,
];

export const GENERAL_STYLE_EXAMPLES: string[] = [
  ...LOTE_A_STYLE_EXAMPLES,
  ...LOTE_B_STYLE_EXAMPLES,
  ...LOTE_B_STYLE_EXAMPLES,
];

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
de constitución."

Nota de mecánica: cada pregunta reference brevemente la situación ya planteada y añade
UN dato incremental nuevo -- ninguna repite el texto completo del escenario.`;

export function pickStyleExamples(count = 2): string {
  const shuffled = [...GENERAL_STYLE_EXAMPLES].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, count);
  return `\n\nESTILO DE REFERENCIA (solo tono y construcción del enunciado -- NUNCA copies hechos, datos ni terminología PMBOK 6 de aquí, son ejemplos antiguos que ya no aplican; usa tu propio contenido siguiendo únicamente ESTE estilo narrativo):\n${picked.join("\n\n")}`;
}

export function matchingStyleReference(): string {
  const picked = MATCHING_STYLE_EXAMPLES[Math.floor(Math.random() * MATCHING_STYLE_EXAMPLES.length)];
  return `\n\nESTILO DE REFERENCIA (solo tono y construcción de los pares -- NUNCA copies hechos ni terminología PMBOK 6 de aquí, es un ejemplo antiguo que ya no aplica; usa tu propio contenido siguiendo únicamente ESTE estilo):\n${picked}`;
}

export function caseClusterReference(): string {
  return `\n\n${CASE_CLUSTER_REFERENCE}`;
}
