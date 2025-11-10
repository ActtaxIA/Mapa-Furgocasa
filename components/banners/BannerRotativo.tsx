'use client'

import { BannerHeroHorizontal } from './BannerHeroHorizontal'

interface BannerRotativoProps {
  position: 'after-info' | 'after-services' | 'after-gallery' | 'after-related'
  areaId?: number
  strategy?: 'random' | 'deterministic' | 'weighted'
  exclude?: string[]
}

/**
 * Componente SIMPLE que muestra SIEMPRE el banner Hero Horizontal
 * SOLUCIÓN TEMPORAL: Eliminada toda la complejidad para que funcione 100%
 */
export function BannerRotativo({
  position,
}: BannerRotativoProps) {
  // SIMPLE: Solo renderizar BannerHeroHorizontal siempre
  return (
    <div
      className="casi-cinco-banner-wrapper my-8"
      data-position={position}
    >
      <BannerHeroHorizontal position={position} />
    </div>
  )
}
