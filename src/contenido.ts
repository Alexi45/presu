/**
 * Textos de la página. Viven aquí, y no dentro de los componentes, porque los
 * usa también el script que genera el HTML estático y los datos estructurados
 * de Google. Si se duplicaran, se desincronizarían a la primera corrección.
 */

export const SITIO = {
  nombre: "Plomada",
  /**
   * Solo se usa como valor por defecto del generador de páginas estáticas.
   * En producción manda la variable de entorno SITE_URL, y dentro de la
   * aplicación el dominio se toma de `window.location.host`.
   */
  url: "http://localhost",
  descripcion:
    "Crea presupuestos profesionales en PDF en dos minutos. Con IVA desglosado, retención de IRPF y tu logotipo. Sin registro.",
  precioUnico: 7,
  precioSuscripcion: 19,
};

export const PASOS = [
  {
    titulo: "Rellena tus datos y los del cliente",
    texto:
      "Los tuyos se guardan para el siguiente presupuesto, así que solo los escribes una vez.",
  },
  {
    titulo: "Añade las partidas",
    texto:
      "Concepto, medición, precio e IVA. O carga la plantilla de tu oficio y cambia lo que necesites.",
  },
  {
    titulo: "Descarga el PDF",
    texto:
      "Con tu logotipo, el desglose de impuestos y un espacio de firma para que el cliente lo acepte.",
  },
];

export const CLAVES = [
  {
    titulo: "Un concepto por partida, con su medición",
    texto:
      "«Reforma de baño, 3.000 €» no se puede defender. «14 m² de alicatado a 46 €/m²» sí. La medición es lo que convierte una discusión en una conversación.",
  },
  {
    titulo: "Qué no incluye",
    texto:
      "Las exclusiones evitan más conflictos que cualquier cláusula. Licencias, retirada de muebles, imprevistos ocultos: si no está escrito, el cliente asume que está incluido.",
  },
  {
    titulo: "IVA desglosado por tipo",
    texto:
      "Si mezclas partidas al 21 % y al 10 %, el desglose tiene que aparecer por separado. Plomada lo agrupa y lo calcula solo.",
  },
  {
    titulo: "Fecha de validez",
    texto:
      "Los materiales suben. Un presupuesto sin caducidad te obliga a mantener un precio que diste hace ocho meses.",
  },
  {
    titulo: "Plazo y forma de pago",
    texto:
      "Cuántos días de trabajo y cómo se reparte el cobro. Un anticipo escrito en el presupuesto se discute mucho menos que uno pedido por teléfono.",
  },
  {
    titulo: "Espacio para la firma",
    texto:
      "Un presupuesto firmado es la mejor prueba de lo acordado. Todos los que genera Plomada llevan el bloque de aceptación al final.",
  },
];

export const FAQ = [
  {
    pregunta: "¿Es gratis?",
    respuesta:
      "Crear el presupuesto, calcularlo y verlo terminado es gratis y sin límite. El PDF también se descarga gratis, pero sale con una marca de agua. Quitarla en un presupuesto concreto cuesta 7 € en un pago único, y no hace falta crear cuenta. Si mandas varios al mes, hay una suscripción de 19 €/mes que los cubre todos.",
  },
  {
    pregunta: "¿Hay que registrarse?",
    respuesta:
      "No. No se pide correo, ni contraseña, ni ningún dato para usar la herramienta. Se entra y se empieza a escribir.",
  },
  {
    pregunta: "¿Dónde se guardan mis presupuestos?",
    respuesta:
      "En tu propio navegador, no en ningún servidor. Eso significa que nadie más puede verlos, y también que si borras los datos de navegación o cambias de dispositivo se pierden. Descarga el PDF de lo que quieras conservar, o guarda una copia de seguridad desde «Mis presupuestos». La única excepción es la descarga de pago: para generarla sin marca de agua, el presupuesto viaja a nuestro servidor, que lo usa para crear el PDF y no lo almacena.",
  },
  {
    pregunta: "¿Un presupuesto es lo mismo que una factura?",
    respuesta:
      "No. El presupuesto es una oferta de precio y no tiene efectos fiscales; la factura documenta una operación ya realizada y está sujeta a la normativa de facturación. Plomada genera presupuestos, no facturas.",
  },
  {
    pregunta: "¿Puedo poner mi logotipo?",
    respuesta:
      "Sí, y también elegir el color del documento y entre tres estilos: moderno, clásico y minimal. El logotipo se queda guardado para los siguientes presupuestos.",
  },
  {
    pregunta: "¿Sirve si tengo que aplicar retención de IRPF?",
    respuesta:
      "Sí. Puedes activar el 15 % general o el 7 % de nuevo autónomo y el documento muestra la retención descontada, para que el cliente vea exactamente el importe que va a transferir.",
  },
  {
    pregunta: "¿Vale como contrato?",
    respuesta:
      "Un presupuesto aceptado por escrito por el cliente vincula a ambas partes en los términos que recoge. No sustituye a un contrato en obras complejas, pero es la prueba habitual de lo acordado en trabajos de oficio.",
  },
  {
    pregunta: "¿Funciona desde el móvil?",
    respuesta:
      "Sí. Puedes hacer el presupuesto en casa del cliente y enviárselo por WhatsApp desde el propio móvil.",
  },
];
