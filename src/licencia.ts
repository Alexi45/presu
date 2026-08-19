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

const CLAVE = "presu.licencias.v3";
const CLAVE_ANTIGUA = "presu.licencia.v2";
const CLAVE_PREHISTORICA = "presu.licencia.v1";

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

/**
 * Se guardan TODAS las licencias, no la última.
 *
 * Antes solo cabía una, así que pagar un segundo presupuesto borraba el derecho
 * sobre el primero: el usuario había pagado dos veces y solo podía descargar
 * uno. Ahora conviven, y una suscripción no anula los pagos sueltos anteriores.
 */
export function leerLicencias(): Licencia[] {
  try {
    // La primera versión se emitía sin comprobar ningún pago: no vale.
    localStorage.removeItem(CLAVE_PREHISTORICA);

    const testigos: string[] = [];

    const guardadas = localStorage.getItem(CLAVE);
    if (guardadas) testigos.push(...(JSON.parse(guardadas) as string[]));

    // Migración desde la época de una sola licencia.
    const suelta = localStorage.getItem(CLAVE_ANTIGUA);
    if (suelta) {
      testigos.push(suelta);
      localStorage.removeItem(CLAVE_ANTIGUA);
    }

    const validas = testigos
      .map((testigo) => {
        const carga = leerCarga(testigo);
        return carga ? { testigo, ...carga } : null;
      })
      .filter((l): l is Licencia => l !== null);

    escribir(validas);
    return validas;
  } catch {
    return [];
  }
}

function escribir(licencias: Licencia[]): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(licencias.map((l) => l.testigo)));
  } catch {
    // Sin almacenamiento duran lo que la pestaña; el pago sigue valiendo.
  }
}

/** Añade licencias nuevas sin tirar las que ya había. */
export function guardarLicencias(testigos: string[]): Licencia[] {
  const nuevas = testigos
    .map((testigo) => {
      const carga = leerCarga(testigo);
      return carga ? { testigo, ...carga } : null;
    })
    .filter((l): l is Licencia => l !== null);

  const todas = [...leerLicencias()];
  for (const nueva of nuevas) {
    const yaEsta = todas.some(
      (l) => l.plan === nueva.plan && l.presupuestoId === nueva.presupuestoId,
    );
    if (!yaEsta) todas.push(nueva);
  }

  escribir(todas);
  return todas;
}

/** La licencia que cubre este presupuesto, si hay alguna. */
export function licenciaPara(
  licencias: Licencia[],
  presupuestoId: string,
): Licencia | null {
  return (
    licencias.find((l) => l.plan === "suscripcion") ??
    licencias.find((l) => l.presupuestoId === presupuestoId) ??
    null
  );
}

export function suscripcionActiva(licencias: Licencia[]): Licencia | null {
  return licencias.find((l) => l.plan === "suscripcion") ?? null;
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
export async function recogerPagoDeLaUrl(): Promise<Licencia[] | null> {
  const params = new URLSearchParams(window.location.search);
  const sesion = params.get("sesion");
  const acceso = params.get("acceso");

  if (!sesion && !acceso) return null;

  limpiarParametros(["sesion", "acceso", "pago"]);

  // Al volver de Stripe llega una licencia; al abrir el enlace del correo,
  // todas las que tenga ese cliente.
  if (acceso) {
    const { licencias } = await pedir<{ licencias: string[] }>("verificar-pago", { acceso });
    return guardarLicencias(licencias);
  }

  const { licencia } = await pedir<{ licencia: string }>("verificar-pago", { sesion });
  return guardarLicencias([licencia]);
}

/** Pide por correo el enlace que devuelve el acceso en este dispositivo. */
export async function pedirEnlaceDeAcceso(email: string): Promise<string> {
  const { mensaje } = await pedir<{ mensaje: string }>("recuperar-acceso", { email });
  return mensaje;
}

/** Renueva la suscripción preguntando otra vez a Stripe si sigue activa. */
export async function renovarSuscripcion(licencia: Licencia): Promise<Licencia[]> {
  const respuesta = await pedir<{ licencia: string }>("verificar-pago", {
    renovar: licencia.testigo,
  });
  return guardarLicencias([respuesta.licencia]);
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
