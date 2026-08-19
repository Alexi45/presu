import { useState } from "react";
import { SITIO } from "../contenido";
import { abrirPortal, iniciarPago, pedirEnlaceDeAcceso } from "../licencia";
import type { Licencia, Plan } from "../licencia";

interface DescargaProps {
  /** ¿Está pagado este presupuesto concreto? */
  pagado: boolean;
  plan: Plan | null;
  licencia: Licencia | null;
  presupuestoId: string;
  generando: boolean;
  error: string | null;
  puedeCompartir: boolean;
  onDescargar: () => void;
  onCompartir: () => void;
}

/**
 * Recuperar el acceso desde otro dispositivo.
 *
 * Sin esto, quien paga y cambia de móvil ha perdido lo que pagó. No hay cuentas
 * ni contraseñas: Stripe ya sabe quién compró y con qué correo, así que basta
 * con comprobar que quien lo pide es el dueño de ese correo.
 */
function Recuperar() {
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"listo" | "enviando" | "enviado">("listo");
  const [mensaje, setMensaje] = useState<string | null>(null);

  if (!abierto) {
    return (
      <button
        type="button"
        className="boton boton--texto"
        style={{ padding: "8px 0", marginTop: 4 }}
        onClick={() => setAbierto(true)}
      >
        Ya he pagado, recuperar mi acceso
      </button>
    );
  }

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEstado("enviando");
    setMensaje(null);
    try {
      setMensaje(await pedirEnlaceDeAcceso(email));
      setEstado("enviado");
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se ha podido enviar el enlace.");
      setEstado("listo");
    }
  };

  return (
    <form className="recuperar" onSubmit={enviar}>
      <label className="campo">
        <span className="campo__etiqueta">Correo con el que pagaste</span>
        <input
          type="email"
          required
          autoFocus
          value={email}
          placeholder="tu@correo.es"
          onChange={(e) => setEmail(e.target.value)}
          disabled={estado === "enviado"}
        />
      </label>
      {estado !== "enviado" && (
        <button
          type="submit"
          className="boton boton--fantasma boton--ancho"
          disabled={estado === "enviando"}
        >
          {estado === "enviando" ? "Enviando…" : "Enviarme el enlace"}
        </button>
      )}
      {mensaje && <div className={`aviso${estado === "enviado" ? "" : " aviso--error"}`}>{mensaje}</div>}
    </form>
  );
}

export function Descarga({
  pagado,
  plan,
  licencia,
  presupuestoId,
  generando,
  error,
  puedeCompartir,
  onDescargar,
  onCompartir,
}: DescargaProps) {
  const [yendoAPagar, setYendoAPagar] = useState<Plan | null>(null);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  const pagar = async (elegido: Plan) => {
    setYendoAPagar(elegido);
    setErrorPago(null);
    try {
      await iniciarPago(elegido, presupuestoId);
    } catch (e) {
      setErrorPago(e instanceof Error ? e.message : "No se ha podido abrir el pago.");
      setYendoAPagar(null);
    }
  };

  const botonCompartir = puedeCompartir && (
    <button
      type="button"
      className="boton boton--fantasma boton--ancho"
      onClick={onCompartir}
      disabled={generando}
      style={{ marginTop: 8 }}
    >
      Enviar por WhatsApp o email
    </button>
  );

  if (pagado) {
    return (
      <div className="descarga">
        <h2 className="bloque__titulo">Descargar</h2>
        <p className="oferta__nota" style={{ marginBottom: 14 }}>
          {plan === "suscripcion"
            ? "Suscripción activa: todos tus presupuestos salen sin marca de agua."
            : "Este presupuesto está pagado. Descárgalo limpio las veces que quieras."}
        </p>
        <button
          type="button"
          className="boton boton--primario boton--ancho"
          onClick={onDescargar}
          disabled={generando}
        >
          {generando ? "Generando PDF…" : "Descargar PDF"}
        </button>
        {botonCompartir}
        {error && <div className="aviso aviso--error">{error}</div>}

        {plan === "suscripcion" && licencia && (
          <button
            type="button"
            className="boton boton--texto"
            style={{ marginTop: 10, padding: 0 }}
            onClick={() => {
              abrirPortal(licencia).catch((e) =>
                setErrorPago(e instanceof Error ? e.message : "No se ha podido abrir la gestión."),
              );
            }}
          >
            Gestionar o cancelar la suscripción
          </button>
        )}
        {errorPago && <div className="aviso aviso--error">{errorPago}</div>}
      </div>
    );
  }

  return (
    <div className="descarga">
      <h2 className="bloque__titulo">Descargar</h2>

      <button
        type="button"
        className="boton boton--fantasma boton--ancho"
        onClick={onDescargar}
        disabled={generando}
      >
        {generando ? "Generando PDF…" : "Descargar gratis (con marca de agua)"}
      </button>
      {botonCompartir}

      {error && <div className="aviso aviso--error">{error}</div>}

      <div className="descarga__opciones">
        <div className="oferta oferta--destacada">
          <span className="oferta__sello">Más elegido</span>
          <div className="oferta__precio">{SITIO.precioUnico} €</div>
          <div className="oferta__nota">
            <strong>Este presupuesto</strong> sin marca de agua, con descargas
            ilimitadas. Pago único, sin crear cuenta.
          </div>
          <button
            type="button"
            className="boton boton--primario"
            onClick={() => pagar("unico")}
            disabled={yendoAPagar !== null}
          >
            {yendoAPagar === "unico" ? "Abriendo el pago…" : "Quitar la marca"}
          </button>
        </div>

        <div className="oferta">
          <div className="oferta__precio">
            {SITIO.precioSuscripcion} €
            <span style={{ fontSize: 14, color: "var(--gris)" }}>/mes</span>
          </div>
          <div className="oferta__nota">
            <strong>Todos</strong> tus presupuestos sin marca. Sale a cuenta desde
            el tercero del mes. Cancelas cuando quieras.
          </div>
          <button
            type="button"
            className="boton boton--fantasma"
            onClick={() => pagar("suscripcion")}
            disabled={yendoAPagar !== null}
          >
            {yendoAPagar === "suscripcion" ? "Abriendo el pago…" : "Suscribirme"}
          </button>
        </div>
      </div>

      {errorPago && <div className="aviso aviso--error">{errorPago}</div>}

      <Recuperar />

      <p style={{ fontSize: 12.5, color: "var(--gris-claro)", marginBottom: 0, lineHeight: 1.5 }}>
        Tus presupuestos se guardan solo en este navegador. Al comprar la descarga
        sin marca, el presupuesto se envía a nuestro servidor para generarlo y no
        se conserva allí.
      </p>
    </div>
  );
}
