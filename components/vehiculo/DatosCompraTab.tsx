'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Props {
  vehiculoId: string
  onDataSaved?: () => void
}

interface CompraData {
  // Precio y condiciones básicas
  precio_compra: string
  fecha_compra: string
  procedencia: string
  tipo_vendedor: string
  nombre_vendedor: string
  lugar_compra: string
  pais_compra: string
  ciudad_compra: string

  // Impuesto de matriculación (nuevo)
  origen_compra: string
  precio_incluye_impuesto_matriculacion: boolean
  importe_impuesto_matriculacion: string
  motivo_exencion_impuesto: string

  // Estado del vehículo en compra
  kilometros_compra: string
  estado_general: string
  num_propietarios_anteriores: string
  libro_mantenimiento: boolean
  itv_al_dia: boolean

  // Documentación y garantía
  tiene_garantia: boolean
  meses_garantia: string
  tipo_garantia: string
  transferencia_incluida: boolean

  // Financiación
  financiado: boolean
  importe_financiado: string
  cuota_mensual: string
  plazo_meses: string
  pendiente_pago: string
  entidad_financiera: string
  tipo_interes: string

  // Negociación
  precio_inicial: string
  descuento_aplicado: string
  vehiculo_entregado: boolean
  precio_vehiculo_entregado: string

  // Extras incluidos en la compra
  extras_incluidos: string

  notas: string
}

export function DatosCompraTab({ vehiculoId, onDataSaved }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [existingData, setExistingData] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState<CompraData>({
    precio_compra: '',
    fecha_compra: '',
    procedencia: '',
    tipo_vendedor: '',
    nombre_vendedor: '',
    lugar_compra: '',
    pais_compra: 'España',
    ciudad_compra: '',
    origen_compra: 'particular',
    precio_incluye_impuesto_matriculacion: true,
    importe_impuesto_matriculacion: '',
    motivo_exencion_impuesto: '',
    kilometros_compra: '',
    estado_general: '',
    num_propietarios_anteriores: '',
    libro_mantenimiento: false,
    itv_al_dia: false,
    tiene_garantia: false,
    meses_garantia: '',
    tipo_garantia: '',
    transferencia_incluida: false,
    financiado: false,
    importe_financiado: '',
    cuota_mensual: '',
    plazo_meses: '',
    pendiente_pago: '',
    entidad_financiera: '',
    tipo_interes: '',
    precio_inicial: '',
    descuento_aplicado: '',
    vehiculo_entregado: false,
    precio_vehiculo_entregado: '',
    extras_incluidos: '',
    notas: ''
  })

  useEffect(() => {
    loadData()
  }, [vehiculoId])

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
          .from('vehiculo_valoracion_economica')
        .select('*')
        .eq('vehiculo_id', vehiculoId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error cargando datos:', error)
        return
      }

      if (data) {
        setExistingData(data)
        setFormData({
          precio_compra: data.precio_compra?.toString() || '',
          fecha_compra: data.fecha_compra || '',
          procedencia: data.procedencia || '',
          tipo_vendedor: data.tipo_vendedor || '',
          nombre_vendedor: data.nombre_vendedor || '',
          lugar_compra: data.lugar_compra || '',
          pais_compra: data.pais_compra || 'España',
          ciudad_compra: data.ciudad_compra || '',
          origen_compra: data.origen_compra || 'particular',
          precio_incluye_impuesto_matriculacion: data.precio_incluye_impuesto_matriculacion ?? true,
          importe_impuesto_matriculacion: data.importe_impuesto_matriculacion?.toString() || '',
          motivo_exencion_impuesto: data.motivo_exencion_impuesto || '',
          kilometros_compra: data.kilometros_compra?.toString() || '',
          estado_general: data.estado_general || '',
          num_propietarios_anteriores: data.num_propietarios_anteriores?.toString() || '',
          libro_mantenimiento: data.libro_mantenimiento || false,
          itv_al_dia: data.itv_al_dia || false,
          tiene_garantia: data.tiene_garantia || false,
          meses_garantia: data.meses_garantia?.toString() || '',
          tipo_garantia: data.tipo_garantia || '',
          transferencia_incluida: data.transferencia_incluida || false,
          financiado: data.financiado || false,
          importe_financiado: data.importe_financiado?.toString() || '',
          cuota_mensual: data.cuota_mensual?.toString() || '',
          plazo_meses: data.plazo_meses?.toString() || '',
          pendiente_pago: data.pendiente_pago?.toString() || '',
          entidad_financiera: data.entidad_financiera || '',
          tipo_interes: data.tipo_interes?.toString() || '',
          precio_inicial: data.precio_inicial?.toString() || '',
          descuento_aplicado: data.descuento_aplicado?.toString() || '',
          vehiculo_entregado: data.vehiculo_entregado || false,
          precio_vehiculo_entregado: data.precio_vehiculo_entregado?.toString() || '',
          extras_incluidos: data.extras_incluidos || '',
          notas: data.notas || ''
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setMessage({ type: 'error', text: 'No autenticado' })
        return
      }

      const dataToSave = {
        vehiculo_id: vehiculoId,
        user_id: user.id,
        precio_compra: formData.precio_compra ? parseFloat(formData.precio_compra) : null,
        fecha_compra: formData.fecha_compra || null,
        procedencia: formData.procedencia || null,
        tipo_vendedor: formData.tipo_vendedor || null,
        nombre_vendedor: formData.nombre_vendedor || null,
        lugar_compra: formData.lugar_compra || null,
        pais_compra: formData.pais_compra || null,
        ciudad_compra: formData.ciudad_compra || null,
        // Impuesto de matriculación (nuevo)
        origen_compra: formData.origen_compra || null,
        precio_incluye_impuesto_matriculacion: formData.precio_incluye_impuesto_matriculacion,
        importe_impuesto_matriculacion: formData.importe_impuesto_matriculacion ? parseFloat(formData.importe_impuesto_matriculacion) : null,
        motivo_exencion_impuesto: formData.motivo_exencion_impuesto || null,
        kilometros_compra: formData.kilometros_compra ? parseInt(formData.kilometros_compra) : null,
        estado_general: formData.estado_general || null,
        num_propietarios_anteriores: formData.num_propietarios_anteriores ? parseInt(formData.num_propietarios_anteriores) : null,
        libro_mantenimiento: formData.libro_mantenimiento,
        itv_al_dia: formData.itv_al_dia,
        tiene_garantia: formData.tiene_garantia,
        meses_garantia: formData.meses_garantia ? parseInt(formData.meses_garantia) : null,
        tipo_garantia: formData.tipo_garantia || null,
        transferencia_incluida: formData.transferencia_incluida,
        financiado: formData.financiado,
        importe_financiado: formData.importe_financiado ? parseFloat(formData.importe_financiado) : null,
        cuota_mensual: formData.cuota_mensual ? parseFloat(formData.cuota_mensual) : null,
        plazo_meses: formData.plazo_meses ? parseInt(formData.plazo_meses) : null,
        pendiente_pago: formData.pendiente_pago ? parseFloat(formData.pendiente_pago) : null,
        entidad_financiera: formData.entidad_financiera || null,
        tipo_interes: formData.tipo_interes ? parseFloat(formData.tipo_interes) : null,
        precio_inicial: formData.precio_inicial ? parseFloat(formData.precio_inicial) : null,
        descuento_aplicado: formData.descuento_aplicado ? parseFloat(formData.descuento_aplicado) : null,
        vehiculo_entregado: formData.vehiculo_entregado,
        precio_vehiculo_entregado: formData.precio_vehiculo_entregado ? parseFloat(formData.precio_vehiculo_entregado) : null,
        extras_incluidos: formData.extras_incluidos || null,
        notas: formData.notas || null
      }

      let result
      if (existingData) {
        // Update
        result = await (supabase as any)
          .from('vehiculo_valoracion_economica')
          .update(dataToSave)
          .eq('id', existingData.id)
      } else {
        // Insert
        result = await (supabase as any)
          .from('vehiculo_valoracion_economica')
          .insert(dataToSave)
      }

      if (result.error) {
        console.error('Error guardando:', result.error)
        setMessage({ type: 'error', text: 'Error al guardar los datos' })
        return
      }

      setMessage({ type: 'success', text: 'Datos guardados correctamente' })
      await loadData()
      if (onDataSaved) onDataSaved()
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error al guardar los datos' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Datos de Compra</h2>
        {existingData && (
          <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
            ✓ Datos registrados
          </span>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Datos Básicos de Compra */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <CurrencyEuroIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            Información Básica de Compra
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Precio de Compra (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.precio_compra}
                onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="35000"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Fecha de Compra
              </label>
              <input
                type="date"
                value={formData.fecha_compra}
                onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
                className="w-full px-2 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Impuesto de Matriculación - Nuevo */}
            <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 mb-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  i
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Impuesto de Matriculación
                  </h4>
                  <p className="text-xs text-blue-800">
                    Indica si el precio de compra incluye o no el impuesto de matriculación. 
                    Esto es importante para valoraciones precisas, ya que empresas de alquiler y 
                    ciertos compradores están exentos de este impuesto (~14,75% para autocaravanas).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Origen/Tipo de compra */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Origen/Tipo de Compra
                  </label>
                  <select
                    value={formData.origen_compra}
                    onChange={(e) => {
                      const origen = e.target.value
                      setFormData({ 
                        ...formData, 
                        origen_compra: origen,
                        // Auto-desmarcar si es empresa_alquiler
                        precio_incluye_impuesto_matriculacion: origen === 'empresa_alquiler' ? false : formData.precio_incluye_impuesto_matriculacion
                      })
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="particular">Particular</option>
                    <option value="empresa_alquiler">Empresa de Alquiler (exenta)</option>
                    <option value="empresa_otros">Otra Empresa</option>
                    <option value="discapacidad">Persona con Discapacidad (exenta)</option>
                    <option value="familia_numerosa">Familia Numerosa (bonif. 50%)</option>
                    <option value="exento_otro">Otra Exención</option>
                  </select>
                </div>

                {/* Toggle: ¿Precio incluye impuesto? */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    ¿El precio incluye el impuesto de matriculación?
                  </label>
                  <div className="flex items-center gap-4 h-[42px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.precio_incluye_impuesto_matriculacion === true}
                        onChange={() => setFormData({ ...formData, precio_incluye_impuesto_matriculacion: true })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm text-gray-900">Sí, incluido</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.precio_incluye_impuesto_matriculacion === false}
                        onChange={() => setFormData({ ...formData, precio_incluye_impuesto_matriculacion: false })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm text-gray-900">No incluido</span>
                    </label>
                  </div>
                </div>

                {/* Importe real del impuesto (opcional) */}
                {!formData.precio_incluye_impuesto_matriculacion && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Importe Real del Impuesto (€) <span className="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.importe_impuesto_matriculacion}
                      onChange={(e) => setFormData({ ...formData, importe_impuesto_matriculacion: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Si conoces el importe exacto"
                    />
                  </div>
                )}

                {/* Motivo de exención (si no incluye impuesto) */}
                {!formData.precio_incluye_impuesto_matriculacion && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Motivo Exención <span className="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.motivo_exencion_impuesto}
                      onChange={(e) => setFormData({ ...formData, motivo_exencion_impuesto: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ej: Alquiler sin conductor, discapacidad 33%..."
                    />
                  </div>
                )}
              </div>

              {/* Info visual estimación */}
              {!formData.precio_incluye_impuesto_matriculacion && formData.precio_compra && (
                <div className="mt-3 p-2 bg-white border border-blue-300 rounded text-xs text-gray-700">
                  <strong>💡 Estimación automática:</strong> Si el precio no incluye el impuesto, 
                  se calculará automáticamente (~14,75% para autocaravanas ≈ {
                    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
                      .format(parseFloat(formData.precio_compra || '0') * 0.1475)
                  }).
                  El PVP normalizado será aproximadamente {
                    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
                      .format(parseFloat(formData.precio_compra || '0') * 1.1475)
                  }.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Procedencia
              </label>
              <select
                value={formData.procedencia}
                onChange={(e) => setFormData({ ...formData, procedencia: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecciona...</option>
                <option value="Nueva">Nueva</option>
                <option value="Segunda mano">Segunda mano</option>
                <option value="Importación">Importación</option>
                <option value="Camperización propia">Camperización propia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Tipo de Vendedor
              </label>
              <select
                value={formData.tipo_vendedor}
                onChange={(e) => setFormData({ ...formData, tipo_vendedor: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecciona...</option>
                <option value="Concesionario oficial">Concesionario oficial</option>
                <option value="Concesionario multimarca">Concesionario multimarca</option>
                <option value="Particular">Particular</option>
                <option value="Empresa de alquiler">Empresa de alquiler</option>
                <option value="Subasta">Subasta</option>
                <option value="Fabricante">Fabricante</option>
                <option value="Importador">Importador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Nombre del Vendedor / Concesionario
              </label>
              <input
                type="text"
                value={formData.nombre_vendedor}
                onChange={(e) => setFormData({ ...formData, nombre_vendedor: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Autocaravanas López S.L."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Lugar de Compra
              </label>
              <input
                type="text"
                value={formData.lugar_compra}
                onChange={(e) => setFormData({ ...formData, lugar_compra: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nombre y dirección"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                País de Compra
              </label>
              <input
                type="text"
                value={formData.pais_compra}
                onChange={(e) => setFormData({ ...formData, pais_compra: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="España"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.ciudad_compra}
                onChange={(e) => setFormData({ ...formData, ciudad_compra: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Madrid, Barcelona, etc."
              />
            </div>
          </div>
        </div>

        {/* Estado del Vehículo */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Estado del Vehículo en la Compra</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Kilómetros en la Compra
              </label>
              <input
                type="number"
                value={formData.kilometros_compra}
                onChange={(e) => setFormData({ ...formData, kilometros_compra: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Estado General
              </label>
              <select
                value={formData.estado_general}
                onChange={(e) => setFormData({ ...formData, estado_general: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecciona...</option>
                <option value="Excelente">Excelente</option>
                <option value="Muy bueno">Muy bueno</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Malo">Malo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Número de Propietarios Anteriores
              </label>
              <input
                type="number"
                min="0"
                value={formData.num_propietarios_anteriores}
                onChange={(e) => setFormData({ ...formData, num_propietarios_anteriores: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="1"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.libro_mantenimiento}
                  onChange={(e) => setFormData({ ...formData, libro_mantenimiento: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Libro de Mantenimiento
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.itv_al_dia}
                  onChange={(e) => setFormData({ ...formData, itv_al_dia: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  ITV al día
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Garantía y Documentación */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Garantía y Documentación</h3>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tiene_garantia}
                onChange={(e) => setFormData({ ...formData, tiene_garantia: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Incluye garantía
              </span>
            </label>
          </div>

          {formData.tiene_garantia && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Duración de la Garantía (meses)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.meses_garantia}
                  onChange={(e) => setFormData({ ...formData, meses_garantia: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="12"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Tipo de Garantía
                </label>
                <select
                  value={formData.tipo_garantia}
                  onChange={(e) => setFormData({ ...formData, tipo_garantia: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Selecciona...</option>
                  <option value="Oficial del fabricante">Oficial del fabricante</option>
                  <option value="Concesionario">Concesionario</option>
                  <option value="Aseguradora externa">Aseguradora externa</option>
                  <option value="Mecánica">Solo mecánica</option>
                  <option value="Completa">Completa</option>
                </select>
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.transferencia_incluida}
                onChange={(e) => setFormData({ ...formData, transferencia_incluida: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Transferencia incluida en el precio
              </span>
            </label>
          </div>
        </div>

        {/* Negociación */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Negociación y Descuentos</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Precio Inicial Pedido (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_inicial}
                onChange={(e) => setFormData({ ...formData, precio_inicial: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="38000"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Descuento Aplicado (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.descuento_aplicado}
                onChange={(e) => setFormData({ ...formData, descuento_aplicado: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="3000"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={formData.vehiculo_entregado}
                onChange={(e) => setFormData({ ...formData, vehiculo_entregado: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Se entregó un vehículo a cambio (parte del pago)
              </span>
            </label>

            {formData.vehiculo_entregado && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Valoración del Vehículo Entregado (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_vehiculo_entregado}
                  onChange={(e) => setFormData({ ...formData, precio_vehiculo_entregado: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="5000"
                />
              </div>
            )}
          </div>
        </div>

        {/* Financiación */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Financiación</h3>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.financiado}
                onChange={(e) => setFormData({ ...formData, financiado: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Este vehículo está financiado
              </span>
            </label>
          </div>

          {formData.financiado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Entidad Financiera
                </label>
                <input
                  type="text"
                  value={formData.entidad_financiera}
                  onChange={(e) => setFormData({ ...formData, entidad_financiera: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Banco Santander, BBVA, etc."
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Tipo de Interés (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tipo_interes}
                  onChange={(e) => setFormData({ ...formData, tipo_interes: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="5.5"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Importe Financiado (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.importe_financiado}
                  onChange={(e) => setFormData({ ...formData, importe_financiado: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="20000"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Cuota Mensual (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cuota_mensual}
                  onChange={(e) => setFormData({ ...formData, cuota_mensual: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="350"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Plazo (meses)
                </label>
                <input
                  type="number"
                  value={formData.plazo_meses}
                  onChange={(e) => setFormData({ ...formData, plazo_meses: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Pendiente de Pago (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pendiente_pago}
                  onChange={(e) => setFormData({ ...formData, pendiente_pago: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="15000"
                />
              </div>
            </div>
          )}
        </div>

        {/* Extras Incluidos */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Extras Incluidos en la Compra</h3>

          <textarea
            value={formData.extras_incluidos}
            onChange={(e) => setFormData({ ...formData, extras_incluidos: e.target.value })}
            rows={4}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ej: Toldo Fiamma, Portabicis Thule, Panel solar 200W, Nevera Dometic 12V, Calefacción Truma, Sistema de Alarma, etc..."
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Lista todos los accesorios y extras que venían incluidos en el precio de compra
          </p>
        </div>

        {/* Notas */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Notas Adicionales</h3>

          <textarea
            rows={4}
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Cualquier información adicional sobre la compra, el estado del vehículo, la negociación, etc..."
          />
        </div>

        {/* Botón de Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white text-sm sm:text-base rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar Datos de Compra'}
          </button>
        </div>
      </form>
    </div>
  )
}
