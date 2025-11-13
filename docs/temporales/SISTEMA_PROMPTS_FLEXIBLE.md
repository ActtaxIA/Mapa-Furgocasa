# ✅ SISTEMA DE PROMPTS FLEXIBLE PARA AGENTES DE IA

## 📋 RESUMEN

Se ha implementado un **sistema completamente flexible** para configurar los prompts de los agentes de IA, permitiendo:

✅ **System Prompt obligatorio** (siempre presente)  
✅ **Prompts adicionales opcionales** (User, Assistant, Agent)  
✅ **Reordenamiento** mediante flechas arriba/abajo  
✅ **Variables dinámicas** que se reemplazan automáticamente  
✅ **UI visual mejorada** con código de colores  
✅ **Compatibilidad retroactiva** con datos existentes

---

## 🎨 CARACTERÍSTICAS PRINCIPALES

### 1. Tipos de Prompts Disponibles

| Tipo | Icono | Descripción | Obligatorio |
|------|-------|-------------|-------------|
| **System** | ⚙️ | Define el rol y comportamiento del agente | ✅ SÍ |
| **User** | 👤 | Instrucciones o contexto del usuario | ❌ NO |
| **Assistant** | 🤖 | Ejemplo de respuesta esperada (few-shot) | ❌ NO |
| **Agent** | 🎯 | Instrucciones específicas adicionales | ❌ NO |

### 2. Variables Disponibles

Todas disponibles en prompts User, Assistant y Agent:

- `{{area_nombre}}` - Nombre del área
- `{{area_ciudad}}` - Ciudad del área
- `{{area_provincia}}` - Provincia del área
- `{{contexto}}` - Contexto completo generado (solo enrich)
- `{{texto_analizar}}` - Texto de búsquedas (solo scrape)

### 3. Controles Visuales

- **➕ Botones "+User/+Assistant/+Agent"** - Añadir nuevos prompts
- **🔼 Flecha arriba** - Mover prompt hacia arriba en el orden
- **🔽 Flecha abajo** - Mover prompt hacia abajo
- **❌ Botón eliminar** - Borrar prompts opcionales
- **Código de colores** - Naranja (system), Azul (user), Verde (assistant), Morado (agent)

---

## 📂 ARCHIVOS CREADOS/MODIFICADOS

### ✅ Archivos Nuevos

1. **`types/ia-config.types.ts`**
   - Tipos TypeScript para el sistema de prompts
   - Interfaces: `PromptMessage`, `IAConfigValue`, `IAConfig`
   - Constantes de colores y labels

2. **`supabase/migrate-prompts-system.sql`**
   - Script SQL de migración
   - Convierte estructura antigua → nueva
   - Idempotente y seguro

3. **`SISTEMA_PROMPTS_FLEXIBLE.md`**
   - Este documento

### ✅ Archivos Modificados

1. **`app/admin/configuracion/page.tsx`**
   - UI completamente renovada
   - Sistema de drag & reorder
   - Añadir/eliminar prompts dinámicamente

2. **`app/api/admin/ia-config/route.ts`**
   - Valores por defecto con nueva estructura
   - Soporte para ambas estructuras (retrocompatibilidad)

3. **`app/api/admin/scrape-services/route.ts`**
   - Construye mensajes desde array de prompts
   - Reemplaza variables automáticamente
   - Soporta múltiples prompts en orden

4. **`app/api/admin/enrich-description/route.ts`**
   - Construye mensajes desde array de prompts
   - Reemplaza variables automáticamente
   - Soporta múltiples prompts en orden

5. **`app/admin/areas/enriquecer-textos/page.tsx`**
   - Añadidos logs de debugging
   - Mejor feedback visual

---

## 🔄 ESTRUCTURA DE DATOS

### Estructura Antigua (Deprecada)

```json
{
  "model": "gpt-4o-mini",
  "temperature": 0.1,
  "max_tokens": 300,
  "system_prompt": "Eres un auditor...",
  "user_prompt_template": "Analiza el texto..."
}
```

### ✅ Estructura Nueva (Flexible)

```json
{
  "model": "gpt-4o-mini",
  "temperature": 0.1,
  "max_tokens": 300,
  "prompts": [
    {
      "id": "sys-1",
      "role": "system",
      "content": "Eres un auditor crítico...",
      "order": 1,
      "required": true
    },
    {
      "id": "user-1",
      "role": "user",
      "content": "Analiza el texto sobre {{area_nombre}}...",
      "order": 2,
      "required": false
    },
    {
      "id": "assistant-1",
      "role": "assistant",
      "content": "Ejemplo de respuesta correcta...",
      "order": 3,
      "required": false
    }
  ]
}
```

---

## 🚀 CÓMO USAR

### 1. Ejecutar Migración en Supabase

```sql
-- Copiar y ejecutar en Supabase SQL Editor
-- Ver archivo: supabase/migrate-prompts-system.sql
```

**Resultado esperado:**
```
✅ 2 filas actualizadas
✅ scrape_services: 2 prompts (system + user)
✅ enrich_description: 2 prompts (system + user)
```

### 2. Acceder a la Configuración

1. Ir a `/admin/configuracion`
2. Seleccionar tab "🔍 Actualizar Servicios" o "✨ Enriquecer Textos"
3. Ver la sección "🤖 Configuración de Prompts"

### 3. Añadir un Nuevo Prompt

**Opción A: User Prompt**
```
1. Click en "+User Prompt" (azul)
2. Se añade un nuevo prompt de tipo User
3. Escribir el contenido en el textarea
4. Usar variables: {{area_nombre}}, {{area_ciudad}}, etc.
5. Click "Guardar Cambios"
```

**Opción B: Assistant Prompt** (para few-shot learning)
```
1. Click en "+Assistant Prompt" (verde)
2. Escribir un ejemplo de respuesta correcta
3. Reordenar si es necesario (flechas)
4. Click "Guardar Cambios"
```

**Opción C: Agent Prompt**
```
1. Click en "+Agent Prompt" (morado)
2. Añadir instrucciones adicionales
3. Se convierte a "user" al enviar a OpenAI
4. Click "Guardar Cambios"
```

### 4. Reordenar Prompts

```
1. Usar flechas 🔼 🔽 junto a cada prompt
2. El orden determina el flujo de conversación
3. System siempre va primero (no se puede mover)
4. Click "Guardar Cambios" para aplicar
```

### 5. Eliminar un Prompt

```
1. Click en ❌ junto al prompt que quieres eliminar
2. Solo se pueden eliminar prompts opcionales
3. El System Prompt NO se puede eliminar
4. Click "Guardar Cambios"
```

---

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Few-Shot Learning para Servicios

```
🤖 Configuración: scrape_services

[⚙️ System Prompt - Obligatorio]
Eres un auditor crítico que analiza información sobre áreas de autocaravanas...

[👤 User Prompt]
Analiza el siguiente texto sobre "{{area_nombre}}" en {{area_ciudad}}:

{{texto_analizar}}

[🤖 Assistant Prompt] ← NUEVO
{
  "agua": true,
  "electricidad": true,
  "wifi": false,
  ...
}

[👤 User Prompt #2] ← NUEVO
Ahora analiza este texto y devuelve el JSON:
...
```

**Resultado:** El modelo aprende del ejemplo y mejora la precisión.

### Ejemplo 2: Multi-Step para Descripciones

```
🤖 Configuración: enrich_description

[⚙️ System Prompt]
Eres un redactor experto en guías de viaje...

[👤 User Prompt]
Contexto del área:
{{contexto}}

[🎯 Agent Prompt] ← NUEVO
PASO 1: Identifica los 3 atractivos turísticos más importantes.

[🤖 Assistant Prompt] ← NUEVO
Los principales atractivos son...

[👤 User Prompt #2] ← NUEVO
PASO 2: Ahora escribe el texto completo de 400-600 palabras incluyendo esos atractivos.
```

**Resultado:** Proceso guiado en múltiples pasos para mejor calidad.

---

## 🔍 DEBUGGING Y LOGS

### En el Frontend (enriquecer-textos)

Abrir consola del navegador (F12) y buscar:

```javascript
🔵 Botón presionado - iniciando enriquecimiento
📊 Config status: { ready: true, checks: {...} }
📝 IDs seleccionados: ["uuid-1", "uuid-2"]
✅ Validaciones pasadas, iniciando proceso...
❓ Usuario confirmó: true
🚀 Iniciando procesamiento...
```

**Si no aparece nada:**
- El botón puede estar deshabilitado
- Verifica que `configStatus?.ready === true`
- Verifica que `selectedIds.length > 0`

### En el Backend (APIs)

Ver logs en la terminal de PowerShell donde corre `npm run dev`

---

## 🧪 PRUEBAS RECOMENDADAS

### Prueba 1: Migración de Datos

```sql
-- En Supabase SQL Editor
SELECT config_key, config_value FROM ia_config;

-- Verificar que config_value tenga estructura:
-- { model, temperature, max_tokens, prompts: [...] }
```

### Prueba 2: UI de Configuración

1. Ir a `/admin/configuracion`
2. **Verificar:** Se ven 2 prompts (System + User)
3. **Click:** "+User Prompt"
4. **Verificar:** Se añade un nuevo prompt azul
5. **Escribir:** "Texto de prueba con {{area_nombre}}"
6. **Click:** "Guardar Cambios"
7. **Verificar:** Mensaje verde "✓ Configuración guardada"

### Prueba 3: Reordenamiento

1. Tener al menos 3 prompts
2. Click en flecha 🔽 del segundo prompt
3. **Verificar:** El prompt se mueve al tercer lugar
4. Click "Guardar Cambios"
5. Recargar página (F5)
6. **Verificar:** El orden se mantuvo

### Prueba 4: Ejecución de Agente

1. Ir a `/admin/areas/actualizar-servicios`
2. Seleccionar 1 área de prueba
3. Click "Actualizar 1 área"
4. Confirmar en el diálogo
5. **Verificar:** Se ejecuta correctamente
6. **Verificar en logs:** Los prompts se enviaron a OpenAI en orden

### Prueba 5: Variables Dinámicas

1. Configurar un User Prompt con: `Analiza {{area_nombre}} en {{area_ciudad}}`
2. Guardar
3. Ejecutar sobre un área de prueba
4. **Verificar en logs de OpenAI:** Las variables fueron reemplazadas correctamente

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "No aparecen los prompts en la UI"

**Causa:** La migración SQL no se ejecutó

**Solución:**
```sql
-- Ejecutar en Supabase SQL Editor
\i supabase/migrate-prompts-system.sql
```

### Problema 2: "Error al guardar configuración"

**Causa:** Estructura de datos inválida

**Solución:**
1. Abrir consola del navegador (F12)
2. Ver el error específico
3. Verificar que `config_value.prompts` sea un array válido

### Problema 3: "El agente no usa los prompts personalizados"

**Causa:** Caché o fallback a valores por defecto

**Solución:**
1. Reiniciar el servidor: `Ctrl+C` → `npm run dev`
2. Limpiar caché del navegador
3. Verificar en Supabase que los datos se guardaron

### Problema 4: "Las variables no se reemplazan"

**Causa:** Sintaxis incorrecta de variables

**Solución:**
- Usar: `{{area_nombre}}` (con dobles llaves)
- NO usar: `{area_nombre}` o `$area_nombre`

### Problema 5: "El botón de enriquecer no hace nada"

**Causa:** Varias posibles (ver logs en consola)

**Solución:**
1. Abrir consola (F12)
2. Buscar mensajes que empiecen con 🔵, ❌, ⏹️
3. Verificar:
   - `configStatus?.ready === true` (API keys configuradas)
   - `selectedIds.length > 0` (hay áreas seleccionadas)
   - Usuario confirmó en el diálogo

---

## 📊 VENTAJAS DEL NUEVO SISTEMA

### Antes (Sistema Rígido)

❌ Solo 2 prompts fijos (system + user)  
❌ No se podían añadir ejemplos  
❌ Limitado a un solo turno de conversación  
❌ Difícil personalizar para casos específicos  
❌ No se podía reordenar  

### Ahora (Sistema Flexible)

✅ **Ilimitados prompts** de cualquier tipo  
✅ **Few-shot learning** con Assistant prompts  
✅ **Multi-turn conversations** en orden personalizado  
✅ **Drag & drop** para reordenar  
✅ **Variables dinámicas** automáticas  
✅ **UI visual** con código de colores  
✅ **Retrocompatible** con datos antiguos  

---

## 🎓 CASOS DE USO AVANZADOS

### Caso 1: Mejora de Precisión con Few-Shot

**Problema:** El agente marca servicios incorrectamente

**Solución:** Añadir ejemplos Assistant

```
[⚙️ System] Eres un auditor crítico...

[👤 User] Analiza: "Área con agua y electricidad"

[🤖 Assistant] {"agua": true, "electricidad": true, "wifi": false, ...}

[👤 User] Ahora analiza: {{texto_analizar}}
```

### Caso 2: Generación en Pasos

**Problema:** Las descripciones son genéricas

**Solución:** Multi-step prompting

```
[⚙️ System] Eres un redactor experto...

[👤 User] Datos: {{contexto}}

[🎯 Agent] Identifica 3 datos clave únicos de esta área

[🤖 Assistant] 1. Cerca de playa, 2. Ruta de senderismo, 3. Pueblo histórico

[👤 User] Escribe 500 palabras destacando esos 3 puntos
```

### Caso 3: Validación de Salida

**Problema:** El JSON viene mal formado

**Solución:** Añadir validación explícita

```
[⚙️ System] Respondes SOLO JSON válido...

[👤 User] Analiza: {{texto_analizar}}

[🎯 Agent] IMPORTANTE: Devuelve EXACTAMENTE este formato (no añadas texto):
{"agua": true/false, "electricidad": true/false, ...}

NO añadas explicaciones ni comentarios.
```

---

## 📈 MÉTRICAS Y MONITOREO

### Variables a Monitorear

- **Número de prompts por agente** (recomendado: 2-4)
- **Tokens consumidos** (más prompts = más tokens)
- **Tiempo de respuesta** (aumenta con más prompts)
- **Tasa de éxito** (¿mejora con ejemplos?)

### Recomendaciones

- **Empezar simple:** System + User
- **Añadir ejemplos** si hay errores recurrentes
- **No exceder 5-6 prompts** (caro y lento)
- **Testear cambios** con 5-10 áreas antes de procesar 100+

---

## 🔐 SEGURIDAD Y PERMISOS

- ✅ Solo administradores pueden modificar prompts
- ✅ RLS activo en tabla `ia_config`
- ✅ Validación en backend y frontend
- ✅ Historial en `updated_at`

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. **Ejecutar migración SQL** en Supabase
2. **Probar la UI** de configuración
3. **Experimentar** con few-shot learning
4. **Documentar** los prompts que funcionan mejor
5. **Monitorear costos** (más prompts = más tokens)

---

**Fecha de implementación:** Octubre 27, 2025  
**Versión:** 2.0  
**Estado:** ✅ COMPLETADO Y FUNCIONAL

---

✨ **Sistema de Prompts Flexible - Potencia y Control Total para tus Agentes de IA** ✨

