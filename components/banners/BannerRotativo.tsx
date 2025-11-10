'use client'

import { useEffect, useState } from 'react'
import { BannerHeroHorizontal } from './BannerHeroHorizontal'
import { BannerCuadradoMedium } from './BannerCuadradoMedium'
import { BannerLeaderboardFull } from './BannerLeaderboardFull'
import { BannerPremiumAnimated } from './BannerPremiumAnimated'
import { BannerVerticalSidebar } from './BannerVerticalSidebar'
import { BannerMobile } from './BannerMobile'
import { BannerWideCarousel } from './BannerWideCarousel'
import { BannerUltraWideModern } from './BannerUltraWideModern'

interface BannerConfig {
  id: string
  component: React.ComponentType<{ position: string }>
  weight: number
}

const BANNERS_CONFIG = {
  mobile: [
    { id: 'hero-horizontal-mobile', component: BannerHeroHorizontal, weight: 1 },
    // TEMPORALMENTE DESHABILITADO: BannerMobile (tiene problemas con animaciones)
  ] as BannerConfig[],
  tablet: [
    { id: 'hero-horizontal', component: BannerHeroHorizontal, weight: 1 },
    { id: 'leaderboard-full', component: BannerLeaderboardFull, weight: 1 },
    // TEMPORALMENTE DESHABILITADO: BannerCuadradoMedium (tiene style jsx)
  ] as BannerConfig[],
  desktop: [
    { id: 'hero-horizontal-desktop', component: BannerHeroHorizontal, weight: 1 },
    { id: 'vertical-sidebar', component: BannerVerticalSidebar, weight: 1.2 },
    { id: 'leaderboard-full-desktop', component: BannerLeaderboardFull, weight: 1 },
    // TEMPORALMENTE DESHABILITADOS (tienen <style jsx>):
    // BannerPremiumAnimated, BannerWideCarousel, BannerUltraWideModern, BannerCuadradoMedium
  ] as BannerConfig[],
}

interface BannerRotativoProps {
  position: 'after-info' | 'after-services' | 'after-gallery' | 'after-related'
  areaId?: number
  strategy?: 'random' | 'deterministic' | 'weighted'
  exclude?: string[]
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function selectBanner(
  banners: BannerConfig[],
  areaId: number,
  position: string,
  strategy: 'random' | 'deterministic' | 'weighted',
  exclude: string[]
): BannerConfig | null {
  // Validación: si no hay banners, retornar null
  if (!banners || banners.length === 0) {
    return null
  }

  const availableBanners = banners.filter((b) => !exclude.includes(b.id))
  
  // Si todos están excluidos, usar todos sin filtrar
  const finalBanners = availableBanners.length > 0 ? availableBanners : banners
  
  // Validación final
  if (finalBanners.length === 0) {
    return null
  }

  let selectedBanner = finalBanners[0]

  try {
    switch (strategy) {
      case 'random': {
        const randomIndex = Math.floor(Math.random() * finalBanners.length)
        selectedBanner = finalBanners[randomIndex] || finalBanners[0]
        break
      }

      case 'deterministic': {
        const index = (areaId + position.length) % finalBanners.length
        selectedBanner = finalBanners[index] || finalBanners[0]
        break
      }

      case 'weighted': {
        const shouldRandomize = Math.random() < 0.3

        if (shouldRandomize) {
          const totalWeight = finalBanners.reduce((sum, b) => sum + (b.weight || 1), 0)
          let random = Math.random() * totalWeight

          for (const banner of finalBanners) {
            random -= (banner.weight || 1)
            if (random <= 0) {
              selectedBanner = banner
              break
            }
          }
        } else {
          const index = (areaId + position.length) % finalBanners.length
          selectedBanner = finalBanners[index] || finalBanners[0]
        }
        break
      }
    }
  } catch (error) {
    console.error('Error selecting banner:', error)
    selectedBanner = finalBanners[0]
  }

  return selectedBanner || null
}

/**
 * Componente que rota banners inteligentemente según el dispositivo
 */
export function BannerRotativo({
  position,
  areaId = 0,
  strategy = 'weighted',
  exclude = [],
}: BannerRotativoProps) {
  const [mounted, setMounted] = useState(false)
  const [SelectedBanner, setSelectedBanner] = useState<React.ComponentType<{ position: string }> | null>(null)
  const [bannerId, setBannerId] = useState<string>('loading')

  useEffect(() => {
    setMounted(true)
    
    try {
      const deviceType = getDeviceType()
      const bannerPool = BANNERS_CONFIG[deviceType]
      
      if (!bannerPool || bannerPool.length === 0) {
        console.error('No banner pool found for device type:', deviceType)
        return
      }
      
      const selected = selectBanner(bannerPool, areaId, position, strategy, exclude)
      
      if (!selected || !selected.component || !selected.id) {
        console.error('Invalid banner selected:', selected)
        return
      }
      
      setSelectedBanner(() => selected.component)
      setBannerId(selected.id)
    } catch (error) {
      console.error('Error in useEffect:', error)
    }
  }, [areaId, position, strategy, exclude])

  // Durante SSR y primera carga, mostrar BannerHeroHorizontal por defecto
  if (!mounted || !SelectedBanner) {
    return (
      <div className="casi-cinco-banner-wrapper my-8" data-position={position}>
        <BannerHeroHorizontal position={position} />
      </div>
    )
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
