import type { Linea, Presupuesto, TipoIva } from "./types";

/** Redondeo a 2 decimales evitando los errores clásicos de coma flotante (1.005 → 1.01). */
export function redondear(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface TramoIva {
  tipo: TipoIva;
  base: number;
  cuota: number;
}

export interface Totales {
  subtotal: number;
  descuento: number;
  base: number;
  tramos: TramoIva[];
  totalIva: number;
  retencion: number;
  total: number;
  /** Importe con IVA de las partidas opcionales, que no entran en el total. */
  opcionales: number;
  anticipo: number;
  resto: number;
}

export interface Grupo {
  capitulo: string;
  lineas: Linea[];
  /** Suma de las partidas no opcionales del capítulo, antes de impuestos. */
  subtotal: number;
}

export function importeLinea(linea: Linea): number {
  return redondear(linea.cantidad * linea.precio);
}

/** Una línea cuenta si tiene algo escrito o algún importe; el resto son huecos del editor. */
export function lineaVisible(linea: Linea): boolean {
  return Boolean(linea.concepto || linea.descripcion || linea.precio !== 0);
}

/**
 * Agrupa por capítulos consecutivos. Se agrupa por posición y no por nombre a
 * propósito: el orden en el que el usuario ha colocado las partidas es el orden
 * en el que quiere leerlas, y reordenarlas por detrás sería una sorpresa.
 */
export function agruparPorCapitulo(lineas: Linea[]): Grupo[] {
  const grupos: Grupo[] = [];

  for (const linea of lineas) {
    if (!lineaVisible(linea)) continue;
    const capitulo = linea.capitulo.trim();
    const ultimo = grupos.at(-1);

    if (ultimo && ultimo.capitulo === capitulo) ultimo.lineas.push(linea);
    else grupos.push({ capitulo, lineas: [linea], subtotal: 0 });
  }

  for (const grupo of grupos) {
    grupo.subtotal = redondear(
      grupo.lineas
        .filter((linea) => !linea.opcional)
        .reduce((suma, linea) => suma + importeLinea(linea), 0),
    );
  }

  return grupos;
}

/** Solo se enseñan los capítulos si el presupuesto está realmente dividido en ellos. */
export function tieneCapitulos(grupos: Grupo[]): boolean {
  return grupos.length > 1 && grupos.some((grupo) => grupo.capitulo !== "");
}

/**
 * Un capítulo de una sola partida no necesita subtotal: repetiría la cifra que
 * el cliente acaba de leer una línea más arriba.
 */
export function mostrarSubtotal(grupo: Grupo): boolean {
  return grupo.capitulo !== "" && grupo.lineas.length > 1;
}

export function calcular(p: Presupuesto): Totales {
  const computables = p.lineas.filter((linea) => lineaVisible(linea) && !linea.opcional);

  const subtotal = redondear(
    computables.reduce((suma, linea) => suma + importeLinea(linea), 0),
  );

  const factorDescuento = p.descuento > 0 ? 1 - p.descuento / 100 : 1;
  const descuento = redondear(subtotal * (1 - factorDescuento));
  const base = redondear(subtotal - descuento);

  // El IVA se agrupa por tipo: Hacienda exige el desglose por tipo impositivo,
  // no un único importe agregado.
  const porTipo = new Map<TipoIva, number>();
  for (const linea of computables) {
    const baseLinea = importeLinea(linea) * factorDescuento;
    porTipo.set(linea.iva, (porTipo.get(linea.iva) ?? 0) + baseLinea);
  }

  const tramos: TramoIva[] = [...porTipo.entries()]
    .filter(([, baseTramo]) => baseTramo !== 0)
    .sort((a, b) => b[0] - a[0])
    .map(([tipo, baseTramo]) => ({
      tipo,
      base: redondear(baseTramo),
      cuota: redondear(baseTramo * (tipo / 100)),
    }));

  const totalIva = redondear(tramos.reduce((suma, t) => suma + t.cuota, 0));
  const retencion = redondear(base * (p.irpf / 100));
  const total = redondear(base + totalIva - retencion);

  // Las opcionales se enseñan con su IVA incluido: es lo que le costaría al
  // cliente añadirlas, que es la pregunta que se hace al leerlas.
  const opcionales = redondear(
    p.lineas
      .filter((linea) => lineaVisible(linea) && linea.opcional)
      .reduce((suma, linea) => suma + importeLinea(linea) * (1 + linea.iva / 100), 0),
  );

  const anticipo = p.anticipo > 0 ? redondear(total * (p.anticipo / 100)) : 0;
  const resto = redondear(total - anticipo);

  return {
    subtotal,
    descuento,
    base,
    tramos,
    totalIva,
    retencion,
    total,
    opcionales,
    anticipo,
    resto,
  };
}

const formateadorEuros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function euros(n: number): string {
  return formateadorEuros.format(n);
}

const formateadorCantidad = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
});

export function cantidad(n: number): string {
  return formateadorCantidad.format(n);
}

export function fechaLarga(iso: string): string {
  const fecha = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function fechaCorta(iso: string): string {
  const fecha = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-ES");
}

export function fechaValidez(iso: string, dias: number): string {
  const fecha = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return "";
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toLocaleDateString("es-ES");
}
