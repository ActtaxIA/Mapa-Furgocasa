'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  ArrowLeftIcon,
  TruckIcon,
  CurrencyEuroIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TagIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { ResumenEconomicoTab } from '@/components/vehiculo/ResumenEconomicoTab'
import { DatosCompraTab } from '@/components/vehiculo/DatosCompraTab'
import MantenimientosTab from '@/components/vehiculo/MantenimientosTab'
import AveriasTab from '@/components/vehiculo/AveriasTab'
import MejorasTab from '@/components/vehiculo/MejorasTab'
import VentaTab from '@/components/vehiculo/VentaTab'
import GastosAdicionalesTab from '@/components/vehiculo/GastosAdicionalesTab'
import { GaleriaFotosTab } from '@/components/vehiculo/GaleriaFotosTab'
import { Toast } from '@/components/ui/Toast'
import InformeValoracionIA from '@/components/vehiculo/InformeValoracionIA'
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

type TabType = 'resumen' | 'compra' | 'fotos' | 'mantenimientos' | 'averias' | 'mejoras' | 'gastos' | 'venta' | 'valoracion-ia'

export default function VehiculoPage() {
  const params = useParams()
  const router = useRouter()
  const vehiculoId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [vehiculo, setVehiculo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('resumen')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    tipo_vehiculo: '',
    marca: '',
    modelo: '',
    año: '',
    color: ''
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null)
  const [valoracionesIA, setValoracionesIA] = useState<any[]>([])
  const [loadingValoracion, setLoadingValoracion] = useState(false)
  const [generandoValoracion, setGenerandoValoracion] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Detectar parámetro tab en la URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const tabParam = searchParams.get('tab') as TabType
      if (tabParam && ['resumen', 'compra', 'fotos', 'mantenimientos', 'averias', 'mejoras', 'gastos', 'venta', 'valoracion-ia'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [vehiculoId])

  // Cargar valoraciones IA cuando se active esa tab
  useEffect(() => {
    if (activeTab === 'valoracion-ia' && vehiculoId) {
      loadValoracionesIA()
    }
  }, [activeTab, vehiculoId])

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)

      // Cargar vehículo
      const { data: vehiculoData, error } = await supabase
        .from('vehiculos_registrados')
        .select('*')
        .eq('id', vehiculoId)
        .eq('user_id', session.user.id)
        .single()

      if (error || !vehiculoData) {
        console.error('Error cargando vehículo:', error)
        router.push('/perfil')
        return
      }

      setVehiculo(vehiculoData)
      // Inicializar datos de edición
      setEditData({
        tipo_vehiculo: vehiculoData.tipo_vehiculo || '',
        marca: vehiculoData.marca || '',
        modelo: vehiculoData.modelo || '',
        año: vehiculoData.año?.toString() || '',
        color: vehiculoData.color || ''
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = () => {
    setEditData({
      tipo_vehiculo: vehiculo.tipo_vehiculo || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      año: vehiculo.año?.toString() || '',
      color: vehiculo.color || ''
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({
      tipo_vehiculo: vehiculo.tipo_vehiculo || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      año: vehiculo.año?.toString() || '',
      color: vehiculo.color || ''
    })
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      const updateData: any = {
        tipo_vehiculo: editData.tipo_vehiculo.trim() || null,
        marca: editData.marca.trim() || null,
        modelo: editData.modelo.trim() || null,
        color: editData.color.trim() || null,
      }

      // Solo añadir año si tiene valor válido
      if (editData.año && editData.año.trim() !== '') {
        const añoNum = parseInt(editData.año)
        if (!isNaN(añoNum) && añoNum >= 1900 && añoNum <= new Date().getFullYear() + 1) {
          updateData.año = añoNum
        }
      } else {
        updateData.año = null
      }

      const { error } = await supabase
        .from('vehiculos_registrados')
        .update(updateData)
        .eq('id', vehiculoId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error actualizando vehículo:', error)
        setToast({ message: 'Error al actualizar los datos del vehículo', type: 'error' })
        return
      }

      // Recargar datos
      await loadData()
      setIsEditing(false)
      setToast({ message: '✅ Datos actualizados correctamente', type: 'success' })
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: 'Error al actualizar los datos del vehículo', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const loadValoracionesIA = async () => {
    setLoadingValoracion(true)
    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/ia-valoracion`)
      const data = await response.json()

      if (response.ok) {
        setValoracionesIA(data.informes || [])
      } else {
        console.error('Error cargando valoraciones IA:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingValoracion(false)
    }
  }

  const handleGenerarValoracion = () => {
    setShowConfirmModal(true)
  }

  const confirmarGenerarValoracion = async () => {
    setShowConfirmModal(false)
    setGenerandoValoracion(true)
    setToast({ message: '🤖 Generando valoración con IA... Por favor espera.', type: 'info' })

    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/ia-valoracion`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setToast({ message: '✅ ¡Valoración generada con éxito!', type: 'success' })
        // Recargar las valoraciones
        await loadValoracionesIA()
      } else {
        setToast({ message: `❌ Error: ${data.error}`, type: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: '❌ Error al generar la valoración', type: 'error' })
    } finally {
      setGenerandoValoracion(false)
    }
  }

  const descargarValoracionPDF = async (valoracion: any) => {
    try {
      setToast({ message: "Generando PDF completo...", type: "info" })
      
      // Importar jsPDF dinámicamente
      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      let yPos = 20

      // Función para agregar nueva página si es necesario
      const checkPageBreak = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - 20) {
          pdf.addPage()
          yPos = 20
        }
      }

      // 1. HEADER CON LOGO Y TÍTULO
      pdf.setFillColor(37, 99, 235) // Azul
      pdf.rect(0, 0, pageWidth, 40, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.setFont("helvetica", "bold")
      pdf.text("Informe de Valoración IA", margin, 25)
      
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")
      pdf.text(`${vehiculo?.marca || ''} ${vehiculo?.modelo || ''}`, margin, 32)
      
      pdf.setTextColor(0, 0, 0)
      yPos = 50

      // 2. INFORMACIÓN DEL VEHÍCULO
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("Datos del Vehículo", margin, yPos)
      yPos += 8

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      const datosVehiculo = [
        `Matrícula: ${vehiculo?.matricula || 'No especificada'}`,
        `Marca: ${vehiculo?.marca || 'No especificada'}`,
        `Modelo: ${vehiculo?.modelo || 'No especificado'}`,
        `Año: ${vehiculo?.ano || 'No especificado'}`,
        `Tipo: ${vehiculo?.tipo_vehiculo || 'Autocaravana'}`,
        `Color: ${vehiculo?.color || 'No especificado'}`
      ]

      datosVehiculo.forEach((dato) => {
        pdf.text(dato, margin, yPos)
        yPos += 6
      })

      yPos += 5

      // 3. PRECIOS DESTACADOS
      checkPageBreak(30)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("Precios de Valoración", margin, yPos)
      yPos += 8

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      
      if (valoracion.precio_salida) {
        pdf.setFillColor(34, 197, 94) // Verde
        pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFont("helvetica", "bold")
        pdf.text(`Precio de Salida: ${valoracion.precio_salida.toLocaleString('es-ES')}€`, margin + 2, yPos)
        pdf.setTextColor(0, 0, 0)
        yPos += 10
      }

      if (valoracion.precio_objetivo) {
        pdf.setFillColor(59, 130, 246) // Azul
        pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFont("helvetica", "bold")
        pdf.text(`Precio Objetivo: ${valoracion.precio_objetivo.toLocaleString('es-ES')}€`, margin + 2, yPos)
        pdf.setTextColor(0, 0, 0)
        yPos += 10
      }

      if (valoracion.precio_minimo) {
        pdf.setFillColor(249, 115, 22) // Naranja
        pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFont("helvetica", "bold")
        pdf.text(`Precio Mínimo: ${valoracion.precio_minimo.toLocaleString('es-ES')}€`, margin + 2, yPos)
        pdf.setTextColor(0, 0, 0)
        yPos += 10
      }

      yPos += 5

      // 4. FOTOS DEL VEHÍCULO
      const supabase = createClient()
      const todasLasFotos: string[] = []
      if (vehiculo?.foto_url) todasLasFotos.push(vehiculo.foto_url)
      if (vehiculo?.fotos_adicionales && Array.isArray(vehiculo.fotos_adicionales)) {
        todasLasFotos.push(...vehiculo.fotos_adicionales)
      }

      if (todasLasFotos.length > 0) {
        checkPageBreak(50)
        pdf.setFontSize(14)
        pdf.setFont("helvetica", "bold")
        pdf.text("Fotografías del Vehículo", margin, yPos)
        yPos += 8

        for (let i = 0; i < Math.min(todasLasFotos.length, 5); i++) { // Máximo 5 fotos
          try {
            const fotoUrl = todasLasFotos[i]
            const { data: fotoData } = await supabase.storage
              .from('vehiculos')
              .download(fotoUrl.replace(/^.*\/vehiculos\//, ''))

            if (fotoData) {
              const fotoBlob = await fotoData.arrayBuffer()
              const fotoBase64 = btoa(String.fromCharCode(...new Uint8Array(fotoBlob)))
              
              // Procesar imagen para corregir orientación
              const img = new Image()
              const fotoCorregidaBase64 = await new Promise<string>((resolve) => {
                img.onload = () => {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    canvas.width = img.width
                    canvas.height = img.height
                    ctx.drawImage(img, 0, 0)
                    resolve(canvas.toDataURL('image/jpeg', 0.8))
                  } else {
                    resolve(`data:image/jpeg;base64,${fotoBase64}`)
                  }
                }
                img.src = `data:image/jpeg;base64,${fotoBase64}`
              })

              checkPageBreak(60)
              pdf.setFontSize(9)
              pdf.setFont("helvetica", "normal")
              pdf.text(`Fotografía ${i + 1}:`, margin, yPos)
              yPos += 5

              const maxWidth = pageWidth - 2 * margin
              const maxHeight = 60
              const imgWidth = maxWidth
              const imgHeight = maxHeight

              pdf.addImage(fotoCorregidaBase64, 'JPEG', margin, yPos, imgWidth, imgHeight)
              yPos += imgHeight + 8
            }
          } catch (error) {
            console.warn(`Error cargando foto ${i + 1}:`, error)
          }
        }
      }

      // 5. INFORME COMPLETO
      checkPageBreak(30)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("Informe de Valoración Completo", margin, yPos)
      yPos += 8

      // Convertir markdown a texto plano para PDF
      const textoPlano = valoracion.informe_texto
        .replace(/##\s+/g, '\n\n')
        .replace(/###\s+/g, '\n')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')

      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      const lines = pdf.splitTextToSize(textoPlano, pageWidth - 2 * margin)
      
      lines.forEach((line: string) => {
        checkPageBreak(6)
        pdf.text(line, margin, yPos)
        yPos += 6
      })

      // 6. FOOTER
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        pdf.text(
          `Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleDateString('es-ES')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
        pdf.text(
          'Mapa Furgocasa - www.mapafurgocasa.com',
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        )
      }

      // Descargar PDF
      const nombreArchivo = `Valoracion_${vehiculo?.matricula || 'vehiculo'}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(nombreArchivo)
      
      setToast({ message: "✅ PDF descargado correctamente", type: "success" })
    } catch (error) {
      console.error('Error generando PDF:', error)
      setToast({ message: "Error al generar el PDF", type: "error" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!vehiculo) {
    return null
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: ChartBarIcon },
    { id: 'compra', label: 'Datos de Compra', icon: CurrencyEuroIcon },
    { id: 'fotos', label: 'Fotos', icon: PhotoIcon },
    { id: 'mantenimientos', label: 'Mantenimientos', icon: WrenchScrewdriverIcon },
    { id: 'averias', label: 'Averías', icon: ExclamationTriangleIcon },
    { id: 'mejoras', label: 'Mejoras', icon: SparklesIcon },
    { id: 'gastos', label: 'Gastos Adicionales', icon: BanknotesIcon },
    { id: 'valoracion-ia', label: 'Valoración IA', icon: SparklesIconSolid },
    { id: 'venta', label: 'Venta', icon: TagIcon },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/mis-autocaravanas"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Mis Autocaravanas
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-primary-100 rounded-lg flex-shrink-0">
                  <TruckIcon className="w-8 h-8 text-primary-600" />
                </div>

                {!isEditing ? (
                  // Modo Vista
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{vehiculo.matricula}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {vehiculo.tipo_vehiculo && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200">
                          {vehiculo.tipo_vehiculo}
                        </span>
                      )}
                      <p className="text-gray-600">
                        {vehiculo.marca || 'Sin marca'} {vehiculo.modelo || 'Sin modelo'}
                        {vehiculo.año && ` • ${vehiculo.año}`}
                        {vehiculo.color && ` • ${vehiculo.color}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Modo Edición
                  <div className="flex-1 space-y-3">
                    {/* Matrícula - NO EDITABLE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Matrícula <span className="text-xs text-gray-500">(no editable)</span>
                      </label>
                      <div className="text-2xl font-bold text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        {vehiculo.matricula}
                      </div>
                    </div>

                    {/* Tipo de Vehículo - 2º en importancia */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Vehículo <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editData.tipo_vehiculo}
                        onChange={(e) => setEditData({ ...editData, tipo_vehiculo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

                    {/* Campos Editables */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                        <input
                          type="text"
                          value={editData.marca}
                          onChange={(e) => setEditData({ ...editData, marca: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Fiat, Volkswagen..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                        <input
                          type="text"
                          value={editData.modelo}
                          onChange={(e) => setEditData({ ...editData, modelo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Ducato, California..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                        <input
                          type="number"
                          value={editData.año}
                          onChange={(e) => setEditData({ ...editData, año: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: 2020"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <input
                          type="text"
                          value={editData.color}
                          onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ej: Blanco, Gris..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 flex-shrink-0">
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">Cancelar</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Advertencia sobre matrícula */}
            {isEditing && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ℹ️ <strong>Nota:</strong> La matrícula NO se puede modificar. Si necesitas cambiarla, deberás eliminar este vehículo y crear uno nuevo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex border-b border-gray-200 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const shortLabels: Record<string, string> = {
                  'Resumen': 'Resumen',
                  'Datos de Compra': 'Compra',
                  'Fotos': 'Fotos',
                  'Mantenimientos': 'Mant.',
                  'Averías': 'Averías',
                  'Mejoras': 'Mejoras',
                  'Gastos Adicionales': 'Gastos',
                  'Valoración IA': 'IA',
                  'Venta': 'Venta'
                }
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-xs sm:text-base min-w-[70px] sm:min-w-0 touch-manipulation ${
                      activeTab === tab.id
                        ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-center leading-tight font-semibold">{shortLabels[tab.label] || tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          {activeTab === 'resumen' && (
            <ResumenEconomicoTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'compra' && (
            <DatosCompraTab
              vehiculoId={vehiculoId}
              onDataSaved={() => {
                // Opcional: cambiar al tab de resumen después de guardar
                // setActiveTab('resumen')
              }}
            />
          )}

          {activeTab === 'fotos' && (
            <GaleriaFotosTab
              vehiculoId={vehiculoId}
              fotoUrl={vehiculo.foto_url}
              fotosAdicionales={vehiculo.fotos_adicionales || []}
            />
          )}

          {activeTab === 'mantenimientos' && (
            <MantenimientosTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'averias' && (
            <AveriasTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'mejoras' && (
            <MejorasTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'valoracion-ia' && (
            <div className="space-y-6">
              {/* Botón para generar nueva valoración */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <SparklesIconSolid className="w-6 h-6 text-purple-600" />
                      Valoración con Inteligencia Artificial
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Genera un informe profesional de valoración de tu vehículo utilizando IA.
                      Analizamos datos reales del mercado, el estado de tu vehículo, inversiones realizadas
                      y te proporcionamos 3 precios estratégicos: de salida, objetivo y mínimo.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Búsqueda automática de comparables en internet</li>
                      <li>✓ Análisis de depreciación por tiempo y uso</li>
                      <li>✓ Valoración de extras y mejoras instaladas</li>
                      <li>✓ Informe profesional detallado</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleGenerarValoracion}
                    disabled={generandoValoracion}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {generandoValoracion ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando...
                      </>
                    ) : (
                      <>
                        <SparklesIconSolid className="w-5 h-5" />
                        Generar Valoración
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mostrar valoraciones existentes */}
              {loadingValoracion ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando valoraciones...</p>
                </div>
              ) : valoracionesIA.length > 0 ? (
                <div className="space-y-6">
                  {valoracionesIA.map((informe) => (
                    <InformeValoracionIA
                      key={informe.id}
                      informe={informe}
                      vehiculoMarca={vehiculo.marca}
                      vehiculoModelo={vehiculo.modelo}
                      onDescargarPDF={() => descargarValoracionPDF(informe)}
                      todasLasValoraciones={valoracionesIA}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                  <SparklesIconSolid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aún no tienes valoraciones
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Genera tu primera valoración con IA para conocer el valor real de tu vehículo
                  </p>
                  <button
                    onClick={handleGenerarValoracion}
                    disabled={generandoValoracion}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <SparklesIconSolid className="w-5 h-5" />
                    Generar Primera Valoración
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'gastos' && (
            <GastosAdicionalesTab vehiculoId={vehiculoId} />
          )}

          {activeTab === 'venta' && (
            <VentaTab vehiculoId={vehiculoId} />
          )}
        </div>
      </main>

      <Footer />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Modal para Valoración IA */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="¿Generar Valoración con IA?"
        message="Esta acción generará un informe profesional de valoración utilizando IA. El proceso puede tardar unos segundos."
        confirmText="Generar"
        cancelText="Cancelar"
        onConfirm={confirmarGenerarValoracion}
        onCancel={() => setShowConfirmModal(false)}
        type="info"
      />
    </div>
  )
}
