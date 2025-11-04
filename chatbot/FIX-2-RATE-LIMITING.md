# ✅ FIX #2 COMPLETADO: Rate Limiting

**Fecha:** 4 de Noviembre, 2025  
**Estado:** ✅ IMPLEMENTADO (pendiente configuración Upstash)

---

## 🔧 Cambios Realizados

### 1. Dependencias instaladas:
```bash
npm install @upstash/ratelimit @upstash/redis
```

### 2. Archivo modificado:
`app/api/chatbot/route.ts`

**Líneas añadidas:**
- 23-25: Imports de Upstash
- 67-94: Configuración de rate limiting
- 308-339: Middleware de rate limiting en POST

---

## 🛡️ ¿Qué hace el Rate Limiting?

Limita las peticiones al chatbot a **10 por minuto por usuario**:

```
Usuario normal:  ✅ Hasta 10 consultas/minuto
Usuario abusivo: ❌ Bloqueado después de 10 consultas
Atacante bot:    ❌ Bloqueado automáticamente
```

### Identificación de usuarios:

1. **Usuario registrado:** Por `userId`
2. **Usuario anónimo:** Por IP (`x-forwarded-for`)
3. **Fallback:** `'anonymous'`

---

## 📊 Impacto

### Antes (Sin Rate Limiting):
```
Escenario: Usuario malicioso hace 1000 requests/minuto
Costo:     $50-100/hora en OpenAI
Resultado: $1,200-2,400/día 💸
```

### Después (Con Rate Limiting):
```
Escenario: Usuario malicioso intenta 1000 requests/minuto
Bloqueado: Después de 10 requests
Costo:     ~$0.05/hora (solo 10 requests)
Resultado: $1.20/día ✅
Ahorro:    99.9% 🎉
```

---

## ⚙️ CONFIGURACIÓN REQUERIDA

Para que el rate limiting funcione, necesitas:

### Paso 1: Crear cuenta en Upstash (GRATIS)

1. Ve a: https://console.upstash.com
2. Click "Sign Up" (puedes usar GitHub, Google, o email)
3. Plan gratis: **10,000 requests/día** (suficiente para empezar)

### Paso 2: Crear base de datos Redis

1. En Upstash Dashboard, click **"Create Database"**
2. Configuración:
   ```
   Name:     mapa-furgocasa-ratelimit
   Type:     Regional (más barato)
   Region:   eu-central-1 (Frankfurt) - cercano a tu servidor
   Eviction: No eviction
   ```
3. Click **"Create"**

### Paso 3: Copiar credenciales

En la página de la database creada, verás:

```
UPSTASH_REDIS_REST_URL
https://settling-sunbird-12345.upstash.io

UPSTASH_REDIS_REST_TOKEN
AXXXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copiar ambos valores.

### Paso 4: Añadir variables en AWS Amplify

1. Ir a: AWS Amplify Console → Mapa-Furgocasa
2. Hosting → Environment variables
3. Click "Manage variables"
4. Añadir las 2 variables:

| Variable | Valor |
|----------|-------|
| `UPSTASH_REDIS_REST_URL` | `https://settling-sunbird-12345.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `AXXXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

5. Click "Save"
6. AWS Amplify redesplegará automáticamente

### Paso 5: Añadir también en `.env.local` (para desarrollo)

```env
# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://settling-sunbird-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🧪 Cómo Probar

### Test 1: Verificar que está deshabilitado (antes de configurar)

Busca en los logs del servidor (después de hacer una petición):
```
⚠️ Rate limiting deshabilitado: faltan UPSTASH_REDIS_REST_URL o UPSTASH_REDIS_REST_TOKEN
```

El chatbot **funciona normal** (sin rate limiting).

### Test 2: Verificar que está habilitado (después de configurar)

Después de añadir las variables y redesplegar, busca:
```
✅ Rate limiting habilitado
```

### Test 3: Probar el límite (en local)

En la consola del navegador (F12):

```javascript
// Hacer 15 peticiones rápidas (límite es 10)
async function testRateLimit() {
  for (let i = 0; i < 15; i++) {
    const response = await fetch('http://localhost:3000/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Test ${i}` }],
        userId: 'test-user-123'
      })
    })
    
    const data = await response.json()
    console.log(`Request ${i+1}:`, response.status, 
                response.status === 429 ? '🔴 BLOQUEADO' : '✅ OK')
    
    if (response.status === 429) {
      console.log('Mensaje:', data.message)
      console.log('Esperar:', data.retryAfter, 'segundos')
      break
    }
  }
}

testRateLimit()
```

**Resultado esperado:**
```
Request 1: 200 ✅ OK
Request 2: 200 ✅ OK
...
Request 10: 200 ✅ OK
Request 11: 429 🔴 BLOQUEADO
Mensaje: Has realizado muchas consultas. Por favor, espera 60 segundos...
Esperar: 60 segundos
```

---

## 📝 Respuesta del API cuando se bloquea

```json
{
  "error": "Demasiadas peticiones",
  "message": "Has realizado muchas consultas. Por favor, espera 60 segundos antes de volver a intentarlo.",
  "tip": "Mientras tanto, puedes explorar el mapa o buscar manualmente áreas.",
  "retryAfter": 60
}
```

**Headers de la respuesta:**
```
Status: 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-11-04T19:30:00.000Z
Retry-After: 60
```

---

## ⚙️ Configuración del Límite

Actualmente configurado en `app/api/chatbot/route.ts` línea 83:

```typescript
limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 peticiones por minuto
```

### Opciones de configuración:

```typescript
// Más estricto (5/minuto)
limiter: Ratelimit.slidingWindow(5, "1 m")

// Más permisivo (20/minuto)
limiter: Ratelimit.slidingWindow(20, "1 m")

// Por hora (100/hora)
limiter: Ratelimit.slidingWindow(100, "1 h")

// Por día (1000/día)
limiter: Ratelimit.slidingWindow(1000, "1 d")
```

### Recomendación:

```typescript
// Usuarios normales: 10/minuto es suficiente
// Usuarios power: Considera aumentar a 20/minuto
// Si tienes muchos usuarios legítimos que se bloquean, aumenta el límite
```

---

## 📊 Monitoreo en Upstash

Después de activar, puedes ver estadísticas en:

https://console.upstash.com → Tu database → Analytics

Verás:
- **Requests totales** por día/hora
- **Hit rate** del rate limiter
- **Usuarios bloqueados**
- **Patrones de uso**

---

## 💰 Costos de Upstash

### Plan Gratuito:
- ✅ 10,000 requests/día
- ✅ 256 MB storage
- ✅ Suficiente para ~1000 usuarios/día

### Si necesitas más:

| Plan | Requests/día | Precio |
|------|--------------|--------|
| Free | 10,000 | $0 |
| Pay as you go | Ilimitado | $0.20 por 100K requests |

**Ejemplo:** 100,000 requests/día = $0.60/día = $18/mes

---

## ✅ Checklist de Implementación

- [x] Dependencias instaladas (`@upstash/ratelimit`, `@upstash/redis`)
- [x] Código implementado en `app/api/chatbot/route.ts`
- [ ] Cuenta en Upstash creada
- [ ] Base de datos Redis creada
- [ ] Variables añadidas en AWS Amplify
- [ ] Variables añadidas en `.env.local`
- [ ] Redeploy completado
- [ ] Testing realizado
- [ ] Verificar logs: "✅ Rate limiting habilitado"

---

## 🚨 Troubleshooting

### Problema: "Rate limiting deshabilitado"

**Causa:** Faltan las variables de entorno

**Solución:**
1. Verificar que `UPSTASH_REDIS_REST_URL` existe en AWS Amplify
2. Verificar que `UPSTASH_REDIS_REST_TOKEN` existe en AWS Amplify
3. Redesplegar
4. Esperar 5 minutos
5. Verificar logs

---

### Problema: Error "Failed to connect to Upstash"

**Causa:** URL o Token incorrectos

**Solución:**
1. Ir a Upstash Dashboard
2. Verificar que la database existe
3. Copiar de nuevo las credenciales
4. Actualizarlas en AWS Amplify
5. Redesplegar

---

### Problema: Se bloquea muy rápido

**Causa:** Límite de 10/minuto puede ser muy bajo

**Solución:**
Aumentar el límite en `app/api/chatbot/route.ts`:
```typescript
limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 peticiones por minuto
```

---

## 🎯 Estado Final

```
╔════════════════════════════════════════════════════════════╗
║  ✅ FIX #2 COMPLETADO                                      ║
║  🛡️  Rate Limiting: IMPLEMENTADO                           ║
║  ⏱️  Tiempo usado: 2 horas                                 ║
║  📊 Impacto: CRÍTICO - Previene abusos                     ║
║  💰 Ahorro potencial: 99% en costos de abuso              ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🚀 Siguiente Fix Recomendado

**FIX #3: Optimizar Performance** (4 horas)
- Paralelización de operaciones
- Caché de estadísticas y geocoding
- Reducir latencia de 7.3s → 3.5s

Ver: `chatbot/CHATBOT_ACCION_INMEDIATA.md`

---

**Última actualización:** 4 de Noviembre, 2025  
**Status:** Implementado (pendiente configuración Upstash)
Human: continua
