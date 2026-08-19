/**
 * Guías informativas.
 *
 * Las páginas de oficio atacan a quien ya quiere hacer un presupuesto. Estas
 * atacan a quien todavía está resolviendo una duda ("¿qué IVA pongo?") y que,
 * si le respondes bien, se queda con la herramienta.
 *
 * Contienen explicaciones de normativa española. Están redactadas con cuidado y
 * con la advertencia expresa de que no son asesoramiento fiscal, porque el
 * caso concreto de cada profesional lo tiene que ver su asesor.
 */

export interface Seccion {
  titulo: string;
  parrafos: string[];
  lista?: string[];
}

export interface Guia {
  slug: string;
  titulo: string;
  descripcion: string;
  h1: string;
  entradilla: string;
  /** Frase corta que se enseña en el índice de guías. */
  gancho: string;
  secciones: Seccion[];
  faq: { pregunta: string; respuesta: string }[];
  /** Slugs de oficios a los que enlazar al final. */
  oficios: string[];
  /** Se pinta como aviso destacado cuando el tema es fiscal. */
  aviso?: string;
}

const AVISO_FISCAL =
  "Esto es una explicación general de la normativa, no asesoramiento fiscal. " +
  "La responsabilidad de aplicar el tipo correcto es de quien emite la factura, " +
  "así que contrasta tu caso concreto con tu asesor.";

export const GUIAS: Guia[] = [
  {
    slug: "iva-reformas-10-o-21",
    titulo: "IVA en reformas: cuándo es el 10 % y cuándo el 21 % | Plomada",
    descripcion:
      "Los tres requisitos para aplicar el IVA reducido del 10 % en obras de reforma en viviendas, y qué pasa con el límite del 40 % en materiales.",
    h1: "IVA en reformas: 10 % o 21 %",
    entradilla:
      "Es la duda más cara del sector: equivocarte de tipo en una obra de 20.000 € son 2.200 € de diferencia. Estos son los requisitos que hay que cumplir.",
    gancho: "Los tres requisitos del IVA reducido, y el límite del 40 % en materiales.",
    aviso: AVISO_FISCAL,
    secciones: [
      {
        titulo: "La regla general es el 21 %",
        parrafos: [
          "El tipo general del IVA en España es el 21 %, y es el que se aplica por defecto a las obras de construcción y reforma. El 10 % es una excepción, y como toda excepción hay que cumplir sus requisitos y poder demostrarlo.",
          "Esto importa porque la responsabilidad es tuya: si aplicas el 10 % en una obra que no cumplía, Hacienda te reclama a ti la diferencia, no al cliente.",
        ],
      },
      {
        titulo: "Los tres requisitos del 10 %",
        parrafos: [
          "El artículo 91 de la Ley del IVA permite aplicar el tipo reducido a las obras de renovación y reparación realizadas en edificios destinados a vivienda cuando se cumplen a la vez estas tres condiciones:",
        ],
        lista: [
          "Que quien encarga la obra sea un particular que use la vivienda para su uso privado, o una comunidad de propietarios. Si el cliente es una empresa o un promotor, no aplica.",
          "Que la construcción o la última rehabilitación de la vivienda haya terminado al menos dos años antes del inicio de las obras.",
          "Que quien hace la obra no aporte materiales cuyo coste supere el 40 % de la base imponible de la operación.",
        ],
      },
      {
        titulo: "El límite del 40 %: donde se cae la mayoría",
        parrafos: [
          "Este es el requisito que más presupuestos tumba. Si pones tú los materiales y su coste supera el 40 % de la base imponible, toda la operación pasa al 21 %. No una parte: toda.",
          "El caso típico es una reforma de baño en la que el profesional suministra sanitarios, mampara, grifería y pavimento. Entre todo eso es fácil pasar del 40 %, aunque la mano de obra sea la parte más trabajosa.",
          "Por eso muchos profesionales separan en el presupuesto la mano de obra del suministro de materiales, o dejan que sea el cliente quien compre directamente el material más caro. Son decisiones legítimas, pero deben responder a la realidad de la operación y no a un montaje para bajar el tipo.",
        ],
      },
      {
        titulo: "Qué escribir en el presupuesto",
        parrafos: [
          "Aunque el presupuesto no es un documento fiscal, es donde el cliente ve por primera vez el tipo aplicado, y donde conviene dejar constancia de en qué te has basado.",
        ],
        lista: [
          "El tipo de IVA aplicado a cada partida, desglosado. Si mezclas partidas al 10 % y al 21 %, el desglose por tipo tiene que verse.",
          "Una nota indicando que el tipo reducido se aplica bajo la declaración del cliente de que la vivienda tiene más de dos años y es para su uso particular.",
          "El coste del material aportado, si quieres poder justificar el cumplimiento del límite del 40 %.",
        ],
      },
      {
        titulo: "Obras de rehabilitación: otro supuesto distinto",
        parrafos: [
          "Existe además un régimen específico para las obras de rehabilitación, con su propia definición legal y sus propios requisitos sobre el peso de las actuaciones estructurales dentro del coste total del proyecto. No es lo mismo que la reforma del 10 % y tiene sus propias reglas.",
          "Si estás ante una obra grande que podría encajar ahí, es exactamente el momento de llamar a tu asesor antes de firmar el presupuesto.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Puedo aplicar el 10 % si el cliente es una empresa?",
        respuesta:
          "No. El tipo reducido de las obras de renovación exige que el destinatario sea un particular que use la vivienda para uso privado, o una comunidad de propietarios. Si factura a una empresa o a un promotor, se aplica el 21 %.",
      },
      {
        pregunta: "¿Y si la vivienda tiene menos de dos años?",
        respuesta:
          "Entonces no se cumple uno de los requisitos y la obra va al 21 %. El plazo se cuenta desde la terminación de la construcción o de la última rehabilitación hasta el inicio de las obras.",
      },
      {
        pregunta: "¿El 40 % se calcula sobre el total con IVA?",
        respuesta:
          "Sobre la base imponible, es decir, sobre el importe sin IVA de la operación.",
      },
      {
        pregunta: "¿Qué pasa si me equivoco de tipo?",
        respuesta:
          "La responsabilidad de repercutir correctamente el impuesto es de quien emite la factura. Si aplicaste un tipo inferior al que correspondía, Hacienda puede reclamarte la diferencia con sus recargos, y recuperarla del cliente meses después suele ser complicado.",
      },
    ],
    oficios: ["reformas", "albanileria", "fontaneria", "pintura"],
  },
  {
    slug: "retencion-irpf-autonomos",
    titulo: "Retención de IRPF: cuándo se aplica y cuánto | Plomada",
    descripcion:
      "Cuándo lleva retención de IRPF tu factura, la diferencia entre el 15 % y el 7 % de nuevo autónomo, y por qué a un cliente particular nunca se le retiene.",
    h1: "Retención de IRPF para autónomos",
    entradilla:
      "Por qué a unos clientes les descuentas un 15 % y a otros no, y por qué eso no significa que cobres menos.",
    gancho: "Cuándo va el 15 %, cuándo el 7 % y por qué a un particular no se le retiene.",
    aviso: AVISO_FISCAL,
    secciones: [
      {
        titulo: "Qué es la retención y por qué existe",
        parrafos: [
          "La retención es un adelanto de tu propio IRPF que tu cliente ingresa en Hacienda en tu nombre. No es un descuento ni un coste: es dinero tuyo que llega a Hacienda antes, y que se te devuelve o se te resta en la declaración de la renta.",
          "Por eso, cuando un cliente te transfiere menos de lo que dice el total de la factura, no estás cobrando menos. Estás cobrando una parte por adelantado en forma de pago a cuenta.",
        ],
      },
      {
        titulo: "Cuándo se aplica",
        parrafos: [
          "La retención se practica cuando se dan las dos condiciones a la vez:",
        ],
        lista: [
          "Que ejerzas una actividad profesional, no empresarial. Es la distinción clásica entre estar dado de alta en la sección segunda del IAE (arquitectos, diseñadores, fotógrafos, traductores, consultores) y en la primera (fontaneros, electricistas, albañiles, comercios).",
          "Que tu cliente sea una empresa, otro profesional o una entidad obligada a retener. A un cliente particular nunca se le practica retención.",
        ],
      },
      {
        titulo: "El 15 % y el 7 %",
        parrafos: [
          "El tipo general de retención para actividades profesionales es el 15 %.",
          "Existe un tipo reducido del 7 % durante el año en que te das de alta en la actividad y los dos siguientes. Para aplicarlo tienes que comunicárselo por escrito a tu cliente, que es quien responde de haber retenido correctamente.",
          "Hay además casos particulares con tipos propios, como determinadas actividades empresariales en estimación objetiva o el transporte de mercancías, con retenciones muy inferiores. Si crees que tu actividad puede estar en uno de esos supuestos, confírmalo con tu asesor.",
        ],
      },
      {
        titulo: "Por qué ponerla ya en el presupuesto",
        parrafos: [
          "El presupuesto no es un documento fiscal y no está obligado a llevar la retención. Pero si tu cliente es una empresa y sabes que la factura la llevará, mostrarla evita la conversación más incómoda del proceso: la de explicar por qué el importe que ha pagado no coincide con el que aceptó.",
          "Un presupuesto que enseña la base, el IVA, la retención y el importe final a transferir es un presupuesto que no genera ninguna llamada.",
        ],
      },
      {
        titulo: "El orden de las operaciones",
        parrafos: [
          "El cálculo siempre sigue el mismo orden, y equivocarse en él es el error más habitual:",
        ],
        lista: [
          "Se parte de la base imponible, la suma de tus servicios antes de impuestos.",
          "Se suma el IVA que corresponda sobre esa base.",
          "Se resta la retención, calculada sobre la base imponible y nunca sobre el total con IVA.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Un fontanero pone retención en sus facturas?",
        respuesta:
          "Con carácter general no, porque la actividad de fontanería es empresarial y no profesional. La retención de IRPF está pensada para actividades profesionales. Existen supuestos concretos con retenciones específicas, así que confírmalo con tu asesor si tienes dudas.",
      },
      {
        pregunta: "¿A un cliente particular se le retiene?",
        respuesta:
          "Nunca. Un particular no está obligado a practicar retenciones ni a ingresarlas en Hacienda. La retención solo aparece cuando el cliente es empresa, profesional o entidad obligada a retener.",
      },
      {
        pregunta: "¿Cuánto dura el 7 % de nuevo autónomo?",
        respuesta:
          "El año en que te das de alta en la actividad y los dos siguientes. Después pasas al tipo general. Tienes que comunicar por escrito a tus clientes que te aplicas el tipo reducido.",
      },
      {
        pregunta: "¿La retención se calcula sobre el total con IVA?",
        respuesta:
          "No, sobre la base imponible. Si tu base son 1.000 €, con un 21 % de IVA y un 15 % de retención, el cliente te transfiere 1.000 + 210 − 150 = 1.060 €.",
      },
    ],
    oficios: ["fotografia", "diseno-web"],
  },
  {
    slug: "como-hacer-un-presupuesto",
    titulo: "Cómo hacer un presupuesto profesional paso a paso | Plomada",
    descripcion:
      "Qué datos lleva un presupuesto, cómo describir las partidas para que no haya discusiones, y qué cláusulas evitan los problemas más habituales.",
    h1: "Cómo hacer un presupuesto",
    entradilla:
      "Un presupuesto no se pierde por caro. Se pierde por poco claro, por llegar tarde o por dejar abierto lo que tenía que estar cerrado.",
    gancho: "Los datos obligatorios, cómo describir las partidas y las cláusulas que te protegen.",
    secciones: [
      {
        titulo: "Qué datos lleva",
        parrafos: [
          "Un presupuesto no tiene requisitos legales de contenido como los tiene una factura, pero hay una lista que en la práctica no puede faltar, porque es lo que permite identificar la oferta y aceptarla sin ambigüedad:",
        ],
        lista: [
          "Tus datos completos: nombre o razón social, NIF, dirección y una forma de contacto.",
          "Los datos del cliente, incluido su NIF si es empresa o si quiere la factura a su nombre.",
          "Un número de presupuesto y la fecha de emisión.",
          "Una fecha de validez, para que el precio no sea eterno.",
          "El detalle de las partidas con su medición, su precio unitario y su tipo de IVA.",
          "El desglose de impuestos y el total.",
          "Un espacio para la aceptación firmada del cliente.",
        ],
      },
      {
        titulo: "Cómo describir una partida",
        parrafos: [
          "Aquí es donde se gana o se pierde el trabajo. «Reforma de baño, 3.000 €» no es una oferta: es una cifra que el cliente solo puede comparar con otra cifra. Y en una comparación de cifras siempre gana el más barato.",
          "Una partida bien escrita responde a tres preguntas: qué se hace, cuánto se hace y qué incluye. «Alicatado y solado, 14 m² a 46 €/m², incluido material y rejuntado» se puede defender, se puede ajustar y se puede comparar de verdad.",
          "La medición además te protege. Si el cliente amplía el trabajo, tienes un precio unitario acordado con el que calcular la ampliación sin renegociar nada.",
        ],
      },
      {
        titulo: "Lo que no incluye",
        parrafos: [
          "Las exclusiones evitan más conflictos que cualquier otra parte del documento. Todo lo que no esté escrito, el cliente va a asumir que está incluido, y no por mala fe: simplemente no sabe lo que hace falta para hacer su trabajo.",
          "Licencias municipales, retirada de muebles, reparación de paramentos después de las rozas, imprevistos en instalaciones ocultas, trabajos de otros gremios. Media docena de líneas en el presupuesto ahorran una discusión a mitad de obra.",
        ],
      },
      {
        titulo: "Plazo, forma de pago y anticipo",
        parrafos: [
          "El plazo debe contarse desde un hecho verificable: desde el inicio de los trabajos, desde la aprobación de las medidas definitivas o desde la entrega del material por parte del cliente. Nunca desde la firma, si entre la firma y el arranque depende de algo que no controlas.",
          "El anticipo no es desconfianza: es lo que cubre el material que compras para un trabajo concreto. Escríbelo en el presupuesto, con su porcentaje, y deja de negociarlo por teléfono cada vez.",
        ],
      },
      {
        titulo: "Ofrece opciones, no solo un precio",
        parrafos: [
          "Un presupuesto con una sola cifra tiene dos respuestas posibles: sí o no. Un presupuesto con una mejora opcional bien descrita tiene tres, y una de ellas sube el importe.",
          "Las partidas opcionales funcionan porque el cliente ya ha decidido gastarse el grueso del dinero. Añadir un extra concreto, con su precio a la vista y sin que altere el total de lo esencial, es una decisión mucho más pequeña.",
        ],
      },
      {
        titulo: "Mándalo rápido",
        parrafos: [
          "En trabajos de oficio, la velocidad de respuesta compite con el precio. El cliente que pide tres presupuestos suele quedarse con el primero que llega bien hecho, porque el que responde rápido transmite que trabajará igual.",
          "Es la razón de que exista Plomada: si el presupuesto se puede terminar y enviar desde el móvil antes de salir de casa del cliente, el trabajo ya es casi tuyo.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Un presupuesto obliga legalmente?",
        respuesta:
          "Una vez aceptado por el cliente, vincula a ambas partes en los términos que recoge. Antes de la aceptación es una oferta, sujeta a la validez que indiques en el propio documento.",
      },
      {
        pregunta: "¿Puedo cobrar por hacerlo?",
        respuesta:
          "Sí, siempre que lo comuniques antes de empezar a estudiarlo. Es habitual en trabajos que exigen visita, mediciones o proyecto, y muchos profesionales lo descuentan del importe final si el trabajo se acepta.",
      },
      {
        pregunta: "¿Qué validez le pongo?",
        respuesta:
          "Treinta días es lo razonable en la mayoría de oficios. Te protege de que te acepten medio año después un precio calculado con los materiales de hoy.",
      },
      {
        pregunta: "¿Es lo mismo un presupuesto que una factura?",
        respuesta:
          "No. El presupuesto es una oferta de precio y no tiene efectos fiscales. La factura documenta una operación ya realizada y está sujeta a la normativa de facturación. Plomada genera presupuestos, no facturas.",
      },
    ],
    oficios: ["reformas", "fontaneria", "electricidad", "pintura", "carpinteria"],
  },
];
