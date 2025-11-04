# 🔧 Configurar Variables de Entorno en AWS Amplify

## ⚠️ PROBLEMA ACTUAL

El chatbot da **error 500** porque falta la variable de entorno `OPENAI_API_KEY` en AWS Amplify.

---

## ✅ SOLUCIÓN: Añadir Variables de Entorno

### 1. Acceder a AWS Amplify

1. Ve a https://console.aws.amazon.com/amplify
2. Selecciona tu app: **Mapa Furgocasa**
3. Click en **"Hosting"** o **"App settings"** en el menú lateral

### 2. Ir a Variables de Entorno

1. En el menú lateral, busca: **"Environment variables"**
2. Click en **"Manage variables"**

### 3. Añadir `OPENAI_API_KEY`

**Variable requerida para el chatbot:**

| Key | Value | ¿Dónde obtenerlo? |
|-----|-------|-------------------|
| `OPENAI_API_KEY` | `sk-proj-...` | https://platform.openai.com/api-keys |

**Pasos:**
1. Click en **"Add variable"**
2. Key: `OPENAI_API_KEY`
3. Value: Tu API key de OpenAI (empieza con `sk-proj-...`)
4. **IMPORTANTE:** NO selecciones "Show in build logs" por seguridad
5. Click en **"Save"**

### 4. Verificar otras Variables

Asegúrate de que ya existan estas (deberían estar configuradas):

| Key | Value | Estado |
|-----|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | ✅ Debería existir |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | ✅ Debería existir |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (diferente al anon) | ⚠️ **CRÍTICO para chatbot** |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIza...` | ✅ Debería existir |

**Si falta `SUPABASE_SERVICE_ROLE_KEY`:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia el **"service_role (secret)"** key
3. Añádela en Amplify como variable de entorno

### 5. Redesplegar la App

Después de añadir las variables:
1. Click en **"Redeploy this version"** (botón en la esquina superior derecha)
2. O espera al próximo push (se re-desplegará automáticamente)

---

## 🧪 Verificar que Funciona

Una vez desplegado:

### 1. Abrir la consola del navegador (F12)
```
https://www.mapafurgocasa.com
```

### 2. Hacer click en el botón del chatbot 💬

### 3. Si aparece el error:
```
Chatbot no configurado: falta OPENAI_API_KEY
```
→ Vuelve al paso 3 y verifica que añadiste la variable correctamente

### 4. Si funciona:
- El modal se cierra al iniciar sesión ✅
- Puedes escribir mensajes ✅
- El chatbot responde ✅

---

## 🔍 Debugging

### Ver logs en AWS Amplify:

1. En AWS Amplify → Tu app
2. Click en el último deploy (Build history)
3. Click en **"View logs"**
4. Busca errores relacionados con:
   - `OPENAI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `chatbot_config`

### Errores comunes:

#### Error: "Chatbot no configurado: falta OPENAI_API_KEY"
**Causa:** Variable no configurada en Amplify  
**Solución:** Añadir `OPENAI_API_KEY` en Environment variables

#### Error: "Missing Supabase credentials"
**Causa:** Falta `SUPABASE_SERVICE_ROLE_KEY`  
**Solución:** Añadir la service role key desde Supabase Dashboard

#### Error: "No se encontró configuración del chatbot"
**Causa:** No ejecutaste el script SQL `chatbot_schema.sql`  
**Solución:** Ejecutar el script en Supabase SQL Editor

---

## 📋 Checklist Final

- [ ] `OPENAI_API_KEY` añadida en AWS Amplify
- [ ] `SUPABASE_SERVICE_ROLE_KEY` verificada en AWS Amplify
- [ ] Script SQL `chatbot_schema.sql` ejecutado en Supabase
- [ ] App redesplegada después de añadir variables
- [ ] Chatbot probado en producción
- [ ] Modal se cierra al iniciar sesión
- [ ] Mensajes del chatbot funcionan

---

## 🎯 Resumen

**Variables CRÍTICAS para el chatbot:**
1. ✅ `OPENAI_API_KEY` - Para la IA
2. ✅ `SUPABASE_SERVICE_ROLE_KEY` - Para acceso a la BD
3. ✅ Script SQL ejecutado - Para las tablas

**Sin estas 3 cosas, el chatbot NO funcionará.**

---

## 📞 Soporte

Si después de configurar todo sigue sin funcionar:

1. Verifica los logs de AWS Amplify
2. Abre la consola del navegador (F12) y busca errores
3. Comprueba que las tablas `chatbot_config`, `chatbot_conversaciones`, `chatbot_mensajes` existen en Supabase

