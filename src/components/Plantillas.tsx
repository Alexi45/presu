import { OFICIOS } from "../oficios";
import type { Oficio } from "../oficios";

interface PlantillasProps {
  onElegir: (oficio: Oficio) => void;
}

/**
 * El problema real de este usuario no es calcular el IVA: es la página en
 * blanco. Empezar con las partidas típicas de su oficio es lo que convierte
 * "esto lo miro luego" en un presupuesto terminado.
 */
export function Plantillas({ onElegir }: PlantillasProps) {
  return (
    <section className="bloque">
      <h2 className="bloque__titulo">Empieza con una plantilla</h2>
      <p
        style={{
          margin: "-6px 0 14px",
          fontSize: 13.5,
          color: "var(--gris)",
          lineHeight: 1.5,
        }}
      >
        Carga las partidas típicas de tu oficio y cámbialas a tu gusto. Sustituye
        lo que tengas escrito ahora.
      </p>
      <div className="oficios">
        {OFICIOS.map((oficio) => (
          <button
            key={oficio.slug}
            type="button"
            className="oficio"
            onClick={() => onElegir(oficio)}
          >
            <span aria-hidden="true">{oficio.emoji}</span>
            {oficio.nombre}
          </button>
        ))}
      </div>
    </section>
  );
}
