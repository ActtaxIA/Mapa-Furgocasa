'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable'
import { 
  UserCircleIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  confirmed_at: string | null
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
      setLoading(true)
      
      // Llamar a la API del servidor que usa Service Role Key
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar usuarios')
      }

      console.log(`✅ Cargados ${data.total} usuarios desde Supabase Auth`)
      setUsers(data.users || [])
      
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error)
      alert('Error al cargar usuarios. Verifica la consola.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const usuariosFiltrados = users.filter(user => {
    const matchAdmin = filtroAdmin === 'all' ||
                      (filtroAdmin === 'admin' && user.user_metadata?.is_admin) ||
                      (filtroAdmin === 'user' && !user.user_metadata?.is_admin)

    return matchAdmin
  })

  // Definir columnas para la tabla
  const columns: AdminTableColumn<UserProfile>[] = [
    {
      key: 'usuario',
      title: 'Usuario',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {user.user_metadata?.profile_photo ? (
              <img 
                className="h-10 w-10 rounded-full" 
                src={user.user_metadata.profile_photo} 
                alt="" 
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-gray-500" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.user_metadata?.full_name || 
               user.user_metadata?.username || 
               user.user_metadata?.first_name || 
               'Sin nombre'}
            </div>
            <div className="text-sm text-gray-500">
              ID: {user.id.substring(0, 8)}...
            </div>
          </div>
        </div>
      ),
      exportValue: (user) => user.user_metadata?.full_name || user.user_metadata?.username || 'Sin nombre'
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      render: (user) => (
        <div className="text-sm text-gray-900">{user.email}</div>
      )
    },
    {
      key: 'rol',
      title: 'Rol',
      sortable: true,
      render: (user) => (
        user.user_metadata?.is_admin ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <ShieldCheckIcon className="w-4 h-4 mr-1" />
            Admin
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <UserCircleIcon className="w-4 h-4 mr-1" />
            Usuario
          </span>
        )
      ),
      exportValue: (user) => user.user_metadata?.is_admin ? 'Admin' : 'Usuario'
    },
    {
      key: 'created_at',
      title: 'Fecha Registro',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-500">
          {new Date(user.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      ),
      exportValue: (user) => new Date(user.created_at).toLocaleDateString('es-ES')
    },
    {
      key: 'last_sign_in_at',
      title: 'Último Acceso',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-500">
          {user.last_sign_in_at ? (
            new Date(user.last_sign_in_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          ) : (
            <span className="text-gray-400">Nunca</span>
          )}
        </span>
      ),
      exportValue: (user) => user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES') : 'Nunca'
    },
    {
      key: 'confirmed_at',
      title: 'Estado',
      sortable: true,
      render: (user) => (
        user.confirmed_at ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Confirmado
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Pendiente
          </span>
        )
      ),
      exportValue: (user) => user.confirmed_at ? 'Confirmado' : 'Pendiente'
    }
  ]

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
              Total: {users.length} usuarios registrados
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtro Rol */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por rol</label>
          <select
            value={filtroAdmin}
            onChange={(e) => setFiltroAdmin(e.target.value as any)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">Todos los usuarios</option>
            <option value="admin">Solo administradores</option>
            <option value="user">Solo usuarios</option>
          </select>
        </div>

        {/* Información sobre gestión de usuarios */}
        {users.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Usuarios Cargados desde Supabase Auth
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Se encontraron <strong>{users.length} usuarios</strong> registrados en Supabase Authentication.
                  </p>
                  <p className="mt-1">
                    También puedes gestionar usuarios directamente desde el{' '}
                    <a 
                      href="https://supabase.com/dashboard" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline hover:text-blue-900"
                    >
                      Dashboard de Supabase → Authentication → Users
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.user_metadata?.is_admin).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Confirmados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.confirmed_at).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios con AdminTable */}
        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <UserCircleIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay usuarios</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              No se encontraron usuarios en Supabase Authentication.
            </p>
          </div>
        ) : (
          <AdminTable
            data={usuariosFiltrados}
            columns={columns}
            loading={loading}
            emptyMessage="No se encontraron usuarios con los filtros aplicados"
            searchPlaceholder="Buscar por nombre, email, ID..."
            exportFilename="usuarios"
          />
        )}
      </main>
    </div>
  )
}

