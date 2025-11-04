# 🔧 FIX: Chatbot sin Conexión a Supabase

## Problema Confirmado
```json
{
  "supabase_configured": false,  // ❌ FALTA
  "openai_configured": true       // ✅ OK
}
```

El chatbot no puede acceder a Supabase porque **faltan las variables de entorno en AWS Amplify**.

## Solución Paso a Paso

### 1️⃣ Acceder a AWS Amplify Console

```
https://console.aws.amazon.com/amplify/
```

1. Inicia sesión en AWS
2. Selecciona tu región (probablemente `eu-west-1` o `us-east-1`)
3. Busca y selecciona la app **"Mapa Furgocasa"**

### 2️⃣ Ir a Variables de Entorno

```
App Settings → Environment Variables
```

### 3️⃣ Agregar Variables Faltantes

Haz clic en **"Manage variables"** y agrega:

#### Variable 1: URL de Supabase
```
Key:   NEXT_PUBLIC_SUPABASE_URL
Value: https://[tu-proyecto].supabase.co
```

#### Variable 2: Service Role Key
```
Key:   SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M[...]
```

⚠️ **IMPORTANTE:** El `SUPABASE_SERVICE_ROLE_KEY` es el **service_role** (el secreto), NO el anon key.

### 4️⃣ Obtener los Valores Correctos

**Opción A: Desde Supabase Dashboard**

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. **Settings** → **API**
4. Copia:
   - **Project URL** (ej: `https://abc123.supabase.co`)
   - **service_role** key (la que dice "secret", NO la "anon")

**Opción B: Desde tu .env.local**

Si tienes acceso al archivo `.env.local` en tu proyecto local:
```bash
cat .env.local | grep SUPABASE
```

### 5️⃣ Guardar y Redeploy

1. Haz clic en **"Save"** en Amplify
2. Espera unos segundos
3. Opciones para aplicar los cambios:

**Opción A: Redeploy desde Amplify**
- Ve a la pestaña **"Deployments"**
- En el último deployment exitoso, haz clic en los 3 puntos
- Selecciona **"Redeploy this version"**

**Opción B: Nuevo commit (recomendado)**
- Haz cualquier cambio pequeño en el código
- Commit y push
- Amplify desplegará automáticamente con las nuevas variables

**Opción C: Forzar rebuild**
```bash
# Desde terminal local
git commit --allow-empty -m "Rebuild: agregadas variables Supabase"
git push origin main
```

### 6️⃣ Verificar que Funciona

Después del redeploy, visita nuevamente:
```
https://www.mapafurgocasa.com/api/chatbot
```

Deberías ver:
```json
{
  "supabase_configured": true,   // ✅ Ahora debe ser true
  "openai_configured": true,
  "status": "active"
}
```

### 7️⃣ Probar el Chatbot

1. Recarga la página web
2. Abre el chatbot
3. Envía un mensaje de prueba: "Hola"
4. Debería responder correctamente ✅

## ¿Por Qué Pasó Esto?

Las variables de entorno en **local** (`.env.local`) son diferentes de las variables en **producción** (AWS Amplify). 

Cuando haces deploy a Amplify, debes configurar manualmente las variables de entorno en la consola de AWS.

## Checklist de Variables Requeridas

Para que el chatbot funcione completamente, verifica que tengas en Amplify:

- ✅ `OPENAI_API_KEY` (ya está)
- ❌ `NEXT_PUBLIC_SUPABASE_URL` (AGREGAR)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (AGREGAR)
- ⚪ `UPSTASH_REDIS_REST_URL` (opcional, para caché)
- ⚪ `UPSTASH_REDIS_REST_TOKEN` (opcional, para caché)

Las dos marcadas con ❌ son **obligatorias** para que el chatbot funcione.

## Si Tienes Problemas

### Error: "No encuentro el Service Role Key"

1. Ve a Supabase Dashboard
2. Settings → API
3. Busca la sección **"Project API keys"**
4. Copia la key que dice **"service_role"** y tiene el badge **"secret"**
5. ⚠️ NO uses la "anon" key, debe ser la "service_role"

### Error: "Las variables no se aplican"

Después de agregar variables, es necesario hacer un **nuevo deploy**. Las variables no se aplican automáticamente a deployments existentes.

### Error: "Sigo viendo supabase_configured: false"

1. Verifica el nombre exacto de las variables (case-sensitive)
2. Asegúrate de que no haya espacios extra
3. Confirma que hiciste redeploy DESPUÉS de agregar las variables
4. Espera 2-3 minutos después del deploy

## Comando Rápido (si tienes AWS CLI)

```bash
# Configurar variables desde terminal
aws amplify update-app \
  --app-id [tu-app-id] \
  --environment-variables \
  NEXT_PUBLIC_SUPABASE_URL=[tu-url] \
  SUPABASE_SERVICE_ROLE_KEY=[tu-key]
```

## Resultado Esperado

Después de aplicar el fix:

**ANTES:**
```
Usuario: "Hola"
Chatbot: ❌ Error 500 - Error interno del servidor
```

**DESPUÉS:**
```
Usuario: "Hola"
Chatbot: ✅ ¡Hola! 👋 Soy el Tío Viajero IA...
```

---

**Tiempo estimado:** 5-10 minutos
**Dificultad:** Baja
**Requiere:** Acceso a AWS Amplify Console y Supabase Dashboard

