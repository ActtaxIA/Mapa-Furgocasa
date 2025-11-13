'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  BanknotesIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface GastoAdicional {
  id: string
  vehiculo_id: string
  tipo_gasto: string
  concepto: string
  fecha: string
  importe: number
  periodicidad: 'unico' | 'mensual' | 'trimestral' | 'semestral' | 'anual' | null
  proveedor: string | null
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

export default function GastosAdicionalesTab({ vehiculoId }: Props) {
  const [gastos, setGastos] = useState<GastoAdicional[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    tipo_gasto: 'seguro',
    concepto: '',
    fecha: new Date().toISOString().split('T')[0],
    importe: '',
    periodicidad: 'anual' as 'unico' | 'mensual' | 'trimestral' | 'semestral' | 'anual',
    proveedor: '',
    notas: ''
  })

  useEffect(() => {
    cargarGastos()
  }, [vehiculoId])

  const cargarGastos = async () => {
    try {
      setCargando(true)
      const response = await fetch(`/api/vehiculos/${vehiculoId}/gastos`)

      if (response.ok) {
        const data = await response.json()
        setGastos(data)
      }
    } catch (error) {
      console.error('Error al cargar gastos:', error)
    } finally {
      setCargando(false)
    }
  }

  const limpiarFormulario = () => {
    setFormData({
      tipo_gasto: 'seguro',
      concepto: '',
      fecha: new Date().toISOString().split('T')[0],
      importe: '',
      periodicidad: 'anual',
      proveedor: '',
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
        tipo_gasto: formData.tipo_gasto,
        concepto: formData.concepto,
        fecha: formData.fecha,
        importe: parseFloat(formData.importe),
        periodicidad: formData.periodicidad || null,
        proveedor: formData.proveedor || null,
        notas: formData.notas || null
      }

      const url = editandoId
        ? `/api/vehiculos/${vehiculoId}/gastos?id=${editandoId}`
        : `/api/vehiculos/${vehiculoId}/gastos`

      const response = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })

      if (response.ok) {
        setMensaje({
          tipo: 'exito',
          texto: editandoId ? 'Gasto actualizado correctamente' : 'Gasto registrado correctamente'
        })
        limpiarFormulario()
        setMostrarFormulario(false)
        await cargarGastos()
      } else {
        const error = await response.json()
        setMensaje({ tipo: 'error', texto: error.error || 'Error al guardar el gasto' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al guardar el gasto' })
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (gasto: GastoAdicional) => {
    setFormData({
      tipo_gasto: gasto.tipo_gasto,
      concepto: gasto.concepto,
      fecha: gasto.fecha,
      importe: gasto.importe.toString(),
      periodicidad: gasto.periodicidad || 'unico',
      proveedor: gasto.proveedor || '',
      notas: gasto.notas || ''
    })
    setEditandoId(gasto.id)
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      return
    }

    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/gastos?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: 'Gasto eliminado correctamente' })
        await cargarGastos()
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al eliminar el gasto' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje({ tipo: 'error', texto: 'Error al eliminar el gasto' })
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'seguro':
        return 'bg-blue-100 text-blue-800'
      case 'impuestos':
        return 'bg-purple-100 text-purple-800'
      case 'peajes':
        return 'bg-yellow-100 text-yellow-800'
      case 'parking':
        return 'bg-green-100 text-green-800'
      case 'limpieza':
        return 'bg-cyan-100 text-cyan-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES')
  }

  const calcularTotalGastos = () => {
    return gastos.reduce((total, gasto) => total + gasto.importe, 0)
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
          <h2 className="text-2xl font-bold text-gray-900">Gastos Adicionales</h2>
          <p className="mt-1 text-sm text-gray-500">
            Seguros, impuestos, peajes y otros gastos recurrentes
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
          Nuevo Gasto
        </button>
      </div>

      {/* Total de gastos */}
      {gastos.length > 0 && (
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">Total de gastos registrados</p>
              <p className="text-xs text-primary-700 mt-1">Incluye todos los gastos adicionales</p>
            </div>
            <div className="text-2xl font-bold text-primary-900">
              {formatNumber(calcularTotalGastos())} €
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
            {editandoId ? 'Editar Gasto' : 'Nuevo Gasto'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de gasto */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de gasto *
                </label>
                <select
                  required
                  value={formData.tipo_gasto}
                  onChange={(e) => setFormData({ ...formData, tipo_gasto: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="seguro">Seguro</option>
                  <option value="impuestos">Impuestos</option>
                  <option value="peajes">Peajes</option>
                  <option value="parking">Parking</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="camping">Camping</option>
                  <option value="area_servicio">Área de servicio</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Concepto */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Concepto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.concepto}
                  onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: Seguro a todo riesgo"
                />
              </div>

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

              {/* Importe */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Importe (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.importe}
                  onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ej: 850.00"
                />
              </div>

              {/* Periodicidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Periodicidad
                </label>
                <select
                  value={formData.periodicidad}
                  onChange={(e) => setFormData({ ...formData, periodicidad: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="unico">Único</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
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
                  placeholder="Compañía aseguradora, etc."
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
                placeholder="Observaciones, póliza, número de referencia..."
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

      {/* Lista de gastos */}
      {gastos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay gastos registrados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Registra los gastos adicionales de tu vehículo
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periodicidad
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gastos.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {gasto.concepto}
                          </div>
                          {gasto.proveedor && (
                            <div className="text-xs text-gray-500 mt-1">
                              {gasto.proveedor}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoColor(gasto.tipo_gasto)}`}>
                        {gasto.tipo_gasto}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(gasto.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatNumber(gasto.importe)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {gasto.periodicidad || 'Único'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditar(gasto)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(gasto.id)}
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
