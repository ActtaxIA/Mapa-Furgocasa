'use client'

import { useState, useEffect } from 'react'
import { 
  CurrencyEuroIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  SparklesIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface ValoracionData {
  valor_estimado: number
  confianza: 'Alta' | 'Media' | 'Baja'
  num_comparables: number
  precio_mercado_medio: number
  ajuste_kilometraje: number
  ajuste_estado: number
  ajuste_equipamiento: number
  metodo: string
}

interface Props {
  vehiculoId: string
}

export default function ValoracionVenta({ vehiculoId }: Props) {
  const [valoracion, setValoracion] = useState<ValoracionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [enVenta, setEnVenta] = useState(false)
  const [precioDeseado, setPrecioDeseado] = useState<number | null>(null)
  const [showVentaForm, setShowVentaForm] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    fetchValoracion()
  }, [vehiculoId])

  const fetchValoracion = async () => {
    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/valoracion`)
      if (!response.ok) throw new Error('Error al cargar valoración')
      const data = await response.json()
      setValoracion(data)
      
      // Si hay un precio deseado, activar el formulario
      if (data.precio_venta_deseado) {
        setPrecioDeseado(data.precio_venta_deseado)
        setEnVenta(data.en_venta)
      }
    } catch (error) {
      console.error('Error al calcular valoración:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePonerEnVenta = async () => {
    if (!precioDeseado) return
    
    setGuardando(true)
    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/venta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          en_venta: true,
          precio_venta_deseado: precioDeseado
        })
      })

      if (!response.ok) throw new Error('Error al poner en venta')
      
      setEnVenta(true)
      setShowVentaForm(false)
      alert('¡Vehículo puesto en venta exitosamente!')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al poner el vehículo en venta')
    } finally {
      setGuardando(false)
    }
  }

  const handleQuitarDeVenta = async () => {
    setGuardando(true)
    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/venta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          en_venta: false,
          precio_venta_deseado: precioDeseado
        })
      })

      if (!response.ok) throw new Error('Error al quitar de venta')
      
      setEnVenta(false)
      alert('Vehículo quitado de la venta')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al quitar el vehículo de venta')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!valoracion) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se pudo calcular la valoración
          </h3>
          <p className="text-gray-600">
            Necesitas más datos del vehículo para calcular una valoración precisa.
          </p>
        </div>
      </div>
    )
  }

  const confianzaColor = {
    Alta: 'bg-green-100 text-green-800 border-green-300',
    Media: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Baja: 'bg-orange-100 text-orange-800 border-orange-300'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <SparklesIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">
            ¿Por cuánto puedo vender?
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${confianzaColor[valoracion.confianza]}`}>
          Confianza: {valoracion.confianza}
        </span>
      </div>

      {/* Estado de Venta */}
      {enVenta && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-semibold text-green-900">Vehículo en venta</p>
                <p className="text-sm text-green-700">
                  Precio solicitado: {precioDeseado?.toLocaleString('es-ES')} €
                </p>
              </div>
            </div>
            <button
              onClick={handleQuitarDeVenta}
              disabled={guardando}
              className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              Quitar de venta
            </button>
          </div>
        </div>
      )}

      {/* Valor Estimado Principal */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 mb-6 text-center border border-primary-200">
        <div className="flex items-center justify-center mb-2">
          <CurrencyEuroIcon className="h-8 w-8 text-primary-600 mr-2" />
          <span className="text-4xl font-bold text-primary-900">
            {valoracion.valor_estimado.toLocaleString('es-ES', { 
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            })} €
          </span>
        </div>
        <p className="text-primary-700 font-medium">Valor estimado de mercado</p>
        <p className="text-sm text-primary-600 mt-2">
          Basado en {valoracion.num_comparables} vehículos comparables
        </p>
      </div>

      {/* Rango de Precios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center mb-1">
            <ArrowTrendingDownIcon className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-900">Venta Rápida</span>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {(valoracion.valor_estimado * 0.9).toLocaleString('es-ES', { maximumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-red-600 mt-1">-10% para vender en 1-2 semanas</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center mb-1">
            <CurrencyEuroIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-900">Precio Justo</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {valoracion.valor_estimado.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-green-600 mt-1">Precio equilibrado de mercado</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center mb-1">
            <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Precio Óptimo</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {(valoracion.valor_estimado * 1.1).toLocaleString('es-ES', { maximumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-blue-600 mt-1">+10% si no hay prisa</p>
        </div>
      </div>

      {/* Desglose de Ajustes */}
      <div className="space-y-3 mb-6">
        <h4 className="font-semibold text-gray-900">Desglose de la valoración:</h4>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-700">Precio base de mercado</span>
          <span className="font-semibold text-gray-900">
            {valoracion.precio_mercado_medio.toLocaleString('es-ES')} €
          </span>
        </div>

        {Math.abs(valoracion.ajuste_kilometraje) > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Ajuste por kilometraje</span>
            <span className={`font-semibold ${valoracion.ajuste_kilometraje > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {valoracion.ajuste_kilometraje > 0 ? '-' : '+'}
              {Math.abs(valoracion.ajuste_kilometraje).toLocaleString('es-ES')} €
            </span>
          </div>
        )}

        {Math.abs(valoracion.ajuste_estado) > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Ajuste por estado/averías</span>
            <span className={`font-semibold ${valoracion.ajuste_estado > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {valoracion.ajuste_estado > 0 ? '-' : '+'}
              {Math.abs(valoracion.ajuste_estado).toLocaleString('es-ES')} €
            </span>
          </div>
        )}
      </div>

      {/* Comparativa con Mercado */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Contexto de Mercado</h4>
        <p className="text-sm text-blue-800">
          Hemos analizado <strong>{valoracion.num_comparables} vehículos similares</strong> vendidos recientemente.
          El precio medio de mercado es de <strong>{valoracion.precio_mercado_medio.toLocaleString('es-ES')} €</strong>.
        </p>
        {valoracion.confianza === 'Baja' && (
          <p className="text-sm text-blue-700 mt-2">
            ⚠️ Hay pocos datos comparables. Esta estimación es aproximada y puede variar.
          </p>
        )}
      </div>

      {/* Botón de Acción */}
      {!enVenta && !showVentaForm && (
        <button
          onClick={() => {
            setPrecioDeseado(valoracion.valor_estimado)
            setShowVentaForm(true)
          }}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Poner en venta
        </button>
      )}

      {/* Formulario de Venta */}
      {showVentaForm && !enVenta && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Establecer precio de venta</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio deseado (€)
              </label>
              <input
                type="number"
                value={precioDeseado || ''}
                onChange={(e) => setPrecioDeseado(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: 45000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sugerencia: {valoracion.valor_estimado.toLocaleString('es-ES')} € - {(valoracion.valor_estimado * 1.1).toLocaleString('es-ES')} €
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePonerEnVenta}
                disabled={guardando || !precioDeseado}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowVentaForm(false)}
                disabled={guardando}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Método */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">{valoracion.metodo}</p>
      </div>
    </div>
  )
}

