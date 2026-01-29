# 🚨 SOLUCIÓN URGENTE - Rate Limit Alcanzado

## ❌ Error Actual

```
Error 429: email rate limit exceeded
AuthApiError: email rate limit exceeded
```

## 🎯 QUÉ HACER AHORA MISMO

### Opción A: Configurar SendGrid (15 min - RECOMENDADO)

1. **Crear cuenta SendGrid (GRATIS)**
   - Ir a: https://sendgrid.com/
   - Sign Up → Free Plan (12,000 emails/mes)
   - Verificar tu email
   
2. **Obtener API Key**
   - Ir a: Settings → API Keys
   - Create API Key
   - Nombre: "Mapa Furgocasa SMTP"
   - Permisos: Mail Send → Full Access
   - **COPIAR LA API KEY** (solo se muestra una vez)

3. **Configurar en Supabase**
   - Ir a: https://supabase.com/dashboard
   - Seleccionar proyecto: dkqnemjcmcnyhuvstosf
   - Ir a: Project Settings → Authentication → SMTP Settings
   - Enable Custom SMTP: ✅
   
   ```
   SMTP Host:     smtp.sendgrid.net
   SMTP Port:     587
   SMTP User:     apikey
   SMTP Password: [PEGAR TU API KEY AQUÍ]
   Sender Email:  noreply@mapafurgocasa.com
   Sender Name:   Mapa Furgocasa
   ```
   
   - Click "Save"
   - Click "Send test email" para verificar

### Opción B: Esperar 1 hora

Si no quieres configurar SMTP ahora:
- **Esperar 60 minutos** desde el último intento
- El límite se reinicia automáticamente
- **PERO** seguirás teniendo el problema cada vez que se registren 4 usuarios

---

## ⚠️ POR QUÉ PASA ESTO

El servicio SMTP gratuito de Supabase tiene límites muy restrictivos:
- ❌ **Solo 4 emails por hora**
- ❌ **No apto para producción**
- ❌ **Se bloquea fácilmente con varios usuarios**

### Límites de SendGrid (GRATIS):
- ✅ **12,000 emails al mes**
- ✅ **400 emails por día**
- ✅ **Perfecto para producción**

---

## 📊 COMPARACIÓN

| Servicio | Emails/Hora | Emails/Día | Emails/Mes | Costo |
|----------|-------------|------------|------------|-------|
| Supabase Gratuito | 4 | ~96 | ~2,880 | Gratis |
| SendGrid Free | 400+ | 400 | 12,000 | Gratis |
| Mailgun Free | 400+ | 400 | 5,000 | Gratis |

---

## 🎯 RECOMENDACIÓN

**Configurar SendGrid AHORA** porque:
1. Es gratis
2. Toma solo 15 minutos
3. Resuelve el problema permanentemente
4. Tu aplicación estará lista para producción

---

## 🧪 DESPUÉS DE CONFIGURAR

1. Espera 1-2 minutos para que se aplique
2. Intenta registrarte de nuevo
3. Deberías recibir el email inmediatamente

---

## 📞 SI NECESITAS AYUDA

Puedes seguir la guía paso a paso en: `CHECKLIST_REGISTRO.md` (Paso 2.2)
