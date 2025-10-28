import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Condiciones del Servicio | Mapa Furgocasa',
  description: 'Términos y condiciones de uso de Mapa Furgocasa',
}

export default function CondicionesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-block mb-4">
            <Image 
              src="/logo-negro.png" 
              alt="Furgocasa" 
              width={150} 
              height={60}
              className="h-12 w-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Condiciones del Servicio</h1>
          <p className="text-gray-600 mt-2">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Bienvenido a <strong>Mapa Furgocasa</strong>. Al acceder y utilizar nuestra plataforma web, aplicación móvil y servicios 
              relacionados (en adelante, "el Servicio"), aceptas estar sujeto a estos Términos y Condiciones de Uso (en adelante, "Términos"). 
              Si no estás de acuerdo con alguna parte de estos Términos, no debes utilizar nuestro Servicio.
            </p>
          </section>

          {/* Descripción del servicio */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Mapa Furgocasa es una plataforma digital que permite a los usuarios:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Descubrir y localizar áreas de estacionamiento para autocaravanas, campers y furgonetas camperizadas en España.</li>
              <li>Consultar información detallada sobre servicios, precios, ubicación y características de cada área.</li>
              <li>Crear y compartir valoraciones, comentarios y fotografías de las áreas visitadas.</li>
              <li>Planificar rutas personalizadas y guardar áreas favoritas.</li>
              <li>Acceder a estadísticas y mapas interactivos de visitas.</li>
            </ul>
          </section>

          {/* Registro y cuenta */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registro y Cuenta de Usuario</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1. Creación de cuenta</h3>
                <p className="text-gray-700">
                  Para acceder a ciertas funcionalidades del Servicio, debes crear una cuenta proporcionando información precisa, 
                  completa y actualizada. Puedes registrarte mediante correo electrónico y contraseña, o utilizando servicios de 
                  terceros como Google.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2. Seguridad de la cuenta</h3>
                <p className="text-gray-700">
                  Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu 
                  cuenta. Debes notificarnos inmediatamente si sospechas de algún uso no autorizado de tu cuenta.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">3.3. Edad mínima</h3>
                <p className="text-gray-700">
                  Debes tener al menos 16 años de edad para crear una cuenta y utilizar el Servicio. Si eres menor de edad, necesitas 
                  el consentimiento de tus padres o tutores legales.
                </p>
              </div>
            </div>
          </section>

          {/* Uso aceptable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Uso Aceptable del Servicio</h2>
            <p className="text-gray-700 mb-3">Te comprometes a utilizar el Servicio de manera responsable y a NO:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Publicar contenido ilegal, difamatorio, obsceno, ofensivo, amenazante o que viole los derechos de terceros.</li>
              <li>Hacerte pasar por otra persona o entidad, o falsificar tu afiliación con alguna persona u organización.</li>
              <li>Recopilar información de otros usuarios sin su consentimiento.</li>
              <li>Interferir o interrumpir el funcionamiento del Servicio, servidores o redes conectadas.</li>
              <li>Utilizar el Servicio para enviar spam, virus, malware o cualquier código dañino.</li>
              <li>Intentar acceder sin autorización a cuentas, sistemas o redes relacionados con el Servicio.</li>
              <li>Utilizar técnicas de scraping, crawling o automatización para extraer datos del Servicio sin permiso.</li>
              <li>Reproducir, duplicar, copiar, vender o revender el Servicio con fines comerciales sin autorización.</li>
            </ul>
          </section>

          {/* Contenido del usuario */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contenido del Usuario</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">5.1. Propiedad del contenido</h3>
                <p className="text-gray-700">
                  Conservas todos los derechos de propiedad sobre el contenido que publiques en el Servicio (valoraciones, comentarios, 
                  fotos, rutas, etc.). Sin embargo, al publicar contenido, nos otorgas una licencia mundial, no exclusiva, libre de 
                  regalías, sublicenciable y transferible para usar, reproducir, modificar, adaptar, publicar, traducir, distribuir 
                  y mostrar dicho contenido en relación con el Servicio.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">5.2. Responsabilidad del contenido</h3>
                <p className="text-gray-700">
                  Eres el único responsable del contenido que publiques. Nos reservamos el derecho de eliminar cualquier contenido que 
                  consideremos inapropiado, ilegal o que viole estos Términos, sin previo aviso.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">5.3. Moderación</h3>
                <p className="text-gray-700">
                  Nos reservamos el derecho, pero no la obligación, de monitorear, revisar y moderar el contenido publicado por los 
                  usuarios. No somos responsables del contenido generado por usuarios ni de las opiniones expresadas en valoraciones 
                  y comentarios.
                </p>
              </div>
            </div>
          </section>

          {/* Propiedad intelectual */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propiedad Intelectual</h2>
            <p className="text-gray-700">
              Todo el contenido del Servicio, incluyendo pero no limitado a textos, gráficos, logos, iconos, imágenes, clips de audio, 
              descargas digitales, compilaciones de datos y software, es propiedad de Mapa Furgocasa o de sus proveedores de contenido 
              y está protegido por las leyes de propiedad intelectual españolas e internacionales. No puedes reproducir, distribuir, 
              modificar, crear obras derivadas, mostrar públicamente o explotar de ninguna manera el contenido sin nuestro permiso 
              previo por escrito.
            </p>
          </section>

          {/* Servicios de terceros */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Servicios de Terceros</h2>
            <p className="text-gray-700 mb-3">
              El Servicio puede contener enlaces a sitios web o servicios de terceros (como Google Maps, Google Sign-In, etc.) que no 
              son propiedad ni están controlados por Mapa Furgocasa. No tenemos control sobre el contenido, políticas de privacidad o 
              prácticas de sitios web o servicios de terceros, y no asumimos ninguna responsabilidad por ellos.
            </p>
            <p className="text-gray-700">
              Te recomendamos leer los términos y condiciones y políticas de privacidad de cualquier sitio web o servicio de terceros 
              que visites.
            </p>
          </section>

          {/* Descargo de responsabilidad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Descargo de Responsabilidad</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">8.1. Uso bajo tu propio riesgo</h3>
                <p className="text-gray-700">
                  El Servicio se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo, ya sean expresas o 
                  implícitas. No garantizamos que el Servicio sea ininterrumpido, seguro o libre de errores.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">8.2. Precisión de la información</h3>
                <p className="text-gray-700">
                  Hacemos todo lo posible para proporcionar información precisa y actualizada sobre las áreas de estacionamiento, pero 
                  no garantizamos la exactitud, integridad o actualidad de dicha información. Las condiciones, precios, servicios y 
                  disponibilidad de las áreas pueden cambiar sin previo aviso.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">8.3. No somos responsables de</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Daños, pérdidas o lesiones derivadas del uso de las áreas de estacionamiento.</li>
                  <li>Problemas con vehículos, robos, accidentes o cualquier incidente ocurrido en las áreas.</li>
                  <li>Interacciones entre usuarios o con terceros.</li>
                  <li>Contenido generado por usuarios (valoraciones, comentarios, fotos).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitación de responsabilidad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitación de Responsabilidad</h2>
            <p className="text-gray-700">
              En ningún caso Mapa Furgocasa, sus directores, empleados, socios, agentes, proveedores o afiliados serán responsables 
              por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo sin limitación, pérdida de 
              beneficios, datos, uso, fondo de comercio u otras pérdidas intangibles, resultantes de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>Tu acceso o uso (o incapacidad de acceso o uso) del Servicio.</li>
              <li>Cualquier conducta o contenido de terceros en el Servicio.</li>
              <li>Cualquier contenido obtenido del Servicio.</li>
              <li>Acceso no autorizado, uso o alteración de tus transmisiones o contenido.</li>
            </ul>
          </section>

          {/* Modificaciones del servicio */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modificaciones del Servicio</h2>
            <p className="text-gray-700">
              Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio (o cualquier parte del mismo) en cualquier 
              momento, con o sin previo aviso. No seremos responsables ante ti ni ante terceros por cualquier modificación, suspensión 
              o discontinuación del Servicio.
            </p>
          </section>

          {/* Terminación */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Terminación</h2>
            <p className="text-gray-700 mb-3">
              Podemos terminar o suspender tu acceso al Servicio de inmediato, sin previo aviso ni responsabilidad, por cualquier 
              motivo, incluyendo pero no limitado a una violación de estos Términos.
            </p>
            <p className="text-gray-700">
              Si deseas terminar tu cuenta, puedes hacerlo desde la configuración de tu perfil o contactando con nosotros. Tras la 
              terminación, tu derecho a utilizar el Servicio cesará inmediatamente.
            </p>
          </section>

          {/* Ley aplicable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-700">
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta sus disposiciones 
              sobre conflictos de leyes. Cualquier disputa relacionada con estos Términos estará sujeta a la jurisdicción exclusiva 
              de los tribunales de España.
            </p>
          </section>

          {/* Cambios en los términos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Cambios en los Términos</h2>
            <p className="text-gray-700">
              Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es significativa, 
              te notificaremos con al menos 30 días de antelación antes de que los nuevos términos entren en vigor. Tu uso continuado 
              del Servicio después de que los cambios entren en vigor constituye tu aceptación de los nuevos Términos.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos a través de:
            </p>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> <span className="text-sky-600">info@mapafurgocasa.com</span></p>
              <p className="text-gray-700 mt-2"><strong>Responsable:</strong> Mapa Furgocasa</p>
              <p className="text-gray-700 mt-2"><strong>Sitio web:</strong> <a href="https://www.mapafurgocasa.com" className="text-sky-600 hover:underline">www.mapafurgocasa.com</a></p>
            </div>
          </section>

          {/* Aceptación */}
          <section className="bg-sky-50 border border-sky-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Aceptación de los Términos</h2>
            <p className="text-gray-700">
              Al utilizar Mapa Furgocasa, reconoces que has leído, comprendido y aceptado estar sujeto a estos Términos y Condiciones 
              de Uso, así como a nuestra <Link href="/privacidad" className="text-sky-600 hover:underline font-medium">Política de Privacidad</Link>.
            </p>
          </section>

        </div>

        {/* Botón volver */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

