import { presupuestoVacio } from "./types";
import type { Cliente, Emisor, Presupuesto } from "./types";

/**
 * Las claves conservan el prefijo `presu` de cuando el producto se llamaba así.
 * Renombrarlas dejaría sin presupuestos a todo el que ya hubiera usado la web,
 * y el marcador `formato: "presu"` haría ilegibles las copias ya exportadas.
 * El nombre de un producto cambia; los datos de la gente no se tiran por eso.
 */
const CLAVE_DOCUMENTOS = "presu.documentos.v2";
const CLAVE_ACTUAL = "presu.actual.v2";
const CLAVE_EMISOR = "presu.emisor.v2";
const CLAVE_CLIENTES = "presu.clientes.v2";
const CLAVE_ANTIGUA = "presu.borrador.v1";

/** Más presupuestos que estos y el navegador empieza a ser mal sitio para esto. */
const LIMITE = 60;
const LIMITE_CLIENTES = 100;

/**
 * Sin registro no hay servidor donde guardar, así que todo vive en el
 * navegador. Es la decisión que quita la fricción de crear cuenta antes de ver
 * el resultado, y el motivo de que la app avise de que los datos son locales.
 */

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

/**
 * Devuelve si se ha podido guardar. Antes se tragaba el error y el usuario
 * seguía escribiendo sin saber que no se estaba guardando nada: perdía el
 * trabajo al recargar y no había forma de que lo supiera.
 */
function escribir(clave: string, valor: unknown): boolean {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

/** Completa los campos que falten para que un JSON viejo no rompa la app. */
function normalizar(guardado: Partial<Presupuesto>): Presupuesto {
  const base = presupuestoVacio();
  return {
    ...base,
    ...guardado,
    id: guardado.id ?? base.id,
    actualizado: guardado.actualizado ?? Date.now(),
    emisor: { ...base.emisor, ...guardado.emisor },
    cliente: { ...base.cliente, ...guardado.cliente },
    anticipo: guardado.anticipo ?? 0,
    lineas: guardado.lineas?.length
      ? guardado.lineas.map((linea) => ({
          ...linea,
          unidad: linea.unidad ?? "ud",
          capitulo: linea.capitulo ?? "",
          opcional: linea.opcional ?? false,
        }))
      : base.lineas,
  };
}

export function cargarDocumentos(): Presupuesto[] {
  const guardados = leer<Partial<Presupuesto>[]>(CLAVE_DOCUMENTOS, []);
  const documentos = guardados.map(normalizar);

  // Migración desde la versión de un solo borrador.
  if (documentos.length === 0) {
    const antiguo = leer<Partial<Presupuesto> | null>(CLAVE_ANTIGUA, null);
    if (antiguo) {
      const migrado = normalizar(antiguo);
      guardarDocumento(migrado);
      try {
        localStorage.removeItem(CLAVE_ANTIGUA);
      } catch {
        // Si no se puede borrar, la migración ya no se repite porque
        // cargarDocumentos solo mira la clave antigua con la lista vacía.
      }
      return [migrado];
    }
  }

  return documentos.sort((a, b) => b.actualizado - a.actualizado);
}

export function guardarDocumento(presupuesto: Presupuesto): boolean {
  const documentos = leer<Partial<Presupuesto>[]>(CLAVE_DOCUMENTOS, []).map(normalizar);
  const indice = documentos.findIndex((d) => d.id === presupuesto.id);
  if (indice >= 0) documentos[indice] = presupuesto;
  else documentos.unshift(presupuesto);

  const recortados = documentos
    .sort((a, b) => b.actualizado - a.actualizado)
    .slice(0, LIMITE);

  const guardado = escribir(CLAVE_DOCUMENTOS, recortados);
  escribir(CLAVE_ACTUAL, presupuesto.id);
  return guardado;
}

export function borrarDocumento(id: string): void {
  const documentos = cargarDocumentos().filter((d) => d.id !== id);
  escribir(CLAVE_DOCUMENTOS, documentos);
  if (idActual() === id) escribir(CLAVE_ACTUAL, documentos[0]?.id ?? null);
}

export function idActual(): string | null {
  return leer<string | null>(CLAVE_ACTUAL, null);
}

export function fijarActual(id: string): void {
  escribir(CLAVE_ACTUAL, id);
}

/**
 * Los datos del emisor son siempre los mismos y volver a escribirlos en cada
 * presupuesto es la parte más pesada del formulario.
 */
export function emisorGuardado(): Emisor | null {
  return leer<Emisor | null>(CLAVE_EMISOR, null);
}

export function guardarEmisor(emisor: Emisor): void {
  if (!emisor.nombre.trim()) return;
  escribir(CLAVE_EMISOR, emisor);
}

/**
 * Numeración correlativa por año: mira el número más alto que ya existe para el
 * año en curso con el formato AAAA-NNN y suma uno. Si el usuario usa su propio
 * formato, se respeta lo que haya escrito y esto solo afecta a los nuevos.
 */
export function siguienteNumero(documentos: Presupuesto[]): string {
  const anio = new Date().getFullYear();
  const patron = new RegExp(`^${anio}-(\\d+)$`);
  const usados = documentos
    .map((d) => patron.exec(d.numero)?.[1])
    .filter((n): n is string => Boolean(n))
    .map((n) => Number.parseInt(n, 10));
  const siguiente = usados.length ? Math.max(...usados) + 1 : 1;
  return `${anio}-${String(siguiente).padStart(3, "0")}`;
}

/**
 * Los clientes se repiten mucho más de lo que parece: una comunidad de vecinos,
 * una constructora, un cliente que pide varios trabajos al año.
 */
export function clientesGuardados(): Cliente[] {
  return leer<Cliente[]>(CLAVE_CLIENTES, []);
}

export function guardarCliente(cliente: Cliente): void {
  const nombre = cliente.nombre.trim();
  if (!nombre) return;
  const otros = clientesGuardados().filter(
    (c) => c.nombre.trim().toLowerCase() !== nombre.toLowerCase(),
  );
  escribir(CLAVE_CLIENTES, [cliente, ...otros].slice(0, LIMITE_CLIENTES));
}

export function buscarCliente(nombre: string): Cliente | undefined {
  const buscado = nombre.trim().toLowerCase();
  return clientesGuardados().find((c) => c.nombre.trim().toLowerCase() === buscado);
}

export interface Copia {
  formato: string;
  version: number;
  fecha: string;
  emisor: Emisor | null;
  clientes: Cliente[];
  presupuestos: Presupuesto[];
}

/**
 * Copia de seguridad completa.
 *
 * Es la contrapartida honesta de no tener servidor: si el usuario limpia el
 * navegador, cambia de ordenador o entra en modo privado, lo pierde todo. Esto
 * le da una salida sin obligarle a crear una cuenta.
 */
export function exportarCopia(): string {
  const copia: Copia = {
    formato: "presu",
    version: 1,
    fecha: new Date().toISOString(),
    emisor: emisorGuardado(),
    clientes: clientesGuardados(),
    presupuestos: cargarDocumentos(),
  };
  return JSON.stringify(copia, null, 2);
}

export interface ResultadoImportacion {
  importados: number;
  actualizados: number;
}

/**
 * Restaura una copia fusionando por id: los presupuestos que ya existan se
 * sustituyen por la versión más reciente y los demás se añaden. Nunca borra
 * nada que no venga en el archivo, porque una restauración accidental que
 * vacíe el trabajo de alguien es peor que no tener restauración.
 */
export function importarCopia(json: string): ResultadoImportacion {
  let copia: Partial<Copia>;
  try {
    copia = JSON.parse(json) as Partial<Copia>;
  } catch {
    throw new Error("El archivo no es una copia de Plomada válida.");
  }

  if (copia.formato !== "presu" || !Array.isArray(copia.presupuestos)) {
    throw new Error("El archivo no es una copia de Plomada válida.");
  }

  const actuales = new Map(cargarDocumentos().map((d) => [d.id, d]));
  let importados = 0;
  let actualizados = 0;

  for (const crudo of copia.presupuestos) {
    const documento = normalizar(crudo);
    const existente = actuales.get(documento.id);
    if (!existente) {
      actuales.set(documento.id, documento);
      importados++;
    } else if (documento.actualizado > existente.actualizado) {
      actuales.set(documento.id, documento);
      actualizados++;
    }
  }

  const fusionados = [...actuales.values()]
    .sort((a, b) => b.actualizado - a.actualizado)
    .slice(0, LIMITE);
  escribir(CLAVE_DOCUMENTOS, fusionados);

  if (copia.emisor?.nombre) guardarEmisor(copia.emisor);
  for (const cliente of copia.clientes ?? []) guardarCliente(cliente);

  return { importados, actualizados };
}

export function nombreArchivoCopia(): string {
  return `plomada-copia-${new Date().toISOString().slice(0, 10)}.json`;
}

export function duplicar(presupuesto: Presupuesto, documentos: Presupuesto[]): Presupuesto {
  return {
    ...presupuesto,
    id: crypto.randomUUID(),
    actualizado: Date.now(),
    numero: siguienteNumero(documentos),
    fecha: new Date().toISOString().slice(0, 10),
    lineas: presupuesto.lineas.map((linea) => ({ ...linea, id: crypto.randomUUID() })),
  };
}
