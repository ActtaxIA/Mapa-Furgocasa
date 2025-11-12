'use client'

import { useState, useEffect } from 'react'
import { 
  TagIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface VentaData {
  en_venta: boolean
  precio_venta_deseado: number | null
  fecha_publicacion_venta: string | null
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
    accion: 'poner_en_venta' as 'poner_en_venta' | 'registrar_venta',
    precio_venta_deseado: '',
    fecha_publicacion_venta: new Date().toISOString().split('T')[0],
    precio_venta_final: '',
    fecha_venta: new Date().toISOString().split('T')[0],
    comprador_tipo: 'particular',
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
        
        // Pre-llenar el formulario si ya está en venta
        if (data.en_venta) {
          setFormData(prev => ({
            ...prev,
            precio_venta_deseado: data.precio_venta_deseado?.toString() || '',
            fecha_publicacion_venta: data.fecha_publicacion_venta || new Date().toISOString().split('T')[0]
          }))
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setCargando(false)
    }
  }

  const handlePonerEnVenta = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setGuardando(true)
      setMensaje(null)

      const response = await fetch(`/api/vehiculos/${vehiculoId}/venta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'poner_en_venta',
          precio_venta_deseado: parseFloat(formData.precio_venta_deseado),
          fecha_publicacion_venta: formData.fecha_publicacion_venta
        })
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: '¡Vehículo puesto en venta correctamente!'
        })
        await cargarDatos()
      } else {
        const error = await response.json()
        setMensaje({ tipo: 'error', texto: error.error || 'Error al poner en venta' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al procesar la solicitud' })
    } finally {
      setGuardando(false)
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
          notas_venta: formData.notas_venta || null
        })
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: '¡Venta registrada correctamente! Tus datos ayudarán a otros usuarios.'
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

  const handleQuitarDeVenta = async () => {
    if (!confirm('¿Estás seguro de que deseas quitar el vehículo de venta?')) {
      return
    }

    try {
      setGuardando(true)
      setMensaje(null)

      const response = await fetch(`/api/vehiculos/${vehiculoId}/venta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'quitar_de_venta'
        })
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: 'Vehículo quitado de venta'
        })
        await cargarDatos()
      } else {
        const error = await response.json()
        setMensaje({ tipo: 'error', texto: error.error || 'Error al quitar de venta' })
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
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Venta</h2>
        <p className="mt-1 text-sm text-gray-500">
          Pon tu vehículo en venta o registra una venta realizada
        </p>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`rounded-md p-4 ${mensaje.tipo === 'exito' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-sm ${mensaje.tipo === 'exito' ? 'text-green-800' : 'text-red-800'}`}>
            {mensaje.texto}
          </p>
        </div>
      )}

      {/* Estado actual */}
      {datos?.vendido ? (
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Vehículo Vendido
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <span className="font-medium">Precio de venta:</span> {datos.precio_venta_final?.toFixed(2)} €
                </div>
                <div>
                  <span className="font-medium">Fecha de venta:</span> {datos.fecha_venta ? new Date(datos.fecha_venta).toLocaleDateString('es-ES') : '-'}
                </div>
                <div>
                  <span className="font-medium">Tipo de comprador:</span> {datos.comprador_tipo || '-'}
                </div>
                {datos.inversion_total && datos.precio_venta_final && (
                  <div className="col-span-2">
                    <span className="font-medium">Resultado:</span>
                    <span className={`ml-2 font-bold ${(datos.precio_venta_final - datos.inversion_total) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(datos.precio_venta_final - datos.inversion_total) >= 0 ? '+' : ''}
                      {(datos.precio_venta_final - datos.inversion_total).toFixed(2)} €
                    </span>
                  </div>
                )}
              </div>
              {datos.notas_venta && (
                <div className="mt-4 p-3 bg-white rounded border border-green-200">
                  <p className="text-sm text-gray-700">{datos.notas_venta}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : datos?.en_venta ? (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <TagIcon className="h-6 w-6 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  En Venta
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Precio deseado:</span> {datos.precio_venta_deseado?.toFixed(2)} €
                  </div>
                  <div>
                    <span className="font-medium">Publicado desde:</span> {datos.fecha_publicacion_venta ? new Date(datos.fecha_publicacion_venta).toLocaleDateString('es-ES') : '-'}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleQuitarDeVenta}
              disabled={guardando}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
            >
              Quitar de venta
            </button>
          </div>
        </div>
      ) : null}

      {/* Formularios */}
      {!datos?.vendido && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Poner en venta */}
          {!datos?.en_venta && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2 text-primary-600" />
                Poner en Venta
              </h3>
              
              <form onSubmit={handlePonerEnVenta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio deseado (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio_venta_deseado}
                    onChange={(e) => setFormData({ ...formData, precio_venta_deseado: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Ej: 35000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de publicación *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_publicacion_venta}
                    onChange={(e) => setFormData({ ...formData, fecha_publicacion_venta: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                {datos?.inversion_total && (
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Tu inversión total: <span className="font-semibold">{datos.inversion_total.toFixed(2)} €</span>
                    </p>
                    {formData.precio_venta_deseado && (
                      <p className="text-sm mt-1">
                        Ganancia estimada: 
                        <span className={`ml-1 font-semibold ${(parseFloat(formData.precio_venta_deseado) - datos.inversion_total) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(parseFloat(formData.precio_venta_deseado) - datos.inversion_total) >= 0 ? '+' : ''}
                          {(parseFloat(formData.precio_venta_deseado) - datos.inversion_total).toFixed(2)} €
                        </span>
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
                >
                  {guardando ? 'Procesando...' : 'Poner en Venta'}
                </button>
              </form>
            </div>
          )}

          {/* Registrar venta */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
              Registrar Venta Realizada
            </h3>
            
            <form onSubmit={handleRegistrarVenta} className="space-y-4">
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
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  rows={3}
                  value={formData.notas_venta}
                  onChange={(e) => setFormData({ ...formData, notas_venta: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Detalles de la venta, negociación, etc."
                />
              </div>

              {datos?.inversion_total && formData.precio_venta_final && (
                <div className={`p-3 rounded border ${calcularGananciaPerdida()! >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Resultado:</span>
                    <span className={`text-lg font-bold flex items-center ${calcularGananciaPerdida()! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calcularGananciaPerdida()! >= 0 ? (
                        <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                      )}
                      {calcularGananciaPerdida()! >= 0 ? '+' : ''}
                      {calcularGananciaPerdida()!.toFixed(2)} €
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Inversión total: {datos.inversion_total.toFixed(2)} €
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {guardando ? 'Procesando...' : 'Registrar Venta'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Tus datos ayudarán a otros usuarios con valoraciones de mercado
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

