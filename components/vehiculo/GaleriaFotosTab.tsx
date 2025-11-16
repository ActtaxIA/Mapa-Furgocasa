'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline'
import { Toast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface Props {
  vehiculoId: string
  fotoUrl: string | null
  fotosAdicionales: string[]
}

export function GaleriaFotosTab({ vehiculoId, fotoUrl, fotosAdicionales }: Props) {
  const [fotos, setFotos] = useState<string[]>([])
  const [subiendo, setSubiendo] = useState(false)
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  useEffect(() => {
    cargarFotos()
  }, [fotoUrl, fotosAdicionales])

  const cargarFotos = () => {
    const todasLasFotos: string[] = []
    if (fotoUrl) todasLasFotos.push(fotoUrl)
    if (fotosAdicionales && fotosAdicionales.length > 0) {
      todasLasFotos.push(...fotosAdicionales)
    }
    setFotos(todasLasFotos)
  }

  const handleSubirFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validar cantidad total (máximo 10 fotos totales)
    const espacioDisponible = 10 - fotos.length
    if (files.length > espacioDisponible) {
      setToast({ message: `Solo puedes añadir ${espacioDisponible} foto(s) más. Máximo 10 fotos por vehículo.`, type: 'error' })
      e.target.value = ''
      return
    }

    // Validar tamaño de cada foto (10MB)
    const fotosGrandes = files.filter((f: any) => f.size > 10 * 1024 * 1024)
    if (fotosGrandes.length > 0) {
      const nombres = fotosGrandes.map((f: any) => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`).join(', ')
      setToast({ message: `Estas fotos exceden 10 MB: ${nombres}`, type: 'error' })
      e.target.value = ''
      return
    }

    setSubiendo(true)
    setToast({ message: `Subiendo ${files.length} foto(s)...`, type: 'info' })

    try {
      const supabase = createClient()
      const fotosSubidas: string[] = []
      const errores: string[] = []

      // Subir cada foto individualmente
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const timestamp = Date.now() + i // Añadir índice para evitar colisiones
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `vehiculos/${vehiculoId}/adicionales/${timestamp}.${fileExt}`

        console.log(`📸 [${i + 1}/${files.length}] Subiendo ${file.name}...`)

        // Subir a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('vehiculos')
          .upload(fileName, file, {
            contentType: file.type || 'image/jpeg',
            upsert: false
          })

        if (uploadError) {
          console.error(`❌ Error subiendo ${file.name}:`, uploadError)
          errores.push(file.name)
          continue
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('vehiculos')
          .getPublicUrl(fileName)

        console.log(`✅ ${file.name} subida: ${publicUrl}`)

        // Enviar URL al backend
        const response = await fetch(`/api/vehiculos/${vehiculoId}/fotos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ foto_url: publicUrl })
        })

        if (response.ok) {
          fotosSubidas.push(file.name)
        } else {
          const data = await response.json()
          console.error(`Error del servidor para ${file.name}:`, data)
          errores.push(file.name)
        }
      }

      // Mostrar resultados
      if (fotosSubidas.length > 0 && errores.length === 0) {
        setToast({ message: `¡${fotosSubidas.length} foto(s) subida(s) con éxito!`, type: 'success' })
        setTimeout(() => window.location.reload(), 1000)
      } else if (fotosSubidas.length > 0 && errores.length > 0) {
        setToast({ 
          message: `${fotosSubidas.length} foto(s) subida(s). ${errores.length} fallaron: ${errores.join(', ')}`, 
          type: 'info' 
        })
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setToast({ message: `Error al subir todas las fotos: ${errores.join(', ')}`, type: 'error' })
      }
    } catch (error) {
      console.error('Error general:', error)
      setToast({ message: `Error de red: ${error}`, type: 'error' })
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  const handleEliminarFoto = async (fotoUrl: string, esFotoPrincipal: boolean) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Foto',
      message: esFotoPrincipal
        ? '¿Estás seguro de eliminar la foto principal del vehículo?'
        : '¿Estás seguro de eliminar esta foto?',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/vehiculos/${vehiculoId}/fotos`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fotoUrl, esFotoPrincipal })
          })

          const data = await response.json()

          if (response.ok) {
            setToast({ message: 'Foto eliminada con éxito', type: 'success' })
            cargarFotos()
            // Recargar para actualizar desde el servidor
            setTimeout(() => window.location.reload(), 1000)
          } else {
            setToast({ message: data.error || 'Error al eliminar foto', type: 'error' })
          }
        } catch (error) {
          console.error('Error eliminando foto:', error)
          setToast({ message: 'Error al eliminar foto', type: 'error' })
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false })
        }
      }
    })
  }

  const handleEstablecerComoPrincipal = async (fotoUrl: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Establecer como Foto Principal',
      message: '¿Quieres establecer esta foto como la imagen principal del vehículo?',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/vehiculos/${vehiculoId}/fotos/principal`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fotoUrl })
          })

          const data = await response.json()

          if (response.ok) {
            setToast({ message: 'Foto principal actualizada', type: 'success' })
            setTimeout(() => window.location.reload(), 1000)
          } else {
            setToast({ message: data.error || 'Error al actualizar', type: 'error' })
          }
        } catch (error) {
          console.error('Error:', error)
          setToast({ message: 'Error al actualizar foto principal', type: 'error' })
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false })
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de subida */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Galería de Fotos</h3>
          <p className="text-sm text-gray-600">
            {fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'} - Máximo 10 fotos por vehículo
          </p>
        </div>

        {fotos.length < 10 && (
          <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition-colors disabled:opacity-50">
            <PlusIcon className="w-5 h-5 mr-2" />
            {subiendo ? 'Subiendo...' : 'Añadir Fotos'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleSubirFotos}
              disabled={subiendo}
            />
          </label>
        )}
      </div>

      {/* Grid de fotos */}
      {fotos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No hay fotos</h3>
          <p className="text-sm text-gray-500 mb-4">
            Sube fotos de tu vehículo para verlas aquí
          </p>
          <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Subir Fotos
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleSubirFotos}
              disabled={subiendo}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotos.map((foto, index) => {
            const esFotoPrincipal = index === 0 && foto === fotoUrl
            return (
              <div
                key={foto}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-all"
              >
                {/* Imagen */}
                <img
                  src={foto}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Badge de foto principal */}
                {esFotoPrincipal && (
                  <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Principal
                  </div>
                )}

                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {/* Ver ampliada */}
                  <button
                    onClick={() => setFotoAmpliada(foto)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Ver ampliada"
                  >
                    <ArrowsPointingOutIcon className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Establecer como principal (solo si no es la principal) */}
                  {!esFotoPrincipal && (
                    <button
                      onClick={() => handleEstablecerComoPrincipal(foto)}
                      className="p-2 bg-white rounded-full hover:bg-primary-100 transition-colors"
                      title="Establecer como principal"
                    >
                      <PhotoIcon className="w-5 h-5 text-primary-600" />
                    </button>
                  )}

                  {/* Eliminar */}
                  <button
                    onClick={() => handleEliminarFoto(foto, esFotoPrincipal)}
                    className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
                    title="Eliminar foto"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de foto ampliada */}
      {fotoAmpliada && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          <button
            onClick={() => setFotoAmpliada(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-900" />
          </button>
          <img
            src={fotoAmpliada}
            alt="Foto ampliada"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Toast */}
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
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  )
}
