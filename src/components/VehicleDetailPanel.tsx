import React, { useState, useEffect } from "react";
import { VehicleData, ReplacementRecord, TireStatus } from "../data";
import { X, Wrench, CheckCircle, Save, Trash, AlertTriangle, Calendar, Award, User, MapPin } from "lucide-react";

interface VehicleDetailPanelProps {
  vehicle: VehicleData | null;
  currentRecord: ReplacementRecord | null;
  workshops?: string[];
  onSave: (record: ReplacementRecord) => void;
  onClose: () => void;
}

export default function VehicleDetailPanel({ vehicle, currentRecord, workshops = [], onSave, onClose }: VehicleDetailPanelProps) {
  const [tires, setTires] = useState<TireStatus[]>([]);
  const [bulkDate, setBulkDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [bulkKM, setBulkKM] = useState<number | "">("");
  const [bulkActa, setBulkActa] = useState<string>("");
  const [encargado, setEncargado] = useState<string>("");
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (vehicle) {
      // Iniciar el estado local de los neumáticos
      const initialTires: TireStatus[] = [];
      const qty = vehicle.cantidad;
      
      for (let i = 0; i < qty; i++) {
        if (currentRecord && currentRecord.tires[i]) {
          initialTires.push({ ...currentRecord.tires[i] });
        } else {
          initialTires.push({ colocado: false, fechaColocacion: "", kilometraje: undefined, nroActa: "", comentarios: "" });
        }
      }
      setTires(initialTires);
      setEncargado(currentRecord?.encargado || "");
      setSelectedWorkshop(currentRecord?.selectedWorkshop || workshops[0] || "");
    }
  }, [vehicle, currentRecord, workshops]);

  if (!vehicle) return null;

  const handleTireToggle = (index: number, val: boolean) => {
    const updated = [...tires];
    updated[index].colocado = val;
    if (val && !updated[index].fechaColocacion) {
      // Poner fecha de hoy por defecto
      updated[index].fechaColocacion = new Date().toISOString().slice(0, 10);
    }
    setTires(updated);
  };

  const handleFieldChange = (index: number, field: keyof TireStatus, value: any) => {
    const updated = [...tires];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setTires(updated);
  };

  const handleSave = () => {
    onSave({
      renglon: vehicle.renglon,
      tires: tires,
      encargado: encargado.trim() || undefined,
      selectedWorkshop: selectedWorkshop || undefined
    });
    onClose();
  };

  const applyBulkAction = () => {
    const updated = tires.map(t => ({
      colocado: true,
      fechaColocacion: bulkDate || new Date().toISOString().slice(0, 10),
      kilometraje: typeof bulkKM === "number" ? bulkKM : undefined,
      nroActa: bulkActa || "",
      comentarios: t.comentarios || ""
    }));
    setTires(updated);
  };

  const clearAllTires = () => {
    const updated = tires.map(() => ({
      colocado: false,
      fechaColocacion: "",
      kilometraje: undefined,
      nroActa: "",
      comentarios: ""
    }));
    setTires(updated);
    setShowClearConfirm(false);
  };

  // Formateador de moneda en pesos argentinos
  const formatArs = (num: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const placedCount = tires.filter(t => t.colocado).length;
  const progressPercent = (placedCount / vehicle.cantidad) * 100;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in select-none">
      <div 
        className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden relative border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* PANEL HEADER */}
        <div className="p-6 bg-white text-slate-800 flex items-start justify-between border-b border-slate-100">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-amber-500 text-slate-950 px-3 py-0.5 rounded-full text-[11px] font-bold font-mono shadow-xs">
                Renglón {vehicle.renglon}
              </span>
              <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-0.5 rounded-full text-[11px] font-semibold font-mono">
                Patente: {vehicle.patente}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight text-slate-900 leading-tight mt-1">{vehicle.vehiculo}</h3>
            <p className="text-slate-500 text-xs mt-1">Radicación original: <strong className="text-slate-800">{vehicle.radicacion}</strong></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Cerrar Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* SECCIÓN DETALLES DE COMPRA */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-medium block">Proveedor Adjudicado</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{vehicle.proveedor}</span>
                <span className="text-slate-400 font-mono block">CUIT: {vehicle.cuit}</span>
                {workshops.length > 0 ? (
                  <div className="mt-2.5 flex flex-col gap-1">
                    <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Taller Seleccionado de Colocación</span>
                    <div className="relative flex items-center bg-white border border-slate-200 hover:border-amber-500/40 rounded-xl px-2.5 py-1.5 transition-all w-full mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mr-1.5" />
                      <select
                        className="w-full bg-transparent text-[11px] text-amber-700 focus:outline-hidden font-semibold cursor-pointer truncate [&>option]:bg-white [&>option]:text-slate-800"
                        value={selectedWorkshop}
                        onChange={(e) => setSelectedWorkshop(e.target.value)}
                        title={selectedWorkshop}
                      >
                        {workshops.map((w, idx) => (
                          <option key={idx} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2 py-1.5 rounded-md italic mt-2.5 inline-block">
                    Sin talleres cargados para este proveedor
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-450 font-medium block">Monto Solicitado Total</span>
                <span className="font-bold text-amber-600 text-sm mt-0.5 block font-mono">{formatArs(vehicle.importeTotal)}</span>
                <span className="text-slate-550">Neumático: <strong className="text-slate-700 uppercase font-mono">{vehicle.medida}</strong></span>
              </div>
            </div>
            {vehicle.observacionesAdjudicacion && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-slate-500 leading-relaxed flex gap-2">
                <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-700">Fundamento:</strong> {vehicle.observacionesAdjudicacion}</span>
              </div>
            )}
          </div>

          {/* COORDINACIÓN Y ENCARGADO */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs shadow-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
              <User className="w-4 h-4 text-amber-500" /> Coordinación y Responsable del Traslado
            </h4>
            <div className="space-y-1">
              <label htmlFor="encargado-input" className="block text-[10px] uppercase font-bold text-slate-400">
                Encargado de llevar el vehículo al taller
              </label>
              <input
                id="encargado-input"
                type="text"
                placeholder="Nombre, Apellido, Cargo o Teléfono (ej: Juan Pérez - Chofer Santa Fe)"
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-amber-500 text-slate-800 focus:outline-hidden placeholder-slate-400 font-semibold"
                value={encargado}
                onChange={(e) => setEncargado(e.target.value)}
              />
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">
                Indique los datos de la persona asignada por el MPA para trasladar esta unidad o coordinar la cita de colocación.
              </p>
            </div>
          </div>

          {/* ACCIÓN EN LOTE (BULK FILLER) */}
          <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 text-xs">
            <h4 className="font-bold text-amber-600 flex items-center gap-1.5 mb-2.5">
              <Wrench className="w-3.5 h-3.5" /> Carga rápida de cumplimiento (Lote Completo)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fecha de colocación</label>
                <input 
                  type="date"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 text-slate-800 focus:outline-hidden"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Kilometraje actual</label>
                <input 
                  type="number"
                  placeholder="Ej: 142000"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 text-slate-800 focus:outline-hidden"
                  value={bulkKM}
                  onChange={(e) => setBulkKM(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">N° Acta / Factura</label>
                <input 
                  type="text"
                  placeholder="Ej: ACTA-0492"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 text-slate-800 focus:outline-hidden"
                  value={bulkActa}
                  onChange={(e) => setBulkActa(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-end items-end sm:items-center gap-2.5">
              {showClearConfirm ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg animate-fade-in text-[11px] font-semibold text-rose-600">
                  <span>¿Confirmar reseteo del vehículo?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={clearAllTires}
                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-450 hover:bg-slate-100 hover:text-slate-800 transition-colors font-semibold"
                >
                  Limpiar todo
                </button>
              )}
              <button
                type="button"
                onClick={applyBulkAction}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors font-bold shadow-xs"
              >
                Colocar todos los neumáticos
              </button>
            </div>
          </div>

          {/* LISTA DE NEUMÁTICOS DEL VEHÍCULO */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">
                Detalle por Neumático ({placedCount} de {vehicle.cantidad} Colocados)
              </h4>
              <span className="font-mono text-xs font-bold text-slate-400">
                Progreso: {progressPercent.toFixed(0)}%
              </span>
            </div>

            <div className="space-y-4">
              {tires.map((tire, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-2xl border transition-all ${
                    tire.colocado 
                      ? "bg-emerald-50/40 border-emerald-300 shadow-xs" 
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        tire.colocado ? "bg-emerald-500 text-white shadow-xs" : "bg-slate-200 text-slate-500"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">Neumático {index + 1} - Renglón {vehicle.renglon}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{vehicle.medida} | {vehicle.marcaNeumatico}</span>
                      </div>
                    </div>
                    {/* Switch Colocado */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700">¿Cumplido?</label>
                      <input 
                        type="checkbox"
                        checked={tire.colocado}
                        onChange={(e) => handleTireToggle(index, e.target.checked)}
                        className="w-5 h-5 text-emerald-500 border-slate-300 bg-white rounded-md focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {tire.colocado && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" /> Fecha Colocación
                        </label>
                        <input 
                          type="date"
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-800"
                          value={tire.fechaColocacion || ""}
                          onChange={(e) => handleFieldChange(index, "fechaColocacion", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Kilometraje Colocación</label>
                        <input 
                          type="number"
                          placeholder="KM"
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-800"
                          value={tire.kilometraje || ""}
                          onChange={(e) => handleFieldChange(index, "kilometraje", e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">N° Acta / Factura</label>
                        <input 
                          type="text"
                          placeholder="Opcional"
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-800"
                          value={tire.nroActa || ""}
                          onChange={(e) => handleFieldChange(index, "nroActa", e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Observaciones / Comentarios</label>
                        <input 
                          type="text"
                          placeholder="Alineación, balanceo realizado, detalles..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-800"
                          value={tire.comentarios || ""}
                          onChange={(e) => handleFieldChange(index, "comentarios", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER ACCIONES DE GUARDADO */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-slate-450 font-medium text-xs flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Los datos se guardan de forma local.</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-250 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
