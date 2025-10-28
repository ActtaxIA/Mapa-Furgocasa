'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        setIsAdmin(session.user.user_metadata?.is_admin === true)
      }
    }

    checkUser()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setIsAdmin(session.user.user_metadata?.is_admin === true)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setShowUserMenu(false)
    window.location.href = '/'
  }

  return (
    <header className="bg-primary-600 text-white shadow-lg z-30 shrink-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/mapa" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🚐</span>
            <span className="text-xl font-bold">Furgocasa</span>
          </Link>

          {/* Navegación Móvil (visible en pantallas pequeñas) */}
          <nav className="flex md:hidden items-center space-x-4">
            <Link 
              href="/mapa" 
              className={`text-white font-semibold hover:text-primary-100 transition-colors text-sm ${
                pathname === '/mapa' ? 'border-b-2 border-white pb-1' : ''
              }`}
            >
              Mapa
            </Link>
            <Link 
              href="/ruta" 
              className={`text-white font-semibold hover:text-primary-100 transition-colors text-sm ${
                pathname === '/ruta' ? 'border-b-2 border-white pb-1' : ''
              }`}
            >
              Ruta
            </Link>
          </nav>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/mapa" 
              className={`text-white font-semibold hover:text-primary-100 transition-colors ${
                pathname === '/mapa' ? 'border-b-2 border-white pb-1' : ''
              }`}
            >
              Mapa
            </Link>
            <Link 
              href="/ruta" 
              className={`text-white font-semibold hover:text-primary-100 transition-colors ${
                pathname === '/ruta' ? 'border-b-2 border-white pb-1' : ''
              }`}
            >
              Ruta
            </Link>
          </nav>

          {/* Usuario / Login */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  {user.user_metadata?.profile_photo && user.user_metadata.profile_photo !== 'default_profile.png' ? (
                    <img 
                      src={user.user_metadata.profile_photo} 
                      alt={user.user_metadata?.full_name || user.email}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8" />
                  )}
                  <span className="hidden sm:inline text-sm">
                    {user.user_metadata?.first_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.user_metadata?.full_name || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-2">
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Cog6ToothIcon className="w-5 h-5" />
                            Panel de Administración
                          </Link>
                        )}
                        <Link
                          href="/perfil"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserCircleIcon className="w-5 h-5" />
                          Mi Perfil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-sm"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

