import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto | Mapa Furgocasa',
  description: 'Ponte en contacto con el equipo de Mapa Furgocasa. Estamos aquí para ayudarte.',
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0b3c74] via-[#0d4a8f] to-[#0b3c74] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              Contacto
            </h1>
            <p className="text-2xl text-white/90 max-w-2xl mx-auto">
              ¿Tienes alguna pregunta? Estamos aquí para ayudarte
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Información de Contacto */}
            <div className="space-y-6">
              
              {/* Tarjeta Principal */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border-2 border-[#0b3c74]/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📬</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Información de Contacto
                  </h2>
                </div>
                
                <div className="space-y-6">
                  
                  {/* Email */}
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="bg-[#0b3c74]/10 rounded-xl p-3 flex-shrink-0">
                        <svg className="w-6 h-6 text-[#0b3c74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                        <a href="mailto:info@furgocasa.com" className="text-[#0b3c74] hover:text-[#0d4a8f] font-medium">
                          info@furgocasa.com
                        </a>
                        <p className="text-sm text-gray-500 mt-1">
                          Respuesta en 24-48 horas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Web */}
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="bg-[#0b3c74]/10 rounded-xl p-3 flex-shrink-0">
                        <svg className="w-6 h-6 text-[#0b3c74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Web Principal</h3>
                        <a 
                          href="https://www.furgocasa.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#0b3c74] hover:text-[#0d4a8f] font-medium"
                        >
                          www.furgocasa.com
                        </a>
                        <p className="text-sm text-gray-500 mt-1">
                          Venta, alquiler y camperización
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Redes Sociales */}
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="bg-[#0b3c74]/10 rounded-xl p-3 flex-shrink-0">
                        <svg className="w-6 h-6 text-[#0b3c74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Redes Sociales</h3>
                        <div className="flex gap-3">
                          <a 
                            href="https://www.facebook.com/furgocasa" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-100 hover:bg-[#0b3c74] text-gray-600 hover:text-white p-2 rounded-lg transition-colors"
                            aria-label="Facebook"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                          <a 
                            href="https://www.instagram.com/furgocasa/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-100 hover:bg-[#0b3c74] text-gray-600 hover:text-white p-2 rounded-lg transition-colors"
                            aria-label="Instagram"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                          <a 
                            href="https://www.youtube.com/channel/UCBILltjVWRle5MKm3M50_CA" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-100 hover:bg-[#0b3c74] text-gray-600 hover:text-white p-2 rounded-lg transition-colors"
                            aria-label="YouTube"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Tarjeta FAQs */}
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-[#0b3c74]/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#0b3c74] mb-3 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  ¿Tienes una pregunta?
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Antes de contactarnos, revisa si tu pregunta ya está respondida:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0b3c74] font-bold">→</span>
                    <span>Todas las funciones son 100% gratuitas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0b3c74] font-bold">→</span>
                    <span>Puedes añadir áreas desde tu perfil de usuario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0b3c74] font-bold">→</span>
                    <span>Actualizamos la información regularmente</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Formulario de Contacto */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-[#0b3c74]/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✉️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Envíanos un Mensaje
                </h2>
              </div>
              
              <form className="space-y-6" action="mailto:info@furgocasa.com" method="post" encType="text/plain">
                
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0b3c74] focus:border-[#0b3c74] transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0b3c74] focus:border-[#0b3c74] transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0b3c74] focus:border-[#0b3c74] transition-colors"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0b3c74] focus:border-[#0b3c74] transition-colors resize-none"
                    placeholder="Cuéntanos con detalle..."
                  />
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Este formulario enviará el mensaje directamente a <strong>info@furgocasa.com</strong>. 
                    Por favor, espera 24-48 horas para recibir respuesta.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0b3c74] to-[#0d4a8f] text-white font-semibold py-3 px-6 rounded-lg hover:from-[#0d4a8f] hover:to-[#0b3c74] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar Mensaje
                </button>
              </form>
            </div>

          </div>

          {/* CTA Visitar Furgocasa */}
          <div className="mt-12 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Buscas comprar o alquilar una autocaravana?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Visita nuestra web principal Furgocasa.com para ver nuestra flota de vehículos camperizados, 
              servicios de alquiler y camperización profesional.
            </p>
            <a
              href="https://www.furgocasa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0b3c74] font-bold text-lg rounded-xl hover:bg-gray-50 transition-all shadow-lg"
            >
              <span>🚐</span> Visitar Furgocasa.com
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
