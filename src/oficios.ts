import { nuevaLinea } from "./types";
import type { Presupuesto, TipoIva } from "./types";

/**
 * Catálogo de oficios. Es la pieza central del proyecto y se usa en dos sitios:
 *
 *  1. En la herramienta, para rellenar el presupuesto con conceptos de partida
 *     (el problema real de estos usuarios no es la calculadora, es la página
 *     en blanco).
 *  2. En el build, para generar una página estática por oficio con contenido
 *     propio. Esas páginas son lo que tiene que posicionar en Google.
 *
 * Por eso el contenido vive aquí y no en el HTML: se escribe una vez y sirve
 * para las dos cosas.
 */

export interface ConceptoPlantilla {
  /** Capítulo de obra. Solo lo usan los oficios que presupuestan por fases. */
  capitulo?: string;
  concepto: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precio: number;
  iva: TipoIva;
  /** Mejora que se ofrece pero no suma al total. */
  opcional?: boolean;
}

export interface Oficio {
  slug: string;
  nombre: string;
  /** Como se llama a sí mismo el profesional: "fontanero", "electricista"… */
  profesional: string;
  emoji: string;
  titulo: string;
  descripcion: string;
  h1: string;
  entradilla: string;
  parrafos: string[];
  /** Qué no puede faltar en un presupuesto de este oficio. */
  incluir: { titulo: string; texto: string }[];
  faq: { pregunta: string; respuesta: string }[];
  asunto: string;
  conceptos: ConceptoPlantilla[];
  notas: string;
  irpf: number;
  /** Porcentaje que se cobra al aceptar, en los oficios donde es lo habitual. */
  anticipo?: number;
}

export const OFICIOS: Oficio[] = [
  {
    slug: "reformas",
    nombre: "Reformas",
    profesional: "reformista",
    emoji: "🧱",
    titulo: "Modelo de presupuesto de reforma en PDF | PresupPRO",
    descripcion:
      "Haz un presupuesto de reforma con partidas, medición, IVA desglosado y firma de aceptación. Se rellena en dos minutos y se descarga en PDF.",
    h1: "Presupuesto de reforma",
    entradilla:
      "Rellena las partidas, revisa el total y descarga el PDF. Sin instalar nada y sin crear ninguna cuenta.",
    parrafos: [
      "En reformas, el presupuesto es el contrato. Casi todos los conflictos que acaban mal empiezan por una partida escrita en dos palabras: el cliente entendió una cosa y el profesional presupuestó otra. Detallar qué incluye cada partida, con su medición y su unidad, no es burocracia — es lo que evita tener que discutir a mitad de obra.",
      "Un presupuesto de reforma bien hecho separa demolición, albañilería, instalaciones y acabados en partidas independientes. Así el cliente puede quitar o cambiar una parte sin que se caiga el resto, y tú puedes defender el precio de cada bloque por separado.",
    ],
    incluir: [
      {
        titulo: "Medición real, no aproximada",
        texto:
          "Metros cuadrados de solado, metros lineales de rodapié, unidades de sanitario. Si presupuestas 'baño completo' sin medición, cualquier cambio te obliga a renegociar a ciegas.",
      },
      {
        titulo: "Qué NO incluye",
        texto:
          "La lista de exclusiones vale tanto como la de partidas: licencias de obra, retirada de muebles, imprevistos en instalaciones ocultas, desperfectos por humedades previas.",
      },
      {
        titulo: "Plazo y forma de pago",
        texto:
          "Días laborables de ejecución y el reparto de los pagos. Lo habitual es un porcentaje al aceptar y el resto a la entrega, o pagos por hitos en obras largas.",
      },
      {
        titulo: "Validez del precio",
        texto:
          "Los materiales se mueven. Poner una validez de 30 días te protege de que te acepten en marzo un precio que diste en enero.",
      },
    ],
    faq: [
      {
        pregunta: "¿Qué IVA se aplica en una reforma de vivienda?",
        respuesta:
          "En obras de renovación y reparación en viviendas particulares puede aplicarse el 10 % si se cumplen los requisitos legales, entre ellos que la vivienda tenga más de dos años y que el material aportado no supere el 40 % de la base imponible. Fuera de esos supuestos se aplica el 21 %. Consulta tu caso concreto con tu asesor, porque la responsabilidad de aplicar el tipo correcto es tuya.",
      },
      {
        pregunta: "¿Debe firmar el cliente el presupuesto?",
        respuesta:
          "No es obligatorio, pero un presupuesto aceptado por escrito es la mejor prueba de lo acordado si algo se discute después. Todos los presupuestos que genera PresupPRO llevan un bloque de firma y fecha al final.",
      },
      {
        pregunta: "¿Puedo cobrar por hacer el presupuesto?",
        respuesta:
          "Sí, siempre que lo comuniques antes de empezar a estudiarlo. Es habitual en obras que exigen visita, mediciones y proyecto. Muchos profesionales lo descuentan del importe final si la obra se acepta.",
      },
    ],
    asunto: "Reforma integral de baño",
    conceptos: [
      {
        capitulo: "Demolición",
        concepto: "Demolición y retirada de escombros",
        descripcion:
          "Picado de alicatado y solado, retirada de sanitarios y transporte a vertedero autorizado.",
        cantidad: 1,
        unidad: "ud",
        precio: 680,
        iva: 21,
      },
      {
        capitulo: "Albañilería",
        concepto: "Alicatado y solado",
        descripcion:
          "Colocación de pavimento porcelánico y azulejo en paredes, incluido material y rejuntado.",
        cantidad: 14,
        unidad: "m²",
        precio: 46,
        iva: 21,
      },
      {
        capitulo: "Instalaciones",
        concepto: "Instalación de fontanería",
        descripcion:
          "Sustitución de tomas de agua fría y caliente, desagües y montaje de sanitarios.",
        cantidad: 1,
        unidad: "ud",
        precio: 940,
        iva: 21,
      },
      {
        capitulo: "Acabados",
        concepto: "Mampara de ducha",
        descripcion: "Mampara fija de vidrio templado de 8 mm con perfilería negra.",
        cantidad: 1,
        unidad: "ud",
        precio: 385,
        iva: 21,
      },
      {
        capitulo: "Acabados",
        concepto: "Suelo radiante eléctrico",
        descripcion: "Manta radiante bajo el pavimento con termostato programable.",
        cantidad: 5,
        unidad: "m²",
        precio: 78,
        iva: 21,
        opcional: true,
      },
    ],
    notas:
      "Plazo estimado de ejecución: 12 días laborables desde el inicio de los trabajos.\n" +
      "No incluye: licencias municipales, retirada de mobiliario ni imprevistos en instalaciones ocultas.",
    irpf: 0,
    anticipo: 40,
  },
  {
    slug: "fontaneria",
    nombre: "Fontanería",
    profesional: "fontanero",
    emoji: "🔧",
    titulo: "Presupuesto de fontanería en PDF, gratis | PresupPRO",
    descripcion:
      "Modelo de presupuesto de fontanería con mano de obra, materiales y desplazamiento. Rellénalo y descárgalo en PDF con tu logo.",
    h1: "Presupuesto de fontanería",
    entradilla:
      "Desde una fuga hasta una instalación completa. Rellena, revisa el total y descarga el PDF.",
    parrafos: [
      "El presupuesto de fontanería tiene una particularidad: buena parte del trabajo no se ve hasta que se abre la pared. Por eso conviene presupuestar lo que se sabe con precio cerrado y dejar lo incierto como una partida aparte, con precio por hora y aviso previo antes de ejecutarla.",
      "Separar mano de obra, material y desplazamiento también te da margen de negociación. Si el cliente pone el material, quitas esa línea y el resto del presupuesto sigue en pie sin recalcular nada.",
    ],
    incluir: [
      {
        titulo: "Mano de obra y material por separado",
        texto:
          "Muchos clientes compran ellos el sanitario o la grifería. Si va todo en una línea, cualquier cambio obliga a rehacer el presupuesto entero.",
      },
      {
        titulo: "Desplazamiento",
        texto:
          "Cóbralo como línea propia y visible. Escondido en el precio de la mano de obra parece que cobras caro por hora; en su línea, se entiende.",
      },
      {
        titulo: "Precio hora para imprevistos",
        texto:
          "Deja escrito el precio por hora de trabajo adicional y el compromiso de avisar antes de ejecutarlo. Evita la discusión clásica del final de obra.",
      },
      {
        titulo: "Garantía del trabajo",
        texto:
          "Indicar los meses de garantía de la instalación es un argumento de venta y no te cuesta nada escribirlo.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cuánto se cobra por una hora de fontanería?",
        respuesta:
          "Depende mucho de la zona y del tipo de trabajo. Lo importante para el presupuesto no es acertar con la media del sector, sino que tu precio hora esté escrito y el cliente lo haya aceptado antes de empezar.",
      },
      {
        pregunta: "¿Cómo presupuesto una urgencia?",
        respuesta:
          "Con un precio de salida cerrado que cubra desplazamiento y la primera hora, y el resto por horas. Ponlo por escrito aunque sea por WhatsApp antes de salir.",
      },
      {
        pregunta: "¿Tengo que aplicar retención de IRPF?",
        respuesta:
          "Solo si facturas a otra empresa o profesional y estás dado de alta como autónomo en estimación directa. A un cliente particular no se le practica retención. Puedes activarla en la herramienta cuando la necesites.",
      },
    ],
    asunto: "Sustitución de instalación de agua en cocina",
    conceptos: [
      {
        concepto: "Desplazamiento y diagnóstico",
        descripcion: "Visita, localización de la avería y valoración en obra.",
        cantidad: 1,
        unidad: "ud",
        precio: 45,
        iva: 21,
      },
      {
        concepto: "Mano de obra",
        descripcion: "Sustitución de tubería, montaje de llaves de corte y pruebas de estanqueidad.",
        cantidad: 6,
        unidad: "h",
        precio: 38,
        iva: 21,
      },
      {
        concepto: "Material de fontanería",
        descripcion: "Tubo multicapa, accesorios, llaves de escuadra y pequeño material.",
        cantidad: 1,
        unidad: "ud",
        precio: 165,
        iva: 21,
      },
      {
        concepto: "Grifería monomando",
        descripcion: "Grifo de cocina con caño alto, incluido montaje.",
        cantidad: 1,
        unidad: "ud",
        precio: 120,
        iva: 21,
      },
    ],
    notas:
      "Garantía de 12 meses sobre la instalación y la mano de obra.\n" +
      "Las horas adicionales por imprevistos se facturarán al mismo precio hora, previo aviso al cliente.",
    irpf: 0,
  },
  {
    slug: "electricidad",
    nombre: "Electricidad",
    profesional: "electricista",
    emoji: "⚡",
    titulo: "Presupuesto de electricista en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto para instalaciones eléctricas: puntos de luz, cuadro, mano de obra y boletín. Descarga en PDF con tu logo.",
    h1: "Presupuesto de electricista",
    entradilla:
      "Instalaciones, cuadros y reformas eléctricas. Rellena las partidas y descarga el PDF.",
    parrafos: [
      "En electricidad casi todo se presupuesta por unidades: puntos de luz, enchufes, mecanismos, metros de canalización. Presupuestar por unidades en lugar de a tanto alzado te permite justificar cualquier ampliación sobre la marcha sin rehacer el documento.",
      "Si el trabajo necesita boletín o certificado de instalación eléctrica, ponlo como partida visible. Es un coste real, el cliente pocas veces lo tiene en cuenta, y descubrirlo al final del trabajo genera desconfianza.",
    ],
    incluir: [
      {
        titulo: "Precio por punto",
        texto:
          "Punto de luz, punto de enchufe, punto de TV. Deja claro qué incluye cada punto: canalización, cableado, caja y mecanismo, o solo parte.",
      },
      {
        titulo: "Cuadro y protecciones",
        texto:
          "Diferenciales, magnetotérmicos y el propio cuadro son una partida en sí misma y suelen ser el grueso del material.",
      },
      {
        titulo: "Boletín o certificado",
        texto:
          "Si la instalación lo requiere, va en el presupuesto. Incluye también la tasa del organismo si la repercutes.",
      },
      {
        titulo: "Marca de los mecanismos",
        texto:
          "El salto de precio entre gamas es enorme. Nombrar la serie concreta evita que te comparen con un presupuesto que lleva material más barato.",
      },
    ],
    faq: [
      {
        pregunta: "¿El boletín eléctrico va en el presupuesto?",
        respuesta:
          "Si el trabajo lo necesita, sí, y conviene que sea una línea visible con su importe. Es un coste que el cliente no espera y que genera conflicto si aparece solo en la factura final.",
      },
      {
        pregunta: "¿Cómo presupuesto una instalación completa de vivienda?",
        respuesta:
          "Por número de puntos y por circuitos, más el cuadro general y la mano de obra. Así el cliente puede ampliar dos enchufes sin que tengas que rehacer el documento.",
      },
      {
        pregunta: "¿Qué validez le doy al presupuesto?",
        respuesta:
          "Treinta días es lo razonable. El material eléctrico ha tenido subidas rápidas y un presupuesto sin fecha de caducidad te deja vendido si te lo aceptan medio año después.",
      },
    ],
    asunto: "Renovación de instalación eléctrica en vivienda",
    conceptos: [
      {
        concepto: "Cuadro eléctrico general",
        descripcion:
          "Sustitución de cuadro con protección diferencial y magnetotérmicos por circuito.",
        cantidad: 1,
        unidad: "ud",
        precio: 480,
        iva: 21,
      },
      {
        concepto: "Punto de luz",
        descripcion: "Canalización, cableado, caja de mecanismo y mecanismo instalado.",
        cantidad: 12,
        unidad: "ud",
        precio: 48,
        iva: 21,
      },
      {
        concepto: "Punto de enchufe",
        descripcion: "Toma de corriente con toma de tierra, incluido mecanismo.",
        cantidad: 18,
        unidad: "ud",
        precio: 42,
        iva: 21,
      },
      {
        concepto: "Certificado de instalación eléctrica",
        descripcion: "Emisión del boletín y tramitación ante el organismo competente.",
        cantidad: 1,
        unidad: "ud",
        precio: 150,
        iva: 21,
      },
    ],
    notas:
      "Plazo estimado: 5 días laborables.\n" +
      "No incluye obra civil de albañilería ni reparación de paramentos tras las rozas.",
    irpf: 0,
  },
  {
    slug: "pintura",
    nombre: "Pintura",
    profesional: "pintor",
    emoji: "🎨",
    titulo: "Presupuesto de pintura por m² en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto de pintura con metros cuadrados, manos de pintura, preparación y protección. Descárgalo en PDF.",
    h1: "Presupuesto de pintura",
    entradilla:
      "Presupuesta por metro cuadrado, deja claras las manos de pintura y descarga el PDF.",
    parrafos: [
      "El precio de pintar no depende de los metros, depende del estado de la pared. Presupuestar solo 'pintura de piso, 900 €' te obliga a asumir tú cualquier sorpresa: gotelé, humedades, agujeros, paredes que chupan tres manos en vez de dos.",
      "La solución es separar preparación de aplicación. Preparación en su línea, con su precio, y aplicación por metro cuadrado indicando cuántas manos van incluidas. Si la pared está peor de lo previsto, se amplía la partida de preparación sin tocar el resto.",
    ],
    incluir: [
      {
        titulo: "Metros cuadrados reales",
        texto:
          "De pared y de techo por separado, porque el techo se paga más caro. Indica si descuentas huecos de puertas y ventanas.",
      },
      {
        titulo: "Manos de pintura incluidas",
        texto:
          "Dos manos es el estándar. Escribirlo evita la discusión de si la tercera mano estaba incluida o no.",
      },
      {
        titulo: "Preparación del soporte",
        texto:
          "Lijado, plastecido, sellado de fisuras, imprimación. Es donde se va el tiempo y donde se pierde dinero si no está presupuestado.",
      },
      {
        titulo: "Protección y limpieza",
        texto:
          "Cubrir muebles y suelos, y dejar la casa limpia al terminar, es trabajo real. Ponlo aunque sea con importe bajo: se valora.",
      },
    ],
    faq: [
      {
        pregunta: "¿Se presupuesta por metro cuadrado o por habitación?",
        respuesta:
          "Por metro cuadrado. Es lo que te permite justificar el precio y ajustarlo si el cliente decide pintar una estancia menos. Por habitación solo funciona en trabajos muy repetitivos.",
      },
      {
        pregunta: "¿Incluyo la pintura en el precio?",
        respuesta:
          "Puedes hacerlo, pero deja siempre indicada la marca y el acabado. Si no, cualquier competidor con pintura más barata parecerá más económico que tú.",
      },
      {
        pregunta: "¿Cómo cobro el gotelé?",
        respuesta:
          "Como partida de preparación aparte, por metro cuadrado. Quitar gotelé multiplica las horas y meterlo dentro del precio de pintar es la forma más rápida de perder dinero en una obra.",
      },
    ],
    asunto: "Pintura de vivienda de 90 m²",
    conceptos: [
      {
        concepto: "Protección de mobiliario y suelos",
        descripcion: "Cubrición con plásticos y cinta, y limpieza final de la vivienda.",
        cantidad: 1,
        unidad: "ud",
        precio: 140,
        iva: 21,
      },
      {
        concepto: "Preparación de paramentos",
        descripcion: "Lijado, plastecido de fisuras y agujeros, e imprimación selladora.",
        cantidad: 210,
        unidad: "m²",
        precio: 4.5,
        iva: 21,
      },
      {
        concepto: "Pintura plástica en paredes",
        descripcion: "Dos manos de pintura plástica mate lavable en color a elegir.",
        cantidad: 210,
        unidad: "m²",
        precio: 7.2,
        iva: 21,
      },
      {
        concepto: "Pintura de techos",
        descripcion: "Dos manos de pintura plástica blanca mate en techos.",
        cantidad: 90,
        unidad: "m²",
        precio: 8.5,
        iva: 21,
      },
    ],
    notas:
      "Precio calculado para dos manos de pintura. Una tercera mano por cambio de color se presupuestaría aparte.\n" +
      "Plazo estimado: 6 días laborables con la vivienda vacía.",
    irpf: 0,
  },
  {
    slug: "jardineria",
    nombre: "Jardinería",
    profesional: "jardinero",
    emoji: "🌿",
    titulo: "Presupuesto de jardinería en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto de jardinería para podas, mantenimiento y diseño de jardín, con opción de cuota mensual. Descarga en PDF.",
    h1: "Presupuesto de jardinería",
    entradilla:
      "Trabajos puntuales o mantenimiento mensual. Rellena y descarga el PDF en dos minutos.",
    parrafos: [
      "La jardinería tiene dos negocios distintos y conviene no mezclarlos en el mismo presupuesto: el trabajo puntual (una poda, un diseño, una instalación de riego) y el mantenimiento recurrente, que se cobra por cuota.",
      "En el mantenimiento, el presupuesto es en realidad una propuesta de contrato: número de visitas al mes, qué incluye cada visita y qué pasa con la retirada de restos. Detallarlo es lo que evita que te llamen para trabajos que no estaban dentro de la cuota.",
    ],
    incluir: [
      {
        titulo: "Retirada de restos vegetales",
        texto:
          "Es coste de transporte y de gestor de residuos. En una poda grande puede ser la partida más cara y el cliente casi nunca la tiene en cuenta.",
      },
      {
        titulo: "Número de visitas si es mantenimiento",
        texto:
          "Cuota mensual, visitas incluidas al mes y duración aproximada de cada una. Sin esto, la cuota se convierte en barra libre.",
      },
      {
        titulo: "Altura y medios de la poda",
        texto:
          "No es lo mismo podar desde el suelo que con plataforma elevadora o con trepa. El medio necesario cambia el precio por completo.",
      },
      {
        titulo: "Material vegetal",
        texto:
          "Si aportas plantas, indica especie y tamaño. Y deja claro si hay garantía de arraigo, porque te la van a reclamar.",
      },
    ],
    faq: [
      {
        pregunta: "¿Qué IVA lleva la jardinería?",
        respuesta:
          "El 21 % en general. Existen supuestos reducidos en actividades agrícolas, pero el mantenimiento de jardines particulares tributa al tipo general. Confírmalo con tu asesor.",
      },
      {
        pregunta: "¿Cómo presupuesto un mantenimiento mensual?",
        respuesta:
          "Como una línea con unidad 'mes' y el precio de la cuota, detallando en la descripción cuántas visitas incluye y qué se hace en cada una. En las notas, la permanencia y el preaviso de baja.",
      },
      {
        pregunta: "¿Cobro la retirada de restos aparte?",
        respuesta:
          "Es lo más recomendable, sobre todo en podas grandes. Como línea propia se entiende que es un coste de gestión de residuos y no un recargo tuyo.",
      },
    ],
    asunto: "Poda y adecuación de jardín",
    conceptos: [
      {
        concepto: "Poda de arbolado",
        descripcion: "Poda de formación y saneamiento de arbolado de porte medio.",
        cantidad: 6,
        unidad: "ud",
        precio: 65,
        iva: 21,
      },
      {
        concepto: "Recorte de seto",
        descripcion: "Recorte y perfilado de seto perimetral por metro lineal.",
        cantidad: 32,
        unidad: "ml",
        precio: 6.5,
        iva: 21,
      },
      {
        concepto: "Retirada de restos vegetales",
        descripcion: "Carga, transporte y entrega en punto de gestión de residuos autorizado.",
        cantidad: 1,
        unidad: "ud",
        precio: 180,
        iva: 21,
      },
      {
        concepto: "Mantenimiento mensual",
        descripcion:
          "Dos visitas al mes: siega, recorte de bordes, revisión de riego y retirada de restos.",
        cantidad: 1,
        unidad: "mes",
        precio: 145,
        iva: 21,
      },
    ],
    notas:
      "El mantenimiento mensual se factura por meses completos, con un preaviso de baja de 30 días.\n" +
      "Los trabajos de poda en altura que requieran plataforma elevadora se presupuestarían aparte.",
    irpf: 0,
  },
  {
    slug: "carpinteria",
    nombre: "Carpintería",
    profesional: "carpintero",
    emoji: "🪵",
    titulo: "Presupuesto de carpintería a medida en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto de carpintería y muebles a medida con materiales, herrajes, montaje y anticipo. Descarga en PDF.",
    h1: "Presupuesto de carpintería",
    entradilla:
      "Muebles a medida, armarios y puertas. Rellena las partidas y descarga el PDF con tu logo.",
    parrafos: [
      "En carpintería a medida el presupuesto se firma mucho antes de que exista el mueble, y eso obliga a ser muy concreto: medidas, material del tablero, canteado, herrajes y acabado. Todo lo que no esté escrito, el cliente se lo va a imaginar mejor de lo que va a ser.",
      "El anticipo no es opcional. Un mueble a medida no se puede revender, así que lo normal es cobrar un porcentaje al firmar, que cubra al menos el material. Déjalo escrito en las notas del presupuesto y no en una conversación.",
    ],
    incluir: [
      {
        titulo: "Medidas y material del tablero",
        texto:
          "Melamina, MDF lacado, chapa natural. El precio se multiplica entre uno y otro y es lo primero que compara el cliente.",
      },
      {
        titulo: "Herrajes por nombre",
        texto:
          "Bisagras con amortiguación, guías de extracción total, sistemas de apertura. Es lo que se nota al usar el mueble y lo que diferencia tu precio.",
      },
      {
        titulo: "Montaje y ajuste en obra",
        texto:
          "Incluye el ajuste a paredes que nunca están a escuadra. Si va aparte, dilo; si va incluido, dilo también.",
      },
      {
        titulo: "Anticipo y plazo de fabricación",
        texto:
          "Porcentaje al firmar y semanas de fabricación desde la aprobación de medidas definitivas, no desde la firma.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cuánto anticipo pido en un mueble a medida?",
        respuesta:
          "Entre el 40 % y el 50 % al firmar es lo habitual, porque cubre el material que ya no vas a poder usar en otro trabajo. Lo importante es que esté escrito en el presupuesto que el cliente acepta.",
      },
      {
        pregunta: "¿Desde cuándo cuenta el plazo de entrega?",
        respuesta:
          "Desde la aprobación de las medidas definitivas tomadas en obra, no desde la firma del presupuesto. Escríbelo así o cualquier retraso del cliente en dejarte medir se convierte en un retraso tuyo.",
      },
      {
        pregunta: "¿Incluyo el desmontaje del mueble antiguo?",
        respuesta:
          "Como línea aparte, con su retirada a punto limpio. Es trabajo y es transporte, y regalarlo por sistema resta un dinero que no se ve.",
      },
    ],
    asunto: "Armario empotrado a medida",
    conceptos: [
      {
        concepto: "Armario a medida",
        descripcion:
          "Cuerpo en melamina de 19 mm con canteado ABS, interior con balda y barra de colgar.",
        cantidad: 3.2,
        unidad: "m",
        precio: 340,
        iva: 21,
      },
      {
        concepto: "Frentes correderos",
        descripcion: "Puertas correderas con perfilería de aluminio y guía inferior amortiguada.",
        cantidad: 3,
        unidad: "ud",
        precio: 185,
        iva: 21,
      },
      {
        concepto: "Herrajes y accesorios",
        descripcion: "Bisagras con amortiguación, guías de extracción total y tiradores.",
        cantidad: 1,
        unidad: "ud",
        precio: 210,
        iva: 21,
      },
      {
        concepto: "Montaje y ajuste en obra",
        descripcion: "Transporte, montaje, nivelación y ajuste a paredes existentes.",
        cantidad: 1,
        unidad: "ud",
        precio: 320,
        iva: 21,
      },
    ],
    notas:
      "Plazo de fabricación: 4 semanas desde la aprobación de las medidas definitivas tomadas en obra.",
    irpf: 0,
    anticipo: 40,
  },
  {
    slug: "albanileria",
    nombre: "Albañilería",
    profesional: "albañil",
    emoji: "🧱",
    titulo: "Presupuesto de albañilería en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto de albañilería con mediciones, material, andamios y retirada de escombro. Descárgalo en PDF con tu logo.",
    h1: "Presupuesto de albañilería",
    entradilla:
      "Tabiquería, solados, enfoscados o pequeñas obras. Rellena las mediciones y descarga el PDF.",
    parrafos: [
      "En albañilería casi todo se mide, y ahí está la diferencia entre un presupuesto que se defiende y uno que no. Metros cuadrados de tabique, metros lineales de rodapié, metros cúbicos de escombro. Si el precio va a tanto alzado, cualquier metro de más sale de tu bolsillo.",
      "El otro punto que se olvida siempre es lo que no es obra: el andamio, el saco de escombro, la protección de lo que no se toca y las horas de limpieza. Son costes reales y, si no están escritos, el cliente da por hecho que están incluidos.",
    ],
    incluir: [
      {
        titulo: "Medición por partida",
        texto:
          "Metros de cada trabajo, no un precio global. Es lo que te permite ajustar el presupuesto si el cliente decide hacer una habitación menos.",
      },
      {
        titulo: "Retirada de escombro",
        texto:
          "Contenedor, sacos, transporte y tasa de vertedero. En una obra pequeña puede ser la partida que más sorprende al cliente.",
      },
      {
        titulo: "Medios auxiliares",
        texto:
          "Andamio, plataforma, alquiler de maquinaria. Si trabajas en altura o en fachada, esto no es un detalle: es una parte importante del coste.",
      },
      {
        titulo: "Qué queda sin acabar",
        texto:
          "Deja claro si entregas la pared lista para pintar o pintada, y si el remate de instalaciones lo hace otro gremio.",
      },
    ],
    faq: [
      {
        pregunta: "¿El escombro se cobra aparte?",
        respuesta:
          "Es lo más habitual y lo más transparente. Como partida propia, el cliente entiende que es un coste de gestión de residuos con su tasa, y no un recargo tuyo.",
      },
      {
        pregunta: "¿Cómo presupuesto si no sé lo que hay detrás del tabique?",
        respuesta:
          "Presupuesta con precio cerrado lo que se ve y deja los imprevistos como partida aparte, con precio por hora o por unidad, y el compromiso escrito de avisar antes de ejecutarla.",
      },
      {
        pregunta: "¿Necesito licencia de obra?",
        respuesta:
          "Depende del ayuntamiento y del alcance. En obra menor suele bastar una comunicación previa. En el presupuesto conviene indicar expresamente si la licencia la tramita y la paga el cliente.",
      },
    ],
    asunto: "Tabiquería y solado en local",
    conceptos: [
      {
        concepto: "Tabique de placa de yeso",
        descripcion: "Tabique de 10 cm con aislamiento interior, montado y listo para pintar.",
        cantidad: 28,
        unidad: "m²",
        precio: 38,
        iva: 21,
      },
      {
        concepto: "Solado de pavimento",
        descripcion: "Nivelación de base y colocación de pavimento porcelánico, incluido material.",
        cantidad: 45,
        unidad: "m²",
        precio: 42,
        iva: 21,
      },
      {
        concepto: "Enfoscado de paramentos",
        descripcion: "Enfoscado maestreado de mortero en paredes a regularizar.",
        cantidad: 18,
        unidad: "m²",
        precio: 24,
        iva: 21,
      },
      {
        concepto: "Retirada de escombro",
        descripcion: "Contenedor, carga, transporte y tasa de vertedero autorizado.",
        cantidad: 1,
        unidad: "ud",
        precio: 290,
        iva: 21,
      },
    ],
    notas:
      "Plazo estimado: 9 días laborables.\n" +
      "No incluye pintura, instalación eléctrica ni fontanería.\n" +
      "Los imprevistos que aparezcan al abrir se presupuestarán aparte, previo aviso.",
    irpf: 0,
    anticipo: 30,
  },
  {
    slug: "climatizacion",
    nombre: "Climatización",
    profesional: "instalador",
    emoji: "❄️",
    titulo: "Presupuesto de aire acondicionado en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto de climatización: equipo, instalación, material frigorífico y puesta en marcha. Descárgalo en PDF.",
    h1: "Presupuesto de climatización",
    entradilla:
      "Aire acondicionado, aerotermia o mantenimiento. Rellena las partidas y descarga el PDF.",
    parrafos: [
      "En climatización el cliente solo mira una cosa: el precio del equipo. Y el equipo es la mitad del trabajo. La instalación, la línea frigorífica, el desagüe, la conexión eléctrica y la puesta en marcha son lo que hace que ese equipo funcione y dure, y tienen que estar valorados por separado para que se vean.",
      "Separar equipo e instalación tiene además una ventaja práctica: si el cliente encuentra la máquina más barata por internet, tu presupuesto de instalación sigue siendo válido sin rehacerlo.",
    ],
    incluir: [
      {
        titulo: "Modelo y potencia del equipo",
        texto:
          "Marca, modelo y frigorías. Sin eso, cualquier presupuesto con una máquina de gama baja parecerá más barato que el tuyo.",
      },
      {
        titulo: "Metros de línea frigorífica",
        texto:
          "Es lo que más varía entre una instalación y otra. Indica los metros incluidos y el precio del metro adicional.",
      },
      {
        titulo: "Desagüe y conexión eléctrica",
        texto:
          "Si hay que llevar el condensado hasta un bajante o tirar una línea nueva al cuadro, es trabajo y es material.",
      },
      {
        titulo: "Puesta en marcha y garantía",
        texto:
          "Carga de gas, comprobación y documentación. Muchas garantías del fabricante exigen instalador autorizado: dilo, es un argumento de venta.",
      },
    ],
    faq: [
      {
        pregunta: "¿Incluyo el equipo en el presupuesto?",
        respuesta:
          "Sí, pero en su propia línea y con marca y modelo. Así el cliente puede comparar de verdad y tu instalación no queda diluida dentro de un precio único.",
      },
      {
        pregunta: "¿Qué IVA lleva instalar aire acondicionado en una vivienda?",
        respuesta:
          "Con carácter general el 21 %. Puede aplicarse el 10 % cuando la instalación forma parte de una obra de renovación de vivienda que cumpla los requisitos legales. Confírmalo con tu asesor antes de aplicarlo.",
      },
      {
        pregunta: "¿Cómo presupuesto un mantenimiento anual?",
        respuesta:
          "Como una línea con unidad 'mes' o 'ud' según cobres cuota o revisión, detallando cuántas visitas incluye y qué se hace en cada una.",
      },
    ],
    asunto: "Instalación de equipo de aire acondicionado",
    conceptos: [
      {
        concepto: "Equipo split inverter",
        descripcion: "Unidad interior y exterior de 3.500 frigorías, clase A++, con mando.",
        cantidad: 1,
        unidad: "ud",
        precio: 720,
        iva: 21,
      },
      {
        concepto: "Instalación y puesta en marcha",
        descripcion: "Montaje de unidades, vacío, carga y comprobación de funcionamiento.",
        cantidad: 1,
        unidad: "ud",
        precio: 340,
        iva: 21,
      },
      {
        concepto: "Línea frigorífica",
        descripcion: "Tubería de cobre aislada, incluido canaleta y sellado de pasos.",
        cantidad: 6,
        unidad: "ml",
        precio: 28,
        iva: 21,
      },
      {
        concepto: "Bomba de condensados",
        descripcion: "Bomba silenciosa para evacuar el agua cuando no hay desagüe por gravedad.",
        cantidad: 1,
        unidad: "ud",
        precio: 145,
        iva: 21,
        opcional: true,
      },
    ],
    notas:
      "Garantía del fabricante de 3 años en el equipo y 1 año en la instalación.\n" +
      "Incluye 6 metros de línea frigorífica; el metro adicional se factura a 28 €.",
    irpf: 0,
  },
  {
    slug: "cerrajeria",
    nombre: "Cerrajería",
    profesional: "cerrajero",
    emoji: "🔐",
    titulo: "Presupuesto de cerrajería en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto de cerrajería para puertas, rejas y cierres, con material, mano de obra y desplazamiento. Descárgalo en PDF.",
    h1: "Presupuesto de cerrajería",
    entradilla:
      "Puertas acorazadas, rejas, cierres metálicos y trabajos a medida. Rellena y descarga el PDF.",
    parrafos: [
      "La cerrajería tiene dos mundos muy distintos: la urgencia, que se cobra por salida, y el trabajo a medida, que se fabrica y se instala. Mezclarlos en el mismo presupuesto confunde al cliente y te deja sin defender el precio de ninguno de los dos.",
      "En el trabajo a medida, lo que se presupuesta es acero, medidas y acabado. Indicar el espesor del perfil, el tipo de cerradura y el acabado es lo que separa tu precio del de un competidor que usa material de menos calidad.",
    ],
    incluir: [
      {
        titulo: "Medidas y material",
        texto:
          "Medidas reales tomadas en obra, perfil, espesor y acabado. Un presupuesto de reja sin medidas no vale nada.",
      },
      {
        titulo: "Marca y nivel de la cerradura",
        texto:
          "En seguridad, la cerradura es el producto. Nómbrala: es lo que justifica la diferencia de precio con la oferta barata.",
      },
      {
        titulo: "Desplazamiento y urgencia",
        texto:
          "Salida en horario normal, nocturno o festivo. Con precios distintos y escritos, porque es donde más reclamaciones hay.",
      },
      {
        titulo: "Retirada de lo antiguo",
        texto:
          "Desmontaje de la puerta o reja anterior y su retirada a punto limpio, si la asumes tú.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cómo presupuesto una urgencia por la noche?",
        respuesta:
          "Con un precio de salida cerrado que cubra desplazamiento y la primera intervención, y el resto por horas o por trabajo. Comunícalo por escrito antes de salir, aunque sea por WhatsApp.",
      },
      {
        pregunta: "¿Doy garantía de una apertura?",
        respuesta:
          "De la apertura en sí no suele darse garantía, pero sí del material que instalas. Especifica en el presupuesto qué cubre y durante cuánto tiempo.",
      },
      {
        pregunta: "¿Debo pedir anticipo en un trabajo a medida?",
        respuesta:
          "Sí. Una reja fabricada con unas medidas concretas no se puede vender a otro cliente. Un anticipo que cubra el material es lo razonable, y debe estar escrito en el presupuesto.",
      },
    ],
    asunto: "Sustitución de puerta acorazada",
    conceptos: [
      {
        concepto: "Puerta acorazada",
        descripcion: "Puerta de grado 3 con cerradura de seguridad y acabado en madera a elegir.",
        cantidad: 1,
        unidad: "ud",
        precio: 1150,
        iva: 21,
      },
      {
        concepto: "Desmontaje y retirada",
        descripcion: "Retirada de la puerta anterior y transporte a punto limpio.",
        cantidad: 1,
        unidad: "ud",
        precio: 120,
        iva: 21,
      },
      {
        concepto: "Instalación y ajuste",
        descripcion: "Montaje de cerco, nivelación, ajuste de hoja y remate de albañilería.",
        cantidad: 1,
        unidad: "ud",
        precio: 280,
        iva: 21,
      },
      {
        concepto: "Cerradura de alta seguridad",
        descripcion: "Mejora a bombín antibumping y antitaladro con llave de copia protegida.",
        cantidad: 1,
        unidad: "ud",
        precio: 165,
        iva: 21,
        opcional: true,
      },
    ],
    notas:
      "Plazo de entrega: 3 semanas desde la aceptación y la toma de medidas definitiva.\n" +
      "Garantía de 2 años sobre el material y la instalación.",
    irpf: 0,
    anticipo: 40,
  },
  {
    slug: "mudanzas",
    nombre: "Mudanzas",
    profesional: "transportista",
    emoji: "📦",
    titulo: "Presupuesto de mudanza en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto de mudanza con embalaje, portes, mano de obra y seguro. Rellénalo y descárgalo en PDF.",
    h1: "Presupuesto de mudanza",
    entradilla:
      "Mudanzas de vivienda o de oficina. Rellena las partidas, revisa el total y descarga el PDF.",
    parrafos: [
      "En una mudanza el precio depende de tres cosas que el cliente no menciona por teléfono: el volumen real, si hay ascensor y si hay que pedir permiso de estacionamiento. Presupuestar sin haberlas preguntado es la forma más rápida de perder dinero en un día de trabajo.",
      "Conviene también separar el porte del embalaje. Mucha gente embala por su cuenta para ahorrar; si va todo en un precio único, no puedes ofrecerle esa opción sin rehacer el presupuesto entero.",
    ],
    incluir: [
      {
        titulo: "Volumen estimado y origen y destino",
        texto:
          "Metros cúbicos aproximados y las dos direcciones. Es la base del precio y lo primero que se discute si luego no cuadra.",
      },
      {
        titulo: "Planta, ascensor y distancia de portes",
        texto:
          "Subir a un cuarto sin ascensor no es lo mismo que a un bajo. Y si el camión no puede aparcar en la puerta, los metros de acarreo cuentan.",
      },
      {
        titulo: "Embalaje y desmontaje",
        texto:
          "Cajas, papel, plástico de burbujas y el desmontaje y montaje de muebles. Con precio propio, para que el cliente pueda elegir.",
      },
      {
        titulo: "Seguro y permisos",
        texto:
          "Cobertura de la mercancía y, si hace falta, la reserva de estacionamiento en el ayuntamiento. Son costes reales que el cliente no espera.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cómo calculo el volumen sin ir a ver la casa?",
        respuesta:
          "Puedes estimarlo por metros cuadrados y número de habitaciones, pero deja escrito en el presupuesto que es una estimación sobre los datos que ha facilitado el cliente y que un volumen mayor se revisará antes de cargar.",
      },
      {
        pregunta: "¿El seguro va incluido?",
        respuesta:
          "Indica siempre qué cobertura llevas y hasta qué importe. Si el cliente quiere una cobertura ampliada por objetos de valor, es una línea más del presupuesto.",
      },
      {
        pregunta: "¿Quién pide el permiso de estacionamiento?",
        respuesta:
          "Déjalo escrito. Si lo tramitas tú, es una partida con su tasa; si lo pide el cliente, que quede claro que sin él la mudanza puede no poder hacerse ese día.",
      },
    ],
    asunto: "Mudanza de vivienda de 3 dormitorios",
    conceptos: [
      {
        concepto: "Servicio de mudanza",
        descripcion: "Equipo de 3 operarios y camión, jornada completa, origen y destino en la misma ciudad.",
        cantidad: 1,
        unidad: "día",
        precio: 780,
        iva: 21,
      },
      {
        concepto: "Embalaje",
        descripcion: "Cajas, papel, plástico de burbujas y protección de muebles.",
        cantidad: 1,
        unidad: "ud",
        precio: 220,
        iva: 21,
      },
      {
        concepto: "Desmontaje y montaje de muebles",
        descripcion: "Armarios, camas y estanterías, con el mismo montador en origen y destino.",
        cantidad: 6,
        unidad: "h",
        precio: 32,
        iva: 21,
      },
      {
        concepto: "Reserva de estacionamiento",
        descripcion: "Tramitación del permiso municipal y colocación de señalización.",
        cantidad: 2,
        unidad: "ud",
        precio: 65,
        iva: 21,
        opcional: true,
      },
    ],
    notas:
      "El volumen se ha estimado con los datos facilitados por el cliente. Un volumen sensiblemente mayor se revisaría antes de cargar.\n" +
      "Incluye seguro de la mercancía durante el transporte.",
    irpf: 0,
  },
  {
    slug: "limpieza",
    nombre: "Limpieza",
    profesional: "profesional de la limpieza",
    emoji: "🧽",
    titulo: "Presupuesto de limpieza en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto de limpieza para fin de obra, comunidades y oficinas, con cuota mensual o servicio puntual. Descárgalo en PDF.",
    h1: "Presupuesto de limpieza",
    entradilla:
      "Fin de obra, comunidades, oficinas o servicios puntuales. Con cuota mensual si es recurrente.",
    parrafos: [
      "La limpieza se presupuesta de dos formas y conviene no mezclarlas: por servicio puntual, que se cobra por metros o por horas, y por contrato recurrente, que se cobra por cuota mensual con un número de visitas.",
      "En el contrato recurrente el presupuesto es en realidad la propuesta de contrato, y todo lo que no esté escrito acabará pidiéndose sin cobrarse: cristales, zonas comunes, moqueta o el fin de semana. Detallar qué incluye cada visita es lo que protege el margen.",
    ],
    incluir: [
      {
        titulo: "Metros y frecuencia",
        texto:
          "Superficie a limpiar y cuántas visitas al mes. Sin las dos cifras, la cuota no se puede defender ni revisar.",
      },
      {
        titulo: "Qué incluye cada visita",
        texto:
          "Tareas concretas y las que quedan fuera. Los cristales en altura y la limpieza de moqueta son las dos que siempre se dan por supuestas.",
      },
      {
        titulo: "Productos y maquinaria",
        texto:
          "Si aportas el material, dilo. Y si hace falta rotativa, hidrolimpiadora o plataforma, es una partida propia.",
      },
      {
        titulo: "Permanencia y preaviso",
        texto:
          "En los contratos mensuales, cuánto dura el compromiso y con cuánta antelación se puede dar de baja.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cobro por horas o por metros?",
        respuesta:
          "Por metros en fin de obra y en superficies grandes, porque es medible y comparable. Por horas en servicios irregulares o en los que no puedes prever el estado. En los dos casos, escríbelo.",
      },
      {
        pregunta: "¿Cómo presupuesto una limpieza de fin de obra?",
        respuesta:
          "Por metros cuadrados y con una línea aparte para la retirada de restos y para los cristales. Es la limpieza que más se subestima: el polvo de obra multiplica las horas.",
      },
      {
        pregunta: "¿Qué pongo en un contrato de comunidad?",
        respuesta:
          "Cuota mensual, número de visitas, horario y las tareas exactas de cada una. Y quién pone el material. Las comunidades cambian de presidente, y lo único que queda es lo escrito.",
      },
    ],
    asunto: "Limpieza de fin de obra y mantenimiento",
    conceptos: [
      {
        concepto: "Limpieza de fin de obra",
        descripcion: "Retirada de restos, desempolvado, fregado y limpieza de sanitarios y cocina.",
        cantidad: 95,
        unidad: "m²",
        precio: 4.2,
        iva: 21,
      },
      {
        concepto: "Limpieza de cristales",
        descripcion: "Cristales por las dos caras, incluidos marcos y persianas.",
        cantidad: 14,
        unidad: "ud",
        precio: 9,
        iva: 21,
      },
      {
        concepto: "Mantenimiento mensual",
        descripcion: "Cuatro visitas al mes de 3 horas, con material incluido.",
        cantidad: 1,
        unidad: "mes",
        precio: 260,
        iva: 21,
      },
      {
        concepto: "Tratamiento de suelo",
        descripcion: "Decapado y sellado con rotativa, una vez al año.",
        cantidad: 95,
        unidad: "m²",
        precio: 3.5,
        iva: 21,
        opcional: true,
      },
    ],
    notas:
      "El mantenimiento mensual se factura por meses completos, con un preaviso de baja de 30 días.\n" +
      "Los productos y la maquinaria los aporta la empresa.",
    irpf: 0,
  },
  {
    slug: "fotografia",
    nombre: "Fotografía",
    profesional: "fotógrafo",
    emoji: "📷",
    titulo: "Presupuesto de fotografía en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto para fotógrafos: sesión, edición, entrega y cesión de derechos, con retención de IRPF. Descarga en PDF.",
    h1: "Presupuesto de fotografía",
    entradilla:
      "Sesiones, eventos y trabajo comercial. Con retención de IRPF cuando facturas a empresas.",
    parrafos: [
      "El error más caro en fotografía es presupuestar solo el día de trabajo. La sesión son unas horas; la edición, la selección y la entrega son días. Si el precio no las refleja, estás trabajando gratis en la mitad del encargo.",
      "El otro punto crítico es la cesión de derechos. No es lo mismo entregar fotos para el Instagram de un restaurante que para una campaña en vallas publicitarias. El uso, el ámbito y la duración tienen que estar en el presupuesto, porque son parte del precio.",
    ],
    incluir: [
      {
        titulo: "Horas de sesión y de edición",
        texto:
          "Por separado. Es la única forma de que el cliente entienda por qué media jornada de fotos no cuesta media jornada de trabajo.",
      },
      {
        titulo: "Número de imágenes entregadas",
        texto:
          "Cuántas van editadas y en qué formato. Y el precio de cada imagen adicional, que siempre las piden.",
      },
      {
        titulo: "Cesión de derechos",
        texto:
          "Uso concreto, ámbito geográfico y duración. Sin esto, el cliente asume que puede usar las fotos para todo y para siempre.",
      },
      {
        titulo: "Retención de IRPF",
        texto:
          "Si facturas a una empresa, la factura llevará retención. Reflejarlo ya en el presupuesto evita la sorpresa de que el importe a pagar no coincide.",
      },
    ],
    faq: [
      {
        pregunta: "¿Pongo la retención de IRPF en el presupuesto?",
        respuesta:
          "Si el cliente es una empresa o un profesional, sí. Verá el total con la retención descontada y sabrá exactamente qué te va a transferir. Puedes activar el 7 % o el 15 % en la herramienta.",
      },
      {
        pregunta: "¿Cómo cobro los derechos de uso?",
        respuesta:
          "Como una línea propia del presupuesto, describiendo el uso, el ámbito y los años de cesión. Así queda claro que la ampliación de uso se cobra aparte.",
      },
      {
        pregunta: "¿Cuántas fotos entrego?",
        respuesta:
          "Un número cerrado, escrito en el presupuesto, y un precio por imagen extra. Entregar 'las que salgan bien' es la vía rápida a una discusión al entregar.",
      },
    ],
    asunto: "Reportaje fotográfico de producto",
    conceptos: [
      {
        concepto: "Sesión fotográfica",
        descripcion: "Jornada de producción en estudio, incluye iluminación y atrezo básico.",
        cantidad: 1,
        unidad: "día",
        precio: 650,
        iva: 21,
      },
      {
        concepto: "Edición y retoque",
        descripcion: "Selección, revelado y retoque de 30 imágenes finales en alta resolución.",
        cantidad: 12,
        unidad: "h",
        precio: 45,
        iva: 21,
      },
      {
        concepto: "Cesión de derechos de uso",
        descripcion:
          "Uso comercial en web y redes sociales del cliente, ámbito nacional, durante 2 años.",
        cantidad: 1,
        unidad: "ud",
        precio: 400,
        iva: 21,
      },
      {
        concepto: "Imagen adicional",
        descripcion: "Precio por cada fotografía editada fuera de las 30 incluidas.",
        cantidad: 1,
        unidad: "ud",
        precio: 25,
        iva: 21,
      },
    ],
    notas:
      "Entrega en 10 días laborables desde la sesión, mediante enlace de descarga.\n" +
      "La ampliación del uso, el ámbito o la duración de la cesión se presupuestará aparte.",
    irpf: 15,
  },
  {
    slug: "diseno-web",
    nombre: "Diseño web",
    profesional: "diseñador",
    emoji: "💻",
    titulo: "Presupuesto de diseño web en PDF | PresupPRO",
    descripcion:
      "Modelo de presupuesto de diseño y desarrollo web con fases, rondas de revisión, mantenimiento y retención de IRPF. Descarga en PDF.",
    h1: "Presupuesto de diseño web",
    entradilla:
      "Webs, tiendas y rediseños. Con fases, rondas de revisión y retención de IRPF si facturas a empresas.",
    parrafos: [
      "En diseño web, lo que arruina la rentabilidad de un proyecto casi nunca es el precio: son las revisiones infinitas. Un presupuesto que no dice cuántas rondas de cambios incluye es un presupuesto abierto, y el cliente no tiene por qué adivinar dónde está el límite.",
      "Conviene también separar lo que es diseño, lo que es desarrollo y lo que es contenido. El cliente que 'ya tiene los textos' casi nunca los tiene, y esa partida, si está presupuestada aparte, se puede activar sin renegociar el proyecto entero.",
    ],
    incluir: [
      {
        titulo: "Rondas de revisión incluidas",
        texto:
          "Dos suele ser lo razonable, y el precio de las siguientes. Es la cláusula que más dinero salva de todo el presupuesto.",
      },
      {
        titulo: "Qué pasa con el contenido",
        texto:
          "Quién escribe los textos y quién aporta las imágenes. Si lo aportas tú, es una partida; si lo aporta el cliente, es una dependencia que puede parar el proyecto.",
      },
      {
        titulo: "Dominio, alojamiento y mantenimiento",
        texto:
          "Son costes recurrentes y no tuyos. Deja claro si los repercutes, si los contrata el cliente y qué incluye el mantenimiento mensual.",
      },
      {
        titulo: "Qué se entrega y en qué condiciones",
        texto:
          "Código, accesos, propiedad del diseño. Y si hay una fase de garantía para corregir errores tras la publicación.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cómo evito las revisiones infinitas?",
        respuesta:
          "Escribiendo en el presupuesto cuántas rondas de cambios incluye cada fase y el precio por hora de las adicionales. No es desconfianza: es lo que permite dar un precio cerrado.",
      },
      {
        pregunta: "¿Cobro por fases o al final?",
        respuesta:
          "Por fases, con un anticipo al arrancar. En proyectos de varias semanas, cobrar solo al entregar te convierte en el banco del cliente.",
      },
      {
        pregunta: "¿Aplico retención de IRPF?",
        respuesta:
          "Si tu cliente es una empresa o un profesional y estás en estimación directa, sí. La herramienta te permite añadir el 7 % de nuevo autónomo o el 15 % general y verlo descontado en el total.",
      },
    ],
    asunto: "Diseño y desarrollo de web corporativa",
    conceptos: [
      {
        concepto: "Diseño de interfaz",
        descripcion:
          "Propuesta visual y diseño de 6 plantillas de página. Incluye 2 rondas de revisión.",
        cantidad: 1,
        unidad: "ud",
        precio: 1200,
        iva: 21,
      },
      {
        concepto: "Desarrollo e integración",
        descripcion: "Maquetación responsive, gestor de contenidos y formularios de contacto.",
        cantidad: 40,
        unidad: "h",
        precio: 45,
        iva: 21,
      },
      {
        concepto: "Puesta en marcha",
        descripcion: "Configuración de dominio y alojamiento, certificado y analítica.",
        cantidad: 1,
        unidad: "ud",
        precio: 250,
        iva: 21,
      },
      {
        concepto: "Mantenimiento mensual",
        descripcion: "Copias de seguridad, actualizaciones y 1 hora de cambios al mes.",
        cantidad: 1,
        unidad: "mes",
        precio: 60,
        iva: 21,
      },
    ],
    notas:
      "Incluye 2 rondas de revisión por fase. Las revisiones adicionales se facturan a 45 €/hora.\n" +
      "Los textos y las imágenes los aporta el cliente. El plazo se cuenta desde su entrega completa.\n" +
      "Forma de pago: 40 % al aceptar, 30 % al aprobar el diseño y 30 % a la publicación.",
    irpf: 15,
  },
];

export function buscarOficio(slug: string | null | undefined): Oficio | undefined {
  if (!slug) return undefined;
  return OFICIOS.find((o) => o.slug === slug);
}

/** Vuelca la plantilla de un oficio sobre un presupuesto, respetando los datos del emisor. */
export function aplicarOficio(base: Presupuesto, oficio: Oficio): Presupuesto {
  return {
    ...base,
    actualizado: Date.now(),
    titulo: oficio.asunto,
    notas: oficio.notas,
    irpf: oficio.irpf,
    anticipo: oficio.anticipo ?? 0,
    lineas: oficio.conceptos.map((concepto) => ({
      ...nuevaLinea(),
      ...concepto,
    })),
  };
}
