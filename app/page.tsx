'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapIcon, MapPinIcon, ArrowPathIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Detectar si se está ejecutando como PWA instalada
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true
    
    if (isPWA) {
      // Si es PWA, redirigir automáticamente al mapa (experiencia app nativa)
      router.replace('/mapa')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo_gris.jpg" 
              alt="Furgocasa" 
              width={50} 
              height={50}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-primary-600">Furgocasa</span>
          </div>
          <Link 
            href="/auth/login"
            className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Descubre las mejores áreas para{' '}
            <span className="text-primary-600">autocaravanas</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explora cientos de áreas, planifica rutas y encuentra el lugar perfecto para tu próxima aventura en autocaravana por España.
          </p>
          
          {/* CTA Principal */}
          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <MapIcon className="w-6 h-6" />
            Explorar Mapa
          </Link>

          {/* Características destacadas */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cientos de Áreas
              </h3>
              <p className="text-gray-600 text-sm">
                Encuentra áreas públicas, privadas, campings y parkings en toda España
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowPathIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Planifica Rutas
              </h3>
              <p className="text-gray-600 text-sm">
                Crea rutas personalizadas y descubre áreas cercanas a tu camino
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Guarda Favoritos
              </h3>
              <p className="text-gray-600 text-sm">
                Marca tus áreas preferidas y organiza tu próximo viaje
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 text-sm">
        <p>© 2025 Furgocasa. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
