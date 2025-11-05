# 🚀 CHECKLIST DE DEPLOYMENT DEL CHATBOT MEJORADO

## ✅ COMPLETADO (Ya hecho automáticamente)

- [x] ✅ Código del chatbot actualizado con todas las mejoras
- [x] ✅ Geocoding implementado (`lib/google/geocoding.ts`)
- [x] ✅ Historial de conversación integrado
- [x] ✅ Estadísticas de BD en tiempo real
- [x] ✅ Contexto enriquecido para la IA
- [x] ✅ Logs de debug para diagnosticar API Key
- [x] ✅ Commit y push realizados
- [x] ✅ README actualizado

---

## 🔴 PENDIENTE - ACCIONES MANUALES REQUERIDAS

### 1. ⏳ ESPERAR DEPLOYMENT EN AWS AMPLIFY (3-5 minutos)

El push que acabamos de hacer disparará un deployment automático en AWS Amplify.

**¿Cómo verificar?**
1. Ve a: https://eu-north-1.console.aws.amazon.com/amplify/apps
2. Click en tu app "Mapa-Furgocasa"
3. Deberías ver un deployment en progreso (círculo amarillo girando)
4. **Espera a que salga el ✅ verde**

**Mientras esperas, continúa con los pasos 2 y 3**

---

### 2. 🔑 AÑADIR VARIABLE DE ENTORNO EN AWS AMPLIFY

**Nueva variable requerida para Geocoding:**

1. Ve a AWS Amplify Console
2. Click en tu app "Mapa-Furgocasa"
3. Ve a: **Hosting** → **Environment variables**
4. Click **"Manage variables"**
5. Añadir esta nueva variable:

```
Variable: GOOGLE_MAPS_API_KEY
Valor: [LA MISMA KEY QUE NEXT_PUBLIC_GOOGLE_MAPS_API_KEY]
```

**IMPORTANTE:** Usa la **MISMA API KEY** que ya tienes en `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Es la misma key de Google Maps, solo que esta versión se usa en el servidor (sin el prefijo NEXT_PUBLIC).

6. Click **"Save"**

---

### 3. 📊 ACTUALIZAR SYSTEM PROMPT EN SUPABASE

**Ejecutar el nuevo script SQL con las reglas mejoradas:**

1. Ve a: https://supabase.com/dashboard/project/[TU_PROJECT]/sql
2. Abre el SQL Editor
3. Copia y pega el contenido de: `supabase/migrations/UPDATE_chatbot_prompt_completo.sql`
4. Click **"Run"**
5. Verifica que se ejecutó correctamente

**Este script actualiza el prompt con:**
- ✅ Reglas de ubicación (explícita > proximidad > genérica)
- ✅ Reglas de honestidad (no inventar datos)
- ✅ Radio dinámico (10km vs 50km)
- ✅ Formato de respuesta mejorado
- ✅ Ejemplos de uso con Function Calling

---

### 4. 🔄 REDEPLOY MANUAL (Solo si el auto-deploy no funciona)

**Si después de 10 minutos el deployment no se ha disparado:**

1. En AWS Amplify Console
2. Click en tu app
3. Click en la rama **"main"** 
4. Click en **"Redeploy this version"**
5. Espera 3-5 minutos

---

## 🧪 VERIFICACIÓN FINAL

**Una vez que el deployment termine (icono verde ✅):**

### Paso 1: Verificar que las variables están cargadas

1. Ve a: https://www.mapafurgocasa.com/admin/configuracion
2. En el panel "🔌 Estado de Conexiones API"
3. Verifica que **"Chatbot API"** salga **🟢 VERDE "Conectado"**

**Si sale rojo ❌:**
- Las variables no se cargaron correctamente
- Haz un redeploy manual (paso 4 arriba)

### Paso 2: Probar el chatbot

1. Inicia sesión en: https://www.mapafurgocasa.com
2. Click en el **avatar del Tío Viajero IA** (botón flotante abajo derecha)
3. El chatbot debería abrir y mostrar un mensaje de bienvenida

### Paso 3: Probar las nuevas funcionalidades

**Test 1: Geocoding Reverso**
```
Usuario: "áreas cerca de mí"
Resultado esperado: La IA detecta tu ciudad automáticamente y busca en tu ubicación
```

**Test 2: Memoria de Conversación**
```
Usuario: "áreas con agua"
IA: [Muestra áreas]
Usuario: "¿y con electricidad también?"
Resultado esperado: La IA recuerda que hablabais de áreas y filtra las anteriores
```

**Test 3: Estadísticas**
```
Usuario: "¿cuántas áreas hay en España?"
Resultado esperado: La IA responde con el número exacto (conoce las estadísticas)
```

**Test 4: Ubicación Explícita vs GPS**
```
Usuario en Granada: "áreas en Barcelona"
Resultado esperado: Busca en Barcelona (ignora que estás en Granada)
```

**Test 5: Proximidad**
```
Usuario: "áreas cercanas"
Resultado esperado: Busca en radio de 10-20km (no 50km)
```

---

## 🐛 TROUBLESHOOTING

### Error: "Chatbot no configurado: falta OPENAI_API_KEY"

**Causa:** Las variables de entorno no se cargaron en el deployment

**Solución:**
1. Verifica que `OPENAI_API_KEY` esté en AWS Amplify Environment Variables
2. Haz un redeploy manual
3. Espera 5 minutos y prueba de nuevo

---

### Error: Ubicación no detectada / "Desconocida"

**Causa:** Falta `GOOGLE_MAPS_API_KEY` o tiene límite excedido

**Solución:**
1. Añade `GOOGLE_MAPS_API_KEY` en AWS Amplify (paso 2 arriba)
2. Verifica que la API Key tenga **Geocoding API** habilitada en Google Cloud Console
3. Verifica que no hayas excedido el límite de Google Maps

---

### El chatbot no recuerda conversaciones previas

**Causa:** Problema con la tabla `chatbot_mensajes` o `conversacionId`

**Solución:**
1. Verifica en Supabase que las tablas existen:
   - `chatbot_conversaciones`
   - `chatbot_mensajes`
2. Verifica que los mensajes se están guardando (ve a Supabase → Table Editor)
3. Mira los logs del frontend (F12 → Console) para ver si hay errores

---

## 📝 LOGS ÚTILES

**Frontend (F12 → Console):**
```
📍 Ubicación obtenida: 37.1773 -3.5985
✅ Conversación creada: uuid-123...
```

**Backend (AWS Amplify → Monitoring → CloudWatch Logs):**
```
🤖 [CHATBOT] Nueva petición recibida
🔑 [CHATBOT] Verificando OPENAI_API_KEY...
✅ [CHATBOT] OPENAI_API_KEY encontrada
🌍 Ejecutando geocoding reverso...
✅ Ubicación detectada: Granada, Granada, Andalucía, España
📊 Obteniendo estadísticas de la BD...
✅ Estadísticas: {totalAreas: 3614, ...}
📜 Cargando historial de conversación...
✅ Cargados 3 mensajes del historial
```

---

## 🎯 RESULTADO ESPERADO

Después de completar todos los pasos:

✅ El chatbot responde sin error "falta OPENAI_API_KEY"
✅ Detecta automáticamente tu ciudad cuando dices "cerca de mí"
✅ Recuerda conversaciones previas (memoria)
✅ Conoce estadísticas de la BD ("¿cuántas áreas hay?")
✅ Respuestas más precisas y contextuales
✅ Diferencia entre ubicación explícita y GPS
✅ Usa radio dinámico (10km vs 50km)

---

## 📞 NECESITAS AYUDA?

Si algo no funciona después de seguir todos los pasos:

1. **Verifica el panel de configuración:** `/admin/configuracion`
   - Debe mostrar "Chatbot API: 🟢 Conectado"
   
2. **Revisa los logs:**
   - Frontend: F12 → Console
   - Backend: AWS Amplify → CloudWatch Logs
   
3. **Variables de entorno:**
   - Verifica que TODAS estén configuradas en AWS Amplify
   - Especialmente: `OPENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

4. **Deployment:**
   - Asegúrate de que el último deployment salió con ✅ verde
   - Si es necesario, haz un redeploy manual

---

**Última actualización:** 2024-11-04
**Versión del chatbot:** 2.0 (con Geocoding, Historial y Estadísticas)







