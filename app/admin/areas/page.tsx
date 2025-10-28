'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  ArrowPathIcon,
  SparklesIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import {
  WifiIcon,
  BoltIcon,
  HomeIcon,
  FireIcon
} from '@heroicons/react/24/solid'
import type { Area } from '@/types/database.types'

// Helper para iconos de servicios
const getServicioIcon = (servicio: string) => {
  const iconos: { [key: string]: JSX.Element } = {
    'Agua': <span className="text-blue-500" title="Agua">💧</span>,
    'Electricidad': <BoltIcon className="w-4 h-4 text-yellow-500" title="Electricidad" />,
    'WC': <span className="text-gray-600" title="WC">🚻</span>,
    'Duchas': <span className="text-cyan-500" title="Duchas">🚿</span>,
    'Vaciado Químico': <span className="text-purple-500" title="Vaciado Químico">♻️</span>,
    'Vaciado Aguas Grises': <span className="text-slate-500" title="Vaciado Aguas Grises">🌊</span>,
    'Oferta de Restauración': <span className="text-orange-500" title="Oferta de Restauración">🍽️</span>,
  }
  return iconos[servicio] || null
}

export default function AdminAreasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroVerificado, setFiltroVerificado] = useState<'all' | 'verified' | 'unverified'>('all')
  const [filtroActivo, setFiltroActivo] = useState<'all' | 'active' | 'inactive'>('all')
  const [paginaActual, setPaginaActual] = useState(1)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    areaId: string
    areaNombre: string
  }>({
    isOpen: false,
    areaId: '',
    areaNombre: ''
  })
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const router = useRouter()

  useEffect(() => {
    checkAdminAndLoadAreas()
  }, [])

  const checkAdminAndLoadAreas = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user || !session.user.user_metadata?.is_admin) {
      router.push('/mapa')
      return
    }

    loadAreas()
  }

  const loadAreas = async () => {
    try {
      console.log('📥 Cargando áreas desde Supabase...')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error de Supabase al cargar áreas:', error)
        throw error
      }

      console.log(`✅ ${data?.length || 0} áreas cargadas`)
      setAreas(data || [])
    } catch (error) {
      console.error('❌ Error cargando áreas:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVerificado = async (id: string, currentValue: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('areas')
        .update({ verificado: !currentValue })
        .eq('id', id)

      if (error) throw error
      loadAreas()
    } catch (error) {
      console.error('Error actualizando área:', error)
    }
  }

  const toggleActivo = async (id: string, currentValue: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('areas')
        .update({ activo: !currentValue })
        .eq('id', id)

      if (error) throw error
      loadAreas()
    } catch (error) {
      console.error('Error actualizando área:', error)
    }
  }

  const handleDelete = (id: string, nombre: string) => {
    setDeleteModal({
      isOpen: true,
      areaId: id,
      areaNombre: nombre
    })
  }

  const confirmDelete = async () => {
    const { areaId, areaNombre } = deleteModal
    
    try {
      const supabase = createClient()
      
      console.log('🗑️ Intentando eliminar área:', {
        id: areaId,
        nombre: areaNombre
      })
      
      // Eliminar registros relacionados primero (pueden no existir, ignorar errores)
      console.log('  📝 Eliminando valoraciones...')
      const { error: errorVal } = await supabase.from('valoraciones').delete().eq('area_id', areaId)
      if (errorVal) console.log('  ⚠️ Error eliminando valoraciones (puede ser que no existan):', errorVal.message)
      
      console.log('  ⭐ Eliminando favoritos...')
      const { error: errorFav } = await supabase.from('favoritos').delete().eq('area_id', areaId)
      if (errorFav) console.log('  ⚠️ Error eliminando favoritos (puede ser que no existan):', errorFav.message)
      
      console.log('  👀 Eliminando visitas...')
      const { error: errorVis } = await supabase.from('visitas').delete().eq('area_id', areaId)
      if (errorVis) console.log('  ⚠️ Error eliminando visitas (puede ser que no existan):', errorVis.message)
      
      // Eliminar el área
      console.log('  🗑️ Eliminando área principal...')
      const { data: deletedData, error } = await supabase
        .from('areas')
        .delete()
        .eq('id', areaId)
        .select()

      if (error) {
        console.error('❌ Error de Supabase eliminando área:', error)
        console.error('   Código:', error.code)
        console.error('   Mensaje:', error.message)
        console.error('   Detalles:', error.details)
        console.error('   Hint:', error.hint)
        throw error
      }
      
      console.log('✅ Área eliminada correctamente de Supabase')
      console.log('   Datos eliminados:', deletedData)
      
      // Verificar que realmente se eliminó algo
      if (!deletedData || deletedData.length === 0) {
        console.warn('⚠️ No se devolvieron datos de la eliminación')
      }
      
      // Cerrar modal de eliminación
      setDeleteModal({ isOpen: false, areaId: '', areaNombre: '' })
      
      // Mostrar mensaje de éxito
      setModalState({
        isOpen: true,
        type: 'success',
        title: '✅ Área Eliminada',
        message: `El área "${areaNombre}" ha sido eliminada correctamente.`,
      })
      
      // Recargar la lista completa desde Supabase inmediatamente
      console.log('🔄 Recargando lista completa desde Supabase...')
      await loadAreas()
    } catch (error: any) {
      console.error('❌ Error eliminando área:', error)
      
      // Cerrar modal de eliminación
      setDeleteModal({ isOpen: false, areaId: '', areaNombre: '' })
      
      // Mostrar mensaje de error
      setModalState({
        isOpen: true,
        type: 'error',
        title: '❌ Error',
        message: `No se pudo eliminar el área: ${error.message || 'Error desconocido'}\n\n¿Tienes permisos de administrador?`,
      })
    }
  }

  const areasFiltradas = areas.filter(area => {
    const matchBusqueda = area.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                         area.ciudad?.toLowerCase().includes(busqueda.toLowerCase()) ||
                         area.provincia?.toLowerCase().includes(busqueda.toLowerCase())
    
    const matchVerificado = filtroVerificado === 'all' || 
                           (filtroVerificado === 'verified' && area.verificado) ||
                           (filtroVerificado === 'unverified' && !area.verificado)
    
    const matchActivo = filtroActivo === 'all' ||
                       (filtroActivo === 'active' && area.activo) ||
                       (filtroActivo === 'inactive' && !area.activo)

    return matchBusqueda && matchVerificado && matchActivo
  })

  // Paginación
  const totalPaginas = Math.ceil(areasFiltradas.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const areasEnPagina = areasFiltradas.slice(indiceInicio, indiceFin)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, filtroVerificado, filtroActivo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Cargando áreas...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Áreas</h1>
              <p className="mt-1 text-sm text-gray-500">
                {areasFiltradas.length} de {areas.length} áreas
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/admin/areas/busqueda-masiva"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Búsqueda Masiva
              </Link>
              <Link
                href="/admin/areas/actualizar-servicios"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Actualizar Servicios
              </Link>
              <Link
                href="/admin/areas/enriquecer-textos"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                <SparklesIcon className="w-5 h-5" />
                Enriquecer Textos
              </Link>
              <Link
                href="/admin/areas/enriquecer-imagenes"
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-semibold"
              >
                <PhotoIcon className="w-5 h-5" />
                Enriquecer Imágenes
              </Link>
              <Link
                href="/admin/areas/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold"
              >
                <PlusIcon className="w-5 h-5" />
                Nueva Área
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, ciudad o provincia..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro Verificado */}
            <div>
              <select
                value={filtroVerificado}
                onChange={(e) => setFiltroVerificado(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Todas las áreas</option>
                <option value="verified">Solo verificadas</option>
                <option value="unverified">Sin verificar</option>
              </select>
            </div>

            {/* Filtro Activo */}
            <div>
              <select
                value={filtroActivo}
                onChange={(e) => setFiltroActivo(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Activas e inactivas</option>
                <option value="active">Solo activas</option>
                <option value="inactive">Solo inactivas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla mejorada de áreas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Área
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Ubicación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Servicios
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {areasEnPagina.map((area) => {
                  const serviciosActivos = area.servicios && typeof area.servicios === 'object'
                    ? Object.entries(area.servicios)
                        .filter(([_, value]) => value === true)
                        .map(([key]) => key)
                        .filter(s => ['Agua', 'Electricidad', 'WC', 'Duchas', 'Vaciado Químico', 'Vaciado Aguas Grises', 'Oferta de Restauración'].includes(s))
                    : []

                  return (
                    <tr key={area.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {area.foto_principal && (
                            <img
                              src={area.foto_principal}
                              alt={area.nombre}
                              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{area.nombre}</div>
                            <div className="text-xs text-gray-500 truncate">{area.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{area.ciudad}</div>
                        <div className="text-xs text-gray-500">{area.provincia}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800">
                          {area.tipo_area}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {area.precio_noche !== null && area.precio_noche !== undefined 
                          ? area.precio_noche === 0 
                            ? <span className="text-green-600 font-semibold">Gratis</span>
                            : <span className="font-semibold">{area.precio_noche}€</span>
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {serviciosActivos.length > 0 ? (
                            serviciosActivos.map((servicio, idx) => (
                              <div key={idx} className="inline-flex items-center">
                                {getServicioIcon(servicio)}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">Sin servicios</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-center">
                          <button
                            onClick={() => toggleVerificado(area.id, area.verificado || false)}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full w-28 justify-center ${
                              area.verificado
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                          >
                            {area.verificado ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3" />
                                Verificada
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-3 h-3" />
                                Sin verificar
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => toggleActivo(area.id, area.activo || false)}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full w-28 justify-center ${
                              area.activo
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {area.activo ? 'Activa' : 'Inactiva'}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/area/${area.slug}`}
                            target="_blank"
                            className="text-sky-600 hover:text-sky-900 p-1"
                            title="Ver en el mapa"
                          >
                            <MapPinIcon className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/areas/edit/${area.id}`}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Editar área"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(area.id, area.nombre)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Eliminar área"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {areasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay áreas</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron áreas con los filtros aplicados.
              </p>
            </div>
          )}

          {/* Paginación */}
          {areasFiltradas.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Mostrar</span>
                <select
                  value={itemsPorPagina}
                  onChange={(e) => {
                    setItemsPorPagina(Number(e.target.value))
                    setPaginaActual(1)
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">
                  por página
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Página {paginaActual} de {totalPaginas} ({areasFiltradas.length} resultados)
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="p-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="p-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Eliminación con Confirmación de Texto */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, areaId: '', areaNombre: '' })}
        onConfirm={confirmDelete}
        title="⚠️ Confirmar Eliminación"
        itemName={deleteModal.areaNombre}
        warningText="Esta acción NO se puede deshacer y eliminará el área, todas las valoraciones asociadas, todos los favoritos de usuarios y todas las visitas registradas."
      />

      {/* Modal de Mensajes (Éxito/Error) */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText="Entendido"
        showCancel={false}
      />
    </div>
  )
}
