const CLAVE = "presu.licencia.v1";

export type Plan = "unico" | "suscripcion";

/**
 * v1 sin backend: el cobro se hace con Stripe Payment Links y la vuelta se
 * detecta por la URL de éxito (`?pago=ok`). Es deliberadamente simple y también
 * deliberadamente débil — cualquiera que sepa añadir `?pago=ok` a mano se salta
 * el pago. Se asume a cambio de poder cobrar sin servidor ni registro.
 *
 * Cuando el volumen lo justifique, esto se sustituye por una función serverless
 * que verifique la sesión de Stripe y firme un token; el resto de la app no
 * cambia porque toda la lógica de licencia vive aquí.
 */

const ENLACES: Record<Plan, string | undefined> = {
  unico: import.meta.env.VITE_PAGO_UNICO_URL,
  suscripcion: import.meta.env.VITE_SUSCRIPCION_URL,
};

export function tieneLicencia(): boolean {
  try {
    return localStorage.getItem(CLAVE) !== null;
  } catch {
    return false;
  }
}

export function guardarLicencia(plan: Plan): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ plan, fecha: Date.now() }));
  } catch {
    // Sin almacenamiento la licencia dura lo que la pestaña; no rompe nada.
  }
}

/** Detecta la vuelta desde Stripe y limpia la URL para que no quede el parámetro. */
export function recogerPagoDeLaUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get("pago") !== "ok") return false;
  const plan = params.get("plan") === "suscripcion" ? "suscripcion" : "unico";
  guardarLicencia(plan);
  params.delete("pago");
  params.delete("plan");
  const resto = params.toString();
  window.history.replaceState(
    {},
    "",
    window.location.pathname + (resto ? `?${resto}` : ""),
  );
  return true;
}

export function enlaceDePago(plan: Plan): string | undefined {
  return ENLACES[plan];
}

export function pagoConfigurado(): boolean {
  return Boolean(ENLACES.unico || ENLACES.suscripcion);
}
