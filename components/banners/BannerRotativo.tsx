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
    { id: 'mobile', component: BannerMobile, weight: 1 },
    { id: 'hero-horizontal-mobile', component: BannerHeroHorizontal, weight: 0.5 },
  ] as BannerConfig[],
  tablet: [
    { id: 'hero-horizontal', component: BannerHeroHorizontal, weight: 1 },
    { id: 'cuadrado-medium', component: BannerCuadradoMedium, weight: 1 },
    { id: 'leaderboard-full', component: BannerLeaderboardFull, weight: 1 },
  ] as BannerConfig[],
  desktop: [
    { id: 'premium-animated', component: BannerPremiumAnimated, weight: 1.5 },
    { id: 'vertical-sidebar', component: BannerVerticalSidebar, weight: 1 },
    { id: 'wide-carousel', component: BannerWideCarousel, weight: 1.2 },
    { id: 'ultra-wide-modern', component: BannerUltraWideModern, weight: 1.3 },
    { id: 'leaderboard-full-desktop', component: BannerLeaderboardFull, weight: 0.8 },
    { id: 'cuadrado-medium-desktop', component: BannerCuadradoMedium, weight: 0.7 },
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
): BannerConfig {
  const availableBanners = banners.filter((b) => !exclude.includes(b.id))
  
  if (availableBanners.length === 0) {
    return banners[0]
  }

  let selectedBanner = availableBanners[0]

  switch (strategy) {
    case 'random': {
      const randomIndex = Math.floor(Math.random() * availableBanners.length)
      selectedBanner = availableBanners[randomIndex]
      break
    }

    case 'deterministic': {
      const index = (areaId + position.length) % availableBanners.length
      selectedBanner = availableBanners[index]
      break
    }

    case 'weighted': {
      const shouldRandomize = Math.random() < 0.3

      if (shouldRandomize) {
        const totalWeight = availableBanners.reduce((sum, b) => sum + b.weight, 0)
        let random = Math.random() * totalWeight

        for (const banner of availableBanners) {
          random -= banner.weight
          if (random <= 0) {
            selectedBanner = banner
            break
          }
        }
      } else {
        const index = (areaId + position.length) % availableBanners.length
        selectedBanner = availableBanners[index]
      }
      break
    }
  }

  return selectedBanner
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
    
    const deviceType = getDeviceType()
    const bannerPool = BANNERS_CONFIG[deviceType]
    const selected = selectBanner(bannerPool, areaId, position, strategy, exclude)
    
    setSelectedBanner(() => selected.component)
    setBannerId(selected.id)
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
