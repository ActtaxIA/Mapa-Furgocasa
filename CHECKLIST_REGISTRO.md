# ✅ CHECKLIST RÁPIDO - Solución Problema de Registro

## 🎯 OBJETIVO
Permitir que los usuarios se registren y reciban emails de verificación correctamente.

---

## ✅ PASO 1: Código (YA COMPLETADO)

- [x] Añadir `emailRedirectTo` en el registro
- [x] Implementar detección de confirmación por email
- [x] Mejorar mensajes de error en español
- [x] Crear pantalla "Revisa tu correo"
- [x] Commit de cambios al repositorio

**Status:** ✅ COMPLETADO

---

## ⚠️ PASO 2: Configuración Supabase (ACCIÓN REQUERIDA)

### 2.1 Activar Confirmación por Email (2 minutos)

```
1. Ir a: https://supabase.com/dashboard
2. Seleccionar proyecto: dkqnemjcmcnyhuvstosf
3. Ir a: Authentication → Providers → Email
4. ☑️ Activar: "Enable email confirmations"
5. Click: Save
```

### 2.2 Configurar SMTP Personalizado (10 minutos)

**Opción recomendada: SendGrid**

#### A. Crear cuenta SendGrid (gratis)

```
1. Ir a: https://sendgrid.com/
2. Crear cuenta gratuita (12,000 emails/mes)
3. Verificar email
4. Ir a: Settings → API Keys
5. Crear nueva API Key (permisos: Mail Send - Full Access)
6. Copiar API Key (solo se muestra una vez)
```

#### B. Configurar en Supabase

```
1. Ir a: Project Settings → Authentication → SMTP Settings
2. Activar: "Enable Custom SMTP"
3. Configurar:
   
   SMTP Host:        smtp.sendgrid.net
   SMTP Port:        587
   SMTP User:        apikey
   SMTP Password:    [PEGAR API KEY DE SENDGRID]
   Sender Email:     noreply@mapafurgocasa.com
   Sender Name:      Mapa Furgocasa
   
4. Click: Save
5. Click: "Send test email" para verificar
```

### 2.3 Configurar URLs (2 minutos)

```
1. Ir a: Authentication → URL Configuration
2. Configurar:

   Site URL:
   https://www.mapafurgocasa.com

   Redirect URLs (añadir estas dos):
   https://www.mapafurgocasa.com/auth/callback
   http://localhost:3000/auth/callback

3. Click: Save
```

### 2.4 Verificar Plantilla de Email (1 minuto)

```
1. Ir a: Authentication → Email Templates
2. Seleccionar: "Confirm signup"
3. Verificar que tenga esta línea:
   
   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email

4. Si no la tiene, añadirla
5. Click: Save
```

---

## 🧪 PASO 3: Probar (5 minutos)

### Test 1: Script de Diagnóstico

```
1. Abrir: scripts/test-auth-config.html
2. Ejecutar todos los tests
3. Verificar que todos estén en verde ✅
```

### Test 2: Registro Real

```
1. Ir a: https://www.mapafurgocasa.com/auth/register
2. Registrarse con tu email personal
3. Verificar:
   ✅ Aparece "Revisa tu correo"
   ✅ Llega email en 1-2 minutos
   ✅ Email NO está en spam
   ✅ Hacer clic en enlace del email
   ✅ Redirige al mapa y puedes acceder
```

### Test 3: Verificar en Dashboard

```
1. Ir a: Supabase Dashboard → Authentication → Users
2. Buscar el usuario recién creado
3. Verificar:
   ⚠️ Antes de confirmar: ❌ (rojo en Confirmed)
   ✅ Después de confirmar: ✅ (verde en Confirmed)
```

---

## 🆘 SI ALGO FALLA

### No llega el email

**Solución A: Verificar SMTP**

```
1. Ir a: Supabase → Project Settings → Authentication → SMTP Settings
2. Click: "Send test email"
3. Si falla: revisar API Key de SendGrid
4. Si funciona: revisar carpeta spam del usuario
```

**Solución B: Revisar Logs**

```
1. Ir a: Supabase Dashboard → Logs → Auth Logs
2. Buscar: "email" o "smtp"
3. Ver errores específicos
```

### El enlace no funciona

**Causa probable:** Site URL incorrecto

```
1. Ir a: Authentication → URL Configuration
2. Verificar que Site URL sea exactamente:
   https://www.mapafurgocasa.com
   (sin barra final)
```

### Error "Rate limit exceeded"

**Causa:** Límite de emails alcanzado

```
Si ya configuraste SendGrid:
- Esperar 1 minuto
- Reintentar

Si NO configuraste SendGrid:
- Configurar SMTP personalizado (Paso 2.2)
```

---

## 📊 TIEMPO TOTAL ESTIMADO

- ✅ Código: 0 min (ya completado)
- ⏱️ Configuración Supabase: 15 min
- ⏱️ Pruebas: 5 min

**Total: 20 minutos**

---

## 🎉 RESULTADO FINAL

Después de completar todos los pasos:

✅ Los usuarios pueden registrarse  
✅ Reciben email de verificación en 1-2 minutos  
✅ Pueden confirmar su cuenta  
✅ Pueden iniciar sesión normalmente  
✅ El sistema está listo para producción  

---

## 📞 CONTACTO

Si necesitas ayuda con algún paso específico, puedes:

1. Revisar la guía completa: `GUIA_CONFIGURACION_AUTH.md`
2. Ver el resumen ejecutivo: `RESUMEN_PROBLEMA_REGISTRO.md`
3. Consultar la documentación oficial de Supabase

---

**Última actualización:** 29 de enero de 2026  
**Versión:** 1.0  
**Estado del código:** ✅ Completado y testeado
