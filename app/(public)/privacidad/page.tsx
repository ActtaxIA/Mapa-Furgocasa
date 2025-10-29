import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Política de Privacidad | Mapa Furgocasa',
  description: 'Política de privacidad y protección de datos de Mapa Furgocasa',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      {/* Header Hero */}
      <div className="bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] text-white shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo-furgocasa.png" 
              alt="Furgocasa" 
              width={150} 
              height={60}
              className="h-12 w-auto"
            />
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Política de Privacidad</h1>
          <p className="text-white/90 text-lg">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed">
              En <strong>Mapa Furgocasa</strong>, nos tomamos muy en serio la privacidad de nuestros usuarios. 
              Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal 
              cuando utilizas nuestra plataforma web y servicios relacionados.
            </p>
          </section>

          {/* Información que recopilamos */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">2. Información que Recopilamos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1. Información proporcionada por el usuario</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Datos de registro:</strong> nombre, apellidos, correo electrónico, nombre de usuario y contraseña.</li>
                  <li><strong>Información de perfil:</strong> foto de perfil, biografía y preferencias de usuario.</li>
                  <li><strong>Contenido generado:</strong> valoraciones, comentarios, fotos y rutas creadas.</li>
                  <li><strong>Datos de contacto:</strong> información de contacto si nos escribes directamente.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2.2. Información recopilada automáticamente</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Datos de uso:</strong> páginas visitadas, tiempo de permanencia, clics e interacciones.</li>
                  <li><strong>Información del dispositivo:</strong> tipo de navegador, sistema operativo, dirección IP y dispositivo utilizado.</li>
                  <li><strong>Ubicación geográfica:</strong> coordenadas GPS (solo si otorgas permiso) para funciones de mapa.</li>
                  <li><strong>Cookies y tecnologías similares:</strong> para mejorar la experiencia del usuario y analizar el uso del sitio.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2.3. Información de terceros</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Autenticación con Google:</strong> si eliges iniciar sesión con Google, recibiremos tu nombre, correo electrónico y foto de perfil.</li>
                  <li><strong>Google Maps API:</strong> utilizamos Google Maps para mostrar ubicaciones de áreas.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cómo usamos tu información */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">3. Cómo Usamos tu Información</h2>
            <p className="text-gray-700 mb-3">Utilizamos la información recopilada para los siguientes propósitos:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Proveer y mejorar nuestros servicios:</strong> gestionar tu cuenta, personalizar tu experiencia y desarrollar nuevas funcionalidades.</li>
              <li><strong>Comunicación:</strong> enviarte notificaciones, actualizaciones y responder a tus consultas.</li>
              <li><strong>Seguridad:</strong> proteger la plataforma contra fraudes, abusos y actividades ilegales.</li>
              <li><strong>Análisis y estadísticas:</strong> comprender cómo los usuarios interactúan con la plataforma para mejorarla.</li>
              <li><strong>Cumplimiento legal:</strong> cumplir con obligaciones legales y regulatorias aplicables.</li>
              <li><strong>Marketing:</strong> con tu consentimiento, enviarte información promocional sobre nuevas funciones y servicios.</li>
            </ul>
          </section>

          {/* Compartir información */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">4. Compartir tu Información</h2>
            <p className="text-gray-700 mb-3">No vendemos ni alquilamos tu información personal a terceros. Podemos compartir tu información en los siguientes casos:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Proveedores de servicios:</strong> empresas que nos ayudan a operar la plataforma (hosting, análisis, almacenamiento).</li>
              <li><strong>Cumplimiento legal:</strong> si es requerido por ley, orden judicial o autoridad gubernamental.</li>
              <li><strong>Protección de derechos:</strong> para proteger nuestros derechos, propiedad o seguridad, o los de nuestros usuarios.</li>
              <li><strong>Con tu consentimiento:</strong> en cualquier otro caso, solo compartiremos tu información si nos das tu permiso explícito.</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">5. Cookies y Tecnologías Similares</h2>
            <p className="text-gray-700 mb-3">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestra plataforma. Las cookies son pequeños 
              archivos de texto almacenados en tu dispositivo que nos ayudan a:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mantener tu sesión iniciada</li>
              <li>Recordar tus preferencias</li>
              <li>Analizar el tráfico y uso del sitio</li>
              <li>Personalizar contenido y anuncios</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar la funcionalidad de la plataforma.
            </p>
          </section>

          {/* Seguridad */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">6. Seguridad de tu Información</h2>
            <p className="text-gray-700">
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger tu información personal contra 
              acceso no autorizado, alteración, divulgación o destrucción. Utilizamos cifrado SSL/TLS para proteger la transmisión 
              de datos sensibles y almacenamos la información en servidores seguros. Sin embargo, ningún método de transmisión por 
              internet o almacenamiento electrónico es 100% seguro.
            </p>
          </section>

          {/* Retención de datos */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">7. Retención de Datos</h2>
            <p className="text-gray-700">
              Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, 
              a menos que la ley requiera o permita un período de retención más largo. Si eliminas tu cuenta, eliminaremos o anonimizaremos 
              tu información personal, excepto cuando sea necesario conservarla por motivos legales o legítimos.
            </p>
          </section>

          {/* Tus derechos */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">8. Tus Derechos</h2>
            <p className="text-gray-700 mb-3">
              De acuerdo con el Reglamento General de Protección de Datos (RGPD) y la legislación española aplicable, tienes los siguientes derechos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Acceso:</strong> solicitar una copia de la información personal que tenemos sobre ti.</li>
              <li><strong>Rectificación:</strong> corregir información personal inexacta o incompleta.</li>
              <li><strong>Eliminación:</strong> solicitar la eliminación de tu información personal (derecho al olvido).</li>
              <li><strong>Limitación:</strong> solicitar que limitemos el procesamiento de tu información.</li>
              <li><strong>Portabilidad:</strong> recibir tu información en un formato estructurado y legible por máquina.</li>
              <li><strong>Oposición:</strong> oponerte al procesamiento de tu información para ciertos fines.</li>
              <li><strong>Revocar consentimiento:</strong> retirar tu consentimiento en cualquier momento.</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Para ejercer cualquiera de estos derechos, contacta con nosotros en <strong className="text-sky-600">info@mapafurgocasa.com</strong>
            </p>
          </section>

          {/* Menores de edad */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">9. Menores de Edad</h2>
            <p className="text-gray-700">
              Nuestra plataforma no está dirigida a menores de 16 años. No recopilamos intencionalmente información personal de menores. 
              Si descubrimos que hemos recopilado información de un menor sin el consentimiento parental, eliminaremos esa información 
              de inmediato.
            </p>
          </section>

          {/* Transferencias internacionales */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">10. Transferencias Internacionales</h2>
            <p className="text-gray-700">
              Tu información puede ser transferida y almacenada en servidores ubicados fuera del Espacio Económico Europeo (EEE). 
              En tal caso, nos aseguramos de que se implementen salvaguardas adecuadas para proteger tu información de acuerdo con 
              el RGPD, como cláusulas contractuales estándar aprobadas por la Comisión Europea.
            </p>
          </section>

          {/* Cambios en la política */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">11. Cambios en esta Política</h2>
            <p className="text-gray-700">
              Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por razones 
              legales, operativas o regulatorias. Te notificaremos sobre cambios significativos publicando la nueva política en nuestra 
              plataforma y actualizando la fecha de "Última actualización". Te recomendamos revisar esta política regularmente.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-[#0b3c74] mb-4">12. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas, inquietudes o deseas ejercer tus derechos sobre tu información personal, puedes contactarnos a través de:
            </p>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> <span className="text-sky-600">info@mapafurgocasa.com</span></p>
              <p className="text-gray-700 mt-2"><strong>Responsable:</strong> Mapa Furgocasa</p>
              <p className="text-gray-700 mt-2"><strong>Sitio web:</strong> <a href="https://www.mapafurgocasa.com" className="text-sky-600 hover:underline">www.mapafurgocasa.com</a></p>
            </div>
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

