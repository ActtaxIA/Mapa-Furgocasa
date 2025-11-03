# 🤖 Chatbot IA - Implementación Completa

**Asistente inteligente con IA para búsqueda de áreas en Furgocasa**

---

## 📋 Tabla de Contenidos

1. [Resumen General](#-resumen-general)
2. [Arquitectura](#-arquitectura)
3. [Día 1: Base de Datos](#-día-1-base-de-datos--funciones)
4. [Día 2: API con Function Calling](#-día-2-api-con-function-calling)
5. [Día 3: Interfaz de Usuario](#-día-3-interfaz-de-usuario)
6. [Cómo Probar](#-cómo-probar)
7. [Separación de Responsabilidades](#-separación-de-responsabilidades-chatbot-vs-planificador)

---

## 🎯 Resumen General

El **Chatbot IA de Furgocasa** es un asistente virtual que permite a los usuarios buscar áreas para autocaravanas usando **lenguaje natural en español**.

### Características Principales
- 💬 **Conversación en lenguaje natural** (español)
- 🔍 **Búsqueda inteligente** con OpenAI GPT-4o-mini
- 📍 **Geolocalización** ("áreas cerca de mí")
- 🎯 **Recomendaciones personalizadas**
- 🌍 **Búsqueda por país/región**
- 🔒 **Acceso exclusivo para usuarios registrados**
- 💾 **Historial de conversaciones**
- 📱 **Botón flotante** accesible desde todas las páginas

### Tecnologías Utilizadas
- **Backend:** Next.js 14 API Routes
- **IA:** OpenAI GPT-4o-mini con Function Calling
- **Base de Datos:** PostgreSQL (Supabase)
- **Frontend:** React + TypeScript + Tailwind CSS
- **Autenticación:** Supabase Auth

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     USUARIO                             │
│                  (Navegador Web)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              ChatbotWidget.tsx                          │
│   (Botón flotante + Ventana de chat + Modal bloqueo)   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          API Route: /api/chatbot (POST)                 │
│  - Recibe mensaje del usuario                           │
│  - Carga configuración desde chatbot_config             │
│  - Llama a OpenAI con Function Calling                  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ search_  │  │ get_area │  │ get_areas│
│  areas() │  │ details()│  │ by_country│
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL (Supabase)                      │
│  - chatbot_config                                       │
│  - chatbot_conversaciones                               │
│  - chatbot_mensajes                                     │
│  - chatbot_analytics                                    │
│  - areas (tabla principal)                              │
│  - areas_cerca() (función geográfica)                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Día 1: Base de Datos + Funciones

### Archivos Creados
- `supabase/migrations/chatbot_schema.sql` - Schema completo
- `lib/chatbot/functions.ts` - Funciones TypeScript para consultar la BD
- `supabase/migrations/TEST_chatbot_funciones.sql` - Tests SQL

### 1. Tablas Creadas

#### `chatbot_config`
Configuración del asistente IA.

**Columnas principales:**
- `nombre` - Identificador único (ej: "asistente_principal")
- `descripcion` - Descripción del asistente
- `modelo` - Modelo de IA (ej: "gpt-4o-mini")
- `temperature` - Creatividad (0-1)
- `max_tokens` - Longitud máxima de respuesta
- `system_prompt` - Instrucciones completas para la IA
- `contexto_inicial` - Contexto sobre la base de datos
- `instrucciones_busqueda` - Cómo buscar áreas
- Capacidades: `puede_geolocalizar`, `puede_buscar_areas`, etc.
- Límites: `max_mensajes_por_sesion`, `max_areas_por_respuesta`, etc.

#### `chatbot_conversaciones`
Historial de conversaciones.

**Columnas principales:**
- `id` - UUID único
- `user_id` - Usuario autenticado (FK a auth.users)
- `sesion_id` - ID de sesión (para anónimos)
- `titulo` - Título auto-generado
- `total_mensajes` - Contador
- `ubicacion_usuario` - GPS (JSONB)
- `preferencias_detectadas` - Servicios, precios (JSONB)
- `areas_consultadas` - IDs de áreas mencionadas (JSONB array)
- `ultimo_mensaje_at` - Para ordenar
- `activa` - Si está activa

#### `chatbot_mensajes`
Mensajes individuales.

**Columnas principales:**
- `id` - UUID
- `conversacion_id` - FK a chatbot_conversaciones
- `rol` - 'user' | 'assistant' | 'system'
- `contenido` - Texto del mensaje
- `funcion_llamada` - Nombre de función ejecutada
- `funcion_args` - Argumentos de la función (JSONB)
- `funcion_resultado` - Resultado (JSONB)
- `tokens_usados` - Consumo de tokens
- `areas_mencionadas` - Array de IDs de áreas
- `feedback` - 'positivo' | 'negativo' | null
- `tiempo_respuesta_ms` - Latencia

#### `chatbot_analytics`
Eventos y tracking.

**Columnas principales:**
- `id` - UUID
- `conversacion_id` - FK
- `evento` - Tipo de evento
- `metadatos` - Datos adicionales (JSONB)
- `error_mensaje` - Si hubo error

### 2. Función PostgreSQL: `areas_cerca()`

Busca áreas cercanas usando coordenadas GPS y la fórmula de Haversine.

**Firma:**
```sql
areas_cerca(
  lat_usuario DECIMAL,
  lng_usuario DECIMAL,
  radio_km INT DEFAULT 50
)
RETURNS TABLE (...)
```

**Retorna:** 20 áreas más cercanas dentro del radio, con distancia calculada en km.

### 3. Row Level Security (RLS)

**Políticas implementadas:**

- `chatbot_conversaciones`:
  - Los usuarios solo ven sus propias conversaciones
  - Solo pueden crear conversaciones propias

- `chatbot_mensajes`:
  - Solo pueden ver mensajes de sus conversaciones
  - Solo pueden insertar mensajes en sus conversaciones

- `chatbot_analytics`:
  - Solo pueden insertar eventos (lectura solo admin)

### 4. Funciones TypeScript (`lib/chatbot/functions.ts`)

#### `searchAreas(params)`
Búsqueda avanzada de áreas.

**Parámetros:**
```typescript
{
  ubicacion?: {
    nombre?: string        // "Barcelona", "Madrid"
    lat?: number          // Coordenadas GPS
    lng?: number
    radio_km?: number     // Radio de búsqueda (5-100 km)
  }
  servicios?: string[]    // ["agua", "electricidad", "wifi"]
  precioMax?: number      // null = solo gratis
  tipoArea?: string       // "camping", "parking", etc.
  pais?: string          // "España", "Portugal"
  limit?: number         // Máximo de resultados (default: 20)
}
```

**Lógica:**
1. Si hay `lat` y `lng` → Usa función `areas_cerca()`
2. Si hay `nombre` → Busca por `ciudad`, `provincia` o `pais`
3. Filtra por servicios (usando operador `@>` en JSONB)
4. Filtra por precio
5. Filtra por tipo de área
6. Filtra por país
7. Ordena por `google_rating` DESC
8. Retorna hasta `limit` resultados

#### `getAreaDetails(areaId)`
Obtiene todos los detalles de un área específica.

**Retorna:**
- Todos los campos de la tabla `areas`
- URL de Google Maps
- Fotos (array de URLs)
- Servicios completos
- Valoración de Google

#### `getAreasByCountry(pais, limit = 10)`
Top áreas de un país ordenadas por valoración.

**Retorna:**
- Las mejores áreas del país especificado
- Ordenadas por `google_rating` DESC

---

## 🚀 Día 2: API con Function Calling

### Archivos Creados
- `app/api/chatbot/route.ts` - API Route principal

### 1. Endpoint: POST `/api/chatbot`

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Áreas cerca de Barcelona" }
  ],
  "conversacionId": "uuid-opcional",
  "ubicacionUsuario": { "lat": 41.3851, "lng": 2.1734 }
}
```

**Response:**
```json
{
  "message": "¡Perfecto! He encontrado 5 áreas cerca de Barcelona...",
  "areas": [
    {
      "id": "uuid",
      "nombre": "Área Barcelona Centro",
      "ciudad": "Barcelona",
      "pais": "España",
      "precio_noche": 15,
      "google_rating": 4.5
    }
  ]
}
```

### 2. Function Calling: Schema

El API define 3 funciones que OpenAI puede llamar:

#### `search_areas`
```json
{
  "name": "search_areas",
  "description": "Busca áreas para autocaravanas basándose en ubicación, servicios, precio, tipo. Usa SIEMPRE esta función cuando el usuario pregunte por áreas en algún lugar.",
  "parameters": {
    "type": "object",
    "properties": {
      "ubicacion": {
        "type": "object",
        "properties": {
          "nombre": { "type": "string" },
          "lat": { "type": "number" },
          "lng": { "type": "number" },
          "radio_km": { "type": "number" }
        }
      },
      "servicios": { "type": "array", "items": { "type": "string" } },
      "precio_max": { "type": "number" },
      "tipo_area": { "type": "string" },
      "pais": { "type": "string" }
    }
  }
}
```

#### `get_area_details`
```json
{
  "name": "get_area_details",
  "description": "Obtiene información COMPLETA de un área específica por su ID. Usa esta función cuando el usuario pida detalles o más información sobre un área concreta.",
  "parameters": {
    "type": "object",
    "properties": {
      "area_id": { "type": "string" }
    },
    "required": ["area_id"]
  }
}
```

#### `get_areas_by_country`
```json
{
  "name": "get_areas_by_country",
  "description": "Lista las mejores áreas de un país específico. Usa cuando pregunten '¿qué hay en [país]?' o 'mejores áreas de [país]'.",
  "parameters": {
    "type": "object",
    "properties": {
      "pais": { "type": "string" },
      "limit": { "type": "number" }
    },
    "required": ["pais"]
  }
}
```

### 3. Flujo de Ejecución

```
1. Usuario envía mensaje → POST /api/chatbot
2. API carga configuración desde chatbot_config
3. Primera llamada a OpenAI:
   - Mensajes del usuario + system prompt + funciones disponibles
   - OpenAI decide si necesita llamar una función
4. Si hay function_call:
   a. API extrae nombre y argumentos
   b. API ejecuta función TypeScript correspondiente
   c. API obtiene resultados de la BD
5. Segunda llamada a OpenAI:
   - Mensajes anteriores + resultado de la función
   - OpenAI genera respuesta en lenguaje natural
6. API guarda mensajes en chatbot_mensajes
7. API retorna respuesta al usuario
```

### 4. Geolocalización Automática

Si el usuario dice "cerca de mí" y la app tiene `ubicacionUsuario`:

```typescript
if (functionName === 'search_areas' && ubicacionUsuario) {
  if (!functionArgs.ubicacion) {
    functionArgs.ubicacion = {}
  }
  if (!functionArgs.ubicacion.lat) {
    functionArgs.ubicacion.lat = ubicacionUsuario.lat
    functionArgs.ubicacion.lng = ubicacionUsuario.lng
  }
}
```

### 5. Ejemplos de Tests

**Test 1: Búsqueda simple**
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Áreas cerca de Madrid" }
    ]
  }'
```

**Test 2: Con servicios**
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Áreas en Barcelona con electricidad y agua" }
    ]
  }'
```

**Test 3: Con geolocalización**
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Áreas cerca de mí" }
    ],
    "ubicacionUsuario": { "lat": 41.3851, "lng": 2.1734 }
  }'
```

---

## 🎨 Día 3: Interfaz de Usuario

### Archivos Creados
- `components/chatbot/ChatbotWidget.tsx` - Componente principal
- `app/layout.tsx` - Modificado para incluir el widget

### 1. ChatbotWidget: Componente React

**Estados principales:**
```typescript
const [isOpen, setIsOpen] = useState(false)              // Chat abierto/cerrado
const [user, setUser] = useState<any>(null)              // Usuario autenticado
const [messages, setMessages] = useState<Message[]>([])  // Historial
const [input, setInput] = useState('')                   // Input actual
const [sending, setSending] = useState(false)            // Enviando mensaje
const [conversacionId, setConversacionId] = useState<string | null>(null)
const [ubicacion, setUbicacion] = useState<{lat, lng} | null>(null)
```

### 2. Modal de Bloqueo (Usuario No Autenticado)

Si el usuario NO está autenticado, se muestra:

- Botón flotante **difuminado** (blur-sm)
- **Modal emergente** con:
  - Icono de candado + emoji 💬
  - Título: "Asistente IA Bloqueado"
  - Lista de beneficios del chatbot
  - Botón "Registrarme Gratis" → `/auth/register`
  - Botón "Ya tengo cuenta" → `/auth/login`
  - Texto: "100% gratis · IA avanzada · Acceso inmediato"

### 3. Chat Funcional (Usuario Autenticado)

#### Botón Flotante
```tsx
<button
  className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 
             text-white rounded-full p-4 shadow-2xl hover:scale-110 
             transition-transform z-50 animate-bounce"
>
  <span className="text-2xl">💬</span>
</button>
```

#### Ventana de Chat
```tsx
<div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl 
                shadow-2xl flex flex-col z-50 border border-gray-200 
                max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)]">
  
  {/* Header con gradiente */}
  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
    <h3>🤖 Asistente Furgocasa</h3>
    <p>IA · Respuestas en tiempo real</p>
  </div>
  
  {/* Área de mensajes */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
    {/* Mensajes aquí */}
  </div>
  
  {/* Input */}
  <div className="p-4 border-t bg-white">
    <input placeholder="Pregunta lo que necesites..." />
    <button>Enviar</button>
  </div>
</div>
```

### 4. Renderizado de Áreas

Cuando el chatbot retorna áreas, se muestran como **tarjetas clicables**:

```tsx
{msg.areas && msg.areas.length > 0 && (
  <div className="mt-3 space-y-2">
    {msg.areas.slice(0, 3).map((area: any) => (
      <Link
        key={area.id}
        href={`/area/${area.slug}`}
        className="block bg-purple-50 hover:bg-purple-100 p-2 rounded-lg"
        target="_blank"
      >
        <strong>{area.nombre}</strong>
        <div className="text-xs mt-1">
          📍 {area.ciudad}, {area.pais}
          {area.precio_noche > 0 
            ? `💰 ${area.precio_noche}€` 
            : '💰 Gratis'}
        </div>
      </Link>
    ))}
  </div>
)}
```

### 5. Geolocalización del Navegador

```typescript
useEffect(() => {
  if (isOpen && user && !ubicacion) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacion({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('⚠️ No se pudo obtener ubicación')
        }
      )
    }
  }
}, [isOpen, user, ubicacion])
```

### 6. Mensaje de Bienvenida

```typescript
const iniciarConversacion = async () => {
  // ... crear conversación en BD ...
  
  setMessages([{
    rol: 'assistant',
    contenido: `¡Hola! 👋 Soy tu asistente de Furgocasa. ¿En qué puedo ayudarte hoy?

Puedo ayudarte a:
🔍 Encontrar áreas para tu autocaravana
📍 Recomendar las mejores ubicaciones
💡 Responder dudas sobre servicios y precios
🌍 Buscar áreas por país o región

💡 **Tip:** Si quieres planificar una ruta completa, usa nuestra herramienta 
🗺️ **Planificador de Rutas** en /ruta

¡Pregúntame lo que necesites! 🚐`
  }])
}
```

### 7. Integración en Layout

```typescript
// app/layout.tsx
import ChatbotWidget from '@/components/chatbot/ChatbotWidget'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <WelcomeModal />
        <ChatbotWidget />  {/* ← Widget global en todas las páginas */}
        {children}
      </body>
    </html>
  )
}
```

---

## 🧪 Cómo Probar

### 1. Ejecutar el Script SQL

```bash
# En Supabase Dashboard > SQL Editor:
# Copiar y ejecutar: supabase/migrations/chatbot_schema.sql
```

**Verificar creación:**
```sql
SELECT * FROM chatbot_config;
SELECT COUNT(*) FROM chatbot_conversaciones;
SELECT COUNT(*) FROM chatbot_mensajes;
```

### 2. Iniciar el Servidor

```bash
npm run dev
```

### 3. Probar sin Autenticación

1. Abre http://localhost:3000
2. Verás el botón flotante 💬 en la esquina inferior derecha
3. Haz clic → Aparece el **modal de bloqueo**
4. Intenta registrarte o iniciar sesión

### 4. Probar con Autenticación

1. Regístrate en `/auth/register`
2. Inicia sesión en `/auth/login`
3. Haz clic en el botón flotante 💬
4. Se abre la ventana del chat
5. Prueba estas preguntas:
   - "Áreas cerca de Madrid"
   - "Busco áreas gratuitas en Portugal"
   - "¿Qué hay en Barcelona con electricidad?"
   - "Áreas cerca de mí" (si permites geolocalización)
   - "Mejores áreas de España"

### 5. Verificar en Base de Datos

```sql
-- Ver conversaciones creadas
SELECT * FROM chatbot_conversaciones 
ORDER BY created_at DESC LIMIT 5;

-- Ver mensajes de una conversación
SELECT rol, LEFT(contenido, 100) as contenido_preview, created_at
FROM chatbot_mensajes 
WHERE conversacion_id = 'tu-conversacion-id'
ORDER BY created_at ASC;

-- Ver analytics
SELECT evento, COUNT(*) 
FROM chatbot_analytics 
GROUP BY evento;
```

---

## 🔀 Separación de Responsabilidades: Chatbot vs Planificador

### 🤖 **CHATBOT IA**

#### ✅ LO QUE HACE:
- 🔍 Buscar áreas por ubicación específica
- 📍 Recomendar áreas según servicios/precio
- 🌍 Listar áreas por país
- 💡 Responder preguntas sobre áreas
- 📱 Búsqueda con geolocalización

#### ❌ LO QUE NO HACE:
- ❌ NO planifica rutas entre puntos
- ❌ NO calcula distancias entre ciudades
- ❌ NO encuentra áreas a lo largo de una ruta

#### 🔀 REDIRECCIÓN:
Si el usuario pregunta sobre rutas, el chatbot responde:

> "Para planificar rutas y encontrar áreas a lo largo de tu recorrido, usa nuestra herramienta especializada: 🗺️ **Planificador de Rutas** en /ruta. Allí podrás calcular rutas completas, añadir paradas y encontrar áreas en tu camino. 🚐"

### 🗺️ **PLANIFICADOR DE RUTAS**

#### ✅ LO QUE HACE:
- 📍 Planificar rutas (origen, destino, paradas)
- 🔍 Encontrar áreas a lo largo de la ruta
- 📏 Configurar radio de búsqueda
- 💾 Guardar rutas
- 🗂️ Recargar rutas guardadas
- 📊 Mostrar distancia y duración

### 📊 Comparación

| Característica | 🤖 Chatbot | 🗺️ Planificador |
|---|---|---|
| Búsqueda por ubicación | ✅ | ❌ |
| Recomendaciones IA | ✅ | ❌ |
| Planificar rutas | ❌ | ✅ |
| Áreas a lo largo de ruta | ❌ | ✅ |
| Guardar rutas | ❌ | ✅ |
| Conversación natural | ✅ | ❌ |
| Geolocalización | ✅ | ✅ |
| Acceso | 🔒 Registrados | 🔒 Registrados |
| Ubicación | Botón flotante | Página `/ruta` |

---

## 📝 Variables de Entorno Requeridas

```env
# OpenAI (Requerido para el Chatbot)
OPENAI_API_KEY=tu_openai_api_key

# Supabase (Requerido)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key  # Para la API del chatbot
```

---

## 🐛 Solución de Problemas

### Error: "Cannot read property 'id' of null"
**Causa:** Intentar acceder a `user.id` antes de que se cargue.  
**Solución:** Ya implementado con estado `loading`.

### Error: Modal no se cierra
**Causa:** Falta botón de cerrar.  
**Solución:** Ya implementado botón X en esquina.

### Error: Geolocalización no funciona
**Causa:** Usuario denegó permisos.  
**Solución:** El chatbot sigue funcionando sin ubicación.

### Error: "No rows returned" en script SQL
**Causa:** Tablas ya existen o script ya se ejecutó.  
**Solución:** Normal, el script es idempotente.

---

## ✅ Checklist de Implementación

- ✅ Schema SQL ejecutado en Supabase
- ✅ Funciones TypeScript creadas
- ✅ API Route implementada
- ✅ ChatbotWidget creado
- ✅ Modal de bloqueo para no autenticados
- ✅ Integrado en layout principal
- ✅ System prompt configurado
- ✅ Geolocalización implementada
- ✅ Variables de entorno configuradas
- ✅ Tests realizados
- ✅ Documentación completa

---

## 🚀 Próximos Pasos (Opcional)

### Dashboard Admin del Chatbot:
1. Panel de configuración
2. Analytics y estadísticas
3. Historial de conversaciones
4. Gestión de prompts

### Mejoras del Chatbot:
1. Sugerencias de búsqueda
2. Botones de acción rápida
3. Historial de conversaciones del usuario
4. Exportar conversaciones
5. Valorar respuestas (útil/no útil)

---

**🎉 ¡Chatbot IA completamente funcional con bloqueo para usuarios no autenticados!** 🚀

