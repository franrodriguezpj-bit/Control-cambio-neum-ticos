import React from "react";
import { VehicleData, ReplacementRecord, SUPPLIERS } from "../data";
import { CheckCircle, AlertCircle, TrendingUp, DollarSign, Award, MapPin } from "lucide-react";

interface StatsViewProps {
  vehicles: VehicleData[];
  replacements: Record<number, ReplacementRecord>;
}

export default function StatsView({ vehicles, replacements }: StatsViewProps) {
  // Calcular neumáticos totales vs colocados
  const totalTires = vehicles.reduce((sum, v) => sum + v.cantidad, 0);
  const placedTires = vehicles.reduce((sum, v) => {
    const record = replacements[v.renglon];
    if (!record) return sum;
    return sum + record.tires.filter(t => t.colocado).length;
  }, 0);
  const pendingTires = totalTires - placedTires;
  const globalCompletionPct = totalTires > 0 ? (placedTires / totalTires) * 100 : 0;

  // Calcular Presupuesto total vs Presupuesto Ejecutado (Prorrateado por neumático individual)
  const totalBudget = vehicles.reduce((sum, v) => sum + v.importeTotal, 0);
  const executedBudget = vehicles.reduce((sum, v) => {
    const record = replacements[v.renglon];
    if (!record) return sum;
    const placed = record.tires.filter(t => t.colocado).length;
    const unitCost = v.importeTotal / v.cantidad;
    return sum + (unitCost * placed);
  }, 0);
  const budgetExecutionPct = totalBudget > 0 ? (executedBudget / totalBudget) * 100 : 0;

  // Estadísticas por Proveedor
  const supplierStats = SUPPLIERS.map(sup => {
    const supVehicles = vehicles.filter(v => v.proveedor === sup.name);
    const supTotalTires = supVehicles.reduce((sum, v) => sum + v.cantidad, 0);
    const supPlacedTires = supVehicles.reduce((sum, v) => {
      const record = replacements[v.renglon];
      if (!record) return sum;
      return sum + record.tires.filter(t => t.colocado).length;
    }, 0);
    const supExecuted = supVehicles.reduce((sum, v) => {
      const record = replacements[v.renglon];
      if (!record) return sum;
      const placed = record.tires.filter(t => t.colocado).length;
      return sum + ((v.importeTotal / v.cantidad) * placed);
    }, 0);

    return {
      ...sup,
      tiresCount: supTotalTires,
      placedCount: supPlacedTires,
      executedAmt: supExecuted,
      completionPct: supTotalTires > 0 ? (supPlacedTires / supTotalTires) * 100 : 0
    };
  });

  // Estadísticas por Ciudad (Radicación)
  const cities = ["Santa Fe", "Rosario", "Venado Tuerto", "Reconquista", "Rafaela"];
  const cityStats = cities.map(city => {
    const cityVehicles = vehicles.filter(v => v.radicacion.toLowerCase().includes(city.toLowerCase()));
    const cityTotalTires = cityVehicles.reduce((sum, v) => sum + v.cantidad, 0);
    const cityPlacedTires = cityVehicles.reduce((sum, v) => {
      const record = replacements[v.renglon];
      if (!record) return sum;
      return sum + record.tires.filter(t => t.colocado).length;
    }, 0);

    return {
      cityName: city,
      totalVehicles: cityVehicles.length,
      totalTires: cityTotalTires,
      placedTires: cityPlacedTires,
      completionPct: cityTotalTires > 0 ? (cityPlacedTires / cityTotalTires) * 100 : 0
    };
  });

  // Formateador de moneda en pesos argentinos
  const formatArs = (num: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8 select-none">
      {/* CARD 1: KPI Global Neumáticos */}
      <div id="card-kpi-neumaticos" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Neumáticos Recambiados</span>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-slate-900 tracking-tight">{placedTires}</span>
            <span className="text-slate-500 font-medium text-sm">/ {totalTires} colocados</span>
          </div>
          {/* Progreso Visual */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${globalCompletionPct}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="font-medium text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {pendingTires} pendientes
          </span>
          <span className="font-bold font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs">
            {globalCompletionPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* CARD 2: KPI Presupuesto Ejecutado */}
      <div id="card-kpi-presupuesto" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presupuesto Ejecutado</span>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold text-slate-900 leading-tight">{formatArs(executedBudget)}</span>
            <span className="text-slate-500 text-xs mt-1">de un total de {formatArs(totalBudget)}</span>
          </div>
          {/* Progreso Visual */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${budgetExecutionPct}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="font-medium flex items-center gap-1 text-blue-600">
            <TrendingUp className="w-3.5 h-3.5" /> Ejecutando lote licitado
          </span>
          <span className="font-bold font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">
            {budgetExecutionPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* CARD 3: RENDIMIENTO PROVEEDORES */}
      <div id="card-proveedores-avance" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 xl:col-span-2 flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Avance según Proveedor Adjudicado</span>
          </div>
          <span className="text-[11px] text-slate-400">Total: 4 firmas</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 my-1">
          {supplierStats.map((sup, idx) => (
            <div key={idx} className="flex flex-col text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <div className="flex justify-between items-start gap-1 mb-1.5">
                <span className="font-bold text-slate-800 line-clamp-1 h-4" title={sup.name}>
                  {sup.name.split(" ")[0]} {sup.name.includes("VERONA") ? "VERONA" : sup.name.includes("DEBONA") ? "DEBONA" : sup.name.includes("KILGELMANN") ? "KILGELMANN" : "MARTOLIO"}
                </span>
                <span className="font-mono font-bold text-slate-500 shrink-0">
                  {sup.placedCount}/{sup.tiresCount} u.
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    sup.completionPct === 100 ? "bg-emerald-500" : sup.completionPct > 0 ? "bg-amber-500" : "bg-slate-300"
                  }`}
                  style={{ width: `${sup.completionPct}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono">
                <span>{formatArs(sup.executedAmt)}</span>
                <span className="text-slate-700 font-bold">{sup.completionPct.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN ADICIONAL CORTA: AVANCE POR CIUDAD */}
      <div id="city-stats-panel" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 xl:col-span-4 hover:border-slate-300 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumplimiento por Radicación del Vehículo (Ubicación Geográfica)</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {cityStats.map((city, idx) => {
            const isFull = city.completionPct === 100;
            const hasProgress = city.completionPct > 0;
            return (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                <div className="flex flex-col mb-2">
                  <span className="text-xs font-bold text-slate-800">{city.cityName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{city.totalVehicles} {city.totalVehicles === 1 ? 'Vehículo' : 'Vehículos'}</span>
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] font-semibold text-slate-400">Taller local</span>
                    <span className="text-xs font-mono font-bold text-slate-600">{city.placedTires}/{city.totalTires}</span>
                  </div>
                  {/* Minibar */}
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-1 transition-all duration-300 ${
                        isFull ? "bg-emerald-500" : hasProgress ? "bg-amber-500" : "bg-slate-300"
                      }`}
                      style={{ width: `${city.completionPct}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-[9px] font-bold mt-1 text-slate-500 font-mono">
                    {city.completionPct.toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
