import type { Presupuesto } from "./types";

/**
 * Licencias de pago.
 *
 * Este módulo no decide si alguien ha pagado: no puede. Cualquier comprobación
 * que viva en el navegador se salta desde la consola en diez segundos. Lo único
 * que decide de verdad es el servidor, y lo hace en el único sitio donde
 * importa: el PDF sin marca de agua se genera en una función serverless que
 * exige una licencia firmada por ella misma.
 *
 * Lo que hay aquí es la parte del cliente: guardar el testigo, leer su
 * contenido para pintar la interfaz y pedirle el PDF al servidor. Si alguien
 * falsifica el contenido para que la interfaz diga «licencia activa», lo único
 * que consigue es que el servidor le devuelva un 401.
 */

const CLAVE = "presu.licencia.v2";
const CLAVE_ANTIGUA = "presu.licencia.v1";

export type Plan = "unico" | "suscripcion";

export interface Licencia {
  testigo: string;
  plan: Plan;
  /** Solo en el pago único: el presupuesto al que da derecho. */
  presupuestoId?: string;
  /** Solo en la suscripción: el cliente de Stripe, para abrirle su portal. */
  cus?: string;
  exp: number;
}

function leerCarga(testigo: string): Omit<Licencia, "testigo"> | null {
  try {
    const cuerpo = testigo.slice(0, testigo.lastIndexOf("."));
    const json = atob(cuerpo.replace(/-/g, "+").replace(/_/g, "/"));
    const datos = JSON.parse(json) as Omit<Licencia, "testigo">;
    if (typeof datos.exp !== "number" || datos.exp < Date.now()) return null;
    if (datos.plan !== "unico" && datos.plan !== "suscripcion") return null;
    return datos;
  } catch {
    return null;
  }
}

export function leerLicencia(): Licencia | null {
  try {
    // La licencia vieja no vale: se emitía sin comprobar ningún pago.
    localStorage.removeItem(CLAVE_ANTIGUA);
    const testigo = localStorage.getItem(CLAVE);
    if (!testigo) return null;
    const carga = leerCarga(testigo);
    if (!carga) {
      localStorage.removeItem(CLAVE);
      return null;
    }
    return { testigo, ...carga };
  } catch {
    return null;
  }
}

function guardar(testigo: string): Licencia | null {
  const carga = leerCarga(testigo);
  if (!carga) return null;
  try {
    localStorage.setItem(CLAVE, testigo);
  } catch {
    // Sin almacenamiento la licencia dura lo que la pestaña; el pago sigue valiendo.
  }
  return { testigo, ...carga };
}

/** ¿Esta licencia cubre este presupuesto? La suscripción los cubre todos. */
export function cubre(licencia: Licencia | null, presupuestoId: string): boolean {
  if (!licencia) return false;
  if (licencia.plan === "suscripcion") return true;
  return licencia.presupuestoId === presupuestoId;
}

async function pedir<T>(funcion: string, cuerpo: unknown): Promise<T> {
  const respuesta = await fetch(`/.netlify/functions/${funcion}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });

  if (!respuesta.ok) {
    const detalle = (await respuesta.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detalle?.error ?? `Error ${respuesta.status}`);
  }

  return respuesta.json() as Promise<T>;
}

/** Abre la pasarela de Stripe. El importe y el plan los fija el servidor. */
export async function iniciarPago(plan: Plan, presupuestoId: string): Promise<void> {
  const { url } = await pedir<{ url: string }>("crear-pago", { plan, presupuestoId });
  window.location.href = url;
}

/**
 * Al volver de Stripe la URL trae `?sesion=`. Se cambia por una licencia
 * firmada y se limpia el parámetro para que una recarga no repita la consulta.
 */
export async function recogerPagoDeLaUrl(): Promise<Licencia | null> {
  const params = new URLSearchParams(window.location.search);
  const sesion = params.get("sesion");

  if (!sesion) return null;

  limpiarParametros(["sesion", "pago"]);

  const { licencia } = await pedir<{ licencia: string }>("verificar-pago", { sesion });
  return guardar(licencia);
}

/** Renueva la suscripción preguntando otra vez a Stripe si sigue activa. */
export async function renovarSuscripcion(licencia: Licencia): Promise<Licencia | null> {
  const respuesta = await pedir<{ licencia: string }>("verificar-pago", {
    renovar: licencia.testigo,
  });
  return guardar(respuesta.licencia);
}

/**
 * Lleva al portal de Stripe, donde el usuario cancela, cambia de tarjeta y se
 * descarga sus facturas sin que tengas que atenderle tú.
 */
export async function abrirPortal(licencia: Licencia): Promise<void> {
  const { url } = await pedir<{ url: string }>("portal-cliente", {
    licencia: licencia.testigo,
  });
  window.location.href = url;
}

export interface MedidasLogo {
  ancho: number;
  alto: number;
}

/**
 * Pide al servidor el PDF sin marca de agua. Es la única forma de obtenerlo:
 * el generador limpio no viaja al navegador.
 */
export async function descargarPdfLimpio(
  presupuesto: Presupuesto,
  licencia: Licencia,
  logoMedidas?: MedidasLogo,
): Promise<Blob> {
  const respuesta = await fetch("/.netlify/functions/generar-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ licencia: licencia.testigo, presupuesto, logoMedidas }),
  });

  if (!respuesta.ok) {
    const detalle = (await respuesta.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detalle?.error ?? "No se ha podido generar el PDF");
  }

  return respuesta.blob();
}

export function limpiarParametros(nombres: string[]): void {
  const params = new URLSearchParams(window.location.search);
  for (const nombre of nombres) params.delete(nombre);
  const resto = params.toString();
  window.history.replaceState({}, "", window.location.pathname + (resto ? `?${resto}` : ""));
}

/** Mide el logotipo en el navegador: el servidor no tiene con qué hacerlo. */
export function medirLogo(dataUrl: string): Promise<MedidasLogo> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ ancho: img.naturalWidth, alto: img.naturalHeight });
    img.onerror = () => reject(new Error("No se ha podido leer el logotipo"));
    img.src = dataUrl;
  });
}
