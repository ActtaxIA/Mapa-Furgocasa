'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
}

export function ResumenEconomicoTab({ vehiculoId }: Props) {
  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState<ResumenData | null>(null)

  useEffect(() => {
    loadResumen()
  }, [vehiculoId])

  const loadResumen = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('vehiculo_valoracion_economica')
        .select('*')
        .eq('vehiculo_id', vehiculoId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error cargando resumen:', error)
        return
      }

      setResumen(data || {
        precio_compra: null,
        inversion_total: null,
        valor_estimado_actual: null,
        total_mantenimientos: null,
        total_averias: null,
        total_mejoras: null,
        ganancia_perdida: null,
        depreciacion_anual_porcentaje: null
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Resumen Económico</h2>
        {!hasData && (
          <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
            ℹ️ Completa los "Datos de Compra" para ver el resumen
          </p>
        )}
      </div>

      {!hasData ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos económicos</h3>
          <p className="text-sm text-gray-500 mb-4">
            Añade los datos de compra de tu vehículo para comenzar a ver el resumen económico
          </p>
        </div>
      ) : (
        <>
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Precio de Compra */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Precio de Compra</span>
                <CurrencyEuroIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {formatCurrency(resumen.precio_compra)}
              </p>
            </div>

            {/* Inversión Total */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Inversión Total</span>
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {formatCurrency(resumen.inversion_total)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Compra + Gastos
              </p>
            </div>

            {/* Valor Actual */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Valor Estimado</span>
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">
                {formatCurrency(resumen.valor_estimado_actual)}
              </p>
            </div>

            {/* Depreciación */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-700">Depreciación Anual</span>
                <ArrowTrendingDownIcon className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {formatPercentage(resumen.depreciacion_anual_porcentaje)}
              </p>
            </div>
          </div>

          {/* Desglose de Gastos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Desglose de Gastos</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Mantenimientos</span>
                </div>
                <span className="font-bold text-gray-900">
                  {formatCurrency(resumen.total_mantenimientos)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-700">Averías</span>
                </div>
                <span className="font-bold text-gray-900">
                  {formatCurrency(resumen.total_averias)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-700">Mejoras y Accesorios</span>
                </div>
                <span className="font-bold text-gray-900">
                  {formatCurrency(resumen.total_mejoras)}
                </span>
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

