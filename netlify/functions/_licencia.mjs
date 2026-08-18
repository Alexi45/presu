import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Licencias firmadas.
 *
 * El navegador no puede decidir si alguien ha pagado: cualquier comprobación
 * que viva en el cliente se salta abriendo las herramientas de desarrollo. Lo
 * único que funciona es que el servidor firme un testigo tras confirmar el
 * cobro con Stripe, y que después solo el servidor genere el PDF limpio
 * comprobando esa firma.
 *
 * El testigo es `cuerpo.firma`, ambos en base64url. No lleva datos personales:
 * solo el plan, el presupuesto al que da derecho, la caducidad y, en las
 * suscripciones, el identificador para poder renovarla.
 */

const SECRETO = process.env.LICENCIA_SECRET;

/** Un mes de margen: la suscripción se revalida contra Stripe al caducar. */
export const DURACION_SUSCRIPCION = 35 * 24 * 60 * 60 * 1000;
/** El pago único no caduca en la práctica, pero el testigo sí, por higiene. */
export const DURACION_UNICO = 5 * 365 * 24 * 60 * 60 * 1000;

export function hayConfiguracion() {
  return Boolean(SECRETO && process.env.STRIPE_SECRET_KEY);
}

function base64url(buffer) {
  return Buffer.from(buffer).toString("base64url");
}

function firmaDe(cuerpo) {
  return createHmac("sha256", SECRETO).update(cuerpo).digest();
}

export function firmar(datos) {
  if (!SECRETO) throw new Error("Falta LICENCIA_SECRET en el entorno");
  const cuerpo = base64url(JSON.stringify(datos));
  return `${cuerpo}.${base64url(firmaDe(cuerpo))}`;
}

/**
 * Devuelve los datos del testigo, o null si la firma no cuadra o ha caducado.
 * La comparación es en tiempo constante para no filtrar información por lo que
 * tarda en fallar.
 */
export function verificar(testigo) {
  if (!SECRETO || typeof testigo !== "string") return null;

  const separador = testigo.lastIndexOf(".");
  if (separador <= 0) return null;

  const cuerpo = testigo.slice(0, separador);
  const recibida = Buffer.from(testigo.slice(separador + 1), "base64url");
  const esperada = firmaDe(cuerpo);

  if (recibida.length !== esperada.length) return null;
  if (!timingSafeEqual(recibida, esperada)) return null;

  let datos;
  try {
    datos = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof datos?.exp !== "number" || datos.exp < Date.now()) return null;
  return datos;
}
