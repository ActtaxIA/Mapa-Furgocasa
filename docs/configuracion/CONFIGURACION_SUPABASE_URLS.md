# Configuración de URLs Autorizadas en Supabase

## ✅ Problema Resuelto Definitivamente

Se han corregido **todos** los problemas críticos con la autenticación OAuth de Google:
1. **✅ Sesión no se mantiene en móvil**: Arreglado mediante mejora en la configuración de cookies
2. **✅ OAuth de Google redirige a localhost**: **ELIMINADO** - Ahora SIEMPRE redirige a producción
3. **✅ Código simplificado**: Sin detección de localhost, sin lógica condicional

## 🔥 Cambios Finales en el Código

### 1. Login con Google (`app/(public)/auth/login/page.tsx`)
```typescript
// SIEMPRE redirige a producción - SIN CONDICIONALES
const redirectUrl = 'https://www.mapafurgocasa.com/auth/callback?next=/mapa'
```

### 2. Register con Google (`app/(public)/auth/register/page.tsx`)
```typescript
// SIEMPRE redirige a producción - SIN CONDICIONALES
const redirectUrl = 'https://www.mapafurgocasa.com/auth/callback?next=/mapa'
```

### 3. Callback Route (`app/(public)/auth/callback/route.ts`)
```typescript
// SIEMPRE redirige a producción - SIN CONDICIONALES
const redirectUrl = new URL(next, 'https://www.mapafurgocasa.com')
```

### 4. Cliente de Supabase (`lib/supabase/client.ts`)
- ✅ Mejorada la configuración de cookies para móviles
- ✅ Añadido atributo `Secure` en producción (HTTPS)
- ✅ Configurado `SameSite=Lax` para compatibilidad móvil
- ✅ Cookies con `max-age=31536000` (1 año) para persistencia

### 5. Middleware (`middleware.ts`)
- ✅ Mejorada configuración de cookies en el servidor
- ✅ Detecta HTTPS correctamente usando headers
- ✅ Configura cookies con opciones óptimas para móviles

## ⚠️ IMPORTANTE: No se usa desarrollo local

Esta aplicación **NO se desarrolla localmente**. Todo el código está configurado para funcionar **ÚNICAMENTE en producción** (`https://www.mapafurgocasa.com`).

**No hay referencias a `localhost` en el código ejecutable.**

## Configuración Requerida en Supabase Dashboard

### Paso 1: Acceder a Configuración de Autenticación
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication** → **URL Configuration**

### Paso 2: Configurar URLs Autorizadas

#### **Site URL** (URL Principal)
```
https://www.mapafurgocasa.com
```

#### **Redirect URLs** (URLs de Redirección)
Añade estas URLs (una por línea):
```
https://www.mapafurgocasa.com/auth/callback
https://mapafurgocasa.com/auth/callback
https://main.d1wbtrilaad2yt.amplifyapp.com/auth/callback
https://dkqnemjcmcnyhuvstos f.supabase.co/auth/v1/callback
```

### Paso 3: Configurar Proveedores OAuth

#### Google OAuth
1. Ve a **Authentication** → **Providers**
2. Asegúrate que **Google** está habilitado
3. Verifica que tengas configurado:
   - **Client ID** de Google Cloud Console
   - **Client Secret** de Google Cloud Console

### Paso 4: Configurar en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto: **Mapa FURGOCASA NEW**
3. Ve a **APIs & Services** → **Credentials**
4. Edita tu **OAuth 2.0 Client ID**

5. En **Authorized JavaScript origins** añade:
   ```
   https://www.mapafurgocasa.com
   https://mapafurgocasa.com
   https://main.d1wbtrilaad2yt.amplifyapp.com
   ```

6. En **Authorized redirect URIs** añade:
   ```
   https://www.mapafurgocasa.com/auth/callback
   https://mapafurgocasa.com/auth/callback
   https://main.d1wbtrilaad2yt.amplifyapp.com/auth/callback
   https://dkqnemjcmcnyhuvstos f.supabase.co/auth/v1/callback
   ```

### Paso 5: Configuración de Cookies en Supabase

1. Ve a **Authentication** → **Settings**
2. Busca la sección **Cookie Settings**
3. Asegúrate que:
   - **Cookie Duration** está configurado a un valor alto (ej: 31536000 segundos = 1 año)
   - **Cookie SameSite** está en `Lax` (recomendado para móviles)

## Testing en Producción

### Probar OAuth de Google
1. Ve a `https://www.mapafurgocasa.com/auth/login`
2. Click en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. **✅ DEBE redirigir a: `https://www.mapafurgocasa.com/mapa`**
5. **❌ NUNCA debe redirigir a: `localhost`**

### Probar Sesión en Móvil
1. Cierra sesión completamente
2. Limpia las cookies del navegador móvil
3. Inicia sesión con email/password o con Google
4. Cierra el navegador
5. Abre el navegador nuevamente
6. Verifica que la sesión se mantiene

## Solución de Problemas

### Si aparece error "redirect_uri_mismatch":
1. Las URLs en Google Cloud Console no coinciden
2. Verifica que has añadido EXACTAMENTE las mismas URLs en ambos lugares
3. Google es sensible a `http://` vs `https://` y `www` vs sin `www`
4. Espera 5-10 minutos para que los cambios se propaguen

### Si la sesión no se mantiene en móvil:
1. Verifica que tu dominio usa HTTPS (no HTTP)
2. Limpia completamente las cookies del navegador móvil
3. Verifica en las DevTools del móvil que las cookies tienen el atributo `Secure`
4. Comprueba que `SameSite=Lax` está configurado

### Si OAuth redirige incorrectamente:
**Esto ya no debería pasar**, pero si sucede:
1. Limpia el caché del navegador completamente
2. Espera 5-10 minutos para que los cambios se propaguen
3. Verifica que has hecho deploy del código más reciente
4. Revisa que NO haya código antiguo con lógica de localhost

## Variables de Entorno

Asegúrate de tener estas variables configuradas en Amplify:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dkqnemjcmcnyhuvstos f.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[TU-ANON-KEY]
```

## Páginas Legales Añadidas

Se han creado dos nuevas páginas con contenido legal completo:

- **✅ `/privacidad`** - Política de Privacidad (RGPD compliant)
- **✅ `/condiciones`** - Condiciones del Servicio
- **✅ Footer actualizado** - Con logo blanco de Furgocasa y enlaces a páginas legales
- **✅ Footer añadido a `/perfil`** - Consistencia en toda la app

## Estado Final

- ✅ Código actualizado y desplegado
- ✅ OAuth SIEMPRE redirige a producción
- ✅ Ninguna referencia a localhost en código ejecutable
- ✅ Footer con logo blanco en todas las páginas
- ✅ Páginas legales creadas (/privacidad, /condiciones)
- ✅ Código simplificado sin lógica condicional de entorno
- ✅ Probado y funcionando en producción

**Última actualización**: 28 de octubre de 2025
