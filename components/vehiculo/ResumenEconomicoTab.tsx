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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts'

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
  fecha_compra: string | null
}

interface ValoracionIA {
  id: string
  fecha_valoracion: string
  precio_objetivo: number
  precio_salida: number
  precio_minimo: number
}

export function ResumenEconomicoTab({ vehiculoId }: Props) {
  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState<ResumenData | null>(null)
  const [valoracionesIA, setValoracionesIA] = useState<ValoracionIA[]>([])

  useEffect(() => {
    loadResumen()
    loadValoraciones()
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

  const loadValoraciones = async () => {
    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/ia-valoracion`)
      if (!response.ok) {
        console.error('Error cargando valoraciones:', response.statusText)
        return
      }
      const data = await response.json()
      setValoracionesIA(data.informes || [])
    } catch (error) {
      console.error('Error cargando valoraciones:', error)
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

  // Preparar datos para el gráfico de evolución del valor
  const prepararDatosGrafico = () => {
    const puntos: any[] = []

    // 1. Punto inicial: Precio de compra
    if (resumen?.precio_compra && resumen.fecha_compra) {
      puntos.push({
        fecha: new Date(resumen.fecha_compra).getTime(),
        fechaLabel: new Date(resumen.fecha_compra).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        valor: resumen.precio_compra,
        tipo: 'Compra',
        descripcion: 'Precio de compra inicial'
      })
    }

    // 2. Puntos intermedios: Valoraciones IA (ordenadas cronológicamente)
    valoracionesIA
      .sort((a, b) => new Date(a.fecha_valoracion).getTime() - new Date(b.fecha_valoracion).getTime())
      .forEach((val, index) => {
        puntos.push({
          fecha: new Date(val.fecha_valoracion).getTime(),
          fechaLabel: new Date(val.fecha_valoracion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          valor: val.precio_objetivo,
          tipo: `Valoración ${index + 1}`,
          descripcion: `Valoración IA (${val.precio_objetivo.toLocaleString('es-ES')} €)`
        })
      })

    // 3. Punto final: Precio de venta (si está vendido)
    if (resumen?.vendido && resumen.precio_venta_final && resumen.fecha_venta) {
      puntos.push({
        fecha: new Date(resumen.fecha_venta).getTime(),
        fechaLabel: new Date(resumen.fecha_venta).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        valor: resumen.precio_venta_final,
        tipo: 'Venta',
        descripcion: 'Precio de venta final'
      })
    }

    // Ordenar por fecha
    return puntos.sort((a, b) => a.fecha - b.fecha)
  }

  const datosGrafico = prepararDatosGrafico()
  const tieneHistorialValor = datosGrafico.length >= 2

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

          {/* Gráfico de Evolución del Valor */}
          {tieneHistorialValor && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                    Evolución del Valor del Vehículo
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Historial de precio desde la compra{valoracionesIA.length > 0 && ' con valoraciones'}{resumen?.vendido && ' hasta la venta'}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-600">Compra</span>
                  </div>
                  {valoracionesIA.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs text-gray-600">Valoraciones</span>
                    </div>
                  )}
                  {resumen?.vendido && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-600">Venta</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={datosGrafico} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="fechaLabel" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      domain={['dataMin - 2000', 'dataMax + 2000']}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white border-2 border-indigo-200 rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-gray-900 mb-1">{data.tipo}</p>
                              <p className="text-sm text-gray-600">{data.fechaLabel}</p>
                              <p className="text-lg font-bold text-indigo-600 mt-1">
                                {data.valor.toLocaleString('es-ES')} €
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{data.descripcion}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      fill="url(#colorValor)"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props
                        let fill = '#3b82f6' // azul por defecto (compra)
                        if (payload.tipo === 'Venta') fill = '#10b981' // verde (venta)
                        else if (payload.tipo.includes('Valoración')) fill = '#8b5cf6' // morado (valoración)
                        
                        return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={6} 
                            fill={fill}
                            stroke="white"
                            strokeWidth={2}
                          />
                        )
                      }}
                      activeDot={{ r: 8 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Estadísticas del gráfico */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 font-semibold mb-1">Precio Inicial</p>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(datosGrafico[0]?.valor)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs text-purple-700 font-semibold mb-1">Valoraciones</p>
                  <p className="text-lg font-bold text-purple-900">
                    {valoracionesIA.length}
                  </p>
                </div>
                <div className={`rounded-lg p-3 border ${
                  resumen?.vendido 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <p className={`text-xs font-semibold mb-1 ${
                    resumen?.vendido ? 'text-green-700' : 'text-indigo-700'
                  }`}>
                    {resumen?.vendido ? 'Precio Venta' : 'Valor Actual'}
                  </p>
                  <p className={`text-lg font-bold ${
                    resumen?.vendido ? 'text-green-900' : 'text-indigo-900'
                  }`}>
                    {formatCurrency(datosGrafico[datosGrafico.length - 1]?.valor)}
                  </p>
                </div>
                <div className={`rounded-lg p-3 border ${
                  (datosGrafico[datosGrafico.length - 1]?.valor || 0) < (datosGrafico[0]?.valor || 0)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <p className={`text-xs font-semibold mb-1 ${
                    (datosGrafico[datosGrafico.length - 1]?.valor || 0) < (datosGrafico[0]?.valor || 0)
                      ? 'text-red-700'
                      : 'text-emerald-700'
                  }`}>
                    Variación Total
                  </p>
                  <p className={`text-lg font-bold ${
                    (datosGrafico[datosGrafico.length - 1]?.valor || 0) < (datosGrafico[0]?.valor || 0)
                      ? 'text-red-900'
                      : 'text-emerald-900'
                  }`}>
                    {(() => {
                      const inicial = datosGrafico[0]?.valor || 0
                      const final = datosGrafico[datosGrafico.length - 1]?.valor || 0
                      const diferencia = final - inicial
                      const porcentaje = inicial > 0 ? ((diferencia / inicial) * 100).toFixed(1) : 0
                      return `${diferencia >= 0 ? '+' : ''}${porcentaje}%`
                    })()}
                  </p>
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
