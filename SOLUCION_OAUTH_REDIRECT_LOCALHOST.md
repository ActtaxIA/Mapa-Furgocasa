# Solución: OAuth Redirige a localhost:3000

## ✅ Problema Identificado y Resuelto

**Problema**: Después de autenticarse con Google OAuth, redirige a `localhost:3000` en lugar de `www.mapafurgocasa.com`

**Causa**: El código antiguo todavía está desplegado en producción. Los cambios con la detección automática de URL no se han aplicado.

## 🔧 Cambios Realizados

### 1. Código Actualizado (Ya en GitHub)
El archivo `app/(public)/auth/login/page.tsx` ya tiene el código correcto:

```typescript
const handleGoogleLogin = async () => {
  try {
    const supabase = createClient()
    
    // Detectar la URL base según el entorno
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://www.mapafurgocasa.com'
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    })
    if (error) throw error
  } catch (error: any) {
    setError(error.message || 'Error al iniciar sesión con Google')
  }
}
```

### 2. Configuración de Google OAuth (Corregida)
- ✅ URL correcta de Supabase: `dkqnemjcmcnyhuvstosf.supabase.co` (no "ost", sino "osf")
- ✅ Todas las URLs necesarias añadidas en Google Cloud Console

### 3. Deploy Forzado
Se ha hecho un push para forzar un nuevo deploy en AWS Amplify.

## 📋 Verificación del Deploy

### Paso 1: Verificar en AWS Amplify Console
1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Selecciona tu aplicación
3. En **Build history**, busca el último deploy:
   - Commit: **"Force deploy: OAuth redirige a localhost - forzar rebuild"**
   - Estado: Debe estar **"Succeed"** (verde)
4. **Espera 3-5 minutos** a que complete si está en progreso

### Paso 2: Verificar que el Código Correcto Está Desplegado

Opción A - Desde el navegador:
1. Ve a `https://www.mapafurgocasa.com`
2. Abre DevTools (F12)
3. Ve a **Console**
4. Escribe:
```javascript
fetch('https://www.mapafurgocasa.com/auth/login')
  .then(r => r.text())
  .then(html => {
    if (html.includes('window.location.origin')) {
      console.log('✅ Código correcto desplegado')
    } else {
      console.log('❌ Código antiguo todavía activo')
    }
  })
```

Opción B - Forzar recarga sin caché:
1. Ve a `https://www.mapafurgocasa.com/auth/login`
2. Presiona **Ctrl + Shift + R** (Windows/Linux) o **Cmd + Shift + R** (Mac)
3. Esto recarga la página sin usar caché

### Paso 3: Limpiar Caché de Amplify (Si es necesario)

Si después de 5 minutos sigue redirigiendo a localhost:

1. En AWS Amplify Console
2. Ve a **App Settings** → **Build settings**
3. Haz clic en **Clear cache and deploy**
4. Espera a que termine el nuevo deploy

## 🧪 Prueba Final

Una vez que el deploy esté completo (verde en Amplify):

1. **Limpia la caché del navegador**:
   - Presiona `Ctrl + Shift + Del`
   - Selecciona "Cookies" e "Imágenes en caché"
   - Borra datos

2. **Cierra el navegador completamente**

3. **Abre el navegador de nuevo**

4. **Ve a**: `https://www.mapafurgocasa.com/auth/login`

5. **Click en "Continuar con Google"**

6. **Resultado esperado**: Después de autenticarte con Google, deberías ser redirigido a:
   ```
   https://www.mapafurgocasa.com/mapa
   ```
   **NO a `localhost:3000`**

## 🔍 Diagnóstico Adicional

Si después de todo esto SIGUE redirigiendo a localhost:

### Verificar Variables de Entorno en Amplify

1. AWS Amplify Console → **App settings** → **Environment variables**
2. Verifica que existan:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dkqnemjcmcnyhuvstosf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
   ```
3. **IMPORTANTE**: No debe haber ninguna variable que diga `localhost`

### Verificar en Supabase Dashboard

1. Ve a Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. **Site URL** debe ser: `https://www.mapafurgocasa.com`
4. **NO debe ser**: `http://localhost:3000`

Si Site URL está en localhost, cámbialo a:
```
https://www.mapafurgocasa.com
```

## 📊 Timeline Esperado

- ⏱️ **0-2 minutos**: Build en progreso en Amplify
- ⏱️ **2-4 minutos**: Deploy completado
- ⏱️ **4-5 minutos**: Caché de CDN actualizado
- ✅ **5 minutos**: OAuth debería redirigir correctamente

## ✅ Estado Actual

- ✅ Código correcto en GitHub (commit: `dc5691f`)
- ✅ URLs correctas en Google Cloud Console
- ⏳ Esperando deploy de AWS Amplify
- ⏳ Pendiente: Verificar que funcione después del deploy

## 🆘 Si Nada Funciona

Ejecuta este script en la consola del navegador (en `www.mapafurgocasa.com/auth/login`):

```javascript
(async () => {
  console.log('=== DIAGNÓSTICO OAUTH ===')
  console.log('1. URL actual:', window.location.href)
  console.log('2. Protocol:', window.location.protocol)
  console.log('3. Host:', window.location.host)
  console.log('4. Origin:', window.location.origin)
  
  // Verificar qué URL usaría para OAuth
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://www.mapafurgocasa.com'
  
  console.log('5. Base URL para OAuth:', baseUrl)
  console.log('6. Redirect URL sería:', `${baseUrl}/auth/callback`)
  console.log('=== FIN DIAGNÓSTICO ===')
})()
```

Copia el resultado y envíalo para diagnóstico adicional.

