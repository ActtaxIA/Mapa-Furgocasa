'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Loader } from '@googlemaps/js-api-loader'

// Tipos simplificados para Google Maps (se cargan dinámicamente)
type GoogleMap = any
type GoogleMarker = any
type GoogleGeocoder = any

export default function ReportePage() {
  const params = useParams()
  const router = useRouter()
  const qr_id = params.qr_id as string

  const [vehiculo, setVehiculo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number; direccion?: string } | null>(null)
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false)
  const [mapa, setMapa] = useState<GoogleMap | null>(null)
  const [mapaCargado, setMapaCargado] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    matricula_tercero: '',
    descripcion_tercero: '',
    testigo_nombre: '',
    testigo_email: '',
    testigo_telefono: '',
    descripcion: '',
    tipo_dano: '' as 'Rayón' | 'Abolladura' | 'Choque' | 'Rotura' | 'Otro' | '',
    fecha_accidente: new Date().toISOString().slice(0, 16),
    ubicacion_descripcion: '',
    fotos: [] as File[]
  })

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (qr_id) {
      cargarVehiculo()
    }
  }, [qr_id])

  useEffect(() => {
    if (ubicacion && !mapaCargado && !mapa) {
      inicializarMapa()
    }
  }, [ubicacion, mapaCargado, mapa])

  const cargarVehiculo = async () => {
    try {
      const response = await fetch(`/api/vehiculos/buscar-qr?qr_id=${qr_id}`)
      const data = await response.json()

      if (response.ok && data.existe) {
        setVehiculo(data.vehiculo)
      } else {
        setMessage({ type: 'error', text: 'Código QR no válido o vehículo no encontrado' })
      }
    } catch (error) {
      console.error('Error cargando vehículo:', error)
      setMessage({ type: 'error', text: 'Error al cargar información del vehículo' })
    } finally {
      setLoading(false)
    }
  }

  const obtenerUbicacion = () => {
    setObteniendoUbicacion(true)

    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Tu navegador no soporta geolocalización' })
      setObteniendoUbicacion(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Geocoding reverso para obtener dirección
        try {
          const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
            version: 'weekly'
          })

          await loader.load()
          const google = (window as any).google
          const geocoder = new google.maps.Geocoder()

          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              setUbicacion({
                lat,
                lng,
                direccion: results[0].formatted_address
              })
            } else {
              setUbicacion({ lat, lng })
            }
            setObteniendoUbicacion(false)
          })
        } catch (error) {
          console.error('Error en geocoding:', error)
          setUbicacion({ lat, lng })
          setObteniendoUbicacion(false)
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error)
        setMessage({ type: 'error', text: 'No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación.' })
        setObteniendoUbicacion(false)
      }
    )
  }

  const inicializarMapa = async () => {
    if (!ubicacion || mapaCargado || mapa) return

    try {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly'
      })

      await loader.load()

      const mapElement = document.getElementById('mapa-ubicacion')
      if (!mapElement || mapa) return

      const google = (window as any).google
      const newMap = new google.maps.Map(mapElement, {
        center: { lat: ubicacion.lat, lng: ubicacion.lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false
      })

      // Marcador en la ubicación (arrastrable)
      const marker = new google.maps.Marker({
        position: { lat: ubicacion.lat, lng: ubicacion.lng },
        map: newMap,
        title: 'Ubicación del accidente',
        draggable: true
      })

      // Actualizar ubicación cuando se arrastra el marcador
      marker.addListener('dragend', (e: any) => {
        if (e.latLng) {
          const newLat = e.latLng.lat()
          const newLng = e.latLng.lng()
          // Hacer geocoding reverso de la nueva ubicación
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              setUbicacion({
                lat: newLat,
                lng: newLng,
                direccion: results[0].formatted_address
              })
            } else {
              setUbicacion({ lat: newLat, lng: newLng, direccion: ubicacion.direccion })
            }
          })
        }
      })

      // También permitir hacer clic en el mapa
      newMap.addListener('click', (e: any) => {
        if (e.latLng) {
          const newLat = e.latLng.lat()
          const newLng = e.latLng.lng()
          marker.setPosition({ lat: newLat, lng: newLng })
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              setUbicacion({
                lat: newLat,
                lng: newLng,
                direccion: results[0].formatted_address
              })
            } else {
              setUbicacion({ lat: newLat, lng: newLng, direccion: ubicacion.direccion })
            }
          })
        }
      })

      setMapa(newMap)
      setMapaCargado(true)
    } catch (error) {
      console.error('Error inicializando mapa:', error)
      setMessage({ type: 'error', text: 'Error al cargar el mapa. Por favor, recarga la página.' })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData({ ...formData, fotos: files })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    // Validaciones
    if (!formData.testigo_nombre.trim()) {
      setMessage({ type: 'error', text: 'El nombre del testigo es obligatorio' })
      setSubmitting(false)
      return
    }

    if (!formData.descripcion.trim()) {
      setMessage({ type: 'error', text: 'La descripción del accidente es obligatoria' })
      setSubmitting(false)
      return
    }

    if (!ubicacion) {
      setMessage({ type: 'error', text: 'Debes obtener tu ubicación primero' })
      setSubmitting(false)
      return
    }

    try {
      // Subir fotos a Supabase Storage (si hay)
      const fotos_urls: string[] = []

      // Por ahora, las fotos se pueden manejar después
      // TODO: Implementar subida de fotos a Supabase Storage

      const response = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code_id: qr_id,
          matricula_tercero: formData.matricula_tercero || null,
          descripcion_tercero: formData.descripcion_tercero || null,
          testigo_nombre: formData.testigo_nombre.trim(),
          testigo_email: formData.testigo_email.trim() || null,
          testigo_telefono: formData.testigo_telefono.trim() || null,
          descripcion: formData.descripcion.trim(),
          tipo_dano: formData.tipo_dano || null,
          ubicacion_lat: ubicacion.lat,
          ubicacion_lng: ubicacion.lng,
          ubicacion_direccion: ubicacion.direccion || null,
          ubicacion_descripcion: formData.ubicacion_descripcion.trim() || null,
          fecha_accidente: new Date(formData.fecha_accidente).toISOString(),
          fotos_urls
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Reporte enviado correctamente. El propietario ha sido notificado.' })

        // Limpiar formulario
        setFormData({
          matricula_tercero: '',
          descripcion_tercero: '',
          testigo_nombre: '',
          testigo_email: '',
          testigo_telefono: '',
          descripcion: '',
          tipo_dano: '',
          fecha_accidente: new Date().toISOString().slice(0, 16),
          ubicacion_descripcion: '',
          fotos: []
        })
        setUbicacion(null)
        setMapaCargado(false)

        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al enviar reporte' })
      }
    } catch (error) {
      console.error('Error enviando reporte:', error)
      setMessage({ type: 'error', text: 'Error al enviar reporte' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!vehiculo) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Código QR no válido</h2>
            <p className="mt-2 text-gray-600">El código QR escaneado no corresponde a ningún vehículo registrado.</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportar Accidente</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Vehículo afectado: <strong>{vehiculo.matricula}</strong>
                  {vehiculo.marca && ` - ${vehiculo.marca}`}
                  {vehiculo.modelo && ` ${vehiculo.modelo}`}
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de alerta/éxito */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6 border border-gray-200">
            {/* Datos del testigo */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tus Datos (Testigo)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.testigo_nombre}
                    onChange={(e) => setFormData({ ...formData, testigo_nombre: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.testigo_email}
                    onChange={(e) => setFormData({ ...formData, testigo_email: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="tu@email.com"
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                    title="Introduce un email válido"
                  />
                  <p className="mt-1 text-xs text-gray-500">Opcional, pero recomendado para que el propietario pueda contactarte</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.testigo_telefono}
                    onChange={(e) => setFormData({ ...formData, testigo_telefono: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="+34 666 777 888"
                  />
                  <p className="mt-1 text-xs text-gray-500">Opcional, pero recomendado para que el propietario pueda contactarte</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha y Hora del Accidente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_accidente}
                    onChange={(e) => setFormData({ ...formData, fecha_accidente: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicación del Accidente</h2>
              {!ubicacion ? (
                <button
                  type="button"
                  onClick={obtenerUbicacion}
                  disabled={obteniendoUbicacion}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  {obteniendoUbicacion ? 'Obteniendo ubicación...' : 'Obtener Mi Ubicación'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Ubicación obtenida:</strong> {ubicacion.direccion || `${ubicacion.lat}, ${ubicacion.lng}`}
                    </p>
                  </div>
                  <div id="mapa-ubicacion" className="w-full h-64 rounded-lg border border-gray-300"></div>
                  <input
                    type="text"
                    value={formData.ubicacion_descripcion}
                    onChange={(e) => setFormData({ ...formData, ubicacion_descripcion: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Descripción adicional del lugar (opcional)"
                  />
                </div>
              )}
            </div>

            {/* Vehículo causante */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehículo que Causó el Daño</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Matrícula</label>
                  <input
                    type="text"
                    value={formData.matricula_tercero}
                    onChange={(e) => setFormData({ ...formData, matricula_tercero: e.target.value.toUpperCase() })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="1234ABC"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <input
                    type="text"
                    value={formData.descripcion_tercero}
                    onChange={(e) => setFormData({ ...formData, descripcion_tercero: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Marca, color, modelo..."
                  />
                </div>
              </div>
            </div>

            {/* Descripción del accidente */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Accidente</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Daño</label>
                  <select
                    value={formData.tipo_dano}
                    onChange={(e) => setFormData({ ...formData, tipo_dano: e.target.value as any })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Rayón">Rayón</option>
                    <option value="Abolladura">Abolladura</option>
                    <option value="Choque">Choque</option>
                    <option value="Rotura">Rotura</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción Detallada <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Describe qué ocurrió, cómo sucedió el accidente..."
                  />
                </div>
              </div>
            </div>

            {/* Fotos */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fotos del Accidente (Opcional)</h2>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {formData.fotos.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {formData.fotos.length} foto(s) seleccionada(s)
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !ubicacion}
                className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
