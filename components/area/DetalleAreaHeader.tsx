'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon, HeartIcon, ShareIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { Area } from '@/types/database.types'

interface Props {
  area: Area
}

export function DetalleAreaHeader({ area }: Props) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    checkFavoriteStatus()
  }, [])

  const checkFavoriteStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) return
      setUser(session.user)

      const { data } = await supabase
        .from('favoritos')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('area_id', area.id)
        .single()

      if (data) setIsFavorite(true)
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      showToast('Debes iniciar sesión para añadir favoritos', 'info')
      setTimeout(() => router.push('/auth/login'), 1500)
      return
    }

    try {
      const supabase = createClient()

      if (isFavorite) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('area_id', area.id)

        if (error) throw error
        setIsFavorite(false)
        showToast('❌ Quitado de favoritos', 'info')
      } else {
        const { error } = await supabase
          .from('favoritos')
          .insert({ user_id: user.id, area_id: area.id })

        if (error) throw error
        setIsFavorite(true)
        showToast('❤️ Añadido a favoritos', 'success')
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error)
      showToast(error.message || 'Error al actualizar favorito', 'error')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: area.nombre,
          text: area.descripcion || `Área para autocaravanas en ${area.ciudad}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error compartiendo:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('🔗 Enlace copiado al portapapeles', 'success')
    }
  }

  const getTipoAreaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      publica: '🏛️ Pública',
      privada: '🔒 Privada',
      camping: '⛺ Camping',
      parking: '🅿️ Parking',
    }
    return labels[tipo] || tipo
  }

  const getTipoAreaColor = (tipo: string) => {
    const colors: Record<string, string> = {
      publica: 'bg-blue-100 text-blue-800',
      privada: 'bg-orange-100 text-orange-800',
      camping: 'bg-green-100 text-green-800',
      parking: 'bg-gray-100 text-gray-800',
    }
    return colors[tipo] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      <div className="relative">
      {/* Imagen principal */}
      <div className="relative h-64 md:h-96 bg-gray-200">
        {area.foto_principal ? (
          <Image
            src={area.foto_principal}
            alt={area.nombre}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <MapPinIcon className="w-24 h-24 text-primary-400" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Botones flotantes */}
      <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-center safe-top">
        <Link
          href="/mapa"
          className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handleFavorite}
            className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            {isFavorite ? (
              <HeartIconSolid className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6 text-gray-700" />
            )}
          </button>

          <button
            onClick={handleShare}
            className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Compartir"
          >
            <ShareIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Información superpuesta */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
              {area.nombre}
            </h1>
            <p className="text-sm md:text-base text-white/90 drop-shadow">
              📍 {area.direccion || `${area.ciudad}, ${area.provincia}`}
            </p>
          </div>

          {/* Badge tipo de área */}
          <span className={`${getTipoAreaColor(area.tipo_area)} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
            {getTipoAreaLabel(area.tipo_area)}
          </span>
        </div>

        {/* Rating y precio */}
        <div className="flex items-center gap-4 mt-3">
          {area.google_rating && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-yellow-300">⭐</span>
              <span className="text-sm font-semibold">{area.google_rating.toFixed(1)}</span>
            </div>
          )}

          {area.precio_noche && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-sm font-semibold">
                {area.precio_noche}€/{area.precio_24h ? '24h' : 'noche'}
              </span>
            </div>
          )}

          {area.verificado && (
            <div className="flex items-center gap-1 bg-green-500/80 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-sm font-semibold">✓ Verificado</span>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
