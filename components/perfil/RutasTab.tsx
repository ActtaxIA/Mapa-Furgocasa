'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Ruta } from '@/types/database.types'
import { 
  MapIcon, 
  TrashIcon, 
  StarIcon as StarSolid,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/solid'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'

interface Props {
  userId: string
}

export function RutasTab({ userId }: Props) {
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    loadRutas()
  }, [userId])

  const loadRutas = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('rutas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRutas(data || [])
    } catch (error) {
      console.error('Error cargando rutas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (rutaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta ruta?')) return

    setDeleting(rutaId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('rutas')
        .delete()
        .eq('id', rutaId)

      if (error) throw error
      setRutas(rutas.filter(r => r.id !== rutaId))
    } catch (error) {
      console.error('Error eliminando ruta:', error)
      alert('Error al eliminar la ruta')
    } finally {
      setDeleting(null)
    }
  }

  const toggleFavorito = async (rutaId: string, currentFavorito: boolean) => {
    setToggling(rutaId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('rutas')
        .update({ favorito: !currentFavorito })
        .eq('id', rutaId)

      if (error) throw error
      setRutas(rutas.map(r => 
        r.id === rutaId ? { ...r, favorito: !currentFavorito } : r
      ))
    } catch (error) {
      console.error('Error actualizando favorito:', error)
    } finally {
      setToggling(null)
    }
  }

  const formatDuracion = (minutos: number | null) => {
    if (!minutos) return 'N/A'
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    if (horas > 0) {
      return `${horas}h ${mins}min`
    }
    return `${mins}min`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Cargando rutas...</p>
        </div>
      </div>
    )
  }

  if (rutas.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No has guardado ninguna ruta aún</p>
        <p className="text-sm text-gray-500 mb-4">
          Crea rutas desde el planificador y guárdalas para acceder más tarde
        </p>
        <Link
          href="/ruta"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <MapIcon className="w-5 h-5" />
          Ir al Planificador
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Mis Rutas ({rutas.length})
        </h3>
        <Link
          href="/ruta"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
        >
          <MapIcon className="w-4 h-4" />
          Nueva Ruta
        </Link>
      </div>

      {/* Lista de rutas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rutas.map((ruta) => {
          const origen = ruta.origen as any
          const destino = ruta.destino as any
          const paradas = (ruta.paradas as any[]) || []

          return (
            <div
              key={ruta.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg mb-1">
                    {ruta.nombre}
                  </h4>
                  {ruta.descripcion && (
                    <p className="text-sm text-gray-600">{ruta.descripcion}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => toggleFavorito(ruta.id, ruta.favorito)}
                    disabled={toggling === ruta.id}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title={ruta.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  >
                    {ruta.favorito ? (
                      <StarSolid className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <StarOutline className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(ruta.id)}
                    disabled={deleting === ruta.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar ruta"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Información de la ruta */}
              <div className="space-y-3">
                {/* Origen */}
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold">A</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{origen?.nombre || 'Origen'}</p>
                    <p className="text-gray-600 text-xs">
                      {origen?.latitud?.toFixed(4)}, {origen?.longitud?.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Paradas */}
                {paradas.length > 0 && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-2">
                    {paradas.map((parada: any, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-600">{parada.nombre}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Destino */}
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 font-bold">B</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{destino?.nombre || 'Destino'}</p>
                    <p className="text-gray-600 text-xs">
                      {destino?.latitud?.toFixed(4)}, {destino?.longitud?.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-4">
                    {ruta.distancia_km && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <MapPinIcon className="w-4 h-4" />
                        {ruta.distancia_km.toFixed(1)} km
                      </span>
                    )}
                    {ruta.duracion_minutos && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        {formatDuracion(ruta.duracion_minutos)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(ruta.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                
                {/* Botón Ver en Mapa */}
                <Link
                  href={`/ruta?ruta=${ruta.id}`}
                  className="block w-full text-center px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium text-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <MapIcon className="w-4 h-4" />
                    Ver en Mapa
                  </span>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

