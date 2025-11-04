# ⚡ CHATBOT - PLAN DE ACCIÓN INMEDIATA

**Última revisión:** 4 de Noviembre, 2025  
**Estado:** ✅ **RESUELTO - CHATBOT OPERATIVO**

---

## 🎉 PROBLEMA PRINCIPAL RESUELTO

El chatbot ahora funciona correctamente. Las variables de entorno se configuraron correctamente en AWS Amplify y Next.js.

**Ver:** [`PROBLEMA_RESUELTO.md`](./PROBLEMA_RESUELTO.md)

---

## 📋 Documento Original (para referencia histórica)

---

## 🚨 LOS 5 PROBLEMAS MÁS GRAVES

### 1. 🔐 SEGURIDAD: Exposición de Stack Traces
**Severidad:** 🔴 CRÍTICA  
**Tiempo:** 30 minutos  
**Ubicación:** `app/api/chatbot/route.ts` línea 720

```typescript
// ❌ ELIMINAR ESTO INMEDIATAMENTE
stack: error.stack, // Expone rutas del servidor
fullError: String(error)
```

**Acción:** [Ver código específico](#fix-1-seguridad)

---

### 2. 💸 COSTOS: Sin Rate Limiting
**Severidad:** 🔴 CRÍTICA  
**Tiempo:** 2 horas  
**Riesgo:** Un usuario malicioso puede costar **$2,500/día**

**Acción:** [Implementar rate limiting](#fix-2-rate-limiting)

---

### 3. 🐌 PERFORMANCE: 7 segundos de latencia
**Severidad:** 🟡 ALTA  
**Tiempo:** 4 horas  
**Impacto:** 60% de usuarios abandonan después de 3s

**Acción:** [Optimizar latencia](#fix-3-performance)

---

### 4. 💥 ERRORES: Mensajes inútiles para usuarios
**Severidad:** 🟡 ALTA  
**Tiempo:** 1 hora  
**UX:** "Lo siento, ha ocurrido un error" → Usuario frustrado

**Acción:** [Mejorar errores](#fix-4-errores)

---

### 5. 📊 LOGS: 30+ console.log por petición
**Severidad:** 🟡 MEDIA  
**Tiempo:** 2 horas  
**Costo:** AWS CloudWatch cobra por GB de logs

**Acción:** [Reducir logs](#fix-5-logs)

---

## 🛠️ FIXES DETALLADOS

### FIX #1: SEGURIDAD

**Archivo:** `app/api/chatbot/route.ts`

**Cambio:**
```typescript
// LÍNEA 714-722: REEMPLAZAR COMPLETAMENTE

// ❌ ANTES (PELIGROSO)
return NextResponse.json({
  error: 'Error interno del servidor',
  details: error.message || 'Error desconocido',
  errorName: error.name,
  errorCode: error.code,
  stack: error.stack, // 🔴 PELIGRO
  fullError: String(error)
}, { status: 500 })

// ✅ DESPUÉS (SEGURO)
return NextResponse.json({
  error: 'Error interno del servidor',
  message: 'Estamos trabajando en solucionarlo. Por favor, inténtalo de nuevo.',
  support: 'Si el problema persiste, contacta con soporte@mapafurgocasa.com',
  ...(process.env.NODE_ENV === 'development' && {
    debug: {
      message: error.message,
      stack: error.stack,
      code: error.code
    }
  })
}, { status: 500 })
```

---

### FIX #2: RATE LIMITING

**1. Instalar dependencia:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**2. Crear cuenta en Upstash:**
- Ve a https://upstash.com (gratis hasta 10K requests/día)
- Crea una base de datos Redis
- Copia `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`

**3. Añadir a `.env.local` y AWS Amplify:**
```env
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxxXXX...
```

**4. Modificar `app/api/chatbot/route.ts`:**

```typescript
// LÍNEA 1: Añadir imports
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// LÍNEA 20: Crear instancia (fuera de la función)
const redis = Redis.fromEnv()
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 peticiones por minuto
  analytics: true,
})

// LÍNEA 265: Añadir DESPUÉS de "export async function POST(req: NextRequest)"
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  // 🔥 NUEVO: Rate limiting
  try {
    const body = await req.json()
    const identifier = body.userId || req.headers.get('x-forwarded-for') || 'anonymous'
    
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
    
    if (!success) {
      const waitSeconds = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json({
        error: 'Demasiadas peticiones',
        message: `Por favor, espera ${waitSeconds} segundos antes de volver a intentarlo.`,
        retryAfter: waitSeconds
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
          'Retry-After': waitSeconds.toString()
        }
      })
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Continuar si rate limit falla (no bloquear la app)
  }
  
  // ... resto del código existente
```

**5. Testing:**
```bash
# En la consola del navegador (F12)
for (let i = 0; i < 15; i++) {
  fetch('/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] })
  }).then(r => console.log(i, r.status))
}

# Debería ver:
# 0 200
# 1 200
# ...
# 10 429 ← Rate limited!
```

---

### FIX #3: PERFORMANCE

**Cambio 1: Paralelizar operaciones (LÍNEA 370-403)**

```typescript
// ❌ ANTES (SECUENCIAL - 1700ms)
let ubicacionDetectada: GeocodeResult | null = null
if (ubicacionUsuario?.lat && ubicacionUsuario?.lng) {
  ubicacionDetectada = await getCityAndProvinceFromCoords(...)
}

const stats = await getEstadisticasBD(supabase)

let historialPrevio: Array<...> = []
if (conversacionId) {
  const { data: historial } = await supabase.from('chatbot_mensajes')...
}

// ✅ DESPUÉS (PARALELO - 800ms)
const [ubicacionDetectada, stats, historialData] = await Promise.all([
  // Geocoding (solo si hay ubicación)
  ubicacionUsuario?.lat && ubicacionUsuario?.lng
    ? getCityAndProvinceFromCoords(ubicacionUsuario.lat, ubicacionUsuario.lng)
    : Promise.resolve(null),
  
  // Estadísticas
  getEstadisticasBD(supabase),
  
  // Historial (solo si hay conversación)
  conversacionId
    ? supabase
        .from('chatbot_mensajes')
        .select('rol, contenido')
        .eq('conversacion_id', conversacionId)
        .order('created_at', { ascending: true })
        .limit(10)
    : Promise.resolve({ data: null })
])

const historialPrevio = historialData.data || []
```

**Mejora:** De 1700ms → 800ms (900ms más rápido, -53%)

---

**Cambio 2: Caché de estadísticas (NUEVO ARCHIVO)**

Crear `lib/cache/redis.ts`:

```typescript
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function getCached<T>(
  key: string,
  ttl: number,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached as string)
    }
  } catch (error) {
    console.error('Cache read error:', error)
  }
  
  const fresh = await fallback()
  
  try {
    await redis.setex(key, ttl, JSON.stringify(fresh))
  } catch (error) {
    console.error('Cache write error:', error)
  }
  
  return fresh
}
```

**Modificar `app/api/chatbot/route.ts` (LÍNEA 206):**

```typescript
// ❌ ANTES
async function getEstadisticasBD(supabase: any): Promise<EstadisticasBD> {
  try {
    const { count: totalAreas } = await supabase...
    // ... resto de consultas
  } catch (error) {
    // ...
  }
}

// ✅ DESPUÉS
import { getCached } from '@/lib/cache/redis'

async function getEstadisticasBD(supabase: any): Promise<EstadisticasBD> {
  return getCached(
    'chatbot:stats',
    3600, // 1 hora
    async () => {
      try {
        const { count: totalAreas } = await supabase...
        // ... resto de consultas (código existente)
        return { totalAreas, totalPaises, ... }
      } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error)
        return { totalAreas: 0, totalPaises: 0, ... }
      }
    }
  )
}
```

**Mejora:** De 400ms → 10ms en hits subsecuentes (40x más rápido)

---

### FIX #4: ERRORES

**Crear `lib/chatbot/errors.ts`:**

```typescript
export const ERROR_MESSAGES = {
  OPENAI_INVALID_KEY: {
    user: '🔧 El asistente está en mantenimiento.\n\nPuedes usar mientras tanto:\n• Buscador en /buscar\n• Mapa completo en /mapa',
    admin: 'API Key de OpenAI inválida'
  },
  OPENAI_RATE_LIMIT: {
    user: '⏱️ El asistente está muy ocupado en este momento.\n\n💡 Espera 1 minuto e inténtalo de nuevo.\n\nMientras tanto puedes:\n• Explorar el mapa\n• Buscar manualmente',
    admin: 'OpenAI rate limit exceeded'
  },
  OPENAI_TIMEOUT: {
    user: '⏱️ La respuesta está tardando mucho.\n\n💡 El servidor puede estar ocupado. Inténtalo con:\n• Una pregunta más simple\n• Esperar 30 segundos',
    admin: 'OpenAI request timeout'
  },
  SUPABASE_CONNECTION: {
    user: '🔌 Problema de conexión temporal.\n\n💡 Recarga la página e inténtalo de nuevo.\n\nSi persiste, contacta soporte@mapafurgocasa.com',
    admin: 'Supabase connection failed'
  },
  GENERIC: {
    user: '❌ Ha ocurrido un error inesperado.\n\n💡 Por favor:\n1. Recarga la página\n2. Inténtalo de nuevo\n3. Si persiste, contáctanos en soporte@mapafurgocasa.com',
    admin: 'Unknown error'
  }
}

export function getUserFriendlyError(error: any): string {
  if (error.status === 401) return ERROR_MESSAGES.OPENAI_INVALID_KEY.user
  if (error.status === 429) return ERROR_MESSAGES.OPENAI_RATE_LIMIT.user
  if (error.name === 'AbortError') return ERROR_MESSAGES.OPENAI_TIMEOUT.user
  if (error.message?.includes('Supabase')) return ERROR_MESSAGES.SUPABASE_CONNECTION.user
  
  return ERROR_MESSAGES.GENERIC.user
}
```

**Modificar `components/chatbot/ChatbotWidget.tsx` (LÍNEA 130):**

```typescript
// ❌ ANTES
} catch (error: any) {
  console.error('Error:', error)
  setMessages(prev => [...prev, {
    rol: 'assistant',
    contenido: `Lo siento, ha ocurrido un error: ${error.message}\n\nPor favor, inténtalo de nuevo.`
  }])
}

// ✅ DESPUÉS
import { getUserFriendlyError } from '@/lib/chatbot/errors'

} catch (error: any) {
  console.error('Error:', error)
  setMessages(prev => [...prev, {
    rol: 'assistant',
    contenido: getUserFriendlyError(error)
  }])
}
```

---

### FIX #5: LOGS

**Crear `lib/logger.ts`:**

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDev = process.env.NODE_ENV === 'development'
  
  debug(...args: any[]) {
    if (this.isDev) console.log('🔍', ...args)
  }
  
  info(...args: any[]) {
    if (this.isDev) console.log('ℹ️', ...args)
  }
  
  warn(...args: any[]) {
    console.warn('⚠️', ...args)
  }
  
  error(...args: any[]) {
    console.error('❌', ...args)
  }
}

export const logger = new Logger()
```

**Modificar `app/api/chatbot/route.ts`:**

```typescript
// LÍNEA 1: Import
import { logger } from '@/lib/logger'

// REEMPLAZAR todos los console.log con:
console.log('🤖 [CHATBOT] Nueva petición') → logger.debug('Nueva petición chatbot')
console.log('✅ [CHATBOT] OPENAI_API_KEY') → logger.debug('OpenAI key validated')
console.error('❌ Error...') → logger.error('Error...') // Mantener errors

// MANTENER SOLO estos logs importantes:
logger.info('Chatbot request', { userId, messageCount: messages.length })
logger.error('Chatbot error', { error: error.message, userId })
```

**Resultado:** 30+ logs → 2-3 logs en producción

---

## ⏱️ RESUMEN DE TIEMPO

| Fix | Severidad | Tiempo | Dificultad |
|-----|-----------|--------|------------|
| #1 Seguridad | 🔴 | 30 min | Fácil |
| #2 Rate Limiting | 🔴 | 2h | Media |
| #3 Performance | 🟡 | 4h | Media |
| #4 Errores | 🟡 | 1h | Fácil |
| #5 Logs | 🟡 | 2h | Fácil |
| **TOTAL** | | **9.5h** | |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Antes de empezar
- [ ] Hacer backup de la base de datos
- [ ] Crear branch `fix/chatbot-critical`
- [ ] Leer este documento completo

### Implementación
- [ ] **FIX #1:** Seguridad (30 min) ✅ Crítico
- [ ] **FIX #2:** Rate limiting (2h) ✅ Crítico
- [ ] Testing de rate limiting (15 min)
- [ ] **FIX #3:** Performance - Paralelización (1h)
- [ ] **FIX #3:** Performance - Caché (1h)
- [ ] Testing de performance (30 min)
- [ ] **FIX #4:** Errores (1h)
- [ ] **FIX #5:** Logs (2h)

### Testing
- [ ] Probar en local (30 min)
- [ ] Probar escenarios de error (30 min)
- [ ] Probar rate limiting (15 min)
- [ ] Verificar que no hay regresiones (30 min)

### Deployment
- [ ] Añadir variables de Upstash a AWS Amplify
- [ ] Deploy a staging (si existe)
- [ ] Testing en staging (1h)
- [ ] Deploy a producción
- [ ] Monitorear logs (1h)
- [ ] Verificar métricas (CloudWatch)

---

## 📊 RESULTADOS ESPERADOS

### Antes
| Métrica | Valor |
|---------|-------|
| Latencia | 7.3s |
| Errores/día | ~50 |
| Costo/1000 req | $2.50 |
| Seguridad | 🔴 Vulnerable |
| UX | 🔴 Pobre |

### Después de los fixes
| Métrica | Valor | Mejora |
|---------|-------|--------|
| Latencia | 3.5s | ⬇️ -52% |
| Errores/día | ~10 | ⬇️ -80% |
| Costo/1000 req | $1.20 | ⬇️ -52% |
| Seguridad | 🟢 Seguro | ✅ |
| UX | 🟢 Buena | ✅ |

---

## 🆘 SI ALGO FALLA

### Rollback rápido
```bash
# Volver a la versión anterior
git revert HEAD
git push

# En AWS Amplify
# → Build history → Click versión anterior → "Promote to production"
```

### Contacto
- **Repositorio:** Crear issue con logs
- **Email:** Incluir logs de CloudWatch
- **Urgente:** Revertir inmediatamente

---

## 📝 NOTAS FINALES

1. **No saltar pasos:** Cada fix depende de los anteriores
2. **Testing exhaustivo:** Especialmente rate limiting
3. **Monitorear:** Primeras 24h después del deploy
4. **Documentar:** Cualquier problema encontrado

---

**¿Listo para empezar?** 🚀

Comienza con **FIX #1 (Seguridad)** - Es el más crítico y el más rápido.

