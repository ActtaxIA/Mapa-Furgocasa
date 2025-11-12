'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface VentaData {
  vendido: boolean
  precio_venta_final: number | null
  fecha_venta: string | null
  comprador_tipo: string | null
  notas_venta: string | null
  // Para cálculos
  precio_compra: number | null
  inversion_total: number | null
}

interface Props {
  vehiculoId: string
}

export default function VentaTab({ vehiculoId }: Props) {
  const [datos, setDatos] = useState<VentaData | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    precio_venta_final: '',
    fecha_venta: new Date().toISOString().split('T')[0],
    comprador_tipo: 'particular',
    kilometros_venta: '',
    estado_venta: 'bueno',
    notas_venta: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [vehiculoId])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      const response = await fetch(`/api/vehiculos/${vehiculoId}/venta`)
      
      if (response.ok) {
        const data = await response.json()
        setDatos(data)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setCargando(false)
    }
  }

  const handleRegistrarVenta = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setGuardando(true)
      setMensaje(null)

      const response = await fetch(`/api/vehiculos/${vehiculoId}/venta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'registrar_venta',
          precio_venta_final: parseFloat(formData.precio_venta_final),
          fecha_venta: formData.fecha_venta,
          comprador_tipo: formData.comprador_tipo,
          kilometros_venta: formData.kilometros_venta ? parseInt(formData.kilometros_venta) : null,
          estado_venta: formData.estado_venta,
          notas_venta: formData.notas_venta || null
        })
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: '¡Venta registrada correctamente! Gracias por contribuir con datos al mercado.'
        })
        await cargarDatos()
      } else {
        const error = await response.json()
        setMensaje({ tipo: 'error', texto: error.error || 'Error al registrar venta' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al procesar la solicitud' })
    } finally {
      setGuardando(false)
    }
  }

  const calcularGananciaPerdida = () => {
    if (!datos?.inversion_total || !formData.precio_venta_final) return null
    const precioVenta = parseFloat(formData.precio_venta_final)
    return precioVenta - datos.inversion_total
  }

  const calcularGananciaPerdidaFinal = () => {
    if (!datos?.inversion_total || !datos?.precio_venta_final) return null
    return datos.precio_venta_final - datos.inversion_total
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Registro de Venta</h2>
        <p className="mt-1 text-sm text-gray-500">
          Registra los detalles de la venta de tu vehículo para tu historial y ayudar a la comunidad
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">¿Para qué es este registro?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Mantén un historial completo de tu vehículo</li>
              <li>Calcula tu ganancia o pérdida real</li>
              <li>Ayuda a otros usuarios con datos reales de mercado (de forma anónima)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`rounded-md p-4 ${mensaje.tipo === 'exito' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-sm ${mensaje.tipo === 'exito' ? 'text-green-800' : 'text-red-800'}`}>
            {mensaje.texto}
          </p>
        </div>
      )}

      {/* Estado de venta registrada */}
      {datos?.vendido ? (
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                ✅ Venta Registrada
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded p-3">
                  <span className="font-medium text-gray-700">Precio de venta:</span>
                  <p className="text-xl font-bold text-green-900 mt-1">
                    {datos.precio_venta_final?.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-white rounded p-3">
                  <span className="font-medium text-gray-700">Fecha de venta:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {datos.fecha_venta ? new Date(datos.fecha_venta).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : '-'}
                  </p>
                </div>
                <div className="bg-white rounded p-3">
                  <span className="font-medium text-gray-700">Tipo de comprador:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                    {datos.comprador_tipo?.replace('_', ' ') || '-'}
                  </p>
                </div>
                {datos.inversion_total && datos.precio_venta_final && (
                  <div className={`rounded p-3 ${calcularGananciaPerdidaFinal()! >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className="font-medium text-gray-700">Resultado final:</span>
                    <p className={`text-xl font-bold mt-1 flex items-center ${calcularGananciaPerdidaFinal()! >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {calcularGananciaPerdidaFinal()! >= 0 ? (
                        <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                      )}
                      {calcularGananciaPerdidaFinal()! >= 0 ? '+' : ''}
                      {calcularGananciaPerdidaFinal()!.toFixed(2)} €
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Inversión total: {datos.inversion_total.toFixed(2)} €
                    </p>
                  </div>
                )}
              </div>
              {datos.notas_venta && (
                <div className="mt-4 p-3 bg-white rounded border border-green-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Notas:</p>
                  <p className="text-sm text-gray-600">{datos.notas_venta}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Formulario de registro de venta */
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Registrar Venta Realizada
          </h3>
          
          <form onSubmit={handleRegistrarVenta} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Precio de venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de venta final (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.precio_venta_final}
                  onChange={(e) => setFormData({ ...formData, precio_venta_final: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: 33500.00"
                />
                <p className="text-xs text-gray-500 mt-1">Precio real al que vendiste el vehículo</p>
              </div>

              {/* Fecha de venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de venta *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_venta}
                  onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              {/* Tipo de comprador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de comprador *
                </label>
                <select
                  required
                  value={formData.comprador_tipo}
                  onChange={(e) => setFormData({ ...formData, comprador_tipo: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="particular">Particular</option>
                  <option value="concesionario">Concesionario</option>
                  <option value="empresa">Empresa</option>
                  <option value="plataforma_online">Plataforma online</option>
                </select>
              </div>

              {/* Kilometraje en la venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometraje al vender
                </label>
                <input
                  type="number"
                  value={formData.kilometros_venta}
                  onChange={(e) => setFormData({ ...formData, kilometros_venta: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: 85000"
                />
              </div>

              {/* Estado del vehículo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del vehículo al vender *
                </label>
                <select
                  required
                  value={formData.estado_venta}
                  onChange={(e) => setFormData({ ...formData, estado_venta: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="excelente">Excelente - Como nuevo</option>
                  <option value="muy_bueno">Muy bueno - Bien mantenido</option>
                  <option value="bueno">Bueno - Estado normal</option>
                  <option value="regular">Regular - Con desgaste visible</option>
                  <option value="para_reparar">Para reparar - Necesita trabajo</option>
                </select>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas sobre la venta (opcional)
              </label>
              <textarea
                rows={3}
                value={formData.notas_venta}
                onChange={(e) => setFormData({ ...formData, notas_venta: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="¿Cómo fue la negociación? ¿Dónde anunciaste? ¿Cuánto tiempo tardó en venderse? Cualquier detalle útil..."
              />
            </div>

            {/* Cálculo de ganancia/pérdida */}
            {datos?.inversion_total && formData.precio_venta_final && (
              <div className={`p-4 rounded-lg border-2 ${calcularGananciaPerdida()! >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tu resultado:</span>
                  <span className={`text-2xl font-bold flex items-center ${calcularGananciaPerdida()! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calcularGananciaPerdida()! >= 0 ? (
                      <ArrowTrendingUpIcon className="h-6 w-6 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-6 w-6 mr-1" />
                    )}
                    {calcularGananciaPerdida()! >= 0 ? '+' : ''}
                    {calcularGananciaPerdida()!.toFixed(2)} €
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Tu inversión total: {datos.inversion_total.toFixed(2)} €</p>
                  <p>• Precio de venta: {parseFloat(formData.precio_venta_final).toFixed(2)} €</p>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={guardando}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium text-lg shadow-sm"
            >
              {guardando ? 'Registrando venta...' : 'Registrar Venta'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              🔒 Tus datos personales son privados. Solo se compartirán estadísticas anónimas de mercado.
            </p>
          </form>
        </div>
      )}
    </div>
  )
}
