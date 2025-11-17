'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HomeIcon, MapIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          {/* Icono grande */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary-100 text-primary-600">
              <svg
                className="w-20 h-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Ups! Página no encontrada
          </h2>

          {/* Descripción */}
          <p className="text-xl text-gray-600 mb-8">
            Parece que esta ruta no existe en nuestro mapa. <br />
            Quizás el enlace está roto o la página ha sido movida.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              <HomeIcon className="w-5 h-5" />
              Volver al Inicio
            </Link>

            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
            >
              <MapIcon className="w-5 h-5" />
              Ir al Mapa
            </Link>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Volver Atrás
            </button>
          </div>

          {/* Enlaces útiles */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Páginas más visitadas:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/mapa"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                Mapa de Áreas
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/ruta"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                Planificar Ruta
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/perfil"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                Mi Perfil
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contacto"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
