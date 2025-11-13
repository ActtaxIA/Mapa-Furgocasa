'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  WrenchIcon
} from '@heroicons/react/24/outline'

interface Averia {
  id: string
  vehiculo_id: string
  titulo: string
  categoria: string // Nombre en BD (antes tipo_averia en formulario)
  descripcion: string
  fecha_averia: string
  fecha_resolucion: string | null
  kilometraje: number | null
  coste_reparacion: number | null // Nombre en BD (antes coste_mano_obra)
  coste_total: number | null
  taller: string | null
  severidad: 'baja' | 'media' | 'alta' | 'critica' // Nombre en BD (antes gravedad en formulario)
  estado: 'pendiente' | 'en_reparacion' | 'resuelto' // Nombre en BD (antes 'reparada' en formulario)
  en_garantia: boolean // Nombre en BD (antes garantia en formulario)
  notas: string | null
  created_at: string
  updated_at: string
}

interface Props {
  vehiculoId: string
}

// Función para formatear números en formato español sin decimales
const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0'
  return Math.round(value).toLocaleString('es-ES')
}

export default function AveriasTab({ vehiculoId }: Props) {
  const [averias, setAverias] = useState<Averia[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    tipo_averia: 'mecanica',
    descripcion: '',
    fecha_averia: new Date().toISOString().split('T')[0],
    fecha_resolucion: '',
    kilometraje: '',
    coste_mano_obra: '',
    coste_piezas: '',
    taller: '',
    ubicacion_averia: '',
    gravedad: 'moderada' as 'leve' | 'moderada' | 'grave' | 'critica',
    estado: 'pendiente' as 'pendiente' | 'en_reparacion' | 'reparada',
    garantia: false,
    notas: ''
  })

  useEffect(() => {
    cargarAverias()
  }, [vehiculoId])

  const cargarAverias = async () => {
    try {
      setCargando(true)
      const response = await fetch(`/api/vehiculos/${vehiculoId}/averias`)

      if (response.ok) {
        const data = await response.json()
        setAverias(data)
      }
    } catch (error) {
      console.error('Error al cargar averías:', error)
    } finally {
      setCargando(false)
    }
  }

  const limpiarFormulario = () => {
    setFormData({
      tipo_averia: 'mecanica',
      descripcion: '',
      fecha_averia: new Date().toISOString().split('T')[0],
      fecha_resolucion: '',
      kilometraje: '',
      coste_mano_obra: '',
      coste_piezas: '',
      taller: '',
      ubicacion_averia: '',
      gravedad: 'moderada',
      estado: 'pendiente',
      garantia: false,
      notas: ''
    })
    setEditandoId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setGuardando(true)
      setMensaje(null)

      // Calcular coste total
      const costeManoObra = formData.coste_mano_obra ? parseFloat(formData.coste_mano_obra) : 0
      const costePiezas = formData.coste_piezas ? parseFloat(formData.coste_piezas) : 0
      const costeTotal = costeManoObra + costePiezas

      // Mapear gravedad del formulario a severidad de BD
      const severidadMap: { [key: string]: string } = {
        'leve': 'baja',
        'moderada': 'media',
        'grave': 'alta',
        'critica': 'critica'
      }

      // Mapear estado del formulario a estado de BD
      const estadoMap: { [key: string]: string } = {
        'pendiente': 'pendiente',
        'en_reparacion': 'en_reparacion',
        'reparada': 'resuelto'
      }

      // Mapear campos del formulario a los nombres de la BD
      const datos = {
        vehiculo_id: vehiculoId,
        titulo: `Avería: ${formData.tipo_averia}`,  // BD requiere 'titulo' (NOT NULL)
        categoria: formData.tipo_averia,  // BD espera 'categoria'
        descripcion: formData.descripcion || 'Sin descripción',  // BD espera 'descripcion' NOT NULL
        fecha_averia: formData.fecha_averia,
        fecha_resolucion: formData.fecha_resolucion || null,
        kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : null,
        coste_reparacion: costeManoObra || null,  // BD espera 'coste_reparacion'
        coste_total: costeTotal > 0 ? costeTotal : null,
        taller: formData.taller || null,
        severidad: severidadMap[formData.gravedad] || 'media',  // Mapear gravedad → severidad
        estado: estadoMap[formData.estado] || 'pendiente',  // Mapear estado
        en_garantia: formData.garantia,  // BD espera 'en_garantia'
        notas: formData.notas || null
      }

      const url = editandoId
        ? `/api/vehiculos/${vehiculoId}/averias?id=${editandoId}`
        : `/api/vehiculos/${vehiculoId}/averias`

      const response = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: editandoId ? 'Avería actualizada correctamente' : 'Avería registrada correctamente'
        })
        limpiarFormulario()
        setMostrarFormulario(false)
        await cargarAverias()
      } else {
        const error = await response.json()
        setMensaje({ tipo: 'error', texto: error.error || 'Error al guardar la avería' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al guardar la avería' })
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (averia: any) => {
    // Mapear de BD (severidad) a formulario (gravedad)
    const severidadToGravedadMap: { [key: string]: 'leve' | 'moderada' | 'grave' | 'critica' } = {
      'baja': 'leve',
      'media': 'moderada',
      'alta': 'grave',
      'critica': 'critica'
    }
    // Mapear de BD (estado) a formulario (estado)
    const estadoMap: { [key: string]: 'pendiente' | 'en_reparacion' | 'reparada' } = {
      'pendiente': 'pendiente',
      'en_reparacion': 'en_reparacion',
      'resuelto': 'reparada'
    }

    setFormData({
      tipo_averia: averia.categoria || '',
      descripcion: averia.descripcion || '',
      fecha_averia: averia.fecha_averia || '',
      fecha_resolucion: averia.fecha_resolucion || '',
      kilometraje: averia.kilometraje?.toString() || '',
      coste_mano_obra: averia.coste_reparacion?.toString() || '',
      coste_piezas: '', // No está en BD como campo separado
      taller: averia.taller || '',
      ubicacion_averia: '', // No está en BD
      gravedad: severidadToGravedadMap[averia.severidad] || 'moderada',
      estado: estadoMap[averia.estado] || 'pendiente',
      garantia: averia.en_garantia || false,
      notas: averia.notas || ''
    })
    setEditandoId(averia.id)
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta avería?')) {
      return
    }

    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/averias?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: 'Avería eliminada correctamente' })
        await cargarAverias()
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al eliminar la avería' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al eliminar la avería' })
    }
  }

  const getGravedadColor = (gravedad: string) => {
    switch (gravedad) {
      case 'leve':
        return 'bg-blue-100 text-blue-800'
      case 'moderada':
        return 'bg-yellow-100 text-yellow-800'
      case 'grave':
        return 'bg-orange-100 text-orange-800'
      case 'critica':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'reparada':
        return 'bg-green-100 text-green-800'
      case 'en_reparacion':
        return 'bg-blue-100 text-blue-800'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No especificada'
    return new Date(fecha).toLocaleDateString('es-ES')
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Averías y Reparaciones</h2>
          <p className="mt-1 text-sm text-gray-500">
            Historial completo de averías y reparaciones del vehículo
          </p>
        </div>
        <button
          onClick={() => {
            limpiarFormulario()
            setMostrarFormulario(!mostrarFormulario)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Avería
        </button>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`rounded-md p-4 ${mensaje.tipo === 'exito' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-sm ${mensaje.tipo === 'exito' ? 'text-green-800' : 'text-red-800'}`}>
            {mensaje.texto}
          </p>
        </div>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              {editandoId ? '✏️ Editar Avería' : '➕ Nueva Avería'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                Información Básica de la Avería
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de avería */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de avería <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.tipo_averia}
                    onChange={(e) => setFormData({ ...formData, tipo_averia: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="mecanica">Mecánica</option>
                    <option value="electrica">Eléctrica</option>
                    <option value="electronica">Electrónica</option>
                    <option value="carroceria">Carrocería</option>
                    <option value="suspension">Suspensión</option>
                    <option value="frenos">Frenos</option>
                    <option value="motor">Motor</option>
                    <option value="transmision">Transmisión</option>
                    <option value="neumaticos">Neumáticos</option>
                    <option value="habitaculo">Habitáculo</option>
                    <option value="otra">Otra</option>
                  </select>
                </div>

                {/* Gravedad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gravedad <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.gravedad}
                    onChange={(e) => setFormData({ ...formData, gravedad: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="grave">Grave</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_reparacion">En reparación</option>
                    <option value="reparada">Reparada</option>
                  </select>
                </div>

                {/* Garantía */}
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    checked={formData.garantia}
                    onChange={(e) => setFormData({ ...formData, garantia: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">
                    Cubierto por garantía
                  </label>
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de la avería <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe la avería en detalle: síntomas, qué pasó, cuándo ocurrió..."
                  />
                </div>
              </div>
            </div>

            {/* Fechas y Ubicación */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-primary-600" />
                Fechas y Ubicación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha avería */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de la avería <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_averia}
                    onChange={(e) => setFormData({ ...formData, fecha_averia: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Fecha resolución */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de resolución
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_resolucion}
                    onChange={(e) => setFormData({ ...formData, fecha_resolucion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deja vacío si aún no está resuelta</p>
                </div>

                {/* Kilometraje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilometraje cuando ocurrió
                  </label>
                  <input
                    type="number"
                    value={formData.kilometraje}
                    onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: 50000"
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación donde ocurrió
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion_averia}
                    onChange={(e) => setFormData({ ...formData, ubicacion_averia: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ciudad, carretera, etc."
                  />
                </div>
              </div>
            </div>

            {/* Costes de Reparación */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
                Costes de Reparación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coste mano de obra */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coste mano de obra (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.coste_mano_obra}
                    onChange={(e) => setFormData({ ...formData, coste_mano_obra: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: 150.00"
                  />
                </div>

                {/* Coste piezas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coste piezas/repuestos (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.coste_piezas}
                    onChange={(e) => setFormData({ ...formData, coste_piezas: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: 250.00"
                  />
                </div>

                {/* Coste total calculado */}
                {(formData.coste_mano_obra || formData.coste_piezas) && (
                  <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Coste Total Estimado:</span>
                      <span className="text-2xl font-bold text-blue-900">
                        {formatNumber((parseFloat(formData.coste_mano_obra) || 0) + (parseFloat(formData.coste_piezas) || 0))} €
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Taller */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Taller de Reparación</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Taller */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Taller
                  </label>
                  <input
                    type="text"
                    value={formData.taller}
                    onChange={(e) => setFormData({ ...formData, taller: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nombre del taller que hizo o hará la reparación"
                  />
                </div>
              </div>
            </div>

            {/* Notas Adicionales */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Notas Adicionales</h3>

              <textarea
                rows={4}
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Observaciones, diagnóstico del taller, piezas reemplazadas específicas, recomendaciones futuras..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false)
                  limpiarFormulario()
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {guardando ? 'Guardando...' : (editandoId ? '💾 Actualizar' : '💾 Guardar Avería')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de averías */}
      {averias.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay averías registradas</h3>
          <p className="mt-1 text-sm text-gray-500">
            ¡Esperemos que siga así! Si ocurre alguna, regístrala aquí.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Tipo y Descripción
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Fecha
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Coste
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                      Gravedad
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                      Estado
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {averias.map((averia) => (
                  <tr key={averia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <WrenchIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {averia.categoria?.replace('_', ' ') || 'Sin categoría'}
                            {averia.en_garantia && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Garantía
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {averia.descripcion}
                          </div>
                          {averia.taller && (
                            <div className="text-xs text-gray-400 mt-1">
                              Taller: {averia.taller}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatearFecha(averia.fecha_averia)}
                      </div>
                      {averia.fecha_resolucion && (
                        <div className="text-xs text-green-600">
                          Resuelta: {formatearFecha(averia.fecha_resolucion)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {averia.coste_total ? `${formatNumber(averia.coste_total)} €` : '-'}
                      </div>
                      {(averia.coste_reparacion || averia.coste_total) && (
                        <div className="text-xs text-gray-500">
                          {averia.coste_reparacion && `Reparación: ${formatNumber(averia.coste_reparacion)} €`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGravedadColor(averia.severidad || 'media')}`}>
                        {averia.severidad || 'media'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(averia.estado || 'pendiente')}`}>
                        {(averia.estado || 'pendiente').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditar(averia)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(averia.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
