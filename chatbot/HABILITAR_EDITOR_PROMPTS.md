# 🎨 Habilitar Editor de Prompts para "Tío Viajero IA"

**Fecha:** 4 de Noviembre, 2025  
**Estado:** ⏳ PENDIENTE DE EJECUTAR  
**Tiempo:** 5 minutos

---

## 📋 Resumen

El editor de prompts múltiples para el "Tío Viajero IA" **ya está implementado en el código** (`/admin/configuracion`), pero necesita que ejecutes una migración en Supabase para añadir el campo `prompts` a la tabla `chatbot_config`.

---

## ✅ Lo que YA FUNCIONA

1. ✅ Editor de prompts en `/admin/configuracion` (tab "🧳 Tío Viajero IA")
2. ✅ Funciones JavaScript para añadir/editar/eliminar/reordenar prompts
3. ✅ Interfaz UI identical a "Actualizar Servicios" y "Enriquecer Textos"
4. ✅ Guardado automático en la base de datos

---

## ❌ Lo que FALTA

**Solo falta 1 cosa:** Ejecutar la migración SQL en Supabase para añadir el campo `prompts`.

---

## 🚀 PASO A PASO

### 1. Abrir Supabase SQL Editor

1. Ir a https://supabase.com/dashboard
2. Seleccionar tu proyecto "Furgocasa"
3. Click en "SQL Editor" (barra lateral izquierda)
4. Click en "+ New Query"

### 2. Copiar y Ejecutar este SQL

```sql
-- ============================================
-- MIGRACIÓN: Agregar sistema de prompts múltiples al chatbot
-- ============================================

-- 1. Añadir columna para prompts estructurados
ALTER TABLE chatbot_config 
ADD COLUMN IF NOT EXISTS prompts JSONB;

-- 2. Migrar el system_prompt actual a formato de prompts múltiples
UPDATE chatbot_config
SET prompts = jsonb_build_object(
  'prompts', jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'role', 'system',
      'content', COALESCE(system_prompt, 'Eres el Tío Viajero, un asistente experto en áreas de autocaravanas y campings.'),
      'order', 1,
      'required', true
    )
  )
)
WHERE prompts IS NULL;

-- 3. Hacer que la columna sea obligatoria después de la migración
ALTER TABLE chatbot_config 
ALTER COLUMN prompts SET NOT NULL;

-- 4. Añadir índice GIN para búsquedas eficientes en JSONB
CREATE INDEX IF NOT EXISTS idx_chatbot_config_prompts ON chatbot_config USING GIN (prompts);

-- 5. Verificación (ver resultado en la pestaña "Results")
SELECT 
  nombre,
  modelo,
  jsonb_array_length(prompts->'prompts') as total_prompts,
  prompts->'prompts'->0->>'role' as primer_prompt_role
FROM chatbot_config
WHERE nombre = 'asistente_principal';
```

### 3. Ejecutar

Click en **"Run"** (o presiona `Ctrl+Enter` / `Cmd+Enter`)

### 4. Verificar Resultado

Deberías ver en la pestaña "Results":

```
nombre               | modelo        | total_prompts | primer_prompt_role
---------------------|---------------|---------------|-------------------
asistente_principal  | gpt-4o-mini   | 1             | system
```

✅ **Si ves esto, la migración fue exitosa!**

---

## 🎨 Cómo Usar el Editor (después de la migración)

### 1. Acceder al Editor

1. Ir a `/admin/configuracion`
2. Click en el tab **"🧳 Tío Viajero IA (Chatbot)"**
3. Scroll down hasta **"🎨 Configuración de Prompts"**

### 2. Añadir Prompts

**Botones disponibles:**
- **+ User Prompt** (azul): Para añadir instrucciones al usuario
- **+ Assistant Prompt** (verde): Para ejemplos de respuesta (few-shot learning)
- **+ Agent Prompt** (morado): Para instrucciones adicionales del agente

### 3. Editar Prompts

Cada prompt tiene:
- **Textarea grande**: Escribir el contenido
- **Flechas 🔼 🔽**: Reordenar prompts
- **❌ Rojo**: Eliminar prompt (solo si NO es obligatorio)

### 4. Usar Variables

En los prompts User, Assistant, o Agent, puedes usar variables que se reemplazan automáticamente:

```
{{area_nombre}}        →  Nombre del área
{{area_ciudad}}        →  Ciudad del área
{{area_provincia}}     →  Provincia del área
{{area_pais}}          →  País del área
{{contexto}}           →  Contexto adicional
{{texto_analizar}}     →  Texto a analizar
{{usuario_ubicacion}}  →  Ubicación del usuario
```

### 5. Guardar Cambios

Click en **"Guardar Cambios"** (botón azul al final)

---

## 💡 Ejemplo: Añadir Few-Shot Learning

### Antes (solo System Prompt):

```
⚙️ System Prompt (Obligatorio)
Eres el Tío Viajero, un asistente experto...
```

### Después (con ejemplos):

```
⚙️ System Prompt (Obligatorio)
Eres el Tío Viajero, un asistente experto...

👤 User Prompt
Busco áreas con WiFi cerca de Granada

🤖 Assistant Prompt (EJEMPLO)
¡Perfecto! He encontrado 8 áreas con WiFi cerca de Granada:

1. **Área Los Álamos** (5km)
   - WiFi: ✅ Gratis
   - Servicios: Agua, Electricidad, Duchas
   - Precio: 12€/noche

2. **Camping Sierra Nevada** (12km)
   ...

👤 User Prompt
{{mensaje_usuario}}
```

---

## 🔄 Migración de System Prompt Actual

La migración **NO borra tu system_prompt actual**. Lo convierte automáticamente al nuevo formato:

**Antes:**
```javascript
{
  system_prompt: "Tu prompt largo..."
}
```

**Después:**
```javascript
{
  system_prompt: "Tu prompt largo...",  // Se mantiene por compatibilidad
  prompts: {
    prompts: [
      {
        id: "sys-123abc",
        role: "system",
        content: "Tu prompt largo...",  // Mismo contenido
        order: 1,
        required: true
      }
    ]
  }
}
```

---

## 🎯 Diferencia vs Otros Agentes

| Característica | Actualizar Servicios | Enriquecer Textos | Tío Viajero IA |
|---|---|---|---|
| **Tabla** | `ia_config` | `ia_config` | `chatbot_config` |
| **Editor de Prompts** | ✅ Ya funcionaba | ✅ Ya funcionaba | ✅ **Ahora funciona** |
| **Variables** | {{area_nombre}}, {{texto}} | {{area_ciudad}}, etc. | {{mensaje_usuario}}, etc. |
| **Few-Shot Learning** | ✅ Soportado | ✅ Soportado | ✅ **Ahora soportado** |

---

## ⚠️ Notas Importantes

### 1. El System Prompt NO se elimina

El campo `system_prompt` se mantiene para compatibilidad, pero ahora también se almacena en `prompts`.

### 2. El chatbot usa `prompts` si existe

El código del chatbot (`app/api/chatbot/route.ts`) detecta automáticamente:
- Si existe `prompts`, usa el sistema nuevo
- Si no existe, usa `system_prompt` antiguo (fallback)

### 3. Puedes editarlo desde 2 lugares

1. **Tab "Parámetros del Modelo"**: System Prompt simple (textarea)
2. **Sección "Configuración de Prompts"**: Sistema avanzado con múltiples prompts

Ambos se sincronizan automáticamente.

---

## 🧪 Verificar que Funciona

### Test 1: Ver el editor

1. Ir a `/admin/configuracion`
2. Tab "🧳 Tío Viajero IA (Chatbot)"
3. Scroll down

**Deberías ver:**
```
🎨 Configuración de Prompts
[+ User Prompt]  [+ Assistant Prompt]  [+ Agent Prompt]

⚙️ System Prompt (Obligatorio)
[Tu prompt actual aquí...]
```

### Test 2: Añadir un prompt

1. Click en "+ User Prompt"
2. Escribir: "Test prompt"
3. Click "Guardar Cambios"
4. Recargar la página

**Debería aparecer el nuevo prompt en la lista**

### Test 3: Verificar en Supabase

```sql
SELECT 
  nombre,
  jsonb_pretty(prompts) as prompts_formatted
FROM chatbot_config
WHERE nombre = 'asistente_principal';
```

**Deberías ver tu nuevo prompt en el JSON**

---

## 🎉 Estado Final

Después de ejecutar la migración:

```
╔════════════════════════════════════════════════════════════╗
║  ✅ EDITOR DE PROMPTS HABILITADO                           ║
║  🎨 Tío Viajero IA: COMPLETAMENTE EDITABLE                 ║
║  ⏱️  Tiempo: 5 minutos                                     ║
║                                                            ║
║  Ahora puedes:                                             ║
║  ✅ Añadir múltiples prompts                               ║
║  ✅ Reordenar prompts                                      ║
║  ✅ Usar few-shot learning                                 ║
║  ✅ Variables dinámicas                                    ║
║  ✅ Edición visual (igual que otros agentes)              ║
╚════════════════════════════════════════════════════════════╝
```

---

## 📞 Soporte

### Si la migración falla:

**Error:** `column "prompts" of relation "chatbot_config" already exists`

**Solución:** El campo ya existe, solo verifica que tenga datos:
```sql
SELECT prompts FROM chatbot_config WHERE nombre = 'asistente_principal';
```

Si retorna `NULL`, ejecuta solo la parte 2 del script (UPDATE).

---

### Si no aparece el editor:

1. **Verificar que ejecutaste la migración**
2. **Recargar la página** (`Ctrl+F5` o `Cmd+Shift+R`)
3. **Limpiar caché del navegador**
4. **Verificar en Supabase** que el campo `prompts` existe y tiene datos

---

**Última actualización:** 4 de Noviembre, 2025  
**Archivo SQL:** `supabase/migrations/ADD_chatbot_prompts_system.sql`  
**Status:** Pendiente de ejecutar (5 minutos)

