import { jsPDF } from "jspdf";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Dibuja la imagen que se ve al compartir un enlace en WhatsApp, LinkedIn o X.
 *
 * Se genera como PDF porque jsPDF ya está en el proyecto y compone texto
 * vectorial sin depender de ningún motor de imágenes. La conversión final a PNG
 * la hace macOS:
 *
 *   node scripts/generar-og.mjs
 *   qlmanage -t -s 1200 -o public public/og.pdf && mv public/og.pdf.png public/og.png
 *
 * Solo hace falta ejecutarlo si cambia la marca. El PNG resultante se versiona.
 */

const ANCHO = 1200;
const ALTO = 630;

const TINTA = [26, 32, 39];
const GRIS = [110, 118, 129];
const ACENTO = [226, 88, 43];
const PAPEL = [247, 245, 242];
const BLANCO = [255, 255, 255];
const LINEA = [230, 225, 218];

const doc = new jsPDF({ unit: "pt", format: [ANCHO, ALTO], orientation: "landscape" });

const rellenar = ([r, g, b]) => doc.setFillColor(r, g, b);
const escribir = (texto, x, y, { size, bold, color = TINTA, align = "left" }) => {
  doc.setFontSize(size);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(texto, x, y, { align });
};

// Fondo y banda superior.
rellenar(PAPEL);
doc.rect(0, 0, ANCHO, ALTO, "F");
rellenar(ACENTO);
doc.rect(0, 0, ANCHO, 10, "F");

// Marca.
rellenar(ACENTO);
doc.roundedRect(72, 66, 44, 44, 12, 12, "F");
escribir("€", 86, 97, { size: 24, bold: true, color: BLANCO });
escribir("Presu", 128, 98, { size: 30, bold: true });

// Titular.
escribir("Presupuestos", 72, 232, { size: 66, bold: true });
escribir("profesionales en PDF,", 72, 302, { size: 66, bold: true });
escribir("en dos minutos.", 72, 372, { size: 66, bold: true, color: ACENTO });

escribir("Para autónomos y gremios. Con IVA desglosado,", 72, 432, { size: 25, color: GRIS });
escribir("retención de IRPF y tu logotipo.", 72, 468, { size: 25, color: GRIS });

escribir("Gratis  ·  Sin registro  ·  Sin instalar nada", 72, 540, {
  size: 22,
  bold: true,
  color: ACENTO,
});

// Documento de muestra a la derecha, girado ligeramente para dar profundidad.
const x = 800;
const y = 108;
rellenar([0, 0, 0]);
doc.setGState(new doc.GState({ opacity: 0.06 }));
doc.roundedRect(x + 10, y + 14, 320, 430, 14, 14, "F");
doc.setGState(new doc.GState({ opacity: 1 }));

rellenar(BLANCO);
doc.roundedRect(x, y, 320, 430, 14, 14, "F");
rellenar(ACENTO);
doc.rect(x, y, 320, 8, "F");

escribir("PRESUPUESTO", x + 28, y + 62, { size: 20, bold: true, color: ACENTO });
escribir("Nº 2026-014", x + 28, y + 86, { size: 13, color: GRIS });

doc.setDrawColor(LINEA[0], LINEA[1], LINEA[2]);
doc.setLineWidth(1);
for (let i = 0; i < 6; i++) {
  const fila = y + 128 + i * 34;
  rellenar(LINEA);
  doc.rect(x + 28, fila, 150 - i * 12, 9, "F");
  doc.rect(x + 232, fila, 60, 9, "F");
  doc.line(x + 28, fila + 22, x + 292, fila + 22);
}

rellenar(ACENTO);
doc.roundedRect(x + 150, y + 348, 142, 44, 8, 8, "F");
escribir("TOTAL", x + 164, y + 376, { size: 14, bold: true, color: BLANCO });
escribir("3.205,29 €", x + 278, y + 376, { size: 14, bold: true, color: BLANCO, align: "right" });

const PUBLICO = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
await writeFile(join(PUBLICO, "og.pdf"), Buffer.from(doc.output("arraybuffer")));

/** Icono cuadrado de la aplicación, para el manifiesto y la pantalla de inicio del móvil. */
function icono(lado) {
  const app = new jsPDF({ unit: "pt", format: [lado, lado] });
  app.setFillColor(ACENTO[0], ACENTO[1], ACENTO[2]);
  app.rect(0, 0, lado, lado, "F");
  app.setFont("helvetica", "bold");
  app.setFontSize(lado * 0.56);
  app.setTextColor(255, 255, 255);
  app.text("€", lado / 2, lado * 0.7, { align: "center" });
  return Buffer.from(app.output("arraybuffer"));
}

await writeFile(join(PUBLICO, "icono-512.pdf"), icono(512));
await writeFile(join(PUBLICO, "icono-192.pdf"), icono(192));

console.log("Generados og.pdf, icono-512.pdf e icono-192.pdf en public/.");
console.log("Conviértelos a PNG con qlmanage (ver cabecera del script).");
