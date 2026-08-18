/**
 * Validacion de lo que llega del navegador.
 *
 * La funcion que genera el PDF acepta un presupuesto entero enviado por el
 * cliente. Sin topes, cualquiera podria usarla como generador de PDF gratis o
 * tumbarla mandando cien mil lineas. Todo lo que entra se recorta y se acota
 * antes de tocar jsPDF.
 */

export const LIMITES = {
  lineas: 200,
  texto: 500,
  textoLargo: 4000,
  logo: 400_000,
  cuerpo: 1_500_000,
};

const PLANTILLAS = new Set(["moderna", "clasica", "minimal"]);
const IVAS = new Set([21, 10, 4, 0]);

// Los caracteres de control no pintan nada en el PDF y solo ensucian el archivo:
// aqui se buscan a proposito para quitarlos.
// oxlint-disable-next-line no-control-regex
const CONTROLES = new RegExp("[\\u0000-\\u001f\\u007f]", "g");

export class ErrorValidacion extends Error {}

function texto(valor, maximo = LIMITES.texto) {
  if (typeof valor !== "string") return "";
  return valor.replace(CONTROLES, "").slice(0, maximo);
}

function numero(valor, { min = 0, max = 1e9, porDefecto = 0 } = {}) {
  const n = typeof valor === "number" ? valor : Number.parseFloat(valor);
  if (!Number.isFinite(n)) return porDefecto;
  return Math.min(max, Math.max(min, n));
}

function color(valor) {
  return typeof valor === "string" && /^#[0-9a-fA-F]{3,6}$/.test(valor) ? valor : "#E2582B";
}

function fecha(valor) {
  return typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ? valor
    : new Date().toISOString().slice(0, 10);
}

function logo(valor) {
  if (typeof valor !== "string") return null;
  if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(valor)) return null;
  if (valor.length > LIMITES.logo) return null;
  return valor;
}

function parte(valor) {
  const origen = valor && typeof valor === "object" ? valor : {};
  return {
    nombre: texto(origen.nombre, 120),
    nif: texto(origen.nif, 40),
    direccion: texto(origen.direccion, 200),
    telefono: texto(origen.telefono, 40),
    email: texto(origen.email, 120),
  };
}

/** Devuelve un presupuesto seguro de pasar a jsPDF, o lanza si es irrecuperable. */
export function validarPresupuesto(bruto) {
  if (!bruto || typeof bruto !== "object") {
    throw new ErrorValidacion("Falta el presupuesto");
  }
  if (!Array.isArray(bruto.lineas)) {
    throw new ErrorValidacion("El presupuesto no tiene partidas");
  }
  if (bruto.lineas.length > LIMITES.lineas) {
    throw new ErrorValidacion(`Maximo ${LIMITES.lineas} partidas por presupuesto`);
  }

  return {
    id: texto(bruto.id, 60),
    actualizado: Date.now(),
    numero: texto(bruto.numero, 40),
    fecha: fecha(bruto.fecha),
    validezDias: Math.round(numero(bruto.validezDias, { min: 1, max: 3650, porDefecto: 30 })),
    titulo: texto(bruto.titulo, 160),
    emisor: {
      ...parte(bruto.emisor),
      web: texto(bruto.emisor?.web, 120),
      logo: logo(bruto.emisor?.logo),
    },
    cliente: parte(bruto.cliente),
    lineas: bruto.lineas.map((linea) => ({
      id: texto(linea?.id, 60),
      capitulo: texto(linea?.capitulo, 80),
      concepto: texto(linea?.concepto, 200),
      descripcion: texto(linea?.descripcion, 600),
      opcional: linea?.opcional === true,
      cantidad: numero(linea?.cantidad, { min: -1e6, max: 1e6 }),
      unidad: texto(linea?.unidad, 12),
      precio: numero(linea?.precio, { min: -1e7, max: 1e7 }),
      iva: IVAS.has(linea?.iva) ? linea.iva : 21,
    })),
    descuento: numero(bruto.descuento, { max: 100 }),
    irpf: numero(bruto.irpf, { max: 100 }),
    anticipo: numero(bruto.anticipo, { max: 100 }),
    notas: texto(bruto.notas, LIMITES.textoLargo),
    condiciones: texto(bruto.condiciones, LIMITES.textoLargo),
    plantilla: PLANTILLAS.has(bruto.plantilla) ? bruto.plantilla : "moderna",
    color: color(bruto.color),
  };
}

/** Medidas del logotipo: las mide el navegador porque en Node no existe Image. */
export function validarMedidasLogo(bruto) {
  if (!bruto || typeof bruto !== "object") return undefined;
  const ancho = numero(bruto.ancho, { min: 1, max: 20000, porDefecto: 0 });
  const alto = numero(bruto.alto, { min: 1, max: 20000, porDefecto: 0 });
  return ancho && alto ? { ancho, alto } : undefined;
}

export async function leerCuerpo(peticion) {
  const longitud = Number.parseInt(peticion.headers.get("content-length") ?? "0", 10);
  if (Number.isFinite(longitud) && longitud > LIMITES.cuerpo) {
    throw new ErrorValidacion("La peticion es demasiado grande");
  }
  return peticion.json();
}
