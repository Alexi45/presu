/**
 * Envío de correo con Resend.
 *
 * Se usa la API por HTTP en vez de su librería: es una sola petición y así no
 * entra otra dependencia en el paquete de la función.
 *
 * Si no está configurado, quien llama recibe `false` y decide qué hacer. Nunca
 * se lanza una excepción por esto: que no haya correo no debe tumbar nada.
 */

export function hayCorreo() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_REMITENTE);
}

export async function enviarCorreo({ para, asunto, texto, html }) {
  if (!hayCorreo()) return false;

  const respuesta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_REMITENTE,
      to: [para],
      subject: asunto,
      text: texto,
      html,
    }),
  });

  if (!respuesta.ok) {
    console.error("Resend:", respuesta.status, await respuesta.text().catch(() => ""));
    return false;
  }
  return true;
}
