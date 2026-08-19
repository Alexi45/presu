/**
 * Envoltorio HTML de las páginas estáticas.
 *
 * Estas páginas no cargan React ni ningún JavaScript: son el contenido que
 * tiene que posicionar en Google y lo que ve alguien que llega desde una
 * búsqueda. Pintan en la primera petición, sin esperar a ningún bundle. El CSS
 * va incrustado por el mismo motivo: una petición menos antes del primer píxel.
 */

export function escapar(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const CSS = `
*{box-sizing:border-box}
:root{
--tinta:#1a2027;--tinta-suave:#3d4753;--gris:#6e7681;--gris-claro:#9aa2ad;
--acento:#e2582b;--acento-oscuro:#c4451c;--acento-tenue:#fdf0eb;
--papel:#f7f5f2;--blanco:#fff;--linea:#e6e1da;--linea-fuerte:#d4cec5;
--ui:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
--display:"Space Grotesk",var(--ui);
}
body{margin:0;font-family:var(--ui);font-size:16px;line-height:1.6;color:var(--tinta);background:var(--papel);-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:var(--display);font-weight:600;letter-spacing:-.025em;margin:0}
a{color:var(--acento)}
.barra{display:flex;align-items:center;gap:16px;padding:0 24px;height:60px;background:var(--blanco);border-bottom:1px solid var(--linea);position:sticky;top:0;z-index:5}
.marca{display:flex;align-items:center;gap:9px;font-family:var(--display);font-size:19px;font-weight:700;letter-spacing:-.03em;color:var(--tinta);text-decoration:none}
.marca span{width:26px;height:26px;border-radius:7px;background:var(--acento);display:grid;place-items:center;color:#fff;font-size:14px}
.barra .nav{margin-left:auto;color:var(--tinta);text-decoration:none;font-weight:600;font-size:15px}
.barra .nav:hover{color:var(--acento)}
.boton{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:7px;padding:11px 18px;font-weight:600;font-size:15px;border:1px solid transparent;text-decoration:none;background:var(--acento);color:#fff}
.boton:hover{background:var(--acento-oscuro)}
.boton--grande{padding:15px 28px;font-size:17px}
.boton--fantasma{background:var(--blanco);color:var(--tinta);border-color:var(--linea-fuerte)}
main{max-width:760px;margin:0 auto;padding:56px 24px 0}
.miga{font-size:13.5px;color:var(--gris);margin-bottom:18px}
.miga a{color:var(--gris)}
h1{font-size:38px;line-height:1.15;margin-bottom:16px}
.entradilla{font-size:19px;color:var(--tinta-suave);margin:0 0 28px}
.llamada{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:12px}
.nota{font-size:13.5px;color:var(--gris-claro);margin:0 0 48px}
h2{font-size:26px;margin:44px 0 14px}
h3{font-size:17px;margin:0 0 6px}
p{color:var(--tinta-suave);margin:0 0 16px}
.clave{margin-bottom:22px}
.tabla{width:100%;border-collapse:collapse;margin:20px 0 8px;font-size:14.5px;background:var(--blanco);border:1px solid var(--linea);border-radius:10px;overflow:hidden}
.tabla th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:var(--gris);padding:11px 14px;background:var(--papel);font-weight:700}
.tabla td{padding:12px 14px;border-top:1px solid var(--linea);vertical-align:top}
.tabla td:last-child,.tabla th:last-child{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.tabla .desc{display:block;color:var(--gris);font-size:12.5px;margin-top:3px}
.envoltorio-tabla{overflow-x:auto}
details{border-bottom:1px solid var(--linea);padding:16px 0}
details:first-of-type{border-top:1px solid var(--linea)}
summary{font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;align-items:center}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";color:var(--acento);font-size:20px;flex-shrink:0}
details[open] summary::after{content:"−"}
details p{margin:12px 0 0;font-size:15px}
.enlaces{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:0}
.enlaces a{display:inline-flex;gap:6px;border:1px solid var(--linea-fuerte);border-radius:999px;padding:7px 14px;font-size:14.5px;color:var(--tinta);text-decoration:none;background:var(--blanco)}
.enlaces a:hover{border-color:var(--acento);color:var(--acento)}
.cierre{background:var(--blanco);border:1px solid var(--linea);border-radius:12px;padding:28px;margin:48px 0 0;text-align:center}
.cierre h2{margin-top:0}
.pie{background:var(--blanco);border-top:1px solid var(--linea);margin-top:56px;padding:32px 24px 40px}
.pie div{max-width:760px;margin:0 auto;display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;font-size:13.5px;color:var(--gris)}
.pie a{color:var(--gris);text-decoration:none}
.pie a:hover{color:var(--acento)}
.legal h2{font-size:20px;margin:32px 0 10px}
.legal ul,main>ul:not(.enlaces):not(.fichas){padding-left:20px;margin:0 0 16px}
.legal li,main>ul:not(.enlaces):not(.fichas) li{margin-bottom:9px;color:var(--tinta-suave)}
.aviso-legal{background:var(--acento-tenue);border-left:3px solid var(--acento);padding:14px 16px;border-radius:0 6px 6px 0;font-size:14.5px;color:var(--tinta-suave);margin-bottom:8px}
.fichas{list-style:none;padding:0;display:grid;gap:12px;margin:28px 0 0}
.fichas a{display:block;background:var(--blanco);border:1px solid var(--linea);border-radius:10px;padding:18px 20px;text-decoration:none;color:var(--tinta)}
.fichas a:hover{border-color:var(--acento)}
.fichas strong{display:block;font-family:var(--display);font-size:18px;margin-bottom:4px;letter-spacing:-.02em}
.fichas span{color:var(--gris);font-size:14.5px}
.legal p,.legal li{font-size:15px}
.hueco{background:var(--acento-tenue);border-radius:4px;padding:1px 6px;font-weight:600;color:var(--acento-oscuro)}
@media(max-width:640px){
main{padding:36px 18px 0}
h1{font-size:29px}
h2{font-size:22px}
.barra{padding:0 16px}
}
`;

export function pagina({ titulo, descripcion, canonica, sitio, cuerpo, jsonLd = [] }) {
  const estructurados = jsonLd
    .map(
      (dato) =>
        `<script type="application/ld+json">${JSON.stringify(dato).replaceAll(
          "</",
          "<\\/",
        )}</script>`,
    )
    .join("\n    ");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapar(titulo)}</title>
    <meta name="description" content="${escapar(descripcion)}" />
    <link rel="canonical" href="${escapar(canonica)}" />
    <meta name="theme-color" content="#E2582B" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="PresupPRO" />
    <meta property="og:title" content="${escapar(titulo)}" />
    <meta property="og:description" content="${escapar(descripcion)}" />
    <meta property="og:url" content="${escapar(canonica)}" />
    <meta property="og:image" content="${escapar(sitio)}/og.png" />
    <meta property="og:locale" content="es_ES" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap"
      rel="stylesheet"
    />
    <style>${CSS}</style>
    ${estructurados}
  </head>
  <body>
    <header class="barra">
      <a class="marca" href="/"><span>€</span>PresupPRO</a>
      <a class="nav" href="/guias/">Guías</a>
      <a class="boton" href="/">Hacer un presupuesto</a>
    </header>
    ${cuerpo}
    <footer class="pie">
      <div>
        <strong style="color:var(--tinta)">PresupPRO</strong>
        <span>Presupuestos en PDF para autónomos y gremios.</span>
        <span style="margin-left:auto;display:flex;gap:16px">
          <a href="/guias/">Guías</a>
          <a href="/aviso-legal/">Aviso legal</a>
          <a href="/privacidad/">Privacidad</a>
          <a href="/condiciones/">Condiciones</a>
        </span>
      </div>
    </footer>
  </body>
</html>
`;
}
