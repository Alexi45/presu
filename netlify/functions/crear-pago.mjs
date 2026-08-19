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
 * Crea la sesión, renunciando a los adornos si la cuenta no los admite.
 *
 * Ni el aviso de la pantalla de pago ni el descriptor del extracto valen tanto
 * como una venta. Si Stripe rechaza alguno por cómo está configurada la cuenta,
 * se reintenta sin él en vez de dejar al cliente con un error.
 */
async function crearSesion(stripe, parametros, idempotencyKey) {
  const degradaciones = [
    // 1. Tal cual: con el aviso legal y el descriptor del extracto.
    (p) => p,
    // 2. Sin el aviso. Las cuentas con Managed Payments (Stripe como vendedor)
    //    no admiten custom_text ni que se desactive desde aquí.
    ({ custom_text: _, managed_payments: __, ...resto }) => resto,
    // 3. Sin el descriptor del extracto, que exige tener uno por defecto.
    ({ custom_text: _, managed_payments: __, payment_intent_data: ___, ...resto }) => resto,
  ];

  let ultimoError;
  for (const [indice, degradar] of degradaciones.entries()) {
    try {
      return await stripe.checkout.sessions.create(degradar(parametros), {
        idempotencyKey: indice === 0 ? idempotencyKey : `${idempotencyKey}-${indice}`,
      });
    } catch (error) {
      // Un problema de parámetros se puede reintentar sin ellos. Una clave mala
      // o una tarjeta rechazada, no: eso sube tal cual.
      if (error?.type !== "StripeInvalidRequestError") throw error;
      ultimoError = error;
    }
  }
  throw ultimoError;
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
      // Sin esto, Stripe figura como vendedor y quien responde ante el cliente
      // es Stripe, no tú. Las condiciones publicadas dicen que el vendedor eres
      // tú, así que aquí se pide lo mismo. Si la cuenta no permite cambiarlo,
      // la degradación de abajo lo quita y la venta sigue adelante.
      managed_payments: { enabled: false },
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
