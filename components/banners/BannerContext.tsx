'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BannerContextType {
  usedBanners: Set<string>
  markBannerAsUsed: (bannerId: string) => void
  resetUsedBanners: () => void
}

const BannerContext = createContext<BannerContextType | undefined>(undefined)

export function BannerProvider({ children }: { children: ReactNode }) {
  const [usedBanners, setUsedBanners] = useState<Set<string>>(new Set())

  const markBannerAsUsed = (bannerId: string) => {
    setUsedBanners((prev) => new Set(prev).add(bannerId))
  }

  const resetUsedBanners = () => {
    setUsedBanners(new Set())
  }

  return (
    <BannerContext.Provider value={{ usedBanners, markBannerAsUsed, resetUsedBanners }}>
      {children}
    </BannerContext.Provider>
  )
}

export function useBannerContext() {
  const context = useContext(BannerContext)
  if (context === undefined) {
    throw new Error('useBannerContext must be used within a BannerProvider')
  }
  return context
}

