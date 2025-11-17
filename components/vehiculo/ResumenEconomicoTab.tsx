'use client'

import { useState, useEffect } from 'react'
import {
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Props {
  vehiculoId: string
}

interface ResumenData {
  precio_compra: number | null
  inversion_total: number | null
  valor_estimado_actual: number | null
  total_mantenimientos: number | null
  total_averias: number | null
  total_mejoras: number | null
  ganancia_perdida: number | null
  depreciacion_anual_porcentaje: number | null
  vendido: boolean | null
  precio_venta_final: number | null
  fecha_venta: string | null
}

export function ResumenEconomicoTab({ vehiculoId }: Props) {
  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState<ResumenData | null>(null)

  useEffect(() => {
    loadResumen()
  }, [vehiculoId])

  const loadResumen = async () => {
    try {
      // Usar API que normaliza los campos numéricos (DECIMAL → number)
      const response = await fetch(`/api/vehiculos/${vehiculoId}/resumen-economico`)

      if (!response.ok) {
        console.error('Error cargando resumen:', response.statusText)
        return
      }

      const data = await response.json()
      setResumen(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para formatear números sin decimales (formato español: 55.000)
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return `${Math.round(value).toLocaleString('es-ES')} €`
  }

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return `${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const hasData = resumen && resumen.precio_compra !== null

  // Calcular totales
  const totalGastos = (resumen?.total_mantenimientos || 0) + (resumen?.total_averias || 0) + (resumen?.total_mejoras || 0)
  const inversionRealConGastos = (resumen?.precio_compra || 0) + totalGastos

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Resumen Económico</h2>
          <p className="text-sm text-gray-600 mt-1">Vista general de la inversión y valor de tu vehículo</p>
        </div>
        {!hasData && (
          <div className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
            <p className="font-semibold">ℹ️ Completa los "Datos de Compra"</p>
            <p className="text-xs mt-1">Para ver el resumen económico completo</p>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
          <ChartBarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sin datos económicos</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Añade los datos de compra de tu vehículo en la pestaña <strong>"Datos de Compra"</strong> para comenzar a ver el resumen económico completo
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-primary-600 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200">
            <CurrencyEuroIcon className="w-4 h-4" />
            <span>Ve a "Datos de Compra" para empezar</span>
          </div>
        </div>
      ) : (
        <>
          {/* KPIs Principales - Fila Superior */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Precio de Compra */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-700">Precio de Compra</span>
                <CurrencyEuroIcon className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900 mb-1">
                {formatCurrency(resumen.precio_compra)}
              </p>
              <p className="text-xs text-blue-600">
                Inversión inicial
              </p>
            </div>

            {/* Total Gastos */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-red-700">Total Gastos</span>
                <ArrowTrendingDownIcon className="w-7 h-7 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-900 mb-1">
                {formatCurrency(totalGastos)}
              </p>
              <p className="text-xs text-red-600">
                Mant. + Averías + Mejoras
              </p>
            </div>

            {/* Inversión Total */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-purple-700">Inversión Total</span>
                <ChartBarIcon className="w-7 h-7 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900 mb-1">
                {formatCurrency(inversionRealConGastos)}
              </p>
              <p className="text-xs text-purple-600">
                Compra + Todos los gastos
              </p>
            </div>

            {/* Valor Estimado / Precio Venta Final */}
            <div className={`bg-gradient-to-br ${resumen.vendido ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-green-50 to-green-100 border-green-200'} rounded-xl p-6 border-2 shadow-md hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-semibold ${resumen.vendido ? 'text-emerald-700' : 'text-green-700'}`}>
                  {resumen.vendido ? '✅ Precio Venta Final' : 'Valor Estimado'}
                </span>
                <ArrowTrendingUpIcon className={`w-7 h-7 ${resumen.vendido ? 'text-emerald-600' : 'text-green-600'}`} />
              </div>
              <p className={`text-3xl font-bold ${resumen.vendido ? 'text-emerald-900' : 'text-green-900'} mb-1`}>
                {resumen.vendido ? formatCurrency(resumen.precio_venta_final) : formatCurrency(resumen.valor_estimado_actual)}
              </p>
              <p className={`text-xs ${resumen.vendido ? 'text-emerald-600' : 'text-green-600'}`}>
                {resumen.vendido ? (
                  <>Vendido{resumen.fecha_venta ? ` el ${new Date(resumen.fecha_venta).toLocaleDateString('es-ES')}` : ''}</>
                ) : (
                  'Valor actual aproximado'
                )}
              </p>
            </div>
          </div>

          {/* KPI Depreciación - Destacado */}
          {resumen.depreciacion_anual_porcentaje !== null && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-orange-100 rounded-full">
                    <ArrowTrendingDownIcon className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700 mb-1">Depreciación Anual</p>
                    <p className="text-4xl font-bold text-orange-900">
                      {formatPercentage(resumen.depreciacion_anual_porcentaje)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Pérdida de valor estimada por año</p>
                  <p className="text-xs text-gray-500 mt-1">Basado en precio de compra</p>
                </div>
              </div>
            </div>
          )}

          {/* Desglose de Gastos */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-primary-600" />
              Desglose Detallado de Gastos
            </h3>

            <div className="space-y-4">
              {/* Mantenimientos */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                    <WrenchScrewdriverIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Mantenimientos</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Revisiones, cambios, ITV...</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xl sm:text-2xl font-bold text-blue-900 whitespace-nowrap">
                    {formatCurrency(resumen.total_mantenimientos)}
                  </p>
                  {totalGastos > 0 && (
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {((resumen.total_mantenimientos || 0) / totalGastos * 100).toFixed(1)}% del total
                    </p>
                  )}
                </div>
              </div>

              {/* Averías */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0">
                    <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Averías y Reparaciones</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Reparaciones inesperadas</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xl sm:text-2xl font-bold text-red-900 whitespace-nowrap">
                    {formatCurrency(resumen.total_averias)}
                  </p>
                  {totalGastos > 0 && (
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {((resumen.total_averias || 0) / totalGastos * 100).toFixed(1)}% del total
                    </p>
                  )}
                </div>
              </div>

              {/* Mejoras */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0">
                    <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Mejoras y Accesorios</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Inversiones que añaden valor</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xl sm:text-2xl font-bold text-purple-900 whitespace-nowrap">
                    {formatCurrency(resumen.total_mejoras)}
                  </p>
                  {totalGastos > 0 && (
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {((resumen.total_mejoras || 0) / totalGastos * 100).toFixed(1)}% del total
                    </p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 mt-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 text-base sm:text-lg">Total Gastos</p>
                  <p className="text-xs text-gray-600 hidden sm:block">Suma de todos los gastos</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 whitespace-nowrap ml-2">
                  {formatCurrency(totalGastos)}
                </p>
              </div>
            </div>
          </div>

          {/* Ganancia/Pérdida (si está vendido) */}
          {resumen.ganancia_perdida !== null && (
            <div className={`rounded-xl p-6 border-2 ${
              resumen.ganancia_perdida >= 0
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">
                    {resumen.ganancia_perdida >= 0 ? 'Ganancia en la venta' : 'Pérdida en la venta'}
                  </p>
                  <p className={`text-3xl font-bold ${
                    resumen.ganancia_perdida >= 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {formatCurrency(Math.abs(resumen.ganancia_perdida))}
                  </p>
                </div>
                {resumen.ganancia_perdida >= 0 ? (
                  <ArrowTrendingUpIcon className="w-12 h-12 text-green-600" />
                ) : (
                  <ArrowTrendingDownIcon className="w-12 h-12 text-red-600" />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
