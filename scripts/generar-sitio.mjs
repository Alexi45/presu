import { build } from "esbuild";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LEGALES, titularIncompleto } from "./legales.mjs";
import { escapar, pagina } from "./plantilla.mjs";

/**
 * Se ejecuta después de `vite build`. Genera, sobre el mismo `dist`:
 *
 *   - una página estática por oficio, sin JavaScript
 *   - las tres páginas legales
 *   - sitemap.xml y robots.txt
 *   - los datos estructurados y las etiquetas Open Graph del index
 *
 * El contenido sale de `src/oficios.ts` y `src/contenido.ts`, los mismos
 * módulos que usa la aplicación, para que no existan dos versiones del mismo
 * texto.
 */

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RAIZ, "dist");
const TEMPORAL = join(RAIZ, "node_modules", ".presu-contenido");

/**
 * Dominio del sitio, por orden de preferencia:
 *
 *   1. SITE_URL, si alguien la define a mano.
 *   2. URL, que Netlify inyecta sola en cada build con la dirección real del
 *      sitio. Sin esto, un despliegue automático desde GitHub sin variables
 *      generaba todas las canónicas y el sitemap apuntando al dominio de
 *      ejemplo, y Google se negaba a indexar. Pasó de verdad.
 *   3. VERCEL_PROJECT_PRODUCTION_URL, el equivalente en Vercel (sin protocolo).
 *   4. El valor de ejemplo, solo para compilar en local.
 */
function resolverSitio() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.URL) return process.env.URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  console.warn(
    "\n  AVISO: no hay SITE_URL ni URL en el entorno.\n" +
      "  Las canónicas y el sitemap apuntarán a localhost.\n" +
      "  No publiques este build.\n",
  );
  // Nunca un dominio real ajeno: un respaldo mal elegido manda tu tráfico y
  // tus canónicas a otra web. Localhost es inservible en producción, que es
  // justo lo que se quiere de un respaldo.
  return "http://localhost";
}

const SITIO = resolverSitio().replace(/\/$/, "");

/** Los módulos de contenido son TypeScript; se compilan a un temporal para poder importarlos. */
async function cargarContenido() {
  await build({
    entryPoints: [
      join(RAIZ, "src/oficios.ts"),
      join(RAIZ, "src/contenido.ts"),
      join(RAIZ, "src/guias.ts"),
    ],
    outdir: TEMPORAL,
    bundle: true,
    format: "esm",
    platform: "node",
    logLevel: "warning",
  });
  const sufijo = `?v=${Date.now()}`;
  const oficios = await import(`${join(TEMPORAL, "oficios.js")}${sufijo}`);
  const contenido = await import(`${join(TEMPORAL, "contenido.js")}${sufijo}`);
  const guias = await import(`${join(TEMPORAL, "guias.js")}${sufijo}`);
  return { OFICIOS: oficios.OFICIOS, GUIAS: guias.GUIAS, ...contenido };
}

const euros = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

function faqJsonLd(faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.pregunta,
      acceptedAnswer: { "@type": "Answer", text: item.respuesta },
    })),
  };
}

function aplicacionJsonLd(SITIO_DATOS) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PresupPRO",
    url: `${SITIO}/`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "es-ES",
    description: SITIO_DATOS.descripcion,
    offers: [
      {
        "@type": "Offer",
        name: "Descarga con marca de agua",
        price: "0",
        priceCurrency: "EUR",
      },
      {
        "@type": "Offer",
        name: "Descarga sin marca de agua",
        price: String(SITIO_DATOS.precioUnico),
        priceCurrency: "EUR",
      },
    ],
  };
}

function articuloJsonLd(guia, url) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guia.h1,
    description: guia.descripcion,
    inLanguage: "es-ES",
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "PresupPRO" },
    publisher: { "@type": "Organization", name: "PresupPRO" },
  };
}

function migasJsonLd(nombre, url) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "PresupPRO", item: `${SITIO}/` },
      { "@type": "ListItem", position: 2, name: nombre, item: url },
    ],
  };
}

function cuerpoOficio(oficio) {
  const filas = oficio.conceptos
    .map(
      (c) => `        <tr>
          <td><strong>${escapar(c.concepto)}</strong><span class="desc">${escapar(c.descripcion)}</span></td>
          <td>${escapar(`${c.cantidad} ${c.unidad}`)}</td>
          <td>${escapar(euros(c.precio))}</td>
        </tr>`,
    )
    .join("\n");

  const claves = oficio.incluir
    .map(
      (item) => `      <div class="clave">
        <h3>${escapar(item.titulo)}</h3>
        <p>${escapar(item.texto)}</p>
      </div>`,
    )
    .join("\n");

  const preguntas = oficio.faq
    .map(
      (item) => `      <details>
        <summary>${escapar(item.pregunta)}</summary>
        <p>${escapar(item.respuesta)}</p>
      </details>`,
    )
    .join("\n");

  const otros = oficio.otros
    .map(
      (o) =>
        `        <li><a href="/presupuesto-${o.slug}/"><span aria-hidden="true">${o.emoji}</span> ${escapar(o.nombre)}</a></li>`,
    )
    .join("\n");

  return `    <main>
      <nav class="miga"><a href="/">PresupPRO</a> › ${escapar(oficio.h1)}</nav>
      <h1>${escapar(oficio.h1)} en PDF</h1>
      <p class="entradilla">${escapar(oficio.entradilla)}</p>
      <div class="llamada">
        <a class="boton boton--grande" href="/?oficio=${oficio.slug}">Empezar con esta plantilla</a>
        <a class="boton boton--fantasma" href="/">Empezar en blanco</a>
      </div>
      <p class="nota">Gratis y sin registro. La descarga sin marca de agua cuesta 7 € en un pago único.</p>

${oficio.parrafos.map((t) => `      <p>${escapar(t)}</p>`).join("\n")}

      <h2>Qué lleva la plantilla de ${escapar(oficio.nombre.toLowerCase())}</h2>
      <p>Estas son las partidas con las que arranca el presupuesto. Cámbialas, bórralas o añade las tuyas: solo son un punto de partida para no empezar con la hoja en blanco.</p>
      <div class="envoltorio-tabla">
        <table class="tabla">
          <thead>
            <tr><th>Concepto</th><th>Cantidad</th><th>Precio</th></tr>
          </thead>
          <tbody>
${filas}
          </tbody>
        </table>
      </div>
      <p class="nota">Los precios son solo un ejemplo de referencia; pon los tuyos.</p>

      <h2>Qué no puede faltar en un presupuesto de ${escapar(oficio.nombre.toLowerCase())}</h2>
${claves}

      <h2>Preguntas frecuentes</h2>
${preguntas}

      <h2>Otros oficios</h2>
      <ul class="enlaces">
${otros}
      </ul>

      <div class="cierre">
        <h2>Tu presupuesto, listo en dos minutos</h2>
        <p>Rellena, mira cómo queda y descárgalo en PDF. Sin instalar nada y sin crear ninguna cuenta.</p>
        <a class="boton boton--grande" href="/?oficio=${oficio.slug}">Hacer mi ${escapar(oficio.h1.toLowerCase())}</a>
      </div>
    </main>`;
}

function cuerpoGuia(guia, oficios) {
  const secciones = guia.secciones
    .map(
      (seccion) => `      <h2>${escapar(seccion.titulo)}</h2>
${seccion.parrafos.map((t) => `      <p>${escapar(t)}</p>`).join("\n")}
${
  seccion.lista
    ? `      <ul>\n${seccion.lista.map((t) => `        <li>${escapar(t)}</li>`).join("\n")}\n      </ul>`
    : ""
}`,
    )
    .join("\n\n");

  const preguntas = guia.faq
    .map(
      (item) => `      <details>
        <summary>${escapar(item.pregunta)}</summary>
        <p>${escapar(item.respuesta)}</p>
      </details>`,
    )
    .join("\n");

  const relacionados = guia.oficios
    .map((slug) => oficios.find((o) => o.slug === slug))
    .filter(Boolean)
    .map(
      (o) =>
        `        <li><a href="/presupuesto-${o.slug}/"><span aria-hidden="true">${o.emoji}</span> ${escapar(o.nombre)}</a></li>`,
    )
    .join("\n");

  return `    <main class="legal">
      <nav class="miga"><a href="/">PresupPRO</a> › <a href="/guias/">Guías</a> › ${escapar(guia.h1)}</nav>
      <h1>${escapar(guia.h1)}</h1>
      <p class="entradilla">${escapar(guia.entradilla)}</p>
${guia.aviso ? `      <p class="aviso-legal">${escapar(guia.aviso)}</p>` : ""}

${secciones}

      <h2>Preguntas frecuentes</h2>
${preguntas}

      <div class="cierre">
        <h2>Haz tu presupuesto ahora</h2>
        <p>Con el IVA desglosado por tipo y la retención de IRPF calculada sola. Gratis y sin registro.</p>
        <a class="boton boton--grande" href="/">Empezar</a>
      </div>

      <h2>Plantillas relacionadas</h2>
      <ul class="enlaces">
${relacionados}
      </ul>
    </main>`;
}

function cuerpoIndiceGuias(guias) {
  const fichas = guias
    .map(
      (guia) => `        <li>
          <a href="/guias/${guia.slug}/">
            <strong>${escapar(guia.h1)}</strong>
            <span>${escapar(guia.gancho)}</span>
          </a>
        </li>`,
    )
    .join("\n");

  return `    <main>
      <nav class="miga"><a href="/">PresupPRO</a> › Guías</nav>
      <h1>Guías para autónomos y gremios</h1>
      <p class="entradilla">Las dudas que salen al hacer un presupuesto, explicadas sin rodeos.</p>
      <ul class="fichas">
${fichas}
      </ul>
      <div class="cierre">
        <h2>Y cuando lo tengas claro</h2>
        <p>Haz el presupuesto en dos minutos y descárgalo en PDF. Gratis y sin registro.</p>
        <a class="boton boton--grande" href="/">Hacer un presupuesto</a>
      </div>
    </main>`;
}

function cuerpoLegal(legal) {
  return `    <main class="legal">
      <nav class="miga"><a href="/">PresupPRO</a> › ${escapar(legal.h1)}</nav>
      <h1>${escapar(legal.h1)}</h1>
      ${legal.cuerpo}
      <p class="nota" style="margin-top:40px">Última actualización: ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}.</p>
    </main>`;
}

async function escribirPagina(ruta, html) {
  const destino = join(DIST, ruta);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, html, "utf8");
}

/** Mete en el index de la app las etiquetas sociales y los datos estructurados. */
async function enriquecerIndex(datos) {
  const ruta = join(DIST, "index.html");
  let html = await readFile(ruta, "utf8");

  const etiquetas = [
    `<link rel="canonical" href="${SITIO}/" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="PresupPRO" />`,
    `<meta property="og:title" content="PresupPRO · Presupuestos profesionales en PDF en 2 minutos" />`,
    `<meta property="og:description" content="${escapar(datos.SITIO.descripcion)}" />`,
    `<meta property="og:url" content="${SITIO}/" />`,
    `<meta property="og:image" content="${SITIO}/og.png" />`,
    `<meta property="og:locale" content="es_ES" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${JSON.stringify(aplicacionJsonLd(datos.SITIO))}</script>`,
    `<script type="application/ld+json">${JSON.stringify(faqJsonLd(datos.FAQ))}</script>`,
  ].join("\n    ");

  if (html.includes("og:title")) {
    throw new Error("El index ya tiene etiquetas Open Graph; revisa index.html antes de duplicarlas.");
  }

  html = html.replace("</head>", `  ${etiquetas}\n  </head>`);
  await writeFile(ruta, html, "utf8");
}

async function main() {
  const datos = await cargarContenido();
  const rutas = ["/"];

  for (const oficio of datos.OFICIOS) {
    const url = `${SITIO}/presupuesto-${oficio.slug}/`;
    const otros = datos.OFICIOS.filter((o) => o.slug !== oficio.slug);
    const html = pagina({
      titulo: oficio.titulo,
      descripcion: oficio.descripcion,
      canonica: url,
      sitio: SITIO,
      cuerpo: cuerpoOficio({ ...oficio, otros }),
      jsonLd: [faqJsonLd(oficio.faq), migasJsonLd(oficio.h1, url)],
    });
    await escribirPagina(`presupuesto-${oficio.slug}/index.html`, html);
    rutas.push(`/presupuesto-${oficio.slug}/`);
  }

  const indiceGuias = `${SITIO}/guias/`;
  await escribirPagina(
    "guias/index.html",
    pagina({
      titulo: "Guías sobre presupuestos, IVA e IRPF para autónomos | PresupPRO",
      descripcion:
        "Guías prácticas para autónomos y gremios: qué IVA aplicar en reformas, cuándo lleva retención de IRPF una factura y cómo hacer un presupuesto que se acepte.",
      canonica: indiceGuias,
      sitio: SITIO,
      cuerpo: cuerpoIndiceGuias(datos.GUIAS),
      jsonLd: [migasJsonLd("Guías", indiceGuias)],
    }),
  );
  rutas.push("/guias/");

  for (const guia of datos.GUIAS) {
    const url = `${SITIO}/guias/${guia.slug}/`;
    await escribirPagina(
      `guias/${guia.slug}/index.html`,
      pagina({
        titulo: guia.titulo,
        descripcion: guia.descripcion,
        canonica: url,
        sitio: SITIO,
        cuerpo: cuerpoGuia(guia, datos.OFICIOS),
        jsonLd: [faqJsonLd(guia.faq), articuloJsonLd(guia, url), migasJsonLd(guia.h1, url)],
      }),
    );
    rutas.push(`/guias/${guia.slug}/`);
  }

  for (const legal of LEGALES) {
    const url = `${SITIO}/${legal.slug}/`;
    const html = pagina({
      titulo: legal.titulo,
      descripcion: legal.descripcion,
      canonica: url,
      sitio: SITIO,
      cuerpo: cuerpoLegal(legal),
      jsonLd: [migasJsonLd(legal.h1, url)],
    });
    await escribirPagina(`${legal.slug}/index.html`, html);
    rutas.push(`/${legal.slug}/`);
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas
  .map(
    (ruta) => `  <url>
    <loc>${SITIO}${ruta}</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${ruta === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
  await escribirPagina("sitemap.xml", sitemap);

  await escribirPagina(
    "robots.txt",
    `User-agent: *\nAllow: /\n\nSitemap: ${SITIO}/sitemap.xml\n`,
  );

  // Las mismas cabeceras que netlify.toml, pero dentro de dist/. El toml de la
  // raíz solo lo lee Netlify cuando despliega desde el repositorio; si se sube
  // la carpeta a mano, este archivo es el único que viaja con ella.
  await escribirPagina(
    "_headers",
    `/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=604800

/manifest.webmanifest
  Content-Type: application/manifest+json; charset=utf-8
  Cache-Control: public, max-age=604800

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com; frame-ancestors 'none'; upgrade-insecure-requests
`,
  );

  // Vercel y Netlify sirven este archivo ante cualquier ruta que no exista.
  await escribirPagina(
    "404.html",
    pagina({
      titulo: "Página no encontrada | PresupPRO",
      descripcion: "Esta página no existe. Vuelve al inicio para hacer tu presupuesto.",
      canonica: `${SITIO}/`,
      sitio: SITIO,
      cuerpo: `    <main>
      <h1>Aquí no hay nada</h1>
      <p class="entradilla">La página que buscabas no existe o ha cambiado de dirección.</p>
      <div class="llamada">
        <a class="boton boton--grande" href="/">Hacer un presupuesto</a>
      </div>
      <h2>Plantillas por oficio</h2>
      <ul class="enlaces">
${datos.OFICIOS.map(
  (o) =>
    `        <li><a href="/presupuesto-${o.slug}/"><span aria-hidden="true">${o.emoji}</span> ${escapar(o.nombre)}</a></li>`,
).join("\n")}
      </ul>
    </main>`,
    }),
  );

  const faltan = titularIncompleto();
  if (faltan.length > 0) {
    console.warn(
      `\n  AVISO: faltan los datos fiscales del titular (${faltan.join(", ")}).\n` +
        "  Las páginas legales saldrán con los huecos en naranja, y publicarlas\n" +
        "  así incumple el artículo 10 de la LSSI. Defínelas en Netlify.\n",
    );
  }

  await enriquecerIndex(datos);
  await rm(TEMPORAL, { recursive: true, force: true });

  console.log(`Sitio generado para ${SITIO} · ${rutas.length} páginas`);
}

main().catch((error) => {
  console.error("Error generando el sitio:", error);
  process.exitCode = 1;
});
