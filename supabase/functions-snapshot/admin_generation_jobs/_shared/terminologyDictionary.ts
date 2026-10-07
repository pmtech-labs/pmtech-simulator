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
- Issue / Issue Log → usar SIEMPRE "Problema" / "Registro de problemas" -- confirmado con la clave de respuestas real: 14 apariciones de "Registro de problemas", CERO de "Registro de incidentes"
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
- Reserva de contingencia (Contingency Reserve) ≠ Reserva de gestión (Management Reserve): la de
  CONTINGENCIA cubre riesgos IDENTIFICADOS y catalogados (en el registro de riesgos) cuando se
  materializan -- NUNCA la uses en un escenario para describir "gastos imprevistos" genéricos o no
  anticipados, eso es exactamente lo que cubre la reserva de GESTIÓN (para lo desconocido, lo no
  identificado). Si el escenario habla de un riesgo concreto que ya estaba en el registro y ocurre,
  usa "reserva de contingencia"; si habla de algo no anticipado/no identificado, usa "reserva de
  gestión" -- confundir estos dos términos es un error conceptual real, no solo de vocabulario
  (hallazgo real del PO, sep 2026).
- NINGUNA de las 5 Áreas de Enfoque de PMBOK 8 (Inicio, Planificación, Ejecución, Monitoreo y
  Control, Cierre) es una "fase" ni una "etapa" secuencial por la que se pasa una vez y se abandona
  -- PMBOK 8 las llama explícitamente "Áreas de Enfoque", no fases ni etapas del ciclo de vida, y
  Monitoreo y Control en particular es un grupo de procesos PARALELO y CONTINUO que ocurre
  simultáneamente a Planificación y Ejecución durante todo el ciclo de vida (incluso en enfoques
  ágiles/iterativos). PROHIBIDO escribir "la fase de Inicio", "la etapa de Planificación", "la fase
  de Ejecución", "la fase de Monitoreo y Control", "la etapa de Cierre" ni construcciones equivalentes
  ("el proyecto se encuentra actualmente en la etapa de..."; "el proyecto entró recientemente en la
  fase de..."), como si cada una fuera una fase discreta, exclusiva y secuencial -- eso es
  conceptualmente incorrecto y ha sido motivo de rechazo repetido del PO (hallazgo real del PO, sep
  2026, extendido más allá de M&C a las 5 Áreas de Enfoque en sep 2026). En su lugar, nombra el Área
  de Enfoque directamente como sustantivo, sin "fase de" / "etapa de" por delante: "durante el
  Inicio...", "en la Planificación...", "durante la Ejecución...", "el director realiza de forma
  continua actividades de Monitoreo y Control sobre el trabajo en ejecución...", "durante el Cierre...".
  Cuidado con la concordancia de género/artículo al quitar "fase/etapa de": "el Inicio", "la
  Planificación", "la Ejecución", "el Monitoreo y Control", "el Cierre" (y con las contracciones "del"/
  "al", nunca "de el"/"a el").
- El director de proyecto NUNCA "lidera" ni "manda sobre" un equipo ágil en el sentido de autoridad
  jerárquica -- los equipos ágiles son autoorganizados. El director de proyecto COORDINA, FACILITA o
  ejerce funciones de supervisión/coordinación sobre el equipo, nunca lo "lidera" en sentido de mando.
  Usa "coordina", "facilita" o "acompaña" en vez de "lidera" cuando describas la relación del director
  de proyecto con un equipo ágil en el enunciado o escenario (hallazgo real del PO, sep 2026).
- El ROL DEL CANDIDATO en toda pregunta es SIEMPRE "director del proyecto" (o, en equipos ágiles, alguien
  que ejerce funciones de dirección/coordinación del proyecto en su conjunto) -- NUNCA plantees la pregunta
  desde la perspectiva de "tú, como Scrum Master" ni de ningún otro rol específico del equipo (Product
  Owner, líder técnico, etc.), aunque el escenario esté ambientado en un equipo ágil. El escenario puede
  MENCIONAR a un Scrum Master como personaje del reparto, pero la decisión que se le pide al candidato
  siempre corresponde al director del proyecto. IMPORTANTE (hallazgo real del PO, sep 2026): esta regla
  no es solo de encuadre narrativo, tiene también una razón mecánica de fondo en el caso de la Daily
  Scrum -- según el marco Scrum, el Scrum Master NO participa activamente en la Daily Scrum (es un
  evento exclusivo del equipo de desarrollo; el Scrum Master, si está presente, solo observa/facilita
  sin intervenir como parte del evento). Por tanto, nunca construyas un escenario donde "el Scrum
  Master" interviene o actúa DENTRO de la Daily Scrum como si fuera un participante más -- si el
  escenario ocurre durante una Daily Scrum, la persona que observa y decide qué hacer (el director de
  proyecto) debe estar ahí como facilitador/observador externo al evento, nunca como un miembro que
  "participa" en el sentido estricto del evento.
- Las retrospectivas ágiles son un evento INTERNO del equipo -- nunca invites a interesados externos
  al equipo (clientes, directores de otras áreas, patrocinadores) a participar directamente en una
  retrospectiva. Si el escenario requiere involucrar a un interesado externo en una conversación sobre
  el desempeño del equipo, plantea una acción distinta y posterior (ej. una conversación directa con
  esa persona, fuera de la retrospectiva), nunca "invitarla a participar en la retrospectiva" (hallazgo
  real del PO, sep 2026).
- El Project Charter se traduce SIEMPRE como "Acta de Constitución del Proyecto" -- NUNCA como "carta
  del proyecto" ni "carta de proyecto" (traducción literal incorrecta, no es terminología oficial de
  PMI en español). Úsala siempre en el enunciado, las opciones y la explicación (hallazgo real del PO,
  sep 2026).
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

export const PAJA_EN_ENUNCIADOS = `
DATOS IRRELEVANTES EN EL ENUNCIADO ("paja", obligatorio en dificultad 3 en adelante, opcional
en 1-2): el examen real de PMP mezcla con frecuencia, dentro del mismo párrafo, datos que SÍ son
decisivos para responder con datos que suenan relevantes pero NO afectan en nada la respuesta
correcta -- una cifra exacta de presupuesto que no se usa en el razonamiento, el nombre de un
interesado secundario que no vuelve a aparecer, una fecha concreta que no cambia la decisión,
el tamaño del equipo cuando la pregunta es sobre comunicación y no sobre capacidad. Añade SIEMPRE
1-2 de estos datos irrelevantes en el enunciado de forma natural (nunca marcados ni señalados como
irrelevantes, deben sonar igual de creíbles que los datos que sí importan) para dificultades 3 o
superiores. El candidato debe poder resolver la pregunta igual de bien ignorando esos datos, pero
solo lo sabrá tras razonar el escenario completo -- ese es precisamente el punto. No abuses: 1-2
datos irrelevantes por enunciado es suficiente, más que eso vuelve el enunciado confuso en vez de
desafiante.
`.trim();

export const CALIDAD_DISTRACTORES = `
COLETILLAS TRAS UNA COMA -- EN CUALQUIER OPCIÓN, CORRECTA O INCORRECTA (prohibido, la regla más
importante de esta sección, confirmada de forma explícita y repetida por el revisor humano): si la
frase antes de la última coma ya es una acción completa y con sentido por sí sola, NO añadas nada
más después. Esto aplica en ambas direcciones:

1) En un DISTRACTOR: nunca añadas una cláusula final que confiese por qué la opción está mal --
   ej. "sin evaluarlo primero", "sin consultar a nadie", "sin considerar la calidad", "sin más
   análisis", "sin revisar los activos de la organización", "para evitar más debates", "para no
   generar alarma". IMPORTANTE: esto aplica INCLUSO cuando la cláusula parece "necesaria" para
   transmitir el error_type (ej. "sin más análisis" en un distractor tipo analysis) -- el propio
   error_type ya clasifica internamente por qué falla la opción; el texto que lee el candidato NUNCA
   necesita una cláusula explicativa adicional para ser un distractor válido. Confía en que la acción
   sola, sin explicar por qué está mal, ya es suficiente.

2) En la opción CORRECTA: nunca añadas una cláusula final que acumule virtudes genéricas para
   remarcar que es la buena -- ej. ", fomentando la participación de todos", ", asegurando que se
   defina una visión compartida", ", garantizando el consenso", ", promoviendo la transparencia".
   Si "Facilitar una sesión con los interesados clave para acordar la visión del proyecto" ya es una
   acción completa y correcta, NO le añadas ", fomentando la colaboración y asegurando que todos
   comprendan los cambios" -- esa cláusula extra es pura confirmación de que es la buena, y el
   candidato la detecta sin necesidad de razonar sobre el escenario.

EXCEPCIÓN, la única válida: si la cláusula tras la coma aporta un HECHO o DATO nuevo del escenario
que cambia el significado de la opción (ej. una cifra, un interesado nombrado en el enunciado, una
segunda acción sustantiva y distinta de la primera, unida por "y" -- no por una coma con gerundio),
puede mantenerse. La prueba es: si borro la cláusula final, ¿la opción pierde información fáctica
del escenario, o solo pierde una reafirmación de que es buena/mala? Si es lo segundo, bórrala.

VERBOS DEMASIADO OBVIOS EN DISTRACTORES (hallazgo real del PO): "forzar", "ignorar", "dejar de",
"ocultar", "posponer", "imponer" son acciones que el propio PMI marca como incorrectas de forma tan
clara que, si una opción EMPIEZA literalmente por uno de estos verbos, el candidato la descarta sin
razonar el escenario -- rompe el propósito del distractor. Puedes seguir construyendo distractores
que describan esa MISMA mala práctica de fondo, pero nunca la encabeces con ese verbo tan explícito
-- redáctala de forma más sutil, integrada en una acción que suene razonable a primera vista.

DISTRACTOR "NO HACE FALTA HACER NADA" (prohibido, hallazgo real de una revisión de 30 preguntas
rechazadas -- el patrón más frecuente encontrado, presente en 10 de 30): nunca construyas una
opción incorrecta que empiece con "Nada;", "Ninguno;" o equivalente, afirmando que no hace falta
ninguna acción adicional porque lo ya hecho es suficiente. En un examen real de PMP la respuesta
incorrecta casi nunca es "no actuar, ya está bien" -- las opciones incorrectas son prácticamente
siempre ACCIONES ALTERNATIVAS plausibles, nunca la negación de que haga falta actuar. Si el error
de fondo que quieres representar es "conformarse con lo mínimo", exprésalo como una acción concreta
e insuficiente (ej. "revisar el cronograma solo cuando se detecta una desviación evidente"), nunca
como una negación tipo "no hace falta hacer nada más".

PALABRAS Y EXPRESIONES ABSOLUTISTAS QUE DELATAN LA RESPUESTA (ampliación ago 2026 de la lista de
verbos obvios, mismo mecanismo): "exclusivamente", "únicamente" / "sólo" (cuando restringe de forma
extrema y no es parte esencial del error evaluado), "inmediato" / "inmediatamente" / "de inmediato",
"imposible", "indiscriminado/a", "en solitario", "por su cuenta", "sin ninguna excepción". Estas
palabras delatan la opción por su carga connotativa (suenan a exageración) en vez de obligar al
candidato a razonar sobre el fondo del escenario. EXCEPCIÓN: si la palabra es parte esencial del
error que se evalúa (ej. "delegar la decisión SOLO al patrocinador, sin involucrar a nadie más" para
un error de tipo "role"), puede mantenerse, pero evita acumular más de una de estas palabras en la
misma opción y nunca las uses como añadido superfluo en una opción que ya sería incorrecta sin ellas.

PLANTILLA "¿QUÉ LE FALTÓ / QUÉ DEBERÍA HABER HECHO DE FORMA CONTINUA?" -- NO SOBREUSAR (hallazgo real:
8 de 30 preguntas rechazadas en una revisión seguían este patrón casi idéntico: "[Actor] hace X pero
no revisa/actualiza/comunica Y de forma continua, [consecuencia]. ¿Qué le faltó?"): esta plantilla
tiende a producir preguntas de identificar-el-concepto-ausente en vez de decidir-la-mejor-acción-
siguiente, y genera lotes de preguntas casi indistinguibles entre sí en estructura. Puedes usarla
ocasionalmente, pero VARÍA la construcción de la mayoría de las preguntas hacia un punto de decisión
en tiempo real ("¿qué haces ahora?", "¿cuál es tu siguiente paso?") en vez de una reconstrucción
retrospectiva de qué faltó.

CALIBRACIÓN REAL DE DIFICULTAD (hallazgo real del PO: preguntas marcadas 3/4/5 que en realidad eran
sencillas): la dificultad no es una etiqueta que se declara, tiene que construirse en el propio
contenido. Guía concreta por nivel:
- 1-2 (fácil): la opción correcta es claramente la más profesional/completa, los distractores
  fallan por motivos obvios y distintos entre sí, sin cálculos ni datos a cruzar.
- 3 (medio): al menos 2 opciones suenan igual de razonables a primera lectura y hay que fijarse en
  UN dato concreto del enunciado para descartar la que parece correcta pero no lo es.
- 4-5 (difícil): 2-3 opciones son genuinamente plausibles y profesionales, la diferencia está en un
  matiz sutil o requiere combinar 2 datos del enunciado a la vez, o un cálculo con varios pasos. Para
  dificultad 5 específicamente: las 4 opciones deben tener una extensión y nivel de detalle MUY
  similares entre sí (evita que la correcta sea la única larga/elaborada -- eso la delata por estilo,
  no por contenido); el enunciado debe combinar al menos dos restricciones o intereses en tensión
  real (ej. valor de negocio vs. cumplimiento normativo, velocidad vs. calidad) que no tengan una
  respuesta obvia sin razonar sobre el matiz concreto del escenario.

${PAJA_EN_ENUNCIADOS}

ENUNCIADOS SIEMPRE SITUACIONALES (hallazgo real del PO: enunciados demasiado teóricos o ambiguos):
cada enunciado debe describir una SITUACIÓN concreta con un proyecto, un momento y una decisión
pendiente -- nunca una pregunta de definición/teoría pura ni un enunciado tan corto o genérico que
podría aplicar a cualquier proyecto sin cambiar nada. Si al quitar los nombres propios y el contexto
la pregunta sigue leyéndose exactamente igual, es demasiado genérica -- añade un dato concreto que
ancle el escenario. Prefiere plantear un punto de decisión activo ("¿qué haces ahora?") sobre una
reconstrucción retrospectiva ("¿qué faltó/qué se omitió?"), que tiende a sonar más teórica.

FUGA DE JERGA INTERNA EN LA EXPLICACIÓN (prohibido, hallazgo crítico confirmado con pruebas de
generación en vivo, ago 2026, en INGLÉS Y EN ESPAÑOL): el campo "error_type" de cada opción es una
etiqueta INTERNA del sistema -- el candidato NUNCA debe verla en ningún texto, en ningún idioma.
Está TERMINANTEMENTE PROHIBIDO que "explanation" contenga, en cualquier idioma o forma, las palabras
"error_type", "role"/"rol", "sequence"/"secuencia", "analysis"/"análisis" (cuando se usa como
etiqueta), "approach"/"aproximación"/"enfoque" (cuando se usa como etiqueta de clasificación, ej.
"error de enfoque", "es incorrecta por enfoque"), "knowledge"/"conocimiento", "interpretation"/
"interpretación", "reading"/"lectura", "time"/"tiempo" (cuando se usa como etiqueta, ej. "error de
tiempo", "incorrecta por tiempo"), "wrong_document", "unsupervised_delegation", ni construcciones como
"es un error de X", "falla por X", "por eso es X", "incurre/cae/corresponde a un error de X", "es
incorrecta/incorrecto por X" (donde X sea directamente el nombre de la etiqueta interna), donde X sea
cualquiera de esos términos en cualquier idioma. IMPORTANTE (reincidencia real detectada en auditoría,
sep 2026): esta fuga reaparece con frecuencia en construcciones breves de cierre de frase como
"(error de rol)", "por error de secuencia", "es errónea por error de análisis:", "incorrecta por
enfoque:" -- revisa especialmente esas coletillas finales entre paréntesis o tras dos puntos, que son
donde más se filtra la etiqueta técnica. Sustituye SIEMPRE por lenguaje natural:
- en vez de "falla por sequence" / "es un error de secuencia" → "es una acción válida pero prematura"
- en vez de "es un error de role" / "es un error de rol" → "correspondería a otro rol, no al director de proyecto"
- en vez de "falla por analysis" / "es un error de análisis" → "se precipita sin analizar toda la información disponible"
- en vez de "falla por wrong_document" → "no es el artefacto que gobierna esta situación concreta"
- en vez de "falla por unsupervised_delegation" → "delega la decisión en un tercero sin la validación
  humana necesaria"
- en vez de "falla por approach" / "error de aproximación" → "aplica una lógica que no corresponde a este enfoque de gestión"
- en vez de "falla por knowledge" / "error de conocimiento" → "refleja un concepto incorrecto"
- en vez de "falla por interpretation" / "error de interpretación" → "malinterpreta la situación descrita"
- en vez de "falla por reading" / "error de lectura" → "ignora un dato decisivo del enunciado"
- en vez de "falla por time" → "implica una urgencia desproporcionada"
Antes de responder, relee tu propia explicación entera y comprueba que NINGÚN distractor menciona su
etiqueta de clasificación por su nombre técnico, en ningún idioma. Esta regla es tan importante como
el JSON válido: una respuesta con JSON perfecto pero con esta fuga será rechazada igualmente.

CAMPO "error_type" EN LA OPCIÓN CORRECTA (recordatorio, hallazgo real recurrente): la opción marcada
como correcta NUNCA debe llevar la clave "error_type" en su objeto JSON -- ni con valor null, ni con
cadena vacía "". Si una opción es la correcta, omite por completo la clave "error_type" en ese objeto
(no la incluyas con ningún valor). Solo los distractores llevan "error_type" con uno de los valores
válidos (sequence, role, approach, analysis, knowledge, interpretation, reading, time,
wrong_document, unsupervised_delegation).
`.trim();

export function terminologiaObligatoria(): string {
  return `\n\nDICCIONARIO TERMINOLÓGICO PMP 2026 (obligatorio, construido cruzando PMBOK 8 completo con las 180
preguntas oficiales del examen real -- fuente de verdad por encima de cualquier otra convención):

TÉRMINOS ESTABLES (usa SIEMPRE esta forma, es un error de terminología no hacerlo):
${TERMINOS_ESTABLES}

REGLAS CONCEPTUALES (no son solo vocabulario, cambian el razonamiento correcto de la pregunta):
${REGLAS_CONCEPTUALES}

${PATRON_PRIMERO}

${CALIDAD_DISTRACTORES}`;
}

export function terminologiaCompacta(): string {
  return `\n\nDICCIONARIO TERMINOLÓGICO PMP 2026 (obligatorio, construido cruzando PMBOK 8 con las 180 preguntas
oficiales del examen real):

${TERMINOS_ESTABLES}`;
}
