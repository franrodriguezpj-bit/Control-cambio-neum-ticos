import { VehicleData, ReplacementRecord } from "../data";

/**
 * Genera un archivo CSV con BOM UTF-8 para apertura directa impecable en Excel (Español)
 */
export function exportToCSV(vehicles: VehicleData[], replacements: Record<number, ReplacementRecord>) {
  // Columnas de la planilla para Excel
  const headers = [
    "Renglón",
    "Patente",
    "Vehículo",
    "Radicación",
    "Proveedor Adjudicado",
    "CUIT Proveedor",
    "Medida Neumático",
    "Marca/Modelo Adjudicado",
    "Cantidad Solicitada",
    "Cantidad Colocados",
    "Cumplimiento %",
    "Importe Total Adjudicado ($)",
    "Encargado del Traslado",
    "Rueda 1 - Estado", "Rueda 1 - Fecha", "Rueda 1 - KM", "Rueda 1 - Acta/Comprobante",
    "Rueda 2 - Estado", "Rueda 2 - Fecha", "Rueda 2 - KM", "Rueda 2 - Acta/Comprobante",
    "Rueda 3 - Estado", "Rueda 3 - Fecha", "Rueda 3 - KM", "Rueda 3 - Acta/Comprobante",
    "Rueda 4 - Estado", "Rueda 4 - Fecha", "Rueda 4 - KM", "Rueda 4 - Acta/Comprobante",
    "Observaciones de Licitación"
  ];

  const rows = vehicles.map(v => {
    const record = replacements[v.renglon] || { renglon: v.renglon, tires: [], encargado: "" };
    const placedCount = record.tires.filter(t => t.colocado).length;
    const pct = ((placedCount / v.cantidad) * 100).toFixed(0);

    // Formatear datos de cada rueda (hasta 4)
    const tireDetails: string[] = [];
    for (let i = 0; i < 4; i++) {
      if (i < v.cantidad) {
        const t = record.tires[i] || { colocado: false };
        tireDetails.push(
          t.colocado ? "Colocado" : "Pendiente",
          t.fechaColocacion || "",
          t.kilometraje ? t.kilometraje.toString() : "",
          t.nroActa || ""
        );
      } else {
        // Celdas vacías para vehículos de solo 2 ruedas
        tireDetails.push("No aplica", "", "", "");
      }
    }

    return [
      v.renglon.toString(),
      v.patente,
      v.vehiculo,
      v.radicacion,
      v.proveedor,
      v.cuit,
      v.medida,
      v.marcaNeumatico,
      v.cantidad.toString(),
      placedCount.toString(),
      `${pct}%`,
      v.importeTotal.toString(),
      record.encargado || "Sin definir",
      ...tireDetails,
      v.observacionesAdjudicacion || ""
    ];
  });

  // En Excel en español, se aconseja usar ';' como delimitador para que lo abra directamente como columnas
  const delimiter = ";";
  const csvContent = [
    headers.join(delimiter),
    ...rows.map(row => row.map(cell => {
      // Escapar comillas y envolver si tiene caracteres especiales
      const cleanCell = cell.replace(/"/g, '""');
      if (cleanCell.includes(delimiter) || cleanCell.includes("\n") || cleanCell.includes('"')) {
        return `"${cleanCell}"`;
      }
      return cleanCell;
    }).join(delimiter))
  ].join("\n");

  // Crear blog con UTF-8 BOM
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Control_Cambio_Neumaticos_MPA_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Genera un texto delimitado por tabs (TSV) preparado para ser copiado al portapapeles.
 * Esto permite al usuario ir a Google Sheets o Excel, presionar Ctrl+V y ver la planilla inmediatamente.
 */
export function getCopyableTSV(vehicles: VehicleData[], replacements: Record<number, ReplacementRecord>): string {
  const headers = [
    "Renglón",
    "Patente",
    "Vehículo",
    "Radicación",
    "Proveedor",
    "CUIT",
    "Medida",
    "Neumático Adjudicado",
    "Cant. Solicitada",
    "Cant. Colocados",
    "Progreso",
    "Importe Adjudicado ($)",
    "Encargado del Traslado",
    "Resumen Colocaciones"
  ];

  const rows = vehicles.map(v => {
    const record = replacements[v.renglon] || { renglon: v.renglon, tires: [], encargado: "" };
    const placedCount = record.tires.filter(t => t.colocado).length;
    const pct = ((placedCount / v.cantidad) * 100).toFixed(0);

    const summaries = record.tires.map((t, idx) => {
      if (!t.colocado) return `R${idx+1}: Pendiente`;
      return `R${idx+1}: Colocado ${t.fechaColocacion || ""} (Acta/Fact: ${t.nroActa || "S/D"}${t.kilometraje ? `, KM: ${t.kilometraje}` : ""})`;
    }).join(" | ");

    return [
      v.renglon.toString(),
      v.patente,
      v.vehiculo,
      v.radicacion,
      v.proveedor,
      v.cuit,
      v.medida,
      v.marcaNeumatico,
      v.cantidad.toString(),
      placedCount.toString(),
      `${pct}%`,
      v.importeTotal.toString(),
      record.encargado || "Sin definir",
      summaries
    ];
  });

  return [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
}
