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

export default function MapaPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area | null>(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [mostrarLista, setMostrarLista] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsActive, setGpsActive] = useState(false)
  
  const [filtros, setFiltros] = useState<Filtros>({
    busqueda: '',
    pais: '',
    provincia: '',
    servicios: [],
    precio: '',
    caracteristicas: []
  })

  // Cargar áreas desde Supabase
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('areas')
          .select('*')
          .eq('activo', true)
          .order('nombre')

        if (error) throw error

        setAreas(data || [])
      } catch (err) {
        console.error('Error cargando áreas:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAreas()
  }, [])

  // Obtener ubicación del usuario
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setGpsActive(true)
        },
        (error) => {
          console.log('GPS no disponible:', error.message)
          setGpsActive(false)
        }
      )
    }
  }, [])

  // Obtener países únicos de las áreas
  const paisesDisponibles = useMemo(() => {
    const paises = new Set<string>()
    areas.forEach(area => {
      if (area.pais) {
        paises.add(area.pais)
      }
    })
    return Array.from(paises).sort()
  }, [areas])

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

      // Filtro de país
      if (filtros.pais && area.pais !== filtros.pais) {
        return false
      }

      // Filtro de provincia
      if (filtros.provincia && area.provincia !== filtros.provincia) {
        return false
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Cargando áreas...</p>
        </div>
      </div>
    )
  }

  // Prevenir scroll en esta página (app-like)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar - siempre visible */}
      <Navbar />
      
      {/* Layout principal */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* Panel de Filtros - Solo Desktop */}
        <aside className="hidden lg:block w-80 bg-white shadow-lg border-r overflow-y-auto">
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


          {/* Contador de resultados - Visible en móvil y desktop */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
            <p className="text-sm font-semibold text-gray-700">
              {areasFiltradas.length} {areasFiltradas.length === 1 ? 'área' : 'áreas'}
            </p>
          </div>
        </div>

        {/* Panel de Resultados - Solo Desktop */}
        <aside className="hidden lg:block w-96 bg-white shadow-lg border-l overflow-y-auto">
          <ListaResultados
            areas={areasFiltradas}
            onAreaClick={handleAreaClick}
            onClose={() => {}}
            userLocation={userLocation}
            gpsActive={gpsActive}
          />
        </aside>
      </main>

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
