# Fix: OAuth Google - Sesión no persiste

## Problemas identificados

### 1️⃣ Múltiples instancias de GoTrueClient

**Error en consola**:
```
Multiple GoTrueClient instances detected in the same browser context. 
It is not an error, but this should be avoided as it may produce 
undefined behavior when used concurrently under the same storage key.
```

**Causa**: 
Cada vez que se llamaba `createClient()` se creaba una nueva instancia de Supabase Client.

**Solución**:
Implementar patrón **Singleton** en `lib/supabase/client.ts`:

```typescript
// Singleton instance
let client: SupabaseClient<Database> | undefined;

export function createClient() {
  // Si ya existe una instancia en el navegador, reutilizarla
  if (client) {
    return client;
  }

  // Crear nueva instancia solo si no existe
  client = createBrowserClient<Database>(...)
  
  return client;
}
```

✅ **Resultado**: Una sola instancia compartida, sin warnings.

---

### 2️⃣ Sesión no persiste después de login con Google

**Síntoma**: 
Después de hacer login con Google, la página redirige pero la sesión "rebota" y vuelve al login.

**Causas múltiples**:
1. Cookies no se establecían correctamente en el callback
2. Configuración de cookies insegura
3. Falta de manejo de errores
4. No se guardaba manualmente el token de sesión

**Solución completa en `app/(public)/auth/callback/route.ts`**:

#### A. Logs detallados para debugging
```typescript
console.log('🔐 [OAuth Callback] Iniciando...')
console.log('   Code presente:', !!code)
console.log('   Next URL:', next)
console.log('   Redirect URL:', redirectUrl.toString())
console.log('   Intercambiando código por sesión...')
console.log('✅ Sesión creada exitosamente')
console.log('   User:', data.user?.email)
```

#### B. Configuración segura de cookies
```typescript
cookieStore.set({
  name,
  value,
  ...options,
  path: '/',
  sameSite: 'lax',
  secure: true,      // HTTPS obligatorio
  httpOnly: true,    // Protección XSS
})
```

#### C. Establecer cookies de sesión manualmente
```typescript
// Establecer cookies de sesión manualmente para asegurar persistencia
const sessionCookies = [
  {
    name: `sb-${projectRef}-auth-token`,
    value: JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      token_type: 'bearer',
      user: data.user,
    }),
  },
]

for (const cookie of sessionCookies) {
  response.cookies.set({
    name: cookie.name,
    value: cookie.value,
    path: '/',
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 días
  })
}
```

#### D. Manejo robusto de errores
```typescript
try {
  // ... proceso OAuth
  
  if (error) {
    console.error('❌ Error en exchangeCodeForSession:', error)
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', baseUrl))
  }
  
} catch (error) {
  console.error('❌ [OAuth Callback] Error general:', error)
  return NextResponse.redirect(new URL('/auth/login?error=server_error', request.url))
}
```

---

## Cómo probar que funciona

### 1. Limpiar estado anterior
```javascript
// En consola del navegador (F12)
localStorage.clear()
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;"
})
location.reload()
```

### 2. Hacer login con Google
1. Ve a: https://www.mapafurgocasa.com/auth/login
2. Click en **"Continuar con Google"**
3. Selecciona tu cuenta de Google
4. Deberías ser redirigido a `/mapa` con sesión iniciada

### 3. Verificar sesión
```javascript
// En consola del navegador
const { createClient } = await import('./lib/supabase/client')
const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('Sesión:', session)
console.log('Usuario:', session?.user?.email)
```

Deberías ver:
```javascript
Sesión: { access_token: "...", refresh_token: "...", ... }
Usuario: "info@furgocasa.com"
```

### 4. Verificar cookies
En **DevTools > Application > Cookies > https://www.mapafurgocasa.com**:

Deberías ver:
- `sb-mgbipnfbbwzvegsjrzob-auth-token` (con tu token)
- `sb-mgbipnfbbwzvegsjrzob-auth-token.0`, `.1`, `.2`... (si el token es muy largo)

---

## Beneficios de los cambios

✅ **Sesión persiste** después de login con Google  
✅ **No más warnings** de múltiples instancias  
✅ **Cookies seguras** (httpOnly, secure)  
✅ **Logs claros** para debugging  
✅ **Mejor UX** - login fluido sin "rebotes"  
✅ **Duración optimizada** - 7 días de sesión  

---

## Troubleshooting

### Si sigue sin funcionar:

#### 1. Verifica las variables de entorno en Vercel/AWS Amplify
```bash
NEXT_PUBLIC_SUPABASE_URL=https://mgbipnfbbwzvegsjrzob.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://www.mapafurgocasa.com
```

#### 2. Verifica la URL de callback en Supabase Dashboard
1. Ve a: https://supabase.com/dashboard
2. Authentication > URL Configuration
3. **Redirect URLs** debe incluir:
   ```
   https://www.mapafurgocasa.com/auth/callback
   https://www.mapafurgocasa.com/**
   ```

#### 3. Verifica que HTTPS esté activo
OAuth solo funciona con HTTPS. En desarrollo local, usa:
```bash
# Opción 1: ngrok
ngrok http 3000

# Opción 2: Probar directamente en producción
```

#### 4. Revisa los logs del servidor
Los logs ahora incluyen información detallada:
```
🔐 [OAuth Callback] Iniciando...
   Code presente: true
   Next URL: /mapa
   Redirect URL: https://www.mapafurgocasa.com/mapa
   Intercambiando código por sesión...
✅ Sesión creada exitosamente
   User: info@furgocasa.com
   Session expira: 2025-11-23T...
   Cookies establecidas en respuesta
```

---

## Referencias

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [OAuth Flow](https://supabase.com/docs/guides/auth/social-login)
- [Cookie Configuration](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

