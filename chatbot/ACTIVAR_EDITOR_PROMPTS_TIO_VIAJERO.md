# 🎨 Activar Editor de Prompts del Tío Viajero IA

**Fecha:** 4 de Noviembre, 2025  
**Estado:** ⚠️ Migración pendiente

---

## 📋 Resumen

El editor de prompts para el Tío Viajero IA **ya está implementado** en el código frontend (`/admin/configuracion`), pero necesitas **ejecutar una migración en Supabase** para activarlo.

---

## ✅ Lo que YA está hecho:

1. ✅ **UI del editor** → `app/admin/configuracion/page.tsx` (líneas 880-1019)
2. ✅ **Funciones para editar** → `addChatbotPrompt()`, `updateChatbotPrompt()`, `removeChatbotPrompt()`, `moveChatbotPrompt()`
3. ✅ **Migración SQL** → `supabase/migrations/ADD_chatbot_prompts_system_EJECUTAR_AHORA.sql`
4. ✅ **Tipos TypeScript** → Soporte para múltiples prompts (system, user, assistant, agent)

---

## 🚀 Cómo Activar (1 minuto)

### Paso 1: Ir a Supabase SQL Editor

https://supabase.com/dashboard/project/obqanymmjnjustwhuscf/sql/new

### Paso 2: Copiar y pegar este SQL:

```sql
-- ============================================
-- MIGRACIÓN: Activar Editor de Prompts Múltiples
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
WHERE nombre = 'asistente_principal' AND prompts IS NULL;

-- 3. Añadir índice GIN para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_chatbot_config_prompts ON chatbot_config USING GIN (prompts);

-- 4. Verificación (ver resultado)
SELECT 
  nombre,
  modelo,
  jsonb_array_length(prompts->'prompts') as total_prompts,
  prompts->'prompts'->0->>'role' as primer_prompt_role,
  LEFT(prompts->'prompts'->0->>'content', 100) || '...' as preview_content,
  '✅ Editor habilitado en /admin/configuracion' as mensaje
FROM chatbot_config
WHERE nombre = 'asistente_principal';
```

### Paso 3: Click en "Run" (▶️)

Deberías ver un resultado como:

| nombre | modelo | total_prompts | primer_prompt_role | preview_content | mensaje |
|--------|--------|---------------|-------------------|-----------------|---------|
| asistente_principal | gpt-4o-mini | 1 | system | Eres "Tío Viajero IA" 🚐, el asistente virtual experto en áreas para autocaravanas... | ✅ Editor habilitado |

---

## 🎨 Después de Ejecutar

Recarga la página: **https://www.mapafurgocasa.com/admin/configuracion**

### Verás en la pestaña "🧳 Tío Viajero IA":

#### 1. **Botones para añadir prompts:**
```
+ User Prompt    + Assistant Prompt    + Agent Prompt
```

#### 2. **Lista de prompts editables:**
- Cada prompt con editor de texto
- Botones para mover arriba/abajo
- Botón para eliminar (si no es obligatorio)
- Color según tipo (azul=user, verde=assistant, púrpura=agent, gris=system)

#### 3. **Ejemplo de prompt editable:**

```
┌─────────────────────────────────────────────────┐
│ 🤖 System Prompt  Orden: 1  [Obligatorio]      │
│ [↑] [↓] [×]                                     │
├─────────────────────────────────────────────────┤
│ Eres "Tío Viajero IA" 🚐, el asistente virtual│
│ experto en áreas para autocaravanas...          │
│                                                  │
│ (Puedes editar este texto directamente)         │
└─────────────────────────────────────────────────┘
```

---

## 📝 Cómo Usar el Editor

### Añadir un nuevo prompt:

1. Click en **"+ User Prompt"** (o Assistant/Agent)
2. Se crea un nuevo editor vacío
3. Escribe el contenido del prompt
4. Click en **"Guardar Cambios"**

### Editar un prompt existente:

1. Modificar directamente el texto en el textarea
2. Click en **"Guardar Cambios"**

### Reordenar prompts:

- **[↑]** → Mover hacia arriba
- **[↓]** → Mover hacia abajo
- El orden afecta cómo OpenAI interpreta la conversación

### Eliminar prompt:

- **[×]** → Solo para prompts NO obligatorios
- El system prompt principal no se puede eliminar

---

## 🎯 Tipos de Prompts

### 🤖 System Prompt (Obligatorio)
Define la personalidad y comportamiento general del chatbot.

**Ejemplo:**
```
Eres "Tío Viajero IA" 🚐, el asistente virtual experto en áreas 
para autocaravanas. Eres amigable, cercano y entusiasta.
```

### 👤 User Prompt (Opcional)
Añade contexto o instrucciones adicionales como si fuera el usuario hablando.

**Ejemplo:**
```
Necesito encontrar áreas para mi autocaravana que tengan WiFi 
y permitan perros. Mi presupuesto máximo es 15€/noche.
```

### ✅ Assistant Prompt (Opcional)
Ejemplo de cómo debe responder el asistente.

**Ejemplo:**
```
¡Por supuesto! Voy a buscar áreas que cumplan tus requisitos.
Permíteme consultar nuestra base de datos...
```

### 🤖 Agent Prompt (Opcional)
Instrucciones específicas para el comportamiento del agente.

**Ejemplo:**
```
Cuando busques áreas, prioriza siempre:
1. Seguridad y valoraciones altas
2. Servicios solicitados por el usuario
3. Precio dentro del presupuesto indicado
```

---

## 🔧 Configuración Actual vs. Nueva

### ANTES (system_prompt legacy):
```typescript
chatbot_config {
  system_prompt: "Todo el texto en un solo campo..."
}
```

### DESPUÉS (prompts múltiples):
```typescript
chatbot_config {
  prompts: {
    prompts: [
      { id: "uuid", role: "system", content: "...", order: 1, required: true },
      { id: "uuid", role: "user", content: "...", order: 2, required: false },
      { id: "uuid", role: "assistant", content: "...", order: 3, required: false }
    ]
  }
}
```

---

## ⚠️ Nota Importante

El `system_prompt` original **NO se pierde**. La migración lo convierte automáticamente en el primer prompt del sistema múltiple. Puedes seguir editándolo o dividirlo en múltiples prompts más organizados.

---

## 📊 Beneficios del Sistema de Prompts Múltiples

1. **Más organizado** → Separa comportamiento, contexto y ejemplos
2. **Más flexible** → Puedes activar/desactivar prompts sin perder el texto
3. **Más fácil de testear** → Prueba diferentes combinaciones rápidamente
4. **Igual que otros agentes** → Scrape Services y Enrich Description ya lo usan

---

## 🎉 Resultado Final

Después de ejecutar la migración, podrás:

✅ Editar el prompt del Tío Viajero IA desde la web  
✅ Añadir prompts de contexto y ejemplos  
✅ Reorganizar prompts con drag & drop visual  
✅ Experimentar con diferentes configuraciones  
✅ Ver cambios en tiempo real sin tocar código  

---

## 🐛 Si algo falla

### Error: "Column prompts already exists"
→ Ya ejecutaste la migración antes. Verifica que el editor ya funcione en `/admin/configuracion`.

### Error: "Permission denied"
→ Asegúrate de estar en el SQL Editor de Supabase con permisos de admin.

### No veo el editor en /admin/configuracion
→ Recarga la página con Ctrl+F5 (forzar recarga sin caché).

---

**¡Listo!** Con esto tendrás el editor de prompts completamente funcional. 🚀

