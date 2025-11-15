'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError('')

    // Simulación de envío (aquí puedes integrar tu API)
    setTimeout(() => {
      setEnviando(false)
      setEnviado(true)
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' })
      
      // Resetear mensaje de éxito después de 5 segundos
      setTimeout(() => setEnviado(false), 5000)
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contacto
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              ¿Tienes alguna pregunta? Estamos aquí para ayudarte
            </p>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Información de Contacto */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Información de Contacto
                </h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6 border-2 border-[#0b3c74]/10">
                    <div className="w-12 h-12 bg-[#0b3c74] rounded-xl flex items-center justify-center flex-shrink-0">
                      <EnvelopeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                      <a href="mailto:info@mapafurgocasa.com" className="text-[#0b3c74] hover:underline">
                        info@mapafurgocasa.com
                      </a>
                      <p className="text-sm text-gray-600 mt-1">
                        Respondemos en menos de 24 horas
                      </p>
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6 border-2 border-[#0b3c74]/10">
                    <div className="w-12 h-12 bg-[#0b3c74] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Empresa</h3>
                      <p className="text-gray-600">
                        Furgocasa<br />
                        Especialistas en Caravaning
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        España
                      </p>
                    </div>
                  </div>

                  {/* Chatbot IA */}
                  <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6 border-2 border-[#0b3c74]/10">
                    <div className="w-12 h-12 bg-[#0b3c74] rounded-xl flex items-center justify-center flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Chatbot IA 24/7</h3>
                      <p className="text-gray-600">
                        También puedes usar nuestro asistente IA dentro de la plataforma para preguntas rápidas
                      </p>
                      <p className="text-sm text-[#0b3c74] font-medium mt-1">
                        Disponible tras iniciar sesión
                      </p>
                    </div>
                  </div>
                </div>

                {/* Redes Sociales */}
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Síguenos
                  </h3>
                  <div className="flex gap-4">
                    <a
                      href="https://www.facebook.com/furgocasa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-[#0b3c74] rounded-xl flex items-center justify-center text-white hover:bg-[#0d4a8f] transition-all"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/furgocasa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-[#0b3c74] rounded-xl flex items-center justify-center text-white hover:bg-[#0d4a8f] transition-all"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.youtube.com/@furgocasa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-[#0b3c74] rounded-xl flex items-center justify-center text-white hover:bg-[#0d4a8f] transition-all"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Formulario de Contacto */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Envíanos un Mensaje
                </h2>

                {enviado && (
                  <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-800">
                    <p className="font-semibold">¡Mensaje enviado con éxito!</p>
                    <p className="text-sm">Te responderemos lo antes posible.</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-800">
                    <p className="font-semibold">Error al enviar el mensaje</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-bold text-gray-900 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0b3c74] focus:outline-none transition-all"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0b3c74] focus:outline-none transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>

                  {/* Asunto */}
                  <div>
                    <label htmlFor="asunto" className="block text-sm font-bold text-gray-900 mb-2">
                      Asunto *
                    </label>
                    <select
                      id="asunto"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0b3c74] focus:outline-none transition-all"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="consulta_general">Consulta General</option>
                      <option value="problema_tecnico">Problema Técnico</option>
                      <option value="sugerencia">Sugerencia</option>
                      <option value="area_nueva">Reportar Área Nueva</option>
                      <option value="valoracion_ia">Consulta sobre Valoración IA</option>
                      <option value="sistema_qr">Consulta sobre Sistema QR</option>
                      <option value="colaboracion">Propuesta de Colaboración</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-bold text-gray-900 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0b3c74] focus:outline-none transition-all resize-none"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>

                  {/* Botón de envío */}
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-[#0b3c74] text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-[#0d4a8f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
