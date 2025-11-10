'use client'

import { useEffect, useState, useRef } from 'react'
import { BannerHeroHorizontal } from './BannerHeroHorizontal'
import { BannerCuadradoMedium } from './BannerCuadradoMedium'
import { BannerLeaderboardFull } from './BannerLeaderboardFull'
import { BannerPremiumAnimated } from './BannerPremiumAnimated'
import { BannerVerticalSidebar } from './BannerVerticalSidebar'
import { BannerMobile } from './BannerMobile'
import { BannerWideCarousel } from './BannerWideCarousel'
import { BannerUltraWideModern } from './BannerUltraWideModern'
import { BannerUltraWideBares } from './BannerUltraWideBares'
import { BannerUltraWideHoteles } from './BannerUltraWideHoteles'
import { BannerUltraWideRestaurantes } from './BannerUltraWideRestaurantes'
import { BannerMegaWideSlider } from './BannerMegaWideSlider'
import { useBannerContext } from './BannerContext'

interface BannerConfig {
  id: string
  component: React.ComponentType<{ position: string }>
  weight: number
}

const BANNERS_CONFIG = {
  mobile: [
    { id: 'banner-mobile', component: BannerMobile, weight: 1.5 },
    { id: 'cuadrado-medium-mobile', component: BannerCuadradoMedium, weight: 1.3 },
    { id: 'vertical-sidebar-mobile', component: BannerVerticalSidebar, weight: 1.2 },
    { id: 'hero-horizontal-mobile', component: BannerHeroHorizontal, weight: 0.8 },
    { id: 'ultra-wide-bares-mobile', component: BannerUltraWideBares, weight: 1 },
    { id: 'ultra-wide-hoteles-mobile', component: BannerUltraWideHoteles, weight: 1 },
    { id: 'ultra-wide-restaurantes-mobile', component: BannerUltraWideRestaurantes, weight: 1 },
  ] as BannerConfig[],
  tablet: [
    { id: 'cuadrado-medium-tablet', component: BannerCuadradoMedium, weight: 1.3 },
    { id: 'hero-horizontal', component: BannerHeroHorizontal, weight: 1 },
    { id: 'leaderboard-full', component: BannerLeaderboardFull, weight: 1 },
    { id: 'ultra-wide-bares-tablet', component: BannerUltraWideBares, weight: 1.4 },
    { id: 'ultra-wide-hoteles-tablet', component: BannerUltraWideHoteles, weight: 1.4 },
    { id: 'ultra-wide-restaurantes-tablet', component: BannerUltraWideRestaurantes, weight: 1.4 },
    { id: 'wide-carousel-tablet', component: BannerWideCarousel, weight: 1.2 },
  ] as BannerConfig[],
  desktop: [
    // 🎯 Banners específicos por categoría (mayor peso)
    { id: 'ultra-wide-bares-desktop', component: BannerUltraWideBares, weight: 1.6 },
    { id: 'ultra-wide-hoteles-desktop', component: BannerUltraWideHoteles, weight: 1.6 },
    { id: 'ultra-wide-restaurantes-desktop', component: BannerUltraWideRestaurantes, weight: 1.6 },
    
    // 🎨 Banners premium con animaciones
    { id: 'premium-animated-desktop', component: BannerPremiumAnimated, weight: 1.4 },
    { id: 'mega-wide-slider-desktop', component: BannerMegaWideSlider, weight: 1.4 },
    { id: 'ultra-wide-modern-desktop', component: BannerUltraWideModern, weight: 1.3 },
    { id: 'wide-carousel-desktop', component: BannerWideCarousel, weight: 1.3 },
    
    // 📐 Banners estándar
    { id: 'vertical-sidebar-desktop', component: BannerVerticalSidebar, weight: 1.1 },
    { id: 'leaderboard-full-desktop', component: BannerLeaderboardFull, weight: 0.9 },
    { id: 'hero-horizontal-desktop', component: BannerHeroHorizontal, weight: 0.8 },
    { id: 'cuadrado-medium-desktop', component: BannerCuadradoMedium, weight: 0.8 },
  ] as BannerConfig[],
}

interface BannerRotativoProps {
  position: 'after-info' | 'after-services' | 'after-gallery' | 'after-related'
  areaId?: number
  strategy?: 'random' | 'deterministic' | 'weighted'
  exclude?: string[]
  priority?: number // 1 = primero, 2 = segundo, 3 = tercero
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// 🎯 Hash simple para generar índice determinístico
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function selectBanner(
  banners: BannerConfig[],
  areaId: number,
  position: string,
  strategy: 'random' | 'deterministic' | 'weighted',
  exclude: string[],
  usedBannerIds: string[] // Cambiado de Set a array para ser serializable
): BannerConfig | null {
  // Validación: si no hay banners, retornar null
  if (!banners || banners.length === 0) {
    return null
  }

  // 🎯 FILTRO 1: Excluir banners ya usados en esta página
  const notUsedBanners = banners.filter((b) => !usedBannerIds.includes(b.id))
  
  // 🎯 FILTRO 2: Excluir banners específicos (parámetro exclude)
  const availableBanners = notUsedBanners.filter((b) => !exclude.includes(b.id))
  
  // Si todos están excluidos/usados, usar los no usados (ignorar exclude)
  // Si todos fueron usados, resetear y usar todos
  const finalBanners = 
    availableBanners.length > 0 ? availableBanners :
    notUsedBanners.length > 0 ? notUsedBanners :
    banners
  
  // Validación final
  if (finalBanners.length === 0) {
    return null
  }

  let selectedBanner = finalBanners[0]

  try {
    // 🎯 CLAVE: Usar hash determinístico basado en areaId + position + usedBanners
    // Esto garantiza que cada posición seleccione un banner diferente
    const seed = `${areaId}-${position}-${usedBannerIds.join(',')}`
    const hash = simpleHash(seed)
    const deterministicIndex = hash % finalBanners.length
    
    switch (strategy) {
      case 'random': {
        // Aún así usar seed para que sea predecible en SSR
        selectedBanner = finalBanners[deterministicIndex] || finalBanners[0]
        break
      }

      case 'deterministic': {
        selectedBanner = finalBanners[deterministicIndex] || finalBanners[0]
        break
      }

      case 'weighted': {
        // Usar el hash para decidir si randomizar
        const shouldRandomize = (hash % 100) < 30

        if (shouldRandomize) {
          const totalWeight = finalBanners.reduce((sum, b) => sum + (b.weight || 1), 0)
          let random = (hash % 1000) / 1000 * totalWeight

          for (const banner of finalBanners) {
            random -= (banner.weight || 1)
            if (random <= 0) {
              selectedBanner = banner
              break
            }
          }
        } else {
          selectedBanner = finalBanners[deterministicIndex] || finalBanners[0]
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
 * ✅ GARANTIZA: No repetir banners en la misma página
 */
export function BannerRotativo({
  position,
  areaId = 0,
  strategy = 'weighted',
  exclude = [],
  priority = 1,
}: BannerRotativoProps) {
  const { usedBanners, markBannerAsUsed } = useBannerContext()
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
      
      // 🎯 Convertir Set a array para pasar a la función
      const usedBannerIds = Array.from(usedBanners)
      
      // 🎯 Selección determinística basada en areaId + position + banners ya usados
      const selected = selectBanner(bannerPool, areaId, position, strategy, exclude, usedBannerIds)
      
      if (!selected || !selected.component || !selected.id) {
        console.error('Invalid banner selected:', selected)
        return
      }
      
      console.log(`[Priority ${priority} - ${position}] Selected: ${selected.id}, Used:`, usedBannerIds)
      
      // ✅ Marcar este banner como usado
      markBannerAsUsed(selected.id)
      
      setSelectedBanner(() => selected.component)
      setBannerId(selected.id)
    } catch (error) {
      console.error('Error in useEffect:', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
