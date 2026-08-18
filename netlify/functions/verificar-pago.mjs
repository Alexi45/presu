import Stripe from "stripe";
import {
  DURACION_SUSCRIPCION,
  DURACION_UNICO,
  firmar,
  hayConfiguracion,
  verificar,
} from "./_licencia.mjs";
import { ErrorValidacion, leerCuerpo } from "./_validar.mjs";

/**
 * Confirma el pago contra Stripe y emite la licencia firmada.
 *
 * El navegador solo aporta el identificador de la sesión, que no sirve de nada
 * por sí mismo: el estado del cobro se lee de Stripe, y el presupuesto al que
 * da derecho sale de los metadatos que escribió `crear-pago`, no de lo que diga
 * el cliente.
 */

function licenciaDeSesion(sesion) {
  const plan = sesion.metadata?.plan === "suscripcion" ? "suscripcion" : "unico";

  if (plan === "suscripcion") {
    const suscripcion = sesion.subscription;
    const activa =
      suscripcion && ["active", "trialing"].includes(suscripcion.status ?? suscripcion);
    if (!activa) return null;
    return {
      plan,
      sub: typeof suscripcion === "string" ? suscripcion : suscripcion.id,
      exp: Date.now() + DURACION_SUSCRIPCION,
    };
  }

  if (sesion.payment_status !== "paid") return null;
  return {
    plan,
    presupuestoId: sesion.metadata?.presupuestoId ?? "",
    exp: Date.now() + DURACION_UNICO,
  };
}

export default async (peticion) => {
  if (peticion.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }
  if (!hayConfiguracion()) {
    return Response.json({ error: "El cobro no está configurado" }, { status: 503 });
  }

  try {
    const cuerpo = await leerCuerpo(peticion);

    // Renovación de una suscripción ya comprada: se vuelve a preguntar a Stripe.
    if (cuerpo?.renovar) {
      const anterior = verificar(cuerpo.renovar);
      if (!anterior?.sub) {
        return Response.json({ error: "Licencia no renovable" }, { status: 400 });
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const suscripcion = await stripe.subscriptions.retrieve(anterior.sub);
      if (!["active", "trialing"].includes(suscripcion.status)) {
        return Response.json({ error: "La suscripción no está activa" }, { status: 402 });
      }
      return Response.json({
        licencia: firmar({
          plan: "suscripcion",
          sub: anterior.sub,
          exp: Date.now() + DURACION_SUSCRIPCION,
        }),
      });
    }

    const sesionId = String(cuerpo?.sesion ?? "");
    if (!/^cs_[A-Za-z0-9_]+$/.test(sesionId)) {
      return Response.json({ error: "Sesión no válida" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sesion = await stripe.checkout.sessions.retrieve(sesionId, {
      expand: ["subscription"],
    });

    const datos = licenciaDeSesion(sesion);
    if (!datos) {
      return Response.json({ error: "El pago no consta como completado" }, { status: 402 });
    }

    return Response.json({ licencia: firmar(datos), plan: datos.plan });
  } catch (error) {
    if (error instanceof ErrorValidacion) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("verificar-pago:", error);
    return Response.json({ error: "No se ha podido verificar el pago" }, { status: 500 });
  }
};
