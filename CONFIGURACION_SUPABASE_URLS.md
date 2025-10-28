# Configuración de URLs Autorizadas en Supabase

## Problema Resuelto
Se han corregido dos problemas críticos con la autenticación:
1. **Sesión no se mantiene en móvil**: Arreglado mediante mejora en la configuración de cookies
2. **OAuth de Google redirige a localhost**: Corregido para usar la URL del dominio actual

## Cambios Realizados en el Código

### 1. Cliente de Supabase (`lib/supabase/client.ts`)
- ✅ Mejorada la configuración de cookies para móviles
- ✅ Añadido atributo `Secure` en producción (HTTPS)
- ✅ Configurado `SameSite=Lax` para compatibilidad móvil
- ✅ Cookies con `max-age=31536000` (1 año) para persistencia

### 2. Login con Google (`app/(public)/auth/login/page.tsx`)
- ✅ Cambiado de URL hardcodeada a URL dinámica
- ✅ Usa `window.location.origin` para detectar el dominio actual
- ✅ Funciona en desarrollo (localhost) y producción (www.mapafurgocasa.com)

### 3. Callback Route (`app/(public)/auth/callback/route.ts`)
- ✅ Actualizado para usar el cliente correcto de Supabase SSR
- ✅ Mejorado manejo de errores
- ✅ Redirige al login si hay error en la autenticación

### 4. Middleware (`middleware.ts`)
- ✅ Mejorada configuración de cookies en el servidor
- ✅ Detecta HTTPS correctamente usando headers
- ✅ Configura cookies con opciones óptimas para móviles

## Configuración Requerida en Supabase Dashboard

Para que el OAuth de Google funcione correctamente, debes verificar estas configuraciones en el Dashboard de Supabase:

### Paso 1: Acceder a Configuración de Autenticación
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication** → **URL Configuration**

### Paso 2: Configurar URLs Autorizadas

Añade las siguientes URLs en los campos correspondientes:

#### **Site URL** (URL Principal)
```
https://www.mapafurgocasa.com
```

#### **Redirect URLs** (URLs de Redirección)
Añade TODAS estas URLs (una por línea):
```
https://www.mapafurgocasa.com/auth/callback
https://mapafurgocasa.com/auth/callback
https://main.d1wbtrilaad2yt.amplifyapp.com/auth/callback
http://localhost:3000/auth/callback
```

> **Nota**: Incluye localhost para desarrollo y testing local

### Paso 3: Configurar Proveedores OAuth

#### Google OAuth
1. Ve a **Authentication** → **Providers**
2. Asegúrate que **Google** está habilitado
3. Verifica que tengas configurado:
   - **Client ID** de Google Cloud Console
   - **Client Secret** de Google Cloud Console

### Paso 4: Configurar en Google Cloud Console

También necesitas configurar las URLs autorizadas en Google Cloud Console:

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Edita tu **OAuth 2.0 Client ID**
5. En **Authorized JavaScript origins** añade:
   ```
   https://www.mapafurgocasa.com
   https://mapafurgocasa.com
   https://main.d1wbtrilaad2yt.amplifyapp.com
   http://localhost:3000
   ```
6. En **Authorized redirect URIs** añade:
   ```
   https://www.mapafurgocasa.com/auth/callback
   https://mapafurgocasa.com/auth/callback
   https://main.d1wbtrilaad2yt.amplifyapp.com/auth/callback
   http://localhost:3000/auth/callback
   ```
   
   Y también las URLs de Supabase:
   ```
   https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback
   ```

### Paso 5: Configuración de Cookies en Supabase

1. Ve a **Authentication** → **Settings**
2. Busca la sección **Cookie Settings**
3. Asegúrate que:
   - **Cookie Duration** está configurado a un valor alto (ej: 31536000 segundos = 1 año)
   - **Cookie SameSite** está en `Lax` (recomendado para móviles)

## Testing

### Probar en Móvil
1. Cierra sesión completamente
2. Limpia las cookies del navegador móvil
3. Inicia sesión con email/password o con Google
4. Cierra el navegador
5. Abre el navegador nuevamente
6. Verifica que la sesión se mantiene

### Probar OAuth de Google
1. Ve a `www.mapafurgocasa.com/auth/login`
2. Click en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Verifica que redirige a `www.mapafurgocasa.com/mapa` (NO a localhost)

## Solución de Problemas

### Si la sesión sigue sin mantenerse en móvil:
1. Verifica que tu dominio usa HTTPS (no HTTP)
2. Limpia completamente las cookies del navegador móvil
3. Verifica en las DevTools del móvil que las cookies tienen el atributo `Secure`
4. Comprueba que `SameSite=Lax` está configurado

### Si OAuth sigue redirigiendo a localhost:
1. Verifica que has guardado los cambios en Supabase Dashboard
2. Espera 5-10 minutos para que los cambios se propaguen
3. Limpia el caché del navegador
4. Verifica las URLs en Google Cloud Console

### Si aparece error "redirect_uri_mismatch":
1. Las URLs en Google Cloud Console no coinciden
2. Verifica que has añadido EXACTAMENTE las mismas URLs en ambos lugares
3. Google es sensible a la diferencia entre `http://` y `https://`

## Variables de Entorno

Asegúrate de tener estas variables configuradas en tu `.env.local` o en Amplify:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[TU-PROYECTO-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[TU-ANON-KEY]
```

## Despliegue

Después de estos cambios, necesitas:
1. ✅ Commit y push de los cambios
2. ✅ Desplegar en Amplify (se hace automáticamente con push a main)
3. ✅ Verificar las configuraciones en Supabase Dashboard
4. ✅ Verificar las configuraciones en Google Cloud Console
5. ✅ Probar en móvil después del despliegue

## Estado de los Cambios

- ✅ Código actualizado localmente
- ⏳ Pendiente: Verificar configuración en Supabase Dashboard
- ⏳ Pendiente: Verificar configuración en Google Cloud Console
- ⏳ Pendiente: Deploy y testing en producción

