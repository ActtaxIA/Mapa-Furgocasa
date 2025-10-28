'use client'

import { Suspense, useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import PlanificadorRuta from '@/components/ruta/PlanificadorRuta'
import { MapPinIcon, MapIcon, ListBulletIcon } from '@heroicons/react/24/outline'

type VistaRuta = 'ruta' | 'mapa' | 'lista'

export default function RutaPage() {
  const [vistaActual, setVistaActual] = useState<VistaRuta>('ruta')

  const handleRutaCalculada = () => {
    // Cambiar a vista mapa en móvil cuando se calcula una ruta
    if (window.innerWidth < 768) {
      setVistaActual('mapa')
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar - siempre visible */}
      <Navbar />
      
      {/* Planificador */}
      <main className="flex-1 overflow-hidden">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando planificador de rutas...</p>
            </div>
          </div>
        }>
          <PlanificadorRuta 
            vistaMovil={vistaActual} 
            onRutaCalculada={handleRutaCalculada}
          />
        </Suspense>
      </main>

      {/* Bottom Bar (solo móvil) - Ruta, Mapa, Lista */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Ruta */}
          <button
            onClick={() => setVistaActual('ruta')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              vistaActual === 'ruta' ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <MapPinIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Ruta</span>
          </button>

          {/* Mapa */}
          <button
            onClick={() => setVistaActual('mapa')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              vistaActual === 'mapa' ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <MapIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Mapa</span>
          </button>

          {/* Lista */}
          <button
            onClick={() => setVistaActual('lista')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              vistaActual === 'lista' ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <ListBulletIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Lista</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

