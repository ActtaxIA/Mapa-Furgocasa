'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { 
  MagnifyingGlassIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  user_metadata: {
    full_name?: string
    first_name?: string
    last_name?: string
    username?: string
    is_admin?: boolean
    profile_photo?: string
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroAdmin, setFiltroAdmin] = useState<'all' | 'admin' | 'user'>('all')
  const router = useRouter()

  useEffect(() => {
    checkAdminAndLoadUsers()
  }, [])

  const checkAdminAndLoadUsers = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user || !session.user.user_metadata?.is_admin) {
      router.push('/mapa')
      return
    }

    loadUsers()
  }

  const loadUsers = async () => {
    try {
      const supabase = createClient()
      
      // Nota: Esto requiere usar el service role key para acceder a auth.users
      // Por ahora mostramos datos de ejemplo
      // En producción, necesitarías crear una función de servidor o Edge Function
      
      setUsers([])
      setLoading(false)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      setLoading(false)
    }
  }

  const usuariosFiltrados = users.filter(user => {
    const matchBusqueda = user.email.toLowerCase().includes(busqueda.toLowerCase()) ||
                         user.user_metadata?.full_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
                         user.user_metadata?.username?.toLowerCase().includes(busqueda.toLowerCase())
    
    const matchAdmin = filtroAdmin === 'all' ||
                      (filtroAdmin === 'admin' && user.user_metadata?.is_admin) ||
                      (filtroAdmin === 'user' && !user.user_metadata?.is_admin)

    return matchBusqueda && matchAdmin
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-1 text-sm text-gray-500">
              Total: 382 usuarios registrados
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, email o username..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro Rol */}
            <div>
              <select
                value={filtroAdmin}
                onChange={(e) => setFiltroAdmin(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Todos los usuarios</option>
                <option value="admin">Solo administradores</option>
                <option value="user">Solo usuarios</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información sobre acceso a usuarios */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Acceso a Usuarios Limitado
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Para acceder a la lista completa de usuarios y gestionarlos, necesitas configurar una Edge Function 
                  o Server Action con el Service Role Key de Supabase. 
                </p>
                <p className="mt-2">
                  <strong>Total de usuarios migrados:</strong> 382 usuarios
                </p>
                <p className="mt-1">
                  Puedes ver y gestionar usuarios directamente desde el{' '}
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-yellow-900"
                  >
                    Dashboard de Supabase → Authentication → Users
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">382</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShieldCheckIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-gray-900">382</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximamente */}
        <div className="mt-8 bg-white rounded-lg shadow p-12 text-center">
          <UserCircleIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Gestión de Usuarios</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            La gestión detallada de usuarios estará disponible próximamente. 
            Por ahora, puedes administrar usuarios desde el Dashboard de Supabase.
          </p>
          <div className="mt-6">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              Ir a Supabase Dashboard
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

