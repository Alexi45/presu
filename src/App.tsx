import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Contenido } from "./components/Contenido";
import { Descarga } from "./components/Descarga";
import { Documentos } from "./components/Documentos";
import { Editor } from "./components/Editor";
import { Plantillas } from "./components/Plantillas";
import { Vista } from "./components/Vista";
import {
  descargarPdfLimpio,
  leerLicencias,
  licenciaPara,
  medirLogo,
  recogerPagoDeLaUrl,
  renovarSuscripcion,
  suscripcionActiva,
} from "./licencia";
import type { Licencia } from "./licencia";
import { aplicarOficio, buscarOficio } from "./oficios";
import type { Oficio } from "./oficios";
import {
  borrarDocumento,
  cargarDocumentos,
  duplicar,
  emisorGuardado,
  exportarCopia,
  fijarActual,
  guardarCliente,
  guardarDocumento,
  guardarEmisor,
  clientesGuardados,
  idActual,
  importarCopia,
  nombreArchivoCopia,
  siguienteNumero,
} from "./storage";
import { presupuestoEjemplo, presupuestoVacio } from "./types";
import { nombreArchivo } from "./nombres";
import type { Presupuesto } from "./types";

type Pestana = "editar" | "vista";

/** Presupuesto de arranque: el último abierto, o uno nuevo con los datos ya conocidos del emisor. */
function estadoInicial(): { documentos: Presupuesto[]; actual: Presupuesto } {
  const documentos = cargarDocumentos();
  const oficio = buscarOficio(new URLSearchParams(window.location.search).get("oficio"));

  if (oficio) {
    // Sin limpiar el parámetro, cada recarga crearía otro presupuesto en blanco
    // y se perdería lo que el usuario llevara escrito.
    limpiarParametro("oficio");
    const nuevo = conEmisorConocido(nuevoPresupuesto(documentos));
    return { documentos, actual: aplicarOficio(nuevo, oficio) };
  }

  const guardado = documentos.find((d) => d.id === idActual()) ?? documentos[0];
  if (guardado) return { documentos, actual: guardado };

  const nuevo = conEmisorConocido(nuevoPresupuesto(documentos));
  return { documentos, actual: nuevo };
}

function limpiarParametro(nombre: string): void {
  const params = new URLSearchParams(window.location.search);
  params.delete(nombre);
  const resto = params.toString();
  window.history.replaceState({}, "", window.location.pathname + (resto ? `?${resto}` : ""));
}

function nuevoPresupuesto(documentos: Presupuesto[]): Presupuesto {
  return { ...presupuestoVacio(), numero: siguienteNumero(documentos) };
}

function conEmisorConocido(p: Presupuesto): Presupuesto {
  const emisor = emisorGuardado();
  return emisor ? { ...p, emisor } : p;
}

export default function App() {
  const inicial = useRef(estadoInicial());
  const [documentos, setDocumentos] = useState(inicial.current.documentos);
  const [presupuesto, setPresupuesto] = useState<Presupuesto>(inicial.current.actual);

  const [licencias, setLicencias] = useState<Licencia[]>(() => leerLicencias());
  const [pestana, setPestana] = useState<Pestana>("editar");
  const [guardado, setGuardado] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [clientes, setClientes] = useState(() => clientesGuardados());
  const temporizador = useRef<number | undefined>(undefined);

  // Autoguardado con retardo: escribir en cada tecla es innecesario y en
  // presupuestos largos se nota.
  useEffect(() => {
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => {
      const sellado = { ...presupuesto, actualizado: Date.now() };
      const seGuardo = guardarDocumento(sellado);
      guardarEmisor(sellado.emisor);
      guardarCliente(sellado.cliente);
      setDocumentos(cargarDocumentos());
      setClientes(clientesGuardados());
      setGuardado(seGuardo);
      setError(
        seGuardo
          ? null
          : "No se ha podido guardar: el navegador está sin espacio. Descarga una " +
              "copia de seguridad desde «Mis presupuestos» y borra los que ya no uses.",
      );
    }, 700);
    return () => window.clearTimeout(temporizador.current);
  }, [presupuesto]);

  useEffect(() => {
    if (!guardado) return;
    const id = window.setTimeout(() => setGuardado(false), 2000);
    return () => window.clearTimeout(id);
  }, [guardado]);

  // Vuelta de la pasarela: se cambia el identificador de sesión por una
  // licencia firmada, preguntando a Stripe si el cobro consta de verdad.
  useEffect(() => {
    let cancelado = false;
    recogerPagoDeLaUrl()
      .then((todas) => {
        if (cancelado || !todas) return;
        setLicencias(todas);
        setAviso(
          todas.some((l) => l.plan === "suscripcion")
            ? "Suscripción activa. Todos tus presupuestos salen sin marca de agua."
            : "Acceso confirmado. Tus presupuestos pagados se descargan sin marca de agua.",
        );
      })
      .catch((e) => {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : "No se ha podido confirmar el pago.");
        }
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // La suscripción se revalida contra Stripe cuando el testigo está por caducar.
  useEffect(() => {
    const suscripcion = suscripcionActiva(licencias);
    if (!suscripcion) return;
    if (suscripcion.exp - Date.now() > 3 * 24 * 60 * 60 * 1000) return;
    renovarSuscripcion(suscripcion)
      .then(setLicencias)
      .catch(() => {
        // Si la suscripción ya no está activa, la licencia caducará sola.
      });
  }, [licencias]);

  const actualizar = useCallback((cambios: Partial<Presupuesto>) => {
    setPresupuesto((anterior) => ({ ...anterior, ...cambios }));
  }, []);

  /** La licencia que cubre este presupuesto, si es que hay alguna. */
  const licencia = licenciaPara(licencias, presupuesto.id);
  const pagado = licencia !== null;

  /**
   * Devuelve el PDF listo para guardar o compartir.
   *
   * Son dos caminos distintos a propósito. El gratuito se genera en el
   * navegador: no cuesta nada, funciona sin conexión y el presupuesto no sale
   * del equipo del usuario. El de pago lo genera el servidor, que es lo único
   * que impide bajárselo limpio sin pagar.
   */
  const obtenerPdf = useCallback(async (): Promise<{ blob: Blob; nombre: string }> => {
    const nombre = nombreArchivo(presupuesto);

    if (pagado && licencia) {
      const medidas = presupuesto.emisor.logo
        ? await medirLogo(presupuesto.emisor.logo)
        : undefined;
      return { blob: await descargarPdfLimpio(presupuesto, licencia, medidas), nombre };
    }

    // jsPDF pesa más que el resto de la app junta: solo se carga al descargar.
    const { generarPdf } = await import("./pdf");
    const doc = await generarPdf(presupuesto, {
      conMarcaDeAgua: true,
      // El dominio real, no uno escrito a mano en el código: el pie del PDF
      // gratuito es el único anuncio que llega a los clientes de tus usuarios.
      dominio: window.location.host,
    });
    return { blob: doc.output("blob"), nombre };
  }, [presupuesto, licencia, pagado]);

  const guardarArchivo = (blob: Blob, nombre: string) => {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const descargar = useCallback(async () => {
    setGenerando(true);
    setError(null);
    try {
      const { blob, nombre } = await obtenerPdf();
      guardarArchivo(blob, nombre);
    } catch (e) {
      setError(
        e instanceof Error
          ? `No se ha podido generar el PDF: ${e.message}`
          : "No se ha podido generar el PDF.",
      );
    } finally {
      setGenerando(false);
    }
  }, [obtenerPdf]);

  /**
   * Compartir el archivo directamente es lo que convierte esto en una
   * herramienta de móvil: presupuesto hecho en casa del cliente y enviado por
   * WhatsApp sin pasar por el ordenador.
   */
  const compartir = useCallback(async () => {
    setGenerando(true);
    setError(null);
    try {
      const { blob, nombre } = await obtenerPdf();
      const archivo = new File([blob], nombre, { type: "application/pdf" });
      if (!navigator.canShare?.({ files: [archivo] })) {
        guardarArchivo(blob, nombre);
        return;
      }
      await navigator.share({
        files: [archivo],
        title: `Presupuesto ${presupuesto.numero}`,
      });
    } catch (e) {
      // Cancelar el diálogo de compartir lanza AbortError y no es un fallo.
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(
        e instanceof Error
          ? `No se ha podido compartir: ${e.message}`
          : "No se ha podido compartir el presupuesto.",
      );
    } finally {
      setGenerando(false);
    }
  }, [obtenerPdf, presupuesto.numero]);

  const puedeCompartir = useMemo(
    () => typeof navigator !== "undefined" && typeof navigator.canShare === "function",
    [],
  );

  const abrir = (id: string) => {
    const documento = documentos.find((d) => d.id === id);
    if (!documento) return;
    fijarActual(id);
    setPresupuesto(documento);
    setPestana("editar");
  };

  const nuevo = () => {
    const creado = conEmisorConocido(nuevoPresupuesto(documentos));
    setPresupuesto(creado);
    setPestana("editar");
  };

  const duplicarActual = () => {
    setPresupuesto(duplicar(presupuesto, documentos));
    setPestana("editar");
  };

  const borrar = (id: string) => {
    const documento = documentos.find((d) => d.id === id);
    const nombre = documento?.titulo || documento?.cliente.nombre || documento?.numero;
    if (!confirm(`¿Borrar el presupuesto «${nombre}»? No se puede deshacer.`)) return;
    borrarDocumento(id);
    const restantes = cargarDocumentos();
    setDocumentos(restantes);
    if (id === presupuesto.id) {
      setPresupuesto(restantes[0] ?? conEmisorConocido(nuevoPresupuesto(restantes)));
    }
  };

  const exportar = () => {
    const blob = new Blob([exportarCopia()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivoCopia();
    enlace.click();
    URL.revokeObjectURL(url);
    setAviso("Copia descargada. Guárdala en un sitio seguro.");
  };

  const importar = async (archivo: File) => {
    try {
      const { importados, actualizados } = importarCopia(await archivo.text());
      const restaurados = cargarDocumentos();
      setDocumentos(restaurados);
      if (restaurados[0]) setPresupuesto(restaurados[0]);
      setAviso(
        importados + actualizados === 0
          ? "La copia no traía nada nuevo."
          : `Restaurados ${importados} presupuestos nuevos y ${actualizados} actualizados.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido leer la copia.");
    }
  };

  const elegirPlantilla = (oficio: Oficio) => {
    if (
      presupuesto.lineas.some((l) => l.concepto || l.precio) &&
      !confirm("Se sustituirán los conceptos que tengas escritos. ¿Seguimos?")
    ) {
      return;
    }
    setPresupuesto((anterior) => aplicarOficio(anterior, oficio));
  };

  const verEjemplo = () => {
    if (!confirm("Se abrirá un presupuesto de ejemplo como documento nuevo. ¿Seguimos?")) return;
    setPresupuesto({ ...presupuestoEjemplo(), numero: siguienteNumero(documentos) });
    setPestana("editar");
  };

  const estado = useMemo(() => {
    if (generando) return "Generando…";
    if (guardado) return "Guardado";
    return "Se guarda solo en este navegador";
  }, [generando, guardado]);

  return (
    <div className="app">
      <header className="barra">
        <div className="marca">
          <span className="marca__punto" aria-hidden="true">€</span>
          <span className="marca__texto">PresupPRO</span>
        </div>
        <span className="barra__estado">{estado}</span>
        <div className="barra__acciones">
          <button type="button" className="boton boton--texto" onClick={verEjemplo}>
            Ver ejemplo
          </button>
          <Documentos
            documentos={documentos}
            actual={presupuesto.id}
            onAbrir={abrir}
            onNuevo={nuevo}
            onDuplicar={duplicarActual}
            onBorrar={borrar}
            onExportar={exportar}
            onImportar={importar}
          />
          <button
            type="button"
            className="boton boton--primario"
            onClick={descargar}
            disabled={generando}
          >
            {generando ? (
              "Generando…"
            ) : (
              <>
                Descargar<span className="solo-escritorio">&nbsp;PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="pestanas" role="tablist">
        <button
          type="button"
          role="tab"
          className="pestana"
          aria-selected={pestana === "editar"}
          onClick={() => setPestana("editar")}
        >
          Editar
        </button>
        <button
          type="button"
          role="tab"
          className="pestana"
          aria-selected={pestana === "vista"}
          onClick={() => setPestana("vista")}
        >
          Vista previa
        </button>
      </div>

      <main className="lienzo" data-pestana={pestana}>
        <div className="columna-editor">
          <Plantillas onElegir={elegirPlantilla} />
          <Editor
            presupuesto={presupuesto}
            clientes={clientes}
            actualizar={actualizar}
          />
        </div>

        <div className="columna-vista">
          <div className="vista">
            <div className="vista__barra">
              <span className="vista__etiqueta">Vista previa</span>
            </div>
            <Vista presupuesto={presupuesto} conMarcaDeAgua={!pagado} />
          </div>

          {aviso && <div className="aviso">{aviso}</div>}

          <Descarga
            pagado={pagado}
            plan={licencia?.plan ?? null}
            licencia={licencia}
            presupuestoId={presupuesto.id}
            generando={generando}
            error={error}
            puedeCompartir={puedeCompartir}
            onDescargar={descargar}
            onCompartir={compartir}
          />
        </div>
      </main>

      <Contenido />
    </div>
  );
}
