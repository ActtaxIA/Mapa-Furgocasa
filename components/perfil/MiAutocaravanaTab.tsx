'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehiculoRegistrado } from '@/types/reportes.types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TruckIcon,
  QrCodeIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Props {
  userId: string
}

export function MiAutocaravanaTab({ userId }: Props) {
  const router = useRouter()
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
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

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
      // Crear FormData para enviar la foto
      const formDataToSend = new FormData()
      formDataToSend.append('matricula', formData.matricula.toUpperCase())
      if (formData.marca) formDataToSend.append('marca', formData.marca)
      if (formData.modelo) formDataToSend.append('modelo', formData.modelo)
      if (añoNumero !== null) formDataToSend.append('año', añoNumero.toString())
      if (formData.color) formDataToSend.append('color', formData.color)
      if (fotoFile) formDataToSend.append('foto', fotoFile)

      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '¡Vehículo registrado! Ahora completa los datos de compra...' })
        setFormData({ matricula: '', marca: '', modelo: '', año: '', color: '' })
        setFotoFile(null)
        setFotoPreview(null)
        setShowForm(false)

        // Redirigir a la página del vehículo con el tab de compra activo
        setTimeout(() => {
          router.push(`/vehiculo/${data.vehiculo.id}?tab=compra`)
        }, 1500)
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

            {/* Campo de foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto del Vehículo (Opcional)
              </label>
              <div className="flex items-start gap-4">
                {/* Preview de la foto */}
                {fotoPreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFotoFile(null)
                        setFotoPreview(null)
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Botón de subida */}
                {!fotoPreview && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="mb-1 text-sm text-gray-500 font-medium">Click para subir foto</p>
                      <p className="text-xs text-gray-400">PNG, JPG hasta 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setMessage({ type: 'error', text: 'La foto no puede superar los 5MB' })
                            return
                          }
                          setFotoFile(file)
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFotoPreview(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Sube una foto de tu vehículo para identificarlo fácilmente
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ matricula: '', marca: '', modelo: '', año: '', color: '' })
                  setFotoFile(null)
                  setFotoPreview(null)
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
            <div key={vehiculo.id} className="bg-white rounded-xl shadow p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              {/* Layout Vertical en Móvil, Horizontal en Desktop */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-6">
                {/* Foto del Vehículo */}
                <div className="flex-shrink-0">
                  {vehiculo.foto_url ? (
                    <img
                      src={vehiculo.foto_url}
                      alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                      className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-2 border-primary-300">
                      <TruckIcon className="h-16 w-16 text-primary-600" />
                    </div>
                  )}
                </div>

                {/* Datos del Vehículo */}
                <div className="flex-1 text-center lg:text-left w-full lg:w-auto">
                  <div className="flex items-center justify-center lg:justify-start">
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
                  <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center">
                    <img
                      src={vehiculo.qr_image_url}
                      alt={`QR ${vehiculo.matricula}`}
                      className="w-32 h-32 border-2 border-gray-200 rounded-lg"
                    />
                    <button
                      onClick={() => handleDownloadQR(vehiculo)}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Descargar QR
                    </button>
                  </div>
                )}
              </div>

              {/* Información del QR - Simplificada */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <QrCodeIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Código QR para reportes de accidentes
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      Descarga el QR y pégalo en tu vehículo. Recibirás alertas instantáneas si alguien reporta un accidente.
                    </p>
                    <p className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-300 break-all text-gray-700">
                      {process.env.NEXT_PUBLIC_APP_URL || 'https://mapafurgocasa.com'}/accidente?matricula={vehiculo.matricula}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-4 flex justify-between items-center">
                <Link
                  href={`/vehiculo/${vehiculo.id}`}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Gestionar Vehículo
                </Link>
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
