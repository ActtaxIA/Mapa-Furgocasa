# 🚨 DIAGNÓSTICO: Error 500 en Chatbot

## Síntoma
El chatbot "Tío Viajero IA" responde con:
- **Error 500** (Internal Server Error)
- Mensaje: "Error interno del servidor"
- API endpoint: `POST /api/chatbot`

## Causas Probables

### 1. ❌ Falta Variables de Entorno en Producción

El código del chatbot requiere estas variables:

```env
# OBLIGATORIAS
OPENAI_API_KEY=sk-...                          # API de OpenAI
NEXT_PUBLIC_SUPABASE_URL=https://...          # URL de Supabase
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # Service Role Key

# OPCIONALES (para rate limiting y caché)
UPSTASH_REDIS_REST_URL=https://...            # Redis para caché
UPSTASH_REDIS_REST_TOKEN=...                   # Token de Redis
```

**VERIFICAR EN AMPLIFY:**
1. Ir a AWS Amplify Console
2. App Settings → Environment Variables
3. Confirmar que existen:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. ❌ Falta Configuración en Base de Datos

El chatbot busca esta configuración:

```sql
SELECT * FROM chatbot_config 
WHERE nombre = 'asistente_principal' 
AND activo = true
```

Si no existe, el chatbot falla con error 500.

## Solución Inmediata

### Opción A: Verificar Variables de Entorno en AWS Amplify

```bash
# En AWS Amplify Console
App Settings → Environment Variables

# Verificar que existan:
OPENAI_API_KEY = sk-proj-...
NEXT_PUBLIC_SUPABASE_URL = https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJ...
```

### Opción B: Verificar Configuración en BD

```sql
-- Conectar a Supabase y ejecutar:
SELECT * FROM chatbot_config WHERE nombre = 'asistente_principal';

-- Si no existe, ejecutar:
INSERT INTO chatbot_config (
  nombre,
  system_prompt,
  modelo,
  temperature,
  max_tokens,
  activo,
  radio_busqueda_default_km
) VALUES (
  'asistente_principal',
  'Eres el Tío Viajero IA, un asistente experto en autocaravanas...',
  'gpt-4o-mini',
  0.7,
  1000,
  true,
  50
);
```

### Opción C: Ver Logs en AWS Amplify

1. AWS Amplify Console
2. Monitoring → Logs
3. Buscar errores con "CHATBOT" o "500"
4. Ver qué variable específica falta

## Script de Verificación

Ejecutar en local para verificar que el endpoint funciona:

```bash
# Test básico
curl https://www.mapafurgocasa.com/api/chatbot

# Debería retornar JSON con:
{
  "service": "Chatbot Furgocasa",
  "status": "active" o "error",
  "openai_configured": true/false,
  "supabase_configured": true/false
}
```

## Verificación Rápida

1. **Ir a:** https://www.mapafurgocasa.com/api/chatbot
2. **Ver JSON retornado**
3. **Verificar:**
   - `openai_configured: true` ✅
   - `supabase_configured: true` ✅
   - `status: "active"` ✅

Si alguno está en `false` ❌, falta esa variable de entorno.

## Acción Inmediata Recomendada

### 1️⃣ Verificar Variables en Amplify
```
AWS Amplify → App Settings → Environment Variables
```

### 2️⃣ Si faltan, agregarlas:
- Desde el panel de Amplify
- O mediante AWS CLI:
```bash
aws amplify update-app --app-id <app-id> --environment-variables OPENAI_API_KEY=sk-...
```

### 3️⃣ Redeploy
Después de agregar variables, hacer un nuevo deploy o reiniciar la app.

## Logs para Revisar

El código tiene logging extensivo. Buscar en logs de Amplify:

```
❌ [CHATBOT] Error general:
❌ Supabase URL: ❌ FALTA
❌ Service Role Key: ❌ FALTA
❌ OPENAI_API_KEY no configurada
❌ Error cargando configuración: ...
```

Estos mensajes indican exactamente qué falta.

## Próximos Pasos

1. ✅ Verificar variables de entorno en Amplify
2. ✅ Verificar tabla `chatbot_config` tiene datos
3. ✅ Ver logs de AWS Amplify para error específico
4. ✅ Hacer redeploy si se agregaron variables
5. ✅ Probar endpoint GET primero: `/api/chatbot`
6. ✅ Probar POST con mensaje de prueba

## Contacto de Emergencia

Si el problema persiste:
- Revisar archivo: `chatbot/CHATBOT_PROBLEMA_CRITICO_VISUALIZADO.md`
- Verificar: `chatbot/CHATBOT_ACCION_INMEDIATA.md`
- Documentación completa en carpeta `chatbot/`

