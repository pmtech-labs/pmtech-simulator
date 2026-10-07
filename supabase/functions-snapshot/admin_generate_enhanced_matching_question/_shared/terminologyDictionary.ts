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

export function terminologiaCompacta(): string {
  return `\n\nDICCIONARIO TERMINOLÓGICO PMP 2026 (obligatorio, construido cruzando PMBOK 8 con las 180 preguntas
oficiales del examen real):

${TERMINOS_ESTABLES}`;
}
