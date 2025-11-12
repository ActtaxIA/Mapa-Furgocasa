'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  ArrowLeftIcon,
  TruckIcon,
  CurrencyEuroIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { ResumenEconomicoTab } from '@/components/vehiculo/ResumenEconomicoTab'
import { DatosCompraTab } from '@/components/vehiculo/DatosCompraTab'
import MantenimientosTab from '@/components/vehiculo/MantenimientosTab'
import AveriasTab from '@/components/vehiculo/AveriasTab'
import MejorasTab from '@/components/vehiculo/MejorasTab'
import GastosAdicionalesTab from '@/components/vehiculo/GastosAdicionalesTab'
import KilometrajeTab from '@/components/vehiculo/KilometrajeTab'

type TabType = 'resumen' | 'compra' | 'mantenimientos' | 'averias' | 'mejoras' | 'gastos' | 'kilometraje' | 'venta'

export default function VehiculoPage() {
  const params = useParams()
  const router = useRouter()
  const vehiculoId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [vehiculo, setVehiculo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('resumen')

  useEffect(() => {
    loadData()
  }, [vehiculoId])

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)

      // Cargar vehículo
      const { data: vehiculoData, error } = await supabase
        .from('vehiculos_registrados')
        .select('*')
        .eq('id', vehiculoId)
        .eq('user_id', session.user.id)
        .single()

      if (error || !vehiculoData) {
        console.error('Error cargando vehículo:', error)
        router.push('/perfil')
        return
      }

      setVehiculo(vehiculoData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!vehiculo) {
    return null
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: ChartBarIcon },
    { id: 'compra', label: 'Datos de Compra', icon: CurrencyEuroIcon },
    { id: 'mantenimientos', label: 'Mantenimientos', icon: WrenchScrewdriverIcon },
    { id: 'averias', label: 'Averías', icon: ExclamationTriangleIcon },
    { id: 'mejoras', label: 'Mejoras', icon: SparklesIcon },
    { id: 'gastos', label: 'Gastos Adicionales', icon: DocumentTextIcon },
    { id: 'kilometraje', label: 'Kilometraje', icon: TruckIcon },
    { id: 'venta', label: 'Venta', icon: TagIcon },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/perfil"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Mi Perfil
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <TruckIcon className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{vehiculo.matricula}</h1>
                  <p className="text-gray-600">
                    {vehiculo.marca} {vehiculo.modelo} {vehiculo.año && `• ${vehiculo.año}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          {activeTab === 'resumen' && (
            <ResumenEconomicoTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'compra' && (
            <DatosCompraTab
              vehiculoId={vehiculoId}
              onDataSaved={() => {
                // Recargar el tab de resumen si está activo
                if (activeTab === 'resumen') {
                  window.location.reload()
                }
              }}
            />
          )}

          {activeTab === 'mantenimientos' && (
            <MantenimientosTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'averias' && (
            <AveriasTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'mejoras' && (
            <MejorasTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'gastos' && (
            <GastosAdicionalesTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'kilometraje' && (
            <KilometrajeTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'venta' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Poner en Venta</h2>
              <p className="text-gray-600">Gestión de venta en construcción...</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
