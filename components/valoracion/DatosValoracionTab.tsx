'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Props {
  vehiculoId: string
}

export function DatosValoracionTab({ vehiculoId }: Props) {
  const [loading, setLoading] = useState(true)
  const [datos, setDatos] = useState<any>(null)

  useEffect(() => {
    loadDatos()
  }, [vehiculoId])

  const loadDatos = async () => {
    try {
      const supabase = createClient()

      // Cargar vehículo
      const { data: vehiculo } = await (supabase as any)
        .from('vehiculos_registrados')
        .select('*')
        .eq('id', vehiculoId)
        .single()

      // Cargar valoración económica
      const { data: valoracion } = await (supabase as any)
        .from('vehiculo_valoracion_economica')
        .select('*')
        .eq('vehiculo_id', vehiculoId)
        .maybeSingle()

      // Cargar ficha técnica
      const { data: ficha } = await (supabase as any)
        .from('vehiculo_ficha_tecnica')
        .select('*')
        .eq('vehiculo_id', vehiculoId)
        .maybeSingle()

      // Cargar último kilometraje
      const { data: ultimoKm } = await (supabase as any)
        .from('vehiculo_kilometraje')
        .select('kilometros, fecha')
        .eq('vehiculo_id', vehiculoId)
        .order('fecha', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Calcular datos derivados (igual que en la API)
      const fechaCompra = valoracion?.fecha_compra || vehiculo?.created_at?.split('T')[0]
      const añosAntiguedad = fechaCompra
        ? ((Date.now() - new Date(fechaCompra).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1)
        : null

      const kmActuales = ultimoKm?.kilometros || null
      const kmCompra = valoracion?.kilometros_compra || 0
      const kmRecorridos = kmActuales && kmCompra ? kmActuales - kmCompra : null
      const kmPorAño = kmRecorridos && añosAntiguedad ? (kmRecorridos / parseFloat(añosAntiguedad)).toFixed(0) : null

      const precioReferencia = valoracion?.pvp_base_particular || valoracion?.precio_compra
      const incluyeImpuesto = valoracion?.precio_incluye_impuesto_matriculacion ?? true
      const origenCompra = valoracion?.origen_compra || 'particular'

      setDatos({
        vehiculo,
        valoracion,
        ficha,
        // Datos calculados
        fechaCompra,
        añosAntiguedad,
        kmActuales,
        kmCompra,
        kmRecorridos,
        kmPorAño,
        precioReferencia,
        incluyeImpuesto,
        origenCompra,
      })
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!datos) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudieron cargar los datos</p>
      </div>
    )
  }

  const InfoRow = ({ label, value, source, highlight = false }: any) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
      <div className="flex-1">
        <p className="text-xs text-gray-600 mb-1">{label}</p>
        <p className={`font-semibold ${highlight ? 'text-blue-900' : 'text-gray-900'}`}>
          {value || <span className="text-gray-400">No disponible</span>}
        </p>
        {source && (
          <p className="text-xs text-gray-500 mt-1">
            📍 Fuente: {source}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              📊 Datos Enviados a la IA de Valoración
            </h2>
            <p className="text-sm text-gray-700">
              Estos son los datos exactos que se envían al agente de Inteligencia Artificial
              para generar el informe de valoración. Asegúrate de que estén completos y correctos.
            </p>
          </div>
        </div>
      </div>

      {/* Datos del Vehículo */}
      <div>
        <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-primary-600" />
          Datos del Vehículo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoRow
            label="Matrícula"
            value={datos.vehiculo?.matricula}
            source="vehiculos_registrados"
          />
          <InfoRow
            label="Marca / Modelo"
            value={`${datos.vehiculo?.marca || 'N/A'} ${datos.vehiculo?.modelo || ''}`}
            source="vehiculos_registrados"
          />
          <InfoRow
            label="Año"
            value={datos.vehiculo?.año}
            source="vehiculos_registrados"
          />
          <InfoRow
            label="Chasis"
            value={datos.vehiculo?.chasis}
            source="vehiculos_registrados"
          />
        </div>
      </div>

      {/* Datos Económicos y Precio */}
      <div>
        <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
          💰 Datos Económicos (Precio)
        </h3>
        <div className="space-y-3">
          <InfoRow
            label="Precio de Compra Original"
            value={datos.valoracion?.precio_compra ?
              new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
                .format(datos.valoracion.precio_compra) : null}
            source="vehiculo_valoracion_economica.precio_compra"
          />

          <InfoRow
            label="🎯 PVP Equivalente Particular (NORMALIZADO)"
            value={datos.precioReferencia ?
              new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
                .format(datos.precioReferencia) : null}
            source="vehiculo_valoracion_economica.pvp_base_particular"
            highlight={true}
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-900 mb-2">
              ⚠️ Este es el precio que usa la IA para la valoración
            </p>
            <p className="text-xs text-yellow-800">
              El PVP normalizado es el precio equivalente que habría pagado un particular (con impuesto de matriculación incluido).
              Si es empresa de alquiler, se suma automáticamente el ~14,75%.
            </p>
          </div>

          <InfoRow
            label="Origen/Tipo de Compra"
            value={datos.origenCompra}
            source="vehiculo_valoracion_economica.origen_compra"
          />

          <InfoRow
            label="¿Precio incluye impuesto de matriculación?"
            value={datos.incluyeImpuesto ? '✅ Sí, incluido' : '❌ No incluido'}
            source="vehiculo_valoracion_economica.precio_incluye_impuesto_matriculacion"
          />

          {datos.valoracion?.impuesto_matriculacion_estimado && (
            <InfoRow
              label="Impuesto de Matriculación Estimado"
              value={new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
                .format(datos.valoracion.impuesto_matriculacion_estimado)}
              source="vehiculo_valoracion_economica.impuesto_matriculacion_estimado (calculado automáticamente)"
            />
          )}
        </div>
      </div>

      {/* Datos de Tiempo y Uso */}
      <div>
        <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
          📅 Datos de Tiempo y Uso
        </h3>
        <div className="space-y-3">
          <InfoRow
            label="Fecha de Compra/Matriculación"
            value={datos.fechaCompra}
            source={datos.valoracion?.fecha_compra ? 'vehiculo_valoracion_economica.fecha_compra' : 'vehiculos_registrados.created_at'}
          />
          <InfoRow
            label="Antigüedad"
            value={datos.añosAntiguedad ? `${datos.añosAntiguedad} años` : null}
            source="Calculado desde fecha_compra"
          />
        </div>
      </div>

      {/* Datos de Kilometraje */}
      <div>
        <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
          🚗 Datos de Kilometraje
        </h3>
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-2">🔍 Fuente correcta del kilometraje:</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                {datos.kmActuales ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="font-semibold">vehiculo_kilometraje (último registro): {datos.kmActuales?.toLocaleString() || 'N/A'} km</span>
              </div>
              <div className="text-xs text-gray-500 ml-6">
                ✅ Esta es la tabla correcta para obtener el kilometraje actual
              </div>
            </div>
          </div>

          <InfoRow
            label="🎯 Kilometraje Actual (usado por la IA)"
            value={datos.kmActuales ? `${datos.kmActuales.toLocaleString()} km` : null}
            source="vehiculo_kilometraje (último registro por fecha)"
            highlight={true}
          />

          <InfoRow
            label="Kilometraje en Compra"
            value={datos.kmCompra ? `${datos.kmCompra.toLocaleString()} km` : null}
            source="vehiculo_valoracion_economica.kilometros_compra"
          />

          <InfoRow
            label="Kilómetros Recorridos"
            value={datos.kmRecorridos ? `${datos.kmRecorridos.toLocaleString()} km` : null}
            source="Calculado: km_actual - km_compra"
          />

          <InfoRow
            label="Promedio Anual"
            value={datos.kmPorAño ? `${datos.kmPorAño.toLocaleString()} km/año` : null}
            source="Calculado: km_recorridos / años_antigüedad"
          />
        </div>
      </div>

      {/* Resumen Final */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-md font-bold text-gray-900 mb-3">
          ✅ Datos Listos para la IA
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {datos.precioReferencia ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-600" />
            )}
            <span>Precio de referencia: <strong>{datos.precioReferencia ? `${datos.precioReferencia.toLocaleString()}€` : 'FALTA'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {datos.añosAntiguedad ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-600" />
            )}
            <span>Antigüedad: <strong>{datos.añosAntiguedad ? `${datos.añosAntiguedad} años` : 'FALTA'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {datos.kmActuales ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-600" />
            )}
            <span>Kilometraje actual: <strong>{datos.kmActuales ? `${datos.kmActuales.toLocaleString()} km` : 'FALTA'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {datos.kmPorAño ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-orange-600" />
            )}
            <span>Promedio anual: <strong>{datos.kmPorAño ? `${datos.kmPorAño.toLocaleString()} km/año` : 'No calculable'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}
