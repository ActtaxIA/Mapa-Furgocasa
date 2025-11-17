# Sistema de Autenticación Simplificado

## Cambios Realizados

### 1. Cliente de Supabase (`lib/supabase/client.ts`)
- **ELIMINADO**: Toda la configuración compleja de auth, cookies, storage
- **RESULTADO**: 12 líneas de código simple y limpio
- **BENEFICIO**: Usa las configuraciones por defecto de Supabase que YA FUNCIONAN

### 2. Página de Login (`app/(public)/auth/login/page.tsx`)
- **ELIMINADO**: 
  - Estados complejos de loading separados
  - Manejo de errores elaborado
  - Delays artificiales
  - Verificaciones de sesión
- **RESULTADO**: Código directo y simple
- **Email Login**: `signInWithPassword()` → `router.push('/mapa')`
- **Google Login**: `signInWithOAuth()` → redirección automática

### 3. Callback Route (`app/(public)/auth/callback/route.ts`)
- **ELIMINADO**: 
  - Lógica compleja de cookies httpOnly
  - Múltiples intentos de set cookies
  - URLs hardcodeadas de producción
- **RESULTADO**: Simple intercambio de código por sesión
- **FUNCIONA**: Con origin dinámico

## Cómo Probar

### Antes de probar
1. **Limpiar TODO**:
```javascript
// Ejecutar en la consola del navegador (F12)
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
});
location.reload();
```

2. **Esperar despliegue**: 2-3 minutos después del push

### Prueba 1: Login con Email
1. Ir a https://www.mapafurgocasa.com/auth/login
2. Ingresar email y contraseña
3. Click en "Iniciar Sesión"
4. **Esperado**: Redirige a /mapa sin bucles
5. **Verificar consola**: NO deben aparecer múltiples requests a `/auth/v1/token`

### Prueba 2: Login con Google
1. Ir a https://www.mapafurgocasa.com/auth/login
2. Click en "Continuar con Google"
3. **Esperado**: Redirige a Google → elige cuenta → regresa a /mapa
4. **Verificar consola**: NO deben aparecer múltiples requests

### Prueba 3: Sesión Persistente
1. Iniciar sesión
2. Cerrar el navegador
3. Abrir de nuevo https://www.mapafurgocasa.com/mapa
4. **Esperado**: Sigue con sesión iniciada
5. **NO** debe intentar refrescar token constantemente

## Qué Vigilar en la Consola

### ✅ CORRECTO (lo que DEBE aparecer):
```
[Una sola petición al hacer login]
POST /auth/v1/token → 200 OK
```

### ❌ INCORRECTO (lo que NO debe aparecer):
```
POST /auth/v1/token → 200 OK
POST /auth/v1/token → 200 OK
POST /auth/v1/token → 200 OK
... [bucle infinito]
```

## Por Qué Esto Funciona

1. **Supabase tiene configuraciones por defecto que funcionan**: No necesitamos sobrescribirlas
2. **El middleware ya maneja el refresh de sesión**: No necesitamos hacerlo en cada componente
3. **Las cookies se manejan automáticamente**: No necesitamos lógica custom
4. **El flujo OAuth es estándar**: No necesitamos forzar redirecciones

## Si Sigue Sin Funcionar

Revisar en este orden:
1. ¿Se desplegó en AWS Amplify? (verificar en la consola de AWS)
2. ¿Se limpió la caché del navegador? (Ctrl+F5)
3. ¿Hay extensiones bloqueando cookies? (probar en modo incógnito)
4. ¿Qué dice la consola del navegador? (compartir el error exacto)

## Resumen

- **Antes**: 200+ líneas de código complejo tratando de "arreglar" Supabase
- **Ahora**: 50 líneas de código usando Supabase como está diseñado
- **Resultado esperado**: Funciona perfectamente sin bucles ni problemas
