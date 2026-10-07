export async function buildRejectionContext(admin: any, taskId: string): Promise<string> {
  const [taskSpecific, recentGeneral] = await Promise.all([
    admin
      .from("question_rejections")
      .select("reason, stem_snapshot")
      .eq("task_id", taskId)
      .order("rejected_at", { ascending: false })
      .limit(3),
    admin
      .from("question_rejections")
      .select("reason")
      .order("rejected_at", { ascending: false })
      .limit(5),
  ]);

  const taskRows = taskSpecific?.data ?? [];
  const generalRows = recentGeneral?.data ?? [];

  if (taskRows.length === 0 && generalRows.length === 0) return "";

  const parts: string[] = [];

  if (taskRows.length > 0) {
    const lines = taskRows
      .map((r: any) => `- \"${String(r.stem_snapshot).slice(0, 100)}...\" fue retirada porque: ${r.reason}`)
      .join("\n");
    parts.push(
      `Preguntas ANTERIORES de esta MISMA tarea que el revisor retiro por no tener calidad suficiente (evita repetir estos mismos problemas):\n${lines}`,
    );
  }

  if (generalRows.length > 0) {
    const reasons = [...new Set(generalRows.map((r: any) => r.reason))].join("; ");
    parts.push(`Motivos recientes por los que se han retirado otras preguntas del banco (patrones generales a evitar): ${reasons}`);
  }

  return `\n\nCALIDAD -- APRENDE DE RECHAZOS ANTERIORES (obligatorio tenerlo en cuenta):\n${parts.join("\n\n")}`;
}
