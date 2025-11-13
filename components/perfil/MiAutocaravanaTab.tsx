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
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface Props {
  userId: string
}

interface VehiculosStats {
  total: number
  enPropiedad: number
  vendidos: number
}

export function MiAutocaravanaTab({ userId }: Props) {
  const router = useRouter()
  const [vehiculos, setVehiculos] = useState<VehiculoRegistrado[]>([])
  const [stats, setStats] = useState<VehiculosStats>({ total: 0, enPropiedad: 0, vendidos: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; vehiculo: VehiculoRegistrado | null }>({
    isOpen: false,
    vehiculo: null
  })

  // Form state
  const [formData, setFormData] = useState({
    matricula: '',
    marca: '',
    modelo: '',
    año: '',
    color: '',
    tipo_vehiculo: ''
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
        const vehiculosData = data.vehiculos || []
        setVehiculos(vehiculosData)

        // Calcular estadísticas
        const total = vehiculosData.length
        const vendidos = vehiculosData.filter((v: any) => v.vendido === true).length
        const enPropiedad = total - vendidos

        setStats({ total, enPropiedad, vendidos })
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
      // ============================================================
      // NUEVO: Subir foto DIRECTAMENTE a Supabase Storage
      // Bypasea AWS Amplify completamente
      // ============================================================
      let foto_url: string | null = null

      if (fotoFile) {
        console.log('📸 [Frontend] Subiendo foto de vehículo directamente a Supabase Storage...')
        const supabase = createClient()
        const timestamp = Date.now()

        // Validar tamaño (máx 10MB)
        if (fotoFile.size > 10 * 1024 * 1024) {
          setMessage({ type: 'error', text: 'La foto no puede superar 10MB' })
          setSaving(false)
          return
        }

        const fileExt = fotoFile.name.split('.').pop() || 'jpg'
        // Usar matrícula como referencia temporal (se actualizará con el vehiculo_id después)
        const fileName = `vehiculos/${userId}/${formData.matricula.toUpperCase()}_${timestamp}.${fileExt}`

        // Subir directamente a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('vehiculos')
          .upload(fileName, fotoFile, {
            contentType: fotoFile.type || 'image/jpeg',
            upsert: false
          })

        if (uploadError) {
          console.error('❌ Error subiendo foto:', uploadError)
          setMessage({ type: 'error', text: 'Error al subir la foto. Intenta de nuevo.' })
          setSaving(false)
          return
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('vehiculos')
          .getPublicUrl(fileName)

        console.log(`✅ Foto subida: ${publicUrl}`)
        foto_url = publicUrl
      }

      // ============================================================
      // Enviar datos del vehículo con JSON (NO FormData)
      // Incluye la URL de la foto ya subida
      // ============================================================
      const vehiculoData = {
        matricula: formData.matricula.toUpperCase(),
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        año: añoNumero,
        color: formData.color || null,
        tipo_vehiculo: formData.tipo_vehiculo || null,
        foto_url: foto_url // URL ya subida a Supabase
      }

      console.log('📤 [Frontend] Enviando datos del vehículo con JSON:', vehiculoData)

      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehiculoData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '¡Vehículo registrado! Ahora completa los datos de compra...' })
        setFormData({ matricula: '', marca: '', modelo: '', año: '', color: '', tipo_vehiculo: '' })
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

  const handleDeleteClick = (vehiculo: VehiculoRegistrado) => {
    setDeleteModal({ isOpen: true, vehiculo })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.vehiculo) return

    try {
      const response = await fetch(`/api/vehiculos?id=${deleteModal.vehiculo.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setDeleteModal({ isOpen: false, vehiculo: null })
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

      {/* Header con contadores y botón */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🚐 Mis Vehículos</h2>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona tus autocaravanas y genera códigos QR para reportes de accidentes
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

        {/* Contadores de Vehículos */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700">Total Vehículos</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
                </div>
                <TruckIcon className="w-10 h-10 text-blue-600 opacity-70" />
              </div>
            </div>

            {/* En Propiedad */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700">En Propiedad</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.enPropiedad}</p>
                </div>
                <ChartBarIcon className="w-10 h-10 text-green-600 opacity-70" />
              </div>
            </div>

            {/* Vendidos */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-700">Vendidos</p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">{stats.vendidos}</p>
                </div>
                <TagIcon className="w-10 h-10 text-orange-600 opacity-70" />
              </div>
            </div>
          </div>
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

              {/* Tipo de vehículo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Vehículo <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipo_vehiculo}
                  onChange={(e) => setFormData({ ...formData, tipo_vehiculo: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="Furgoneta Camper">🚐 Furgoneta Camper</option>
                  <option value="Autocaravana Perfilada">🚙 Autocaravana Perfilada</option>
                  <option value="Autocaravana Integral">🚌 Autocaravana Integral</option>
                  <option value="Autocaravana Capuchina">🏕️ Autocaravana Capuchina</option>
                  <option value="Camper">🚗 Camper</option>
                  <option value="Furgoneta">🚐 Furgoneta</option>
                  <option value="Otro">📦 Otro</option>
                </select>
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
                  setFormData({ matricula: '', marca: '', modelo: '', año: '', color: '', tipo_vehiculo: '' })
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
                <div className="flex-shrink-0 relative">
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
                  {/* Badge de Estado */}
                  {vehiculo.vendido && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white">
                      VENDIDO
                    </div>
                  )}
                </div>

                {/* Datos del Vehículo */}
                <div className="flex-1 text-center lg:text-left w-full lg:w-auto">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <TruckIcon className="h-6 w-6 text-primary-600" />
                    <h3 className="text-xl font-bold text-gray-900">{vehiculo.matricula}</h3>
                    {vehiculo.vendido && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full border border-orange-300">
                        <TagIcon className="w-3 h-3" />
                        Vendido
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    {/* Tipo de vehículo - 2º en importancia */}
                    {vehiculo.tipo_vehiculo && (
                      <p className="flex items-center gap-1">
                        <strong>Tipo:</strong> 
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
                          {vehiculo.tipo_vehiculo}
                        </span>
                      </p>
                    )}
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

              {/* Se eliminó el bloque de diseños por vehículo; ahora están en la sección general superior */}

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
                  onClick={() => handleDeleteClick(vehiculo)}
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

      {/* Modal de Confirmación para Eliminar */}
      {deleteModal.vehiculo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteModal({ isOpen: false, vehiculo: null })}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 -mx-6 -mt-6 px-6 py-4 rounded-t-2xl border-b-2 border-red-200 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">⚠️ Advertencia</h3>
                  <p className="text-sm text-gray-600">Eliminar vehículo permanentemente</p>
                </div>
              </div>
            </div>

            {/* Vehículo que se va a eliminar */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <TruckIcon className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="font-bold text-gray-900">{deleteModal.vehiculo.matricula}</p>
                  <p className="text-sm text-gray-600">
                    {deleteModal.vehiculo.marca} {deleteModal.vehiculo.modelo}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensaje principal */}
            <div className="space-y-4 mb-6">
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  La eliminación de un vehículo lo borrará del sistema de forma permanente e irreversible.
                </p>
                <p className="text-sm text-red-800">
                  Los reportes asociados se mantendrán, pero no estarán vinculados al vehículo.
                </p>
              </div>

              {/* Sugerencia de venta */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TagIcon className="w-5 h-5" />
                  ¿Lo has vendido?
                </p>
                <p className="text-sm text-blue-800 mb-3">
                  Si no lo quieres eliminar o ya lo has vendido, deberías <strong>añadir la venta</strong> en la gestión del vehículo. Así podrás conservar el histórico completo del mismo.
                </p>
                <Link
                  href={`/vehiculo/${deleteModal.vehiculo.id}?tab=venta`}
                  onClick={() => setDeleteModal({ isOpen: false, vehiculo: null })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <TagIcon className="w-4 h-4" />
                  Registrar Venta
                </Link>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, vehiculo: null })}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
