import React, { useState, useEffect } from "react";
import { 
  VEHICLE_DATA_LIST, 
  VehicleData, 
  ReplacementRecord, 
  SUPPLIERS, 
  MOCK_REPLACEMENTS 
} from "./data";
import StatsView from "./components/StatsView";
import VehicleDetailPanel from "./components/VehicleDetailPanel";
import { exportToCSV, getCopyableTSV } from "./components/ExcelExportHelper";
import { 
  Search, 
  Download, 
  Copy, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Filter, 
  Grid3X3, 
  Briefcase, 
  MapPin, 
  Eye, 
  Wrench, 
  FileSpreadsheet,
  Plus,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  User,
  Trash,
  X
} from "lucide-react";

export default function App() {
  // Estado para la planilla de progresos
  const [replacements, setReplacements] = useState<Record<number, ReplacementRecord>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [supplierWorkshops, setSupplierWorkshops] = useState<Record<string, string[]>>({});
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showWorkshopsAdminModal, setShowWorkshopsAdminModal] = useState(false);
  const [newWorkshopTexts, setNewWorkshopTexts] = useState<Record<string, string>>({});

  // Talleres preconfigurados por proveedor
  const DEFAULT_WORKSHOPS: Record<string, string[]> = {
    "FLEMING Y MARTOLIO S.A.": [
      "Av. Facundo Zuviría 5600, Santa Fe",
      "Av. Ovidio Lagos 4200, Rosario",
      "Bv. Roca 600, Rafaela"
    ],
    "NEUMÁTICOS VERONA S.R.L.": [
      "Av. Pellegrini 4300, Rosario",
      "Av. Freyre 2300, Santa Fe"
    ],
    "DEBONA MARCELO FABIÁN Y VICTOR HUGO DEBONA S.H.": [
      "Bv. Lehmann 650, Rafaela"
    ],
    "EDGAR KILGELMANN Y CÍA S.R.L.": [
      "Av. Angela de la Casa 1200, Rafaela"
    ]
  };

  // Cargar talleres de proveedores con migración inteligente
  useEffect(() => {
    const cachedWorkshops = localStorage.getItem("mpa_neumaticos_supplier_workshops_v3");
    if (cachedWorkshops) {
      try {
        setSupplierWorkshops(JSON.parse(cachedWorkshops));
      } catch (err) {
        console.error("Error cargando talleres de proveedores", err);
      }
    } else {
      // Intentar migrar desde la clave anterior simple si existiera
      const oldAddresses = localStorage.getItem("mpa_neumaticos_supplier_addresses_v2");
      if (oldAddresses) {
        try {
          const parsedOld: Record<string, string> = JSON.parse(oldAddresses);
          const migrated: Record<string, string[]> = {};
          Object.keys(parsedOld).forEach(key => {
            const val = parsedOld[key];
            if (val) {
              // Dividir si tiene el separador "/"
              migrated[key] = val.split("/").map(part => part.trim()).filter(Boolean);
            } else {
              migrated[key] = DEFAULT_WORKSHOPS[key] || [];
            }
          });
          setSupplierWorkshops(migrated);
          localStorage.setItem("mpa_neumaticos_supplier_workshops_v3", JSON.stringify(migrated));
        } catch (e) {
          setSupplierWorkshops(DEFAULT_WORKSHOPS);
        }
      } else {
        setSupplierWorkshops(DEFAULT_WORKSHOPS);
      }
    }
  }, []);

  const saveSupplierWorkshops = (updated: Record<string, string[]>) => {
    setSupplierWorkshops(updated);
    localStorage.setItem("mpa_neumaticos_supplier_workshops_v3", JSON.stringify(updated));
  };

  const addSupplierWorkshop = (supplierName: string, address: string) => {
    if (!address.trim()) return;
    const currentList = supplierWorkshops[supplierName] || [];
    if (currentList.includes(address.trim())) {
      triggerAlert("warn", "Esta dirección de taller ya está agregada para este proveedor.");
      return;
    }
    const updated = {
      ...supplierWorkshops,
      [supplierName]: [...currentList, address.trim()]
    };
    saveSupplierWorkshops(updated);
    triggerAlert("success", `Taller agregado con éxito a ${supplierName.split(" ")[0]}.`);
  };

  const removeSupplierWorkshop = (supplierName: string, indexToRemove: number) => {
    const currentList = supplierWorkshops[supplierName] || [];
    const updatedList = currentList.filter((_, idx) => idx !== indexToRemove);
    const updated = {
      ...supplierWorkshops,
      [supplierName]: updatedList
    };
    saveSupplierWorkshops(updated);
    triggerAlert("info", "Taller eliminado.");
  };

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("TODOS");
  const [filterLocation, setFilterLocation] = useState("TODOS");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  
  // Estados Auxiliares de Interfaz
  const [showStats, setShowStats] = useState(true);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [importText, setImportText] = useState("");
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "info" | "warn"; text: string } | null>(null);

  // Cargar estado inicial desde Local Storage
  useEffect(() => {
    let cached = localStorage.getItem("mpa_neumaticos_compliance_v1");
    if (!cached) {
      // Fallback para migración si existían datos de versiones anteriores
      cached = localStorage.getItem("mpa_ neumáticos_compliance_v1");
    }
    if (cached) {
      try {
        setReplacements(JSON.parse(cached));
      } catch (err) {
        console.error("Error cargando caché", err);
      }
    } else {
      // Inicializar planilla vacía para los 22 Renglones
      const initial: Record<number, ReplacementRecord> = {};
      VEHICLE_DATA_LIST.forEach(v => {
        initial[v.renglon] = {
          renglon: v.renglon,
          tires: Array(v.cantidad).fill(null).map(() => ({
            colocado: false,
            fechaColocacion: "",
            kilometraje: undefined,
            nroActa: "",
            comentarios: ""
          }))
        };
      });
      setReplacements(initial);
    }
  }, []);

  // Guardar estado en Local Storage al cambiar
  const saveReplacements = (updated: Record<number, ReplacementRecord>) => {
    setReplacements(updated);
    localStorage.setItem("mpa_neumaticos_compliance_v1", JSON.stringify(updated));
  };

  // Guardar cambio de un renglón individual
  const handleSaveVehicleRecord = (record: ReplacementRecord) => {
    const updated = {
      ...replacements,
      [record.renglon]: record
    };
    saveReplacements(updated);
    triggerAlert("success", `Datos del Renglón ${record.renglon} guardados correctamente.`);
  };

  // Guardar cambio del encargado de manera inline en la grilla
  const handleInlineEncargadoChange = (renglon: number, value: string) => {
    const defaultTiresCount = VEHICLE_DATA_LIST.find(v => v.renglon === renglon)?.cantidad || 4;
    const existing = replacements[renglon] || {
      renglon,
      tires: Array(defaultTiresCount).fill(null).map(() => ({
        colocado: false,
        fechaColocacion: "",
        kilometraje: undefined,
        nroActa: "",
        comentarios: ""
      }))
    };
    const updated = {
      ...replacements,
      [renglon]: {
        ...existing,
        encargado: value
      }
    };
    saveReplacements(updated);
  };

  // Guardar cambio del taller de manera inline en la grilla
  const handleInlineWorkshopChange = (renglon: number, value: string) => {
    const defaultTiresCount = VEHICLE_DATA_LIST.find(v => v.renglon === renglon)?.cantidad || 4;
    const existing = replacements[renglon] || {
      renglon,
      tires: Array(defaultTiresCount).fill(null).map(() => ({
        colocado: false,
        fechaColocacion: "",
        kilometraje: undefined,
        nroActa: "",
        comentarios: ""
      }))
    };
    const updated = {
      ...replacements,
      [renglon]: {
        ...existing,
        selectedWorkshop: value
      }
    };
    saveReplacements(updated);
  };

  // Inicializar con la simulación de datos (Demo) para mostrar la aplicación cargada
  const loadMockSimulation = () => {
    const updated: Record<number, ReplacementRecord> = {};
    
    // Primero rellenamos todo vacío
    VEHICLE_DATA_LIST.forEach(v => {
      updated[v.renglon] = {
        renglon: v.renglon,
        tires: Array(v.cantidad).fill(null).map(() => ({
          colocado: false,
          fechaColocacion: "",
          kilometraje: undefined,
          nroActa: "",
          comentarios: ""
        }))
      };
    });

    // Luego insertamos la simulación real
    MOCK_REPLACEMENTS.forEach(mock => {
      const vehicle = VEHICLE_DATA_LIST.find(v => v.renglon === mock.renglon);
      if (vehicle) {
        const tiresArray = Array(vehicle.cantidad).fill(null).map((_, idx) => {
          if (mock.tires[idx]) {
            return { ...mock.tires[idx] };
          }
          return { colocado: false, fechaColocacion: "", kilometraje: undefined, nroActa: "", comentarios: "" };
        });
        updated[mock.renglon] = {
          renglon: mock.renglon,
          tires: tiresArray
        };
      }
    });

    saveReplacements(updated);
    triggerAlert("info", "Se han cargado datos simulados de cambio de neumáticos para evaluación.");
  };

  // Resetear planilla a cero
  const resetToZero = () => {
    setShowResetConfirmModal(true);
  };

  const handleResetToZeroTotal = () => {
    const initial: Record<number, ReplacementRecord> = {};
    VEHICLE_DATA_LIST.forEach(v => {
      initial[v.renglon] = {
        renglon: v.renglon,
        tires: Array(v.cantidad).fill(null).map(() => ({
          colocado: false,
          fechaColocacion: "",
          kilometraje: undefined,
          nroActa: "",
          comentarios: ""
        }))
      };
    });
    saveReplacements(initial);
    triggerAlert("warn", "Toda la planilla ha sido reseteada a estado pendiente.");
    setShowResetConfirmModal(false);
  };

  // Activación de alerts temporales
  const triggerAlert = (type: "success" | "info" | "warn", text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  // Copiar TSV para que el usuario pueda pegarlo directo en Excel / Drive
  const handleCopyToClipboard = () => {
    try {
      const tsvData = getCopyableTSV(VEHICLE_DATA_LIST, replacements);
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        // Fallback para navegadores antiguos o sin SSL/permisos de iframe
        const textarea = document.createElement("textarea");
        textarea.value = tsvData;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (success) {
          setCopiedSuccess(true);
          triggerAlert("success", "¡Fórmulas y columnas copiadas! Abre Google Sheets o Excel y presiona Ctrl+V para pegar.");
          setTimeout(() => setCopiedSuccess(false), 3000);
        } else {
          triggerAlert("warn", "No se pudo copiar automáticamente. Por favor use el botón de exportar CSV.");
        }
        return;
      }

      navigator.clipboard.writeText(tsvData).then(() => {
        setCopiedSuccess(true);
        triggerAlert("success", "¡Fórmulas y columnas copiadas! Abre Google Sheets o Excel y presiona Ctrl+V para pegar.");
        setTimeout(() => setCopiedSuccess(false), 3000);
      }).catch(err => {
        console.error("Fallo copiando", err);
        triggerAlert("warn", "Fallo al copiar de forma segura. Descargue el CSV.");
      });
    } catch (e) {
      console.error(e);
      triggerAlert("warn", "Error al acceder al portapapeles. Use la descarga de CSV.");
    }
  };

  // Copiar enlace directo de Google Sheets/Drive para el usuario
  const openGoogleSheetsNewAlert = () => {
    triggerAlert("info", "Redirigiendo de forma segura a un libro nuevo de Google Sheets...");
  };

  // Exportar a CSV compatible con Excel
  const handleExportCSV = () => {
    exportToCSV(VEHICLE_DATA_LIST, replacements);
    triggerAlert("success", "Generando descarga de planilla Excel (CSV) con codificación UTF-8...");
  };

  // Funciones para Backup manual (JSON)
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(replacements, null, 2);
    setImportText(jsonStr);
    triggerAlert("success", "Se ha generado el código JSON de respaldo abajo.");
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(importText);
      // Validar mínimamente
      if (typeof parsed === "object" && parsed !== null) {
        saveReplacements(parsed);
        setShowBackupModal(false);
        triggerAlert("success", "¡Copia de respaldo restaurada con éxito!");
      } else {
        alert("Formato inválido. Debe ser un JSON válido.");
      }
    } catch (e) {
      alert("Error procesando los datos. Asegúrate de pegar el código correcto.");
    }
  };

  // Filtrado de la lista
  const filteredVehicles = VEHICLE_DATA_LIST.filter(v => {
    // 1. Búsqueda por texto (Patente, Modelo, Renglón, Neumático, Encargado)
    const rec = replacements[v.renglon];
    const encargadoName = rec?.encargado || "";
    const matchesQuery = 
      v.patente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehiculo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.medida.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.proveedor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      encargadoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.renglon.toString() === searchQuery.trim();

    // 2. Filtro Proveedor
    const matchesSupplier = filterSupplier === "TODOS" || v.proveedor === filterSupplier;

    // 3. Filtro Radicación (Ciudad)
    const matchesLocation = filterLocation === "TODOS" || v.radicacion.toLowerCase().includes(filterLocation.toLowerCase());

    // 4. Filtro Estado de Cumplimiento
    const record = replacements[v.renglon];
    const placedCount = record ? record.tires.filter(t => t.colocado).length : 0;
    
    let matchesStatus = true;
    if (filterStatus === "PENDIENTE") {
      matchesStatus = placedCount === 0;
    } else if (filterStatus === "PARCIAL") {
      matchesStatus = placedCount > 0 && placedCount < v.cantidad;
    } else if (filterStatus === "COMPLETO") {
      matchesStatus = placedCount === v.cantidad;
    }

    return matchesQuery && matchesSupplier && matchesLocation && matchesStatus;
  });

  // Totales de la flota actual
  const totalTires = VEHICLE_DATA_LIST.reduce((sum, v) => sum + v.cantidad, 0);
  const totalCompletedTires = VEHICLE_DATA_LIST.reduce((sum, v) => {
    const rec = replacements[v.renglon];
    if (!rec) return sum;
    return sum + rec.tires.filter(t => t.colocado).length;
  }, 0);

  // Formateador monetario sencillo
  const formatArsSimple = (num: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-amber-500/20 selection:text-slate-900 custom-scrollbar">
      
      {/* HEADER DE LA APLICACIÓN */}
      <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 select-none shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold tracking-wider font-display shrink-0 shadow-xs">
              MPA
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">Control de Cambio de Neumáticos</h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Resolución Licitación Privada N° 09/2026 • Ministerio Público de la Acusación</p>
            </div>
          </div>

          {/* ACCIONES CLAVE */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadMockSimulation}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all font-bold text-xs flex items-center gap-1.5 shadow-xs"
              title="Carga una simulación con reemplazos de muestra para apreciar gráficos y filtros."
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cargar Lote Demo
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all font-bold text-xs flex items-center gap-1.5 shadow-xs"
              title="Copia las celdas formateadas del tablero. Luego puedes pegarlas con Ctrl+V directamente en Google Sheets o Excel."
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedSuccess ? "¡Copiado!" : "Copiar filas para Excel"}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all font-bold text-xs flex items-center gap-1.5 shadow-xs"
              title="Descarga un archivo .CSV con codificación compatible para abrir con doble clic en MS Excel."
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Planilla (CSV)
            </button>

            <button
              onClick={() => setShowBackupModal(true)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all font-semibold text-xs flex items-center gap-1 shadow-xs"
              title="Opciones de respaldo completo de tus datos de control."
            >
              Respaldar
            </button>

            <button
              onClick={() => setShowWorkshopsAdminModal(true)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-amber-600 hover:text-amber-700 hover:bg-slate-50 transition-all font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              title="Permite agregar múltiples talleres y sucursales a los proveedores adjudicados."
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Administrar Talleres
            </button>

            <button
              onClick={resetToZero}
              className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
              title="Resetear toda la planilla a cero"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ALERTAS PUSH INTEGRATIVAS */}
      {alertMessage && (
        <div className="fixed top-24 right-4 z-50 max-w-md animate-fade-in select-none">
          <div className={`p-4 rounded-xl shadow-xl border flex items-center gap-3 ${
            alertMessage.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : alertMessage.type === "warn" 
                ? "bg-rose-50 border-rose-200 text-rose-800" 
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold font-sans">{alertMessage.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* CUERPO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* INTERFAZ DE INSTRUCCIONES RÁPIDAS */}
        <div className="bg-white text-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 select-none grid-dots">
          <div className="flex-1">
            <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-md">Control con Autoguardado</span>
            <h2 className="text-lg font-bold font-display text-slate-900 mt-2">Administrador de Cumplimiento de Flotas • MPA</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Planilla interactiva diseñada específicamente con la información de los <b>22 renglones</b> adjudicados de la Licitación N° 09/2026. 
              Puedes ir marcando la colocación efectiva de cada uno de los <b>{totalTires} neumáticos</b> de los vehículos y exportarlo para vincularlo cómodamente a tu <b>Google Drive / Google Sheets</b>.
            </p>
          </div>
          <div className="flex shrink-0 gap-2 w-full md:w-auto">
            <a 
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              onClick={openGoogleSheetsNewAlert}
              className="w-full md:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Crear Google Sheet vacío
            </a>
          </div>
        </div>

        {/* MODULO 1: ESTADÍSTICAS Y KPI PANEL */}
        <div className="mb-4 flex items-center justify-between select-none">
          <h3 className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" /> Rendimiento y Cumplimiento Financiero de Licitación
          </h3>
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50"
          >
            {showStats ? "Ocultar Análisis" : "Ver Análisis Detallado"}
          </button>
        </div>

        {showStats && (
          <>
            <StatsView vehicles={VEHICLE_DATA_LIST} replacements={replacements} />
            
            {/* INTERFAZ PARA VISUALIZAR LOS ESTABLECIMIENTOS Y SUCURSALES DE LOS PROVEEDORES */}
            <div id="supplier-addresses-panel" className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 select-none p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 animate-pulse" />
                  <h3 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                    Talleres y Sucursales Autorizadas de Colocación
                  </h3>
                </div>
                <button
                  onClick={() => setShowWorkshopsAdminModal(true)}
                  className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 hover:bg-amber-500/25 transition-all text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Administrar Talleres
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Cada proveedor adjudicado dispone de talleres habilitados donde los vehículos de la flota del MPA deben concurrir para realizar la colocación y recambio de cubiertas:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SUPPLIERS.map((s) => {
                  const workshops = supplierWorkshops[s.name] || [];
                  const shortName = s.name.split(" ")[0] + (s.name.includes("VERONA") ? " VERONA" : s.name.includes("DEBONA") ? " DEBONA" : s.name.includes("KILGELMANN") ? " KILGELMANN" : " MARTOLIO");
                  return (
                    <div key={s.name} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-400 font-mono">CUIT: {s.cuit}</span>
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                            {workshops.length} {workshops.length === 1 ? "taller" : "talleres"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-1" title={s.name}>
                          {shortName}
                        </h4>
                        
                        {/* Listado de talleres de esta tarjeta */}
                        <div className="mt-2.5 space-y-1">
                          {workshops.slice(0, 3).map((w, idx) => (
                            <div key={idx} className="text-[10px] text-slate-600 flex items-start gap-1 truncate" title={w}>
                              <span className="text-amber-500 font-bold">•</span>
                              <span className="truncate">{w}</span>
                            </div>
                          ))}
                          {workshops.length > 3 && (
                            <div className="text-[9px] text-amber-600 font-bold pl-2 italic">
                              + {workshops.length - 3} talleres más...
                            </div>
                          )}
                          {workshops.length === 0 && (
                            <div className="text-[10px] text-rose-500 font-bold italic">
                              Sin talleres asignados
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowWorkshopsAdminModal(true)}
                        className="mt-3.5 w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-amber-500/30 rounded-lg text-[10px] text-slate-600 hover:text-slate-800 transition-all font-semibold"
                      >
                        Gestionar Sucursales
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* FILTROS BÚSQUEDA Y GRILLA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 select-none overflow-hidden">
          {/* BARRA DE FILTROS */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            
            {/* Input buscar */}
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por Patente (e.g., AC025KH), Marca, Modelo o Renglón..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-slate-800 placeholder-slate-450"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Selector Proveedor */}
            <div className="relative shrink-0 flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 hidden sm:inline">Proveedor:</span>
              <select
                className="bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 [&>option]:bg-white"
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
              >
                <option value="TODOS">Todos los Proveedores (4)</option>
                {SUPPLIERS.map(s => (
                  <option key={s.name} value={s.name}>{s.name.split(" ")[0]} ({s.name.includes("VERONA") ? "VERONA" : s.name.includes("DEBONA") ? "DEBONA" : s.name.includes("KILGELMANN") ? "KILGELMANN" : "MARTOLIO"})</option>
                ))}
              </select>
            </div>

            {/* Selector Radicación */}
            <div className="relative shrink-0 flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 hidden sm:inline">Ciudad:</span>
              <select
                className="bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 [&>option]:bg-white"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                <option value="TODOS">Todas las Ciudades</option>
                <option value="Santa Fe">Santa Fe</option>
                <option value="Rosario">Rosario</option>
                <option value="Venado Tuerto">Venado Tuerto</option>
                <option value="Reconquista">Reconquista</option>
                <option value="Rafaela">Rafaela</option>
              </select>
            </div>

            {/* Selector Estado */}
            <div className="relative shrink-0 flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 hidden sm:inline">Cumplimiento:</span>
              <select
                className="bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 [&>option]:bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="PENDIENTE">Pendientes (0%)</option>
                <option value="PARCIAL">En Progreso (Parcial)</option>
                <option value="COMPLETO">Completos (100%)</option>
              </select>
            </div>
          </div>

          {/* TABLA WORKSHEET GRID */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-slate-700 text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 select-none">
                  <th className="py-4 px-4 text-center w-14 font-mono">Reng.</th>
                  <th className="py-4 px-3 w-32">Patente / Vehículo</th>
                  <th className="py-4 px-4 w-32">Ciudad</th>
                  <th className="py-4 px-4 w-60">Proveedor Adjudicado & Taller</th>
                  <th className="py-4 px-4 w-48">Responsable de Traslado (MPA)</th>
                  <th className="py-4 px-4 text-center w-28">Medida/Cant.</th>
                  <th className="py-4 px-4 w-32 text-center">Cumplimiento</th>
                  <th className="py-4 px-4 text-right w-36">Costo Total</th>
                  <th className="py-4 px-4 text-center w-24">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map(v => {
                    const rec = replacements[v.renglon];
                    const placedCount = rec ? rec.tires.filter(t => t.colocado).length : 0;
                    const isCompleted = placedCount === v.cantidad;
                    const isPartial = placedCount > 0 && placedCount < v.cantidad;
                    const progressPercent = (placedCount / v.cantidad) * 100;

                    return (
                      <tr 
                        key={v.renglon} 
                        className={`hover:bg-slate-50 transition-colors group ${
                          isCompleted ? "bg-emerald-500/5" : ""
                        }`}
                      >
                        {/* Renglón */}
                        <td className="py-3 px-4 font-bold text-center text-slate-400 font-mono">
                          {v.renglon}
                        </td>

                        {/* Patente / Vehículo */}
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 block w-max mb-1 select-all">
                            {v.patente}
                          </span>
                          <div className="font-semibold text-slate-900 text-[11px] group-hover:text-amber-600 transition-colors">
                            {v.vehiculo.split(" ")[0]} {v.vehiculo.split(" ").slice(1, 4).join(" ")}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {v.vehiculo.split(" ").slice(4).join(" ") || "Vehículo Oficial"}
                          </div>
                        </td>

                        {/* Ciudad */}
                        <td className="py-3 px-4 text-slate-600 font-medium font-sans">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {v.radicacion}
                          </span>
                        </td>

                        {/* Proveedor Adjudicado & Taller */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 truncate max-w-[200px]" title={v.proveedor}>
                            {v.proveedor.split(" ")[0]} {v.proveedor.includes("VERONA") ? "VERONA" : v.proveedor.includes("DEBONA") ? "DEBONA" : v.proveedor.includes("KILGELMANN") ? "KILGELMANN" : "MARTOLIO"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mb-1.5">
                            CUIT: {v.cuit}
                          </div>
                          {(() => {
                            const workshops = supplierWorkshops[v.proveedor] || [];
                            const activeWorkshop = rec?.selectedWorkshop || workshops[0] || "";
                            
                            return (
                              <div className="flex flex-col gap-1 max-w-[220px]">
                                {workshops.length > 0 ? (
                                  <div className="relative flex items-center bg-slate-50 border border-slate-200 hover:border-amber-500/40 focus-within:border-amber-500/60 rounded-xl px-2.5 py-1.5 transition-all">
                                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mr-1.5" />
                                    <select
                                      className="w-full bg-transparent text-[10px] text-amber-700 focus:outline-hidden font-semibold cursor-pointer truncate [&>option]:bg-white [&>option]:text-slate-800"
                                      value={activeWorkshop}
                                      onChange={(e) => handleInlineWorkshopChange(v.renglon, e.target.value)}
                                      title={activeWorkshop}
                                    >
                                      {workshops.map((w, idx) => (
                                        <option key={idx} value={w} title={w}>
                                          {w}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md italic">
                                    Sin talleres cargados
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Responsable de Traslado (MPA) */}
                        <td className="py-3 px-3">
                          <div className="relative flex items-center bg-slate-50 border border-slate-200 hover:border-slate-300 focus-within:border-amber-500/60 rounded-xl px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
                            <User className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                            <input
                              type="text"
                              placeholder="Fijar chofer o responsable..."
                              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
                              value={rec?.encargado || ""}
                              onChange={(e) => handleInlineEncargadoChange(v.renglon, e.target.value)}
                            />
                          </div>
                        </td>

                        {/* Medida / Cantidad */}
                        <td className="py-3 px-4 text-center">
                          <div className="font-mono text-[11px] font-bold text-slate-800">{v.medida}</div>
                          <span className="text-[10px] text-slate-500 block mb-1 truncate max-w-[125px]" title={v.marcaNeumatico}>{v.marcaNeumatico}</span>
                          <span className="inline-block bg-slate-100 text-slate-500 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-md">
                            CANTIDAD: {v.cantidad}
                          </span>
                        </td>

                        {/* Cumplimiento Interactivo / Visual */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-center">
                            {/* Layout Visual de Ruedas adaptativas */}
                            <div className="flex gap-1 mb-1.5">
                              {Array(v.cantidad).fill(null).map((_, idx) => {
                                const isTirePlaced = rec && rec.tires[idx]?.colocado;
                                return (
                                  <div 
                                    key={idx}
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[7px] font-bold ${
                                      isTirePlaced 
                                        ? "bg-emerald-500 border-emerald-600 text-white shadow-xs" 
                                        : "bg-slate-100 border-slate-200 text-slate-300"
                                    }`}
                                    title={isTirePlaced ? `Neumático ${idx+1}: Colocado` : `Neumático ${idx+1}: Pendiente`}
                                  />
                                );
                              })}
                            </div>
                            {/* Badge */}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                              isCompleted 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : isPartial 
                                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                              {placedCount}/{v.cantidad} ({progressPercent.toFixed(0)}%)
                            </span>
                          </div>
                        </td>

                        {/* Costo Total */}
                        <td className="py-3 px-4 text-right font-display font-bold text-slate-900 text-sm">
                          {formatArsSimple(v.importeTotal)}
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedVehicle(v)}
                            className="bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors rounded-xl px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center mx-auto gap-1 shadow-xs"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400 font-semibold uppercase tracking-wider">
                      NO SE ENCONTRARON REGISTROS COINCIDENTES PARA SU BÚSQUEDA
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TABLA FOOTER */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-2xl">
            <span>Mostrando {filteredVehicles.length} de {VEHICLE_DATA_LIST.length} vehículos de la licitación adjudicados.</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Estado de la Flota:</span>
              <span className="bg-amber-500 text-slate-950 font-bold font-mono px-2 py-0.5 rounded-md">
                {totalCompletedTires} / {totalTires} Neumáticos Colocados ({(totalCompletedTires / totalTires * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* NOTA ACLARATORIA TÉCNICA */}
        <div id="technical-disclaimer" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm select-none mb-8">
          <div className="flex items-start gap-3.5 text-xs leading-relaxed text-slate-600">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Información Importante de los Pliegos de Adjudicación</h4>
              <p className="mb-2 text-slate-500">El lugar de radicación de los automóviles se incluye a título informativo para facilitar la logística del Ministerio. El Ministerio Público de la Acusación coordinará directamente los traslados de las flotas a los talleres mecánicos correspondientes de los proveedores:</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                <li><strong className="text-slate-800">FLEMING Y MARTOLIO S.A.</strong> posee talleres mecánicos oficiales y se priorizó en Reconquista para eludir viáticos improductivos.</li>
                <li><strong className="text-slate-800">NEUMÁTICOS VERONA S.R.L.</strong> tiene su taller en la ciudad de Rosario.</li>
                <li><strong className="text-slate-800">EDGAR KILGELMANN Y CÍA S.R.L.</strong> y <strong className="text-slate-800">DEBONA S.H.</strong> disponen de sus talleres mecánicos en la localidad de Rafaela.</li>
              </ul>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER DE PAGINA */}
      <footer id="app-footer" className="bg-white text-slate-500 py-6 border-t border-slate-200 text-center text-xs select-none">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Control de Neumáticos • MPA. Diseñado para control logístico de contratos y licitaciones oficiales.</p>
          <p className="mt-1 text-slate-400">Sistema Autogestionado • Los datos ingresados se guardan localmente en el navegador y no se comparten con servidores de terceros.</p>
        </div>
      </footer>

      {/* COMPONENTE LATERAL DE GESTIÓN DE VEHÍCULO */}
      {selectedVehicle && (
        <VehicleDetailPanel
          vehicle={selectedVehicle}
          currentRecord={replacements[selectedVehicle.renglon]}
          workshops={supplierWorkshops[selectedVehicle.proveedor] || []}
          onSave={handleSaveVehicleRecord}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN DE RESETEO DE PLANILLA */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold font-display text-slate-950">¿Confirmar Reseteo Completo?</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              ¿Está seguro de querer resetear <strong>TODA la planilla y flotas a cero</strong>? Se perderán permanentemente todos los estados de los neumáticos colocados, actas, kilometrajes y encargados configurados hasta el momento.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancelar y conservar datos
              </button>
              <button
                onClick={handleResetToZeroTotal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Sí, resetear todo a cero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COPIA DE RESPALDO (MANUAL BACKUP) */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl max-w-xl w-full mx-4 shadow-2xl border border-slate-200 text-slate-700">
            <h3 className="text-lg font-bold font-display text-slate-950 mb-2">Importar / Exportar Datos de Control</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Puedes copiar el texto en formato JSON para guardar un respaldo manual en tu computadora o pendrive, o pegar un respaldo previo para restaurar todos tus datos de cumplimiento en 1 segundo.
            </p>
            
            <textarea
              className="w-full h-48 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              placeholder="Pega el código JSON de respaldo aquí..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />

            <div className="mt-4 flex gap-2 justify-between">
              <div>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors"
                >
                  Generar código de respaldo
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleImportJSON}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Restaurar Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE GESTIÓN DE TALLERES (MÚLTIPLES TALLERES POR PROVEEDOR) */}
      {showWorkshopsAdminModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl max-w-4xl w-full mx-4 shadow-2xl border border-slate-200 text-slate-700 flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-950 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  Administrar Talleres por Proveedor
                </h3>
                <p className="text-xs text-slate-450 mt-1">
                  Agrega o elimina sucursales/talleres autorizados para la colocación de neumáticos de cada proveedor adjudicado.
                </p>
              </div>
              <button
                onClick={() => setShowWorkshopsAdminModal(false)}
                className="p-1.5 rounded-xl text-slate-450 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid de Proveedores */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUPPLIERS.map((s) => {
                const workshops = supplierWorkshops[s.name] || [];
                const shortName = s.name.split(" ")[0] + (s.name.includes("VERONA") ? " VERONA" : s.name.includes("DEBONA") ? " DEBONA" : s.name.includes("KILGELMANN") ? " KILGELMANN" : " MARTOLIO");
                
                return (
                  <div key={s.name} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-tight">{shortName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">CUIT: {s.cuit}</span>
                      </div>
                      
                      {/* Listado de Talleres */}
                      <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {workshops.length > 0 ? (
                          workshops.map((w, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white border border-slate-200/60 p-2 rounded-xl group/item">
                              <span className="text-[11px] text-slate-700 font-medium truncate pr-2" title={w}>
                                {w}
                              </span>
                              <button
                                onClick={() => removeSupplierWorkshop(s.name, idx)}
                                className="p-1 rounded-lg text-slate-450 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover/item:opacity-100 focus:opacity-100 shrink-0"
                                title="Eliminar este taller"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 px-2.5 py-2 rounded-xl italic">
                            No hay talleres cargados para este proveedor.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formulario Añadir Taller */}
                    <div className="border-t border-slate-200 pt-3 mt-auto">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Nueva dirección del taller..."
                          className="flex-1 bg-white border border-slate-200 focus:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-hidden font-medium"
                          value={newWorkshopTexts[s.name] || ""}
                          onChange={(e) => setNewWorkshopTexts(prev => ({ ...prev, [s.name]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addSupplierWorkshop(s.name, newWorkshopTexts[s.name] || "");
                              setNewWorkshopTexts(prev => ({ ...prev, [s.name]: "" }));
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            addSupplierWorkshop(s.name, newWorkshopTexts[s.name] || "");
                            setNewWorkshopTexts(prev => ({ ...prev, [s.name]: "" }));
                          }}
                          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-colors"
                          title="Agregar Taller"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setShowWorkshopsAdminModal(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Aceptar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
