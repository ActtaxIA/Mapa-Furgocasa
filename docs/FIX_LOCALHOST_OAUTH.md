# FIX URGENTE: OAuth redirige a localhost:3000

## 🔴 PROBLEMA
Después de autenticar con Google, redirige a `https://localhost:3000/auth/login` en lugar de `https://www.mapafurgocasa.com/auth/login`

## 🔍 DIAGNÓSTICO

El código está correcto (hardcodeado a producción), pero el problema está en:

### 1. Configuración de Supabase Dashboard

Ve a: https://supabase.com/dashboard/project/mgbipnfbbwzvegsjrzob/auth/url-configuration

**REVISA Y ARREGLA**:

#### Site URL (Principal)
```
✅ DEBE SER: https://www.mapafurgocasa.com
❌ SI DICE:  http://localhost:3000  ← CAMBIAR
```

#### Redirect URLs (Lista permitida)
```
✅ DEBE TENER SOLO:
   https://www.mapafurgocasa.com/**
   https://www.mapafurgocasa.com/auth/callback

❌ ELIMINAR SI EXISTE:
   http://localhost:3000/**
   https://localhost:3000/**
   http://localhost:3000/auth/callback
```

### 2. Limpiar cookies del navegador móvil

En el móvil, abre el navegador y:

#### Chrome/Safari:
1. Ajustes del navegador
2. Privacidad
3. Borrar datos de navegación
4. Seleccionar "Cookies y datos de sitios"
5. Borrar

O más rápido:
- Usar **modo incógnito** para probar

### 3. Variables de entorno en AWS Amplify

Ve a: AWS Amplify Console > Variables de entorno

**VERIFICAR que NO exista**:
```
❌ ELIMINAR SI EXISTE:
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**AÑADIR si no existe**:
```
✅ AÑADIR:
NEXT_PUBLIC_SITE_URL=https://www.mapafurgocasa.com
```

## 🚀 SOLUCIÓN PASO A PASO

### Paso 1: Arreglar Supabase (CRÍTICO)

1. Ve a: https://supabase.com/dashboard/project/mgbipnfbbwzvegsjrzob/auth/url-configuration

2. **Site URL**: 
   ```
   https://www.mapafurgocasa.com
   ```

3. **Redirect URLs** - DEBE tener SOLO estas 2:
   ```
   https://www.mapafurgocasa.com/**
   https://www.mapafurgocasa.com/auth/callback
   ```

4. **Elimina** cualquier referencia a `localhost`

5. Click **"Save"**

### Paso 2: Verificar AWS Amplify

1. Ve a: AWS Amplify Console
2. Environment variables
3. Asegúrate que:
   ```
   NEXT_PUBLIC_SITE_URL = https://www.mapafurgocasa.com
   ```

### Paso 3: Redeploy

```bash
# En tu máquina
git commit --allow-empty -m "trigger: redeploy después de fix OAuth"
git push origin main
```

### Paso 4: Limpiar caché móvil

En el móvil:
1. **Cierra** completamente el navegador
2. **Borra** cookies y caché
3. O usa **modo incógnito**
4. Abre: https://www.mapafurgocasa.com/auth/login
5. Prueba login con Google

## 🧪 TESTING

### Test 1: Verificar redirectTo en consola

En el navegador móvil (o desktop), abre consola y verifica:

```javascript
// Debería mostrar:
🔐 OAuth redirectTo: https://www.mapafurgocasa.com/auth/callback?next=/mapa
```

### Test 2: Verificar cookies después de login

```javascript
// En consola después de login exitoso
document.cookie
// Debería contener: sb-mgbipnfbbwzvegsjrzob-auth-token
```

### Test 3: Verificar sesión

```javascript
const { createClient } = await import('./lib/supabase/client')
const supabase = createClient()
const { data } = await supabase.auth.getSession()
console.log('Sesión:', data.session?.user?.email)
```

## 📝 CHECKLIST

- [ ] Site URL en Supabase = `https://www.mapafurgocasa.com`
- [ ] Redirect URLs NO incluyen `localhost`
- [ ] Variables de entorno en Amplify correctas
- [ ] Código desplegado (commit y push)
- [ ] Esperado 2-3 minutos para deploy
- [ ] Cookies del móvil borradas
- [ ] Probado en modo incógnito

## 🔧 Si sigue sin funcionar

### Opción 1: Debug manual

Añade esto temporalmente en `app/(public)/auth/callback/route.ts`:

```typescript
console.log('🔍 DEBUG:')
console.log('   process.env.NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('   request.url:', request.url)
console.log('   request.headers:', Object.fromEntries(request.headers))
```

### Opción 2: Verificar Google OAuth

Ve a: https://console.cloud.google.com/apis/credentials

En las credenciales OAuth de Google:
- **Authorized JavaScript origins**: `https://www.mapafurgocasa.com`
- **Authorized redirect URIs**: 
  ```
  https://mgbipnfbbwzvegsjrzob.supabase.co/auth/v1/callback
  ```

### Opción 3: Forzar re-autorización

1. Ve a: https://myaccount.google.com/permissions
2. Busca "Mapa Furgocasa"
3. Elimina el acceso
4. Vuelve a intentar login con Google

## ⚠️ NOTA IMPORTANTE

**El problema NO está en el código** - está en:
1. Configuración de Supabase Dashboard
2. Cookies antiguas del navegador
3. Variables de entorno en Amplify

Una vez arreglado Supabase Dashboard, debería funcionar inmediatamente.
