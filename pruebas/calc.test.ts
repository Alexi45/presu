import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  agruparPorCapitulo,
  calcular,
  euros,
  importeLinea,
  redondear,
  tieneCapitulos,
} from "../src/calc.ts";
import { nuevaLinea, presupuestoVacio } from "../src/types.ts";
import type { Linea, Presupuesto, TipoIva } from "../src/types.ts";

/**
 * Estas pruebas cubren el único sitio del proyecto donde un error cuesta dinero
 * de verdad: si el total está mal, el profesional cobra de menos o queda mal
 * delante de su cliente. El resto de la app se verifica mirándola; esto no.
 *
 * Se ejecutan con `npm test` (Node ejecuta el TypeScript quitando los tipos).
 */

function linea(cambios: Partial<Linea> = {}): Linea {
  return { ...nuevaLinea(), concepto: "Partida", ...cambios };
}

function presupuesto(cambios: Partial<Presupuesto> = {}): Presupuesto {
  return { ...presupuestoVacio(), lineas: [], ...cambios };
}

describe("redondeo", () => {
  it("redondea al alza los medios céntimos que la coma flotante estropea", () => {
    assert.equal(redondear(1.005), 1.01);
    assert.equal(redondear(2.675), 2.68);
    assert.equal(redondear(0.1 + 0.2), 0.3);
  });

  it("no toca los importes que ya son exactos", () => {
    assert.equal(redondear(1234.56), 1234.56);
    assert.equal(redondear(0), 0);
  });
});

describe("importe de una línea", () => {
  it("multiplica cantidad por precio", () => {
    assert.equal(importeLinea(linea({ cantidad: 14, precio: 46 })), 644);
  });

  it("redondea las cantidades con decimales", () => {
    assert.equal(importeLinea(linea({ cantidad: 3.33, precio: 19.99 })), 66.57);
  });
});

describe("totales", () => {
  it("calcula base, IVA y total de un caso simple", () => {
    const totales = calcular(
      presupuesto({ lineas: [linea({ cantidad: 1, precio: 1000, iva: 21 })] }),
    );
    assert.equal(totales.base, 1000);
    assert.equal(totales.totalIva, 210);
    assert.equal(totales.total, 1210);
  });

  it("desglosa el IVA por tipo, de mayor a menor", () => {
    const totales = calcular(
      presupuesto({
        lineas: [
          linea({ cantidad: 1, precio: 100, iva: 21 }),
          linea({ cantidad: 1, precio: 200, iva: 10 }),
          linea({ cantidad: 1, precio: 50, iva: 21 }),
        ],
      }),
    );
    assert.deepEqual(
      totales.tramos.map((t) => [t.tipo, t.base, t.cuota]),
      [
        [21, 150, 31.5],
        [10, 200, 20],
      ],
    );
    assert.equal(totales.totalIva, 51.5);
    assert.equal(totales.total, 401.5);
  });

  it("omite del desglose los tipos que no se usan", () => {
    const totales = calcular(
      presupuesto({ lineas: [linea({ cantidad: 1, precio: 100, iva: 0 })] }),
    );
    assert.equal(totales.tramos.length, 1);
    assert.equal(totales.tramos[0].tipo, 0);
    assert.equal(totales.total, 100);
  });

  it("reparte el descuento global proporcionalmente entre los tipos de IVA", () => {
    const totales = calcular(
      presupuesto({
        descuento: 10,
        lineas: [
          linea({ cantidad: 1, precio: 100, iva: 21 }),
          linea({ cantidad: 1, precio: 100, iva: 10 }),
        ],
      }),
    );
    assert.equal(totales.subtotal, 200);
    assert.equal(totales.descuento, 20);
    assert.equal(totales.base, 180);
    // Cada tramo se reduce un 10 %, no se descuenta todo del tipo más alto.
    assert.deepEqual(
      totales.tramos.map((t) => [t.tipo, t.base]),
      [
        [21, 90],
        [10, 90],
      ],
    );
    assert.equal(totales.totalIva, 27.9);
    assert.equal(totales.total, 207.9);
  });

  it("aplica la retención de IRPF sobre la base, no sobre el total con IVA", () => {
    const totales = calcular(
      presupuesto({ irpf: 15, lineas: [linea({ cantidad: 1, precio: 1000, iva: 21 })] }),
    );
    assert.equal(totales.retencion, 150);
    assert.equal(totales.total, 1060); // 1000 + 210 − 150
  });

  it("ignora las líneas vacías que deja el editor", () => {
    const totales = calcular(
      presupuesto({
        lineas: [linea({ cantidad: 1, precio: 500 }), nuevaLinea()],
      }),
    );
    assert.equal(totales.subtotal, 500);
  });
});

describe("partidas opcionales", () => {
  it("no suman al total", () => {
    const totales = calcular(
      presupuesto({
        lineas: [
          linea({ cantidad: 1, precio: 1000, iva: 21 }),
          linea({ cantidad: 1, precio: 500, iva: 21, opcional: true }),
        ],
      }),
    );
    assert.equal(totales.base, 1000);
    assert.equal(totales.total, 1210);
  });

  it("se muestran con su IVA incluido, que es lo que costaría añadirlas", () => {
    const totales = calcular(
      presupuesto({
        lineas: [
          linea({ cantidad: 1, precio: 1000, iva: 21 }),
          linea({ cantidad: 5, precio: 78, iva: 21, opcional: true }),
        ],
      }),
    );
    assert.equal(totales.opcionales, 471.9); // 390 + 21 %
  });

  it("tampoco entran en el desglose de IVA", () => {
    const totales = calcular(
      presupuesto({
        lineas: [
          linea({ cantidad: 1, precio: 100, iva: 21 }),
          linea({ cantidad: 1, precio: 100, iva: 10, opcional: true }),
        ],
      }),
    );
    assert.deepEqual(
      totales.tramos.map((t) => t.tipo),
      [21],
    );
  });
});

describe("anticipo", () => {
  it("se calcula sobre el total y el resto cuadra", () => {
    const totales = calcular(
      presupuesto({ anticipo: 40, lineas: [linea({ cantidad: 1, precio: 1000, iva: 21 })] }),
    );
    assert.equal(totales.anticipo, 484);
    assert.equal(totales.resto, 726);
    assert.equal(redondear(totales.anticipo + totales.resto), totales.total);
  });

  it("cuadra también con porcentajes que dan decimales feos", () => {
    const totales = calcular(
      presupuesto({ anticipo: 33, lineas: [linea({ cantidad: 3, precio: 33.33, iva: 21 })] }),
    );
    assert.equal(redondear(totales.anticipo + totales.resto), totales.total);
  });

  it("es cero si no se ha pedido anticipo", () => {
    const totales = calcular(
      presupuesto({ lineas: [linea({ cantidad: 1, precio: 100 })] }),
    );
    assert.equal(totales.anticipo, 0);
    assert.equal(totales.resto, totales.total);
  });
});

describe("capítulos", () => {
  it("agrupa las líneas consecutivas del mismo capítulo", () => {
    const grupos = agruparPorCapitulo([
      linea({ capitulo: "Demolición", precio: 100 }),
      linea({ capitulo: "Albañilería", precio: 200 }),
      linea({ capitulo: "Albañilería", precio: 300 }),
    ]);
    assert.deepEqual(
      grupos.map((g) => [g.capitulo, g.lineas.length, g.subtotal]),
      [
        ["Demolición", 1, 100],
        ["Albañilería", 2, 500],
      ],
    );
  });

  it("no reordena: un capítulo repetido más abajo abre un grupo nuevo", () => {
    const grupos = agruparPorCapitulo([
      linea({ capitulo: "Obra", precio: 100 }),
      linea({ capitulo: "Pintura", precio: 200 }),
      linea({ capitulo: "Obra", precio: 300 }),
    ]);
    assert.equal(grupos.length, 3);
  });

  it("deja fuera del subtotal las partidas opcionales", () => {
    const grupos = agruparPorCapitulo([
      linea({ capitulo: "Acabados", precio: 100 }),
      linea({ capitulo: "Acabados", precio: 900, opcional: true }),
    ]);
    assert.equal(grupos[0].subtotal, 100);
    assert.equal(grupos[0].lineas.length, 2);
  });

  it("un presupuesto sin capítulos es un único grupo sin nombre", () => {
    const grupos = agruparPorCapitulo([linea({ precio: 100 }), linea({ precio: 200 })]);
    assert.equal(grupos.length, 1);
    assert.equal(grupos[0].capitulo, "");
    assert.equal(tieneCapitulos(grupos), false);
  });

  it("no se enseñan subtotales si solo hay un capítulo", () => {
    const grupos = agruparPorCapitulo([
      linea({ capitulo: "Obra", precio: 100 }),
      linea({ capitulo: "Obra", precio: 200 }),
    ]);
    assert.equal(tieneCapitulos(grupos), false);
  });
});

describe("formato español", () => {
  it("no separa los millares en números de cuatro cifras", () => {
    // Regla del español: la agrupación empieza en cinco dígitos.
    assert.match(euros(2649), /^2649,00/);
    assert.match(euros(12649), /^12\.649,00/);
  });

  it("usa la coma como separador decimal", () => {
    assert.match(euros(1.5), /^1,50/);
  });
});

describe("caso completo", () => {
  it("suma bien un presupuesto con capítulos, opcional, descuento, IRPF y anticipo", () => {
    const totales = calcular(
      presupuesto({
        descuento: 5,
        irpf: 15,
        anticipo: 30,
        lineas: [
          linea({ capitulo: "Obra", cantidad: 20, precio: 50, iva: 21 }),
          linea({ capitulo: "Obra", cantidad: 1, precio: 400, iva: 10 }),
          linea({ capitulo: "Extras", cantidad: 2, precio: 150, iva: 21, opcional: true }),
        ],
      }),
    );

    assert.equal(totales.subtotal, 1400);
    assert.equal(totales.descuento, 70);
    assert.equal(totales.base, 1330);
    assert.equal(totales.totalIva, 237.5); // 950 × 21 % + 380 × 10 %
    assert.equal(totales.retencion, 199.5);
    assert.equal(totales.total, 1368);
    assert.equal(totales.opcionales, 363);
    assert.equal(totales.anticipo, 410.4);
    assert.equal(totales.resto, 957.6);
  });
});

describe("tipos de IVA admitidos", () => {
  it("calcula correctamente los cuatro tipos", () => {
    for (const [iva, esperado] of [
      [21, 121],
      [10, 110],
      [4, 104],
      [0, 100],
    ] as [TipoIva, number][]) {
      const totales = calcular(
        presupuesto({ lineas: [linea({ cantidad: 1, precio: 100, iva })] }),
      );
      assert.equal(totales.total, esperado, `IVA del ${iva} %`);
    }
  });
});
