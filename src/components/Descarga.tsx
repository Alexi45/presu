import { useState } from "react";
import { SITIO } from "../contenido";
import { iniciarPago } from "../licencia";
import type { Plan } from "../licencia";

interface DescargaProps {
  /** ¿Está pagado este presupuesto concreto? */
  pagado: boolean;
  plan: Plan | null;
  presupuestoId: string;
  generando: boolean;
  error: string | null;
  puedeCompartir: boolean;
  onDescargar: () => void;
  onCompartir: () => void;
}

export function Descarga({
  pagado,
  plan,
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

      <p style={{ fontSize: 12.5, color: "var(--gris-claro)", marginBottom: 0, lineHeight: 1.5 }}>
        Tus presupuestos se guardan solo en este navegador. Al comprar la descarga
        sin marca, el presupuesto se envía a nuestro servidor para generarlo y no
        se conserva allí.
      </p>
    </div>
  );
}
