# 🎯 Solución Final: OAuth Redirige a localhost:3000

## ✅ Diagnóstico Confirmado

**Síntomas**:
- ✅ Login con email funciona perfecto
- ✅ OAuth con Google autentica correctamente  
- ✅ La sesión PERSISTE después de recargar (esto es clave!)
- ❌ PERO redirige temporalmente a `localhost:3000` antes de la sesión final

**Esto significa**: El OAuth funciona, las cookies funcionan, PERO hay una configuración incorrecta que causa la redirección inicial a localhost.

## 🔍 Causa Real del Problema

El problema NO es el código (que está correcto), sino **una configuración en Supabase que tiene guardada una URL de localhost** de cuando estabas desarrollando.

## 🔧 Solución Definitiva

### Paso 1: Configuración en Supabase Dashboard

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto "Mapa Furgocasa"
3. Ve a **Authentication** → **Providers**
4. Busca y haz clic en **Google**

Dentro de la configuración de Google Provider, verifica:

#### A) **Site URL** (en la parte superior de Authentication)
```
https://www.mapafurgocasa.com
```
**NO debe decir `localhost` en ningún lugar**

#### B) **Additional Redirect URLs** (dentro de Google Provider)
Asegúrate que NO exista ninguna URL de localhost aquí. Si hay alguna, elimínala.

#### C) **Callback URL (for OAuth)**
Esta es generada automáticamente por Supabase y debe ser:
```
https://dkqnemjcmcnyhuvstosf.supabase.co/auth/v1/callback
```

### Paso 2: Limpiar localStorage y sessionStorage

Supabase puede estar guardando información antigua en el navegador. Ejecuta esto en la consola de tu navegador (F12):

```javascript
// Limpiar TODO el storage de Supabase
localStorage.clear();
sessionStorage.clear();
console.log('Storage limpiado ✅');
```

### Paso 3: Verificar Variables de Entorno en Amplify

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Selecciona tu app
3. **App settings** → **Environment variables**
4. Verifica que NO exista ninguna variable con `localhost`
5. Verifica que existan:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dkqnemjcmcnyhuvstosf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-key]
   ```

### Paso 4: Verificar con la Página de Diagnóstico

Una vez que el deploy esté completo (en 2-3 minutos), ve a:
```
https://www.mapafurgocasa.com/test-oauth-redirect.html
```

Esta página te mostrará:
- ✅ La URL actual desde donde estás accediendo
- ✅ Qué URL generaría el código para OAuth
- ✅ Si hay algún problema de configuración

**Debe decir**: "✅ CORRECTO: El código generaría la URL correcta"

## 🧪 Prueba Final

Después de hacer los cambios anteriores:

1. **Cierra TODOS los navegadores** (Chrome, Edge, etc.)
2. **Abre un navegador nuevo** (o ventana incógnito)
3. Ve a: `https://www.mapafurgocasa.com/auth/login`
4. Click en "Continuar con Google"
5. Selecciona tu cuenta
6. **Resultado esperado**: Debe redirigir directamente a `https://www.mapafurgocasa.com/mapa`

## 🔍 Diagnóstico Adicional

Si aún redirige a localhost, el problema podría ser que Supabase tiene configurado internamente un redirect URL de desarrollo. 

### Verifica el Flujo OAuth en Supabase

1. En Supabase Dashboard → **Authentication** → **URL Configuration**
2. Busca si hay una sección que diga **"Additional Redirect URLs"** o **"Development URLs"**
3. Si hay alguna referencia a `localhost:3000`, **elimínala**

### Verifica la Configuración de Google en Supabase

1. **Authentication** → **Providers** → **Google**
2. En la parte de configuración, puede haber un campo que diga **"Redirect URL"** o **"OAuth Redirect"**
3. Asegúrate que NO dice `localhost`

## 📊 Teoría de Por Qué Pasa Esto

Supabase usa el **"Site URL"** como la URL de fallback cuando algo no está configurado correctamente. Si alguna vez durante el desarrollo configuraste `localhost:3000` como Site URL, Supabase pudo haber guardado eso en su configuración interna.

Cuando haces OAuth:
1. Tu app (`www.mapafurgocasa.com`) → Google ✅
2. Google → Supabase (`dkqnemjcmcnyhuvstosf.supabase.co/auth/v1/callback`) ✅
3. Supabase procesa el token ✅
4. **Supabase redirige a** → Aquí puede usar:
   - La URL que pasaste en `redirectTo` ✅
   - O el "Site URL" configurado en Dashboard ❌ (si dice localhost)
5. Por eso terminas en localhost, pero la sesión funciona

## ✅ Checklist Final

Marca cada item después de verificarlo:

- [ ] Site URL en Supabase = `https://www.mapafurgocasa.com`
- [ ] NO hay URLs de localhost en Redirect URLs de Supabase
- [ ] NO hay URLs de localhost en Google Provider de Supabase
- [ ] localStorage y sessionStorage limpiados
- [ ] Variables de entorno en Amplify correctas
- [ ] Deploy completado en Amplify (verde)
- [ ] Probado en navegador incógnito
- [ ] Página de diagnóstico muestra "✅ CORRECTO"

## 🆘 Última Opción: Recrear Google Provider

Si NADA funciona:

1. En Supabase Dashboard → **Authentication** → **Providers**
2. **Deshabilita** Google Provider
3. **Guarda los cambios**
4. Espera 1 minuto
5. **Habilita** Google Provider de nuevo
6. Vuelve a configurar Client ID y Client Secret
7. **Guarda**
8. Prueba de nuevo

Esto fuerza a Supabase a limpiar toda configuración antigua.

## 📝 Nota Importante

El hecho de que **la sesión persista después de recargar** significa que:
- ✅ Las cookies funcionan correctamente
- ✅ El OAuth autentica correctamente
- ✅ El token se guarda bien
- ❌ Solo hay un problema con la URL de redirección inicial

Es un problema de configuración, no de código. Una vez corregido, todo funcionará perfectamente.

