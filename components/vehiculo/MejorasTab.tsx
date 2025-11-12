'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  SparklesIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

interface Mejora {
  id: string
  vehiculo_id: string
  tipo_mejora: string
  nombre: string
  descripcion: string | null
  fecha_instalacion: string
  coste_producto: number | null
  coste_instalacion: number | null
  coste_total: number | null
  marca: string | null
  modelo: string | null
  proveedor: string | null
  ubicacion_instalacion: string | null
  garantia_meses: number | null
  mejora_valor: boolean
  notas: string | null
  created_at: string
  updated_at: string
}

interface Props {
  vehiculoId: string
}

export default function MejorasTab({ vehiculoId }: Props) {
  const [mejoras, setMejoras] = useState<Mejora[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    tipo_mejora: 'electronica',
    nombre: '',
    descripcion: '',
    fecha_instalacion: new Date().toISOString().split('T')[0],
    coste_producto: '',
    coste_instalacion: '',
    marca: '',
    modelo: '',
    proveedor: '',
    ubicacion_instalacion: '',
    garantia_meses: '',
    mejora_valor: true,
    notas: ''
  })

  useEffect(() => {
    cargarMejoras()
  }, [vehiculoId])

  const cargarMejoras = async () => {
    try {
      setCargando(true)
      const response = await fetch(`/api/vehiculos/${vehiculoId}/mejoras`)

      if (response.ok) {
        const data = await response.json()
        setMejoras(data)
      }
    } catch (error) {
      console.error('Error al cargar mejoras:', error)
    } finally {
      setCargando(false)
    }
  }

  const limpiarFormulario = () => {
    setFormData({
      tipo_mejora: 'electronica',
      nombre: '',
      descripcion: '',
      fecha_instalacion: new Date().toISOString().split('T')[0],
      coste_producto: '',
      coste_instalacion: '',
      marca: '',
      modelo: '',
      proveedor: '',
      ubicacion_instalacion: '',
      garantia_meses: '',
      mejora_valor: true,
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
        tipo_mejora: formData.tipo_mejora,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        fecha_instalacion: formData.fecha_instalacion,
        coste_producto: formData.coste_producto ? parseFloat(formData.coste_producto) : null,
        coste_instalacion: formData.coste_instalacion ? parseFloat(formData.coste_instalacion) : null,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        proveedor: formData.proveedor || null,
        ubicacion_instalacion: formData.ubicacion_instalacion || null,
        garantia_meses: formData.garantia_meses ? parseInt(formData.garantia_meses) : null,
        mejora_valor: formData.mejora_valor,
        notas: formData.notas || null
      }

      const url = editandoId
        ? `/api/vehiculos/${vehiculoId}/mejoras?id=${editandoId}`
        : `/api/vehiculos/${vehiculoId}/mejoras`

      const response = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: editandoId ? 'Mejora actualizada correctamente' : 'Mejora registrada correctamente'
        })
        limpiarFormulario()
        setMostrarFormulario(false)
        await cargarMejoras()
      } else {
        const error = await response.json()
        setMensaje({ tipo: 'error', texto: error.error || 'Error al guardar la mejora' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al guardar la mejora' })
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (mejora: Mejora) => {
    setFormData({
      tipo_mejora: mejora.tipo_mejora,
      nombre: mejora.nombre,
      descripcion: mejora.descripcion || '',
      fecha_instalacion: mejora.fecha_instalacion,
      coste_producto: mejora.coste_producto?.toString() || '',
      coste_instalacion: mejora.coste_instalacion?.toString() || '',
      marca: mejora.marca || '',
      modelo: mejora.modelo || '',
      proveedor: mejora.proveedor || '',
      ubicacion_instalacion: mejora.ubicacion_instalacion || '',
      garantia_meses: mejora.garantia_meses?.toString() || '',
      mejora_valor: mejora.mejora_valor,
      notas: mejora.notas || ''
    })
    setEditandoId(mejora.id)
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta mejora?')) {
      return
    }

    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/mejoras?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: 'Mejora eliminada correctamente' })
        await cargarMejoras()
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al eliminar la mejora' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al eliminar la mejora' })
    }
  }

  const formatearFecha = (fecha: string) => {
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
          <h2 className="text-2xl font-bold text-gray-900">Mejoras y Accesorios</h2>
          <p className="mt-1 text-sm text-gray-500">
            Registra todas las mejoras y accesorios añadidos a tu vehículo
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
          Nueva Mejora
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
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editandoId ? 'Editar Mejora' : 'Nueva Mejora'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de mejora */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de mejora *
                </label>
                <select
                  required
                  value={formData.tipo_mejora}
                  onChange={(e) => setFormData({ ...formData, tipo_mejora: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="electronica">Electrónica</option>
                  <option value="mecanica">Mecánica</option>
                  <option value="habitabilidad">Habitabilidad</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="exterior">Exterior</option>
                  <option value="interior">Interior</option>
                  <option value="energia">Energía</option>
                  <option value="agua">Agua</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: Panel solar 200W"
                />
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: Victron Energy"
                />
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: BlueSolar 150/35"
                />
              </div>

              {/* Fecha instalación */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de instalación *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_instalacion}
                  onChange={(e) => setFormData({ ...formData, fecha_instalacion: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              {/* Coste producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Coste del producto (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.coste_producto}
                  onChange={(e) => setFormData({ ...formData, coste_producto: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: 450.00"
                />
              </div>

              {/* Coste instalación */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Coste de instalación (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.coste_instalacion}
                  onChange={(e) => setFormData({ ...formData, coste_instalacion: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: 150.00"
                />
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Donde lo compraste"
                />
              </div>

              {/* Ubicación instalación */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lugar de instalación
                </label>
                <input
                  type="text"
                  value={formData.ubicacion_instalacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion_instalacion: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Taller o ciudad"
                />
              </div>

              {/* Garantía */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Garantía (meses)
                </label>
                <input
                  type="number"
                  value={formData.garantia_meses}
                  onChange={(e) => setFormData({ ...formData, garantia_meses: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: 24"
                />
              </div>

              {/* Mejora el valor */}
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  checked={formData.mejora_valor}
                  onChange={(e) => setFormData({ ...formData, mejora_valor: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Mejora el valor del vehículo
                </label>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Detalles de la mejora..."
              />
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
                placeholder="Observaciones, instrucciones..."
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

      {/* Lista de mejoras */}
      {mejoras.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay mejoras registradas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Registra las mejoras y accesorios que has añadido a tu vehículo
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mejora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca/Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coste Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Garantía
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mejoras.map((mejora) => (
                  <tr key={mejora.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <SparklesIcon className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {mejora.nombre}
                            {mejora.mejora_valor && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                +Valor
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {mejora.tipo_mejora.replace('_', ' ')}
                          </div>
                          {mejora.descripcion && (
                            <div className="text-sm text-gray-500 mt-1">
                              {mejora.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{mejora.marca || '-'}</div>
                      {mejora.modelo && (
                        <div className="text-xs text-gray-500">{mejora.modelo}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(mejora.fecha_instalacion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {mejora.coste_total ? `${mejora.coste_total.toFixed(2)} €` : '-'}
                      </div>
                      {(mejora.coste_producto || mejora.coste_instalacion) && (
                        <div className="text-xs text-gray-500">
                          {mejora.coste_producto && `Prod: ${mejora.coste_producto.toFixed(2)}€`}
                          {mejora.coste_producto && mejora.coste_instalacion && ' | '}
                          {mejora.coste_instalacion && `Inst: ${mejora.coste_instalacion.toFixed(2)}€`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mejora.garantia_meses ? `${mejora.garantia_meses} meses` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditar(mejora)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(mejora.id)}
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
