'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  TruckIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface RegistroKilometraje {
  id: string
  vehiculo_id: string
  fecha: string
  kilometraje: number
  litros_combustible: number | null
  precio_litro: number | null
  coste_total_combustible: number | null
  tipo_combustible: string | null
  consumo_medio: number | null
  ubicacion: string | null
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

export default function KilometrajeTab({ vehiculoId }: Props) {
  const [registros, setRegistros] = useState<RegistroKilometraje[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    kilometraje: '',
    litros_combustible: '',
    coste_total_combustible: '',
    tipo_combustible: 'diesel',
    ubicacion: '',
    notas: ''
  })

  useEffect(() => {
    cargarRegistros()
  }, [vehiculoId])

  const cargarRegistros = async () => {
    try {
      setCargando(true)
      const response = await fetch(`/api/vehiculos/${vehiculoId}/kilometraje`)

      if (response.ok) {
        const data = await response.json()
        setRegistros(data)
      }
    } catch (error) {
      console.error('Error al cargar registros:', error)
    } finally {
      setCargando(false)
    }
  }

  const limpiarFormulario = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      kilometraje: '',
      litros_combustible: '',
      coste_total_combustible: '',
      tipo_combustible: 'diesel',
      ubicacion: '',
      notas: ''
    })
    setEditandoId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setGuardando(true)
      setMensaje(null)

      const datos = {
        vehiculo_id: vehiculoId,
        fecha: formData.fecha,
        kilometraje: parseInt(formData.kilometraje),
        litros_combustible: formData.litros_combustible ? parseFloat(formData.litros_combustible) : null,
        coste_total_combustible: formData.coste_total_combustible ? parseFloat(formData.coste_total_combustible) : null,
        tipo_combustible: formData.tipo_combustible || null,
        ubicacion: formData.ubicacion || null,
        notas: formData.notas || null
      }

      const url = editandoId
        ? `/api/vehiculos/${vehiculoId}/kilometraje?id=${editandoId}`
        : `/api/vehiculos/${vehiculoId}/kilometraje`

      const response = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: editandoId ? 'Registro actualizado correctamente' : 'Registro creado correctamente'
        })
        limpiarFormulario()
        setMostrarFormulario(false)
        await cargarRegistros()
      } else {
        const error = await response.json()
        setMensaje({ tipo: 'error', texto: error.error || 'Error al guardar el registro' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al guardar el registro' })
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (registro: RegistroKilometraje) => {
    setFormData({
      fecha: registro.fecha,
      kilometraje: registro.kilometraje.toString(),
      litros_combustible: registro.litros_combustible?.toString() || '',
      coste_total_combustible: registro.coste_total_combustible?.toString() || '',
      tipo_combustible: registro.tipo_combustible || 'diesel',
      ubicacion: registro.ubicacion || '',
      notas: registro.notas || ''
    })
    setEditandoId(registro.id)
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      return
    }

    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/kilometraje?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: 'Registro eliminado correctamente' })
        await cargarRegistros()
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al eliminar el registro' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al eliminar el registro' })
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES')
  }

  const calcularEstadisticas = () => {
    if (registros.length === 0) return null

    const ultimoRegistro = registros[0]
    const consumosMedios = registros
      .filter((r: any) => r.consumo_medio)
      .map((r: any) => r.consumo_medio!)

    const costes = registros
      .filter((r: any) => r.coste_total_combustible)
      .map((r: any) => r.coste_total_combustible!)

    return {
      kilometrajeActual: ultimoRegistro.kilometraje,
      consumoMedio: consumosMedios.length > 0
        ? consumosMedios.reduce((a, b) => a + b, 0) / consumosMedios.length
        : null,
      gastoTotalCombustible: costes.reduce((a, b) => a + b, 0)
    }
  }

  const stats = calcularEstadisticas()

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
          <h2 className="text-2xl font-bold text-gray-900">Control de Kilometraje</h2>
          <p className="mt-1 text-sm text-gray-500">
            Registra el kilometraje y consumo de combustible
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
          Nuevo Registro
        </button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kilometraje Actual</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.kilometrajeActual.toLocaleString()} km
                </p>
              </div>
            </div>
          </div>

          {stats.consumoMedio && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Consumo Medio</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.consumoMedio.toFixed(1)} L/100km
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gasto Total Combustible</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(stats.gastoTotalCombustible)} €
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editandoId ? 'Editar Registro' : 'Nuevo Registro'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              {/* Kilometraje */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kilometraje *
                </label>
                <input
                  type="number"
                  required
                  value={formData.kilometraje}
                  onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: 50000"
                />
              </div>

              {/* Litros combustible */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Litros de combustible
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.litros_combustible}
                  onChange={(e) => setFormData({ ...formData, litros_combustible: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: 45.50"
                />
              </div>

              {/* Coste total */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Coste total (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.coste_total_combustible}
                  onChange={(e) => setFormData({ ...formData, coste_total_combustible: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: 68.25"
                />
              </div>

              {/* Tipo combustible */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de combustible
                </label>
                <select
                  value={formData.tipo_combustible}
                  onChange={(e) => setFormData({ ...formData, tipo_combustible: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="diesel">Diésel</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="glp">GLP</option>
                  <option value="electrico">Eléctrico</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Gasolinera, ciudad..."
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notas adicionales
              </label>
              <textarea
                rows={3}
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Observaciones sobre el viaje, consumo..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false)
                  limpiarFormulario()
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : (editandoId ? 'Actualizar' : 'Guardar')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de registros */}
      {registros.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay registros de kilometraje</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza registrando el kilometraje actual de tu vehículo
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kilometraje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Combustible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consumo Medio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registros.map((registro) => (
                  <tr key={registro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(registro.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {registro.kilometraje.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registro.litros_combustible ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {registro.litros_combustible.toFixed(2)} L
                          </div>
                          {registro.tipo_combustible && (
                            <div className="text-xs text-gray-500">
                              {registro.tipo_combustible}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registro.coste_total_combustible ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatNumber(registro.coste_total_combustible)} €
                          </div>
                          {registro.precio_litro && (
                            <div className="text-xs text-gray-500">
                              {registro.precio_litro.toFixed(3)} €/L
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registro.consumo_medio ? `${registro.consumo_medio.toFixed(1)} L/100km` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registro.ubicacion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditar(registro)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(registro.id)}
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
