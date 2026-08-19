import { CLAVES, FAQ, PASOS } from "../contenido";
import { GUIAS } from "../guias";
import { OFICIOS } from "../oficios";

/**
 * Contenido bajo la herramienta. Está aquí por SEO — es lo que da a Google algo
 * que indexar de una página que, si no, sería solo un formulario — pero se
 * escribe para que sea útil de leer, no para rellenar.
 */
export function Contenido() {
  return (
    <>
      <div className="contenido">
        <div className="contenido__interior">
          <section>
            <h2>Cómo hacer un presupuesto en dos minutos</h2>
            <p>
              PresupPRO es una herramienta para autónomos y gremios que necesitan
              mandar un presupuesto con buena pinta sin pelearse con el Word ni
              pagar un programa de facturación entero. Se rellena arriba, se ve
              el resultado en vivo y se descarga en PDF.
            </p>
            <ol className="pasos">
              {PASOS.map((paso, indice) => (
                <li key={paso.titulo}>
                  <span className="paso__numero">PASO {indice + 1}</span>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.texto}</p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2>Qué debe llevar un presupuesto</h2>
            <p>
              La diferencia entre un presupuesto que se acepta y uno que se queda
              sin contestar casi nunca es el precio: es lo claro que queda qué
              vas a hacer exactamente por ese dinero.
            </p>
            {CLAVES.map((clave) => (
              <div key={clave.titulo} style={{ marginBottom: 20 }}>
                <h3>{clave.titulo}</h3>
                <p>{clave.texto}</p>
              </div>
            ))}
          </section>

          <section>
            <h2>Plantillas por oficio</h2>
            <p>
              Cada plantilla trae las partidas típicas de su oficio, con
              unidades y descripciones ya escritas, para que solo tengas que
              cambiar las cantidades y los precios.
            </p>
            <ul className="enlaces-oficios">
              {OFICIOS.map((oficio) => (
                <li key={oficio.slug}>
                  <a href={`/presupuesto-${oficio.slug}/`}>
                    <span aria-hidden="true">{oficio.emoji}</span>
                    Presupuesto de {oficio.nombre.toLowerCase()}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Guías</h2>
            <p>
              Las dudas que salen al hacer un presupuesto, explicadas sin
              rodeos: qué IVA aplicar, cuándo lleva retención una factura y qué
              tiene que decir el documento para que no haya discusiones.
            </p>
            <ul className="enlaces-oficios">
              {GUIAS.map((guia) => (
                <li key={guia.slug}>
                  <a href={`/guias/${guia.slug}/`}>{guia.h1}</a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Preguntas frecuentes</h2>
            <div className="faq">
              {FAQ.map((item) => (
                <details key={item.pregunta}>
                  <summary>{item.pregunta}</summary>
                  <p>{item.respuesta}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer className="pie">
        <div className="pie__interior">
          <strong style={{ color: "var(--tinta)" }}>PresupPRO</strong>
          <span>Presupuestos en PDF para autónomos y gremios.</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
            <a href="/guias/">Guías</a>
            <a href="/aviso-legal/">Aviso legal</a>
            <a href="/privacidad/">Privacidad</a>
            <a href="/condiciones/">Condiciones</a>
          </span>
        </div>
      </footer>
    </>
  );
}
