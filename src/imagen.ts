/**
 * Reducción del logotipo antes de guardarlo.
 *
 * El logo se guarda como data URL dentro de cada presupuesto, y en el navegador
 * hay entre 5 y 10 MB de cuota para todo. Con la imagen original, unos pocos
 * presupuestos la agotaban y el guardado empezaba a fallar sin que el usuario
 * viera nada: seguía escribiendo y perdía el trabajo al recargar.
 *
 * En el PDF el logo ocupa como mucho 55 × 18 mm, así que 700 px de ancho sobran
 * incluso para imprimir. Reducirlo divide su peso por veinte y no se nota.
 */

const ANCHO_MAXIMO = 700;
const ALTO_MAXIMO = 240;

/** Por encima de esto ni se intenta: es una foto, no un logotipo. */
export const TAMANO_MAXIMO_ORIGEN = 8_000_000;

export interface LogoReducido {
  dataUrl: string;
  ancho: number;
  alto: number;
}

function leerComoDataUrl(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () => reject(new Error("No se ha podido leer el archivo"));
    lector.readAsDataURL(archivo);
  });
}

function cargarImagen(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("El archivo no es una imagen válida"));
    img.src = dataUrl;
  });
}

export async function reducirLogo(archivo: File): Promise<LogoReducido> {
  if (archivo.size > TAMANO_MAXIMO_ORIGEN) {
    throw new Error("La imagen es demasiado grande. Usa una de menos de 8 MB.");
  }

  const original = await leerComoDataUrl(archivo);
  const img = await cargarImagen(original);

  const escala = Math.min(1, ANCHO_MAXIMO / img.naturalWidth, ALTO_MAXIMO / img.naturalHeight);
  const ancho = Math.max(1, Math.round(img.naturalWidth * escala));
  const alto = Math.max(1, Math.round(img.naturalHeight * escala));

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;

  const contexto = lienzo.getContext("2d");
  if (!contexto) return { dataUrl: original, ancho: img.naturalWidth, alto: img.naturalHeight };

  contexto.drawImage(img, 0, 0, ancho, alto);

  // PNG conserva la transparencia, que en un logotipo importa; para fotos
  // (JPEG de origen) sale muchísimo más ligero en JPEG.
  const esFoto = archivo.type === "image/jpeg";
  const dataUrl = esFoto
    ? lienzo.toDataURL("image/jpeg", 0.9)
    : lienzo.toDataURL("image/png");

  return { dataUrl, ancho, alto };
}
