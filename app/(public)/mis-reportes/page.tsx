'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MisReportesTab } from '@/components/perfil/MisReportesTab'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function MisReportesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 lg:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ExclamationTriangleIcon className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mis Reportes de Accidentes</h1>
          </div>
          <p className="text-gray-600">
            Aquí puedes ver todos los reportes de accidentes relacionados con tus autocaravanas registradas.
          </p>
        </div>

        {user && <MisReportesTab userId={user.id} />}
      </main>
      <Footer />
    </div>
  )
}
