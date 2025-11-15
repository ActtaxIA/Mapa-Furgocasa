"use client"

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FAQ {
  pregunta: string
  respuesta: string
  categoria: 'general' | 'areas' | 'rutas' | 'vehiculos' | 'cuenta' | 'tecnico'
}

const faqs: FAQ[] = [
  // General
  {
    categoria: 'general',
    pregunta: '¿Qué es Mapa Furgocasa?',
    respuesta: 'Mapa Furgocasa es una plataforma completa para viajeros en autocaravana, camper o furgoneta camperizada. Ofrecemos un mapa interactivo con más de 4900 áreas de estacionamiento en Europa y Latinoamérica, planificador de rutas, gestión de vehículos y una comunidad activa de viajeros.'
  },
  {
    categoria: 'general',
    pregunta: '¿Es gratis usar Mapa Furgocasa?',
    respuesta: 'Sí, Mapa Furgocasa es completamente gratuito. Puedes acceder al mapa de áreas, planificar rutas, registrar tu vehículo y usar todas las funcionalidades sin coste alguno.'
  },
  {
    categoria: 'general',
    pregunta: '¿Necesito registrarme para usar la aplicación?',
    respuesta: 'Puedes explorar el mapa sin registrarte, pero para acceder a funciones avanzadas como el planificador de rutas, guardar favoritos, gestionar tu vehículo y generar valoraciones con IA, necesitas crear una cuenta gratuita.'
  },

  // Áreas
  {
    categoria: 'areas',
    pregunta: '¿Cuántas áreas tenéis en el mapa?',
    respuesta: 'Actualmente tenemos más de 4900 áreas de estacionamiento para autocaravanas en Europa y Latinoamérica. Actualizamos constantemente nuestra base de datos con nuevas áreas y verificamos la información existente.'
  },
  {
    categoria: 'areas',
    pregunta: '¿Cómo puedo añadir un área que no está en el mapa?',
    respuesta: 'Si conoces un área que no está en nuestro mapa, puedes reportarla desde la sección "Añadir Área". Solo necesitas proporcionar la ubicación, nombre y algunos detalles básicos. Nuestro equipo verificará la información antes de publicarla.'
  },
  {
    categoria: 'areas',
    pregunta: '¿Cómo sé si un área está actualizada?',
    respuesta: 'Cada área muestra la fecha de última actualización. Además, nuestra comunidad de usuarios puede reportar cambios o problemas en tiempo real. Recomendamos verificar los comentarios recientes antes de visitar un área.'
  },
  {
    categoria: 'areas',
    pregunta: '¿Puedo filtrar áreas por servicios?',
    respuesta: 'Sí, el mapa incluye filtros avanzados para buscar áreas según servicios disponibles: agua, electricidad, vaciado de aguas grises/negras, WiFi, seguridad, y más. Puedes combinar múltiples filtros para encontrar el área perfecta para tus necesidades.'
  },

  // Rutas
  {
    categoria: 'rutas',
    pregunta: '¿Cómo funciona el planificador de rutas?',
    respuesta: 'El planificador de rutas te permite crear itinerarios personalizados seleccionando múltiples áreas de estacionamiento. Puedes reordenar las paradas arrastrándolas, ver la distancia total, tiempo estimado y exportar tu ruta a GPX para usarla en tu GPS.'
  },
  {
    categoria: 'rutas',
    pregunta: '¿Puedo compartir mis rutas con otros usuarios?',
    respuesta: 'Actualmente las rutas son privadas y solo tú puedes verlas. Estamos trabajando en una función de rutas públicas donde podrás compartir tus mejores itinerarios con la comunidad.'
  },
  {
    categoria: 'rutas',
    pregunta: '¿Cómo exporto una ruta a mi GPS?',
    respuesta: 'Desde el planificador de rutas, haz clic en "Exportar GPX" para descargar un archivo compatible con la mayoría de dispositivos GPS (Garmin, TomTom, etc.) y aplicaciones de navegación.'
  },

  // Vehículos
  {
    categoria: 'vehiculos',
    pregunta: '¿Para qué sirve registrar mi vehículo?',
    respuesta: 'Registrar tu vehículo te permite gestionar toda su información en un solo lugar: datos técnicos, mantenimientos, averías, mejoras, documentos y fotos. También puedes generar valoraciones con IA y llevar un control completo del historial de tu autocaravana.'
  },
  {
    categoria: 'vehiculos',
    pregunta: '¿Qué es la valoración con IA?',
    respuesta: 'La valoración con IA es un sistema que analiza tu vehículo utilizando inteligencia artificial y datos reales del mercado. Genera un informe profesional con tres precios recomendados (salida, objetivo y mínimo) basándose en marca, modelo, año, estado y comparables del mercado.'
  },
  {
    categoria: 'vehiculos',
    pregunta: '¿Puedo registrar varios vehículos?',
    respuesta: 'Sí, puedes registrar todos los vehículos que quieras. Cada uno tendrá su propia ficha con información independiente, mantenimientos, valoraciones y documentos.'
  },
  {
    categoria: 'vehiculos',
    pregunta: '¿Es seguro subir documentos de mi vehículo?',
    respuesta: 'Sí, todos los documentos se almacenan de forma segura y encriptada en servidores protegidos. Solo tú puedes acceder a tu información. Nunca compartimos datos personales con terceros.'
  },

  // Cuenta
  {
    categoria: 'cuenta',
    pregunta: '¿Cómo creo una cuenta?',
    respuesta: 'Haz clic en "Registrarse" en la parte superior de la página. Puedes crear una cuenta con tu email o usar tu cuenta de Google para un registro rápido. El proceso toma menos de 1 minuto.'
  },
  {
    categoria: 'cuenta',
    pregunta: '¿Olvidé mi contraseña, qué hago?',
    respuesta: 'En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Te enviaremos un email con un enlace para restablecer tu contraseña de forma segura.'
  },
  {
    categoria: 'cuenta',
    pregunta: '¿Puedo cambiar mi email?',
    respuesta: 'Sí, desde tu perfil de usuario puedes actualizar tu email, nombre y otros datos personales en cualquier momento.'
  },
  {
    categoria: 'cuenta',
    pregunta: '¿Cómo elimino mi cuenta?',
    respuesta: 'Si deseas eliminar tu cuenta, contáctanos a través del formulario de contacto. Eliminaremos toda tu información de forma permanente en un plazo de 48 horas.'
  },

  // Técnico
  {
    categoria: 'tecnico',
    pregunta: '¿Funciona en móviles y tablets?',
    respuesta: 'Sí, Mapa Furgocasa está optimizado para funcionar perfectamente en cualquier dispositivo: ordenadores, tablets y smartphones. La interfaz se adapta automáticamente al tamaño de tu pantalla.'
  },
  {
    categoria: 'tecnico',
    pregunta: '¿Necesito conexión a internet para usar la app?',
    respuesta: 'Sí, necesitas conexión a internet para acceder al mapa y las funcionalidades en tiempo real. Sin embargo, puedes exportar rutas en GPX para usarlas offline en tu GPS.'
  },
  {
    categoria: 'tecnico',
    pregunta: '¿Qué navegadores son compatibles?',
    respuesta: 'Mapa Furgocasa funciona en todos los navegadores modernos: Chrome, Firefox, Safari, Edge y Opera. Recomendamos mantener tu navegador actualizado para la mejor experiencia.'
  },
  {
    categoria: 'tecnico',
    pregunta: '¿Tenéis aplicación móvil nativa?',
    respuesta: 'Actualmente Mapa Furgocasa es una aplicación web responsive que funciona perfectamente en móviles. Estamos considerando desarrollar aplicaciones nativas para iOS y Android en el futuro según la demanda de los usuarios.'
  }
]

const categorias = [
  { id: 'general', nombre: 'General', icono: '❓' },
  { id: 'areas', nombre: 'Áreas y Mapa', icono: '🗺️' },
  { id: 'rutas', nombre: 'Rutas', icono: '🚗' },
  { id: 'vehiculos', nombre: 'Vehículos', icono: '🚐' },
  { id: 'cuenta', nombre: 'Mi Cuenta', icono: '👤' },
  { id: 'tecnico', nombre: 'Técnico', icono: '⚙️' }
]

export default function FAQsPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<string>('general')
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const faqsFiltrados = faqs.filter(faq => {
    const matchCategoria = faq.categoria === categoriaActiva
    const matchBusqueda = busqueda === '' || 
      faq.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
      faq.respuesta.toLowerCase().includes(busqueda.toLowerCase())
    return matchCategoria && matchBusqueda
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ❓ Preguntas Frecuentes
            </h1>
            <p className="text-xl text-primary-100">
              Encuentra respuestas rápidas a las preguntas más comunes
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <input
              type="text"
              placeholder="🔍 Buscar en preguntas frecuentes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoriaActiva(cat.id)
                  setPreguntaAbierta(null)
                  setBusqueda('')
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  categoriaActiva === cat.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.icono} {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de FAQs */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-3">
            {faqsFiltrados.length > 0 ? (
              faqsFiltrados.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setPreguntaAbierta(preguntaAbierta === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">
                      {faq.pregunta}
                    </span>
                    {preguntaAbierta === index ? (
                      <ChevronUpIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {preguntaAbierta === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.respuesta}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg">
                  No se encontraron resultados para "{busqueda}"
                </p>
                <button
                  onClick={() => setBusqueda('')}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CTA de Contacto */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-primary-100 mb-6">
              Nuestro equipo está aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
            </p>
            <a
              href="/contacto"
              className="inline-block px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              📧 Contactar con Soporte
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

