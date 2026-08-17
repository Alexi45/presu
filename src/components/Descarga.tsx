import { SITIO } from "../contenido";
import { enlaceDePago, pagoConfigurado } from "../licencia";
import type { Plan } from "../licencia";

interface DescargaProps {
  tieneLicencia: boolean;
  generando: boolean;
  error: string | null;
  puedeCompartir: boolean;
  onDescargar: () => void;
  onCompartir: () => void;
}

export function Descarga({
  tieneLicencia,
  generando,
  error,
  puedeCompartir,
  onDescargar,
  onCompartir,
}: DescargaProps) {
  const irAPagar = (plan: Plan) => {
    const enlace = enlaceDePago(plan);
    if (!enlace) return;
    window.location.href = enlace;
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

  if (tieneLicencia) {
    return (
      <div className="descarga">
        <h2 className="bloque__titulo">Descargar</h2>
        <p className="oferta__nota" style={{ marginBottom: 14 }}>
          Tu presupuesto sale limpio, sin marcas. Puedes descargar los que quieras
          desde este navegador.
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
            Quita la marca de agua. Pago único, sin cuenta ni suscripción.
          </div>
          <button
            type="button"
            className="boton boton--primario"
            onClick={() => irAPagar("unico")}
            disabled={!enlaceDePago("unico")}
          >
            Quitar la marca
          </button>
        </div>

        <div className="oferta">
          <div className="oferta__precio">
            {SITIO.precioSuscripcion} €
            <span style={{ fontSize: 14, color: "var(--gris)" }}>/mes</span>
          </div>
          <div className="oferta__nota">
            Presupuestos ilimitados sin marca. Para quien manda varios al mes.
          </div>
          <button
            type="button"
            className="boton boton--fantasma"
            onClick={() => irAPagar("suscripcion")}
            disabled={!enlaceDePago("suscripcion")}
          >
            Ver el plan
          </button>
        </div>
      </div>

      {!pagoConfigurado() && (
        <div className="aviso aviso--error">
          El cobro todavía no está conectado. Crea los enlaces de pago en Stripe y
          ponlos en <code>.env.local</code> como <code>VITE_PAGO_UNICO_URL</code> y{" "}
          <code>VITE_SUSCRIPCION_URL</code>.
        </div>
      )}

      <p style={{ fontSize: 12.5, color: "var(--gris-claro)", marginBottom: 0, lineHeight: 1.5 }}>
        Tus presupuestos se guardan solo en este navegador, nunca en un servidor.
        Descarga el PDF de los que quieras conservar.
      </p>
    </div>
  );
}
