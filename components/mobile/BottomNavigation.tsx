'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapIcon, NavigationIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import { MapIcon as MapIconSolid, NavigationIcon as NavigationIconSolid, ListBulletIcon as ListBulletIconSolid } from '@heroicons/react/24/solid'

interface BottomNavigationProps {
  onListClick?: () => void
  showListButton?: boolean
}

export default function BottomNavigation({ onListClick, showListButton = true }: BottomNavigationProps) {
  const pathname = usePathname()
  
  const isMapPage = pathname === '/mapa'
  const isRutaPage = pathname === '/ruta'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40 md:hidden">
      <div className="flex items-center justify-around h-16">
        {/* Mapa */}
        <Link
          href="/mapa"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isMapPage ? 'text-primary-600' : 'text-gray-600'
          }`}
        >
          {isMapPage ? (
            <MapIconSolid className="w-6 h-6 mb-1" />
          ) : (
            <MapIcon className="w-6 h-6 mb-1" />
          )}
          <span className="text-xs font-medium">Mapa</span>
        </Link>

        {/* Ruta */}
        <Link
          href="/ruta"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isRutaPage ? 'text-primary-600' : 'text-gray-600'
          }`}
        >
          {isRutaPage ? (
            <NavigationIconSolid className="w-6 h-6 mb-1" />
          ) : (
            <NavigationIcon className="w-6 h-6 mb-1" />
          )}
          <span className="text-xs font-medium">Ruta</span>
        </Link>

        {/* Lista (solo si se proporciona onListClick y showListButton es true) */}
        {showListButton && onListClick && (
          <button
            onClick={onListClick}
            className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-gray-600 hover:text-primary-600"
          >
            <ListBulletIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Lista</span>
          </button>
        )}
      </div>
    </nav>
  )
}

