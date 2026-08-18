import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Compila el generador de PDF para que lo pueda usar la función serverless.
 *
 * La función es JavaScript y el generador es TypeScript. En vez de confiar en
 * que el empaquetador de Netlify resuelva el TypeScript por su cuenta, se
 * compila aquí durante el build, que siempre corre antes de que Netlify
 * empaquete las funciones. Así el resultado es el mismo en local y en el
 * despliegue, y el PDF de pago sale exactamente del mismo código que el
 * gratuito.
 */

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

await build({
  entryPoints: [join(RAIZ, "src/pdf.ts")],
  outfile: join(RAIZ, "netlify/functions/_lib/pdf.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  define: { __PDF_SERVIDOR__: "true" },
  target: "node20",
  logLevel: "warning",
});

console.log("Generador de PDF preparado para las funciones");
