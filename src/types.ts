export type TipoIva = 21 | 10 | 4 | 0;

export interface Linea {
  id: string;
  /** Capítulo al que pertenece la partida. Vacío = presupuesto sin capítulos. */
  capitulo: string;
  concepto: string;
  descripcion: string;
  /** Las partidas opcionales se muestran pero no suman al total. */
  opcional: boolean;
  cantidad: number;
  /** m², ud, h, ml… Los gremios miden en unidades y el cliente lo espera ver. */
  unidad: string;
  precio: number;
  iva: TipoIva;
}

export const UNIDADES = ["ud", "h", "m²", "m", "ml", "m³", "kg", "día", "mes"];

export interface Emisor {
  nombre: string;
  nif: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  logo: string | null;
}

export interface Cliente {
  nombre: string;
  nif: string;
  direccion: string;
  telefono: string;
  email: string;
}

export type Plantilla = "clasica" | "moderna" | "minimal";

export interface Presupuesto {
  id: string;
  /** Marca de tiempo del último cambio, para ordenar la lista de presupuestos. */
  actualizado: number;
  numero: string;
  fecha: string;
  validezDias: number;
  titulo: string;
  emisor: Emisor;
  cliente: Cliente;
  lineas: Linea[];
  descuento: number;
  irpf: number;
  /** Porcentaje que se cobra al aceptar el presupuesto. 0 = no se muestra. */
  anticipo: number;
  notas: string;
  condiciones: string;
  plantilla: Plantilla;
  color: string;
}

export const IVA_DISPONIBLES: TipoIva[] = [21, 10, 4, 0];

export const IRPF_DISPONIBLES = [
  { valor: 0, etiqueta: "Sin retención" },
  { valor: 7, etiqueta: "7 % (nuevo autónomo)" },
  { valor: 15, etiqueta: "15 % (general)" },
];

export function nuevaLinea(): Linea {
  return {
    id: crypto.randomUUID(),
    capitulo: "",
    concepto: "",
    descripcion: "",
    opcional: false,
    cantidad: 1,
    unidad: "ud",
    precio: 0,
    iva: 21,
  };
}

export function presupuestoVacio(): Presupuesto {
  const hoy = new Date();
  return {
    id: crypto.randomUUID(),
    actualizado: Date.now(),
    numero: `${hoy.getFullYear()}-001`,
    fecha: hoy.toISOString().slice(0, 10),
    validezDias: 30,
    titulo: "",
    emisor: {
      nombre: "",
      nif: "",
      direccion: "",
      telefono: "",
      email: "",
      web: "",
      logo: null,
    },
    cliente: {
      nombre: "",
      nif: "",
      direccion: "",
      telefono: "",
      email: "",
    },
    lineas: [nuevaLinea()],
    descuento: 0,
    irpf: 0,
    anticipo: 0,
    notas: "",
    condiciones:
      "El presente presupuesto no incluye trabajos no descritos expresamente. " +
      "La aceptación por parte del cliente implica la conformidad con las condiciones aquí recogidas.",
    plantilla: "moderna",
    color: "#E2582B",
  };
}

export function presupuestoEjemplo(): Presupuesto {
  const base = presupuestoVacio();
  return {
    ...base,
    titulo: "Reforma de baño principal",
    emisor: {
      nombre: "Reformas Molina S.L.",
      nif: "B12345678",
      direccion: "C/ Mayor 14, 2º B\n28013 Madrid",
      telefono: "600 123 456",
      email: "hola@reformasmolina.es",
      web: "reformasmolina.es",
      logo: null,
    },
    cliente: {
      nombre: "Ana Belmonte Ruiz",
      nif: "12345678Z",
      direccion: "Av. de la Constitución 8, 4º A\n28660 Boadilla del Monte",
      telefono: "655 987 321",
      email: "ana.belmonte@email.com",
    },
    anticipo: 40,
    lineas: [
      {
        ...nuevaLinea(),
        capitulo: "Demolición",
        concepto: "Demolición y retirada de escombros",
        descripcion: "Picado de alicatado, retirada de sanitarios y transporte a vertedero autorizado.",
        precio: 680,
      },
      {
        ...nuevaLinea(),
        capitulo: "Albañilería",
        concepto: "Alicatado y solado",
        descripcion: "Colocación de pavimento porcelánico 60×60 y azulejo en paredes. Material incluido.",
        cantidad: 14,
        unidad: "m²",
        precio: 46,
      },
      {
        ...nuevaLinea(),
        capitulo: "Instalaciones",
        concepto: "Fontanería",
        descripcion: "Sustitución de tomas de agua, desagües y montaje de sanitarios.",
        precio: 940,
      },
      {
        ...nuevaLinea(),
        capitulo: "Acabados",
        concepto: "Mampara de ducha",
        descripcion: "Mampara fija de vidrio templado 8 mm con perfilería negra.",
        precio: 385,
      },
      {
        ...nuevaLinea(),
        capitulo: "Acabados",
        concepto: "Suelo radiante eléctrico",
        descripcion: "Manta radiante bajo el pavimento con termostato programable.",
        cantidad: 5,
        unidad: "m²",
        precio: 78,
        opcional: true,
      },
    ],
    notas:
      "Plazo estimado de ejecución: 12 días laborables desde el inicio de los trabajos.\n" +
      "No incluye: licencias municipales ni retirada de mobiliario.",
  };
}
