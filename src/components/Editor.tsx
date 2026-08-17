import { euros, importeLinea } from "../calc";
import { IRPF_DISPONIBLES, IVA_DISPONIBLES, UNIDADES, nuevaLinea } from "../types";
import type { Cliente, Emisor, Linea, Plantilla, Presupuesto, TipoIva } from "../types";
import { CampoCheck, CampoNumero, CampoSelect, CampoSugerencias, CampoTexto } from "./Campo";

const COLORES = ["#E2582B", "#1A6FE0", "#1F8A5F", "#7A3FC4", "#1A2027", "#C4184B"];

const TAM_MAXIMO_LOGO = 1_500_000;

interface EditorProps {
  presupuesto: Presupuesto;
  clientes: Cliente[];
  actualizar: (cambios: Partial<Presupuesto>) => void;
}

export function Editor({ presupuesto: p, clientes, actualizar }: EditorProps) {
  const actualizarEmisor = (cambios: Partial<Emisor>) =>
    actualizar({ emisor: { ...p.emisor, ...cambios } });

  const actualizarCliente = (cambios: Partial<Cliente>) =>
    actualizar({ cliente: { ...p.cliente, ...cambios } });

  /**
   * Al escribir (o elegir de la lista) el nombre de un cliente ya usado, se
   * rellena el resto de la ficha. Es el ahorro de tiempo más evidente para
   * quien trabaja siempre con los mismos clientes.
   */
  const escribirNombreCliente = (nombre: string) => {
    const conocido = clientes.find(
      (c) => c.nombre.trim().toLowerCase() === nombre.trim().toLowerCase(),
    );
    actualizar({ cliente: conocido ? { ...conocido } : { ...p.cliente, nombre } });
  };

  const actualizarLinea = (id: string, cambios: Partial<Linea>) =>
    actualizar({
      lineas: p.lineas.map((l) => (l.id === id ? { ...l, ...cambios } : l)),
    });

  const eliminarLinea = (id: string) => {
    const restantes = p.lineas.filter((l) => l.id !== id);
    actualizar({ lineas: restantes.length ? restantes : [nuevaLinea()] });
  };

  const duplicarLinea = (indice: number) => {
    const copia = [...p.lineas];
    copia.splice(indice + 1, 0, { ...p.lineas[indice], id: crypto.randomUUID() });
    actualizar({ lineas: copia });
  };

  const moverLinea = (indice: number, direccion: -1 | 1) => {
    const destino = indice + direccion;
    if (destino < 0 || destino >= p.lineas.length) return;
    const copia = [...p.lineas];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    actualizar({ lineas: copia });
  };

  // Sugerencias del propio presupuesto: lo normal es repetir los capítulos que
  // ya has escrito, no inventar uno nuevo en cada partida.
  const capitulosUsados = [
    ...new Set(p.lineas.map((l) => l.capitulo.trim()).filter(Boolean)),
  ];

  const cargarLogo = (archivo: File | undefined) => {
    if (!archivo) return;
    if (archivo.size > TAM_MAXIMO_LOGO) {
      alert("El logotipo es demasiado grande. Usa una imagen de menos de 1,5 MB.");
      return;
    }
    const lector = new FileReader();
    lector.onload = () => actualizarEmisor({ logo: String(lector.result) });
    lector.readAsDataURL(archivo);
  };

  return (
    <div>
      <section className="bloque">
        <h2 className="bloque__titulo">Tus datos</h2>
        <div className="rejilla rejilla--2">
          <CampoTexto
            etiqueta="Nombre o empresa"
            valor={p.emisor.nombre}
            onChange={(v) => actualizarEmisor({ nombre: v })}
            placeholder="Reformas Molina S.L."
          />
          <CampoTexto
            etiqueta="NIF / CIF"
            valor={p.emisor.nif}
            onChange={(v) => actualizarEmisor({ nif: v })}
            placeholder="B12345678"
          />
        </div>
        <div className="rejilla" style={{ marginTop: 12 }}>
          <CampoTexto
            etiqueta="Dirección"
            valor={p.emisor.direccion}
            onChange={(v) => actualizarEmisor({ direccion: v })}
            placeholder={"C/ Mayor 14, 2º B\n28013 Madrid"}
            filas={2}
          />
        </div>
        <div className="rejilla rejilla--3" style={{ marginTop: 12 }}>
          <CampoTexto
            etiqueta="Teléfono"
            valor={p.emisor.telefono}
            onChange={(v) => actualizarEmisor({ telefono: v })}
            tipo="tel"
            placeholder="600 123 456"
          />
          <CampoTexto
            etiqueta="Email"
            valor={p.emisor.email}
            onChange={(v) => actualizarEmisor({ email: v })}
            tipo="email"
            placeholder="hola@tuempresa.es"
          />
          <CampoTexto
            etiqueta="Web"
            valor={p.emisor.web}
            onChange={(v) => actualizarEmisor({ web: v })}
            placeholder="tuempresa.es"
          />
        </div>

        <div className="campo" style={{ marginTop: 14 }}>
          <span className="campo__etiqueta">Logotipo</span>
          {p.emisor.logo ? (
            <div className="logo-cargado">
              <img src={p.emisor.logo} alt="Logotipo cargado" />
              <button
                type="button"
                className="boton boton--texto"
                onClick={() => actualizarEmisor({ logo: null })}
              >
                Quitar
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => cargarLogo(e.target.files?.[0])}
            />
          )}
        </div>
      </section>

      <section className="bloque">
        <h2 className="bloque__titulo">Cliente</h2>
        <div className="rejilla rejilla--2">
          <CampoSugerencias
            etiqueta="Nombre del cliente"
            valor={p.cliente.nombre}
            lista="clientes"
            sugerencias={clientes.map((c) => c.nombre)}
            onChange={escribirNombreCliente}
          />
          <CampoTexto
            etiqueta="NIF / CIF"
            valor={p.cliente.nif}
            onChange={(v) => actualizarCliente({ nif: v })}
            placeholder="12345678Z"
          />
        </div>
        <div className="rejilla" style={{ marginTop: 12 }}>
          <CampoTexto
            etiqueta="Dirección"
            valor={p.cliente.direccion}
            onChange={(v) => actualizarCliente({ direccion: v })}
            placeholder={"Av. de la Constitución 8\n28660 Boadilla del Monte"}
            filas={2}
          />
        </div>
        <div className="rejilla rejilla--2" style={{ marginTop: 12 }}>
          <CampoTexto
            etiqueta="Teléfono"
            valor={p.cliente.telefono}
            onChange={(v) => actualizarCliente({ telefono: v })}
            tipo="tel"
          />
          <CampoTexto
            etiqueta="Email"
            valor={p.cliente.email}
            onChange={(v) => actualizarCliente({ email: v })}
            tipo="email"
          />
        </div>
      </section>

      <section className="bloque">
        <h2 className="bloque__titulo">El presupuesto</h2>
        <div className="rejilla rejilla--3">
          <CampoTexto
            etiqueta="Número"
            valor={p.numero}
            onChange={(v) => actualizar({ numero: v })}
          />
          <CampoTexto
            etiqueta="Fecha"
            valor={p.fecha}
            onChange={(v) => actualizar({ fecha: v })}
            tipo="date"
          />
          <CampoNumero
            etiqueta="Validez (días)"
            valor={p.validezDias}
            onChange={(v) => actualizar({ validezDias: Math.max(1, Math.round(v)) })}
            min={1}
          />
        </div>
        <div className="rejilla" style={{ marginTop: 12 }}>
          <CampoTexto
            etiqueta="Asunto del trabajo"
            valor={p.titulo}
            onChange={(v) => actualizar({ titulo: v })}
            placeholder="Reforma de baño principal"
          />
        </div>
      </section>

      <section className="bloque">
        <h2 className="bloque__titulo">Conceptos</h2>

        {p.lineas.map((linea, indice) => (
          <div className="linea" key={linea.id}>
            <div className="linea__cabecera">
              <span className="linea__indice">{String(indice + 1).padStart(2, "0")}</span>
              <button
                type="button"
                className="icono-boton"
                onClick={() => moverLinea(indice, -1)}
                disabled={indice === 0}
                aria-label="Subir concepto"
              >
                ↑
              </button>
              <button
                type="button"
                className="icono-boton"
                onClick={() => moverLinea(indice, 1)}
                disabled={indice === p.lineas.length - 1}
                aria-label="Bajar concepto"
              >
                ↓
              </button>
              <span className="linea__importe">{euros(importeLinea(linea))}</span>
              <button
                type="button"
                className="icono-boton"
                onClick={() => duplicarLinea(indice)}
                aria-label="Duplicar concepto"
                title="Duplicar"
              >
                ⧉
              </button>
              <button
                type="button"
                className="icono-boton"
                onClick={() => eliminarLinea(linea.id)}
                aria-label="Eliminar concepto"
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <CampoSugerencias
                etiqueta="Capítulo (opcional)"
                valor={linea.capitulo}
                lista="capitulos"
                sugerencias={capitulosUsados}
                onChange={(v) => actualizarLinea(linea.id, { capitulo: v })}
              />
            </div>

            <CampoTexto
              etiqueta="Concepto"
              valor={linea.concepto}
              onChange={(v) => actualizarLinea(linea.id, { concepto: v })}
              placeholder="Alicatado y solado"
            />
            <div style={{ marginTop: 10 }}>
              <CampoTexto
                etiqueta="Descripción (opcional)"
                valor={linea.descripcion}
                onChange={(v) => actualizarLinea(linea.id, { descripcion: v })}
                placeholder="Detalla materiales, medidas o lo que incluye. Cuanto más claro, menos discusiones después."
                filas={2}
              />
            </div>
            <div className="linea__numeros">
              <CampoNumero
                etiqueta="Cantidad"
                valor={linea.cantidad}
                onChange={(v) => actualizarLinea(linea.id, { cantidad: v })}
                paso={0.5}
              />
              <CampoSugerencias
                etiqueta="Unidad"
                valor={linea.unidad}
                lista="unidades"
                sugerencias={UNIDADES}
                onChange={(v) => actualizarLinea(linea.id, { unidad: v })}
              />
              <CampoNumero
                etiqueta="Precio unidad"
                valor={linea.precio}
                onChange={(v) => actualizarLinea(linea.id, { precio: v })}
                paso={0.01}
              />
              <CampoSelect<TipoIva>
                etiqueta="IVA"
                valor={linea.iva}
                opciones={IVA_DISPONIBLES.map((t) => ({ valor: t, etiqueta: `${t} %` }))}
                onChange={(v) => actualizarLinea(linea.id, { iva: v })}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <CampoCheck
                etiqueta="Partida opcional"
                ayuda="Se muestra como mejora, pero no suma al total"
                valor={linea.opcional}
                onChange={(v) => actualizarLinea(linea.id, { opcional: v })}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="boton boton--fantasma boton--ancho"
          onClick={() => actualizar({ lineas: [...p.lineas, nuevaLinea()] })}
        >
          + Añadir concepto
        </button>
      </section>

      <section className="bloque">
        <h2 className="bloque__titulo">Ajustes finales</h2>
        <div className="rejilla rejilla--2">
          <CampoNumero
            etiqueta="Descuento global (%)"
            valor={p.descuento}
            onChange={(v) => actualizar({ descuento: Math.min(100, Math.max(0, v)) })}
            max={100}
            paso={0.5}
          />
          <CampoNumero
            etiqueta="Anticipo al aceptar (%)"
            valor={p.anticipo}
            onChange={(v) => actualizar({ anticipo: Math.min(100, Math.max(0, v)) })}
            max={100}
            paso={5}
          />
          <CampoSelect<number>
            etiqueta="Retención IRPF"
            valor={p.irpf}
            opciones={IRPF_DISPONIBLES.map((o) => ({ valor: o.valor, etiqueta: o.etiqueta }))}
            onChange={(v) => actualizar({ irpf: v })}
          />
        </div>
        <div className="rejilla" style={{ marginTop: 12 }}>
          <CampoTexto
            etiqueta="Notas"
            valor={p.notas}
            onChange={(v) => actualizar({ notas: v })}
            placeholder="Plazo de ejecución, forma de pago, qué no incluye…"
            filas={3}
          />
          <CampoTexto
            etiqueta="Condiciones"
            valor={p.condiciones}
            onChange={(v) => actualizar({ condiciones: v })}
            filas={3}
          />
        </div>

        <div className="rejilla rejilla--2" style={{ marginTop: 14 }}>
          <CampoSelect<Plantilla>
            etiqueta="Estilo del documento"
            valor={p.plantilla}
            opciones={[
              { valor: "moderna", etiqueta: "Moderno" },
              { valor: "clasica", etiqueta: "Clásico" },
              { valor: "minimal", etiqueta: "Minimal" },
            ]}
            onChange={(v) => actualizar({ plantilla: v })}
          />
          <div className="campo">
            <span className="campo__etiqueta">Color del documento</span>
            <div className="colores">
              {COLORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="color"
                  style={{ background: c }}
                  aria-pressed={p.color === c}
                  aria-label={`Color ${c}`}
                  onClick={() => actualizar({ color: c })}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
