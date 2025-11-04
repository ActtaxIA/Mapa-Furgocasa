/**
 * CACHE UTILITY - Upstash Redis
 * ==============================
 * Sistema de caché simple con fallback si Redis no está configurado
 */

import { Redis } from '@upstash/redis'

let redis: Redis | null = null

// Inicializar Redis solo si está configurado
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    console.log('✅ Cache (Redis) habilitado')
  } catch (error) {
    console.error('⚠️ Error inicializando Redis para cache:', error)
  }
} else {
  console.warn('⚠️ Cache deshabilitado: faltan variables UPSTASH_REDIS_REST_URL/TOKEN')
}

/**
 * Obtener valor del caché con fallback
 * 
 * @param key - Clave única del caché
 * @param ttl - Tiempo de vida en segundos
 * @param fallback - Función para obtener el valor si no está en caché
 * @returns Valor cacheado o resultado del fallback
 */
export async function getCached<T>(
  key: string,
  ttl: number,
  fallback: () => Promise<T>
): Promise<T> {
  // Si no hay Redis, ejecutar fallback directamente
  if (!redis) {
    return await fallback()
  }
  
  try {
    // Intentar leer del caché
    const cached = await redis.get(key)
    
    if (cached !== null) {
      console.log(`✅ [CACHE] Hit: ${key}`)
      return typeof cached === 'string' ? JSON.parse(cached) : cached as T
    }
    
    console.log(`⚠️ [CACHE] Miss: ${key}`)
  } catch (error) {
    console.error(`❌ [CACHE] Error leyendo ${key}:`, error)
    // Continuar con fallback si falla el caché
  }
  
  // Ejecutar fallback
  const fresh = await fallback()
  
  // Guardar en caché (sin bloquear la respuesta)
  if (redis) {
    redis.setex(key, ttl, JSON.stringify(fresh)).catch(error => {
      console.error(`❌ [CACHE] Error escribiendo ${key}:`, error)
    })
  }
  
  return fresh
}

/**
 * Invalidar una o más claves del caché
 * 
 * @param keys - Clave(s) a invalidar
 */
export async function invalidateCache(keys: string | string[]): Promise<void> {
  if (!redis) return
  
  const keyArray = Array.isArray(keys) ? keys : [keys]
  
  try {
    await Promise.all(keyArray.map(key => redis!.del(key)))
    console.log(`✅ [CACHE] Invalidadas ${keyArray.length} clave(s)`)
  } catch (error) {
    console.error('❌ [CACHE] Error invalidando:', error)
  }
}

/**
 * Limpiar todo el caché (usar con cuidado)
 */
export async function clearCache(): Promise<void> {
  if (!redis) return
  
  try {
    await redis.flushdb()
    console.log('✅ [CACHE] Cache limpiado completamente')
  } catch (error) {
    console.error('❌ [CACHE] Error limpiando cache:', error)
  }
}

/**
 * TTLs recomendados (en segundos)
 */
export const CACHE_TTL = {
  STATS: 3600,        // 1 hora - Las estadísticas cambian poco
  GEOCODING: 86400,   // 24 horas - Las coordenadas no cambian
  AREAS: 300,         // 5 minutos - Las áreas pueden actualizarse
  CONFIG: 1800,       // 30 minutos - Configuración del chatbot
} as const

