import { generarPdf, nombreArchivo } from "./_lib/pdf.js";
import { verificar } from "./_licencia.mjs";
import {
  ErrorValidacion,
  leerCuerpo,
  validarMedidasLogo,
  validarPresupuesto,
} from "./_validar.mjs";

/**
 * Genera el PDF sin marca de agua. Es la pieza que hace que el cobro exista.
 *
 * Mientras el PDF limpio se generase en el navegador, cualquier comprobación de
 * pago era decorativa: bastaba con cambiar una variable en la consola. Al
 * generarlo aquí, para tenerlo hay que traer una licencia firmada por este
 * mismo servidor, y esa firma solo se emite después de que Stripe confirme el
 * cobro.
 *
 * El PDF gratuito sigue haciéndose en el navegador: no cuesta nada servirlo,
 * funciona sin conexión y así el presupuesto solo sale del equipo del usuario
 * cuando ha pagado por ello.
 */

export default async (peticion) => {
  if (peticion.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }

  try {
    const cuerpo = await leerCuerpo(peticion);
    const licencia = verificar(cuerpo?.licencia);

    if (!licencia) {
      return Response.json({ error: "Licencia no válida o caducada" }, { status: 401 });
    }

    const presupuesto = validarPresupuesto(cuerpo?.presupuesto);

    // El pago único da derecho a un presupuesto concreto, el que estaba en
    // pantalla al pagar. El identificador viene de los metadatos de Stripe, no
    // de lo que diga el cliente ahora.
    if (licencia.plan === "unico" && licencia.presupuestoId !== presupuesto.id) {
      return Response.json(
        { error: "Esta licencia es de otro presupuesto", codigo: "otro-presupuesto" },
        { status: 403 },
      );
    }

    const doc = await generarPdf(presupuesto, {
      conMarcaDeAgua: false,
      logoMedidas: validarMedidasLogo(cuerpo?.logoMedidas),
    });

    return new Response(doc.output("arraybuffer"), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivo(presupuesto)}"`,
        // Un presupuesto no se cachea en ningún sitio intermedio.
        "Cache-Control": "no-store, private",
      },
    });
  } catch (error) {
    if (error instanceof ErrorValidacion) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("generar-pdf:", error);
    return Response.json({ error: "No se ha podido generar el PDF" }, { status: 500 });
  }
};
