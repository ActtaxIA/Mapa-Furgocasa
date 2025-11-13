'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ReporteCompletoUsuario } from '@/types/reportes.types'
import { Toast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import jsPDF from 'jspdf'

interface Props {
  userId: string
  onReporteUpdate?: () => void
}

export function MisReportesTab({ userId, onReporteUpdate }: Props) {
  const [reportes, setReportes] = useState<ReporteCompletoUsuario[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; reporteId: string | null }>({ isOpen: false, reporteId: null })

  useEffect(() => {
    loadReportes()
  }, [userId])

  const loadReportes = async () => {
    try {
      const response = await fetch('/api/reportes')
      const data = await response.json()

      if (response.ok) {
        console.log('📥 Reportes recibidos del API:', data.reportes)

        // Mapear reporte_id a id para compatibilidad con el tipo ReporteCompletoUsuario
        const reportesMapeados = (data.reportes || []).map((r: any) => {
          const mapeado = {
            ...r,
            id: r.reporte_id || r.id,
            vehiculo_afectado_id: r.vehiculo_id || r.vehiculo_afectado_id
          }
          console.log('🔄 Reporte mapeado:', {
            original_reporte_id: r.reporte_id,
            original_id: r.id,
            final_id: mapeado.id
          })
          return mapeado
        })

        console.log('✅ Reportes mapeados finales:', reportesMapeados)
        setReportes(reportesMapeados)
      } else {
        console.error('Error cargando reportes:', data.error)
      }
    } catch (error) {
      console.error('Error cargando reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarLeido = async (reporteId: string) => {
    console.log('🔵 handleMarcarLeido llamado con ID:', reporteId)

    if (!reporteId || reporteId === 'undefined') {
      console.error('❌ ERROR: reporteId es undefined o inválido')
      setToast({ message: 'Error: ID de reporte inválido. Por favor, recarga la página.', type: 'error' })
      return
    }

    setUpdating(true)
    try {
      const url = `/api/reportes/${reporteId}`
      console.log('📤 Haciendo PATCH a:', url)

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leido: true })
      })

      if (response.ok) {
        console.log('✅ Reporte marcado como leído exitosamente')
        setToast({ message: '✅ Reporte marcado como leído', type: 'success' })
        loadReportes()
        // Llamar al callback para actualizar contadores en la página padre
        if (onReporteUpdate) onReporteUpdate()
      } else {
        const data = await response.json()
        console.error('❌ Error marcando como leído:', data.error)
        setToast({ message: `Error: ${data.error}`, type: 'error' })
      }
    } catch (error) {
      console.error('❌ Excepción en handleMarcarLeido:', error)
      setToast({ message: 'Error al marcar como leído. Por favor, intenta de nuevo.', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const handleCerrarReporte = async (reporteId: string) => {
    setConfirmModal({ isOpen: true, reporteId })
  }

  const confirmCerrarReporte = async () => {
    const reporteId = confirmModal.reporteId
    setConfirmModal({ isOpen: false, reporteId: null })

    if (!reporteId) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/reportes/${reporteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cerrado: true, leido: true })
      })

      if (response.ok) {
        setToast({ message: '✅ Reporte cerrado correctamente', type: 'success' })
        loadReportes()
        // Llamar al callback para actualizar contadores en la página padre
        if (onReporteUpdate) onReporteUpdate()
      } else {
        const data = await response.json()
        console.error('Error cerrando reporte:', data.error)
        setToast({ message: `Error: ${data.error}`, type: 'error' })
      }
    } catch (error) {
      console.error('Error cerrando reporte:', error)
      setToast({ message: 'Error al cerrar el reporte. Por favor, intenta de nuevo.', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const getTipoDanoColor = (tipo?: string) => {
    switch (tipo) {
      case 'Choque': return 'bg-red-100 text-red-800'
      case 'Rotura': return 'bg-red-100 text-red-800'
      case 'Abolladura': return 'bg-orange-100 text-orange-800'
      case 'Rayón': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const descargarReportePDF = async (reporte: ReporteCompletoUsuario) => {
    try {
      setToast({ message: '📄 Generando PDF completo...', type: 'info' })
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      let yPos = 20

      // ============================================================
      // PÁGINA 1: INFORMACIÓN GENERAL
      // ============================================================

      // Header
      pdf.setFillColor(239, 68, 68)
      pdf.rect(0, 0, pageWidth, 40, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('REPORTE DE ACCIDENTE', pageWidth / 2, 18, { align: 'center' })
      pdf.setFontSize(12)
      pdf.text('Mapa Furgocasa - Documento Oficial', pageWidth / 2, 28, { align: 'center' })

      yPos = 50

      // ID y Fecha de reporte (destacado)
      pdf.setFillColor(249, 250, 251)
      pdf.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 18, 2, 2, 'F')
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`ID Reporte: ${reporte.id}`, margin + 3, yPos)
      pdf.text(`Generado: ${new Date().toLocaleString('es-ES')}`, pageWidth - margin - 3, yPos, { align: 'right' })
      pdf.text(`Reportado el: ${new Date(reporte.created_at).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}`, margin + 3, yPos + 7)
      yPos += 25

      // Información del vehículo
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('🚐 Vehículo Afectado', margin, yPos)
      yPos += 8

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Matrícula: ${reporte.vehiculo_matricula}`, margin, yPos)
      yPos += 6
      if (reporte.vehiculo_marca || reporte.vehiculo_modelo) {
        pdf.text(`Vehículo: ${reporte.vehiculo_marca || 'N/A'} ${reporte.vehiculo_modelo || 'N/A'}`, margin, yPos)
        yPos += 6
      }
      yPos += 3

      // Tipo de daño
      if (reporte.tipo_dano) {
        pdf.setFillColor(254, 243, 199)
        pdf.roundedRect(margin, yPos - 3, 60, 10, 2, 2, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.text(`Tipo: ${reporte.tipo_dano}`, margin + 2, yPos + 3)
        yPos += 12
      }

      // Descripción del accidente
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('📝 Descripción del Accidente', margin, yPos)
      yPos += 7

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      const descripcionLines = pdf.splitTextToSize(reporte.descripcion, pageWidth - 2 * margin)
      pdf.text(descripcionLines, margin, yPos)
      yPos += descripcionLines.length * 5 + 8

      // Vehículo causante (si existe)
      if (reporte.matricula_tercero) {
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(14)
        pdf.text('🚗 Vehículo Causante', margin, yPos)
        yPos += 7

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        pdf.text(`Matrícula: ${reporte.matricula_tercero}`, margin, yPos)
        yPos += 5

        if (reporte.descripcion_tercero) {
          const terceroLines = pdf.splitTextToSize(reporte.descripcion_tercero, pageWidth - 2 * margin)
          pdf.text(terceroLines, margin, yPos)
          yPos += terceroLines.length * 5 + 5
        }
        yPos += 3
      }

      // Datos del testigo
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('👤 Datos del Testigo', margin, yPos)
      yPos += 7

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      
      if (!reporte.es_anonimo) {
        pdf.text(`Nombre: ${reporte.testigo_nombre}`, margin, yPos)
        yPos += 5
        if (reporte.testigo_email) {
          pdf.text(`Email: ${reporte.testigo_email}`, margin, yPos)
          yPos += 5
        }
        if (reporte.testigo_telefono) {
          pdf.text(`Teléfono: ${reporte.testigo_telefono}`, margin, yPos)
          yPos += 5
        }
      } else {
        pdf.setFont('helvetica', 'italic')
        pdf.setTextColor(100, 100, 100)
        pdf.text('(Reporte anónimo - El testigo ha elegido no compartir sus datos)', margin, yPos)
        pdf.setTextColor(0, 0, 0)
        yPos += 5
      }
      yPos += 5

      // Fecha del accidente
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('📅 Fecha del Accidente', margin, yPos)
      yPos += 7

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text(new Date(reporte.fecha_accidente).toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short'
      }), margin, yPos)
      yPos += 10

      // Ubicación - MEJORADO con mapa
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('📍 Ubicación del Accidente', margin, yPos)
      yPos += 7

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      
      if (reporte.ubicacion_descripcion) {
        pdf.setFont('helvetica', 'bold')
        pdf.text('Dirección:', margin, yPos)
        pdf.setFont('helvetica', 'normal')
        yPos += 5
        const ubicacionLines = pdf.splitTextToSize(reporte.ubicacion_descripcion, pageWidth - 2 * margin)
        pdf.text(ubicacionLines, margin, yPos)
        yPos += ubicacionLines.length * 5 + 3
      }
      
      pdf.setFont('helvetica', 'bold')
      pdf.text('Coordenadas GPS:', margin, yPos)
      pdf.setFont('helvetica', 'normal')
      yPos += 5
      pdf.text(`Latitud: ${reporte.ubicacion_lat}`, margin + 5, yPos)
      yPos += 4
      pdf.text(`Longitud: ${reporte.ubicacion_lng}`, margin + 5, yPos)
      yPos += 8

      // Insertar mapa estático de Google Maps
      try {
        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${reporte.ubicacion_lat},${reporte.ubicacion_lng}&zoom=15&size=600x300&markers=color:red%7C${reporte.ubicacion_lat},${reporte.ubicacion_lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        
        // Cargar imagen del mapa
        const mapImg = await fetch(mapUrl)
        const mapBlob = await mapImg.blob()
        const mapBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(mapBlob)
        })

        if (yPos + 60 > pageHeight - 20) {
          pdf.addPage()
          yPos = 20
        }

        pdf.addImage(mapBase64, 'PNG', margin, yPos, pageWidth - 2 * margin, 60)
        yPos += 65
        
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.text('Ubicación exacta del accidente visualizada en Google Maps', margin, yPos)
        pdf.setTextColor(0, 0, 0)
        yPos += 8
      } catch (mapError) {
        console.warn('No se pudo cargar el mapa:', mapError)
        pdf.setFontSize(9)
        pdf.setTextColor(150, 150, 150)
        pdf.text('(Mapa no disponible - Usar coordenadas GPS para localización)', margin, yPos)
        pdf.setTextColor(0, 0, 0)
        yPos += 8
      }

      // ============================================================
      // PÁGINA 2: EVIDENCIAS FOTOGRÁFICAS
      // ============================================================
      
      if (reporte.fotos_urls && reporte.fotos_urls.length > 0) {
        pdf.addPage()
        yPos = 20

        // Header de evidencias
        pdf.setFillColor(59, 130, 246)
        pdf.rect(0, 0, pageWidth, 30, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text('📸 EVIDENCIAS FOTOGRÁFICAS', pageWidth / 2, 18, { align: 'center' })

        yPos = 40

        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Total de fotografías: ${reporte.fotos_urls.length}`, margin, yPos)
        yPos += 10

        // Insertar fotos (máximo 4 por página)
        for (let i = 0; i < reporte.fotos_urls.length; i++) {
          try {
            const fotoUrl = reporte.fotos_urls[i]
            const fotoResponse = await fetch(fotoUrl)
            const fotoBlob = await fotoResponse.blob()
            const fotoBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(fotoBlob)
            })

            // Si no cabe en la página, crear nueva
            if (yPos + 70 > pageHeight - 20) {
              pdf.addPage()
              yPos = 20
            }

            // Título de la foto
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(10)
            pdf.text(`Fotografía ${i + 1}:`, margin, yPos)
            yPos += 5

            // Insertar imagen (ocupa 80% del ancho)
            const imgWidth = pageWidth - 2 * margin
            const imgHeight = 60
            pdf.addImage(fotoBase64, 'JPEG', margin, yPos, imgWidth, imgHeight)
            yPos += imgHeight + 8

          } catch (fotoError) {
            console.warn(`No se pudo cargar la foto ${i + 1}:`, fotoError)
            pdf.setFontSize(9)
            pdf.setTextColor(150, 150, 150)
            pdf.text(`Foto ${i + 1}: Error al cargar imagen`, margin, yPos)
            pdf.setTextColor(0, 0, 0)
            yPos += 8
          }
        }
      }

      // Footer en todas las páginas
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setTextColor(150, 150, 150)
        pdf.setFontSize(8)
        pdf.text('Documento generado por Mapa Furgocasa · www.mapafurgocasa.com', pageWidth / 2, pageHeight - 10, { align: 'center' })
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 6, { align: 'center' })
      }

      // Descargar
      pdf.save(`Reporte-Accidente-${reporte.vehiculo_matricula}-${new Date(reporte.fecha_accidente).toISOString().slice(0, 10)}.pdf`)
      
      setToast({ message: '✅ PDF completo descargado correctamente', type: 'success' })
    } catch (error) {
      console.error('Error generando PDF:', error)
      setToast({ message: '❌ Error al generar el PDF', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (reportes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes reportes de accidentes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Cuando alguien reporte un accidente usando tu código QR, aparecerá aquí
        </p>
      </div>
    )
  }

  const reportesNoLeidos = reportes.filter(r => !r.leido).length
  const reportesPendientes = reportes.filter(r => !r.cerrado).length

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-primary-500">
          <div className="text-sm font-medium text-gray-600">Total Reportes</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{reportes.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <div className="text-sm font-medium text-gray-600">No Leídos</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{reportesNoLeidos}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-600">Pendientes</div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">{reportesPendientes}</div>
        </div>
      </div>

      {/* Lista de reportes */}
      <div className="space-y-4">
        {reportes.map((reporte) => (
          <div
            key={reporte.id}
            className={`bg-white rounded-xl shadow border-2 transition-shadow hover:shadow-lg ${
              !reporte.leido ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className={`h-6 w-6 ${
                      reporte.cerrado ? 'text-green-500' : !reporte.leido ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Reporte de Accidente - {reporte.vehiculo_matricula}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {reporte.vehiculo_marca && `${reporte.vehiculo_marca} `}
                        {reporte.vehiculo_modelo && reporte.vehiculo_modelo}
                      </p>
                    </div>
                  </div>

                  {/* Tipo de daño */}
                  {reporte.tipo_dano && (
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTipoDanoColor(reporte.tipo_dano)}`}>
                        {reporte.tipo_dano}
                      </span>
                    </div>
                  )}

                  {/* Descripción */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-900">Descripción del Accidente:</h4>
                    <p className="mt-1 text-sm text-gray-700">{reporte.descripcion}</p>
                  </div>

                  {/* Información del tercero */}
                  {reporte.matricula_tercero && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900">Vehículo Causante:</h4>
                      <p className="mt-1 text-sm">
                        <strong>Matrícula:</strong> {reporte.matricula_tercero}
                      </p>
                      {reporte.descripcion_tercero && (
                        <p className="mt-1 text-sm">{reporte.descripcion_tercero}</p>
                      )}
                    </div>
                  )}

                  {/* Información del testigo */}
                  {reporte.es_anonimo ? (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span>🎭</span>
                        Datos del Testigo:
                      </h4>
                      <div className="text-sm">
                        <p className="text-purple-700 italic">
                          <strong>Reporte anónimo:</strong> El testigo ha elegido mantener su identidad privada.
                          Solo puedes ver la información del accidente.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Datos del Testigo:</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Nombre:</strong> {reporte.testigo_nombre}</p>
                        {reporte.testigo_email && (
                          <p className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            <a href={`mailto:${reporte.testigo_email}`} className="text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                              {reporte.testigo_email}
                            </a>
                          </p>
                        )}
                        {reporte.testigo_telefono && (
                          <p className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            <a href={`tel:${reporte.testigo_telefono}`} className="text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                              {reporte.testigo_telefono}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ubicación y fecha */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Ubicación:</p>
                        <p className="text-gray-600">
                          {reporte.ubicacion_direccion || `${reporte.ubicacion_lat}, ${reporte.ubicacion_lng}`}
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${reporte.ubicacion_lat},${reporte.ubicacion_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 hover:underline text-xs transition-colors"
                        >
                          Ver en Google Maps
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Fecha del Accidente:</p>
                        <p className="text-gray-600">
                          {new Date(reporte.fecha_accidente).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fotos */}
                  {reporte.fotos_urls && reporte.fotos_urls.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Fotos del Accidente:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {reporte.fotos_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={url}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-24 object-cover rounded border hover:opacity-75"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estados */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!reporte.leido && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        No Leído
                      </span>
                    )}
                    {reporte.leido && !reporte.cerrado && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    )}
                    {reporte.cerrado && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Cerrado
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Reportado: {new Date(reporte.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 flex flex-wrap gap-3">
                {/* Botón de descargar PDF (siempre visible) */}
                <button
                  onClick={() => descargarReportePDF(reporte)}
                  className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Descargar PDF
                </button>

                {!reporte.cerrado && (
                  <>
                    {!reporte.leido && (
                      <button
                        onClick={() => handleMarcarLeido(reporte.id)}
                        disabled={updating}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Marcar como Leído
                      </button>
                    )}
                    <button
                      onClick={() => handleCerrarReporte(reporte.id)}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Cerrar Reporte
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Cerrar Reporte"
        message="¿Estás seguro de que deseas marcar este reporte como cerrado? Esta acción lo archivará y ya no aparecerá en reportes pendientes."
        confirmText="Sí, cerrar"
        cancelText="Cancelar"
        onConfirm={confirmCerrarReporte}
        onCancel={() => setConfirmModal({ isOpen: false, reporteId: null })}
        type="warning"
      />
    </div>
  )
}
