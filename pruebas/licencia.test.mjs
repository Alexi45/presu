import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Pruebas del cobro.
 *
 * Todo el negocio se apoya en que el PDF sin marca de agua solo salga de la
 * función del servidor y solo con una licencia firmada por ella. Si alguien
 * relaja esta comprobación en el futuro, el producto pasa a ser gratis sin que
 * nadie se dé cuenta hasta ver la facturación. De ahí que esto se pruebe con
 * más saña que ninguna otra cosa.
 */

process.env.LICENCIA_SECRET = "secreto-de-pruebas";
process.env.STRIPE_SECRET_KEY = "sk_test_falsa";
process.env.URL = "https://ejemplo.test";

const { firmar, verificar } = await import("../netlify/functions/_licencia.mjs");
const { validarPresupuesto } = await import("../netlify/functions/_validar.mjs");
const generarPdf = (await import("../netlify/functions/generar-pdf.mjs")).default;

const PRESUPUESTO = {
  id: "presupuesto-A",
  numero: "2026-007",
  fecha: "2026-08-18",
  titulo: "Prueba",
  emisor: { nombre: "Reformas Molina", nif: "B1", direccion: "C/ Mayor", telefono: "600", email: "a@b.es", web: "" },
  cliente: { nombre: "Ana Belmonte", nif: "1Z", direccion: "", telefono: "", email: "" },
  lineas: [
    { capitulo: "", concepto: "Alicatado", descripcion: "", opcional: false, cantidad: 14, unidad: "m2", precio: 46, iva: 21 },
  ],
  descuento: 0, irpf: 0, anticipo: 0, notas: "", condiciones: "", plantilla: "moderna", color: "#E2582B",
};

const dentroDeUnRato = () => Date.now() + 60_000;

function peticion(cuerpo) {
  return new Request("https://ejemplo.test/.netlify/functions/generar-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

const pedirPdf = (cuerpo) => generarPdf(peticion(cuerpo));

describe("firma de licencias", () => {
  it("acepta un testigo recién firmado", () => {
    const datos = { plan: "unico", presupuestoId: "x", exp: dentroDeUnRato() };
    assert.deepEqual(verificar(firmar(datos)), datos);
  });

  it("rechaza un testigo caducado", () => {
    assert.equal(verificar(firmar({ plan: "unico", exp: Date.now() - 1 })), null);
  });

  it("rechaza una firma manipulada", () => {
    const testigo = firmar({ plan: "unico", exp: dentroDeUnRato() });
    assert.equal(verificar(`${testigo.slice(0, -4)}aaaa`), null);
  });

  it("rechaza una carga cambiada a mano conservando la firma", () => {
    const bueno = firmar({ plan: "unico", presupuestoId: "A", exp: dentroDeUnRato() });
    const falsificada = Buffer.from(
      JSON.stringify({ plan: "suscripcion", exp: dentroDeUnRato() }),
    ).toString("base64url");
    assert.equal(verificar(`${falsificada}.${bueno.split(".")[1]}`), null);
  });

  it("rechaza basura y valores que no son texto", () => {
    for (const entrada of ["", ".", "sinpunto", null, undefined, 42, {}]) {
      assert.equal(verificar(entrada), null, `entrada: ${String(entrada)}`);
    }
  });
});

describe("la función del PDF exige licencia", () => {
  it("devuelve el PDF con una licencia de ese presupuesto", async () => {
    const licencia = firmar({ plan: "unico", presupuestoId: PRESUPUESTO.id, exp: dentroDeUnRato() });
    const r = await pedirPdf({ licencia, presupuesto: PRESUPUESTO });
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type"), /application\/pdf/);
    assert.ok((await r.arrayBuffer()).byteLength > 1000);
  });

  it("la suscripción sirve para cualquier presupuesto", async () => {
    const licencia = firmar({ plan: "suscripcion", sub: "sub_1", exp: dentroDeUnRato() });
    const r = await pedirPdf({ licencia, presupuesto: { ...PRESUPUESTO, id: "otro-cualquiera" } });
    assert.equal(r.status, 200);
  });

  it("sin licencia devuelve 401", async () => {
    assert.equal((await pedirPdf({ presupuesto: PRESUPUESTO })).status, 401);
  });

  it("una licencia inventada devuelve 401", async () => {
    assert.equal((await pedirPdf({ licencia: "yo.mismo", presupuesto: PRESUPUESTO })).status, 401);
  });

  it("el pago único NO sirve para otro presupuesto", async () => {
    const licencia = firmar({ plan: "unico", presupuestoId: "otro", exp: dentroDeUnRato() });
    const r = await pedirPdf({ licencia, presupuesto: PRESUPUESTO });
    assert.equal(r.status, 403);
  });

  it("no acepta otros métodos que no sean POST", async () => {
    const r = await generarPdf(new Request("https://ejemplo.test/x", { method: "GET" }));
    assert.equal(r.status, 405);
  });

  it("nunca filtra el secreto en la respuesta de error", async () => {
    const r = await pedirPdf({ licencia: "malo", presupuesto: PRESUPUESTO });
    const texto = JSON.stringify(await r.json());
    assert.ok(!texto.includes(process.env.LICENCIA_SECRET));
  });
});

describe("validación de lo que llega del navegador", () => {
  it("corta un presupuesto con demasiadas partidas", async () => {
    const licencia = firmar({ plan: "suscripcion", sub: "s", exp: dentroDeUnRato() });
    const enorme = { ...PRESUPUESTO, lineas: new Array(5000).fill(PRESUPUESTO.lineas[0]) };
    const r = await pedirPdf({ licencia, presupuesto: enorme });
    assert.equal(r.status, 400);
  });

  it("recorta los textos desmedidos en vez de romperse", () => {
    const limpio = validarPresupuesto({
      ...PRESUPUESTO,
      lineas: [{ ...PRESUPUESTO.lineas[0], concepto: "x".repeat(100_000) }],
    });
    assert.equal(limpio.lineas[0].concepto.length, 200);
  });

  it("descarta un logotipo que no sea una imagen", () => {
    const limpio = validarPresupuesto({
      ...PRESUPUESTO,
      emisor: { ...PRESUPUESTO.emisor, logo: "data:text/html;base64,PHNjcmlwdD4=" },
    });
    assert.equal(limpio.emisor.logo, null);
  });

  it("normaliza tipos de IVA y plantillas inventados", () => {
    const limpio = validarPresupuesto({
      ...PRESUPUESTO,
      plantilla: "la-mia",
      lineas: [{ ...PRESUPUESTO.lineas[0], iva: 99 }],
    });
    assert.equal(limpio.plantilla, "moderna");
    assert.equal(limpio.lineas[0].iva, 21);
  });

  it("acota los importes disparatados", () => {
    const limpio = validarPresupuesto({
      ...PRESUPUESTO,
      descuento: 100_000,
      lineas: [{ ...PRESUPUESTO.lineas[0], precio: 1e30, cantidad: Number.POSITIVE_INFINITY }],
    });
    assert.equal(limpio.descuento, 100);
    assert.ok(Number.isFinite(limpio.lineas[0].precio));
    assert.ok(Number.isFinite(limpio.lineas[0].cantidad));
  });
});
