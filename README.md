# Presu

Herramienta web para hacer presupuestos profesionales en PDF. Entras, rellenas,
ves el resultado en vivo y descargas. Sin registro.

Público: autónomos y gremios en España — reformas, albañilería, fontanería,
electricidad, climatización, pintura, jardinería, carpintería, cerrajería,
mudanzas, limpieza, fotografía y diseño. Gente que hoy manda el presupuesto en
un Word feo o escrito a mano por WhatsApp.

## Modelo de negocio

|                       | Gratis                 | Pago                                  |
| --------------------- | ---------------------- | ------------------------------------- |
| Crear y previsualizar | sí                     | sí                                    |
| Descargar PDF         | sí, con marca de agua  | limpio                                |
| Precio                | 0 €                    | 7 € pago único · 9 €/mes ilimitado    |

El cobro se pide en el pico de compromiso: el usuario ya ha rellenado todo y
está viendo su presupuesto terminado en pantalla. No hay que crear cuenta en
ningún momento, porque el registro es la mayor fuga de conversión en este tipo
de herramienta.

**Por qué presupuestos y no facturas:** un presupuesto no es un documento
fiscal, así que queda fuera de Verifactu y de la ley antifraude. Eso permite
construir rápido sin asumir obligaciones de software de facturación. No
convertir esto en un facturador sin decidirlo conscientemente.

## Qué hace

- Editor con vista previa en vivo, fiel al PDF que se descarga.
- **Plantillas por oficio**: trece oficios con sus partidas típicas ya escritas,
  con unidad y descripción. Resuelve el problema real, que no es calcular el
  IVA sino la página en blanco.
- **Capítulos con subtotales** (Demolición, Albañilería, Instalaciones…), como
  en un presupuesto de obra de verdad. El subtotal solo aparece si el capítulo
  tiene más de una partida, para no repetir la cifra de encima.
- **Partidas opcionales**: mejoras que se muestran con su precio pero no suman
  al total. Un presupuesto con una opción tiene tres respuestas posibles en vez
  de dos, y una de ellas sube el importe.
- **Anticipo al aceptar**: el documento calcula cuánto se cobra al firmar y
  cuánto queda a la entrega.
- **Tres estilos de documento**: moderno, clásico (serif) y minimal.
- IVA por línea (21 / 10 / 4 / 0 %) con desglose por tipo en los totales,
  retención de IRPF (7 % o 15 %), descuento global y validez en días.
- Unidades de medida por línea (m², h, ml, ud, mes…).
- Logotipo propio y seis colores de documento.
- **Varios presupuestos guardados**, con numeración correlativa automática por
  año, duplicado y borrado. Los datos del emisor y los clientes ya usados se
  recuerdan y se autocompletan.
- **Copia de seguridad** en un archivo JSON, para exportar y restaurar. Es la
  contrapartida honesta de guardar los datos solo en el navegador.
- PDF vectorial A4 con paginación, pie de página y bloque de firma de
  aceptación del cliente.
- **Envío directo desde el móvil** a WhatsApp o email con la Web Share API.
- Páginas estáticas por oficio y guías, sin JavaScript, para posicionar en
  Google.

## Desarrollo

```bash
npm install
npm run dev
```

Arranca en `http://localhost:5180`.

| Comando               | Qué hace                                                      |
| --------------------- | ------------------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                                        |
| `npm run build`       | Compila la app y genera las páginas estáticas en `dist/`      |
| `npm run preview`     | Sirve `dist/` como en producción (puerto 5181)                |
| `npm test`            | Pruebas de la lógica de importes (25 casos)                    |
| `npm run revisar-pdf` | Genera los 39 PDF (13 oficios × 3 estilos) y cuenta los largos |
| `npm run tipos`       | Comprobación de tipos (`tsc -b`)                               |
| `npm run lint`        | oxlint                                                        |

Ojo con `npx tsc --noEmit` a secas: el `tsconfig.json` raíz solo tiene
referencias y `files: []`, así que ese comando no comprueba nada. Usa
`npm run tipos`.

## Estructura

| Archivo                        | Qué hace                                                      |
| ------------------------------ | ------------------------------------------------------------- |
| `src/types.ts`                 | Modelo del presupuesto y valores por defecto                  |
| `src/calc.ts`                  | Importes, desglose de IVA, retención y formatos en español    |
| `src/oficios.ts`               | Catálogo de oficios: plantillas **y** contenido de sus páginas |
| `src/guias.ts`                 | Guías informativas (IVA, IRPF, cómo presupuestar)             |
| `src/contenido.ts`             | Textos de la página y preguntas frecuentes                    |
| `src/pdf.ts`                   | Generación del PDF con jsPDF                                  |
| `src/licencia.ts`              | Estado de pago y vuelta desde Stripe                          |
| `src/storage.ts`               | Presupuestos guardados en el navegador                        |
| `src/components/Vista.tsx`     | Vista previa en HTML, espejo del PDF                          |
| `scripts/generar-sitio.mjs`    | Páginas estáticas, sitemap, robots y datos estructurados      |
| `scripts/revisar-pdf.mjs`      | Revisión de la maquetación de todos los PDF                   |
| `scripts/generar-og.mjs`       | Imagen para compartir e iconos de la app                      |
| `pruebas/calc.test.ts`         | Pruebas de importes: es donde un error cuesta dinero          |

Dos decisiones que conviene conocer antes de tocar nada:

1. **La maquetación del documento existe dos veces**, en HTML (`Vista.tsx`) para
   la pantalla y en jsPDF (`pdf.ts`) para el archivo. Es a propósito: da un PDF
   vectorial de calidad. Si cambias el diseño del documento, hay que tocar los
   dos sitios. La lógica de importes es común (`calc.ts`) y nunca se duplica.
2. **El contenido de los oficios vive en `src/oficios.ts`**, y lo usan tanto la
   app (para las plantillas) como el generador de páginas estáticas (para el
   texto). Se escribe una vez.

## Puesta en producción

### 1. Rellenar los datos legales

Antes de publicar, edita `scripts/legales.mjs` y sustituye el objeto `TITULAR`
por tus datos fiscales reales. Los huecos salen resaltados en naranja en las
páginas publicadas justamente para que no se te pasen.

Los textos legales están redactados para este caso concreto (producto digital,
sin registro, sin datos en servidor, cobro por Stripe), pero **no sustituyen a
la revisión de un asesor**.

### 2. Conectar el cobro

1. En Stripe, crea dos **Payment Links**: uno de pago único (7 €) y otro de
   suscripción (9 €/mes).
2. En cada uno, configura la URL de éxito:
   - `https://TU-DOMINIO/?pago=ok&plan=unico`
   - `https://TU-DOMINIO/?pago=ok&plan=suscripcion`
3. Copia `.env.example` a `.env.local` y pega ahí las dos URLs. En Vercel o
   Netlify, defínelas como variables de entorno del proyecto.

En el propio Payment Link, activa la casilla de consentimiento de ejecución
inmediata del contenido digital: es lo que exige la normativa de consumo para
que el usuario pierda el derecho de desistimiento, tal como recogen las
condiciones de contratación.

**Limitación conocida y asumida:** la licencia se guarda en el navegador y se
activa con un parámetro de la URL, así que cualquiera que escriba `?pago=ok` a
mano se salta el pago. Es el precio de no tener servidor ni registro. Cuando el
volumen lo justifique, se sustituye por una función serverless que verifique la
sesión de Stripe; toda la lógica está aislada en `src/licencia.ts` y el resto de
la app no cambia.

### 3. Desplegar

El proyecto es estático. Hay configuración lista para las dos plataformas
habituales, con cabeceras de seguridad, política de contenidos y caché
inmutable para los assets con hash:

- **Vercel**: `vercel.json`. Importa el repositorio y despliega; no hay nada que
  configurar a mano.
- **Netlify**: `netlify.toml`.

**El dominio se detecta solo en Netlify y en Vercel**: el generador lee la
variable `URL` que Netlify inyecta en cada build, o
`VERCEL_PROJECT_PRODUCTION_URL` en Vercel. No hay que configurar nada.

Puedes forzarlo con **`SITE_URL`** si lo necesitas (por ejemplo para un dominio
propio que todavía no es el principal en Netlify). Compilando en local sin
ninguna de las dos, el script avisa por consola y usa un dominio de ejemplo: ese
build no se publica.

```bash
SITE_URL=https://tudominio.com npm run build
```

### 4. Después de publicar

- Da de alta el dominio en Google Search Console y envía
  `https://TU-DOMINIO/sitemap.xml`.
- Comprueba la vista previa al compartir el enlace en WhatsApp (debe salir
  `og.png`).
- Actualiza `SITIO.url` en `src/contenido.ts` si cambias de dominio.

## SEO

La estrategia es la única que funciona sin audiencia previa: **una herramienta
gratis que resuelve algo que la gente ya busca**, con contenido propio en la
misma página.

- `/` es la herramienta, con explicación, claves y preguntas frecuentes debajo,
  más datos estructurados de `SoftwareApplication` y `FAQPage`.
- `/presupuesto-<oficio>/` son trece páginas estáticas **sin nada de
  JavaScript**, con contenido propio de cada oficio, su tabla de partidas, sus
  preguntas frecuentes con `FAQPage` y un enlace que abre la herramienta con la
  plantilla ya cargada (`/?oficio=fontaneria`).
- `/guias/` son artículos que atacan búsquedas informativas con volumen propio
  («qué IVA llevan las reformas», «retención de IRPF»), con `Article` y
  `FAQPage`, y llevan a la herramienta desde dentro del texto.

Si añades un oficio a `src/oficios.ts` o una guía a `src/guias.ts`, aparecen
solos su plantilla en la app, su página estática, su entrada en el sitemap y
sus enlaces internos.

### Sobre el contenido fiscal

Las guías explican normativa española (tipos de IVA, retenciones). Están
redactadas con cuidado y con un aviso expreso de que no son asesoramiento
fiscal, porque el caso concreto de cada profesional lo tiene que ver su asesor.
Si tocas esos textos, mantén el aviso.

## Privacidad

Los presupuestos se guardan en `localStorage`, nunca en un servidor. No hay
analítica, ni cookies de seguimiento, ni banner de consentimiento. La única
petición externa son las tipografías de Google Fonts, y está declarada en la
política de privacidad.
