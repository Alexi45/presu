import { useEffect, useRef, useState } from "react";
import { calcular, euros } from "../calc";
import type { Presupuesto } from "../types";

interface DocumentosProps {
  documentos: Presupuesto[];
  actual: string;
  onAbrir: (id: string) => void;
  onNuevo: () => void;
  onDuplicar: () => void;
  onBorrar: (id: string) => void;
  onExportar: () => void;
  onImportar: (archivo: File) => void;
}

export function Documentos({
  documentos,
  actual,
  onAbrir,
  onNuevo,
  onDuplicar,
  onBorrar,
  onExportar,
  onImportar,
}: DocumentosProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const archivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alPulsarFuera = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alEscapar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", alPulsarFuera);
    document.addEventListener("keydown", alEscapar);
    return () => {
      document.removeEventListener("mousedown", alPulsarFuera);
      document.removeEventListener("keydown", alEscapar);
    };
  }, [abierto]);

  return (
    <div className="desplegable" ref={contenedor}>
      <button
        type="button"
        className="boton boton--fantasma"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
      >
        <span className="solo-escritorio">Mis presupuestos</span>
        <span className="solo-movil">Guardados</span>
        <span aria-hidden="true">{abierto ? "▴" : "▾"}</span>
      </button>

      {abierto && (
        <div className="panel">
          {documentos.length === 0 && (
            <p className="panel__vacio">Todavía no has guardado ningún presupuesto.</p>
          )}

          {documentos.map((documento) => (
            <div className="panel__fila" key={documento.id}>
              <button
                type="button"
                className="documento"
                aria-current={documento.id === actual}
                onClick={() => {
                  onAbrir(documento.id);
                  setAbierto(false);
                }}
              >
                <div className="documento__datos">
                  <div className="documento__titulo">
                    {documento.titulo || documento.cliente.nombre || "Sin título"}
                  </div>
                  <div className="documento__meta">
                    Nº {documento.numero} ·{" "}
                    {new Date(documento.actualizado).toLocaleDateString("es-ES")}
                  </div>
                </div>
                <span className="documento__importe">
                  {euros(calcular(documento).total)}
                </span>
              </button>
              <button
                type="button"
                className="icono-boton"
                aria-label={`Borrar el presupuesto ${documento.numero}`}
                onClick={() => onBorrar(documento.id)}
              >
                ✕
              </button>
            </div>
          ))}

          <div className="panel__acciones">
            <button
              type="button"
              className="boton boton--primario"
              style={{ flex: 1 }}
              onClick={() => {
                onNuevo();
                setAbierto(false);
              }}
            >
              Nuevo
            </button>
            <button
              type="button"
              className="boton boton--fantasma"
              style={{ flex: 1 }}
              onClick={() => {
                onDuplicar();
                setAbierto(false);
              }}
            >
              Duplicar este
            </button>
          </div>

          <div className="panel__copia">
            <p>
              Tus presupuestos viven solo en este navegador. Descarga una copia
              de vez en cuando.
            </p>
            <div className="panel__acciones" style={{ border: 0, margin: 0, padding: 0 }}>
              <button
                type="button"
                className="boton boton--fantasma"
                style={{ flex: 1 }}
                onClick={onExportar}
              >
                Guardar copia
              </button>
              <button
                type="button"
                className="boton boton--fantasma"
                style={{ flex: 1 }}
                onClick={() => archivo.current?.click()}
              >
                Restaurar
              </button>
            </div>
            <input
              ref={archivo}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const elegido = e.target.files?.[0];
                if (elegido) onImportar(elegido);
                e.target.value = "";
                setAbierto(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
