import { Fragment } from "react";
import {
  agruparPorCapitulo,
  calcular,
  cantidad,
  euros,
  fechaLarga,
  fechaValidez,
  importeLinea,
  mostrarSubtotal,
  tieneCapitulos,
} from "../calc";
import type { Presupuesto } from "../types";

interface VistaProps {
  presupuesto: Presupuesto;
  conMarcaDeAgua: boolean;
}

export function Vista({ presupuesto: p, conMarcaDeAgua }: VistaProps) {
  const totales = calcular(p);
  const grupos = agruparPorCapitulo(p.lineas);
  const conCapitulos = tieneCapitulos(grupos);
  const vacio = grupos.length === 0;

  const datosEmisor = [
    p.emisor.nif && `NIF ${p.emisor.nif}`,
    p.emisor.direccion,
    p.emisor.telefono,
    p.emisor.email,
    p.emisor.web,
  ].filter(Boolean) as string[];

  const datosCliente = [
    p.cliente.nif && `NIF ${p.cliente.nif}`,
    p.cliente.direccion,
    p.cliente.telefono,
    p.cliente.email,
  ].filter(Boolean) as string[];

  return (
    <div
      className={`hoja hoja--${p.plantilla}`}
      style={{ ["--doc-acento" as string]: p.color }}
    >
      <div className="hoja__filete" />

      {conMarcaDeAgua && (
        <div className="hoja__marca" aria-hidden="true">
          <span>PLOMADA · VERSIÓN GRATUITA</span>
        </div>
      )}

      <header className="hoja__cabecera">
        <div>
          {p.emisor.logo ? (
            <img className="hoja__logo" src={p.emisor.logo} alt="" />
          ) : (
            <div className="hoja__emisor">
              {p.emisor.nombre || <span className="hoja__vacia">Tu empresa</span>}
            </div>
          )}
        </div>
        <div className="hoja__meta">
          <div className="hoja__tipo">PRESUPUESTO</div>
          <div className="hoja__numero">Nº {p.numero}</div>
          <div className="hoja__fecha">{fechaLarga(p.fecha)}</div>
          <div className="hoja__fecha">
            Válido hasta el {fechaValidez(p.fecha, p.validezDias)}
          </div>
        </div>
      </header>

      <div className="hoja__partes">
        <div>
          <div className="hoja__rotulo">De</div>
          <div className="hoja__parte-nombre">
            {p.emisor.nombre || <span className="hoja__vacia">Sin completar</span>}
          </div>
          {datosEmisor.map((dato) => (
            <div className="hoja__parte-dato" key={dato}>
              {dato}
            </div>
          ))}
        </div>
        <div>
          <div className="hoja__rotulo">Para</div>
          <div className="hoja__parte-nombre">
            {p.cliente.nombre || <span className="hoja__vacia">Sin completar</span>}
          </div>
          {datosCliente.map((dato) => (
            <div className="hoja__parte-dato" key={dato}>
              {dato}
            </div>
          ))}
        </div>
      </div>

      {p.titulo && <div className="hoja__asunto">{p.titulo}</div>}

      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>IVA</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {vacio && (
            <tr>
              <td colSpan={5} className="hoja__vacia" style={{ textAlign: "left" }}>
                Añade tu primer concepto y aparecerá aquí.
              </td>
            </tr>
          )}

          {grupos.map((grupo, indice) => (
            <Fragment key={`${grupo.capitulo}-${indice}`}>
              {conCapitulos && grupo.capitulo && (
                <tr className="hoja__capitulo">
                  <td colSpan={5}>{grupo.capitulo}</td>
                </tr>
              )}

              {grupo.lineas.map((linea) => (
                <tr key={linea.id} className={linea.opcional ? "hoja__fila--opcional" : undefined}>
                  <td>
                    <div className="hoja__concepto">
                      {linea.concepto || "—"}
                      {linea.opcional && <span className="hoja__etiqueta">Opcional</span>}
                    </div>
                    {linea.descripcion && (
                      <div className="hoja__descripcion">{linea.descripcion}</div>
                    )}
                  </td>
                  <td>
                    {cantidad(linea.cantidad)} {linea.unidad}
                  </td>
                  <td>{euros(linea.precio)}</td>
                  <td>{linea.iva} %</td>
                  <td>{euros(importeLinea(linea))}</td>
                </tr>
              ))}

              {conCapitulos && mostrarSubtotal(grupo) && (
                <tr className="hoja__subtotal">
                  <td colSpan={4}>Subtotal {grupo.capitulo}</td>
                  <td>{euros(grupo.subtotal)}</td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      <div className="hoja__totales">
        <div className="hoja__fila-total">
          <span>Subtotal</span>
          <span>{euros(totales.subtotal)}</span>
        </div>
        {totales.descuento > 0 && (
          <>
            <div className="hoja__fila-total">
              <span>Descuento ({p.descuento} %)</span>
              <span>− {euros(totales.descuento)}</span>
            </div>
            <div className="hoja__fila-total hoja__fila-total--fuerte">
              <span>Base imponible</span>
              <span>{euros(totales.base)}</span>
            </div>
          </>
        )}
        {totales.tramos.map((tramo) => (
          <div className="hoja__fila-total" key={tramo.tipo}>
            <span>
              IVA {tramo.tipo} % s/ {euros(tramo.base)}
            </span>
            <span>{euros(tramo.cuota)}</span>
          </div>
        ))}
        {totales.retencion > 0 && (
          <div className="hoja__fila-total">
            <span>Retención IRPF ({p.irpf} %)</span>
            <span>− {euros(totales.retencion)}</span>
          </div>
        )}
        <div className="hoja__gran-total">
          <span>TOTAL</span>
          <span>{euros(totales.total)}</span>
        </div>

        {totales.anticipo > 0 && (
          <div className="hoja__extras">
            <div className="hoja__fila-total">
              <span>Anticipo al aceptar ({p.anticipo} %)</span>
              <strong>{euros(totales.anticipo)}</strong>
            </div>
            <div className="hoja__fila-total">
              <span>Resto a la entrega</span>
              <strong>{euros(totales.resto)}</strong>
            </div>
          </div>
        )}

        {totales.opcionales > 0 && (
          <div className="hoja__extras">
            <div className="hoja__fila-total">
              <span>Mejoras opcionales, IVA incluido</span>
              <strong>+ {euros(totales.opcionales)}</strong>
            </div>
          </div>
        )}
      </div>

      {p.notas.trim() && (
        <div className="hoja__parrafo">
          <div className="hoja__rotulo">Notas</div>
          <p>{p.notas}</p>
        </div>
      )}

      {p.condiciones.trim() && (
        <div className="hoja__parrafo">
          <div className="hoja__rotulo">Condiciones</div>
          <p>{p.condiciones}</p>
        </div>
      )}

      <div className="hoja__parrafo">
        <div className="hoja__rotulo">Aceptación del presupuesto</div>
      </div>
      <div className="hoja__firmas">
        <div className="hoja__firma">Firma del cliente</div>
        <div className="hoja__firma">Fecha</div>
      </div>
    </div>
  );
}
