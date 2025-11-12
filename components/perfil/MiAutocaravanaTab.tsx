'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehiculoRegistrado } from '@/types/reportes.types'
import {
  TruckIcon,
  QrCodeIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Props {
  userId: string
}

export function MiAutocaravanaTab({ userId }: Props) {
  const [vehiculos, setVehiculos] = useState<VehiculoRegistrado[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    matricula: '',
    marca: '',
    modelo: '',
    año: '',
    color: ''
  })

  useEffect(() => {
    loadVehiculos()
  }, [userId])

  const loadVehiculos = async () => {
    try {
      const response = await fetch('/api/vehiculos')
      const data = await response.json()

      if (response.ok) {
        setVehiculos(data.vehiculos || [])
      } else {
        console.error('Error cargando vehículos:', data.error)
      }
    } catch (error) {
      console.error('Error cargando vehículos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    // Validar año si se proporciona
    let añoNumero: number | null = null
    if (formData.año && formData.año.trim() !== '') {
      añoNumero = parseInt(formData.año)
      const añoActual = new Date().getFullYear()
      if (isNaN(añoNumero) || añoNumero < 1900 || añoNumero > añoActual + 1) {
        setMessage({ type: 'error', text: `El año debe estar entre 1900 y ${añoActual + 1}` })
        setSaving(false)
        return
      }
    }

    try {
      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: formData.matricula.toUpperCase(),
          marca: formData.marca || null,
          modelo: formData.modelo || null,
          año: añoNumero,
          color: formData.color || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setFormData({ matricula: '', marca: '', modelo: '', año: '', color: '' })
        setShowForm(false)
        loadVehiculos()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      console.error('Error registrando vehículo:', error)
      setMessage({ type: 'error', text: 'Error al registrar vehículo' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (vehiculoId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este vehículo? Los reportes asociados se mantendrán.')) {
      return
    }

    try {
      const response = await fetch(`/api/vehiculos?id=${vehiculoId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        loadVehiculos()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      console.error('Error eliminando vehículo:', error)
      setMessage({ type: 'error', text: 'Error al eliminar vehículo' })
    }
  }

  const handleDownloadQR = (vehiculo: VehiculoRegistrado) => {
    if (!vehiculo.qr_image_url) {
      alert('QR no disponible')
      return
    }

    // Descargar QR como imagen
    const link = document.createElement('a')
    link.href = vehiculo.qr_image_url
    link.download = `QR-${vehiculo.matricula}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de alerta/éxito */}
      {message && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header con botón de añadir */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mi Autocaravana</h2>
          <p className="mt-1 text-sm text-gray-600">
            Registra tu autocaravana y genera un código QR para reportes de accidentes
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Registrar Vehículo
          </button>
        )}
      </div>

      {/* Formulario de registro */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Nuevo Vehículo</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Matrícula <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="1234ABC"
                maxLength={20}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Marca</label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Hymer, Bürstner, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="B-Class, Elegance, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Año</label>
                <input
                  type="number"
                  value={formData.año}
                  onChange={(e) => setFormData({ ...formData, año: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Blanco, Gris, etc."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ matricula: '', marca: '', modelo: '', año: '', color: '' })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Registrando...' : 'Registrar Vehículo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de vehículos */}
      {vehiculos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes vehículos registrados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Registra tu autocaravana para generar un código QR de reportes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {vehiculos.map((vehiculo) => (
            <div key={vehiculo.id} className="bg-white rounded-xl shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <TruckIcon className="h-6 w-6 text-primary-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-900">{vehiculo.matricula}</h3>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    {vehiculo.marca && <p><strong>Marca:</strong> {vehiculo.marca}</p>}
                    {vehiculo.modelo && <p><strong>Modelo:</strong> {vehiculo.modelo}</p>}
                    {vehiculo.año && <p><strong>Año:</strong> {vehiculo.año}</p>}
                    {vehiculo.color && <p><strong>Color:</strong> {vehiculo.color}</p>}
                    <p className="text-xs text-gray-400 mt-2">
                      Registrado: {new Date(vehiculo.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                {vehiculo.qr_image_url && (
                  <div className="ml-6 flex-shrink-0">
                    <div className="text-center">
                      <img
                        src={vehiculo.qr_image_url}
                        alt={`QR ${vehiculo.matricula}`}
                        className="w-32 h-32 border-2 border-gray-200 rounded"
                      />
                      <button
                        onClick={() => handleDownloadQR(vehiculo)}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Descargar QR
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Información del QR */}
              <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-200">
                <div className="flex items-start">
                  <QrCodeIcon className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary-900">
                    <p className="font-semibold mb-2">Código QR para Reportes de Accidentes</p>
                    <p className="text-primary-700 mb-3">
                      Imprime y pega este QR en tu autocaravana. Los testigos podrán escanearlo con su móvil para reportar accidentes y tú recibirás una notificación.
                    </p>
                    <p className="text-xs font-mono bg-white px-3 py-2 rounded-lg border border-primary-200 break-all">
                      {process.env.NEXT_PUBLIC_APP_URL || 'https://mapafurgocasa.com'}/reporte/{vehiculo.qr_code_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleDelete(vehiculo.id)}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
