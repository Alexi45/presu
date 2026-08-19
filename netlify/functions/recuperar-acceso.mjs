import Stripe from "stripe";
import { enviarCorreo, hayCorreo } from "./_correo.mjs";
import { DURACION_ACCESO, firmar, loQueFalta } from "./_licencia.mjs";
import { ErrorValidacion, leerCuerpo } from "./_validar.mjs";

/**
 * Devuelve el acceso a quien ya ha pagado, en otro navegador o en otro móvil.
 *
 * Sin esto, la licencia vive atada al navegador donde se compró: quien paga
 * 19 € al mes y cambia de teléfono, limpia el historial o abre el portátil del
 * trabajo, ha perdido lo que está pagando. En una herramienta pensada para
 * usarse en casa del cliente, eso no es un caso raro.
 *
 * No hay cuentas ni contraseñas. Stripe ya sabe quién ha pagado y con qué
 * correo; lo único que falta es comprobar que quien lo pide es el dueño de ese
 * correo, y para eso basta con mandarle un enlace.
 */

export default async (peticion) => {
  if (peticion.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }

  const faltan = loQueFalta();
  if (faltan.length > 0 || !hayCorreo()) {
    return Response.json(
      {
        error: "La recuperación de acceso no está configurada todavía",
        faltan: [
          ...faltan,
          ...(process.env.RESEND_API_KEY ? [] : ["RESEND_API_KEY"]),
          ...(process.env.EMAIL_REMITENTE ? [] : ["EMAIL_REMITENTE"]),
        ],
      },
      { status: 503 },
    );
  }

  // Siempre se contesta lo mismo, haya compra o no. Si la respuesta cambiara,
  // cualquiera podría averiguar qué correos son clientes probando de uno en uno.
  const mismaRespuesta = Response.json({
    ok: true,
    mensaje: "Si ese correo tiene alguna compra, te llega un enlace en un minuto.",
  });

  try {
    const { email } = await leerCuerpo(peticion);
    const correo = String(email ?? "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo) || correo.length > 160) {
      return Response.json({ error: "Ese correo no parece válido" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const clientes = await stripe.customers.list({ email: correo, limit: 5 });
    if (clientes.data.length === 0) return mismaRespuesta;

    // El testigo solo dice "el dueño de este correo ha demostrado serlo". Lo que
    // ha comprado se vuelve a consultar a Stripe al canjearlo, para que una
    // suscripción cancelada entre medias no siga dando acceso.
    const testigo = firmar({
      tipo: "acceso",
      email: correo,
      exp: Date.now() + DURACION_ACCESO,
    });

    const sitio = (process.env.URL ?? new URL(peticion.url).origin).replace(/\/$/, "");
    const enlace = `${sitio}/?acceso=${encodeURIComponent(testigo)}`;

    await enviarCorreo({
      para: correo,
      asunto: "Tu acceso a PresupPRO",
      texto:
        `Abre este enlace para recuperar tu acceso en este dispositivo:\n\n${enlace}\n\n` +
        "Caduca en 30 minutos. Si no has pedido tú este correo, ignóralo: " +
        "nadie puede entrar solo con conocer tu dirección.",
      html:
        `<p>Abre este enlace para recuperar tu acceso en este dispositivo:</p>` +
        `<p><a href="${enlace}">Recuperar mi acceso a PresupPRO</a></p>` +
        `<p style="color:#6e7681;font-size:14px">Caduca en 30 minutos. Si no has pedido ` +
        `tú este correo, ignóralo: nadie puede entrar solo con conocer tu dirección.</p>`,
    });

    return mismaRespuesta;
  } catch (error) {
    if (error instanceof ErrorValidacion) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("recuperar-acceso:", error);
    // Tampoco aquí se distingue: un fallo interno no debe delatar nada.
    return mismaRespuesta;
  }
};
