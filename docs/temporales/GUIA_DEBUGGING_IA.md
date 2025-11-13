# 🔍 GUÍA DE DEBUGGING - FUNCIONES DE IA

## ¿CÓMO VERIFICAR QUE TODO FUNCIONA?

### ✅ PASO 1: REINICIAR EL SERVIDOR

**IMPORTANTE:** Después de cualquier cambio, reinicia el servidor.

```powershell
# En la terminal de PowerShell:
# 1. Presiona Ctrl+C para detener el servidor
# 2. Vuelve a iniciar:
npm run dev
```

---

### ✅ PASO 2: VER LOS LOGS EN TIEMPO REAL

Ahora hay **LOGS DETALLADOS** en el backend. Cuando ejecutes una función, verás **EXACTAMENTE** qué está pasando:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 [ENRICH] Iniciando enriquecimiento de área
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 [ENRICH] Validando API keys...
  - OPENAI_API_KEY: ✅ Configurada
  - SERPAPI_KEY: ✅ Configurada
📝 [ENRICH] Area ID recibido: abc-123-def
🔍 [ENRICH] Buscando área en base de datos...
✅ [ENRICH] Área encontrada: Área Las Palmeras - Málaga
  - Descripción actual: Sin descripción
✅ [ENRICH] Área válida para enriquecer. Continuando...
🔎 [ENRICH] Llamando a SerpAPI...
  - Query: Área Las Palmeras Málaga autocaravanas turismo
  - SerpAPI HTTP Status: 200
✅ [ENRICH] SerpAPI respondió correctamente
  - Resultados orgánicos: 8
🤖 [ENRICH] Llamando a OpenAI...
  - Modelo: gpt-4o-mini
  - Temperature: 0.7
  - Max tokens: 1500
  - Número de mensajes: 2
✅ [ENRICH] OpenAI respondió correctamente
  - Tokens usados: 856
📝 [ENRICH] Descripción generada (547 caracteres)
  - Primeros 100 caracteres: El área de autocaravanas Las Palmeras se encuentra en Málaga, una ciudad costera conocida por...
💾 [ENRICH] Guardando en base de datos...
✅ [ENRICH] ¡Descripción guardada exitosamente!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### ✅ PASO 3: PRUEBA ENRIQUECER TEXTOS

1. **Abre la página:** `http://localhost:3000/admin/areas/enriquecer-textos`

2. **Mira la terminal de PowerShell** (donde corre `npm run dev`)

3. **Selecciona 1 área** que NO tenga descripción

4. **Click en "Enriquecer"**

5. **Confirma el diálogo**

6. **Ahora verás:**
   - ✅ **Modal emergente** con progreso en tiempo real
   - ✅ **Barra de progreso** moviéndose
   - ✅ **Logs en la terminal** de PowerShell

---

### ✅ PASO 4: INTERPRETAR LOS LOGS

#### ✅ **TODO BIEN (Logs Exitosos):**

```
🚀 [ENRICH] Iniciando enriquecimiento...
🔑 [ENRICH] Validando API keys...
  - OPENAI_API_KEY: ✅ Configurada      ← BIEN
  - SERPAPI_KEY: ✅ Configurada        ← BIEN
✅ [ENRICH] Área encontrada...
✅ [ENRICH] SerpAPI respondió...
✅ [ENRICH] OpenAI respondió...
📝 [ENRICH] Descripción generada...
💾 [ENRICH] Guardando en BD...
✅ [ENRICH] ¡Descripción guardada!      ← ¡FUNCIONA!
```

#### ❌ **PROBLEMA 1: API Keys No Configuradas**

```
🔑 [ENRICH] Validando API keys...
  - OPENAI_API_KEY: ❌ NO configurada   ← PROBLEMA AQUÍ
```

**Solución:**
1. Verifica que `.env.local` existe en la raíz del proyecto
2. Abre `.env.local` y verifica que hay esta línea:
   ```
   OPENAI_API_KEY=sk-proj-...
   SERPAPI_KEY=...
   ```
3. Reinicia el servidor (Ctrl+C → `npm run dev`)

#### ❌ **PROBLEMA 2: Área Ya Tiene Descripción**

```
⚠️ [ENRICH] El área ya tiene descripción (>100 caracteres). No se sobrescribe.
```

**Solución:**
- Esto es **NORMAL** - La función no sobrescribe descripciones existentes
- Selecciona un área que NO tenga descripción
- O borra la descripción existente manualmente

#### ❌ **PROBLEMA 3: Error de SerpAPI**

```
❌ [ENRICH] Error de SerpAPI: Invalid API key
```

**Solución:**
- Tu `SERPAPI_KEY` es inválida
- Consigue una nueva key en https://serpapi.com
- Actualiza `.env.local`
- Reinicia el servidor

#### ❌ **PROBLEMA 4: Error de OpenAI**

```
❌ [ENRICH] Error de OpenAI: Incorrect API key provided
```

**Solución:**
- Tu `OPENAI_API_KEY` es inválida o ha expirado
- Consigue una nueva key en https://platform.openai.com/api-keys
- Actualiza `.env.local`
- Reinicia el servidor

#### ❌ **PROBLEMA 5: Rate Limit**

```
❌ [ENRICH] Error de OpenAI: Rate limit reached
```

**Solución:**
- Has superado tu límite de OpenAI
- Espera unos minutos
- O aumenta tu límite en OpenAI

---

### ✅ PASO 5: VER EL MODAL CON PROGRESO

Ahora hay un **MODAL EMERGENTE** que muestra:

```
┌─────────────────────────────────────────┐
│  🤖 Enriqueciendo con IA            75% │
│  Generando descripciones detalladas...  │
├─────────────────────────────────────────┤
│  ████████████████████░░░░░░░░░          │ ← Barra de progreso
├─────────────────────────────────────────┤
│  [LOGS EN TIEMPO REAL]                  │
│  ✓ Área 1 - Descripción generada        │
│  ✓ Área 2 - Descripción generada        │
│  Procesando: Área 3...                  │
├─────────────────────────────────────────┤
│  Exitosas: 2  | Errores: 0  | Total: 3  │
└─────────────────────────────────────────┘
```

---

## 🧪 PRUEBA RÁPIDA (5 MINUTOS)

### Test 1: Verificar API Keys

```powershell
# En PowerShell, en la raíz del proyecto:
cat .env.local

# Deberías ver:
# OPENAI_API_KEY=sk-proj-...
# SERPAPI_KEY=...
```

### Test 2: Verificar Servidor

```powershell
# El servidor debería mostrar:
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### Test 3: Enriquecer 1 Área

1. Ve a: `http://localhost:3000/admin/areas/enriquecer-textos`
2. Selecciona 1 área sin descripción
3. Click "Enriquecer"
4. Confirma
5. **MIRA LA TERMINAL:**
   - ¿Ves los logs `🚀 [ENRICH]`?
   - ¿Termina con `✅ [ENRICH] ¡Descripción guardada!`?

### Test 4: Verificar en Base de Datos

1. Ve a Supabase → Table Editor → `areas`
2. Busca el área que enriqueciste
3. **¿La columna `descripcion` tiene texto?**
   - ✅ **SÍ** → ¡FUNCIONA!
   - ❌ **NO** → Revisa los logs en la terminal

---

## 🐛 PROBLEMAS COMUNES

### Problema: "No pasa nada al hacer click"

**Causas posibles:**
1. API keys no configuradas → Banner rojo en la página
2. No hay áreas seleccionadas → Alert "Selecciona al menos un área"
3. JavaScript deshabilitado → Revisa la consola del navegador (F12)

**Solución:**
1. Abre consola del navegador (F12)
2. Busca errores en rojo
3. Mira la terminal de PowerShell por logs del backend

### Problema: "Modal se abre pero no muestra progreso"

**Causa:** El backend está tardando mucho o falló silenciosamente

**Solución:**
1. Revisa la terminal de PowerShell
2. Busca mensajes como:
   - `❌ [ENRICH] Error...`
   - `⚠️ [ENRICH] El área ya tiene descripción...`

### Problema: "Descripción no se guarda"

**Causa:** Error al actualizar Supabase

**Logs esperados:**
```
💾 [ENRICH] Guardando en base de datos...
❌ [ENRICH] Error al guardar en BD: ... ← AQUÍ ESTÁ EL ERROR
```

**Solución:**
- Verifica `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- Verifica que tienes permisos en Supabase
- Verifica RLS policies

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Antes de Probar:

- [ ] `.env.local` existe y tiene todas las keys
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Terminal de PowerShell visible
- [ ] Navegador en `http://localhost:3000/admin/areas/enriquecer-textos`

### Durante la Prueba:

- [ ] Modal emergente aparece
- [ ] Barra de progreso se mueve
- [ ] Logs aparecen en la terminal
- [ ] Termina con `✅ [ENRICH] ¡Descripción guardada!`

### Después de la Prueba:

- [ ] Modal muestra "Exitosas: X"
- [ ] En Supabase, el área tiene descripción
- [ ] No hay errores en la consola del navegador

---

## 🆘 SI NADA FUNCIONA

### 1. Verifica que el backend SÍ se está ejecutando:

```powershell
# En otra terminal:
curl http://localhost:3000/api/admin/check-config
```

**Respuesta esperada:**
```json
{
  "hasOpenAI": true,
  "hasSerpAPI": true,
  "openaiKeyValid": true,
  "serpApiKeyValid": true
}
```

### 2. Prueba manualmente la API:

```powershell
# Copia un ID de área desde Supabase
# Luego:
curl -X POST http://localhost:3000/api/admin/enrich-description `
  -H "Content-Type: application/json" `
  -d '{"areaId": "TU-AREA-ID-AQUI"}'
```

**Si funciona:**
- Ves logs en la terminal
- Responde con JSON `{ "success": true, "descripcion": "..." }`

**Si NO funciona:**
- Ves error en la terminal
- Analiza el mensaje de error

---

## ✅ CONFIRMACIÓN FINAL

**Si ves esto en la terminal, TODO FUNCIONA:**

```
🚀 [ENRICH] Iniciando enriquecimiento de área
✅ [ENRICH] API keys configuradas
✅ [ENRICH] Área encontrada
✅ [ENRICH] SerpAPI respondió
✅ [ENRICH] OpenAI respondió
✅ [ENRICH] ¡Descripción guardada exitosamente!
```

**Y esto en el modal:**

```
Exitosas: 1 | Errores: 0 | Total: 1
```

**Y esto en Supabase:**

La columna `descripcion` del área tiene texto de 400-600 palabras.

---

**Si TODO esto funciona → Las funciones de IA están operativas al 100%** ✅

**Si algo falla → Copia los logs de la terminal y repórtalos** 🐛

---

**Última actualización:** Octubre 27, 2025  
**Estado:** Logs de debugging implementados ✅

