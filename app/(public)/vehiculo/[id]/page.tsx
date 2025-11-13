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
  TagIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { ResumenEconomicoTab } from '@/components/vehiculo/ResumenEconomicoTab'
import { DatosCompraTab } from '@/components/vehiculo/DatosCompraTab'
import MantenimientosTab from '@/components/vehiculo/MantenimientosTab'
import AveriasTab from '@/components/vehiculo/AveriasTab'
import MejorasTab from '@/components/vehiculo/MejorasTab'
import VentaTab from '@/components/vehiculo/VentaTab'
import { GaleriaFotosTab } from '@/components/vehiculo/GaleriaFotosTab'
import { Toast } from '@/components/ui/Toast'

type TabType = 'resumen' | 'compra' | 'fotos' | 'mantenimientos' | 'averias' | 'mejoras' | 'venta'

export default function VehiculoPage() {
  const params = useParams()
  const router = useRouter()
  const vehiculoId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [vehiculo, setVehiculo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('resumen')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    tipo_vehiculo: '',
    marca: '',
    modelo: '',
    año: '',
    color: ''
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null)

  // Detectar parámetro tab en la URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const tabParam = searchParams.get('tab') as TabType
      if (tabParam && ['resumen', 'compra', 'fotos', 'mantenimientos', 'averias', 'mejoras', 'venta'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

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
      // Inicializar datos de edición
      setEditData({
        tipo_vehiculo: vehiculoData.tipo_vehiculo || '',
        marca: vehiculoData.marca || '',
        modelo: vehiculoData.modelo || '',
        año: vehiculoData.año?.toString() || '',
        color: vehiculoData.color || ''
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = () => {
    setEditData({
      tipo_vehiculo: vehiculo.tipo_vehiculo || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      año: vehiculo.año?.toString() || '',
      color: vehiculo.color || ''
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({
      tipo_vehiculo: vehiculo.tipo_vehiculo || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      año: vehiculo.año?.toString() || '',
      color: vehiculo.color || ''
    })
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      const updateData: any = {
        tipo_vehiculo: editData.tipo_vehiculo.trim() || null,
        marca: editData.marca.trim() || null,
        modelo: editData.modelo.trim() || null,
        color: editData.color.trim() || null,
      }

      // Solo añadir año si tiene valor válido
      if (editData.año && editData.año.trim() !== '') {
        const añoNum = parseInt(editData.año)
        if (!isNaN(añoNum) && añoNum >= 1900 && añoNum <= new Date().getFullYear() + 1) {
          updateData.año = añoNum
        }
      } else {
        updateData.año = null
      }

      const { error } = await supabase
        .from('vehiculos_registrados')
        .update(updateData)
        .eq('id', vehiculoId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error actualizando vehículo:', error)
        setToast({ message: 'Error al actualizar los datos del vehículo', type: 'error' })
        return
      }

      // Recargar datos
      await loadData()
      setIsEditing(false)
      setToast({ message: '✅ Datos actualizados correctamente', type: 'success' })
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: 'Error al actualizar los datos del vehículo', type: 'error' })
    } finally {
      setSaving(false)
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
    { id: 'fotos', label: 'Fotos', icon: PhotoIcon },
    { id: 'mantenimientos', label: 'Mantenimientos', icon: WrenchScrewdriverIcon },
    { id: 'averias', label: 'Averías', icon: ExclamationTriangleIcon },
    { id: 'mejoras', label: 'Mejoras', icon: SparklesIcon },
    { id: 'venta', label: 'Venta', icon: TagIcon },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/mis-autocaravanas"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Mis Autocaravanas
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-primary-100 rounded-lg flex-shrink-0">
                  <TruckIcon className="w-8 h-8 text-primary-600" />
                </div>

                {!isEditing ? (
                  // Modo Vista
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{vehiculo.matricula}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {vehiculo.tipo_vehiculo && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200">
                          {vehiculo.tipo_vehiculo}
                        </span>
                      )}
                      <p className="text-gray-600">
                        {vehiculo.marca || 'Sin marca'} {vehiculo.modelo || 'Sin modelo'}
                        {vehiculo.año && ` • ${vehiculo.año}`}
                        {vehiculo.color && ` • ${vehiculo.color}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Modo Edición
                  <div className="flex-1 space-y-3">
                    {/* Matrícula - NO EDITABLE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Matrícula <span className="text-xs text-gray-500">(no editable)</span>
                      </label>
                      <div className="text-2xl font-bold text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        {vehiculo.matricula}
                      </div>
                    </div>

                    {/* Tipo de Vehículo - 2º en importancia */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Vehículo <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editData.tipo_vehiculo}
                        onChange={(e) => setEditData({ ...editData, tipo_vehiculo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecciona un tipo</option>
                        <option value="Furgoneta Camper">🚐 Furgoneta Camper</option>
                        <option value="Autocaravana Perfilada">🚙 Autocaravana Perfilada</option>
                        <option value="Autocaravana Integral">🚌 Autocaravana Integral</option>
                        <option value="Autocaravana Capuchina">🏕️ Autocaravana Capuchina</option>
                        <option value="Camper">🚗 Camper</option>
                        <option value="Furgoneta">🚐 Furgoneta</option>
                        <option value="Otro">📦 Otro</option>
                      </select>
                    </div>

                    {/* Campos Editables */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                        <input
                          type="text"
                          value={editData.marca}
                          onChange={(e) => setEditData({ ...editData, marca: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Fiat, Volkswagen..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                        <input
                          type="text"
                          value={editData.modelo}
                          onChange={(e) => setEditData({ ...editData, modelo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Ducato, California..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                        <input
                          type="number"
                          value={editData.año}
                          onChange={(e) => setEditData({ ...editData, año: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: 2020"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <input
                          type="text"
                          value={editData.color}
                          onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Blanco, Gris..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 flex-shrink-0">
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">Cancelar</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Advertencia sobre matrícula */}
            {isEditing && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ℹ️ <strong>Nota:</strong> La matrícula NO se puede modificar. Si necesitas cambiarla, deberás eliminar este vehículo y crear uno nuevo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex border-b border-gray-200 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const shortLabels: Record<string, string> = {
                  'Resumen': 'Resumen',
                  'Datos de Compra': 'Compra',
                  'Fotos': 'Fotos',
                  'Mantenimientos': 'Mant.',
                  'Averías': 'Averías',
                  'Mejoras': 'Mejoras',
                  'Venta': 'Venta'
                }
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-xs sm:text-base min-w-[70px] sm:min-w-0 touch-manipulation ${
                      activeTab === tab.id
                        ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-center leading-tight font-semibold">{shortLabels[tab.label] || tab.label}</span>
                  </button>
                )
              })}
            </div>
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
                // Opcional: cambiar al tab de resumen después de guardar
                // setActiveTab('resumen')
              }}
            />
          )}

          {activeTab === 'fotos' && (
            <GaleriaFotosTab
              vehiculoId={vehiculoId}
              fotoUrl={vehiculo.foto_url}
              fotosAdicionales={vehiculo.fotos_adicionales || []}
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

          {activeTab === 'venta' && (
            <VentaTab vehiculoId={vehiculoId} />
          )}
        </div>
      </main>

      <Footer />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
