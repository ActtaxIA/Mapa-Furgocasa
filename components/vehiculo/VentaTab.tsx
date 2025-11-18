'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline'

interface VentaData {
  vendido: boolean
  precio_venta_final: number | null
  fecha_venta: string | null
  comprador_tipo: string | null
  notas_venta: string | null
  // Para cálculos
  precio_compra: number | null
  fecha_compra: string | null
  inversion_total: number | null
}

interface Props {
  vehiculoId: string
  onVentaRegistrada?: () => void
}

export default function VentaTab({ vehiculoId, onVentaRegistrada }: Props) {
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

      // Convertir precio a número entero (sin decimales) para evitar problemas de precisión
      const precioEntero = parseInt(formData.precio_venta_final)

      const response = await fetch(`/api/vehiculos/${vehiculoId}/venta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          precio_venta_final: precioEntero,
          fecha_venta: formData.fecha_venta,
          comprador_tipo: formData.comprador_tipo || null,
          kilometros_venta: formData.kilometros_venta ? parseInt(formData.kilometros_venta) : null,
          estado_venta: formData.estado_venta || null,
          notas_venta: formData.notas_venta || null
        })
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: '¡Venta registrada correctamente! Gracias por contribuir con datos al mercado.'
        })
        await cargarDatos()
        
        // 🔄 Notificar al padre que se registró la venta (para recargar datos)
        if (onVentaRegistrada) {
          onVentaRegistrada()
        }
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
    // Usar parseInt para evitar problemas de precisión de punto flotante
    const precioVenta = parseInt(formData.precio_venta_final)
    return precioVenta - datos.inversion_total
  }

  const calcularGananciaPerdidaFinal = () => {
    if (!datos?.inversion_total || !datos?.precio_venta_final) return null
    // Usar precio redondeado para consistencia
    const precioRedondeado = Math.round(datos.precio_venta_final)
    return precioRedondeado - datos.inversion_total
  }

  const calcularTiempoPropiedad = () => {
    if (!datos?.fecha_compra || !formData.fecha_venta) return null
    const fechaCompra = new Date(datos.fecha_compra)
    const fechaVenta = new Date(formData.fecha_venta)
    const diffTime = Math.abs(fechaVenta.getTime() - fechaCompra.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const años = diffDays / 365.25
    const meses = (años % 1) * 12
    return {
      años: Math.floor(años),
      meses: Math.floor(meses),
      totalAños: años,
      dias: diffDays
    }
  }

  const calcularTiempoPropiedadFinal = () => {
    if (!datos?.fecha_compra || !datos?.fecha_venta) return null
    const fechaCompra = new Date(datos.fecha_compra)
    const fechaVenta = new Date(datos.fecha_venta)
    const diffTime = Math.abs(fechaVenta.getTime() - fechaCompra.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const años = diffDays / 365.25
    const meses = (años % 1) * 12
    return {
      años: Math.floor(años),
      meses: Math.floor(meses),
      totalAños: años,
      dias: diffDays
    }
  }

  const calcularCosteAnual = () => {
    const ganancia = calcularGananciaPerdida()
    const tiempo = calcularTiempoPropiedad()
    if (!ganancia || !tiempo || tiempo.totalAños === 0) return null
    // Si es pérdida (negativo), el coste anual es positivo
    return Math.abs(ganancia / tiempo.totalAños)
  }

  const calcularCosteAnualFinal = () => {
    const ganancia = calcularGananciaPerdidaFinal()
    const tiempo = calcularTiempoPropiedadFinal()
    if (!ganancia || !tiempo || tiempo.totalAños === 0) return null
    return Math.abs(ganancia / tiempo.totalAños)
  }

  // Función helper para formatear números sin decimales (formato español: 55.000)
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0'
    return Math.round(value).toLocaleString('es-ES')
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
                    {datos.precio_venta_final ? Math.round(datos.precio_venta_final).toLocaleString('es-ES') : '0'} €
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
                  <>
                    <div className={`rounded p-3 ${calcularGananciaPerdidaFinal()! >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      <span className="font-medium text-gray-700">Resultado final:</span>
                      <p className={`text-xl font-bold mt-1 flex items-center ${calcularGananciaPerdidaFinal()! >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {calcularGananciaPerdidaFinal()! >= 0 ? (
                          <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                        )}
                        {calcularGananciaPerdidaFinal()! >= 0 ? '+' : ''}
                        {formatNumber(calcularGananciaPerdidaFinal())} €
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Inversión total: {formatNumber(datos.inversion_total)} €
                      </p>
                    </div>
                    {calcularTiempoPropiedadFinal() && (
                      <div className="bg-blue-50 rounded p-3">
                        <span className="font-medium text-gray-700">Tiempo de propiedad:</span>
                        <p className="text-lg font-semibold text-blue-900 mt-1">
                          {calcularTiempoPropiedadFinal()!.años} años
                          {calcularTiempoPropiedadFinal()!.meses > 0 && ` y ${calcularTiempoPropiedadFinal()!.meses} meses`}
                        </p>
                        {calcularCosteAnualFinal() && (
                          <p className="text-sm text-blue-700 mt-2 font-medium">
                            📊 Coste anual: {formatNumber(calcularCosteAnualFinal())} €/año
                          </p>
                        )}
                      </div>
                    )}
                  </>
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
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              💰 Registrar Venta Realizada
            </h3>
          </div>

          <form onSubmit={handleRegistrarVenta} className="p-6 space-y-6">
            {/* Precio de Venta */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
                Precio de Venta
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Precio de venta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de venta final (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={formData.precio_venta_final}
                    onChange={(e) => setFormData({ ...formData, precio_venta_final: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: 33500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Precio real al que vendiste el vehículo (sin decimales)</p>
                </div>

                {/* Fecha de venta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de venta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_venta}
                    onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Comprador y Estado */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Comprador y Estado del Vehículo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de comprador */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de comprador <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.comprador_tipo}
                    onChange={(e) => setFormData({ ...formData, comprador_tipo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="particular">Particular</option>
                    <option value="concesionario">Concesionario</option>
                    <option value="empresa">Empresa</option>
                    <option value="plataforma_online">Plataforma online</option>
                  </select>
                </div>

                {/* Kilometraje en la venta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilometraje al vender
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.kilometros_venta}
                    onChange={(e) => setFormData({ ...formData, kilometros_venta: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: 85000"
                  />
                </div>

                {/* Estado del vehículo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado del vehículo al vender <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.estado_venta}
                    onChange={(e) => setFormData({ ...formData, estado_venta: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="excelente">Excelente - Como nuevo</option>
                    <option value="muy_bueno">Muy bueno - Bien mantenido</option>
                    <option value="bueno">Bueno - Estado normal</option>
                    <option value="regular">Regular - Con desgaste visible</option>
                    <option value="para_reparar">Para reparar - Necesita trabajo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Notas Adicionales</h3>

              <textarea
                rows={4}
                value={formData.notas_venta}
                onChange={(e) => setFormData({ ...formData, notas_venta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="¿Cómo fue la negociación? ¿Dónde anunciaste? ¿Cuánto tiempo tardó en venderse? Cualquier detalle útil para otros usuarios..."
              />
            </div>

            {/* Cálculo de ganancia/pérdida */}
            {datos?.inversion_total && formData.precio_venta_final && (
              <div className={`rounded-xl p-6 border-2 ${calcularGananciaPerdida()! >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  {calcularGananciaPerdida()! >= 0 ? (
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
                  )}
                  <span className={calcularGananciaPerdida()! >= 0 ? 'text-green-900' : 'text-red-900'}>
                    Resultado de la Venta
                  </span>
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Tu resultado:</span>
                  <span className={`text-3xl font-bold flex items-center ${calcularGananciaPerdida()! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calcularGananciaPerdida()! >= 0 ? '+' : ''}
                    {formatNumber(calcularGananciaPerdida())} €
                  </span>
                </div>
                <div className="text-sm text-gray-700 space-y-2 bg-white rounded-lg p-4 mb-4">
                  <div className="flex justify-between">
                    <span>Tu inversión total:</span>
                    <span className="font-semibold">{formatNumber(datos.inversion_total)} €</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Precio de venta:</span>
                    <span className="font-semibold">{parseInt(formData.precio_venta_final).toLocaleString('es-ES')} €</span>
                  </div>
                </div>
                {calcularTiempoPropiedad() && (
                  <div className="bg-white rounded-lg p-4 border-t-2 border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">⏱️ Tiempo de propiedad:</span>
                      <span className="text-lg font-bold text-blue-900">
                        {calcularTiempoPropiedad()!.años} años
                        {calcularTiempoPropiedad()!.meses > 0 && ` y ${calcularTiempoPropiedad()!.meses} meses`}
                      </span>
                    </div>
                    {calcularCosteAnual() && (
                      <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                        <span className="text-sm font-medium text-gray-700">📊 Coste anual promedio:</span>
                        <span className="text-xl font-bold text-blue-700">
                          {formatNumber(calcularCosteAnual())} €/año
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {calcularGananciaPerdida()! < 0
                        ? `Tu vehículo te ha costado ${formatNumber(calcularCosteAnual())} € al año de media`
                        : `Has ganado ${formatNumber(calcularCosteAnual())} € al año de media`
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={guardando}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-bold text-lg shadow-lg transition-all"
              >
                {guardando ? '⏳ Registrando venta...' : '💾 Registrar Venta Definitivamente'}
              </button>

              <p className="text-xs text-gray-500 text-center bg-blue-50 border border-blue-200 rounded-lg p-3">
                🔒 <strong>Privacidad garantizada:</strong> Tus datos personales son privados. Solo se compartirán estadísticas anónimas de mercado para ayudar a otros usuarios.
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
