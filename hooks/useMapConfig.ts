'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface MapConfig {
  proveedor: 'google' | 'maplibre' | 'leaflet'
  estilo: 'default' | 'waze' | 'satellite' | 'dark'
  activo: boolean
}

const DEFAULT_CONFIG: MapConfig = {
  proveedor: 'google',
  estilo: 'default',
  activo: true
}

/**
 * Hook para obtener la configuración activa del mapa desde Supabase
 * Si no hay configuración, devuelve valores por defecto
 */
export function useMapConfig() {
  const [config, setConfig] = useState<MapConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('configuracion_mapas')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.warn('⚠️ No hay configuración de mapas, usando default:', error.message)
        setConfig(DEFAULT_CONFIG)
      } else if (data) {
        console.log('✅ Configuración de mapa cargada:', data)
        setConfig({
          proveedor: data.proveedor as MapConfig['proveedor'],
          estilo: data.estilo as MapConfig['estilo'],
          activo: data.activo
        })
      }
    } catch (err) {
      console.error('❌ Error cargando configuración de mapa:', err)
      setConfig(DEFAULT_CONFIG)
    } finally {
      setLoading(false)
    }
  }

  return { config, loading, refresh: fetchConfig }
}
