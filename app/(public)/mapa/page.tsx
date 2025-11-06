'use client'

import { MapaInteractivo } from '@/components/mapa/MapaInteractivo'
import { FiltrosMapa, Filtros } from '@/components/mapa/FiltrosMapa'
import { ListaResultados } from '@/components/mapa/ListaResultados'
import { Navbar } from '@/components/layout/Navbar'
import BottomSheet from '@/components/mobile/BottomSheet'
import { createClient } from '@/lib/supabase/client'
import type { Area } from '@/types/database.types'
import { useEffect, useState, useMemo } from 'react'
import { MapIcon, FunnelIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import LoginWall from '@/components/ui/LoginWall'
import { usePersistentFilters } from '@/hooks/usePersistentFilters'
import { ToastNotification } from '@/components/mapa/ToastNotification'
import { reverseGeocode } from '@/lib/google/geocoding'

export default function MapaPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 })
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area | null>(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [mostrarLista, setMostrarLista] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsActive, setGpsActive] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null)
  
  // Hook de filtros persistentes (reemplaza el useState anterior)
  const { filtros, setFiltros, metadata, setMetadata, limpiarFiltros, contarFiltrosActivos } = usePersistentFilters()

  // Verificar autenticación
  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setAuthLoading(false)
    }
    
    getUser()

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Cargar áreas desde Supabase (CON CARGA PROGRESIVA)
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const supabase = createClient()
        const allAreas: Area[] = []
        const pageSize = 1000
        let page = 0
        let hasMore = true

        console.log('🔄 Cargando áreas progresivamente...')

        // Cargar en lotes de 1000 (OPTIMIZADO: solo campos necesarios)
        while (hasMore) {
          const { data, error } = await supabase
            .from('areas')
            .select('id, nombre, slug, latitud, longitud, ciudad, provincia, pais, tipo_area, precio_noche, foto_principal, servicios, plazas_totales, acceso_24h, barrera_altura')
            .eq('activo', true)
            .order('nombre')
            .range(page * pageSize, (page + 1) * pageSize - 1)

          if (error) throw error

          if (data && data.length > 0) {
            allAreas.push(...(data as Area[]))
            
            // ✅ SOLO LOGGEAR, NO ACTUALIZAR ESTADO (evita re-renders múltiples)
            console.log(`📦 Cargadas ${data.length} áreas (página ${page + 1}) - Total: ${allAreas.length}`)
            
            page++
            
            // Si recibimos menos de 1000, ya no hay más
            if (data.length < pageSize) {
              hasMore = false
            }
          } else {
            hasMore = false
          }
        }

        console.log(`✅ Total cargadas: ${allAreas.length} áreas`)
        
        // ✅ ACTUALIZAR ESTADO UNA SOLA VEZ AL FINAL (evita parpadeo)
        setAreas(allAreas)
        setLoadingProgress({ loaded: allAreas.length, total: allAreas.length })
        
        // Log de depuración para ver distribución de países
        if (process.env.NODE_ENV === 'development') {
          const porPais: Record<string, number> = {}
          allAreas.forEach(area => {
            const pais = area.pais?.trim() || 'Sin país'
            porPais[pais] = (porPais[pais] || 0) + 1
          })
          console.log('📊 Distribución de áreas por país:', porPais)
        }
      } catch (err) {
        console.error('Error cargando áreas:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAreas()
  }, [])

  // Obtener ubicación del usuario CON REVERSE GEOCODING
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          setUserLocation({ lat, lng })
          setGpsActive(true)
          
          console.log('📍 GPS activado:', { lat, lng })
          
          // Reverse Geocoding para detectar país
          try {
            const locationData = await reverseGeocode(lat, lng)
            
            if (locationData?.country) {
              console.log('🌍 País detectado:', locationData.country)
              setDetectedCountry(locationData.country)
              
              // Actualizar metadata GPS
              setMetadata({
                gpsCountry: locationData.country,
                gpsActive: true,
                paisSource: filtros.pais ? metadata.paisSource : 'gps'
              })
              
              // APLICAR FILTRO AUTOMÁTICO si no hay filtro de país previo
              if (!filtros.pais) {
                console.log('✅ Aplicando filtro automático de país:', locationData.country)
                setFiltros({
                  ...filtros,
                  pais: locationData.country
                })
                
                // Mostrar Toast Notification
                setToastMessage(`Para mejorar los tiempos de carga, hemos aplicado un filtro del país donde te encuentras. Puedes cambiarlo en los filtros si lo deseas.`)
                setShowToast(true)
              } else {
                console.log('ℹ️ Ya existe filtro de país:', filtros.pais, '- No se aplica automático')
              }
            }
          } catch (error) {
            console.error('❌ Error en reverse geocoding:', error)
            // No es crítico, continuar sin filtro automático
          }
        },
        (error) => {
          console.log('GPS no disponible:', error.message)
          setGpsActive(false)
        }
      )
    }
  }, []) // Solo ejecutar al montar

  // Obtener países únicos de las áreas
  const paisesDisponibles = useMemo(() => {
    const paises = new Set<string>()
    areas.forEach(area => {
      if (area.pais) {
        const paisNormalizado = area.pais.trim()
        paises.add(paisNormalizado)
      }
    })
    return Array.from(paises).sort()
  }, [areas])

  // Ya no necesitamos comunidades ni provincias

  // Filtrar áreas según los filtros aplicados
  const areasFiltradas = useMemo(() => {
    return areas.filter(area => {
      // Filtro de búsqueda
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase()
        const coincide = 
          area.nombre.toLowerCase().includes(busqueda) ||
          area.ciudad?.toLowerCase().includes(busqueda) ||
          area.provincia?.toLowerCase().includes(busqueda) ||
          area.descripcion?.toLowerCase().includes(busqueda)
        
        if (!coincide) return false
      }

      // Filtro de país (normalizado)
      if (filtros.pais) {
        const paisArea = area.pais?.trim() || ''
        const paisFiltro = filtros.pais.trim()
        
        // Log para depuración (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
          if (paisArea !== paisFiltro && paisArea.toLowerCase().includes('port')) {
            console.log('País no coincide:', {
              areaNombre: area.nombre,
              paisArea: `"${paisArea}"`,
              paisFiltro: `"${paisFiltro}"`,
              iguales: paisArea === paisFiltro
            })
          }
        }
        
        if (paisArea !== paisFiltro) {
          return false
        }
      }

      // Filtro de precio
      if (filtros.precio) {
        if (filtros.precio === 'gratis') {
          // Gratis: precio es exactamente 0 (confirmado gratis)
          if (area.precio_noche !== 0) {
            return false
          }
        }
        if (filtros.precio === 'de-pago') {
          // De pago: tiene un precio mayor que 0
          if (!area.precio_noche || area.precio_noche <= 0) {
            return false
          }
        }
        if (filtros.precio === 'desconocido') {
          // Desconocido: precio es null o undefined (no confirmado)
          if (area.precio_noche !== null && area.precio_noche !== undefined) {
            return false
          }
        }
      }

      // Filtro de características
      if (filtros.caracteristicas.length > 0) {
        if (filtros.caracteristicas.includes('verificado') && !area.verificado) {
          return false
        }
        if (filtros.caracteristicas.includes('con_descuento_furgocasa') && !area.con_descuento_furgocasa) {
          return false
        }
      }

      // Filtro de servicios
      if (filtros.servicios.length > 0) {
        const serviciosArea = area.servicios as Record<string, boolean>
        const tieneServicios = filtros.servicios.every(
          servicio => serviciosArea && serviciosArea[servicio] === true
        )
        if (!tieneServicios) return false
      }

      return true
    })
  }, [areas, filtros])

  const handleAreaClick = (area: Area) => {
    setAreaSeleccionada(area)
    // En móvil se muestra el InfoWindow del mapa, no se abre la lista
  }

  // Mostrar loading mientras comprobamos autenticación
  if (authLoading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading && areas.length === 0) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
        <Navbar />
        
        {/* Skeleton del mapa con animación */}
        <div className="flex-1 relative">
          {/* Fondo con patrón de mapa */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          {/* Indicador de carga centrado */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
              {/* Icono de mapa animado */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <MapIcon className="w-16 h-16 text-sky-600 animate-pulse" />
                  <div className="absolute inset-0 animate-ping opacity-20">
                    <MapIcon className="w-16 h-16 text-sky-600" />
                  </div>
                </div>
              </div>
              
              {/* Texto */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Cargando Mapa
              </h2>
              <p className="text-gray-600 text-center mb-6">
                {loadingProgress.loaded > 0 
                  ? `${loadingProgress.loaded} áreas cargadas...`
                  : 'Preparando tu mapa de autocaravanas...'}
              </p>
              
              {/* Barra de progreso */}
              {loadingProgress.loaded > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                    style={{ 
                      width: `${Math.min((loadingProgress.loaded / 5000) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              )}
              
              {/* Spinner */}
              <div className="flex justify-center mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Navbar - siempre visible */}
      <Navbar />
      
      {/* Layout principal - difuminado si no hay usuario */}
      <main className={`flex-1 relative flex overflow-hidden min-h-0 ${!user ? 'blur-sm pointer-events-none select-none' : ''}`}>
        {/* Panel de Filtros - Desktop y Tablet */}
        <aside className="hidden md:block md:w-72 lg:w-80 bg-white shadow-lg border-r overflow-y-auto">
          <FiltrosMapa
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onClose={() => {}}
            totalResultados={areasFiltradas.length}
            paisesDisponibles={paisesDisponibles}
          />
        </aside>

        {/* Mapa - Centro */}
        <div className="flex-1 relative">
          <MapaInteractivo
            areas={areasFiltradas}
            areaSeleccionada={areaSeleccionada}
            onAreaClick={handleAreaClick}
          />


          {/* Contador de resultados con indicador de carga */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
            <p className="text-sm font-semibold text-gray-700">
              {areasFiltradas.length} {areasFiltradas.length === 1 ? 'área' : 'áreas'}
              {loading && (
                <span className="ml-2 inline-flex items-center">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-sky-600"></span>
                  <span className="ml-1 text-xs text-gray-500">cargando...</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Panel de Resultados - Desktop y Tablet */}
        <aside className="hidden md:block md:w-80 lg:w-96 bg-white shadow-lg border-l overflow-y-auto">
          <ListaResultados
            areas={areasFiltradas}
            onAreaClick={handleAreaClick}
            onClose={() => {}}
            userLocation={userLocation}
            gpsActive={gpsActive}
          />
        </aside>
      </main>

      {/* Modal de bloqueo si no hay usuario */}
      {!user && <LoginWall feature="mapa" />}

      {/* Toast Notification para GPS */}
      <ToastNotification
        show={showToast}
        message={toastMessage}
        country={detectedCountry || undefined}
        onClose={() => setShowToast(false)}
        onViewFilters={() => setMostrarFiltros(true)}
      />

      {/* Bottom Sheet - Filtros (solo móvil) */}
      <BottomSheet
        isOpen={mostrarFiltros}
        onClose={() => setMostrarFiltros(false)}
        title="Filtros"
        snapPoints={['full']}
      >
        <FiltrosMapa
          filtros={filtros}
          onFiltrosChange={setFiltros}
          onClose={() => setMostrarFiltros(false)}
          totalResultados={areasFiltradas.length}
          paisesDisponibles={paisesDisponibles}
        />
      </BottomSheet>

      {/* Bottom Sheet - Lista (solo móvil) */}
      <BottomSheet
        isOpen={mostrarLista}
        onClose={() => setMostrarLista(false)}
        title={`${areasFiltradas.length} Lugares`}
        snapPoints={['full', 'half']}
      >
        <ListaResultados
          areas={areasFiltradas}
          onAreaClick={handleAreaClick}
          onClose={() => setMostrarLista(false)}
          userLocation={userLocation}
          gpsActive={gpsActive}
        />
      </BottomSheet>

      {/* Bottom Bar (solo móvil) - Mapa, Filtros, Lista */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Mapa */}
          <button
            onClick={() => {
              setMostrarFiltros(false)
              setMostrarLista(false)
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              !mostrarFiltros && !mostrarLista ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <MapIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Mapa</span>
          </button>

          {/* Filtros */}
          <button
            onClick={() => setMostrarFiltros(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              mostrarFiltros ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <FunnelIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Filtros</span>
          </button>

          {/* Lista */}
          <button
            onClick={() => setMostrarLista(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
              mostrarLista ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <div className="relative">
              <ListBulletIcon className="w-6 h-6 mb-1" />
              {areasFiltradas.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center">
                  {areasFiltradas.length > 99 ? '99+' : areasFiltradas.length}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Lista</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
