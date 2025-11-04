# ✅ AWS AMPLIFY - CHECKLIST COMPLETO

**Fecha:** 4 de Noviembre, 2025  
**Proyecto:** Mapa Furgocasa - Chatbot IA

---

## 🎯 RESUMEN

Para que el chatbot funcione en producción, necesitas verificar que **TODAS** estas variables estén configuradas en AWS Amplify.

---

## 📋 CHECKLIST DE VARIABLES DE ENTORNO

### 🔴 CRÍTICAS (Sin estas el chatbot NO funciona)

Ir a: [AWS Amplify Console](https://eu-north-1.console.aws.amazon.com/amplify/apps) → Tu app → Environment variables

- [ ] **OPENAI_API_KEY**
  - Valor: `sk-proj-...` (desde OpenAI)
  - Sin esto: "Chatbot no configurado: falta OPENAI_API_KEY"

- [ ] **SUPABASE_SERVICE_ROLE_KEY** o **NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY**
  - Valor: `eyJhbG...` (desde Supabase Dashboard → Settings → API → service_role key)
  - Sin esto: "Missing Supabase credentials"

- [ ] **GOOGLE_MAPS_API_KEY**
  - Valor: `AIzaSyB...` (desde Google Cloud Console)
  - Sin esto: Geocoding no funciona (ubicación del usuario = "Desconocida")

### 🟡 OPCIONALES (Mejoras de la Fase 2)

- [ ] **UPSTASH_REDIS_REST_URL**
  - Para: Rate limiting (FIX #2)
  - Valor: `https://xxxxx.upstash.io`
  - Sin esto: Sin rate limiting (riesgo de costos)

- [ ] **UPSTASH_REDIS_REST_TOKEN**
  - Para: Rate limiting (FIX #2)
  - Valor: `AXXXxxxXXX...`
  - Sin esto: Sin rate limiting

### ✅ YA CONFIGURADAS (Verificar que existen)

- [ ] **NEXT_PUBLIC_SUPABASE_URL**
  - Valor: `https://dkqnemjcmqyhuvstosf.supabase.co`

- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY**
  - Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

- [ ] **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**
  - Valor: `AIzaSyB...`

- [ ] **NEXT_PUBLIC_GOOGLE_PLACES_API_KEY**
  - Valor: `AIzaSyB...`

---

## 🔧 CÓMO AÑADIR/VERIFICAR VARIABLES

### Paso 1: Ir a AWS Amplify Console

```
1. Abrir: https://eu-north-1.console.aws.amazon.com/amplify/apps
2. Click en tu aplicación "Mapa-Furgocasa"
3. En el menú lateral: "Hosting" → "Environment variables"
4. Click "Manage variables"
```

### Paso 2: Verificar Variables Existentes

Deberías ver una lista como:

```
Variable                              Value           
------------------------------------  ----------------
NEXT_PUBLIC_SUPABASE_URL             https://dkq...   ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY        eyJhbGc...       ✅
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY      AIzaSyB...       ✅
OPENAI_API_KEY                       sk-proj...       ❓ ¿Existe?
SUPABASE_SERVICE_ROLE_KEY            eyJhbGc...       ❓ ¿Existe?
GOOGLE_MAPS_API_KEY                  AIzaSyB...       ❓ ¿Existe?
```

### Paso 3: Añadir Variables Faltantes

Para cada variable que falte:

1. Click "Add variable"
2. Variable name: `OPENAI_API_KEY` (copiar exacto)
3. Value: (pegar desde tu `.env.local`)
4. Click "Save"

### Paso 4: Redeploy

Después de añadir/modificar variables:

1. Click "Save" en el modal de variables
2. AWS Amplify **automáticamente redesplegará**
3. Espera 3-5 minutos
4. Ve a "Build history" → Debe aparecer nuevo build

---

## 🔍 CÓMO OBTENER LAS CLAVES

### 1. OPENAI_API_KEY

```
1. Ir a: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Nombre: "Mapa Furgocasa Chatbot"
4. Copiar la clave (solo se muestra una vez)
5. Formato: sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 2. SUPABASE_SERVICE_ROLE_KEY

```
1. Ir a: https://supabase.com/dashboard/project/dkqnemjcmqyhuvstosf
2. Settings (engranaje izquierda)
3. API
4. Buscar "service_role key" (NO la anon key)
5. Click "Reveal" y copiar
6. Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. GOOGLE_MAPS_API_KEY

```
1. Ir a: https://console.cloud.google.com/apis/credentials
2. Seleccionar tu proyecto
3. Buscar clave API existente o crear nueva
4. IMPORTANTE: Habilitar "Geocoding API"
5. Copiar la clave
6. Formato: AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Nota:** Puede ser la misma que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 4. UPSTASH_REDIS (Para FIX #2)

```
1. Ir a: https://console.upstash.com
2. Crear cuenta (gratis hasta 10K requests/día)
3. Click "Create Database"
4. Nombre: "mapa-furgocasa-ratelimit"
5. Región: Elegir cercana a tu servidor
6. Click "Create"
7. En la pantalla de database:
   - Copiar "UPSTASH_REDIS_REST_URL"
   - Copiar "UPSTASH_REDIS_REST_TOKEN"
```

---

## 🧪 VERIFICAR QUE FUNCIONA

### Test 1: Verificar Variables (GET endpoint)

```bash
curl https://www.mapafurgocasa.com/api/chatbot
```

**✅ Debe responder:**
```json
{
  "service": "Chatbot Furgocasa",
  "version": "2.2-debug",
  "status": "active",
  "openai_configured": true,
  "supabase_configured": true
}
```

**❌ Si responde:**
```json
{
  "status": "error",
  "openai_configured": false  // 🔴 Falta OPENAI_API_KEY
}
```

### Test 2: Probar Chatbot

En la consola del navegador (F12):

```javascript
fetch('https://www.mapafurgocasa.com/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: '¿cuántas áreas hay?' }],
    userId: 'test-user-id'
  })
})
.then(r => r.json())
.then(console.log)
```

**✅ Debe responder:**
```json
{
  "message": "Tenemos 3614 áreas verificadas en 12 países...",
  "conversacionId": "uuid-...",
  "modelo": "gpt-4o-mini"
}
```

**❌ Si responde:**
```json
{
  "error": "Chatbot no configurado: falta OPENAI_API_KEY"
}
```
→ Falta configurar la variable

---

## 📊 ESTADO ACTUAL (Para completar)

### Variables Configuradas:
- [ ] OPENAI_API_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] GOOGLE_MAPS_API_KEY
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

### Tests Completados:
- [ ] GET /api/chatbot → status: "active"
- [ ] POST /api/chatbot → respuesta exitosa
- [ ] Chatbot en producción funciona
- [ ] Geocoding funciona (detecta ciudad)

---

## 🚨 ERRORES COMUNES

### Error 1: "Chatbot no configurado: falta OPENAI_API_KEY"

**Causa:** La variable `OPENAI_API_KEY` no está en AWS Amplify

**Solución:**
1. Ir a AWS Amplify Console → Environment variables
2. Añadir `OPENAI_API_KEY`
3. Esperar 5 minutos a que redesplegue
4. Probar de nuevo

---

### Error 2: "Missing Supabase credentials"

**Causa:** Falta `SUPABASE_SERVICE_ROLE_KEY`

**Solución:**
1. Obtener clave desde Supabase Dashboard → API
2. Añadir en AWS Amplify como `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy
4. Probar

---

### Error 3: Ubicación siempre "Desconocida"

**Causa:** Falta `GOOGLE_MAPS_API_KEY` o Geocoding API no habilitada

**Solución:**
1. Verificar que existe `GOOGLE_MAPS_API_KEY` en Amplify
2. Ir a Google Cloud Console
3. APIs & Services → Library
4. Buscar "Geocoding API"
5. Click "Enable"

---

## 📞 SIGUIENTE PASO

**ACCIÓN INMEDIATA:**

1. ✅ Hacer commit del fix de seguridad
2. ✅ Verificar variables en AWS Amplify
3. ✅ Añadir las que falten
4. ✅ Deploy automático
5. ✅ Probar en producción

**Comandos:**

```bash
# 1. Commit
git add amplify.yml app/api/chatbot/route.ts chatbot/
git commit -m "fix(security): remove sensitive error details + amplify config

- Eliminada exposición de stack traces
- Actualizado amplify.yml con variables requeridas
- Añadida documentación de deployment"

# 2. Push
git push origin main

# 3. Monitorear deploy
# Abrir: https://eu-north-1.console.aws.amazon.com/amplify/apps
```

---

**Última actualización:** 4 de Noviembre, 2025  
**Siguiente:** Verificar variables y hacer deploy

