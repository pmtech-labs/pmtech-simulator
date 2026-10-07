export const TERMINOS_ESTABLES = `
- Project Manager → "Director del proyecto" (NUNCA "Gerente de proyecto")
- Stakeholder → "Interesado"
- Deliverable → "Entregable"
- Schedule → "Cronograma"
- Risk → "Riesgo"
- Earned Value → "Valor ganado"
- Project Sponsor / Sponsor → "Patrocinador (del proyecto)" (nunca el anglicismo "sponsor")
- Product Owner → "Dueño del producto" (nunca "propietario del producto")
- Scrum Master → "Scrum Master" (no traducir)
- Functional Manager → "Director funcional" / "Gerente funcional"
- Project Management Office (PMO) → "Oficina de dirección de proyectos (PMO)" (NUNCA "oficina de gestión de proyectos")
- Project Management → "Dirección de proyectos" (NUNCA "Administración de proyectos")
- Customer → "Cliente"
- End User → "Usuario final"
- Seller / Supplier / Vendor / Contractor → "Proveedor" es la forma predominante; "Contratista" y "Vendedor" son variantes reconocidas, no usar "Suministrador"
- WBS → "WBS" (NUNCA "EDT" en contenido nuevo)
- "Adaptativo" (NUNCA "Adaptivo")
- Crashing → "Intensificación"
- Fast Tracking → "Ejecución rápida"
- Float → "Holgura"
- Planned Value → "Valor planificado (PV)"
- Actual Cost → "Costo real (AC)"
- Budget at Completion → "Presupuesto hasta la conclusión (BAC)"
- Cost Variance → "Variación del costo (CV)" -- fórmula CV = EV − AC
- Schedule Variance → "Variación del cronograma (SV)" -- fórmula SV = EV − PV
- Variance at Completion → "Variación a la conclusión (VAC)"
- Cost Performance Index → "Índice de desempeño del costo (CPI)"
- Monitoring → "Monitoreo" (NUNCA "Supervisión" como regla general)
- Performance → "Desempeño" para dirección y control del proyecto
- Conformance → "Conformidad" / Compliance → "Cumplimiento"
- Engagement → "Involucramiento" / Participation → "Participación" / Commitment → "Compromiso"
- Backlog → "Trabajo pendiente"; Product Backlog → "Trabajo pendiente asociado al producto"
- Definition of Done (DoD) → "Definición de terminado" / Definition of Ready (DoR) → "Definición de listo"
- Servant Leadership → "Liderazgo de servicio" (NUNCA "líder sirviente")
- Effort → "Esfuerzo" / Duration → "Duración"
- Assumption → "Supuesto" / Constraint → "Restricción"
- Monte Carlo → "Análisis/simulación de Montecarlo"
- Multipoint Estimating → "Estimación multipunto"
- Cost → "Costo" (NUNCA "Coste")
- Product Owner ≠ Product Manager: "Dueño del producto" y "Gerente del producto" son roles PMI DISTINTOS
`.trim();

export const VARIANTES_RECONOCIDAS = `
- Issue / Issue Log → usar SIEMPRE "Problema" / "Registro de problemas" al generar contenido nuevo -- confirmado con la clave de respuestas real: 14 apariciones de "Registro de problemas", CERO de "Registro de incidentes"
- Status Report → "Informe de estatus" e "Informe de estado" son ambas válidas
- Mentoring → "Mentoría" como forma principal
- Técnicas de resolución de conflictos: usar "Suavizar/acomodar", "Colaborar/resolver problemas", "Forzar/dirigir", "Comprometer/conciliar", "Retirarse/evitar"
- Integrated Change Control → el examen 2026 real usa la forma heredada "Realizar el control integrado de cambios" (14 apariciones confirmadas) -- usar la forma del examen cuando el contexto lo pida. NO es un "proceso PMBOK 6 prohibido".
- Project Scope Statement → "Enunciado del alcance del proyecto"
- Project Management Plan → "Plan para la dirección del proyecto"
- Backlog Refinement → "Perfeccionamiento de la lista de trabajo pendiente"
- Benefits Realization → "Plan de gestión de beneficios"
`.trim();

export const REGLAS_CONCEPTUALES = `
- Verification SIEMPRE antes que Validation, SIEMPRE antes que Acceptance
- "Puede ocurrir" → Registro de riesgos. "Ha ocurrido / está ocurriendo" → Registro de problemas
- Monitoring vs Controlling vs Managing -- no son sinónimos intercambiables
- Termination (evento que pone fin) es distinto de Closure (procedimiento formal posterior)
- Cancellation puede activar Closure, pero Cancelar ≠ Cerrar
- El cierre formal EXISTE también en enfoques ágiles/adaptativos
- Un proyecto no exitoso TAMBIÉN debe cerrarse formalmente
- Empowerment, Delegation y Autonomy no son sinónimos
- Coaching (descubrir la solución por sí misma) es distinto de Mentoring (compartir experiencia directamente)
- Uncertainty puede ORIGINAR Risk, pero no son lo mismo
`.trim();

export const PATRON_PRIMERO = `
Muchas preguntas PMP giran en torno a "¿qué debería hacer primero / a continuación?". El
análisis de las 180 preguntas oficiales revela 7 patrones de secuencia recurrentes:

1. Comprender antes de actuar: identificar → analizar/evaluar → actuar.
2. Ir a la fuente de autoridad cuando el procedimiento ya existe.
3. Comprender a la persona antes de actuar contra ella.
4. Resolver en el nivel adecuado antes de escalar.
5. Verificar antes de validar/aprobar.
6. Alinear antes de formalizar cuando todavía no existe acuerdo.
7. Analizar antes de negociar cambios importantes.

Conteos reales confirmados sobre las 180 preguntas oficiales: evaluar (57), revisar (65),
determinar (46), actualizar (39), analizar (36), identificar (36), escalar (25), priorizar (19).
Regla explícita: el verbo de la opción CORRECTA casi siempre pertenece a este set
(identificar/evaluar/analizar/revisar/consultar/facilitar/determinar) -- NUNCA "escalar",
"reemplazar", "cancelar", "rechazar" o "aprobar" como PRIMER verbo de la opción correcta,
salvo que el propio enunciado indique explícitamente que el paso de análisis previo ya se completó.
`.trim();

export function terminologiaObligatoria(): string {
  return `\n\nDICCIONARIO TERMINOLÓGICO PMP 2026 (obligatorio, construido cruzando PMBOK 8 completo con las 180
preguntas oficiales del examen real -- fuente de verdad por encima de cualquier otra convención):

TÉRMINOS ESTABLES (usa SIEMPRE esta forma, es un error de terminología no hacerlo):
${TERMINOS_ESTABLES}

REGLAS CONCEPTUALES (no son solo vocabulario, cambian el razonamiento correcto de la pregunta):
${REGLAS_CONCEPTUALES}

${PATRON_PRIMERO}`;
}

export function terminologiaCompacta(): string {
  return `\n\nDICCIONARIO TERMINOLÓGICO PMP 2026 (obligatorio, construido cruzando PMBOK 8 con las 180 preguntas
oficiales del examen real):

${TERMINOS_ESTABLES}`;
}
