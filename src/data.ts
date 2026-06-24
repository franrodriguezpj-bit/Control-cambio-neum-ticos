export interface VehicleData {
  renglon: number;
  cantidad: number;
  medida: string;
  marcaNeumatico: string;
  vehiculo: string;
  patente: string;
  radicacion: string;
  proveedor: string;
  cuit: string;
  importeTotal: number;
  observacionesAdjudicacion?: string;
}

export interface TireStatus {
  colocado: boolean;
  fechaColocacion?: string;
  kilometraje?: number;
  nroActa?: string;
  comentarios?: string;
}

export interface ReplacementRecord {
  renglon: number;
  tires: TireStatus[];
  encargado?: string;
  selectedWorkshop?: string;
}

export const SUPPLIERS = [
  {
    name: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    totalAdjudicado: 6467530,
    renglones: [1, 3, 4, 5, 9, 14, 15, 16, 17, 18, 19, 20],
    domicilio: "Av. Facundo Zuviría 5600, Santa Fe / Av. Ovidio Lagos 4200, Rosario"
  },
  {
    name: "NEUMÁTICOS VERONA S.R.L.",
    cuit: "30-67747012-3",
    totalAdjudicado: 3869600,
    renglones: [2, 6, 7, 8, 10, 11, 12, 13],
    domicilio: "Av. Pellegrini 4300, Rosario"
  },
  {
    name: "DEBONA MARCELO FABIÁN Y VICTOR HUGO DEBONA S.H.",
    cuit: "30-69240236-3",
    totalAdjudicado: 1023760,
    renglones: [22],
    domicilio: "Bv. Lehmann 650, Rafaela"
  },
  {
    name: "EDGAR KILGELMANN Y CÍA S.R.L.",
    cuit: "30-64550592-8",
    totalAdjudicado: 399488,
    renglones: [21],
    domicilio: "Av. Angela de la Casa 1200, Rafaela"
  }
];

export const VEHICLE_DATA_LIST: VehicleData[] = [
  {
    renglon: 1,
    cantidad: 4,
    medida: "265/60 R18",
    marcaNeumatico: "Pirelli Scorpion",
    vehiculo: "Toyota Hilux L/16 2.8 DC 4X4 TDI SRX 2018",
    patente: "AC025KH",
    radicacion: "Santa Fe",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 1282600,
    observacionesAdjudicacion: "Se prefirió técnicamente la mejor calidad de Pirelli Scorpion por sobre marcas de origen chino para resguardo de la seguridad del vehículo de alto despliegue."
  },
  {
    renglon: 2,
    cantidad: 4,
    medida: "265/70 R16",
    marcaNeumatico: "Pirelli Fórmula",
    vehiculo: "Toyota Hilux 2.5 D4-D DC 4x2 TX Pack L/12 2015",
    patente: "PHT 792",
    radicacion: "Santa Fe",
    proveedor: "NEUMÁTICOS VERONA S.R.L.",
    cuit: "30-67747012-3",
    importeTotal: 920000,
    observacionesAdjudicacion: "Adjudicado por Oferta Alternativa conveniente. La colocación puede realizarse en sus talleres de Rosario donde el vehículo opera."
  },
  {
    renglon: 3,
    cantidad: 4,
    medida: "215/50 R17",
    marcaNeumatico: "Pirelli Cinturato",
    vehiculo: "Chevrolet Cruze 1.4 4 PTAS PREMIER AT 2022",
    patente: "AF719AE",
    radicacion: "Santa Fe",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 1022400,
    observacionesAdjudicacion: "Ponderado Fleming por radicación en Santa Fe para evitar traslados y viáticos improductivos a Rosario."
  },
  {
    renglon: 4,
    cantidad: 4,
    medida: "215/50 R17",
    marcaNeumatico: "Pirelli Cinturato",
    vehiculo: "Chevrolet Cruze 1.4 4 PTAS PREMIER AT 2022",
    patente: "AF719AC",
    radicacion: "Santa Fe",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 1022400,
    observacionesAdjudicacion: "Ponderado Fleming por radicación en Santa Fe para evitar viáticos y costos de traslado."
  },
  {
    renglon: 5,
    cantidad: 2,
    medida: "185/65 R15",
    marcaNeumatico: "Pirelli Fórmula",
    vehiculo: "Volkswagen Polo 1.6 L/18 Com. 5 P. Plus TIP 2018",
    patente: "AD154WQ",
    radicacion: "Santa Fe",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 329610,
    observacionesAdjudicacion: "Oferta Alternativa de Fleming preferida para evitar gastos de traslado del auto radicado en Santa Fe."
  },
  {
    renglon: 6,
    cantidad: 4,
    medida: "205/55 R16",
    marcaNeumatico: "Pirelli P400",
    vehiculo: "Volkswagen Vento 2.5 170 HP Luxury L11 2013",
    patente: "NEU 212",
    radicacion: "Rosario",
    proveedor: "NEUMÁTICOS VERONA S.R.L.",
    cuit: "30-67747012-3",
    importeTotal: 640000,
    observacionesAdjudicacion: "Radicación coincidente con los talleres del proveedor en Rosario."
  },
  {
    renglon: 7,
    cantidad: 4,
    medida: "215/55 R18",
    marcaNeumatico: "Fate",
    vehiculo: "Volkswagen Taos 1.4 250 TSI Comfortline AT L/24 2025",
    patente: "AH521JK",
    radicacion: "Rosario",
    proveedor: "NEUMÁTICOS VERONA S.R.L.",
    cuit: "30-67747012-3",
    importeTotal: 920000,
    observacionesAdjudicacion: "Adjudicado por Oferta Alternativa marca Fate. Radicación en Rosario coincidente con taller."
  },
  {
    renglon: 8,
    cantidad: 2,
    medida: "205/55 R16",
    marcaNeumatico: "Pirelli",
    vehiculo: "Toyota Corolla 1.8 XEI L/17 Pack 2018",
    patente: "AF784ZF",
    radicacion: "Rosario",
    proveedor: "NEUMÁTICOS VERONA S.R.L.",
    cuit: "30-67747012-3",
    importeTotal: 320000,
    observacionesAdjudicacion: "Oferta alternativa conveniente. Radicación coincidente con taller."
  },
  {
    renglon: 9,
    cantidad: 2,
    medida: "225/45 R17",
    marcaNeumatico: "Pirelli PWRGY",
    vehiculo: "Peugeot 308 1.6 HDI Allure NAV 2013",
    patente: "MOI 293",
    radicacion: "Rosario",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 522000,
    observacionesAdjudicacion: "Se prefirió marca de primera línea Pirelli PWRGY sobre marcas de origen chino por seguridad."
  },
  {
    renglon: 10,
    cantidad: 2,
    medida: "175/70 R14",
    marcaNeumatico: "Pirelli P1",
    vehiculo: "Volkswagen Voyage 1.6 Trendline L-17 2017",
    patente: "AB143LK",
    radicacion: "Rosario",
    proveedor: "NEUMÁTICOS VERONA S.R.L.",
    cuit: "30-67747012-3",
    importeTotal: 236000,
    observacionesAdjudicacion: "Oferta alternativa Pirelli P1. Radicación de origen del auto coincide con taller en Rosario."
  },
  {
    renglon: 11,
    cantidad: 2,
    medida: "185/60 R15",
    marcaNeumatico: "Pirelli P1",
    vehiculo: "Peugeot 207 Compact 1.6 4P Feline 2011",
    patente: "KHL 921",
    radicacion: "Rosario",
    proveedor: "NEUMÁTICOS VERONA S.R.L.",
    cuit: "30-67747012-3",
    importeTotal: 256800,
    observacionesAdjudicacion: "Oferta Alternativa Pirelli P1. Provisión local."
  },
  {
    renglon: 12,
    cantidad: 2,
    medida: "185/60 R15",
    marcaNeumatico: "Pirelli P1",
    vehiculo: "Fiat Cronos 1.3 DRIVE GSE PACK CONECTI. L/21 2022",
    patente: "AF460EG",
    radicacion: "Rosario",
    proveedor: "NEUMÁTICOS VERONA S.R.L.",
    cuit: "30-67747012-3",
    importeTotal: 256800,
    observacionesAdjudicacion: "Oferta Alternativa Pirelli P1. Coincidente con la radicación en Rosario."
  },
  {
    renglon: 13,
    cantidad: 2,
    medida: "205/55 R16",
    marcaNeumatico: "Pirelli P400",
    vehiculo: "Volkswagen Vento 2.5 170 HP LUXURY L11 2010",
    patente: "IWZ 775",
    radicacion: "Rosario",
    proveedor: "NEUMÁTICOS VERONA S.R.L.",
    cuit: "30-67747012-3",
    importeTotal: 320000,
    observacionesAdjudicacion: "Oferta alternativa Pirelli P400. Sintonía local."
  },
  {
    renglon: 14,
    cantidad: 4,
    medida: "175/65 R14",
    marcaNeumatico: "Pirelli Fórmula",
    vehiculo: "Ford Ka 1.5 S+ 2017",
    patente: "AB425GG",
    radicacion: "Venado Tuerto",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 395000,
    observacionesAdjudicacion: "Se prefiere oferta alternativa de de Fleming y Martolio ya que posee taller más próximo en Rosario para los autos de Venado Tuerto."
  },
  {
    renglon: 15,
    cantidad: 2,
    medida: "185/60 R15",
    marcaNeumatico: "Pirelli Fórmula",
    vehiculo: "Peugeot 207 Compact 1.6 4P Feline 2011",
    patente: "KHL 842",
    radicacion: "Venado Tuerto",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 288600,
    observacionesAdjudicacion: "Se prefiere oferta Pirelli Fórmula de Fleming por proximidad de talleres y por sobre marcas de origen chino de otros oferentes."
  },
  {
    renglon: 16,
    cantidad: 2,
    medida: "205/55 R16",
    marcaNeumatico: "Pirelli Fórmula",
    vehiculo: "Toyota Corolla 1.8 XLI L17 2017",
    patente: "AC118KW",
    radicacion: "Reconquista",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 368500,
    observacionesAdjudicacion: "Ponderado por radicación. Fleming cuenta con talleres en la ciudad de Reconquista, evitando gastos sustanciales de traslado."
  },
  {
    renglon: 17,
    cantidad: 2,
    medida: "185/65 R15",
    marcaNeumatico: "Pirelli Fórmula",
    vehiculo: "Renault Kangoo EXPRESS 1.5 DCI CONFORT 5 AS L/18 2022",
    patente: "AF392EX",
    radicacion: "Reconquista",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 329610,
    observacionesAdjudicacion: "Ponderado por radicación. Evita traslados de unidades a ciudades distantes."
  },
  {
    renglon: 18,
    cantidad: 2,
    medida: "185/60 R15",
    marcaNeumatico: "Pirelli Fórmula",
    vehiculo: "Fiat Cronos 1.3 DRIVE GSE PACK CONECTI. L/21 2022",
    patente: "AF460EE",
    radicacion: "Reconquista",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 288600,
    observacionesAdjudicacion: "Pirelli Fórmula adjudicado a Fleming por contar con talleres mecánicos locales en la ciudad de Reconquista."
  },
  {
    renglon: 19,
    cantidad: 2,
    medida: "185/65 R15",
    marcaNeumatico: "Pirelli Fórmula",
    vehiculo: "Peugeot Partner Patagónica 1.6 VTC L/10/17 2014",
    patente: "OAV 478",
    radicacion: "Reconquista",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 329610,
    observacionesAdjudicacion: "Se prefirió Fleming & Martolio por poseer talleres en la localidad del vehículo."
  },
  {
    renglon: 20,
    cantidad: 2,
    medida: "185/60 R15",
    marcaNeumatico: "Pirelli Fórmula",
    vehiculo: "Peugeot 207 Compact 1.6 4P Feline 2011",
    patente: "KHL 919",
    radicacion: "Reconquista",
    proveedor: "FLEMING Y MARTOLIO S.A.",
    cuit: "30-67839373-4",
    importeTotal: 288600,
    observacionesAdjudicacion: "Adjudicado a Fleming S.A. que posee cobertura de talleres directamente en Reconquista."
  },
  {
    renglon: 21,
    cantidad: 2,
    medida: "185/65 R15",
    marcaNeumatico: "Pirelli 92H Cinturato P1",
    vehiculo: "Peugeot Partner Patagónica 1.6 VTC L10/17 2014",
    patente: "OAV 449",
    radicacion: "Rafaela",
    proveedor: "EDGAR KILGELMANN Y CÍA S.R.L.",
    cuit: "30-64550592-8",
    importeTotal: 399488,
    observacionesAdjudicacion: "Único oferente conveniente con talleres propios en Rafaela, evitando gastos de traslado de la unidad."
  },
  {
    renglon: 22,
    cantidad: 4,
    medida: "225/50 R17",
    marcaNeumatico: "BFGoodrich",
    vehiculo: "Renault Fluence 2.0 GT2 2018",
    patente: "AC191TN",
    radicacion: "Rafaela",
    proveedor: "DEBONA MARCELO FABIÁN Y VICTOR HUGO DEBONA S.H.",
    cuit: "30-69240236-3",
    importeTotal: 1023760,
    observacionesAdjudicacion: "Se adjudicó marca premium BFGoodrich por sobre oferentes de marcas chinas y por poseer talleres en Rafaela."
  }
];

export const MOCK_REPLACEMENTS = [
  {
    renglon: 1,
    tires: [
      { colocado: true, fechaColocacion: "2026-06-10", kilometraje: 145200, nroActa: "ACTA-2026-0041", comentarios: "Cambio completo óptimo" },
      { colocado: true, fechaColocacion: "2026-06-10", kilometraje: 145200, nroActa: "ACTA-2026-0041", comentarios: "Cambio completo óptimo" },
      { colocado: true, fechaColocacion: "2026-06-10", kilometraje: 145200, nroActa: "ACTA-2026-0041", comentarios: "Cambio completo óptimo" },
      { colocado: true, fechaColocacion: "2026-06-10", kilometraje: 145200, nroActa: "ACTA-2026-0041", comentarios: "Cambio completo óptimo" }
    ]
  },
  {
    renglon: 2,
    tires: [
      { colocado: true, fechaColocacion: "2026-06-12", kilometraje: 210850, nroActa: "NEX-449", comentarios: "Trasero izquierdo y derecho" },
      { colocado: true, fechaColocacion: "2026-06-12", kilometraje: 210850, nroActa: "NEX-449", comentarios: "Trasero izquierdo y derecho" },
      { colocado: false },
      { colocado: false }
    ]
  },
  {
    renglon: 3,
    tires: [
      { colocado: true, fechaColocacion: "2026-06-15", kilometraje: 43210, nroActa: "ACTA-2026-015C", comentarios: "Delanteros nuevos" },
      { colocado: true, fechaColocacion: "2026-06-15", kilometraje: 43210, nroActa: "ACTA-2026-015C", comentarios: "Delanteros nuevos" },
      { colocado: true, fechaColocacion: "2026-06-15", kilometraje: 43210, nroActa: "ACTA-2026-015C", comentarios: "Traseros colocados" },
      { colocado: true, fechaColocacion: "2026-06-15", kilometraje: 43210, nroActa: "ACTA-2026-015C", comentarios: "Traseros colocados" }
    ]
  },
  {
    renglon: 5,
    tires: [
      { colocado: true, fechaColocacion: "2026-06-08", kilometraje: 98400, nroActa: "ACTA-2026-033", comentarios: "Colocación y alineación en Santa Fe" },
      { colocado: true, fechaColocacion: "2026-06-08", kilometraje: 98400, nroActa: "ACTA-2026-033", comentarios: "Colocación y alineación en Santa Fe" }
    ]
  },
  {
    renglon: 10,
    tires: [
      { colocado: true, fechaColocacion: "2026-06-18", kilometraje: 112000, nroActa: "FAC-11029", comentarios: "Reemplazo de neumáticos lisos" },
      { colocado: false }
    ]
  }
];
