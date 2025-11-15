'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  MapIcon,
  MapPinIcon,
  ArrowPathIcon,
  HeartIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

export default function HomePage() {
  const [totalAreas, setTotalAreas] = useState(1000)

  useEffect(() => {
    // Cargar contador dinámico de áreas
    const loadTotalAreas = async () => {
      try {
        const supabase = createClient()
        const { count, error } = await supabase
          .from('areas')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)

        if (!error && count) {
          setTotalAreas(count)
        }
      } catch (err) {
        console.error('Error loading total areas:', err)
      }
    }

    loadTotalAreas()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Con color azul principal */}
      <section className="relative bg-gradient-to-br from-[#0b3c74] via-[#0d4a8f] to-[#0b3c74] py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
              <GlobeAltIcon className="w-4 h-4" />
              <span>+{totalAreas} áreas verificadas</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Tu guía definitiva de áreas para
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-cyan-200">
                autocaravanas
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Descubre, planifica y viaja. Toda la información que necesitas sobre áreas de pernocta,
              campings y parkings para autocaravanas en <strong className="text-sky-200">Europa y Latinoamérica</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0b3c74] text-lg font-bold rounded-xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Crear Cuenta Gratis
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white text-lg font-bold rounded-xl border-2 border-white hover:bg-white/10 transition-all"
              >
                Ya tengo cuenta
              </Link>
            </div>

            {/* Stats mejoradas */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">+{totalAreas}</div>
                <div className="text-sm text-white/80">Áreas Verificadas</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-white/80">Gratis Siempre</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-white/80">Actualizado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features principales - Sin espacio blanco */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en una sola plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Información actualizada, mapas interactivos y herramientas profesionales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature 1 - Destacada */}
            <div className="bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] text-white rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-all">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                <MapPinIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                +{totalAreas} Áreas Actualizadas
              </h3>
              <p className="text-white/90 leading-relaxed">
                Base de datos completa con áreas públicas, privadas, campings y parkings.
                Información verificada de servicios, precios y ubicaciones exactas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                <ArrowPathIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Planificador de Rutas
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Crea rutas personalizadas y descubre automáticamente áreas de pernocta cercanas.
                Optimiza distancias y tiempos de viaje.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                <GlobeAltIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Cobertura Mundial
              </h3>
              <p className="text-gray-600 leading-relaxed">
                España, Portugal, Francia, Andorra, Argentina y más países.
                Expandimos constantemente nuestra red global de áreas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                <HeartIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Lista de Favoritos
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Guarda tus áreas preferidas y accede a ellas desde cualquier dispositivo.
                Organiza tu próximo viaje fácilmente.
              </p>
            </div>

            {/* Feature 5 - DESTACADO CON IA */}
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all md:col-span-2 lg:col-span-3 relative overflow-hidden">
              {/* Badge "NUEVO" */}
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                🤖 CON INTELIGENCIA ARTIFICIAL
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <TruckIcon className="w-12 h-12 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-black mb-4">
                    Gestión Inteligente de tu Autocaravana
                  </h3>
                  <p className="text-white/95 leading-relaxed mb-6 text-lg">
                    <strong>Valoración automática con GPT-4</strong> en segundos. Control total de tu vehículo 
                    con comparación de precios de mercado en tiempo real.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <span className="text-2xl">🤖</span>
                      <div>
                        <p className="font-bold text-sm">Valoración IA</p>
                        <p className="text-xs text-white/80">GPT-4 en segundos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <span className="text-2xl">📊</span>
                      <div>
                        <p className="font-bold text-sm">Precios Mercado</p>
                        <p className="text-xs text-white/80">Comparación real</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <span className="text-2xl">🔧</span>
                      <div>
                        <p className="font-bold text-sm">Mantenimientos</p>
                        <p className="text-xs text-white/80">Historial completo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="font-bold text-sm">Control Gastos</p>
                        <p className="text-xs text-white/80">ROI automático</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <span className="text-2xl">📈</span>
                      <div>
                        <p className="font-bold text-sm">Histórico Valor</p>
                        <p className="text-xs text-white/80">Evolución precio</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <span className="text-2xl">📸</span>
                      <div>
                        <p className="font-bold text-sm">Gestión Fotos</p>
                        <p className="text-xs text-white/80">Galería completa</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 6 - Sistema QR Mejorado */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-red-200 md:col-span-2">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                    🔒 SISTEMA ANTIRROBO
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Sistema QR Inteligente: Protección 24/7
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Código QR único para tu vehículo. Los testigos pueden reportar incidentes, 
                    robos o daños escaneándolo. <strong>Recibe notificaciones instantáneas</strong> con 
                    fotos, ubicación GPS y datos del testigo.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✓</span> <strong>Alertas de accidentes</strong> con fotos y ubicación
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✓</span> <strong>Notificación antirrobo</strong> si alguien ve tu vehículo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✓</span> <strong>Contacto emergencia</strong> visible para autoridades
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✓</span> <strong>Historial completo</strong> de todos los reportes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nueva Sección: Tecnología IA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título */}
            <div className="text-center mb-16">
              <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-4">
                🤖 POWERED BY GPT-4
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Inteligencia Artificial que entiende tu autocaravana
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tecnología de última generación para valorar, analizar y gestionar tu vehículo de forma profesional
              </p>
            </div>

            {/* Grid de características IA */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200">
                <div className="text-5xl mb-4">🧠</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Valoración Inteligente
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  GPT-4 analiza marca, modelo, año, kilometraje, estado y mercado actual 
                  para darte una <strong>valoración precisa en segundos</strong>.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Comparación de Mercado
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Comparamos tu vehículo con <strong>miles de anuncios reales</strong> de 
                  portales especializados para darte el precio justo.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Chatbot Experto
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Asistente IA disponible 24/7 para responder dudas sobre áreas, 
                  rutas, mantenimiento y <strong>recomendaciones personalizadas</strong>.
                </p>
              </div>
            </div>

            {/* Ejemplo visual */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold mb-4">
                    ✓ Valoración completada
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    Informe completo en 30 segundos
                  </h3>
                  <ul className="space-y-3 text-lg">
                    <li className="flex items-center gap-3">
                      <span className="text-green-400 text-2xl">✓</span>
                      Precio objetivo recomendado
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-400 text-2xl">✓</span>
                      Rango de venta (mínimo-máximo)
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-400 text-2xl">✓</span>
                      Comparables del mercado
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-400 text-2xl">✓</span>
                      Análisis de depreciación
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-400 text-2xl">✓</span>
                      PDF descargable profesional
                    </li>
                  </ul>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-sm font-mono text-green-400 mb-2">// Ejemplo valoración IA</div>
                  <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                    <div className="text-purple-400">GPT-4 Analyzing...</div>
                    <div className="text-gray-400 mt-2">
                      → Marca: Adria<br/>
                      → Modelo: Twin Plus Family<br/>
                      → Año: 2022<br/>
                      → Kilometraje: 15.000 km
                    </div>
                    <div className="text-green-400 mt-4">
                      ✓ Valoración: 58.000 - 63.500 €<br/>
                      ✓ Precio Objetivo: 63.500 €
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nueva Sección: Cómo Funciona */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Empieza en 3 simples pasos
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Desde el registro hasta tu primera valoración IA en menos de 5 minutos
              </p>
            </div>

            {/* Pasos */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Paso 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10 h-full">
                  <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    1
                  </div>
                  <div className="text-5xl mb-6 mt-4">📝</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Regístrate Gratis
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Crea tu cuenta en 30 segundos. No requiere tarjeta de crédito. 
                    Acceso inmediato a todas las funcionalidades.
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10 h-full">
                  <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    2
                  </div>
                  <div className="text-5xl mb-6 mt-4">🚐</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Registra tu Vehículo
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Añade tu autocaravana con marca, modelo, año y kilometraje. 
                    Sube fotos y obtén tu código QR de protección.
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10 h-full">
                  <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    3
                  </div>
                  <div className="text-5xl mb-6 mt-4">🤖</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Valoración IA Instantánea
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Haz clic en "Valorar con IA" y obtén en 30 segundos un informe 
                    profesional con precio de mercado y análisis completo.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA de acción */}
            <div className="text-center bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-2xl p-10 text-white">
              <h3 className="text-3xl font-bold mb-4">
                ¿Listo para comenzar?
              </h3>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                Únete a miles de autocaravanistas que ya gestionan sus vehículos con IA
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-[#0b3c74] text-xl font-bold rounded-xl hover:bg-gray-50 transition-all shadow-xl transform hover:-translate-y-1"
              >
                Crear Cuenta Gratuita →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección "Por qué nosotros" con testimonial */}
      <section className="py-20 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                ¿Por qué más de 10.000 autocaravanistas confían en nosotros?
              </h2>
              <p className="text-xl text-white/80">
                Parte de Furgocasa, especialistas en el mundo del caravaning desde hace años
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Información Verificada
                    </h3>
                    <p className="text-white/80">
                      Cada área es revisada y actualizada por nuestro equipo.
                      Datos reales de ubicación, servicios disponibles, precios actualizados y estado operativo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Comunidad Activa
                    </h3>
                    <p className="text-white/80">
                      Miles de autocaravanistas comparten experiencias, consejos y recomendaciones.
                      La comunidad más grande de España y en crecimiento internacional.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Siempre Actualizado
                    </h3>
                    <p className="text-white/80">
                      Nuevas áreas añadidas constantemente. Sistema de reportes de la comunidad.
                      Nunca llegarás a un lugar cerrado o inexistente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Tecnología Google Maps
                    </h3>
                    <p className="text-white/80">
                      Integración completa con Google Maps. Visualización precisa, cálculo de rutas,
                      navegación directa y vista satélite de cada ubicación.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 border border-white/20 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarSolid key={i} className="w-8 h-8 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-2xl md:text-3xl text-white mb-6 italic font-light">
                "La mejor herramienta para planificar rutas en autocaravana.
                He descubierto áreas increíbles que nunca hubiera encontrado por mi cuenta."
              </blockquote>
              <div className="text-white/80 font-medium">
                — Comunidad Furgocasa
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final potente */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-3xl p-12 md:p-16 shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Comienza tu próxima aventura hoy
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Únete a miles de autocaravanistas que ya planifican sus viajes con Mapa Furgocasa.
                <strong className="text-sky-200"> 100% gratis para siempre</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-[#0b3c74] text-xl font-bold rounded-xl hover:bg-gray-50 transition-all shadow-xl transform hover:-translate-y-1"
                >
                  Registrarme Gratis
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-transparent text-white text-xl font-bold rounded-xl border-2 border-white hover:bg-white/10 transition-all"
                >
                  Iniciar Sesión
                </Link>
              </div>

              <p className="text-sm text-white/70">
                No requiere tarjeta de crédito • Acceso inmediato • Compatible con todos los dispositivos
              </p>
            </div>

            {/* Mini features */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0b3c74] mb-2">100%</div>
                <div className="text-sm text-gray-600">Gratis</div>
              </div>
              <div className="text-center border-l border-r border-gray-200">
                <div className="text-3xl font-bold text-[#0b3c74] mb-2">+{totalAreas}</div>
                <div className="text-sm text-gray-600">Áreas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0b3c74] mb-2">10K+</div>
                <div className="text-sm text-gray-600">Usuarios</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
