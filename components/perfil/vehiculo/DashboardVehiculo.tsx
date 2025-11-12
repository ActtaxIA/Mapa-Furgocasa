'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehiculoRegistrado } from '@/types/reportes.types'
import { ResumenEconomico } from '@/types/gestion-vehiculos.types'
import {
  CurrencyEuroIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import ValoracionVenta from './ValoracionVenta'
import HistoricoValoracion from './HistoricoValoracion'

interface Props {
  vehiculo: VehiculoRegistrado
  onTabChange: (tab: string) => void
}

export function DashboardVehiculo({ vehiculo, onTabChange }: Props) {
  const [resumen, setResumen] = useState<ResumenEconomico | null>(null)
  const [loading, setLoading] = useState(true)
  const [proximasAlertas, setProximasAlertas] = useState<any[]>([])

  useEffect(() => {
    cargarDatos()
  }, [vehiculo.id])

  const cargarDatos = async () => {
    try {
      const supabase = createClient()

      // Cargar resumen económico
      const { data: resumenData } = await supabase
        .rpc('obtener_resumen_economico_vehiculo', { p_vehiculo_id: vehiculo.id })
        .single()

      if (resumenData) {
        setResumen(resumenData as ResumenEconomico)
      }

      // Cargar próximas alertas (mantenimientos y documentos próximos a vencer)
      const hoy = new Date()
      const en30Dias = new Date()
      en30Dias.setDate(hoy.getDate() + 30)

      const { data: alertasMantenimiento } = await supabase
        .from('mantenimientos')
        .select('tipo, proximo_mantenimiento, kilometraje_proximo')
        .eq('vehiculo_id', vehiculo.id)
        .not('proximo_mantenimiento', 'is', null)
        .lte('proximo_mantenimiento', en30Dias.toISOString())
        .order('proximo_mantenimiento')

      const { data: alertasDocumentos } = await supabase
        .from('vehiculo_documentos')
        .select('tipo, nombre, fecha_caducidad')
        .eq('vehiculo_id', vehiculo.id)
        .not('fecha_caducidad', 'is', null)
        .lte('fecha_caducidad', en30Dias.toISOString())
        .order('fecha_caducidad')

      const alertas = [
        ...(alertasMantenimiento || []).map(a => ({ ...a, tipo_alerta: 'mantenimiento' })),
        ...(alertasDocumentos || []).map(a => ({ ...a, tipo_alerta: 'documento' }))
      ]

      setProximasAlertas(alertas)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const estadoFinanciero = resumen?.inversion_total || 0
  const valorActual = resumen?.valor_estimado_actual || 0
  const depreciacion = resumen?.depreciacion_porcentaje || 0

  return (
    <div className="space-y-6">
      {/* Header con información del vehículo */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TruckIcon className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold">{vehiculo.matricula}</h2>
              <p className="text-primary-100">
                {vehiculo.marca} {vehiculo.modelo} - {vehiculo.año}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-100">Kilometraje actual</p>
            <p className="text-3xl font-bold">{resumen?.km_actual?.toLocaleString() || '-'} km</p>
          </div>
        </div>
      </div>

      {/* Alertas Próximas */}
      {proximasAlertas.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {proximasAlertas.length} {proximasAlertas.length === 1 ? 'alerta próxima' : 'alertas próximas'}
              </h3>
              <div className="mt-2 text-sm text-yellow-700 space-y-1">
                {proximasAlertas.slice(0, 3).map((alerta, idx) => (
                  <p key={idx}>
                    • {alerta.tipo_alerta === 'mantenimiento' ? `Mantenimiento: ${alerta.tipo}` : `Documento: ${alerta.nombre}`}
                    {' '}- {new Date(alerta.proximo_mantenimiento || alerta.fecha_caducidad).toLocaleDateString('es-ES')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inversión Total */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inversión Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {estadoFinanciero.toLocaleString()}€
              </p>
              <p className="text-xs text-gray-500 mt-1">Compra + Gastos</p>
            </div>
            <CurrencyEuroIcon className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        {/* Valor Actual */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Estimado</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {valorActual > 0 ? `${valorActual.toLocaleString()}€` : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Valoración actual</p>
            </div>
            <ChartBarIcon className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Depreciación */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Depreciación</p>
              <p className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-1">
                {depreciacion > 0 ? `${depreciacion.toFixed(1)}%` : 'N/A'}
                {depreciacion > 0 && <ArrowTrendingDownIcon className="w-5 h-5 text-orange-500" />}
              </p>
              <p className="text-xs text-gray-500 mt-1">Desde compra</p>
            </div>
            <ArrowTrendingDownIcon className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        {/* Coste por km */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coste por km</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {resumen?.coste_por_km ? `${resumen.coste_por_km.toFixed(2)}€` : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Promedio</p>
            </div>
            <TruckIcon className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => onTabChange('mantenimientos')}
            className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow border border-gray-200 flex flex-col items-center text-center"
          >
            <WrenchScrewdriverIcon className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Mantenimientos</span>
            <span className="text-xs text-gray-500 mt-1">{resumen?.total_mantenimientos || 0}€</span>
          </button>

          <button
            onClick={() => onTabChange('averias')}
            className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow border border-gray-200 flex flex-col items-center text-center"
          >
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Averías</span>
            <span className="text-xs text-gray-500 mt-1">{resumen?.total_averias || 0}€</span>
          </button>

          <button
            onClick={() => onTabChange('mejoras')}
            className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow border border-gray-200 flex flex-col items-center text-center"
          >
            <SparklesIcon className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Mejoras</span>
            <span className="text-xs text-gray-500 mt-1">{resumen?.total_mejoras || 0}€</span>
          </button>

          <button
            onClick={() => onTabChange('documentos')}
            className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow border border-gray-200 flex flex-col items-center text-center"
          >
            <DocumentTextIcon className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Documentos</span>
            <span className="text-xs text-gray-500 mt-1">Gestionar</span>
          </button>

          <button
            onClick={() => onTabChange('kilometraje')}
            className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow border border-gray-200 flex flex-col items-center text-center"
          >
            <TruckIcon className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Kilometraje</span>
            <span className="text-xs text-gray-500 mt-1">Registrar</span>
          </button>

          <button
            onClick={() => onTabChange('valoracion')}
            className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow border border-gray-200 flex flex-col items-center text-center"
          >
            <ChartBarIcon className="w-8 h-8 text-cyan-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Valoración</span>
            <span className="text-xs text-gray-500 mt-1">Ver análisis</span>
          </button>
        </div>
      </div>

      {/* Valoración y Análisis de Venta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ValoracionVenta vehiculoId={vehiculo.id} />
        <HistoricoValoracion vehiculoId={vehiculo.id} />
      </div>

      {/* Desglose de Costes */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose de Costes</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Precio de Compra</span>
            <span className="text-sm font-bold text-gray-900">
              {resumen?.precio_compra?.toLocaleString() || 0}€
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Mantenimientos</span>
            <span className="text-sm font-bold text-blue-900">
              {resumen?.total_mantenimientos?.toLocaleString() || 0}€
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Averías</span>
            <span className="text-sm font-bold text-red-900">
              {resumen?.total_averias?.toLocaleString() || 0}€
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Mejoras</span>
            <span className="text-sm font-bold text-green-900">
              {resumen?.total_mejoras?.toLocaleString() || 0}€
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Seguros + Impuestos</span>
            <span className="text-sm font-bold text-purple-900">
              {((resumen?.total_seguros || 0) + (resumen?.total_impuestos || 0)).toLocaleString()}€
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Otros Gastos</span>
            <span className="text-sm font-bold text-orange-900">
              {resumen?.total_otros_gastos?.toLocaleString() || 0}€
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-primary-100 rounded-lg border-2 border-primary-300">
            <span className="text-base font-bold text-primary-900">TOTAL INVERTIDO</span>
            <span className="text-xl font-bold text-primary-900">
              {estadoFinanciero.toLocaleString()}€
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
