import Stripe from "stripe";
import { loQueFalta, verificar } from "./_licencia.mjs";
import { ErrorValidacion, leerCuerpo } from "./_validar.mjs";

/**
 * Abre el portal de facturación de Stripe.
 *
 * Sin esto, cancelar la suscripción obligaba al usuario a escribir un correo y
 * a esperar a que alguien lo leyera. Eso es soporte manual para ti, fricción
 * para él y, en una suscripción a consumidores, un problema: la normativa
 * europea exige que dar de baja sea tan fácil como darse de alta.
 *
 * En el portal el cliente cancela, cambia de tarjeta y se descarga sus
 * facturas. Todo lo lleva Stripe; aquí solo se comprueba que quien lo pide
 * tiene una licencia de suscripción firmada por nosotros.
 */

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
    const licencia = verificar(cuerpo?.licencia);

    if (!licencia || licencia.plan !== "suscripcion" || !licencia.cus) {
      return Response.json({ error: "No hay ninguna suscripción activa" }, { status: 401 });
    }

    const sitio = (process.env.URL ?? new URL(peticion.url).origin).replace(/\/$/, "");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sesion = await stripe.billingPortal.sessions.create({
      customer: licencia.cus,
      return_url: `${sitio}/`,
      locale: "es",
    });

    return Response.json({ url: sesion.url });
  } catch (error) {
    if (error instanceof ErrorValidacion) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("portal-cliente:", error);
    return Response.json({ error: "No se ha podido abrir la gestión de la suscripción" }, { status: 500 });
  }
};
