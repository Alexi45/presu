import Stripe from "stripe";
import { hayConfiguracion } from "./_licencia.mjs";
import { ErrorValidacion, leerCuerpo } from "./_validar.mjs";

/**
 * Crea la sesión de pago en Stripe y devuelve la URL a la que mandar al usuario.
 *
 * La sesión se crea aquí y no con un enlace de pago fijo por dos motivos: el
 * importe lo decide el servidor (el cliente no puede pedir pagar 0 €) y el
 * identificador del presupuesto viaja en los metadatos, que solo se pueden
 * escribir desde aquí. Al volver, ese metadato es lo que ata la licencia a ese
 * presupuesto concreto.
 */

const PLANES = {
  unico: {
    modo: "payment",
    importe: 700,
    nombre: "Presu · presupuesto sin marca de agua",
    descripcion: "Descarga este presupuesto en PDF sin marca de agua, las veces que quieras.",
  },
  suscripcion: {
    modo: "subscription",
    importe: 1900,
    nombre: "Presu · presupuestos ilimitados",
    descripcion: "Todos tus presupuestos sin marca de agua mientras la suscripción esté activa.",
  },
};

export default async (peticion) => {
  if (peticion.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }
  if (!hayConfiguracion()) {
    return Response.json({ error: "El cobro no está configurado" }, { status: 503 });
  }

  try {
    const { plan, presupuestoId } = await leerCuerpo(peticion);
    const elegido = PLANES[plan];
    if (!elegido) return Response.json({ error: "Plan desconocido" }, { status: 400 });

    // El dominio lo pone el servidor. Si lo aceptáramos del cliente, tendríamos
    // una redirección abierta con la marca de Stripe delante.
    const sitio = (process.env.URL ?? new URL(peticion.url).origin).replace(/\/$/, "");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sesion = await stripe.checkout.sessions.create({
      mode: elegido.modo,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: elegido.importe,
            ...(elegido.modo === "subscription" ? { recurring: { interval: "month" } } : {}),
            product_data: { name: elegido.nombre, description: elegido.descripcion },
          },
        },
      ],
      locale: "es",
      metadata: { presupuestoId: String(presupuestoId ?? "").slice(0, 60), plan },
      custom_text: {
        submit: {
          message:
            "Al pagar solicitas la descarga inmediata y aceptas que, una vez activada, " +
            "pierdes el derecho de desistimiento sobre este contenido digital.",
        },
      },
      success_url: `${sitio}/?sesion={CHECKOUT_SESSION_ID}`,
      cancel_url: `${sitio}/?pago=cancelado`,
    });

    return Response.json({ url: sesion.url });
  } catch (error) {
    if (error instanceof ErrorValidacion) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("crear-pago:", error);
    return Response.json({ error: "No se ha podido iniciar el pago" }, { status: 500 });
  }
};
