import { build } from "esbuild";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Genera un PDF por cada combinación de oficio y estilo y avisa de los que
 * ocupan más de una página.
 *
 * La maquetación del PDF se calcula en milímetros a mano, así que un cambio de
 * espaciado en un sitio puede empujar la firma a una segunda página en otro sin
 * que se note. Esto lo detecta en un comando.
 *
 *   npm run revisar-pdf
 *
 * Los archivos quedan en `revision/`. En macOS se pueden convertir a imagen con:
 *   qlmanage -t -s 1100 -o revision/png revision/*.pdf
 */

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = join(RAIZ, "revision");
const TEMPORAL = join(RAIZ, "node_modules", ".presu-pdf");

const ESTILOS = ["moderna", "clasica", "minimal"];

async function cargar() {
  await build({
    entryPoints: [join(RAIZ, "src/pdf.ts"), join(RAIZ, "src/types.ts"), join(RAIZ, "src/oficios.ts")],
    outdir: TEMPORAL,
    bundle: true,
    format: "esm",
    platform: "node",
    define: { __PDF_SERVIDOR__: "true" },
    logLevel: "warning",
  });
  const sufijo = `?v=${Date.now()}`;
  return {
    ...(await import(`${join(TEMPORAL, "pdf.js")}${sufijo}`)),
    ...(await import(`${join(TEMPORAL, "types.js")}${sufijo}`)),
    ...(await import(`${join(TEMPORAL, "oficios.js")}${sufijo}`)),
  };
}

async function main() {
  const { generarPdf, presupuestoEjemplo, OFICIOS, aplicarOficio } = await cargar();

  await rm(SALIDA, { recursive: true, force: true });
  await mkdir(SALIDA, { recursive: true });

  let largos = 0;
  for (const oficio of OFICIOS) {
    for (const plantilla of ESTILOS) {
      const presupuesto = aplicarOficio({ ...presupuestoEjemplo(), plantilla }, oficio);
      const doc = await generarPdf(presupuesto, { conMarcaDeAgua: false });
      const paginas = doc.getNumberOfPages();
      if (paginas > 1) {
        console.log(`  ${oficio.slug} / ${plantilla}: ${paginas} páginas`);
        largos++;
      }
      await writeFile(
        join(SALIDA, `${oficio.slug}-${plantilla}.pdf`),
        Buffer.from(doc.output("arraybuffer")),
      );
    }
  }

  // Un documento con marca de agua, para revisar también la versión gratuita.
  const gratis = await generarPdf(presupuestoEjemplo(), { conMarcaDeAgua: true });
  await writeFile(join(SALIDA, "con-marca-de-agua.pdf"), Buffer.from(gratis.output("arraybuffer")));

  await rm(TEMPORAL, { recursive: true, force: true });

  const total = OFICIOS.length * ESTILOS.length;
  // Más de una página no es un fallo: un presupuesto con capítulos, notas,
  // condiciones y anticipo ocupa lo que ocupa. Lo que sí hay que mirar en
  // revision/ es que la última página no salga con solo la firma.
  console.log(
    `${total - largos} de ${total} documentos caben en una página. PDFs en revision/`,
  );
}

main().catch((error) => {
  console.error("Error revisando los PDF:", error);
  process.exitCode = 1;
});
