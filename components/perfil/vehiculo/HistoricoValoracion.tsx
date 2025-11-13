'use client'

import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

interface ValoracionHistorica {
  id: string
  fecha_valoracion: string
  valor_estimado: number
  kilometros: number | null
  fuente: string
  notas: string | null
}

interface Props {
  vehiculoId: string
}

// Función para formatear números en formato español (miles con k)
const formatNumberK = (value: number): string => {
  return `${Math.round(value / 1000)}k €`
}

export default function HistoricoValoracion({ vehiculoId }: Props) {
  const [historico, setHistorico] = useState<ValoracionHistorica[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddManual, setShowAddManual] = useState(false)
  const [valorManual, setValorManual] = useState<number | null>(null)
  const [kmManual, setKmManual] = useState<number | null>(null)
  const [notasManual, setNotasManual] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    fetchHistorico()
  }, [vehiculoId])

  const fetchHistorico = async () => {
    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/historico-valoracion`)
      if (!response.ok) throw new Error('Error al cargar histórico')
      const data = await response.json()
      setHistorico(data)
    } catch (error) {
      console.error('Error al cargar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddManual = async () => {
    if (!valorManual) return

    setGuardando(true)
    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/historico-valoracion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor_estimado: valorManual,
          kilometros: kmManual,
          fuente: 'manual',
          notas: notasManual
        })
      })

      if (!response.ok) throw new Error('Error al guardar')

      await fetchHistorico()
      setShowAddManual(false)
      setValorManual(null)
      setKmManual(null)
      setNotasManual('')
      alert('Valoración añadida al histórico')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al añadir valoración')
    } finally {
      setGuardando(false)
    }
  }

  const calcularCambio = () => {
    if (historico.length < 2) return null

    const primera = historico[0].valor_estimado
    const ultima = historico[historico.length - 1].valor_estimado
    const cambio = ultima - primera
    const porcentaje = (cambio / primera) * 100

    return { cambio, porcentaje }
  }

  const prepararDatosGrafico = () => {
    return historico.map(item => ({
      fecha: new Date(item.fecha_valoracion).toLocaleDateString('es-ES', {
        month: 'short',
        year: 'numeric'
      }),
      valor: item.valor_estimado,
      km: item.kilometros
    }))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const cambio = calcularCambio()
  const datosGrafico = prepararDatosGrafico()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ChartBarIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">
            Evolución del Valor
          </h3>
        </div>
        <button
          onClick={() => setShowAddManual(!showAddManual)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + Añadir Valoración
        </button>
      </div>

      {/* Formulario Manual */}
      {showAddManual && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Añadir valoración manual</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor estimado (€) *
              </label>
              <input
                type="number"
                value={valorManual || ''}
                onChange={(e) => setValorManual(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: 45000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kilometraje actual
              </label>
              <input
                type="number"
                value={kmManual || ''}
                onChange={(e) => setKmManual(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: 85000"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notasManual}
              onChange={(e) => setNotasManual(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Valoración tras revisión completa, Tasación de concesionario..."
              rows={2}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddManual}
              disabled={guardando || !valorManual}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => {
                setShowAddManual(false)
                setValorManual(null)
                setKmManual(null)
                setNotasManual('')
              }}
              disabled={guardando}
              className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {historico.length === 0 ? (
        <div className="text-center py-12">
          <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Sin histórico de valoraciones
          </h4>
          <p className="text-gray-600 mb-4">
            Añade valoraciones manualmente o espera a que el sistema genere el histórico automáticamente.
          </p>
        </div>
      ) : (
        <>
          {/* Estadísticas de Cambio */}
          {cambio && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Valor Inicial</p>
                <p className="text-2xl font-bold text-blue-900">
                  {historico[0].valor_estimado.toLocaleString('es-ES')} €
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {new Date(historico[0].fecha_valoracion).toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 mb-1">Valor Actual</p>
                <p className="text-2xl font-bold text-green-900">
                  {historico[historico.length - 1].valor_estimado.toLocaleString('es-ES')} €
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {new Date(historico[historico.length - 1].fecha_valoracion).toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className={`rounded-lg p-4 border ${
                cambio.cambio >= 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-1">
                  {cambio.cambio >= 0 ? (
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
                  ) : cambio.cambio < 0 ? (
                    <ArrowTrendingDownIcon className="h-5 w-5 text-red-600 mr-2" />
                  ) : (
                    <MinusIcon className="h-5 w-5 text-gray-600 mr-2" />
                  )}
                  <p className={`text-sm font-medium ${
                    cambio.cambio >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    Cambio Total
                  </p>
                </div>
                <p className={`text-2xl font-bold ${
                  cambio.cambio >= 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {cambio.cambio > 0 ? '+' : ''}{cambio.cambio.toLocaleString('es-ES')} €
                </p>
                <p className={`text-xs mt-1 ${
                  cambio.cambio >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {cambio.porcentaje > 0 ? '+' : ''}{cambio.porcentaje.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Gráfico */}
          {datosGrafico.length > 1 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Evolución temporal</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={datosGrafico}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="fecha"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={formatNumberK}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('es-ES')} €`, 'Valor']}
                  />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="url(#colorValor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Lista de Valoraciones */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Histórico detallado</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {historico.slice().reverse().map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(item.fecha_valoracion).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.fuente === 'automatico'
                          ? 'bg-blue-100 text-blue-700'
                          : item.fuente === 'manual'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.fuente === 'automatico' ? '🤖 Auto' : '✏️ Manual'}
                      </span>
                    </div>
                    {item.kilometros && (
                      <p className="text-xs text-gray-600">
                        Km: {item.kilometros.toLocaleString('es-ES')}
                      </p>
                    )}
                    {item.notas && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        {item.notas}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {item.valor_estimado.toLocaleString('es-ES')} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
