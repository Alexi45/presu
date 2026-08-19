import Stripe from "stripe";
import {
  DURACION_SUSCRIPCION,
  DURACION_UNICO,
  firmar,
  loQueFalta,
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
      // El cliente de Stripe se guarda para poder abrirle el portal de
      // facturación, donde cancela y ve sus recibos sin escribirte a ti.
      cus: typeof sesion.customer === "string" ? sesion.customer : (sesion.customer?.id ?? ""),
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

/**
 * Todo lo que ha comprado un correo: la suscripción si sigue activa, y cada
 * presupuesto suelto que haya pagado. Se devuelven todas porque alguien puede
 * haber comprado varios presupuestos por separado.
 */
async function licenciasDeCorreo(stripe, email) {
  const clientes = await stripe.customers.list({ email, limit: 5 });
  const licencias = [];
  const vistos = new Set();

  for (const cliente of clientes.data) {
    const suscripciones = await stripe.subscriptions.list({
      customer: cliente.id,
      status: "active",
      limit: 5,
    });
    for (const suscripcion of suscripciones.data) {
      licencias.push({
        plan: "suscripcion",
        sub: suscripcion.id,
        cus: cliente.id,
        exp: Date.now() + DURACION_SUSCRIPCION,
      });
    }

    const sesiones = await stripe.checkout.sessions.list({ customer: cliente.id, limit: 50 });
    for (const sesion of sesiones.data) {
      const presupuestoId = sesion.metadata?.presupuestoId;
      if (sesion.mode !== "payment" || sesion.payment_status !== "paid") continue;
      if (!presupuestoId || vistos.has(presupuestoId)) continue;
      vistos.add(presupuestoId);
      licencias.push({ plan: "unico", presupuestoId, exp: Date.now() + DURACION_UNICO });
    }
  }

  return licencias;
}

export default async (peticion) => {
  if (peticion.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }
  const faltan = loQueFalta();
  if (faltan.length > 0) {
    return Response.json(
      {
        error: "El cobro no está configurado todavía",
        faltan,
        ayuda:
          "Defínelas en Netlify (Site configuration > Environment variables) con el " +
          "ámbito «Functions» marcado y vuelve a desplegar.",
      },
      { status: 503 },
    );
  }

  try {
    const cuerpo = await leerCuerpo(peticion);

    // Canje del enlace de recuperación: se vuelven a consultar las compras a
    // Stripe en vez de fiarse de lo que dijera el testigo, para que una
    // suscripción cancelada entre medias no siga abriendo la puerta.
    if (cuerpo?.acceso) {
      const datos = verificar(cuerpo.acceso);
      if (datos?.tipo !== "acceso" || !datos.email) {
        return Response.json({ error: "El enlace ha caducado o no es válido" }, { status: 401 });
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const licencias = await licenciasDeCorreo(stripe, datos.email);
      if (licencias.length === 0) {
        return Response.json(
          { error: "Ese correo ya no tiene ninguna compra activa" },
          { status: 402 },
        );
      }
      return Response.json({ licencias: licencias.map(firmar) });
    }

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
          cus: anterior.cus ?? "",
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
