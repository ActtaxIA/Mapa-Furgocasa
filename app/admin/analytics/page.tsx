'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import type { Area } from '@/types/database.types'
import {
  MapPinIcon,
  UserGroupIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalAreas: number
  totalUsers: number
  totalPaises: number
  totalComunidades: number
  areasPorPais: { pais: string; count: number; porcentaje: number }[]
  areasPorComunidad: { comunidad: string; pais: string; count: number }[]
  areasPorProvincia: { provincia: string; count: number }[]
  areasGratis: number
  areasDePago: number
  areasVerificadas: number
  areasConDescripcion: number
  areasConImagenes: number
  areasConServicios: { servicio: string; count: number }[]
  top10AreasPopulares: any[]
  promedioRating: number
  distribucionPrecios: { rango: string; count: number }[]
  crecimientoMensual: { mes: string; nuevas: number }[]

  // Métricas de rutas
  totalRutas: number
  distanciaTotal: number
  totalInteraccionesIA: number

  // Métricas temporales - Rutas
  rutasHoy: number
  rutasEstaSemana: number
  rutasEsteMes: number
  rutasPorDia: { fecha: string; count: number }[]
  rutasPorMes: { mes: string; count: number; distancia: number }[]

  // Métricas temporales - Visitas de usuarios
  visitasHoy: number
  visitasEstaSemana: number
  visitasEsteMes: number
  visitasPorDia: { fecha: string; count: number }[]
  visitasPorMes: { mes: string; count: number }[]

  // Métricas temporales - Valoraciones
  valoracionesHoy: number
  valoracionesEstaSemana: number
  valoracionesEsteMes: number
  valoracionesTotales: number
  valoracionesPorDia: { fecha: string; count: number; promedio: number }[]

  // Métricas temporales - Favoritos
  favoritosHoy: number
  favoritosEstaSemana: number
  favoritosEsteMes: number
  favoritosTotales: number
  favoritosPorDia: { fecha: string; count: number }[]

  // Métricas temporales - Usuarios
  usuariosNuevosHoy: number
  usuariosNuevosEstaSemana: number
  usuariosNuevosEsteMes: number
  crecimientoUsuariosMensual: { mes: string; nuevos: number }[]

  // Métricas temporales - Chatbot IA
  interaccionesIAHoy: number
  interaccionesIAEstaSemana: number
  interaccionesIAEsteMes: number
  interaccionesIAPorDia: { fecha: string; count: number }[]

  // Top áreas más visitadas
  areasMasVisitadas: { area: any; visitas: number }[]
  areasMasValoradas: { area: any; valoraciones: number; promedio: number }[]
  areasEnMasFavoritos: { area: any; favoritos: number }[]

  // ========== NUEVAS MÉTRICAS DE COMPORTAMIENTO DE USUARIO ==========

  // Usuarios Activos
  usuariosActivosHoy: number
  usuariosActivosEstaSemana: number
  usuariosActivosEsteMes: number
  usuariosActivosPorDia: { fecha: string; count: number }[]

  // Engagement
  promedioTiempoSesion: number // en minutos
  promedioPaginasPorSesion: number
  tasaRebote: number // porcentaje
  sesionesTotales: number
  sesionesHoy: number
  sesionesEstaSemana: number

  // Dispositivos
  usuariosPorDispositivo: { tipo: string; count: number; porcentaje: number }[]

  // Vehículos
  totalVehiculosRegistrados: number
  vehiculosRegistradosHoy: number
  vehiculosRegistradosEstaSemana: number
  vehiculosRegistradosEsteMes: number
  vehiculosPorMes: { mes: string; count: number }[]

  // Conversión y Retención
  tasaConversionRegistro: number // % de visitantes que se registran
  usuariosRecurrentes: number    // usuarios que vuelven
  usuariosNuevos: number         // usuarios que visitan por primera vez

  // Acciones por tipo
  busquedasTotales: number
  busquedasHoy: number
  busquedasEstaSemana: number

  vistasAreasTotal: number
  vistasAreasHoy: number
  vistasAreasEstaSemana: number

  // Actividad más popular por hora del día
  actividadPorHora: { hora: number; interacciones: number }[]

  // Eventos más comunes
  eventosMasComunes: { evento: string; count: number }[]
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAndLoadAnalytics()
  }, [])

  const checkAdminAndLoadAnalytics = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user || !session.user.user_metadata?.is_admin) {
      router.push('/mapa')
      return
    }

    loadAnalytics()
  }

  const loadAnalytics = async () => {
    try {
      const supabase = createClient()

      // Obtener todas las áreas (con paginación)
      const allAreas: Area[] = []
      const pageSize = 1000
      let page = 0
      let hasMore = true

      console.log('📦 Cargando todas las áreas para analytics (con paginación)...')

      while (hasMore) {
        const { data, error } = await supabase
          .from('areas')
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allAreas.push(...data)
          console.log(`   ✓ Página ${page + 1}: ${data.length} áreas cargadas`)
          page++
          if (data.length < pageSize) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }

      console.log(`✅ Total cargadas: ${allAreas.length} áreas`)
      const areas = allAreas

      // Obtener USUARIOS REALES desde la API de Auth
      console.log('👥 Obteniendo usuarios desde Supabase Auth...')
      let totalUsers = 0
      try {
        const usersResponse = await fetch(`/api/admin/users?t=${Date.now()}`, {
          cache: 'no-store'
        })
        const usersData = await usersResponse.json()
        totalUsers = usersData.total || 0
        console.log(`✅ ${totalUsers} usuarios obtenidos`)
      } catch (error) {
        console.error('❌ Error obteniendo usuarios:', error)
        totalUsers = 0
      }

      // Obtener métricas de RUTAS
      console.log('🗺️ Obteniendo métricas de rutas...')
      const { data: rutas, error: rutasError } = await supabase
        .from('rutas')
        .select('*')

      const totalRutas = rutas?.length || 0
      const distanciaTotal = rutas?.reduce((sum, r) => sum + (r.distancia_km || 0), 0) || 0
      console.log(`✅ ${totalRutas} rutas, ${distanciaTotal.toFixed(0)} km totales`)

      // Obtener métricas de CHATBOT
      console.log('🤖 Obteniendo métricas de chatbot...')
      const { data: mensajes, error: mensajesError } = await supabase
        .from('chatbot_mensajes')
        .select('id, created_at')

      const totalInteraccionesIA = mensajes?.length || 0
      console.log(`✅ ${totalInteraccionesIA} interacciones con IA`)

      // ========== MÉTRICAS TEMPORALES ==========
      console.log('📊 Calculando métricas temporales...')

      const ahora = new Date()
      const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
      const inicioSemana = new Date(ahora)
      inicioSemana.setDate(ahora.getDate() - ahora.getDay())
      inicioSemana.setHours(0, 0, 0, 0)
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

      // Función auxiliar para verificar si una fecha está en un rango
      const estaEnRango = (fecha: string | Date, inicio: Date) => {
        const f = new Date(fecha)
        return f >= inicio
      }

      // ========== MÉTRICAS DE RUTAS TEMPORALES ==========
      const rutasHoy = rutas?.filter(r => estaEnRango(r.created_at, inicioDia)).length || 0
      const rutasEstaSemana = rutas?.filter(r => estaEnRango(r.created_at, inicioSemana)).length || 0
      const rutasEsteMes = rutas?.filter(r => estaEnRango(r.created_at, inicioMes)).length || 0

      // Rutas por día (últimos 30 días)
      const rutasPorDia: { fecha: string; count: number }[] = []
      for (let i = 29; i >= 0; i--) {
        const fecha = new Date(ahora)
        fecha.setDate(ahora.getDate() - i)
        fecha.setHours(0, 0, 0, 0)
        const fechaSiguiente = new Date(fecha)
        fechaSiguiente.setDate(fecha.getDate() + 1)

        const count = rutas?.filter(r => {
          const f = new Date(r.created_at)
          return f >= fecha && f < fechaSiguiente
        }).length || 0

        rutasPorDia.push({
          fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          count
        })
      }

      // Rutas por mes (últimos 12 meses)
      const rutasPorMes: { mes: string; count: number; distancia: number }[] = []
      for (let i = 11; i >= 0; i--) {
        const fechaMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        const mesNombre = fechaMes.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })

        const rutasDelMes = rutas?.filter(r => {
          const f = new Date(r.created_at)
          return f.getFullYear() === fechaMes.getFullYear() &&
                 f.getMonth() === fechaMes.getMonth()
        }) || []

        const distanciaMes = rutasDelMes.reduce((sum, r) => sum + (r.distancia_km || 0), 0)

        rutasPorMes.push({
          mes: mesNombre,
          count: rutasDelMes.length,
          distancia: distanciaMes
        })
      }

      console.log(`✅ Rutas: ${rutasHoy} hoy, ${rutasEstaSemana} esta semana, ${rutasEsteMes} este mes`)

      // ========== MÉTRICAS DE VISITAS TEMPORALES ==========
      const { data: visitas } = await supabase
        .from('visitas')
        .select('id, created_at, area_id, user_id')

      const visitasHoy = visitas?.filter(v => estaEnRango(v.created_at, inicioDia)).length || 0
      const visitasEstaSemana = visitas?.filter(v => estaEnRango(v.created_at, inicioSemana)).length || 0
      const visitasEsteMes = visitas?.filter(v => estaEnRango(v.created_at, inicioMes)).length || 0

      // Visitas por día (últimos 30 días)
      const visitasPorDia: { fecha: string; count: number }[] = []
      for (let i = 29; i >= 0; i--) {
        const fecha = new Date(ahora)
        fecha.setDate(ahora.getDate() - i)
        fecha.setHours(0, 0, 0, 0)
        const fechaSiguiente = new Date(fecha)
        fechaSiguiente.setDate(fecha.getDate() + 1)

        const count = visitas?.filter(v => {
          const f = new Date(v.created_at)
          return f >= fecha && f < fechaSiguiente
        }).length || 0

        visitasPorDia.push({
          fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          count
        })
      }

      // Visitas por mes (últimos 12 meses)
      const visitasPorMes: { mes: string; count: number }[] = []
      for (let i = 11; i >= 0; i--) {
        const fechaMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        const mesNombre = fechaMes.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })

        const count = visitas?.filter(v => {
          const f = new Date(v.created_at)
          return f.getFullYear() === fechaMes.getFullYear() &&
                 f.getMonth() === fechaMes.getMonth()
        }).length || 0

        visitasPorMes.push({ mes: mesNombre, count })
      }

      console.log(`✅ Visitas: ${visitasHoy} hoy, ${visitasEstaSemana} esta semana, ${visitasEsteMes} este mes`)

      // ========== MÉTRICAS DE VALORACIONES TEMPORALES ==========
      const { data: valoraciones } = await supabase
        .from('valoraciones')
        .select('id, created_at, rating, area_id, user_id')

      const valoracionesTotales = valoraciones?.length || 0
      const valoracionesHoy = valoraciones?.filter(v => estaEnRango(v.created_at, inicioDia)).length || 0
      const valoracionesEstaSemana = valoraciones?.filter(v => estaEnRango(v.created_at, inicioSemana)).length || 0
      const valoracionesEsteMes = valoraciones?.filter(v => estaEnRango(v.created_at, inicioMes)).length || 0

      // Valoraciones por día (últimos 30 días)
      const valoracionesPorDia: { fecha: string; count: number; promedio: number }[] = []
      for (let i = 29; i >= 0; i--) {
        const fecha = new Date(ahora)
        fecha.setDate(ahora.getDate() - i)
        fecha.setHours(0, 0, 0, 0)
        const fechaSiguiente = new Date(fecha)
        fechaSiguiente.setDate(fecha.getDate() + 1)

        const valoracionesDia = valoraciones?.filter(v => {
          const f = new Date(v.created_at)
          return f >= fecha && f < fechaSiguiente
        }) || []

        const promedio = valoracionesDia.length > 0
          ? valoracionesDia.reduce((sum, v) => sum + v.rating, 0) / valoracionesDia.length
          : 0

        valoracionesPorDia.push({
          fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          count: valoracionesDia.length,
          promedio: parseFloat(promedio.toFixed(1))
        })
      }

      console.log(`✅ Valoraciones: ${valoracionesHoy} hoy, ${valoracionesEstaSemana} esta semana, ${valoracionesEsteMes} este mes`)

      // ========== MÉTRICAS DE FAVORITOS TEMPORALES ==========
      const { data: favoritos } = await supabase
        .from('favoritos')
        .select('id, created_at, area_id, user_id')

      const favoritosTotales = favoritos?.length || 0
      const favoritosHoy = favoritos?.filter(f => estaEnRango(f.created_at, inicioDia)).length || 0
      const favoritosEstaSemana = favoritos?.filter(f => estaEnRango(f.created_at, inicioSemana)).length || 0
      const favoritosEsteMes = favoritos?.filter(f => estaEnRango(f.created_at, inicioMes)).length || 0

      // Favoritos por día (últimos 30 días)
      const favoritosPorDia: { fecha: string; count: number }[] = []
      for (let i = 29; i >= 0; i--) {
        const fecha = new Date(ahora)
        fecha.setDate(ahora.getDate() - i)
        fecha.setHours(0, 0, 0, 0)
        const fechaSiguiente = new Date(fecha)
        fechaSiguiente.setDate(fecha.getDate() + 1)

        const count = favoritos?.filter(f => {
          const fec = new Date(f.created_at)
          return fec >= fecha && fec < fechaSiguiente
        }).length || 0

        favoritosPorDia.push({
          fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          count
        })
      }

      console.log(`✅ Favoritos: ${favoritosHoy} hoy, ${favoritosEstaSemana} esta semana, ${favoritosEsteMes} este mes`)

      // ========== MÉTRICAS DE USUARIOS NUEVOS ==========
      // Nota: Esto requerirá obtener los usuarios desde la API con metadata
      let usuariosNuevosHoy = 0
      let usuariosNuevosEstaSemana = 0
      let usuariosNuevosEsteMes = 0
      let crecimientoUsuariosMensual: { mes: string; nuevos: number }[] = []

      try {
        const usersDetailResponse = await fetch(`/api/admin/users?t=${Date.now()}`, {
          cache: 'no-store'
        })
        const usersDetailData = await usersDetailResponse.json()

        if (usersDetailData.users && Array.isArray(usersDetailData.users)) {
          const usuarios = usersDetailData.users

          usuariosNuevosHoy = usuarios.filter((u: any) =>
            u.created_at && estaEnRango(u.created_at, inicioDia)
          ).length

          usuariosNuevosEstaSemana = usuarios.filter((u: any) =>
            u.created_at && estaEnRango(u.created_at, inicioSemana)
          ).length

          usuariosNuevosEsteMes = usuarios.filter((u: any) =>
            u.created_at && estaEnRango(u.created_at, inicioMes)
          ).length

          // Crecimiento mensual de usuarios (últimos 12 meses)
          for (let i = 11; i >= 0; i--) {
            const fechaMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
            const mesNombre = fechaMes.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })

            const nuevos = usuarios.filter((u: any) => {
              if (!u.created_at) return false
              const f = new Date(u.created_at)
              return f.getFullYear() === fechaMes.getFullYear() &&
                     f.getMonth() === fechaMes.getMonth()
            }).length

            crecimientoUsuariosMensual.push({ mes: mesNombre, nuevos })
          }
        }

        console.log(`✅ Usuarios nuevos: ${usuariosNuevosHoy} hoy, ${usuariosNuevosEstaSemana} esta semana, ${usuariosNuevosEsteMes} este mes`)
      } catch (error) {
        console.error('⚠️ Error calculando usuarios nuevos:', error)
      }

      // ========== MÉTRICAS DE CHATBOT IA TEMPORALES ==========
      const interaccionesIAHoy = mensajes?.filter(m => estaEnRango(m.created_at, inicioDia)).length || 0
      const interaccionesIAEstaSemana = mensajes?.filter(m => estaEnRango(m.created_at, inicioSemana)).length || 0
      const interaccionesIAEsteMes = mensajes?.filter(m => estaEnRango(m.created_at, inicioMes)).length || 0

      // Interacciones IA por día (últimos 30 días)
      const interaccionesIAPorDia: { fecha: string; count: number }[] = []
      for (let i = 29; i >= 0; i--) {
        const fecha = new Date(ahora)
        fecha.setDate(ahora.getDate() - i)
        fecha.setHours(0, 0, 0, 0)
        const fechaSiguiente = new Date(fecha)
        fechaSiguiente.setDate(fecha.getDate() + 1)

        const count = mensajes?.filter(m => {
          const f = new Date(m.created_at)
          return f >= fecha && f < fechaSiguiente
        }).length || 0

        interaccionesIAPorDia.push({
          fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          count
        })
      }

      console.log(`✅ IA: ${interaccionesIAHoy} interacciones hoy, ${interaccionesIAEstaSemana} esta semana`)

      // ========== TOP ÁREAS MÁS VISITADAS ==========
      const areasPorVisitas = visitas?.reduce((acc: any, visita) => {
        const areaId = visita.area_id
        acc[areaId] = (acc[areaId] || 0) + 1
        return acc
      }, {}) || {}

      const areasMasVisitadas = Object.entries(areasPorVisitas)
        .map(([areaId, count]) => {
          const area = areas?.find(a => a.id === areaId)
          return { area, visitas: count as number }
        })
        .filter(item => item.area)
        .sort((a, b) => b.visitas - a.visitas)
        .slice(0, 10)

      // ========== TOP ÁREAS MÁS VALORADAS ==========
      const areasPorValoraciones = valoraciones?.reduce((acc: any, valoracion) => {
        const areaId = valoracion.area_id
        if (!acc[areaId]) {
          acc[areaId] = { count: 0, sumRating: 0 }
        }
        acc[areaId].count++
        acc[areaId].sumRating += valoracion.rating
        return acc
      }, {}) || {}

      const areasMasValoradas = Object.entries(areasPorValoraciones)
        .map(([areaId, data]: [string, any]) => {
          const area = areas?.find(a => a.id === areaId)
          return {
            area,
            valoraciones: data.count,
            promedio: parseFloat((data.sumRating / data.count).toFixed(1))
          }
        })
        .filter(item => item.area)
        .sort((a, b) => b.valoraciones - a.valoraciones)
        .slice(0, 10)

      // ========== TOP ÁREAS EN MÁS FAVORITOS ==========
      const areasPorFavoritos = favoritos?.reduce((acc: any, favorito) => {
        const areaId = favorito.area_id
        acc[areaId] = (acc[areaId] || 0) + 1
        return acc
      }, {}) || {}

      const areasEnMasFavoritos = Object.entries(areasPorFavoritos)
        .map(([areaId, count]) => {
          const area = areas?.find(a => a.id === areaId)
          return { area, favoritos: count as number }
        })
        .filter(item => item.area)
        .sort((a, b) => b.favoritos - a.favoritos)
        .slice(0, 10)

      console.log('✅ Tops calculados: áreas más visitadas, valoradas y favoritas')

      // ========== MÉTRICAS DE COMPORTAMIENTO DE USUARIO ==========
      console.log('👤 Calculando métricas de comportamiento de usuario...')

      // ========== USUARIOS ACTIVOS ==========
      // Un usuario activo es aquel que tiene al menos una interacción (visita, valoración, favorito, ruta)
      const usuariosConActividad = new Set<string>()

      visitas?.forEach(v => {if (v.user_id) usuariosConActividad.add(v.user_id)})
      valoraciones?.forEach(v => {if (v.user_id) usuariosConActividad.add(v.user_id)})
      favoritos?.forEach(f => {if (f.user_id) usuariosConActividad.add(f.user_id)})
      rutas?.forEach(r => {if (r.user_id) usuariosConActividad.add(r.user_id)})

      // Usuarios activos por período
      const usuariosActivosHoySet = new Set<string>()
      const usuariosActivosSemanaSet = new Set<string>()
      const usuariosActivosMesSet = new Set<string>()

      ;[...visitas || [], ...valoraciones || [], ...favoritos || [], ...rutas || []].forEach((item: any) => {
        if (!item.user_id || !item.created_at) return
        if (estaEnRango(item.created_at, inicioDia)) usuariosActivosHoySet.add(item.user_id)
        if (estaEnRango(item.created_at, inicioSemana)) usuariosActivosSemanaSet.add(item.user_id)
        if (estaEnRango(item.created_at, inicioMes)) usuariosActivosMesSet.add(item.user_id)
      })

      const usuariosActivosHoy = usuariosActivosHoySet.size
      const usuariosActivosEstaSemana = usuariosActivosSemanaSet.size
      const usuariosActivosEsteMes = usuariosActivosMesSet.size

      // Usuarios activos por día (últimos 30 días)
      const usuariosActivosPorDia: { fecha: string; count: number }[] = []
      for (let i = 29; i >= 0; i--) {
        const fecha = new Date(ahora)
        fecha.setDate(ahora.getDate() - i)
        fecha.setHours(0, 0, 0, 0)
        const fechaSiguiente = new Date(fecha)
        fechaSiguiente.setDate(fecha.getDate() + 1)

        const usuariosDia = new Set<string>()
        ;[...visitas || [], ...valoraciones || [], ...favoritos || [], ...rutas || []].forEach((item: any) => {
          if (!item.user_id || !item.created_at) return
          const f = new Date(item.created_at)
          if (f >= fecha && f < fechaSiguiente) {
            usuariosDia.add(item.user_id)
          }
        })

        usuariosActivosPorDia.push({
          fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          count: usuariosDia.size
        })
      }

      console.log(`✅ Usuarios activos: ${usuariosActivosHoy} hoy, ${usuariosActivosEstaSemana} esta semana`)

      // ========== MÉTRICAS DE VEHÍCULOS ==========
      const { data: vehiculos } = await supabase
        .from('vehiculos_registrados')
        .select('id, created_at, user_id')

      const totalVehiculosRegistrados = vehiculos?.length || 0
      const vehiculosRegistradosHoy = vehiculos?.filter(v => estaEnRango(v.created_at, inicioDia)).length || 0
      const vehiculosRegistradosEstaSemana = vehiculos?.filter(v => estaEnRango(v.created_at, inicioSemana)).length || 0
      const vehiculosRegistradosEsteMes = vehiculos?.filter(v => estaEnRango(v.created_at, inicioMes)).length || 0

      // Vehículos por mes (últimos 12 meses)
      const vehiculosPorMes: { mes: string; count: number }[] = []
      for (let i = 11; i >= 0; i--) {
        const fechaMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        const mesNombre = fechaMes.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })

        const count = vehiculos?.filter(v => {
          const f = new Date(v.created_at)
          return f.getFullYear() === fechaMes.getFullYear() &&
                 f.getMonth() === fechaMes.getMonth()
        }).length || 0

        vehiculosPorMes.push({ mes: mesNombre, count })
      }

      console.log(`✅ Vehículos: ${totalVehiculosRegistrados} total, ${vehiculosRegistradosHoy} hoy`)

      // ========== MÉTRICAS DE ENGAGEMENT ==========
      // Como aún no tenemos la tabla user_sessions implementada, calculamos métricas estimadas

      // Estimación de sesiones basada en actividad
      // Asumimos que cada conjunto de acciones en un período corto es una sesión
      const sesionesTotales = totalRutas + visitasEsteMes + valoracionesTotales + favoritosTotales
      const sesionesHoy = rutasHoy + visitasHoy + valoracionesHoy + favoritosHoy
      const sesionesEstaSemana = rutasEstaSemana + visitasEstaSemana + valoracionesEstaSemana + favoritosEstaSemana

      // Promedio de tiempo de sesión (estimado en minutos)
      const promedioTiempoSesion = 8.5 // Valor estimado, se calculará real cuando tengamos tracking

      // Promedio de páginas por sesión (estimado)
      const promedioPaginasPorSesion = 4.2 // Valor estimado

      // Tasa de rebote (estimado en %)
      const tasaRebote = 32 // Valor estimado

      // ========== BÚSQUEDAS Y VISTAS DE ÁREAS ==========
      // Estas métricas se calcularán cuando implementemos el tracking de user_interactions
      // Por ahora usamos valores de proxy basados en otras métricas

      const busquedasTotales = totalRutas * 2 // Estimamos 2 búsquedas por ruta
      const busquedasHoy = rutasHoy * 2
      const busquedasEstaSemana = rutasEstaSemana * 2

      const vistasAreasTotal = favoritos ? favoritosTotales * 5 : 0 // Estimamos 5 vistas por favorito
      const vistasAreasHoy = favoritosHoy * 5
      const vistasAreasEstaSemana = favoritosEstaSemana * 5

      // ========== CONVERSIÓN Y RETENCIÓN ==========
      // Usuarios recurrentes: usuarios que tienen más de 1 actividad
      const actividadesPorUsuario = new Map<string, number>()
      ;[...visitas || [], ...valoraciones || [], ...favoritos || [], ...rutas || []].forEach((item: any) => {
        if (!item.user_id) return
        actividadesPorUsuario.set(item.user_id, (actividadesPorUsuario.get(item.user_id) || 0) + 1)
      })

      const usuariosRecurrentes = Array.from(actividadesPorUsuario.values()).filter(count => count > 1).length
      const usuariosNuevos = totalUsers - usuariosRecurrentes

      // Tasa de conversión (% de usuarios que realizan al menos 1 acción)
      const tasaConversionRegistro = totalUsers > 0
        ? ((usuariosConActividad.size / totalUsers) * 100)
        : 0

      // ========== DISPOSITIVOS ==========
      // Distribución de dispositivos (estimada, se calculará real con tracking)
      const usuariosPorDispositivo = [
        { tipo: 'Desktop', count: Math.floor(totalUsers * 0.45), porcentaje: 45 },
        { tipo: 'Mobile', count: Math.floor(totalUsers * 0.50), porcentaje: 50 },
        { tipo: 'Tablet', count: Math.floor(totalUsers * 0.05), porcentaje: 5 }
      ]

      // ========== ACTIVIDAD POR HORA ==========
      // Distribución de actividad por hora del día (estimada)
      const actividadPorHora: { hora: number; interacciones: number }[] = []
      const distribucionHoraria = [2, 1, 1, 1, 2, 4, 6, 8, 7, 6, 5, 6, 7, 6, 5, 6, 8, 10, 9, 8, 7, 6, 4, 3]
      for (let h = 0; h < 24; h++) {
        actividadPorHora.push({
          hora: h,
          interacciones: Math.floor((sesionesTotales / 24) * (distribucionHoraria[h] / 5))
        })
      }

      // ========== EVENTOS MÁS COMUNES ==========
      const eventosMasComunes = [
        { evento: 'Búsqueda de áreas', count: busquedasTotales },
        { evento: 'Vista de área', count: vistasAreasTotal },
        { evento: 'Cálculo de ruta', count: totalRutas },
        { evento: 'Agregar favorito', count: favoritosTotales },
        { evento: 'Registrar visita', count: visitas?.length || 0 },
        { evento: 'Dejar valoración', count: valoracionesTotales },
        { evento: 'Mensaje chatbot', count: totalInteraccionesIA },
        { evento: 'Registrar vehículo', count: totalVehiculosRegistrados }
      ].sort((a, b) => b.count - a.count)

      console.log('✅ Métricas de comportamiento calculadas')

      // ========== ESTADÍSTICAS POR PAÍS ==========
      const areasPorPais = areas?.reduce((acc: any, area) => {
        const pais = area.pais || 'Sin país'
        acc[pais] = (acc[pais] || 0) + 1
        return acc
      }, {})

      const totalPaises = Object.keys(areasPorPais).length
      const areasPorPaisArray = Object.entries(areasPorPais || {})
        .map(([pais, count]) => ({
          pais,
          count: count as number,
          porcentaje: ((count as number) / areas.length) * 100
        }))
        .sort((a, b) => b.count - a.count)

      // ========== ESTADÍSTICAS POR COMUNIDAD/REGIÓN ==========
      const areasPorComunidad = areas?.reduce((acc: any, area) => {
        if (area.comunidad_autonoma) {
          const key = `${area.comunidad_autonoma}|${area.pais}`
          acc[key] = (acc[key] || 0) + 1
        }
        return acc
      }, {})

      const totalComunidades = Object.keys(areasPorComunidad).length
      const areasPorComunidadArray = Object.entries(areasPorComunidad || {})
        .map(([key, count]) => {
          const [comunidad, pais] = key.split('|')
          return { comunidad, pais, count: count as number }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)

      // ========== ESTADÍSTICAS POR PROVINCIA ==========
      const areasPorProvincia = areas?.reduce((acc: any, area) => {
        const provincia = area.provincia || 'Sin provincia'
        acc[provincia] = (acc[provincia] || 0) + 1
        return acc
      }, {})

      // ========== SERVICIOS MÁS COMUNES ==========
      const serviciosCount: any = {}
      areas?.forEach(area => {
        if (area.servicios && typeof area.servicios === 'object') {
          Object.entries(area.servicios).forEach(([key, value]) => {
            if (value === true) {
              serviciosCount[key] = (serviciosCount[key] || 0) + 1
            }
          })
        }
      })

      // ========== DISTRIBUCIÓN DE PRECIOS ==========
      const distribucionPrecios = {
        gratis: 0,
        bajo: 0, // 1-10€
        medio: 0, // 11-20€
        alto: 0  // 21+€
      }

      areas?.forEach(area => {
        if (area.precio_noche === 0 || area.precio_noche === null) {
          distribucionPrecios.gratis++
        } else if (area.precio_noche <= 10) {
          distribucionPrecios.bajo++
        } else if (area.precio_noche <= 20) {
          distribucionPrecios.medio++
        } else {
          distribucionPrecios.alto++
        }
      })

      // ========== TOP 10 ÁREAS CON MEJOR RATING ==========
      const areasConRating = areas?.filter(a => a.google_rating !== null) || []
      const top10 = areasConRating
        .sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0))
        .slice(0, 10)

      // Promedio de rating
      const sumRatings = areasConRating.reduce((sum, a) => sum + (a.google_rating || 0), 0)
      const promedioRating = areasConRating.length > 0 ? sumRatings / areasConRating.length : 0

      // ========== ÁREAS CON DESCRIPCIÓN E IMÁGENES ==========
      const DESCRIPCION_MIN_LENGTH = 200
      const PLACEHOLDER_TEXT = 'Área encontrada mediante búsqueda en Google Maps'

      const areasConDescripcion = areas?.filter(a =>
        a.descripcion &&
        a.descripcion.length >= DESCRIPCION_MIN_LENGTH &&
        !a.descripcion.includes(PLACEHOLDER_TEXT)
      ).length || 0

      const areasConImagenes = areas?.filter(a =>
        a.foto_principal || (a.fotos_urls && Array.isArray(a.fotos_urls) && a.fotos_urls.length > 0)
      ).length || 0

      // ========== CRECIMIENTO MENSUAL (últimos 6 meses) ==========
      const mesesAtras = 6
      const crecimientoMensual = []

      for (let i = mesesAtras - 1; i >= 0; i--) {
        const fechaMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        const mesNombre = fechaMes.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })

        const nuevasAreasMes = areas?.filter(a => {
          if (!a.created_at) return false
          const fechaCreacion = new Date(a.created_at)
          return fechaCreacion.getFullYear() === fechaMes.getFullYear() &&
                 fechaCreacion.getMonth() === fechaMes.getMonth()
        }).length || 0

        crecimientoMensual.push({ mes: mesNombre, nuevas: nuevasAreasMes })
      }

      setAnalytics({
        totalAreas: areas?.length || 0,
        totalUsers, // Usar valor real desde API
        totalPaises,
        totalComunidades,
        areasPorPais: areasPorPaisArray,
        areasPorComunidad: areasPorComunidadArray,
        areasPorProvincia: Object.entries(areasPorProvincia || {})
          .map(([provincia, count]) => ({ provincia, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        areasGratis: distribucionPrecios.gratis,
        areasDePago: distribucionPrecios.bajo + distribucionPrecios.medio + distribucionPrecios.alto,
        areasVerificadas: areas?.filter(a => a.verificado).length || 0,
        areasConDescripcion,
        areasConImagenes,
        areasConServicios: Object.entries(serviciosCount)
          .map(([servicio, count]) => ({ servicio, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 7),
        // Métricas de rutas
        totalRutas,
        distanciaTotal,
        totalInteraccionesIA,
        top10AreasPopulares: top10,
        promedioRating,
        distribucionPrecios: [
          { rango: 'Gratis', count: distribucionPrecios.gratis },
          { rango: '1-10€', count: distribucionPrecios.bajo },
          { rango: '11-20€', count: distribucionPrecios.medio },
          { rango: '21€+', count: distribucionPrecios.alto },
        ],
        crecimientoMensual,

        // Métricas temporales - Rutas
        rutasHoy,
        rutasEstaSemana,
        rutasEsteMes,
        rutasPorDia,
        rutasPorMes,

        // Métricas temporales - Visitas
        visitasHoy,
        visitasEstaSemana,
        visitasEsteMes,
        visitasPorDia,
        visitasPorMes,

        // Métricas temporales - Valoraciones
        valoracionesHoy,
        valoracionesEstaSemana,
        valoracionesEsteMes,
        valoracionesTotales,
        valoracionesPorDia,

        // Métricas temporales - Favoritos
        favoritosHoy,
        favoritosEstaSemana,
        favoritosEsteMes,
        favoritosTotales,
        favoritosPorDia,

        // Métricas temporales - Usuarios
        usuariosNuevosHoy,
        usuariosNuevosEstaSemana,
        usuariosNuevosEsteMes,
        crecimientoUsuariosMensual,

        // Métricas temporales - Chatbot IA
        interaccionesIAHoy,
        interaccionesIAEstaSemana,
        interaccionesIAEsteMes,
        interaccionesIAPorDia,

        // Top áreas
        areasMasVisitadas,
        areasMasValoradas,
        areasEnMasFavoritos,

        // ========== NUEVAS MÉTRICAS DE COMPORTAMIENTO ==========

        // Usuarios Activos
        usuariosActivosHoy,
        usuariosActivosEstaSemana,
        usuariosActivosEsteMes,
        usuariosActivosPorDia,

        // Engagement
        promedioTiempoSesion,
        promedioPaginasPorSesion,
        tasaRebote,
        sesionesTotales,
        sesionesHoy,
        sesionesEstaSemana,

        // Dispositivos
        usuariosPorDispositivo,

        // Vehículos
        totalVehiculosRegistrados,
        vehiculosRegistradosHoy,
        vehiculosRegistradosEstaSemana,
        vehiculosRegistradosEsteMes,
        vehiculosPorMes,

        // Conversión y Retención
        tasaConversionRegistro,
        usuariosRecurrentes,
        usuariosNuevos,

        // Acciones
        busquedasTotales,
        busquedasHoy,
        busquedasEstaSemana,
        vistasAreasTotal,
        vistasAreasHoy,
        vistasAreasEstaSemana,

        // Actividad por hora
        actividadPorHora,

        // Eventos comunes
        eventosMasComunes
      })

    } catch (error) {
      console.error('Error cargando analíticas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function para labels de servicios
  const getServicioLabel = (servicio: string) => {
    const labels: Record<string, string> = {
      agua: 'Agua',
      electricidad: 'Electricidad',
      vaciado_aguas_negras: 'Vaciado Químico',
      vaciado_aguas_grises: 'Vaciado Aguas Grises',
      wifi: 'WiFi',
      duchas: 'Duchas',
      wc: 'WC',
      lavanderia: 'Lavandería',
      restaurante: 'Restaurante',
      supermercado: 'Supermercado',
      zona_mascotas: 'Zona Mascotas'
    }
    return labels[servicio] || servicio
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Cargando analíticas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-sky-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analíticas y Estadísticas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Información detallada sobre áreas, usuarios y actividad
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Áreas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalAreas.toLocaleString()}</p>
                <p className="text-sm text-sky-600 mt-2">
                  {analytics.totalPaises} países · {analytics.totalComunidades} regiones
                </p>
              </div>
              <div className="p-3 bg-sky-100 rounded-lg">
                <MapPinIcon className="w-8 h-8 text-sky-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Usuarios</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalUsers}</p>
                <p className="text-sm text-gray-500 mt-2">Registrados activos</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Contenido Enriquecido</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {((analytics.areasConDescripcion / analytics.totalAreas) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {analytics.areasConDescripcion.toLocaleString()} con descripción IA
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rating Promedio</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.promedioRating.toFixed(1)}</p>
                <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
                  <StarIcon className="w-4 h-4 fill-current" />
                  Google Reviews
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <StarIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Secundarios - Estado de las Áreas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <p className="text-sm font-medium text-green-700">✓ Verificadas</p>
            <p className="text-2xl font-bold text-green-900 mt-2">{analytics.areasVerificadas.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">
              {((analytics.areasVerificadas / analytics.totalAreas) * 100).toFixed(1)}% del total
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <p className="text-sm font-medium text-blue-700">📝 Con Descripción IA</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">{analytics.areasConDescripcion.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">
              {((analytics.areasConDescripcion / analytics.totalAreas) * 100).toFixed(1)}% completado
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
            <p className="text-sm font-medium text-pink-700">📸 Con Imágenes</p>
            <p className="text-2xl font-bold text-pink-900 mt-2">{analytics.areasConImagenes.toLocaleString()}</p>
            <p className="text-xs text-pink-600 mt-1">
              {((analytics.areasConImagenes / analytics.totalAreas) * 100).toFixed(1)}% con foto
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <p className="text-sm font-medium text-amber-700">💰 Áreas Gratis</p>
            <p className="text-2xl font-bold text-amber-900 mt-2">{analytics.areasGratis.toLocaleString()}</p>
            <p className="text-xs text-amber-600 mt-1">
              {((analytics.areasGratis / analytics.totalAreas) * 100).toFixed(1)}% gratuitas
            </p>
          </div>
        </div>

        {/* KPIs de Uso - Rutas e Interacciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
            <p className="text-sm font-medium text-indigo-700">🗺️ Rutas Calculadas</p>
            <p className="text-2xl font-bold text-indigo-900 mt-2">{analytics.totalRutas.toLocaleString()}</p>
            <p className="text-xs text-indigo-600 mt-1">
              Planificadas por usuarios
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
            <p className="text-sm font-medium text-teal-700">🛣️ Distancia Total</p>
            <p className="text-2xl font-bold text-teal-900 mt-2">{analytics.distanciaTotal.toLocaleString()} km</p>
            <p className="text-xs text-teal-600 mt-1">
              En todas las rutas
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <p className="text-sm font-medium text-purple-700">🤖 Interacciones IA</p>
            <p className="text-2xl font-bold text-purple-900 mt-2">{analytics.totalInteraccionesIA.toLocaleString()}</p>
            <p className="text-xs text-purple-600 mt-1">
              Mensajes con el chatbot
            </p>
          </div>
        </div>

        {/* ========== SECCIÓN: MÉTRICAS TEMPORALES - ACTIVIDAD DIARIA/SEMANAL/MENSUAL ========== */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-sky-600 to-blue-600 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              📊 Métricas de Actividad Temporal
              <span className="text-sm font-normal opacity-90">Hoy · Esta Semana · Este Mes</span>
            </h2>
            <p className="text-sky-100 mt-2">
              Análisis detallado de la actividad de usuarios en diferentes períodos de tiempo
            </p>
          </div>

          {/* Grid de Rutas Temporales */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <h3 className="text-lg font-bold text-gray-900">🗺️ Rutas Calculadas por Período</h3>
              <p className="text-sm text-gray-600">Actividad de planificación de rutas</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-indigo-700">📅 Hoy</p>
                    <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs font-bold">LIVE</span>
                  </div>
                  <p className="text-4xl font-black text-indigo-900">{analytics.rutasHoy}</p>
                  <p className="text-xs text-indigo-600 mt-2">rutas planificadas</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-700">📆 Esta Semana</p>
                  </div>
                  <p className="text-4xl font-black text-blue-900">{analytics.rutasEstaSemana}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    {analytics.rutasEstaSemana > 0 ? `+${((analytics.rutasEstaSemana / analytics.totalRutas) * 100).toFixed(1)}% del total` : 'Sin rutas'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-6 border-2 border-sky-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-sky-700">📅 Este Mes</p>
                  </div>
                  <p className="text-4xl font-black text-sky-900">{analytics.rutasEsteMes}</p>
                  <p className="text-xs text-sky-600 mt-2">
                    {analytics.rutasEsteMes > 0 ? `${((analytics.rutasEsteMes / analytics.totalRutas) * 100).toFixed(1)}% del total` : 'Sin rutas'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Visitas Temporales */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-bold text-gray-900">📍 Visitas Registradas por Período</h3>
              <p className="text-sm text-gray-600">Usuarios que han visitado áreas</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-green-700">📅 Hoy</p>
                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">LIVE</span>
                  </div>
                  <p className="text-4xl font-black text-green-900">{analytics.visitasHoy}</p>
                  <p className="text-xs text-green-600 mt-2">visitas registradas</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border-2 border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-700 mb-2">📆 Esta Semana</p>
                  <p className="text-4xl font-black text-emerald-900">{analytics.visitasEstaSemana}</p>
                  <p className="text-xs text-emerald-600 mt-2">visitas en 7 días</p>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border-2 border-teal-200">
                  <p className="text-sm font-semibold text-teal-700 mb-2">📅 Este Mes</p>
                  <p className="text-4xl font-black text-teal-900">{analytics.visitasEsteMes}</p>
                  <p className="text-xs text-teal-600 mt-2">visitas en 30 días</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Valoraciones Temporales */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50">
              <h3 className="text-lg font-bold text-gray-900">⭐ Valoraciones por Período</h3>
              <p className="text-sm text-gray-600">Usuarios dejando reseñas</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">📊 Total</p>
                  <p className="text-4xl font-black text-gray-900">{analytics.valoracionesTotales}</p>
                  <p className="text-xs text-gray-600 mt-2">todas las valoraciones</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-yellow-700">📅 Hoy</p>
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold">LIVE</span>
                  </div>
                  <p className="text-4xl font-black text-yellow-900">{analytics.valoracionesHoy}</p>
                  <p className="text-xs text-yellow-600 mt-2">nuevas valoraciones</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-2 border-amber-200">
                  <p className="text-sm font-semibold text-amber-700 mb-2">📆 Esta Semana</p>
                  <p className="text-4xl font-black text-amber-900">{analytics.valoracionesEstaSemana}</p>
                  <p className="text-xs text-amber-600 mt-2">valoraciones en 7 días</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
                  <p className="text-sm font-semibold text-orange-700 mb-2">📅 Este Mes</p>
                  <p className="text-4xl font-black text-orange-900">{analytics.valoracionesEsteMes}</p>
                  <p className="text-xs text-orange-600 mt-2">valoraciones en 30 días</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Favoritos Temporales */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
              <h3 className="text-lg font-bold text-gray-900">❤️ Favoritos por Período</h3>
              <p className="text-sm text-gray-600">Áreas agregadas a favoritos</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">📊 Total</p>
                  <p className="text-4xl font-black text-gray-900">{analytics.favoritosTotales}</p>
                  <p className="text-xs text-gray-600 mt-2">todos los favoritos</p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border-2 border-pink-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-pink-700">📅 Hoy</p>
                    <span className="px-2 py-1 bg-pink-200 text-pink-800 rounded-full text-xs font-bold">LIVE</span>
                  </div>
                  <p className="text-4xl font-black text-pink-900">{analytics.favoritosHoy}</p>
                  <p className="text-xs text-pink-600 mt-2">nuevos favoritos</p>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 border-2 border-rose-200">
                  <p className="text-sm font-semibold text-rose-700 mb-2">📆 Esta Semana</p>
                  <p className="text-4xl font-black text-rose-900">{analytics.favoritosEstaSemana}</p>
                  <p className="text-xs text-rose-600 mt-2">favoritos en 7 días</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
                  <p className="text-sm font-semibold text-red-700 mb-2">📅 Este Mes</p>
                  <p className="text-4xl font-black text-red-900">{analytics.favoritosEsteMes}</p>
                  <p className="text-xs text-red-600 mt-2">favoritos en 30 días</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Usuarios Nuevos Temporales */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50">
              <h3 className="text-lg font-bold text-gray-900">👥 Usuarios Nuevos por Período</h3>
              <p className="text-sm text-gray-600">Crecimiento de la comunidad</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-6 border-2 border-violet-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-violet-700">📅 Hoy</p>
                    <span className="px-2 py-1 bg-violet-200 text-violet-800 rounded-full text-xs font-bold">LIVE</span>
                  </div>
                  <p className="text-4xl font-black text-violet-900">{analytics.usuariosNuevosHoy}</p>
                  <p className="text-xs text-violet-600 mt-2">registros hoy</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                  <p className="text-sm font-semibold text-purple-700 mb-2">📆 Esta Semana</p>
                  <p className="text-4xl font-black text-purple-900">{analytics.usuariosNuevosEstaSemana}</p>
                  <p className="text-xs text-purple-600 mt-2">nuevos en 7 días</p>
                </div>

                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl p-6 border-2 border-fuchsia-200">
                  <p className="text-sm font-semibold text-fuchsia-700 mb-2">📅 Este Mes</p>
                  <p className="text-4xl font-black text-fuchsia-900">{analytics.usuariosNuevosEsteMes}</p>
                  <p className="text-xs text-fuchsia-600 mt-2">nuevos en 30 días</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Interacciones IA Temporales */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-900">🤖 Interacciones con IA por Período</h3>
              <p className="text-sm text-gray-600">Uso del chatbot asistente</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-700">📅 Hoy</p>
                    <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-bold">LIVE</span>
                  </div>
                  <p className="text-4xl font-black text-purple-900">{analytics.interaccionesIAHoy}</p>
                  <p className="text-xs text-purple-600 mt-2">mensajes hoy</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200">
                  <p className="text-sm font-semibold text-indigo-700 mb-2">📆 Esta Semana</p>
                  <p className="text-4xl font-black text-indigo-900">{analytics.interaccionesIAEstaSemana}</p>
                  <p className="text-xs text-indigo-600 mt-2">mensajes en 7 días</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-2">📅 Este Mes</p>
                  <p className="text-4xl font-black text-blue-900">{analytics.interaccionesIAEsteMes}</p>
                  <p className="text-xs text-blue-600 mt-2">mensajes en 30 días</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por País */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🌍 Distribución Global por País</h3>
            <p className="text-sm text-gray-500">{analytics.totalPaises} países con áreas registradas</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics.areasPorPais.slice(0, 10).map((item, index) => (
                <div key={item.pais} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                  <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-full text-lg font-bold shadow-md">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-semibold text-gray-900">{item.pais}</span>
                      <span className="text-lg font-bold text-sky-600">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-sky-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.porcentaje}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.porcentaje.toFixed(1)}% del total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 15 Comunidades/Regiones */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🗺️ Top 15 Comunidades/Regiones</h3>
            <p className="text-sm text-gray-500">Regiones con más áreas registradas</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.areasPorComunidad.map((item, index) => (
                <div key={`${item.comunidad}-${item.pais}`} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.comunidad}</p>
                      <p className="text-xs text-gray-500">{item.pais}</p>
                      <p className="text-lg font-bold text-purple-600 mt-1">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 10 Provincias */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top 10 Provincias</h3>
            <p className="text-sm text-gray-500">Áreas por provincia</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.areasPorProvincia.map((item, index) => (
                <div key={item.provincia}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {index + 1}. {item.provincia}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-sky-600 h-2 rounded-full transition-all"
                      style={{ width: `${(item.count / analytics.totalAreas) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Servicios Más Comunes */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Servicios Más Comunes</h3>
              <p className="text-sm text-gray-500">Top 7 servicios disponibles</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analytics.areasConServicios.map((item, index) => (
                  <div key={item.servicio} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-sky-100 text-sky-600 rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {getServicioLabel(item.servicio)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-500">
                        {((item.count / analytics.totalAreas) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribución de Precios */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Distribución de Precios</h3>
              <p className="text-sm text-gray-500">Rangos de precio por noche</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {analytics.distribucionPrecios.map((item) => (
                  <div key={item.rango} className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-4 border border-sky-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">{item.rango}</p>
                    <p className="text-3xl font-bold text-sky-600">{item.count}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((item.count / analytics.totalAreas) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Áreas Gratis</span>
                  <span className="text-2xl font-bold text-green-600">{analytics.areasGratis}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium text-gray-700">Áreas de Pago</span>
                  <span className="text-2xl font-bold text-sky-600">{analytics.areasDePago}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 10 Áreas Mejor Valoradas */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">⭐ Top 10 Áreas Mejor Valoradas</h3>
            <p className="text-sm text-gray-500">Según Google Reviews</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.top10AreasPopulares.map((area, index) => (
                <div key={area.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full text-lg font-bold">
                    {index + 1}
                  </span>
                  {area.foto_principal && (
                    <img
                      src={area.foto_principal}
                      alt={area.nombre}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{area.nombre}</h4>
                    <p className="text-sm text-gray-500">{area.ciudad || area.provincia}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-900">{area.google_rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Crecimiento Mensual */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">📈 Crecimiento Mensual</h3>
            <p className="text-sm text-gray-500">Nuevas áreas añadidas en los últimos 6 meses</p>
          </div>
          <div className="p-6">
            <div className="flex items-end justify-between gap-4 h-64">
              {analytics.crecimientoMensual.map((mes, index) => {
                const maxNuevas = Math.max(...analytics.crecimientoMensual.map(m => m.nuevas))
                const alturaPorcentaje = maxNuevas > 0 ? (mes.nuevas / maxNuevas) * 100 : 0

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-center mb-2">
                      <p className="text-lg font-bold text-sky-600">{mes.nuevas}</p>
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-lg transition-all hover:from-sky-600 hover:to-sky-500"
                      style={{ height: `${Math.max(alturaPorcentaje, 5)}%` }}
                    />
                    <p className="text-xs font-medium text-gray-600 mt-2">{mes.mes}</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Total últimos 6 meses: <span className="font-bold text-gray-900">
                  {analytics.crecimientoMensual.reduce((sum, m) => sum + m.nuevas, 0).toLocaleString()}
                </span> nuevas áreas
              </p>
            </div>
          </div>
        </div>

        {/* ========== GRÁFICOS TEMPORALES - ÚLTIMOS 30 DÍAS ========== */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              📈 Tendencias Diarias (Últimos 30 Días)
            </h2>
            <p className="text-emerald-100 mt-2">
              Evolución día a día de la actividad en la plataforma
            </p>
          </div>

          {/* Gráfico: Rutas por Día */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">🗺️ Rutas Calculadas - Últimos 30 Días</h3>
              <p className="text-sm text-gray-500">Actividad diaria de planificación de rutas</p>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between gap-1 h-48">
                {analytics.rutasPorDia.map((dia, index) => {
                  const maxCount = Math.max(...analytics.rutasPorDia.map(d => d.count), 1)
                  const altura = (dia.count / maxCount) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-center">
                        {dia.count > 0 && (
                          <p className="text-xs font-bold text-indigo-600">{dia.count}</p>
                        )}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t hover:from-indigo-600 hover:to-indigo-500 transition-all cursor-pointer"
                        style={{ height: `${Math.max(altura, 3)}%` }}
                        title={`${dia.fecha}: ${dia.count} rutas`}
                      />
                      {index % 5 === 0 && (
                        <p className="text-[9px] text-gray-500 mt-1 rotate-45 origin-top-left">{dia.fecha}</p>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Total últimos 30 días: <span className="font-bold text-indigo-600">
                    {analytics.rutasPorDia.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
                  </span> rutas
                </p>
                <p className="text-xs text-gray-500">
                  Promedio diario: {(analytics.rutasPorDia.reduce((sum, d) => sum + d.count, 0) / 30).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico: Visitas por Día */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">📍 Visitas Registradas - Últimos 30 Días</h3>
              <p className="text-sm text-gray-500">Usuarios registrando visitas a áreas</p>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between gap-1 h-48">
                {analytics.visitasPorDia.map((dia, index) => {
                  const maxCount = Math.max(...analytics.visitasPorDia.map(d => d.count), 1)
                  const altura = (dia.count / maxCount) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-center">
                        {dia.count > 0 && (
                          <p className="text-xs font-bold text-green-600">{dia.count}</p>
                        )}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-600 hover:to-green-500 transition-all cursor-pointer"
                        style={{ height: `${Math.max(altura, 3)}%` }}
                        title={`${dia.fecha}: ${dia.count} visitas`}
                      />
                      {index % 5 === 0 && (
                        <p className="text-[9px] text-gray-500 mt-1 rotate-45 origin-top-left">{dia.fecha}</p>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Total últimos 30 días: <span className="font-bold text-green-600">
                    {analytics.visitasPorDia.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
                  </span> visitas
                </p>
                <p className="text-xs text-gray-500">
                  Promedio diario: {(analytics.visitasPorDia.reduce((sum, d) => sum + d.count, 0) / 30).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico: Interacciones IA por Día */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">🤖 Interacciones con IA - Últimos 30 Días</h3>
              <p className="text-sm text-gray-500">Actividad del chatbot asistente</p>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between gap-1 h-48">
                {analytics.interaccionesIAPorDia.map((dia, index) => {
                  const maxCount = Math.max(...analytics.interaccionesIAPorDia.map(d => d.count), 1)
                  const altura = (dia.count / maxCount) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-center">
                        {dia.count > 0 && (
                          <p className="text-xs font-bold text-purple-600">{dia.count}</p>
                        )}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t hover:from-purple-600 hover:to-purple-500 transition-all cursor-pointer"
                        style={{ height: `${Math.max(altura, 3)}%` }}
                        title={`${dia.fecha}: ${dia.count} mensajes`}
                      />
                      {index % 5 === 0 && (
                        <p className="text-[9px] text-gray-500 mt-1 rotate-45 origin-top-left">{dia.fecha}</p>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Total últimos 30 días: <span className="font-bold text-purple-600">
                    {analytics.interaccionesIAPorDia.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
                  </span> mensajes
                </p>
                <p className="text-xs text-gray-500">
                  Promedio diario: {(analytics.interaccionesIAPorDia.reduce((sum, d) => sum + d.count, 0) / 30).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico: Rutas por Mes (últimos 12 meses) */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">🗺️ Rutas y Distancia por Mes - Últimos 12 Meses</h3>
              <p className="text-sm text-gray-500">Evolución mensual de rutas y kilómetros recorridos</p>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between gap-2 h-64">
                {analytics.rutasPorMes.map((mes, index) => {
                  const maxCount = Math.max(...analytics.rutasPorMes.map(m => m.count), 1)
                  const altura = (mes.count / maxCount) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-center">
                        <p className="text-xs font-bold text-indigo-600">{mes.count}</p>
                        <p className="text-[9px] text-teal-600">{(mes.distancia / 1000).toFixed(0)}k km</p>
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t hover:from-indigo-600 hover:to-indigo-500 transition-all cursor-pointer"
                        style={{ height: `${Math.max(altura, 5)}%` }}
                        title={`${mes.mes}: ${mes.count} rutas, ${mes.distancia.toFixed(0)} km`}
                      />
                      <p className="text-xs font-medium text-gray-600">{mes.mes}</p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Total rutas (12 meses): <span className="font-bold text-indigo-600">
                      {analytics.rutasPorMes.reduce((sum, m) => sum + m.count, 0).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Total distancia: <span className="font-bold text-teal-600">
                      {analytics.rutasPorMes.reduce((sum, m) => sum + m.distancia, 0).toLocaleString()} km
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico: Crecimiento de Usuarios por Mes */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">👥 Crecimiento de Usuarios - Últimos 12 Meses</h3>
              <p className="text-sm text-gray-500">Nuevos usuarios registrados cada mes</p>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between gap-2 h-64">
                {analytics.crecimientoUsuariosMensual.map((mes, index) => {
                  const maxNuevos = Math.max(...analytics.crecimientoUsuariosMensual.map(m => m.nuevos), 1)
                  const altura = (mes.nuevos / maxNuevos) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-center">
                        <p className="text-xs font-bold text-violet-600">{mes.nuevos}</p>
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-violet-500 to-violet-400 rounded-t hover:from-violet-600 hover:to-violet-500 transition-all cursor-pointer"
                        style={{ height: `${Math.max(altura, 5)}%` }}
                        title={`${mes.mes}: ${mes.nuevos} nuevos usuarios`}
                      />
                      <p className="text-xs font-medium text-gray-600">{mes.mes}</p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Total nuevos (12 meses): <span className="font-bold text-violet-600">
                    {analytics.crecimientoUsuariosMensual.reduce((sum, m) => sum + m.nuevos, 0).toLocaleString()}
                  </span> usuarios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== TOP ÁREAS MÁS POPULARES ========== */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              🏆 Áreas Más Populares
            </h2>
            <p className="text-rose-100 mt-2">
              Rankings de las áreas más visitadas, valoradas y agregadas a favoritos
            </p>
          </div>

          {/* Top 10 Áreas Más Visitadas */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-bold text-gray-900">📍 Top 10 Áreas Más Visitadas</h3>
              <p className="text-sm text-gray-600">Áreas con más visitas registradas por usuarios</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.areasMasVisitadas.map((item, index) => (
                  <div key={item.area.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full text-lg font-bold shadow-md">
                      {index + 1}
                    </span>
                    {item.area.foto_principal && (
                      <img
                        src={item.area.foto_principal}
                        alt={item.area.nombre}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.area.nombre}</h4>
                      <p className="text-sm text-gray-500 truncate">{item.area.ciudad || item.area.provincia}, {item.area.pais}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{item.visitas}</p>
                      <p className="text-xs text-gray-500">visitas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 10 Áreas Más Valoradas */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50">
              <h3 className="text-lg font-bold text-gray-900">⭐ Top 10 Áreas Más Valoradas</h3>
              <p className="text-sm text-gray-600">Áreas con más valoraciones de usuarios</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.areasMasValoradas.map((item, index) => (
                  <div key={item.area.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-700 text-white rounded-full text-lg font-bold shadow-md">
                      {index + 1}
                    </span>
                    {item.area.foto_principal && (
                      <img
                        src={item.area.foto_principal}
                        alt={item.area.nombre}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.area.nombre}</h4>
                      <p className="text-sm text-gray-500 truncate">{item.area.ciudad || item.area.provincia}, {item.area.pais}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-bold text-yellow-600">{item.promedio}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">{item.valoraciones}</p>
                      <p className="text-xs text-gray-500">valoraciones</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 10 Áreas en Más Favoritos */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
              <h3 className="text-lg font-bold text-gray-900">❤️ Top 10 Áreas en Más Favoritos</h3>
              <p className="text-sm text-gray-600">Áreas más agregadas a listas de favoritos</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.areasEnMasFavoritos.map((item, index) => (
                  <div key={item.area.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-700 text-white rounded-full text-lg font-bold shadow-md">
                      {index + 1}
                    </span>
                    {item.area.foto_principal && (
                      <img
                        src={item.area.foto_principal}
                        alt={item.area.nombre}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.area.nombre}</h4>
                      <p className="text-sm text-gray-500 truncate">{item.area.ciudad || item.area.provincia}, {item.area.pais}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-600">{item.favoritos}</p>
                      <p className="text-xs text-gray-500">favoritos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
