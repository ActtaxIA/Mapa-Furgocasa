'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MiAutocaravanaTab } from '@/components/perfil/MiAutocaravanaTab'
import { MisReportesTab } from '@/components/perfil/MisReportesTab'
import {
  TruckIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

type TabType = 'vehiculos' | 'reportes'

export default function MisAutocaravanasPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('vehiculos')
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  // Cargar reportes no leídos
  const loadUnreadCount = async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('obtener_reportes_usuario', { usuario_uuid: userId })

      if (!error && data) {
        const noLeidos = data.filter((reporte: any) => !reporte.leido).length
        setUnreadCount(noLeidos)
      }
    } catch (error) {
      console.error('Error cargando reportes no leídos:', error)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)
      setLoading(false)
      // Cargar contador de no leídos
      loadUnreadCount(session.user.id)
    }

    loadUser()
  }, [router])

  // Actualizar contador cuando cambia a la pestaña de reportes
  useEffect(() => {
    if (user && activeTab === 'reportes') {
      loadUnreadCount(user.id)
    }
  }, [activeTab, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Autocaravanas</h1>
              <p className="mt-1 text-sm text-gray-500">Gestiona tus vehículos y reportes de accidentes</p>
            </div>
            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Volver al Mapa
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instrucciones del QR - Solo una vez arriba */}
        <div className="mb-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200 shadow-sm p-6">
          <div className="flex items-start">
            <QrCodeIcon className="h-8 w-8 text-primary-600 mr-4 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary-900 mb-4">
                📋 Código QR para Reportes de Accidentes
              </h2>

              {/* Instrucciones para el propietario */}
              <div className="mb-4 p-4 bg-white rounded-lg border border-primary-200">
                <p className="font-semibold text-primary-900 mb-3">
                  🎯 Instrucciones para ti:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2 font-bold">1.</span>
                    <span><strong>Descarga</strong> el código QR de cada vehículo usando el botón correspondiente</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2 font-bold">2.</span>
                    <span><strong>Imprímelo</strong> en tamaño A5 o más grande (para mejor lectura)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2 font-bold">3.</span>
                    <span><strong>Pégalo</strong> en un lugar visible de tu autocaravana (parabrisas, puerta lateral, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2 font-bold">4.</span>
                    <span><strong>Recibe alertas</strong> instantáneas si alguien reporta un accidente con cualquiera de tus vehículos</span>
                  </li>
                </ul>
              </div>

              {/* Frase gancho para testigos */}
              <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <p className="font-bold text-orange-900 mb-2 flex items-center">
                  <span className="text-2xl mr-2">⚠️</span>
                  Mensaje sugerido para el QR impreso:
                </p>
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-orange-300 text-center">
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    🚨 ¿Has visto un accidente con este vehículo?
                  </p>
                  <p className="text-base text-gray-700 mb-2">
                    Escanea este código QR y ayúdanos reportándolo
                  </p>
                  <p className="text-sm text-gray-600">
                    Tu testimonio es valioso • Solo toma 2 minutos • Anónimo y seguro
                  </p>
                </div>
                <p className="text-xs text-orange-700 mt-3 italic">
                  💡 <strong>Tip:</strong> Incluye este texto junto al QR cuando lo imprimas para motivar a los testigos
                </p>
              </div>

              {/* Información adicional */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>ℹ️ Nota:</strong> Cada vehículo tiene su propio código QR único. El testigo solo necesitará confirmar la matrícula y completar el reporte. Recibirás una notificación inmediata cuando alguien reporte un accidente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('vehiculos')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'vehiculos'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TruckIcon className="w-5 h-5" />
                Mis Vehículos
              </button>
              <button
                onClick={() => setActiveTab('reportes')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === 'reportes'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ExclamationTriangleIcon className="w-5 h-5" />
                Mis Reportes
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow p-6">
          {activeTab === 'vehiculos' && <MiAutocaravanaTab userId={user.id} />}
          {activeTab === 'reportes' && (
            <MisReportesTab
              userId={user.id}
              onReporteUpdate={() => {
                // Recargar contador cuando se actualiza un reporte
                if (user) loadUnreadCount(user.id)
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
