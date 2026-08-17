import { jsPDF } from "jspdf";
import {
  agruparPorCapitulo,
  calcular,
  cantidad,
  euros,
  fechaLarga,
  fechaValidez,
  importeLinea,
  mostrarSubtotal,
  tieneCapitulos,
} from "./calc";
import type { Plantilla, Presupuesto } from "./types";

const ANCHO = 210;
const ALTO = 297;
const MARGEN = 18;
const DERECHA = ANCHO - MARGEN;

const COL_CANTIDAD = 138;
const COL_PRECIO = 158;
const COL_IVA = 170;
const ANCHO_CONCEPTO = COL_CANTIDAD - MARGEN - 28;

type RGB = [number, number, number];

const TINTA: RGB = [26, 32, 44];
const GRIS: RGB = [113, 128, 150];
const LINEA: RGB = [226, 232, 240];
const BLANCO: RGB = [255, 255, 255];

type Fuente = "helvetica" | "times";

/**
 * Los tres estilos comparten la misma geometría y solo cambian los rasgos que
 * de verdad se ven. Mantener una sola maquetación parametrizada evita tener
 * tres generadores que se desincronizan a la primera corrección.
 */
interface Estilo {
  fuente: Fuente;
  bandaSuperior: boolean;
  reglaCabecera: boolean;
  tituloEnColor: boolean;
  tituloEspaciado: number;
  filaCabeceraRellena: boolean;
  reglasCabeceraTabla: boolean;
  totalRelleno: boolean;
  rotulosEnColor: boolean;
}

const ESTILOS: Record<Plantilla, Estilo> = {
  moderna: {
    fuente: "helvetica",
    bandaSuperior: true,
    reglaCabecera: false,
    tituloEnColor: true,
    tituloEspaciado: 0,
    filaCabeceraRellena: true,
    reglasCabeceraTabla: false,
    totalRelleno: true,
    rotulosEnColor: true,
  },
  clasica: {
    fuente: "times",
    bandaSuperior: false,
    reglaCabecera: true,
    tituloEnColor: false,
    tituloEspaciado: 1.2,
    filaCabeceraRellena: false,
    reglasCabeceraTabla: true,
    totalRelleno: false,
    rotulosEnColor: false,
  },
  minimal: {
    fuente: "helvetica",
    bandaSuperior: false,
    reglaCabecera: false,
    tituloEnColor: false,
    tituloEspaciado: 2,
    filaCabeceraRellena: false,
    reglasCabeceraTabla: false,
    totalRelleno: false,
    rotulosEnColor: false,
  },
};

function hexARgb(hex: string): RGB {
  const limpio = hex.replace("#", "");
  const completo =
    limpio.length === 3
      ? limpio
          .split("")
          .map((c) => c + c)
          .join("")
      : limpio;
  const n = Number.parseInt(completo, 16);
  if (Number.isNaN(n)) return [226, 88, 43];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Lee el tamaño real de un data URL para no deformar el logo al insertarlo. */
function medirImagen(dataUrl: string): Promise<{ ancho: number; alto: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ ancho: img.naturalWidth, alto: img.naturalHeight });
    img.onerror = () => reject(new Error("No se ha podido leer el logotipo"));
    img.src = dataUrl;
  });
}

export interface OpcionesPdf {
  /** Sin pagar, el PDF sale con marca de agua. */
  conMarcaDeAgua: boolean;
  /** Dominio que se imprime en el pie de la versión gratuita. */
  dominio?: string;
}

export async function generarPdf(
  p: Presupuesto,
  opciones: OpcionesPdf = { conMarcaDeAgua: true },
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const estilo = ESTILOS[p.plantilla] ?? ESTILOS.moderna;
  const acento = hexARgb(p.color);
  const totales = calcular(p);
  const rotulo: RGB = estilo.rotulosEnColor ? acento : GRIS;
  const dominio = opciones.dominio ?? "presu.app";

  let y = 0;

  const texto = (
    valor: string,
    x: number,
    yy: number,
    opts: {
      size?: number;
      bold?: boolean;
      color?: RGB;
      align?: "left" | "right" | "center";
      espaciado?: number;
    } = {},
  ) => {
    doc.setFontSize(opts.size ?? 9);
    doc.setFont(estilo.fuente, opts.bold ? "bold" : "normal");
    const c = opts.color ?? TINTA;
    doc.setTextColor(c[0], c[1], c[2]);

    const espaciado = opts.espaciado ?? 0;
    const align = opts.align ?? "left";

    // jsPDF no suma el charSpace al medir el texto, así que al alinear a la
    // derecha o al centro con espaciado se sale del margen. Se calcula el ancho
    // real y se dibuja alineado a la izquierda en la posición correcta.
    if (espaciado > 0 && align !== "left") {
      const ancho = doc.getTextWidth(valor) + espaciado * valor.length;
      const inicio = align === "right" ? x - ancho : x - ancho / 2;
      doc.text(valor, inicio, yy, { charSpace: espaciado });
      return;
    }

    doc.text(valor, x, yy, { align, charSpace: espaciado });
  };

  const regla = (yy: number, color: RGB = LINEA, grosor = 0.2, desde = MARGEN, hasta = DERECHA) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(grosor);
    doc.line(desde, yy, hasta, yy);
  };

  // ---------- Cabecera ----------
  if (estilo.bandaSuperior) {
    doc.setFillColor(acento[0], acento[1], acento[2]);
    doc.rect(0, 0, ANCHO, 4, "F");
  }

  y = 24;

  if (p.emisor.logo) {
    try {
      const { ancho, alto } = await medirImagen(p.emisor.logo);
      const escala = Math.min(55 / ancho, 18 / alto);
      doc.addImage(p.emisor.logo, MARGEN, y - 6, ancho * escala, alto * escala);
      y += alto * escala - 6;
    } catch {
      texto(p.emisor.nombre || "Tu empresa", MARGEN, y, { size: 16, bold: true });
    }
  } else {
    texto(p.emisor.nombre || "Tu empresa", MARGEN, y, { size: 16, bold: true });
  }

  const cabeceraY = 20;
  texto("PRESUPUESTO", DERECHA, cabeceraY, {
    size: 20,
    bold: true,
    color: estilo.tituloEnColor ? acento : TINTA,
    align: "right",
    espaciado: estilo.tituloEspaciado,
  });
  texto(`Nº ${p.numero}`, DERECHA, cabeceraY + 7, { size: 10, align: "right" });
  texto(fechaLarga(p.fecha), DERECHA, cabeceraY + 12, { size: 9, color: GRIS, align: "right" });
  texto(`Válido hasta el ${fechaValidez(p.fecha, p.validezDias)}`, DERECHA, cabeceraY + 17, {
    size: 9,
    color: GRIS,
    align: "right",
  });

  y = Math.max(y + 6, cabeceraY + 26);

  if (estilo.reglaCabecera) {
    regla(y - 3, TINTA, 0.5);
    regla(y - 1.8, TINTA, 0.2);
    y += 4;
  }

  // ---------- Emisor y cliente ----------
  const bloque = (titulo: string, lineas: string[], x: number, yy: number): number => {
    texto(titulo.toUpperCase(), x, yy, { size: 7.5, bold: true, color: rotulo, espaciado: 0.4 });
    let cursor = yy + 5.5;
    lineas.forEach((linea, indice) => {
      if (!linea) return;
      const partes = doc.splitTextToSize(linea, 78) as string[];
      for (const parte of partes) {
        texto(parte, x, cursor, {
          size: indice === 0 ? 10 : 9,
          bold: indice === 0,
          color: indice === 0 ? TINTA : GRIS,
        });
        cursor += indice === 0 ? 5.2 : 4.4;
      }
    });
    return cursor;
  };

  const datosEmisor = [
    p.emisor.nombre,
    p.emisor.nif && `NIF ${p.emisor.nif}`,
    p.emisor.direccion,
    p.emisor.telefono,
    p.emisor.email,
    p.emisor.web,
  ].filter(Boolean) as string[];

  const datosCliente = [
    p.cliente.nombre,
    p.cliente.nif && `NIF ${p.cliente.nif}`,
    p.cliente.direccion,
    p.cliente.telefono,
    p.cliente.email,
  ].filter(Boolean) as string[];

  const finEmisor = bloque("De", datosEmisor, MARGEN, y);
  const finCliente = bloque("Para", datosCliente, MARGEN + 92, y);
  y = Math.max(finEmisor, finCliente) + 6;

  if (p.titulo) {
    regla(y);
    y += 7;
    texto(p.titulo, MARGEN, y, { size: 12, bold: true });
    y += 6;
  }

  // ---------- Tabla de conceptos ----------
  const cabeceraTabla = () => {
    if (estilo.filaCabeceraRellena) {
      doc.setFillColor(247, 245, 242);
      doc.rect(MARGEN - 3, y - 4.5, DERECHA - MARGEN + 6, 7, "F");
    }
    if (estilo.reglasCabeceraTabla) {
      regla(y - 4.5, TINTA, 0.3);
      regla(y + 2.5, TINTA, 0.3);
    }
    texto("CONCEPTO", MARGEN, y, { size: 7.5, bold: true, color: GRIS, espaciado: 0.3 });
    texto("CANT.", COL_CANTIDAD, y, { size: 7.5, bold: true, color: GRIS, align: "right" });
    texto("PRECIO", COL_PRECIO, y, { size: 7.5, bold: true, color: GRIS, align: "right" });
    texto("IVA", COL_IVA, y, { size: 7.5, bold: true, color: GRIS, align: "right" });
    texto("IMPORTE", DERECHA, y, { size: 7.5, bold: true, color: GRIS, align: "right" });
    y += 7;
  };

  const LIMITE_CONTENIDO = ALTO - 25;

  const asegurarEspacio = (
    alto: number,
    repetirCabecera = false,
    limite = LIMITE_CONTENIDO,
  ) => {
    if (y + alto <= limite) return;
    doc.addPage();
    y = MARGEN + 8;
    if (repetirCabecera) cabeceraTabla();
  };

  y += 4;
  cabeceraTabla();

  /** Etiqueta discreta junto al concepto para las partidas que el cliente puede elegir. */
  const marcaOpcional = (textoBase: string, yy: number) => {
    doc.setFontSize(9.5);
    doc.setFont(estilo.fuente, "bold");
    const x = MARGEN + doc.getTextWidth(textoBase) + 3;
    const ancho = 17;
    if (x + ancho > COL_CANTIDAD - 18) return;
    doc.setFillColor(LINEA[0], LINEA[1], LINEA[2]);
    doc.roundedRect(x, yy - 3.2, ancho, 4.6, 1, 1, "F");
    texto("OPCIONAL", x + ancho / 2, yy, { size: 5.5, bold: true, color: GRIS, align: "center" });
  };

  const grupos = agruparPorCapitulo(p.lineas);
  const conCapitulos = tieneCapitulos(grupos);

  for (const grupo of grupos) {
    if (conCapitulos && grupo.capitulo) {
      asegurarEspacio(12, true);
      texto(grupo.capitulo.toUpperCase(), MARGEN, y, {
        size: 8,
        bold: true,
        color: rotulo,
        espaciado: 0.5,
      });
      y += 5.5;
    }

    for (const linea of grupo.lineas) {
      const concepto = doc.splitTextToSize(linea.concepto || "—", ANCHO_CONCEPTO) as string[];
      const descripcion = linea.descripcion
        ? (doc.splitTextToSize(linea.descripcion, ANCHO_CONCEPTO) as string[])
        : [];
      const altoFila = concepto.length * 4.6 + descripcion.length * 4 + 3.6;

      asegurarEspacio(altoFila, true);

      const yFila = y;
      concepto.forEach((parte, i) => {
        texto(parte, MARGEN, y + i * 4.6, { size: 9.5, bold: true });
      });
      if (linea.opcional) {
        marcaOpcional(concepto.at(-1) ?? "", y + (concepto.length - 1) * 4.6);
      }
      descripcion.forEach((parte, i) => {
        texto(parte, MARGEN, y + concepto.length * 4.6 + i * 4, { size: 8.5, color: GRIS });
      });

      const medida = `${cantidad(linea.cantidad)} ${linea.unidad}`.trim();
      texto(medida, COL_CANTIDAD, yFila, { size: 9.5, align: "right" });
      texto(euros(linea.precio), COL_PRECIO, yFila, { size: 9.5, align: "right" });
      texto(`${linea.iva} %`, COL_IVA, yFila, { size: 9.5, color: GRIS, align: "right" });
      texto(euros(importeLinea(linea)), DERECHA, yFila, {
        size: 9.5,
        bold: !linea.opcional,
        color: linea.opcional ? GRIS : TINTA,
        align: "right",
      });

      y += altoFila;
      regla(y - 2.5);
    }

    if (conCapitulos && mostrarSubtotal(grupo)) {
      asegurarEspacio(8);
      texto(`Subtotal ${grupo.capitulo}`, MARGEN, y + 2, { size: 8.5, color: GRIS });
      texto(euros(grupo.subtotal), DERECHA, y + 2, { size: 8.5, bold: true, align: "right" });
      y += 8;
    } else if (conCapitulos && grupo.capitulo) {
      y += 2;
    }
  }

  // ---------- Totales ----------
  // La reserva se calcula con las filas que se van a pintar de verdad. Con un
  // valor fijo y generoso, un presupuesto que cabía saltaba de página y dejaba
  // media hoja en blanco.
  const filasTotales =
    1 + totales.tramos.length + (totales.descuento > 0 ? 2 : 0) + (totales.retencion > 0 ? 1 : 0);

  y += 6;
  asegurarEspacio(filasTotales * 5.4 + 14);

  const xEtiqueta = 124;
  const filaTotal = (etiqueta: string, valor: string, opts: { bold?: boolean; color?: RGB } = {}) => {
    texto(etiqueta, xEtiqueta, y, { size: 9, color: opts.color ?? GRIS, bold: opts.bold });
    texto(valor, DERECHA, y, { size: 9, align: "right", bold: opts.bold, color: opts.color });
    y += 5.4;
  };

  // Guion normal y no el signo menos tipográfico: las fuentes estándar del PDF
  // usan WinAnsi, que no tiene U+2212, y sale un carácter roto.
  filaTotal("Subtotal", euros(totales.subtotal));
  if (totales.descuento > 0) {
    filaTotal(`Descuento (${p.descuento} %)`, `- ${euros(totales.descuento)}`);
    filaTotal("Base imponible", euros(totales.base), { bold: true, color: TINTA });
  }
  for (const tramo of totales.tramos) {
    filaTotal(`IVA ${tramo.tipo} % s/ ${euros(tramo.base)}`, euros(tramo.cuota));
  }
  if (totales.retencion > 0) {
    filaTotal(`Retención IRPF (${p.irpf} %)`, `- ${euros(totales.retencion)}`);
  }

  y += 1;
  if (estilo.totalRelleno) {
    doc.setFillColor(acento[0], acento[1], acento[2]);
    doc.rect(xEtiqueta - 5, y - 1, DERECHA - xEtiqueta + 10, 12, "F");
    texto("TOTAL", xEtiqueta, y + 6.5, { size: 11, bold: true, color: BLANCO });
    texto(euros(totales.total), DERECHA, y + 6.5, {
      size: 13,
      bold: true,
      color: BLANCO,
      align: "right",
    });
  } else {
    regla(y, TINTA, 0.5, xEtiqueta - 5, DERECHA);
    texto("TOTAL", xEtiqueta, y + 7, { size: 11, bold: true, espaciado: 0.5 });
    texto(euros(totales.total), DERECHA, y + 7, { size: 13, bold: true, align: "right" });
    regla(y + 10.5, TINTA, 0.2, xEtiqueta - 5, DERECHA);
  }
  y += 14;

  // Anticipo y opcionales van bajo el total porque son lo que el cliente lee
  // justo después de ver la cifra: cuánto pago ahora y qué más puedo añadir.
  if (totales.anticipo > 0) {
    asegurarEspacio(12);
    texto(`Anticipo al aceptar (${p.anticipo} %)`, xEtiqueta, y, { size: 9, color: GRIS });
    texto(euros(totales.anticipo), DERECHA, y, { size: 9, bold: true, align: "right" });
    y += 5.4;
    texto("Resto a la entrega", xEtiqueta, y, { size: 9, color: GRIS });
    texto(euros(totales.resto), DERECHA, y, { size: 9, bold: true, align: "right" });
    y += 9;
  }

  if (totales.opcionales > 0) {
    asegurarEspacio(10);
    texto("Mejoras opcionales, IVA incluido", xEtiqueta, y, { size: 9, color: GRIS });
    texto(`+ ${euros(totales.opcionales)}`, DERECHA, y, { size: 9, bold: true, align: "right" });
    y += 9;
  }

  // ---------- Notas y condiciones ----------
  const ALTO_CONFORMIDAD = 15;

  /**
   * `arrastraCierre` reserva además el bloque de firma. Sin eso, el último
   * párrafo se quedaba en la primera página y la segunda salía con nada más
   * que la línea de la firma, que es de las cosas que peor quedan en un
   * documento que vas a mandar a un cliente.
   */
  const parrafo = (titulo: string, cuerpo: string, arrastraCierre = false) => {
    if (!cuerpo.trim()) return;
    const partes = doc.splitTextToSize(cuerpo, DERECHA - MARGEN) as string[];
    const extra = arrastraCierre ? ALTO_CONFORMIDAD + 4 : 0;
    asegurarEspacio(partes.length * 4.1 + 10 + extra);
    texto(titulo.toUpperCase(), MARGEN, y, { size: 7.5, bold: true, color: rotulo, espaciado: 0.4 });
    y += 5;
    for (const parte of partes) {
      texto(parte, MARGEN, y, { size: 8.5, color: GRIS });
      y += 4.1;
    }
    y += 3.5;
  };

  // El último párrafo con texto es el que tiene que arrastrar la firma.
  const ultimoParrafo = p.condiciones.trim() ? "condiciones" : "notas";
  parrafo("Notas", p.notas, ultimoParrafo === "notas");
  parrafo("Condiciones", p.condiciones, true);

  // ---------- Conformidad ----------
  // Es el cierre natural del documento y una página suelta con solo la firma
  // queda fatal, así que se le permite apurar hasta casi el pie: ocupa 18 mm y
  // la regla del pie está en ALTO - 16.
  asegurarEspacio(ALTO_CONFORMIDAD, false, ALTO - 19);
  y += 4;
  texto("ACEPTACIÓN DEL PRESUPUESTO", MARGEN, y, {
    size: 7.5,
    bold: true,
    color: rotulo,
    espaciado: 0.4,
  });
  y += 7;
  regla(y, GRIS, 0.2, MARGEN, MARGEN + 70);
  regla(y, GRIS, 0.2, MARGEN + 92, MARGEN + 140);
  y += 4;
  texto("Firma del cliente", MARGEN, y, { size: 8, color: GRIS });
  texto("Fecha", MARGEN + 92, y, { size: 8, color: GRIS });

  // ---------- Pie y marca de agua ----------
  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina++) {
    doc.setPage(pagina);

    regla(ALTO - 16);
    texto(
      [p.emisor.nombre, p.emisor.telefono, p.emisor.email].filter(Boolean).join("  ·  "),
      MARGEN,
      ALTO - 11,
      { size: 7.5, color: GRIS },
    );
    texto(`${pagina} / ${paginas}`, DERECHA, ALTO - 11, { size: 7.5, color: GRIS, align: "right" });

    if (opciones.conMarcaDeAgua) {
      doc.setFont(estilo.fuente, "bold");
      doc.setFontSize(46);
      doc.setTextColor(LINEA[0], LINEA[1], LINEA[2]);
      doc.text("PRESU · VERSIÓN GRATUITA", ANCHO / 2, ALTO / 2, {
        align: "center",
        angle: 32,
      });
      texto(`Creado con Presu · ${dominio}`, ANCHO / 2, ALTO - 6, {
        size: 7.5,
        color: GRIS,
        align: "center",
      });
    }
  }

  return doc;
}

const DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "g");

export function nombreArchivo(p: Presupuesto): string {
  const cliente = (p.cliente.nombre || "cliente")
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `presupuesto-${p.numero}-${cliente}.pdf`;
}
