# Diagnóstico: Sesión No Se Mantiene

## 🔍 Problema Reportado
La sesión no se mantiene iniciada después de hacer los cambios de autenticación.

## ✅ Cambios Aplicados Para Corregir

### 1. **Mejora en `lib/supabase/client.ts`**
- ✅ Añadido `encodeURIComponent` / `decodeURIComponent` para manejar tokens especiales
- ✅ Cambiada detección de producción a usar `window.location.protocol === 'https:'`
- ✅ Mejorado el manejo de `maxAge` con valor por defecto de 31536000 (1 año)
- ✅ Cookies con `SameSite=Lax` y `Secure` en HTTPS

### 2. **Mejora en `app/(public)/auth/callback/route.ts`**
- ✅ Creamos la respuesta ANTES de intercambiar el código
- ✅ Establecemos cookies TANTO en cookieStore COMO en response
- ✅ Todas las cookies tienen `maxAge: 31536000` (1 año)
- ✅ `httpOnly: false` para que el cliente pueda leer las cookies de sesión
- ✅ Detecta correctamente HTTPS usando headers `x-forwarded-proto`

### 3. **Middleware ya optimizado**
- ✅ Refresca la sesión en cada request con `await supabase.auth.getUser()`
- ✅ Establece cookies correctamente con todos los atributos

## 🧪 Cómo Diagnosticar el Problema

### Paso 1: Verificar Variables de Entorno
Abre la consola de tu navegador y ejecuta:
```javascript
console.log({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
})
```

### Paso 2: Verificar Cookies en el Navegador
1. Abre DevTools (F12)
2. Ve a **Application** (Chrome) o **Storage** (Firefox)
3. Busca **Cookies** → selecciona tu dominio
4. Busca cookies que empiecen con `sb-`

**Deberías ver estas cookies:**
- `sb-[project-id]-auth-token`
- `sb-[project-id]-auth-token-code-verifier`

**Verifica que tengan estos atributos:**
- ✅ `Path`: `/`
- ✅ `Max-Age` o `Expires`: fecha futura (1 año)
- ✅ `SameSite`: `Lax`
- ✅ `Secure`: `true` (solo en HTTPS)
- ✅ `HttpOnly`: `false` (las cookies de Supabase necesitan ser accesibles por JavaScript)

### Paso 3: Verificar que la Sesión se Guarda
Ejecuta en la consola del navegador:
```javascript
const { createClient } = await import('/lib/supabase/client')
const supabase = createClient()
const { data } = await supabase.auth.getSession()
console.log('Sesión actual:', data)
```

### Paso 4: Verificar después de Recargar
1. Inicia sesión
2. Recarga la página (F5)
3. Ejecuta de nuevo el código del Paso 3
4. Verifica que `data.session` NO sea `null`

### Paso 5: Verificar Cookies en Móvil
En dispositivo móvil:
1. Usa Chrome en Android o Safari en iOS
2. Habilita modo desarrollador:
   - **Android**: Conecta el móvil y usa `chrome://inspect`
   - **iOS**: Conecta el móvil y usa Safari → Develop
3. Verifica las cookies igual que en Paso 2

## 🚨 Posibles Causas del Problema

### Causa 1: Variables de Entorno No Están en Producción
**Síntoma**: La app funciona en local pero no en producción

**Solución**:
1. Ve a AWS Amplify Console
2. **App settings** → **Environment variables**
3. Verifica que existan:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
   ```

### Causa 2: Configuración de Supabase Incorrecta
**Síntoma**: Las cookies no se establecen o son eliminadas inmediatamente

**Solución**:
1. Ve a Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. **Site URL** debe ser: `https://www.mapafurgocasa.com`
4. **Redirect URLs** debe incluir:
   ```
   https://www.mapafurgocasa.com/auth/callback
   https://mapafurgocasa.com/auth/callback
   https://main.d1wbtrilaad2yt.amplifyapp.com/auth/callback
   ```

### Causa 3: Cookies Bloqueadas por el Navegador
**Síntoma**: Funciona en PC pero no en móvil

**Solución**:
1. Verifica que el sitio use HTTPS (no HTTP)
2. En Safari iOS: Settings → Safari → Bloquear todas las cookies → debe estar DESACTIVADO
3. En Chrome Android: Settings → Site settings → Cookies → debe estar PERMITIDO

### Causa 4: Problema con el Dominio
**Síntoma**: Las cookies se crean pero no persisten entre recargas

**Posible problema**: Si el sitio alterna entre `www.mapafurgocasa.com` y `mapafurgocasa.com`, las cookies no se comparten

**Solución**:
1. Configura un redirect permanente de uno a otro
2. O añade el atributo `domain` a las cookies (PELIGROSO, no recomendado por seguridad)

### Causa 5: Build/Deploy No Se Completó
**Síntoma**: Los cambios no se aplican en producción

**Solución**:
1. Ve a AWS Amplify Console
2. Verifica que el último deploy tenga estado **Succeed**
3. Si está en progreso, espera a que termine
4. Si falló, revisa los logs

## 🔧 Soluciones Adicionales

### Solución 1: Limpiar Cookies y Probar de Nuevo
```javascript
// Ejecutar en consola para limpiar todas las cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
```

### Solución 2: Verificar que Next.js Use el Middleware Correcto
El archivo `middleware.ts` debe estar en la raíz del proyecto y debe tener:
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Solución 3: Forzar Relogin
Si nada funciona, pide a los usuarios que:
1. Cierren sesión completamente
2. Limpien las cookies del sitio
3. Cierren el navegador
4. Vuelvan a abrir y login de nuevo

## 📊 Checklist de Verificación

- [ ] Variables de entorno están en Amplify
- [ ] URLs configuradas en Supabase Dashboard
- [ ] URLs configuradas en Google Cloud Console
- [ ] Último deploy en Amplify completado exitosamente
- [ ] Cookies se crean con `Max-Age: 31536000`
- [ ] Cookies tienen `Secure: true` en HTTPS
- [ ] Cookies tienen `SameSite: Lax`
- [ ] Cookies tienen `Path: /`
- [ ] `supabase.auth.getSession()` retorna sesión válida
- [ ] La sesión persiste después de recargar la página
- [ ] La sesión persiste después de cerrar y abrir el navegador

## 🆘 Si Sigue Sin Funcionar

Ejecuta este script en la consola del navegador después de hacer login:
```javascript
(async () => {
  const { createClient } = await import('/lib/supabase/client')
  const supabase = createClient()
  
  console.log('=== DIAGNÓSTICO DE SESIÓN ===')
  console.log('1. URL:', window.location.href)
  console.log('2. Protocol:', window.location.protocol)
  console.log('3. Hostname:', window.location.hostname)
  
  const cookies = document.cookie.split(';').map(c => c.trim())
  console.log('4. Cookies totales:', cookies.length)
  console.log('5. Cookies Supabase:', cookies.filter(c => c.startsWith('sb-')))
  
  const { data: { session }, error } = await supabase.auth.getSession()
  console.log('6. Sesión:', session ? 'SÍ EXISTE' : 'NO EXISTE')
  console.log('7. Error:', error)
  
  if (session) {
    console.log('8. User ID:', session.user.id)
    console.log('9. Expira en:', new Date(session.expires_at * 1000))
  }
  
  console.log('=== FIN DIAGNÓSTICO ===')
})()
```

Copia y envía el resultado completo para diagnóstico adicional.

