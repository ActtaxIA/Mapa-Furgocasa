# 🔧 Guía de Configuración de Autenticación - Mapa Furgocasa

## ⚠️ PROBLEMA IDENTIFICADO

Los usuarios no pueden registrarse porque **no les llega el email de verificación**. Esto indica que hay un problema con la configuración de emails en Supabase.

## ✅ SOLUCIONES IMPLEMENTADAS EN EL CÓDIGO

### 1. Archivo de Registro (`app/(public)/auth/register/page.tsx`)

**Cambios realizados:**

- ✅ Añadida configuración `emailRedirectTo` en el registro
- ✅ Manejo diferenciado entre cuentas que requieren confirmación vs auto-confirmadas
- ✅ Mejores mensajes de error traducidos al español
- ✅ Pantalla de "Revisa tu correo" cuando se requiere confirmación

**Código clave añadido:**

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${siteUrl}/auth/callback?next=/mapa`, // ⬅️ ESTO ES CRÍTICO
    data: {
      username: username || email.split('@')[0],
      first_name: firstName,
      last_name: lastName,
      full_name: [firstName, lastName].filter(Boolean).join(' '),
      profile_photo: 'default_profile.png',
    },
  },
})
```

### 2. Mensajes Mejorados

Ahora distingue entre dos escenarios:

- **Requiere confirmación**: Muestra mensaje "Revisa tu correo" con el email exacto
- **Auto-confirmado**: Redirige directamente al mapa

## 🔴 CONFIGURACIÓN REQUERIDA EN SUPABASE DASHBOARD

### PASO 1: Verificar Confirmación por Email

1. Ir a **Supabase Dashboard**
2. Ir a **Authentication** → **Providers** → **Email**
3. **VERIFICAR** que esté marcado:
   - ✅ **Enable email confirmations** (Confirmar emails)
   
4. **IMPORTANTE**: Si está desactivado, actívalo. Esto hará que se envíen emails de verificación.

### PASO 2: Configurar Site URL

1. Ir a **Authentication** → **URL Configuration**
2. Configurar:
   ```
   Site URL: https://www.mapafurgocasa.com
   ```

3. Añadir en **Redirect URLs**:
   ```
   https://www.mapafurgocasa.com/auth/callback
   http://localhost:3000/auth/callback (para desarrollo)
   ```

### PASO 3: Configurar Plantillas de Email

1. Ir a **Authentication** → **Email Templates**
2. Editar la plantilla **"Confirm signup"**
3. Verificar que el enlace de confirmación sea:
   ```
   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
   ```

### PASO 4: Configurar SMTP (CRÍTICO PARA PRODUCCIÓN)

**⚠️ IMPORTANTE**: Supabase tiene límites estrictos de emails con su servicio gratuito.

**Opción A: Usar SMTP personalizado (Recomendado)**

1. Ir a **Project Settings** → **Authentication** → **SMTP Settings**
2. Activar **Enable Custom SMTP**
3. Configurar con un servicio como:
   - **SendGrid** (12,000 emails gratis/mes)
   - **Mailgun** (5,000 emails gratis/mes)
   - **Resend** (3,000 emails gratis/mes)
   - **Gmail** (solo para testing, no recomendado para producción)

**Ejemplo configuración SendGrid:**

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [TU_API_KEY_DE_SENDGRID]
Sender email: noreply@mapafurgocasa.com
Sender name: Mapa Furgocasa
```

**Opción B: Verificar límites del servicio gratuito**

Si usas el servicio SMTP gratuito de Supabase:
- Límite: **4 emails por hora** por proyecto
- Esto puede estar causando que los usuarios no reciban emails

### PASO 5: Verificar Rate Limits

1. Ir a **Authentication** → **Rate Limits**
2. Verificar configuración:
   ```
   Email signups: 10 por hora (ajustable)
   Email OTP: 10 por hora (ajustable)
   ```

## 🧪 CÓMO PROBAR LA CONFIGURACIÓN

### Test 1: Abrir el Script de Diagnóstico

1. Abrir en el navegador: `scripts/test-auth-config.html`
2. Ejecutar todas las verificaciones
3. Revisar los resultados

### Test 2: Registro Manual

1. Ir a `https://www.mapafurgocasa.com/auth/register`
2. Registrarse con un email real
3. Verificar:
   - ✅ Aparece mensaje "Revisa tu correo"
   - ✅ Llega email de verificación
   - ✅ Al hacer clic en el enlace, se confirma la cuenta

### Test 3: Verificar en Supabase Dashboard

1. Ir a **Authentication** → **Users**
2. Buscar el usuario recién creado
3. Verificar que en la columna **Confirmed** aparezca:
   - ❌ Un icono rojo (necesita confirmar)
   - ✅ Después de confirmar, debería cambiar a verde

## 🔍 DIAGNÓSTICO DE PROBLEMAS COMUNES

### Problema 1: No llega el email

**Posibles causas:**

1. **SMTP no configurado** → Configurar SMTP personalizado (ver PASO 4)
2. **Límite de rate alcanzado** → Esperar 1 hora o configurar SMTP personalizado
3. **Email en spam** → Revisar carpeta de spam
4. **Email Template mal configurado** → Verificar PASO 3
5. **Site URL incorrecto** → Verificar PASO 2

**Solución:**

```bash
# Ver logs en Supabase Dashboard
Ir a: Logs → Auth Logs
Buscar: "email" o "smtp"
```

### Problema 2: Email llega pero el enlace no funciona

**Causa:** Site URL mal configurado

**Solución:** Verificar que en PASO 2 el Site URL sea exactamente `https://www.mapafurgocasa.com`

### Problema 3: Error "Email rate limit exceeded"

**Causa:** Has alcanzado el límite de 4 emails/hora del servicio gratuito

**Solución:** Configurar SMTP personalizado (PASO 4)

## 📊 CONFIGURACIÓN ACTUAL

### Variables de Entorno (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dkqnemjcmcnyhuvstosf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ Estas variables están correctas y configuradas.

## 🚀 PASOS INMEDIATOS A REALIZAR

1. **URGENTE**: Ir a Supabase Dashboard y activar "Enable email confirmations"
2. **URGENTE**: Configurar SMTP personalizado (SendGrid recomendado)
3. Verificar Site URL
4. Probar registro con email real
5. Verificar que llegue el email

## 📝 NOTAS ADICIONALES

### ¿Por qué no funcionaba antes?

El código NO estaba configurando `emailRedirectTo` en el registro, lo que podría causar que Supabase no envíe el email o que el enlace de confirmación no funcione correctamente.

### ¿Qué pasa con OAuth Google?

OAuth Google NO requiere confirmación por email. Los cambios realizados NO afectan el login con Google.

## 🆘 SI EL PROBLEMA PERSISTE

1. Revisar logs en Supabase Dashboard → Logs → Auth Logs
2. Verificar que el proyecto de Supabase no esté en modo "Paused" o con límites alcanzados
3. Contactar soporte de Supabase si hay problemas con el servicio SMTP

## ✅ CHECKLIST FINAL

- [ ] Activar "Enable email confirmations" en Supabase
- [ ] Configurar SMTP personalizado (SendGrid/Mailgun/Resend)
- [ ] Configurar Site URL: `https://www.mapafurgocasa.com`
- [ ] Añadir redirect URLs
- [ ] Verificar plantilla de email "Confirm signup"
- [ ] Probar registro con email real
- [ ] Verificar que llegue el email
- [ ] Hacer clic en enlace y confirmar que funciona
- [ ] Verificar en Dashboard que el usuario aparece como "Confirmed"

---

**Última actualización:** 29 de enero de 2026
**Cambios realizados en el código:** ✅ Completados
**Configuración pendiente en Supabase:** ⚠️ Requiere acción manual
