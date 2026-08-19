import Stripe from "stripe";
import { loQueFalta } from "./_licencia.mjs";
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

/**
 * Lo que ve el cliente en el extracto del banco.
 *
 * La primera causa de disputas de tarjeta en productos baratos es que el
 * comprador no reconoce el cargo. Cada disputa cuesta 15 € además del importe,
 * o sea el doble de lo que vale el producto. El prefijo lo pone la cuenta de
 * Stripe; esto es el sufijo que identifica la app concreta.
 */
const DESCRIPTOR = "PRESU";

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

/**
 * Crea la sesión y, si Stripe se queja del descriptor del extracto, lo repite
 * sin él.
 *
 * El sufijo del descriptor solo se admite si la cuenta tiene configurado su
 * descriptor por defecto. Que falte eso es un detalle de configuración, y un
 * detalle de configuración no puede impedir una venta.
 */
async function crearSesion(stripe, parametros, idempotencyKey) {
  try {
    return await stripe.checkout.sessions.create(parametros, { idempotencyKey });
  } catch (error) {
    const esDelDescriptor = String(error?.raw?.param ?? error?.param ?? "").includes(
      "statement_descriptor",
    );
    if (!esDelDescriptor) throw error;

    const { payment_intent_data: _sinDescriptor, ...resto } = parametros;
    return stripe.checkout.sessions.create(resto, { idempotencyKey: `${idempotencyKey}-sd` });
  }
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
    const { plan, presupuestoId } = await leerCuerpo(peticion);
    const elegido = PLANES[plan];
    if (!elegido) return Response.json({ error: "Plan desconocido" }, { status: 400 });

    // El dominio lo pone el servidor. Si lo aceptáramos del cliente, tendríamos
    // una redirección abierta con la marca de Stripe delante.
    const sitio = (process.env.URL ?? new URL(peticion.url).origin).replace(/\/$/, "");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sesion = await crearSesion(stripe, {
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
      ...(elegido.modo === "payment"
        ? { payment_intent_data: { statement_descriptor_suffix: DESCRIPTOR } }
        : {}),
      custom_text: {
        submit: {
          message:
            "Al pagar solicitas la descarga inmediata y aceptas que, una vez activada, " +
            "pierdes el derecho de desistimiento sobre este contenido digital.",
        },
      },
      success_url: `${sitio}/?sesion={CHECKOUT_SESSION_ID}`,
      cancel_url: `${sitio}/?pago=cancelado`,
    }, `${plan}-${presupuestoId}-${Math.floor(Date.now() / 60000)}`);

    return Response.json({ url: sesion.url });
  } catch (error) {
    if (error instanceof ErrorValidacion) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    console.error("crear-pago:", error);

    // Se devuelve el motivo que da Stripe, no un «algo ha fallado». Sus mensajes
    // no contienen la clave (la propia librería la censura) y sin ellos hay que
    // ir a bucear en los registros de Netlify para saber que sobraba un espacio
    // al copiar la clave.
    return Response.json(
      {
        error: error?.raw?.message ?? error?.message ?? "No se ha podido iniciar el pago",
        codigo: error?.code ?? error?.type ?? null,
      },
      { status: 500 },
    );
  }
};
