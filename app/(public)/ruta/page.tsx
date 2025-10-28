'use client'

import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import BottomNavigation from '@/components/mobile/BottomNavigation'
import PlanificadorRuta from '@/components/ruta/PlanificadorRuta'

export default function RutaPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Navbar - oculta en móvil */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
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
          <PlanificadorRuta />
        </Suspense>
      </main>

      {/* Bottom Navigation (solo móvil) */}
      <BottomNavigation showListButton={false} />
    </div>
  )
}

