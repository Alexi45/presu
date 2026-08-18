/**
 * Textos legales de partida.
 *
 * Son plantillas redactadas para el caso concreto de Presu (producto digital,
 * sin registro, con los datos en el navegador salvo la descarga de pago, y
 * cobro por Stripe). Los datos fiscales
 * del titular están marcados con la clase `hueco` para que no se olvide
 * rellenarlos: publicar esto con los huecos puestos es peor que no publicarlo.
 *
 * No sustituyen a la revisión de un asesor.
 */

const hueco = (texto) => `<span class="hueco">${texto}</span>`;

export const TITULAR = {
  nombre: hueco("NOMBRE Y APELLIDOS O RAZÓN SOCIAL"),
  nif: hueco("NIF/CIF"),
  domicilio: hueco("DOMICILIO COMPLETO"),
  email: hueco("CORREO DE CONTACTO"),
};

export const LEGALES = [
  {
    slug: "aviso-legal",
    titulo: "Aviso legal | Presu",
    h1: "Aviso legal",
    descripcion:
      "Información sobre el titular del sitio web Presu, condiciones de uso y propiedad intelectual.",
    cuerpo: `
<p>En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico, se informa de los siguientes datos:</p>

<h2>Titular del sitio web</h2>
<ul>
  <li><strong>Titular:</strong> ${TITULAR.nombre}</li>
  <li><strong>NIF:</strong> ${TITULAR.nif}</li>
  <li><strong>Domicilio:</strong> ${TITULAR.domicilio}</li>
  <li><strong>Correo electrónico:</strong> ${TITULAR.email}</li>
  <li><strong>Actividad:</strong> desarrollo y explotación de una herramienta web para la elaboración de presupuestos.</li>
</ul>

<h2>Objeto</h2>
<p>Presu es una herramienta que permite elaborar documentos de presupuesto y descargarlos en formato PDF. El uso de la herramienta es libre y no requiere registro. Determinadas funciones están sujetas a pago según se detalla en las <a href="/condiciones/">condiciones de contratación</a>.</p>

<h2>Condiciones de uso</h2>
<p>El acceso a este sitio web es gratuito y su uso implica la aceptación de este aviso legal. El usuario se compromete a utilizar la herramienta conforme a la ley y a no emplearla para elaborar documentos con finalidad fraudulenta o para suplantar la identidad de terceros.</p>
<p>El usuario es el único responsable del contenido de los presupuestos que elabora: de los importes, de los tipos impositivos que aplica, de la exactitud de los datos fiscales que introduce y del cumplimiento de sus propias obligaciones tributarias y contractuales.</p>

<h2>Naturaleza de los documentos generados</h2>
<p>Los documentos que genera esta herramienta son presupuestos, esto es, ofertas de precio. <strong>No son facturas</strong> ni tienen efectos fiscales, y no cumplen los requisitos del Reglamento de facturación ni de la normativa sobre sistemas informáticos de facturación. Para emitir facturas debe utilizarse un sistema que cumpla dicha normativa.</p>

<h2>Propiedad intelectual</h2>
<p>El diseño del sitio, su código y los textos son titularidad del prestador, salvo indicación en contrario. Los presupuestos elaborados por el usuario y los datos que introduce en ellos son de su exclusiva propiedad.</p>

<h2>Exclusión de responsabilidad</h2>
<p>La herramienta se ofrece «tal cual». El prestador no garantiza la disponibilidad ininterrumpida del servicio ni responde de los daños derivados de errores de cálculo, de la pérdida de presupuestos guardados en el navegador del usuario o del uso que este haga de los documentos generados. Se recomienda al usuario descargar en PDF los presupuestos que desee conservar.</p>

<h2>Legislación aplicable</h2>
<p>Esta relación se rige por la legislación española. Para la resolución de controversias, las partes se someten a los juzgados y tribunales del domicilio del consumidor cuando el usuario tenga tal condición.</p>
`,
  },
  {
    slug: "privacidad",
    titulo: "Política de privacidad | Presu",
    h1: "Política de privacidad",
    descripcion:
      "Qué datos trata Presu, dónde se guardan los presupuestos y cuáles son tus derechos.",
    cuerpo: `
<p>Esta política explica cómo se tratan los datos personales en Presu. La versión corta: <strong>los presupuestos que elaboras no salen de tu navegador, salvo cuando compras la descarga sin marca de agua</strong>, que se genera en nuestro servidor y para eso necesita el contenido del documento.</p>

<h2>Responsable del tratamiento</h2>
<ul>
  <li><strong>Responsable:</strong> ${TITULAR.nombre}</li>
  <li><strong>NIF:</strong> ${TITULAR.nif}</li>
  <li><strong>Domicilio:</strong> ${TITULAR.domicilio}</li>
  <li><strong>Contacto:</strong> ${TITULAR.email}</li>
</ul>

<h2>Datos de los presupuestos</h2>
<p>Los datos que introduces al elaborar un presupuesto —los tuyos, los de tu cliente, los conceptos y los importes— se guardan exclusivamente en el almacenamiento local de tu navegador. No se envían a ningún servidor, no se almacenan en ninguna base de datos y el titular de este sitio no tiene acceso a ellos ni posibilidad de recuperarlos.</p>
<p><strong>Hay una única excepción, y conviene que la conozcas:</strong> cuando descargas un presupuesto sin marca de agua, el contenido de ese presupuesto se envía a nuestro servidor, que lo utiliza para componer el PDF y te lo devuelve. Es necesario porque la versión sin marca solo se genera en el servidor; es lo que impide obtenerla sin pagar. Ese contenido se emplea únicamente para generar el archivo de esa petición y no se guarda en ninguna base de datos ni registro. La descarga gratuita con marca de agua se genera íntegramente en tu navegador y no envía nada.</p>
<p>Esto tiene una consecuencia importante para ti: si borras los datos de navegación, usas el modo privado o cambias de dispositivo, esos presupuestos se pierden y no pueden restaurarse. Descarga en PDF los que quieras conservar.</p>
<p>Si en tus presupuestos incluyes datos personales de tus clientes, el responsable de ese tratamiento eres tú, no este sitio.</p>

<h2>Datos de pago</h2>
<p>Los pagos se procesan íntegramente a través de <strong>Stripe Payments Europe, Ltd.</strong>, que actúa como responsable independiente del tratamiento de los datos de pago. Este sitio no recibe, no ve y no almacena los datos de tu tarjeta. Stripe trata los datos necesarios para ejecutar el cobro y para el cumplimiento de sus obligaciones legales, conforme a su propia política de privacidad.</p>
<ul>
  <li><strong>Finalidad:</strong> gestionar el cobro del producto contratado, emitir el justificante correspondiente y generar el documento adquirido.</li>
  <li><strong>Base jurídica:</strong> la ejecución del contrato en el que eres parte (art. 6.1.b RGPD) y el cumplimiento de obligaciones legales fiscales y contables (art. 6.1.c RGPD).</li>
  <li><strong>Conservación:</strong> los justificantes de las operaciones se conservan durante los plazos exigidos por la normativa mercantil y fiscal.</li>
</ul>

<h2>Cookies</h2>
<p>Este sitio no utiliza cookies de analítica, de publicidad ni de seguimiento, y por tanto no muestra ningún banner de consentimiento. El almacenamiento local que se emplea para guardar tus presupuestos y tu licencia es técnicamente necesario para que la herramienta funcione, permanece en tu equipo y no se utiliza para identificarte ni para perfilarte.</p>
<p>Las tipografías se cargan desde Google Fonts, lo que implica que tu navegador realiza una petición a servidores de Google y que este puede tratar tu dirección IP conforme a sus propias políticas.</p>

<h2>Destinatarios</h2>
<p>No se ceden datos a terceros salvo a los proveedores necesarios para prestar el servicio: el proveedor de alojamiento del sitio web y de las funciones que generan el PDF de pago, y Stripe como procesador de pagos. No se realizan transferencias internacionales al margen de las que dichos proveedores efectúen bajo las garantías previstas en el RGPD.</p>

<h2>Tus derechos</h2>
<p>Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a ${TITULAR.email}. Ten en cuenta que, respecto de los presupuestos guardados en tu navegador, el ejercicio del derecho de supresión está enteramente en tu mano: basta con borrarlos desde la propia herramienta o limpiar el almacenamiento del navegador.</p>
<p>Si consideras que tus derechos no han sido debidamente atendidos, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="nofollow noopener" target="_blank">aepd.es</a>).</p>
`,
  },
  {
    slug: "condiciones",
    titulo: "Condiciones de contratación | Presu",
    h1: "Condiciones de contratación",
    descripcion:
      "Precios, forma de pago, entrega y derecho de desistimiento de los productos de pago de Presu.",
    cuerpo: `
<p>Estas condiciones regulan la contratación de los productos de pago de Presu. Elaborar y previsualizar presupuestos es gratuito y no requiere aceptar estas condiciones.</p>

<h2>Qué se contrata</h2>
<p>La herramienta permite descargar gratuitamente el presupuesto en PDF con una marca de agua. Los productos de pago consisten en la supresión de esa marca de agua:</p>
<ul>
  <li><strong>Pago único (7 €, IVA incluido):</strong> da derecho a descargar sin marca de agua <strong>el presupuesto concreto</strong> que estaba en pantalla al realizar la compra, tantas veces como se quiera. No cubre otros presupuestos distintos.</li>
  <li><strong>Suscripción mensual (19 €/mes, IVA incluido):</strong> permite descargar sin marca de agua todos los presupuestos que se elaboren mientras la suscripción esté activa, con renovación mensual hasta su cancelación.</li>
</ul>
<p>Se trata en ambos casos de contenido digital que no se suministra en soporte material.</p>

<h2>Precios y pago</h2>
<p>Los precios se muestran en euros con los impuestos incluidos. El pago se realiza mediante tarjeta a través de la pasarela de Stripe. La contratación se perfecciona cuando Stripe confirma el cobro y el usuario es devuelto a este sitio.</p>

<h2>Entrega</h2>
<p>La entrega es inmediata y automática: al volver de la pasarela de pago se comprueba el cobro con Stripe y queda activada la descarga sin marca de agua en el navegador utilizado. Si el usuario cambia de navegador, de dispositivo o borra los datos de navegación, deberá contactar con el titular para que se le restablezca el acceso, aportando el justificante de la compra.</p>

<h2>Derecho de desistimiento</h2>
<p>De acuerdo con el artículo 103.m) del texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios, el derecho de desistimiento no resulta aplicable al suministro de contenido digital que no se preste en soporte material cuando la ejecución haya comenzado con el consentimiento previo y expreso del consumidor y con su conocimiento de que pierde por ello el derecho de desistimiento.</p>
<p>Al completar el pago, el usuario solicita expresamente la ejecución inmediata y reconoce que, una vez activada la descarga sin marca de agua, pierde el derecho de desistimiento sobre el pago único.</p>
<p>En el caso de la suscripción mensual, el usuario puede cancelarla en cualquier momento con efectos al final del periodo ya facturado, sin penalización. Los periodos ya consumidos no son reembolsables. La baja se hace desde el propio sitio, en el enlace «Gestionar o cancelar la suscripción», que abre el portal de facturación donde además pueden consultarse y descargarse los recibos. No hace falta escribir ni llamar a nadie.</p>

<h2>Si algo no funciona</h2>
<p>Si el producto contratado no se activa o el PDF no se genera correctamente, escribe a ${TITULAR.email} describiendo el problema. Si no puede resolverse, se devolverá el importe íntegro.</p>

<h2>Atención al cliente y reclamaciones</h2>
<p>Para cualquier consulta o reclamación: ${TITULAR.email}. La Comisión Europea pone a disposición de los consumidores una plataforma de resolución de litigios en línea accesible desde su sitio web oficial.</p>

<h2>Legislación aplicable</h2>
<p>Estas condiciones se rigen por la legislación española.</p>
`,
  },
];
