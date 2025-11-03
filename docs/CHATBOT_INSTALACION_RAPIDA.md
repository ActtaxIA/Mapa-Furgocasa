# 🚀 Instalación Rápida del Chatbot

## ✅ Checklist Pre-Deploy

Antes de hacer commit y push, asegúrate de completar estos pasos:

---

## 1️⃣ Ejecutar Script SQL en Supabase

### Paso a paso:

1. **Abre Supabase Dashboard:**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto de Furgocasa

2. **Ve al SQL Editor:**
   - En el menú lateral: **SQL Editor**
   - Click en **"New query"**

3. **Copia y pega el contenido completo de:**
   ```
   supabase/migrations/chatbot_schema.sql
   ```

4. **Ejecuta el script:**
   - Click en **"Run"** (o presiona `Ctrl + Enter`)
   - Espera a que termine (debería decir "Success")

5. **Verificar que se crearon las tablas:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'chatbot%';
   ```
   
   **Deberías ver:**
   - `chatbot_config`
   - `chatbot_conversaciones`
   - `chatbot_mensajes`
   - `chatbot_analytics`

6. **Verificar configuración inicial:**
   ```sql
   SELECT nombre, descripcion, modelo, activo 
   FROM chatbot_config;
   ```
   
   **Deberías ver:**
   ```
   nombre: asistente_principal
   descripcion: Asistente principal de Furgocasa...
   modelo: gpt-4o-mini
   activo: true
   ```

---

## 2️⃣ Verificar Variables de Entorno

Abre tu archivo `.env.local` y verifica que tengas:

```env
# OpenAI (REQUERIDO para el Chatbot)
OPENAI_API_KEY=sk-proj-...

# Supabase (REQUERIDO)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ← IMPORTANTE para la API del chatbot

# Google Maps (ya lo tienes)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### ¿Dónde encontrar `SUPABASE_SERVICE_ROLE_KEY`?

1. Supabase Dashboard → **Settings** → **API**
2. Busca: **"service_role" (secret)**
3. Click en el ojo para revelar
4. Copia el valor completo

⚠️ **NUNCA** compartas esta key públicamente (es tu admin key)

---

## 3️⃣ Instalar Dependencias (si no lo has hecho)

```bash
npm install openai
```

---

## 4️⃣ Hacer Commit y Push

Una vez completados los pasos 1️⃣ y 2️⃣:

```bash
# Ver archivos pendientes
git status

# Añadir todos los archivos del chatbot
git add app/api/chatbot/ components/chatbot/ lib/chatbot/
git add supabase/migrations/chatbot_schema.sql
git add docs/CHATBOT_*.md
git add app/layout.tsx README.md

# Commit
git commit -m "feat: Implementar Chatbot IA con OpenAI Function Calling

- Crear schema SQL completo (config, conversaciones, mensajes, analytics)
- Implementar API Route con Function Calling
- Crear ChatbotWidget con modal de bloqueo
- Añadir funciones de búsqueda (searchAreas, getAreaDetails, getAreasByCountry)
- Integrar en layout principal (botón flotante global)
- Bloqueo para usuarios no autenticados
- Geolocalización automática
- System prompt actualizado (NO planifica rutas)
- Documentación completa"

# Push
git push origin main
```

---

## 5️⃣ Probar en Producción

1. **Espera a que el deploy termine** (Vercel/Netlify)

2. **Abre tu app:**
   ```
   https://www.mapafurgocasa.com
   ```

3. **Sin iniciar sesión:**
   - Deberías ver el botón flotante 💬 en la esquina
   - Al hacer click → Modal de bloqueo
   - "Registrarme Gratis" / "Ya tengo cuenta"

4. **Inicia sesión:**
   - Haz click en el botón 💬
   - Se abre la ventana del chat
   - Aparece el mensaje de bienvenida
   - Escribe: "Áreas cerca de Madrid"
   - Deberías recibir respuesta con áreas

---

## 🐛 Troubleshooting

### Error: "Tablas no existen"
**Solución:** Ejecuta el script SQL en Supabase (paso 1️⃣)

### Error: "OpenAI API key not found"
**Solución:** Verifica `.env.local` y reinicia el servidor (`npm run dev`)

### Error: "No autorizado" en la API
**Solución:** Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté en `.env.local`

### El botón del chatbot no aparece
**Solución:** 
1. Verifica que `ChatbotWidget` esté en `app/layout.tsx`
2. Borra caché del navegador (`Ctrl + Shift + R`)

### El chat se abre pero no responde
**Solución:**
1. Abre consola del navegador (`F12`)
2. Busca errores en la pestaña "Console"
3. Verifica que la API responda: 
   - Network → Busca `/api/chatbot` → Ver respuesta

---

## 📊 Verificar que Todo Funciona

### En Supabase:

```sql
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
LIMIT 5;
```

### En la Aplicación:

1. ✅ Botón flotante visible
2. ✅ Modal de bloqueo para no autenticados
3. ✅ Chat funcional para usuarios registrados
4. ✅ Respuestas con áreas (tarjetas clicables)
5. ✅ Geolocalización funciona
6. ✅ Redirección a `/ruta` cuando pregunta sobre rutas

---

## ✅ Resumen

| Paso | Estado | Acción |
|------|--------|--------|
| 1. Ejecutar SQL | ⏳ | Ve a Supabase Dashboard → SQL Editor |
| 2. Variables .env | ⏳ | Verifica OPENAI_API_KEY y SUPABASE_SERVICE_ROLE_KEY |
| 3. Instalar deps | ⏳ | `npm install openai` |
| 4. Commit & Push | ⏳ | `git add . && git commit && git push` |
| 5. Probar | ⏳ | Abre la app y prueba el chatbot |

---

**🎉 Una vez completados estos pasos, el chatbot estará 100% funcional en producción!** 🚀

