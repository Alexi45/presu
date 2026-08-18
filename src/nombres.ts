import type { Presupuesto } from "./types";

const DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "g");

/**
 * Vive en su propio módulo porque lo necesitan tanto la aplicación como el
 * generador de PDF, y la aplicación no debe cargar jsPDF (400 kB) solo para
 * saber cómo se va a llamar un archivo que le va a mandar el servidor.
 */
export function nombreArchivo(p: Presupuesto): string {
  const cliente = (p.cliente.nombre || "cliente")
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `presupuesto-${p.numero}-${cliente}.pdf`;
}
