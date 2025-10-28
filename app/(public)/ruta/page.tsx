'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import PlanificadorRuta from '@/components/ruta/PlanificadorRuta'
import { MapIcon } from '@heroicons/react/24/outline'

export default function RutaPage() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      
      {/* Planificador */}
      <main className="flex-1 overflow-hidden">
        <PlanificadorRuta />
      </main>
    </div>
  )
}

