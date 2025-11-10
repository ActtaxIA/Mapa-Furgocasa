'use client'

import { useMemo, useState, useEffect } from 'react'
import { BannerHeroHorizontal } from './BannerHeroHorizontal'
import { BannerCuadradoMedium } from './BannerCuadradoMedium'
import { BannerLeaderboardFull } from './BannerLeaderboardFull'
import { BannerPremiumAnimated } from './BannerPremiumAnimated'
import { BannerVerticalSidebar } from './BannerVerticalSidebar'
import { BannerMobile } from './BannerMobile'
import { BannerWideCarousel } from './BannerWideCarousel'
import { BannerUltraWideModern } from './BannerUltraWideModern'

/**
 * Clasificación de banners por dispositivo:
 *
 * MÓVIL (< 768px):
 * - banner-mobile.html (320x100px) - Compacto para móviles
 *
 * TABLET (768px - 1024px):
 * - banner-hero-horizontal.html (728x90px) - Horizontal responsive
 * - banner-cuadrado-medium.html (300x250px) - Cuadrado adaptable
 * - banner-leaderboard-full.html (970x90px) - Full width tablet
 *
 * DESKTOP (> 1024px):
 * - banner-premium-animated.html (600x400px) - Premium con animaciones
 * - banner-vertical-sidebar.html (300x600px) - Sidebar lateral
 * - banner-wide-carousel.html (1200px) - Carousel amplio
 * - banner-ultra-wide-modern.html (1400px) - Ultra wide moderno
 * - banner-ultra-wide-restaurantes.html (1400px) - Ultra wide temático restaurantes
 * - banner-ultra-wide-bares.html (1400px) - Ultra wide temático bares
 * - banner-ultra-wide-hoteles.html (1400px) - Ultra wide temático hoteles
 * - banner-mega-wide-slider.html (1600px+) - Mega wide con slider
 */

const BANNERS_CONFIG = {
  mobile: [
    { id: 'mobile', component: BannerMobile, weight: 1 },
    { id: 'hero-horizontal-mobile', component: BannerHeroHorizontal, weight: 0.5 }, // También funciona en móvil
  ],
  tablet: [
    { id: 'hero-horizontal', component: BannerHeroHorizontal, weight: 1 },
    { id: 'cuadrado-medium', component: BannerCuadradoMedium, weight: 1 },
    { id: 'leaderboard-full', component: BannerLeaderboardFull, weight: 1 },
  ],
  desktop: [
    { id: 'premium-animated', component: BannerPremiumAnimated, weight: 1.5 },
    { id: 'vertical-sidebar', component: BannerVerticalSidebar, weight: 1 },
    { id: 'wide-carousel', component: BannerWideCarousel, weight: 1.2 },
    { id: 'ultra-wide-modern', component: BannerUltraWideModern, weight: 1.3 },
    { id: 'leaderboard-full-desktop', component: BannerLeaderboardFull, weight: 0.8 },
    { id: 'cuadrado-medium-desktop', component: BannerCuadradoMedium, weight: 0.7 },
  ],
}

interface BannerRotativoProps {
  position: 'after-info' | 'after-services' | 'after-gallery' | 'after-related'
  areaId?: number
  strategy?: 'random' | 'deterministic' | 'weighted'
  exclude?: string[]
}

/**
 * Componente que rota banners inteligentemente según el dispositivo
 * - En móvil: muestra banners optimizados para móvil
 * - En tablet: muestra banners medianos
 * - En desktop: muestra banners grandes con animaciones
 */
export function BannerRotativo({
  position,
  areaId = 0,
  strategy = 'weighted',
  exclude = [],
}: BannerRotativoProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { SelectedBanner, bannerId } = useMemo(() => {
    // Función helper para seleccionar banner de forma segura
    const selectBanner = (banners: typeof BANNERS_CONFIG.desktop) => {
      if (!banners || banners.length === 0) {
        return {
          SelectedBanner: BannerHeroHorizontal,
          bannerId: 'hero-horizontal-fallback',
        }
      }

      const availableBanners = banners.filter((b) => !exclude.includes(b.id))

      if (availableBanners.length === 0) {
        // Si todos están excluidos, usar el primero sin filtrar
        return {
          SelectedBanner: banners[0].component,
          bannerId: banners[0].id,
        }
      }

      let selectedBanner = availableBanners[0] // Default seguro

      try {
        switch (strategy) {
          case 'random': {
            const randomIndex = Math.floor(Math.random() * availableBanners.length)
            selectedBanner = availableBanners[randomIndex]
            break
          }

          case 'deterministic': {
            const deterministicIndex = (areaId + position.length) % availableBanners.length
            selectedBanner = availableBanners[deterministicIndex]
            break
          }

          case 'weighted': {
            const shouldRandomize = Math.random() < 0.3

            if (shouldRandomize) {
              // Selección ponderada
              const totalWeight = availableBanners.reduce((sum, b) => sum + (b.weight || 1), 0)
              let random = Math.random() * totalWeight

              for (const banner of availableBanners) {
                random -= banner.weight || 1
                if (random <= 0) {
                  selectedBanner = banner
                  break
                }
              }
            } else {
              // Determinista
              const deterministicIndex = (areaId + position.length) % availableBanners.length
              selectedBanner = availableBanners[deterministicIndex]
            }
            break
          }
        }
      } catch (error) {
        console.error('Error selecting banner:', error)
        // Mantener el default (availableBanners[0])
      }

      // Verificación final de seguridad
      if (!selectedBanner || !selectedBanner.component) {
        return {
          SelectedBanner: BannerHeroHorizontal,
          bannerId: 'hero-horizontal-error-fallback',
        }
      }

      return {
        SelectedBanner: selectedBanner.component,
        bannerId: selectedBanner.id,
      }
    }

    // Durante SSR o antes de hidratar, no renderizar nada
    if (!isClient) {
      return {
        SelectedBanner: null,
        bannerId: 'ssr',
      }
    }

    // Detectar tipo de dispositivo (solo en cliente)
    const width = window.innerWidth
    let bannerPool = BANNERS_CONFIG.desktop

    if (width < 768) {
      bannerPool = BANNERS_CONFIG.mobile
    } else if (width < 1024) {
      bannerPool = BANNERS_CONFIG.tablet
    }

    return selectBanner(bannerPool)
  }, [isClient, areaId, position, strategy, exclude])

  // No renderizar hasta que estemos en el cliente
  if (!isClient || !SelectedBanner) {
    return null
  }

  return (
    <div
      className="casi-cinco-banner-wrapper my-8"
      data-position={position}
      data-banner-id={bannerId}
    >
      <SelectedBanner position={position} />
    </div>
  )
}
