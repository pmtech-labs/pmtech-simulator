export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface FaqBlock {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_BLOCKS: FaqBlock[] = [
  {
    id: "sobre-el-simulador",
    title: "Sobre el simulador",
    items: [
      {
        id: "afiliado-pmi",
        q: "¿Está afiliado o avalado por PMI?",
        a: "No. PMTech Simulator es un producto independiente, no afiliado ni respaldado por el Project Management Institute (PMI)®. PMP® y PMBOK® son marcas registradas de PMI.",
      },
      {
        id: "garantia-aprobado",
        q: "¿El simulador garantiza que apruebe el examen?",
        a: "No, y desconfía de quien lo prometa. Es una herramienta de entrenamiento y diagnóstico que te da una estimación razonada de tu preparación real — complementa el estudio estructurado, la revisión de tus errores y tu experiencia profesional, no los sustituye.",
      },
      {
        id: "actualizado-eco-2026",
        q: "¿Está actualizado a los últimos cambios del examen (ECO 2026 / PMBOK 8)?",
        a: "Sí, desde el primer día. El banco de preguntas está calibrado a las 26 tareas del ECO vigente desde julio de 2026, con los pesos reales de dominio (Personas 33%, Proceso 41%, Entorno de negocio 26%) y el split de enfoque (40% predictivo / 60% ágil-híbrido). Muchos simuladores en español todavía siguen calibrados al examen anterior.",
      },
      {
        id: "en-espanol",
        q: "¿Es totalmente en español?",
        a: "Sí, redactado en español neutro para España y LATAM, no traducido automáticamente.",
      },
      {
        id: "explicaciones",
        q: "¿Las preguntas incluyen explicaciones?",
        a: "Sí, y vamos un paso más allá: cuando fallas, no solo te decimos cuál era la respuesta correcta, identificamos el tipo de error concreto (secuencia, rol, enfoque, análisis, conocimiento, interpretación, lectura o tiempo) para que sepas exactamente qué corregir.",
      },
      {
        id: "repetir-practica",
        q: "¿Puedo practicar tantas veces y en el orden que quiera?",
        a: "Sí. Puedes repetir la práctica por dominio, por lección o acumulativa las veces que quieras mientras tu licencia esté activa, en cualquier orden.",
      },
      {
        id: "dificultad",
        q: "¿El nivel de dificultad es similar al del examen real?",
        a: "Sí, buscamos que sea equivalente: escenarios situacionales que evalúan juicio, no memorización, con la misma estructura de opción múltiple, opción múltiple con varias respuestas correctas, y formatos interactivos (arrastrar/emparejar, análisis de gráficos, selección sobre imagen) que ya incluye el examen real.",
      },
      {
        id: "instalacion",
        q: "¿Hay que instalar algo?",
        a: "No. Es 100% web, funciona en el navegador de tu ordenador, tablet o móvil, sin ninguna aplicación que instalar.",
      },
    ],
  },
  {
    id: "planes-y-pagos",
    title: "Sobre planes y pagos",
    items: [
      {
        id: "plan-gratuito",
        q: "¿Qué incluye el plan gratuito y cómo paso a uno de pago?",
        a: "El plan gratuito te da acceso sin límite de tiempo a la práctica por dominio, por lección y acumulativa, más un simulacro completo de regalo para que pruebes la estructura real del examen. Cuando quieras simulacros completos ilimitados y el resto de funciones (práctica interactiva avanzada, analítica por tarea, motor adaptativo), puedes mejorar tu plan en cualquier momento desde tu perfil — no pierdes tu progreso ni tienes que crear una cuenta nueva.",
      },
      {
        id: "upgrade-premium",
        q: "¿Puedo cambiar de plan Básica a Premium más adelante?",
        a: "Sí, puedes hacer upgrade en cualquier momento dentro de tu periodo de licencia; solo pagas la diferencia.",
      },
      {
        id: "duracion-acceso",
        q: "¿Cuánto tiempo tengo de acceso?",
        a: "El plan gratuito no caduca hasta que decidas mejorarlo. La Básica incluye 3 meses de acceso y la Premium 6 meses, ambos con acceso ilimitado 24/7 durante ese periodo.",
      },
      {
        id: "mismas-preguntas",
        q: "¿Si repito el simulador o vuelvo a comprar, son las mismas preguntas?",
        a: "No necesariamente — a diferencia de un banco de preguntas fijo, el nuestro crece con el tiempo a medida que se revisa y publica contenido nuevo, así que es probable que encuentres preguntas que no habías visto antes, especialmente si ha pasado tiempo entre una licencia y la siguiente.",
      },
      {
        id: "licencia-caducada",
        q: "¿Qué pasa si mi licencia caduca antes del examen?",
        a: "Puedes renovar cuando quieras. Si detectamos que tu dominio en Business Environment (el área que más pesa en el ECO 2026) sigue bajo al vencer, te avisamos — no dejamos que llegues al examen sin saberlo.",
      },
    ],
  },
  {
    id: "certificacion-pmp",
    title: "Sobre la certificación PMP",
    items: [
      {
        id: "diploma",
        q: "¿Recibo algún diploma o certificado?",
        a: "Sí. Al completar un simulacro completo con un buen desempeño, se emite automáticamente un diploma de logro con tu resultado por dominio. Una aclaración importante: PMI no publica una nota de corte oficial para el examen PMP (usa bandas de desempeño por dominio, no un porcentaje público) — el diploma reconoce tu desempeño según un criterio de referencia propio de PMTech Simulator, no una nota de aprobado oficial de PMI.",
      },
      {
        id: "otros-materiales",
        q: "¿Sirve si estoy usando otro material de estudio (Rita Mulcahy, PMBOK, etc.)?",
        a: "Sí, es el complemento natural. El simulador no sustituye la formación estructurada — está pensado para practicar y diagnosticar errores sobre lo que ya estás estudiando.",
      },
    ],
  },
];

export const FAQ_ALL: FaqItem[] = FAQ_BLOCKS.flatMap((b) => b.items);

/** Las 5 preguntas destacadas que se muestran en el acordeón de la home. */
export const HOME_FAQ_IDS = [
  "afiliado-pmi",
  "garantia-aprobado",
  "actualizado-eco-2026",
  "plan-gratuito",
  "diploma",
] as const;

export const HOME_FAQS: FaqItem[] = HOME_FAQ_IDS.map(
  (id) => FAQ_ALL.find((f) => f.id === id)!,
);
