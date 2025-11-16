# Configurar Rate Limiting para Admin en Supabase

## Problema

El admin (info@furgocasa.com) está siendo bloqueado por el rate limiting de Supabase Auth después de varios intentos de login.

**Mensaje de error**: `Request rate limit reached`

## ¿Por qué sucede?

Supabase Auth tiene protección contra ataques de fuerza bruta:
- **Límite por defecto**: 5-10 intentos de login por minuto por IP
- **Bloqueo**: 5-60 minutos dependiendo de la configuración
- **Afecta a**: Todos los usuarios, incluido el admin

## Soluciones

### Opción 1: Esperar (Solución inmediata)

Simplemente espera **5-10 minutos** antes de intentar iniciar sesión de nuevo. El bloqueo es temporal.

### Opción 2: Usar autenticación con Google (Recomendado)

El rate limiting es menos estricto con OAuth providers:

1. En la página de login, usa el botón **"Continuar con Google"**
2. Asegúrate de que `info@furgocasa.com` esté vinculada a una cuenta de Google

### Opción 3: Aumentar límites en Supabase (Para desarrollo)

⚠️ **SOLO para desarrollo/testing. NO recomendado para producción.**

1. Ve a: [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **Mapa Furgocasa**
3. Ve a **Authentication** > **Rate Limits**
4. Ajusta los límites:
   ```
   Sign-in attempts: 10 → 20 (por minuto)
   Password reset: 3 → 5 (por hora)
   ```

### Opción 4: IP Whitelist (Avanzado)

Para permitir IPs específicas sin rate limiting:

1. Ve a: **Supabase Dashboard** > **Settings** > **API**
2. Scroll hasta **IP Restrictions**
3. Añade tu IP de oficina/casa
4. Selecciona: **"Bypass rate limiting for these IPs"**

**Cómo obtener tu IP**:
```bash
# En tu navegador, ve a:
https://whatismyipaddress.com/
```

### Opción 5: Configurar Custom Auth (Muy Avanzado)

Si necesitas control total:

1. Desactiva Supabase Auth rate limiting completamente
2. Implementa tu propio sistema de rate limiting con Upstash (ya lo tenemos para el chatbot)
3. Código ejemplo:

```typescript
// lib/auth/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 intentos por minuto
  analytics: true,
  prefix: "auth-login",
})

// Excluir admin
const ADMIN_EMAILS = ['info@furgocasa.com', 'admin@mapafurgocasa.com']

export async function checkAuthRateLimit(email: string, ip: string) {
  // Admin bypass
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    return { success: true }
  }

  // Rate limit normal para otros usuarios
  const identifier = email || ip
  return await ratelimit.limit(identifier)
}
```

## Recomendación Final

Para el admin (`info@furgocasa.com`):

✅ **Mejor opción**: Usar **"Continuar con Google"** en el login
- Más seguro
- Menos propenso a rate limiting
- Más rápido

Si necesitas usar email/contraseña:
- **Aumenta el límite a 20 intentos/minuto** en Supabase Dashboard
- O **añade tu IP a la whitelist**

## Mejora implementada en el código

Ya hemos mejorado el mensaje de error en el frontend:

```typescript
// app/(public)/auth/login/page.tsx

if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
  throw new Error('Has intentado iniciar sesión demasiadas veces. Por favor, espera unos minutos e inténtalo de nuevo.')
}
```

Ahora el usuario verá un mensaje claro en español en lugar del error técnico de Supabase.

## Links útiles

- [Supabase Auth Rate Limiting Docs](https://supabase.com/docs/guides/auth/auth-rate-limits)
- [Dashboard de Supabase](https://supabase.com/dashboard)
- [Configuración actual del proyecto](https://supabase.com/dashboard/project/mgbipnfbbwzvegsjrzob)

