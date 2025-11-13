'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Mantenimiento {
  id: string
  vehiculo_id: string
  user_id: string
  tipo: string // Antes 'tipo_mantenimiento' en formulario
  fecha: string // Antes 'fecha_realizada' o 'fecha_programada' en formulario
  kilometraje: number | null
  descripcion: string | null
  coste: number | null
  proximo_mantenimiento: string | null // Antes 'proximo_mantenimiento_fecha' en formulario
  kilometraje_proximo: number | null // Antes 'proximo_mantenimiento_km' en formulario
  alertar_dias_antes: number | null
  taller: string | null
  direccion_taller: string | null // Antes 'ubicacion_taller' en formulario
  telefono_taller: string | null
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

export default function MantenimientosTab({ vehiculoId }: Props) {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    tipo_mantenimiento: 'revision',
    descripcion: '',
    fecha_programada: '',
    fecha_realizada: '',
    kilometraje: '',
    coste: '',
    taller: '',
    ubicacion_taller: '',
    notas: '',
    proximo_mantenimiento_km: '',
    proximo_mantenimiento_fecha: ''
  })

  useEffect(() => {
    cargarMantenimientos()
  }, [vehiculoId])

  const cargarMantenimientos = async () => {
    try {
      setCargando(true)
      const response = await fetch(`/api/vehiculos/${vehiculoId}/mantenimientos`)

      if (response.ok) {
        const data = await response.json()
        setMantenimientos(data)
      }
    } catch (error) {
      console.error('Error al cargar mantenimientos:', error)
    } finally {
      setCargando(false)
    }
  }

  const limpiarFormulario = () => {
    setFormData({
      tipo_mantenimiento: 'revision',
      descripcion: '',
      fecha_programada: '',
      fecha_realizada: '',
      kilometraje: '',
      coste: '',
      taller: '',
      ubicacion_taller: '',
      notas: '',
      proximo_mantenimiento_km: '',
      proximo_mantenimiento_fecha: ''
    })
    setEditandoId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setGuardando(true)
      setMensaje(null)

      // Mapear campos del formulario a los nombres de la BD
      const datos = {
        vehiculo_id: vehiculoId,
        tipo: formData.tipo_mantenimiento,  // BD espera 'tipo'
        descripcion: formData.descripcion || null,
        fecha: formData.fecha_realizada || formData.fecha_programada || null,  // BD espera 'fecha'
        kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : null,
        coste: formData.coste ? parseFloat(formData.coste) : null,
        taller: formData.taller || null,
        direccion_taller: formData.ubicacion_taller || null,  // BD espera 'direccion_taller'
        notas: formData.notas || null,
        kilometraje_proximo: formData.proximo_mantenimiento_km ? parseInt(formData.proximo_mantenimiento_km) : null,  // BD espera 'kilometraje_proximo'
        proximo_mantenimiento: formData.proximo_mantenimiento_fecha || null  // BD espera 'proximo_mantenimiento'
      }

      const url = editandoId
        ? `/api/vehiculos/${vehiculoId}/mantenimientos?id=${editandoId}`
        : `/api/vehiculos/${vehiculoId}/mantenimientos`

      const response = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: editandoId ? 'Mantenimiento actualizado correctamente' : 'Mantenimiento registrado correctamente'
        })
        limpiarFormulario()
        setMostrarFormulario(false)
        await cargarMantenimientos()
      } else {
        const error = await response.json()
        setMensaje({ tipo: 'error', texto: error.error || 'Error al guardar el mantenimiento' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al guardar el mantenimiento' })
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (mantenimiento: any) => {
    setFormData({
      tipo_mantenimiento: mantenimiento.tipo || '',
      descripcion: mantenimiento.descripcion || '',
      fecha_programada: '',
      fecha_realizada: mantenimiento.fecha || '',
      kilometraje: mantenimiento.kilometraje?.toString() || '',
      coste: mantenimiento.coste?.toString() || '',
      taller: mantenimiento.taller || '',
      ubicacion_taller: mantenimiento.direccion_taller || '',
      notas: mantenimiento.notas || '',
      proximo_mantenimiento_km: mantenimiento.kilometraje_proximo?.toString() || '',
      proximo_mantenimiento_fecha: mantenimiento.proximo_mantenimiento || ''
    })
    setEditandoId(mantenimiento.id)
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mantenimiento?')) {
      return
    }

    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/mantenimientos?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: 'Mantenimiento eliminado correctamente' })
        await cargarMantenimientos()
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al eliminar el mantenimiento' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al eliminar el mantenimiento' })
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
      {/* Header con botón de añadir */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mantenimientos</h2>
          <p className="mt-1 text-sm text-gray-500">
            Registra y programa los mantenimientos de tu vehículo
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
          Nuevo Mantenimiento
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
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              {editandoId ? '✏️ Editar Mantenimiento' : '➕ Nuevo Mantenimiento'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-6 h-6 text-primary-600" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de mantenimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de mantenimiento <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.tipo_mantenimiento}
                    onChange={(e) => setFormData({ ...formData, tipo_mantenimiento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="revision">Revisión</option>
                    <option value="cambio_aceite">Cambio de aceite</option>
                    <option value="cambio_filtros">Cambio de filtros</option>
                    <option value="cambio_neumaticos">Cambio de neumáticos</option>
                    <option value="cambio_frenos">Cambio de frenos</option>
                    <option value="itv">ITV</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Detalles del mantenimiento..."
                  />
                </div>
              </div>
            </div>

            {/* Fechas y Kilometraje */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-primary-600" />
                Fechas y Kilometraje
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha programada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha programada
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_programada}
                    onChange={(e) => setFormData({ ...formData, fecha_programada: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Fecha realizada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha realizada
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_realizada}
                    onChange={(e) => setFormData({ ...formData, fecha_realizada: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Kilometraje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilometraje
                  </label>
                  <input
                    type="number"
                    value={formData.kilometraje}
                    onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: 50000"
                  />
                </div>

                {/* Coste */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coste (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.coste}
                    onChange={(e) => setFormData({ ...formData, coste: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: 150.00"
                  />
                </div>
              </div>
            </div>

            {/* Taller */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Taller</h3>

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
                    placeholder="Nombre del taller"
                  />
                </div>

                {/* Ubicación del taller */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación del taller
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion_taller}
                    onChange={(e) => setFormData({ ...formData, ubicacion_taller: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ciudad, dirección..."
                  />
                </div>
              </div>
            </div>

            {/* Próximo Mantenimiento */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Próximo Mantenimiento</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Próximo mantenimiento KM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Próximo mantenimiento (KM)
                  </label>
                  <input
                    type="number"
                    value={formData.proximo_mantenimiento_km}
                    onChange={(e) => setFormData({ ...formData, proximo_mantenimiento_km: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: 60000"
                  />
                </div>

                {/* Próximo mantenimiento fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Próximo mantenimiento (Fecha)
                  </label>
                  <input
                    type="date"
                    value={formData.proximo_mantenimiento_fecha}
                    onChange={(e) => setFormData({ ...formData, proximo_mantenimiento_fecha: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                placeholder="Observaciones, recomendaciones del taller, repuestos utilizados, etc..."
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
                {guardando ? 'Guardando...' : (editandoId ? '💾 Actualizar' : '💾 Guardar Mantenimiento')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de mantenimientos */}
      {mantenimientos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay mantenimientos registrados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza registrando el primer mantenimiento de tu vehículo
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
                      Tipo
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Fecha
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                      Kilometraje
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Coste
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                      Taller
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mantenimientos.map((mantenimiento) => (
                  <tr key={mantenimiento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <WrenchScrewdriverIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {mantenimiento.tipo?.replace('_', ' ') || 'Sin tipo'}
                          </div>
                          {mantenimiento.descripcion && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {mantenimiento.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatearFecha(mantenimiento.fecha)}
                      </div>
                      {mantenimiento.proximo_mantenimiento && (
                        <div className="text-xs text-gray-500">
                          Próximo: {formatearFecha(mantenimiento.proximo_mantenimiento)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mantenimiento.kilometraje ? `${mantenimiento.kilometraje.toLocaleString()} km` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mantenimiento.coste ? `${formatNumber(mantenimiento.coste)} €` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{mantenimiento.taller || '-'}</div>
                      {mantenimiento.direccion_taller && (
                        <div className="text-xs text-gray-500">{mantenimiento.direccion_taller}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditar(mantenimiento)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(mantenimiento.id)}
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
