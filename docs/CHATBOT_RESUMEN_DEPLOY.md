# 🚀 Chatbot IA - Resumen para Deploy

## 📦 Archivos Listos para Commit

### ✅ Código (100% listo)
```
app/api/chatbot/route.ts          - API Route principal
components/chatbot/ChatbotWidget.tsx - Componente UI
lib/chatbot/functions.ts          - Funciones de consulta
app/layout.tsx                    - Modificado (widget global)
README.md                         - Actualizado
```

### ✅ SQL (listo, pendiente ejecutar en Supabase)
```
supabase/migrations/chatbot_schema.sql              - Schema completo
supabase/migrations/UPDATE_chatbot_prompt_no_rutas.sql - Actualización opcional
supabase/migrations/TEST_chatbot_funciones.sql      - Tests (opcional)
```

### ✅ Documentación (consolidada)
```
docs/CHATBOT_IMPLEMENTACION_COMPLETA.md      - Guía completa (Días 1, 2, 3)
docs/CHATBOT_INSTALACION_RAPIDA.md          - Pasos para deploy
docs/CHATBOT_SEPARACION_RESPONSABILIDADES.md - Chatbot vs Planificador
```

---

## ⚠️ ANTES DE HACER PUSH

### 1️⃣ **EJECUTAR SQL EN SUPABASE** ⚠️ CRÍTICO

1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega **TODO** el contenido de: `supabase/migrations/chatbot_schema.sql`
3. Click en **"Run"**
4. Verifica que se crearon las tablas:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name LIKE 'chatbot%';
   ```

### 2️⃣ **VERIFICAR VARIABLES DE ENTORNO**

Archivo `.env.local` debe tener:

```env
OPENAI_API_KEY=sk-proj-...                    # ← REQUERIDO
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...          # ← REQUERIDO
NEXT_PUBLIC_SUPABASE_URL=https://...          # Ya lo tienes
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...      # Ya lo tienes
```

**¿Dónde encontrar `SUPABASE_SERVICE_ROLE_KEY`?**
- Supabase Dashboard → Settings → API → "service_role (secret)"

---

## ✅ DESPUÉS DE COMPLETAR 1️⃣ Y 2️⃣

### Hacer Commit

```bash
git status

git add app/api/chatbot/ components/chatbot/ lib/chatbot/
git add supabase/migrations/chatbot_schema.sql
git add supabase/migrations/UPDATE_chatbot_prompt_no_rutas.sql
git add docs/CHATBOT_*.md
git add app/layout.tsx README.md

git commit -m "feat: Implementar Chatbot IA con OpenAI Function Calling

- Schema SQL completo (4 tablas + función areas_cerca)
- API Route con Function Calling (3 funciones)
- ChatbotWidget con modal de bloqueo para no autenticados
- Botón flotante global en todas las páginas
- Geolocalización automática
- System prompt actualizado (NO planifica rutas, redirige a /ruta)
- Documentación completa consolidada
- Separación clara: Chatbot (búsqueda) vs Planificador (rutas)"

git push origin main
```

---

## 🎯 Lo que el usuario verá

### **Usuario NO Autenticado:**
1. Botón flotante 💬 en esquina inferior derecha
2. Click → Modal de bloqueo:
   - "Asistente IA Bloqueado"
   - Lista de beneficios
   - Botón "Registrarme Gratis"
   - Botón "Ya tengo cuenta"

### **Usuario Autenticado:**
1. Botón flotante 💬 con animación bounce
2. Click → Ventana de chat se abre
3. Mensaje de bienvenida del asistente
4. Puede escribir preguntas en español:
   - "Áreas cerca de Barcelona"
   - "Busco áreas gratuitas en Portugal"
   - "¿Qué hay cerca de mí?"
   - "Mejores áreas de España con electricidad"
5. Recibe respuestas con:
   - Texto en lenguaje natural
   - Tarjetas clicables de áreas (si aplica)
   - Links a páginas de detalle

### **Si pregunta sobre rutas:**
Chatbot responde:
> "Para planificar rutas y encontrar áreas a lo largo de tu recorrido, usa nuestra herramienta especializada: 🗺️ **Planificador de Rutas** en /ruta..."

---

## 🧪 Cómo Probar (Local)

```bash
# 1. Asegurar que el servidor esté corriendo
npm run dev

# 2. Abrir navegador
http://localhost:3000

# 3. Probar sin login
- Ver botón flotante
- Click → Modal de bloqueo

# 4. Registrarse/Login
/auth/register o /auth/login

# 5. Probar chatbot
- Click en botón 💬
- Escribir: "Áreas cerca de Madrid"
- Verificar respuesta con áreas
```

---

## 📊 Verificar en Supabase (Después del Deploy)

```sql
-- Ver configuración del chatbot
SELECT * FROM chatbot_config;

-- Ver conversaciones creadas
SELECT COUNT(*) FROM chatbot_conversaciones;

-- Ver mensajes
SELECT COUNT(*) FROM chatbot_mensajes;

-- Ver últimas conversaciones
SELECT 
  titulo, 
  total_mensajes, 
  created_at 
FROM chatbot_conversaciones 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver mensajes de una conversación específica
SELECT 
  rol, 
  LEFT(contenido, 100) as preview,
  funcion_llamada,
  created_at
FROM chatbot_mensajes 
WHERE conversacion_id = 'tu-conversacion-id'
ORDER BY created_at;
```

---

## 🐛 Posibles Errores y Soluciones

### Error: "Table chatbot_config doesn't exist"
❌ **No ejecutaste el SQL en Supabase**  
✅ Ve al paso 1️⃣ y ejecuta `chatbot_schema.sql`

### Error: "OpenAI API key not found"
❌ **Falta la variable de entorno**  
✅ Añade `OPENAI_API_KEY` a `.env.local` y reinicia el servidor

### Error: "No autorizado" al enviar mensaje
❌ **Falta `SUPABASE_SERVICE_ROLE_KEY`**  
✅ Añádela a `.env.local` y reinicia

### El botón no aparece
❌ **Caché del navegador**  
✅ `Ctrl + Shift + R` para recargar sin caché

### El chat no responde
❌ **Error en la API**  
✅ Abre consola del navegador (F12) → Network → `/api/chatbot` → Ver error

---

## 📈 Estadísticas Esperadas

Después de algunos usuarios:

```sql
-- Usuarios que han usado el chatbot
SELECT COUNT(DISTINCT user_id) FROM chatbot_conversaciones;

-- Promedio de mensajes por conversación
SELECT AVG(total_mensajes) FROM chatbot_conversaciones;

-- Función más usada
SELECT 
  funcion_llamada, 
  COUNT(*) as veces_usada
FROM chatbot_mensajes 
WHERE funcion_llamada IS NOT NULL
GROUP BY funcion_llamada
ORDER BY veces_usada DESC;
```

---

## ✅ Checklist Final

- [ ] SQL ejecutado en Supabase ✅
- [ ] `OPENAI_API_KEY` en `.env.local` ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` ✅
- [ ] Código revisado (sin errores de lint) ✅
- [ ] Commit realizado ✅
- [ ] Push realizado ✅
- [ ] Deploy verificado en producción ⏳
- [ ] Pruebas con usuario real ⏳

---

## 🎉 Resultado Final

**Dos herramientas premium diferenciadas:**

| 🤖 Chatbot IA | 🗺️ Planificador de Rutas |
|---|---|
| Búsqueda inteligente | Planificación de rutas |
| Lenguaje natural | Interfaz visual |
| Recomendaciones | Áreas a lo largo de ruta |
| Botón flotante | Página dedicada `/ruta` |
| Conversación | Mapa interactivo |

**Ambas requieren registro → Fomentan conversión de usuarios** 🚀

---

**📝 IMPORTANTE:** Si haces push **sin ejecutar el SQL**, el chatbot dará error al intentar usar la API. Primero ejecuta el SQL, luego haz push.

