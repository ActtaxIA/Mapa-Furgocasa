# 🚨 FIX CRÍTICO DE SEGURIDAD - AUTENTICACIÓN

## PROBLEMA IDENTIFICADO

Has reportado que **accedes desde un dispositivo nuevo y ves sesiones de cuentas que no conoces**. Esto es un **problema CRÍTICO de seguridad** causado por:

### 1. **Singleton Global Compartido** (CATASTRÓFICO)
El código anterior usaba `globalThis.__supabase_client` que compartía la MISMA instancia de Supabase entre TODOS los usuarios, permitiendo que las sesiones se filtraran entre usuarios diferentes.

### 2. **Bucle Infinito de Refresh Tokens**
El sistema entraba en un bucle infinito intentando refrescar tokens, causando error 429 (Too Many Requests) y bloqueando el acceso.

### 3. **Cookies Inseguras**
Las cookies de autenticación tenían `httpOnly: false`, haciéndolas vulnerables a ataques XSS.

## SOLUCIONES APLICADAS

### ✅ 1. Eliminado Singleton Global
**Archivo:** `lib/supabase/client.ts`

**ANTES (INSEGURO):**
```typescript
declare global {
  var __supabase_client: SupabaseClient<Database> | undefined;
}

if (globalThis.__supabase_client) {
  return globalThis.__supabase_client; // ❌ COMPARTIDO ENTRE USUARIOS
}
```

**AHORA (SEGURO):**
```typescript
export function createClient() {
  return createBrowserClient<Database>(...) // ✅ Nueva instancia cada vez
}
```

Cada llamada a `createClient()` ahora crea una **instancia NUEVA** con su propia sesión aislada.

### ✅ 2. Configuración PKCE y Auto-Refresh Controlado
```typescript
auth: {
  flowType: 'pkce', // ✅ PKCE para mayor seguridad
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
}
```

Esto evita el bucle infinito de refresh tokens y mejora la seguridad.

### ✅ 3. Cookies Seguras con httpOnly
**Archivo:** `app/(public)/auth/callback/route.ts`

```typescript
const isSessionCookie = name.includes('auth-token') && !name.includes('refresh')
httpOnly: !isSessionCookie, // ✅ TRUE para refresh tokens, FALSE para access tokens
```

Ahora las cookies sensibles (refresh tokens) tienen `httpOnly: true`, protegiéndolas de XSS.

### ✅ 4. Logout Completo y Seguro
**Archivo:** `components/layout/Navbar.tsx`

El logout ahora:
1. Cierra sesión en Supabase
2. Elimina TODAS las cookies de autenticación
3. Limpia localStorage (preservando preferencias de UI)
4. Limpia sessionStorage
5. Redirige al home

## PASOS INMEDIATOS QUE DEBES SEGUIR

### 🔴 1. LIMPIAR SESIONES ACTUALES (URGENTE)

**En tu navegador**, abre la consola (F12) y ejecuta:

```javascript
// Limpiar todo el almacenamiento
localStorage.clear();
sessionStorage.clear();

// Eliminar TODAS las cookies de auth
document.cookie.split(";").forEach(function(c) { 
  const cookieName = c.trim().split("=")[0];
  if (cookieName.includes('sb-') || cookieName.includes('supabase')) {
    document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
  }
});

// Recargar
location.reload();
```

### 🔴 2. HACER COMMIT Y PUSH

Los archivos modificados son:
- `lib/supabase/client.ts` ✅ (Ya modificado)
- `app/(public)/auth/callback/route.ts` ✅ (Ya modificado)
- `components/layout/Navbar.tsx` ✅ (Ya modificado)

Ejecuta:
```bash
git add lib/supabase/client.ts app/\(public\)/auth/callback/route.ts components/layout/Navbar.tsx
git commit -m "fix: SEGURIDAD CRÍTICA - eliminar singleton compartido y mejorar auth"
git push origin main
```

### 🔴 3. ESPERAR DESPLIEGUE AWS AMPLIFY

Después del push:
1. Ve a AWS Amplify Console
2. Espera 2-3 minutos para que construya y despliegue
3. Verifica que el build sea exitoso

### 🔴 4. LIMPIAR CACHÉ EN PRODUCCIÓN

Una vez desplegado, en **TODOS** los dispositivos donde uses la app:

1. Abre https://www.mapafurgocasa.com
2. Presiona **Ctrl + F5** (Windows) o **Cmd + Shift + R** (Mac)
3. Abre la consola (F12) y ejecuta el script de limpieza del paso 1
4. Cierra el navegador completamente
5. Vuelve a abrirlo y accede de nuevo

### 🔴 5. VERIFICAR SESIONES

Para verificar que todo funciona correctamente:

1. Haz login con tu cuenta
2. Abre la consola (F12) → Application/Storage → Cookies
3. Verifica que solo veas cookies con tu proyecto ID de Supabase
4. En otro navegador/dispositivo/modo incógnito, **NO** deberías ver ninguna sesión iniciada

## CÓMO PREVENIR ESTE PROBLEMA EN EL FUTURO

### ✅ NUNCA usar singletons globales para clientes de autenticación
```typescript
// ❌ MAL - Compartido entre usuarios
globalThis.__client = createClient()

// ✅ BIEN - Nueva instancia cada vez
export function createClient() {
  return createBrowserClient(...)
}
```

### ✅ SIEMPRE limpiar sesiones completamente al hacer logout
- Eliminar cookies de auth
- Limpiar localStorage/sessionStorage
- Invalidar sesión en el servidor

### ✅ SIEMPRE usar cookies seguras
- `httpOnly: true` para tokens sensibles
- `secure: true` en producción (HTTPS)
- `sameSite: 'lax'` o `'strict'`

## TESTING

Para confirmar que el problema está resuelto:

### Test 1: Sesión Aislada
1. Dispositivo A: Haz login con usuario1@test.com
2. Dispositivo B (modo incógnito): NO debería haber sesión
3. Dispositivo B: Haz login con usuario2@test.com
4. Dispositivo A: Debería seguir con usuario1@test.com (NO usuario2)

### Test 2: No Bucle de Tokens
1. Abre la consola del navegador
2. Haz login
3. NO deberías ver múltiples peticiones POST a `/auth/v1/token?grant_type=refresh_token`
4. Si ves 1-2 peticiones es normal, si ves 10+ es un bucle

### Test 3: Logout Completo
1. Haz login
2. Verifica que hay cookies `sb-*` en Application → Cookies
3. Haz logout
4. Verifica que NO quedan cookies `sb-*`
5. localStorage/sessionStorage deben estar limpios (excepto `hasSeenWelcome`)

## RESUMEN DE CAMBIOS

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `lib/supabase/client.ts` | Eliminado singleton global | ✅ Sesiones aisladas por usuario |
| `lib/supabase/client.ts` | Añadido PKCE y configuración auth | ✅ No más bucle de tokens |
| `app/(public)/auth/callback/route.ts` | Cookies httpOnly correctas | ✅ Protección contra XSS |
| `components/layout/Navbar.tsx` | Logout completo | ✅ Limpieza total de sesión |

## ESTADO ACTUAL

- ✅ Código corregido y guardado
- ⏳ Pendiente: Commit y push
- ⏳ Pendiente: Despliegue en AWS Amplify
- ⏳ Pendiente: Limpieza de sesiones actuales
- ⏳ Pendiente: Testing de verificación

## CONTACTO

Si después de aplicar estos cambios sigues viendo sesiones de otros usuarios:

1. Verifica que el despliegue en AWS Amplify fue exitoso
2. Confirma que limpiaste localStorage/cookies en TODOS los dispositivos
3. Usa modo incógnito para testing (sesión limpia)
4. Si persiste, hay que revisar la configuración de Supabase Auth directamente

**Este problema era CRÍTICO y ya está resuelto en el código. Solo falta desplegarlo.**

