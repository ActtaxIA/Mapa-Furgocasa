# 🚐 Mapa Furgocasa - Plataforma de Áreas para Autocaravanas en Europa y LATAM

**Versión: 1.1.0 - PRODUCCIÓN** 🎉✅

> 🔴 **ENTORNO DE PRODUCCIÓN ACTIVA EN AWS AMPLIFY**
> - **URL:** https://www.mapafurgocasa.com
> - **Deploy automático:** Activado en cada push a `main`
> - **NO hay servidor de desarrollo local** - Cambios se despliegan automáticamente a producción

Plataforma web interactiva totalmente funcional para descubrir y gestionar áreas de autocaravanas, campers y vehículos recreativos en **Europa y Latinoamérica** (España, Portugal, Francia, Italia, Alemania, Argentina, Chile, Uruguay, Brasil, Colombia, Perú y más).

**Estado:** 🟢 **100% OPERATIVO** - Chatbot IA funcionando, Editor de prompts activo, Sistema completo en producción.

**Última actualización:** 7 de Noviembre 2025 - Búsqueda Google Places ampliada a 65 países (Europa + LATAM).

---

## 🌟 Características Principales

### Para Usuarios
- 🗺️ **Mapa Interactivo** con todas las áreas disponibles (Google Maps API)
- 🔍 **Búsqueda y Filtros** avanzados (servicios, precio, ubicación)
- 📍 **Información Detallada** de cada área (servicios, fotos, contacto)
- ⭐ **Sistema de Valoraciones** y comentarios
- 📝 **Registro de Visitas** con notas personales
- 💙 **Favoritos** para guardar tus áreas preferidas
- 🗺️ **Planificador de Rutas** 🔒 - La herramienta más potente (requiere registro)
- 💾 **Rutas Guardadas** - Guarda y reutiliza tus rutas favoritas
- 🤖 **"Tío Viajero IA" - Chatbot Inteligente** 🔒 ✅ - Búsqueda conversacional con IA, Function Calling y geolocalización (requiere registro)
- 👤 **Dashboard de Perfil** completo con:
  - Mis Visitas (con mapa interactivo)
  - Mis Valoraciones
  - Mis Favoritos
  - Mis Rutas Guardadas
- 📱 **Responsive Design** - Funciona en móvil, tablet y desktop
- 🌐 **Acceso Público** - Mapa y áreas sin registro, herramientas avanzadas con registro
- 🔔 **Notificaciones Toast** - Feedback elegante en todas las acciones

### Para Administradores
- ⚙️ **Panel de Administración** completo en `/admin`
- ➕ **Crear, Editar y Borrar** áreas
- 🔍 **Búsqueda Multi-campo** - Buscar por nombre, ciudad, dirección, provincia, país
- 🌍 **Filtros por País** - Sistema global con 25+ países normalizados
- 📊 **Ordenación de Columnas** - Click para ordenar cualquier columna
- 🔍 **Búsqueda Masiva** - Importar múltiples áreas desde Google Places
- 🛡️ **Detección Inteligente de Duplicados** - 7 criterios (GPS, nombre, dirección, fuzzy matching)
- 🤖 **Actualización Automática de Servicios** con IA (OpenAI + SerpAPI)
- ✨ **Enriquecimiento de Textos** con IA para descripciones (200+ caracteres)
- 📸 **Búsqueda Automática de Imágenes** para cada área
- 🎨 **Editor de Prompts IA** ✅ - Configuración visual de los 3 agentes de IA desde `/admin/configuracion`
- 💬 **Configuración del Chatbot** ✅ - Editor completo de prompts múltiples para el Tío Viajero IA
- 📊 **Analytics en Tiempo Real** ✨ **NUEVO v1.1** - Datos reales desde Supabase Auth + métricas de uso
- 👥 **Gestión de Usuarios Mejorada** ✨ **NUEVO v1.1** - Tabla optimizada con iconos de proveedor y ordenación inteligente
- 🗄️ **Base de Datos Normalizada** - 100% áreas con país y región/CCAA correctos
- 🚫 **Sin Caché** ✨ **NUEVO v1.1** - Datos siempre actualizados en panel admin

---

## 🛠️ Tecnologías

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Estilos:** Tailwind CSS
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Mapas:** Google Maps API (con Directions API para rutas)
- **IA:** OpenAI GPT-4o-mini (Chatbot + Function Calling)
- **Búsqueda Web:** SerpAPI
- **Lugares:** Google Places API

---

## 🚀 Instalación Rápida

### 1. Prerrequisitos

- Node.js 18+ 
- Cuenta de Supabase
- Google Maps API Key (requerido)
- (Opcional) API Keys: OpenAI, SerpAPI, Google Places

### 2. Directorio del Proyecto

**Ruta completa del proyecto:**
```
E:\Acttax Dropbox\Narciso Pardo\Acttax\EI - FURGOCASA\1 - ADMINISTRACION\7 - ACTIVOS\6 - MAPA FURGOCASA\NEW MAPA FURGOCASA
```

**IMPORTANTE:** Todos los comandos deben ejecutarse desde este directorio raíz del proyecto.

```powershell
cd "E:\Acttax Dropbox\Narciso Pardo\Acttax\EI - FURGOCASA\1 - ADMINISTRACION\7 - ACTIVOS\6 - MAPA FURGOCASA\NEW MAPA FURGOCASA"
```

### 3. Instalar Dependencias

```powershell
npm install
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```env
# Supabase (Requerido)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Google Maps (Requerido)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# Google Geocoding (Requerido para Chatbot - convierte GPS a ciudad/provincia)
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# Google Places (Opcional - para búsqueda de lugares)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=tu_google_places_key

# OpenAI (Opcional - para funciones de IA)
OPENAI_API_KEY=tu_openai_api_key

# SerpAPI (Opcional - para búsqueda web)
SERPAPI_KEY=tu_serpapi_key
```

### 5. Configurar Base de Datos

Ejecuta el schema SQL en Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Abre **SQL Editor**
3. Ejecuta los siguientes scripts en orden:

```bash
# 1. Schema principal (obligatorio)
supabase/schema.sql

# 2. Tabla de rutas (obligatorio para el planificador)
supabase/add-rutas-table.sql

# 3. Permisos de administrador (obligatorio si usarás /admin)
supabase/FIX-admin-permisos-v3-SIMPLE.sql
```

### 6. Crear Usuario Administrador

En Supabase Dashboard:
1. Ve a **Authentication** → **Users**
2. Crea un nuevo usuario o selecciona uno existente
3. Edita el usuario y añade en **User Metadata**:
```json
{
  "is_admin": true
}
```

### 7. Despliegue en Producción

Esta aplicación está configurada para funcionar **únicamente en producción** a través de AWS Amplify.

**No se desarrolla localmente**. Todos los cambios se despliegan directamente:

```bash
git add .
git commit -m "descripción de cambios"
git push origin main
```

Amplify desplegará automáticamente en: `https://www.mapafurgocasa.com`

---

## 📁 Estructura del Proyecto

```
NEW MAPA FURGOCASA/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Rutas públicas
│   │   ├── mapa/                 # Mapa principal
│   │   ├── ruta/                 # Planificador de rutas
│   │   ├── area/[slug]/          # Detalle de área
│   │   ├── auth/                 # Login, registro, etc.
│   │   └── perfil/               # Perfil de usuario
│   ├── admin/                    # Panel de administración
│   │   ├── areas/                # Gestión de áreas
│   │   ├── analytics/            # Estadísticas
│   │   └── users/                # Gestión de usuarios
│   ├── api/                      # API Routes
│   │   └── admin/                # Endpoints de admin
│   ├── globals.css               # Estilos globales + animaciones toast
│   └── layout.tsx                # Layout principal
├── components/                   # Componentes React
│   ├── admin/                    # Componentes de admin
│   ├── area/                     # Componentes de área
│   │   └── ValoracionesCompleto.tsx  # Sistema completo visitas + valoraciones
│   ├── layout/                   # Navbar, Footer
│   ├── mapa/                     # Componentes del mapa (Google Maps)
│   ├── perfil/                   # Componentes del dashboard de perfil
│   │   ├── DashboardStats.tsx    # Estadísticas del usuario
│   │   ├── VisitasTab.tsx        # Tab de visitas con mapa
│   │   ├── MapaVisitas.tsx       # Mapa interactivo de visitas
│   │   ├── ValoracionesTab.tsx   # Tab de valoraciones
│   │   ├── FavoritosTab.tsx      # Tab de favoritos
│   │   └── RutasTab.tsx          # Tab de rutas guardadas
│   ├── ruta/                     # Componentes del planificador
│   │   └── PlanificadorRuta.tsx  # Planificador completo con guardar rutas
│   └── ui/                       # Componentes UI reutilizables
│       └── Toast.tsx             # Sistema de notificaciones
├── hooks/                        # Custom React Hooks
│   └── useToast.ts               # Hook para notificaciones toast
├── lib/                          # Librerías y utilidades
│   └── supabase/                 # Clientes de Supabase
├── supabase/                     # Scripts SQL
│   ├── schema.sql                # Schema principal
│   ├── add-rutas-table.sql       # Tabla de rutas
│   ├── ROLLBACK-COMPLETO.sql     # Restaurar políticas
│   └── FIX-admin-permisos-v3-SIMPLE.sql  # Permisos admin
├── types/                        # Tipos TypeScript
│   ├── database.types.ts         # Tipos de BD (incluye Ruta)
│   └── ia-config.types.ts        # Tipos de config IA
├── public/                       # Archivos estáticos
└── docs/                         # Documentación
    ├── SOLUCION_ADMIN_AREAS_FINAL.md
    ├── INSTALACION_RAPIDA.md
    └── COMANDOS_UTILES.md
```

---

## 🔐 Roles y Permisos

### Usuario Público (Sin Autenticación)
- ✅ Ver mapa con todas las áreas activas
- ✅ Ver detalles de áreas
- ✅ Usar filtros y búsqueda
- 🔒 **PLANIFICADOR DE RUTAS BLOQUEADO** - Requiere registro (la herramienta más potente)
- ❌ No puede valorar, favoritar, registrar visitas o guardar rutas

### Usuario Registrado
- ✅ Todo lo anterior
- ✅ **Acceso completo al Planificador de Rutas** 🎉
- ✅ Guardar rutas personalizadas
- ✅ Crear valoraciones y comentarios
- ✅ Guardar áreas favoritas
- ✅ Registrar visitas con notas
- ✅ Dashboard de perfil completo con estadísticas
- ✅ Ver historial de visitas en mapa
- ✅ Recargar rutas guardadas

### Administrador (`is_admin: true`)
- ✅ Todo lo anterior
- ✅ Acceso al panel `/admin`
- ✅ Crear, editar y borrar áreas
- ✅ Ver áreas inactivas
- ✅ Usar funciones de IA
- ✅ Ver analytics
- ✅ Gestionar usuarios

---

## 🗺️ Planificador de Rutas (NUEVO) 🔒

**La herramienta más potente de la app - Requiere registro gratuito**

### Características
- 📍 **Origen, Destino y Paradas** - Planifica rutas complejas
- 🔍 **Búsqueda de Áreas** - Encuentra áreas a X km de tu ruta
- 📏 **Radio Configurable** - 5, 10, 20 o 50 km
- 💾 **Guardar Rutas** - Guarda tus rutas con nombre y descripción
- 🗂️ **Ver Rutas Guardadas** - Accede desde tu perfil
- 🔄 **Recargar Rutas** - Abre cualquier ruta guardada en el mapa
- 📊 **Información Detallada** - Distancia, duración, paradas
- 🗺️ **Google Maps Directions** - Rutas optimizadas
- 🔒 **Acceso Exclusivo** - Solo para usuarios registrados

### Cómo Usar
1. **Regístrate gratis** en la plataforma (si no lo has hecho)
2. Ve a `/ruta`
3. Introduce origen y destino (usa el autocompletado)
4. (Opcional) Añade paradas intermedias
5. Ajusta el radio de búsqueda
6. Haz clic en "Calcular Ruta"
7. Revisa las áreas encontradas en la ruta
8. (Opcional) Guarda la ruta para uso futuro
9. Desde tu perfil, puedes recargar cualquier ruta guardada

### ¿Por qué requiere registro?
- 💾 Guardar tus rutas personalizadas
- 📊 Acceso a estadísticas de uso
- 🎯 Mejor experiencia personalizada
- 🔄 Sincronización entre dispositivos

---

## 🤖 Tío Viajero IA - Asistente Chatbot (NUEVO) 🔒

**Búsqueda inteligente en lenguaje natural - Requiere registro gratuito**

### Características Principales
- 💬 **Conversación Natural** - Pregunta en español como a un amigo
- 🔍 **Búsqueda Inteligente** - Encuentra áreas con IA (OpenAI GPT-4o-mini)
- 📍 **Geolocalización GPS** - Busca "áreas cerca de mí" con tu ubicación real
- 🌍 **Geocoding Automático** - Convierte tu GPS en ciudad/provincia
- 🧠 **Memoria de Conversación** - Recuerda lo que hablasteis antes
- 🎯 **Recomendaciones Personalizadas** - Basadas en tus necesidades
- 🌍 **Búsqueda por País** - "¿Qué hay en Portugal?"
- 💡 **Respuestas Instantáneas** - 24/7 disponible
- 📱 **Botón Flotante** - Accesible desde cualquier página
- 🔒 **Acceso Exclusivo** - Solo para usuarios registrados

### Tecnología Avanzada
- **Function Calling de OpenAI** - La IA decide qué funciones usar
- **Geocoding Reverso** - GPS → Ciudad automáticamente (Google Maps API)
- **Historial Contextual** - Carga últimos 10 mensajes de la conversación
- **Estadísticas en Tiempo Real** - Sabe cuántas áreas hay en cada país
- **Contexto Enriquecido** - Ubicación del usuario, estadísticas de BD, historial

### Lo que PUEDE hacer
- ✅ Buscar áreas por ubicación específica
- ✅ Recomendar áreas según servicios (agua, electricidad, WiFi, etc.)
- ✅ Filtrar por precio ("áreas gratuitas", "máximo 10€")
- ✅ Listar mejores áreas de un país
- ✅ Obtener detalles completos de un área
- ✅ Responder preguntas sobre servicios

### Lo que NO hace (usa el Planificador de Rutas para esto)
- ❌ NO planifica rutas entre ciudades
- ❌ NO calcula distancias
- ❌ NO encuentra áreas a lo largo de una ruta
- 🔀 **Redirige** al Planificador de Rutas cuando preguntas sobre rutas

### Ejemplos de Preguntas
- "Áreas cerca de Barcelona con electricidad"
- "Busco áreas gratuitas en Portugal"
- "¿Qué hay cerca de mí?"
- "Mejores áreas de España"
- "Áreas con WiFi y mascotas permitidas"
- "Cuéntame sobre el Área Camping del Mar"

### ¿Por qué requiere registro?
- 💬 Historial de conversaciones
- 📍 Geolocalización personalizada
- 🎯 Recomendaciones basadas en tu perfil
- 💾 Guardar áreas recomendadas como favoritas
- 🔄 Sincronización entre dispositivos

---

## 👤 Dashboard de Perfil (NUEVO)

### Mis Visitas
- Lista completa de áreas visitadas
- Mapa interactivo mostrando todas tus visitas
- Fecha de visita y notas personales
- Estadística total de visitas

### Mis Valoraciones
- Todas tus valoraciones y comentarios
- Puntuación dada a cada área
- Fecha de valoración
- Contador total

### Mis Favoritos
- Áreas marcadas como favoritas
- Acceso rápido a información
- Botón para quitar de favoritos
- Contador total

### Mis Rutas
- Todas tus rutas guardadas
- Información completa (origen, destino, paradas)
- Distancia y duración
- **Botón "Ver en Mapa"** - Recarga la ruta completa
- Marcar como favorita
- Eliminar rutas
- Contador total

---

## 🤖 Funciones de IA

### 1. Actualizar Servicios (`/admin/areas/actualizar-servicios`)
- Busca información en web sobre cada área (SerpAPI)
- Analiza los resultados con IA (OpenAI)
- Detecta servicios disponibles automáticamente
- Actualiza la base de datos

### 2. Enriquecer Textos (`/admin/areas/enriquecer-textos`)
- Genera descripciones detalladas y atractivas
- Incluye información turística de la zona
- Estilo natural y profesional
- 400-600 palabras por descripción

### 3. Enriquecer Imágenes (`/admin/areas/enriquecer-imagenes`)
- Busca imágenes de Google para cada área
- Selecciona las mejores fotos
- Las añade automáticamente a la galería
- Hasta 7 imágenes por área

**Configuración:**
Todas las funciones de IA son configurables desde `/admin/configuracion` con prompts flexibles.

---

## 🗺️ Características del Mapa

- **Mapa Base:** Google Maps
- **Marcadores Personalizados** según tipo de área
- **InfoWindows** con información detallada y fotos
- **Geolocalización** del usuario
- **Búsqueda por Ubicación**
- **Filtros en Tiempo Real**
- **Directions API** para rutas optimizadas
- **Lugares API** para autocompletado de direcciones

---

## 📊 Base de Datos

### Tablas Principales

- **areas** - Información de áreas para autocaravanas
- **valoraciones** - Comentarios y puntuaciones
- **favoritos** - Áreas favoritas de usuarios
- **visitas** - Registro de visitas con notas
- **rutas** - Rutas guardadas por usuarios (NUEVO)
- **ia_config** - Configuración de agentes IA
- **user_analytics** - Eventos y estadísticas

**Row Level Security (RLS):**
- ✅ Habilitado en todas las tablas
- ✅ Políticas optimizadas para rendimiento
- ✅ Acceso público controlado
- ✅ Los usuarios solo ven sus propios datos privados

---

## 🎨 Sistema de Notificaciones

### Toast Notifications
- ✅ Notificaciones elegantes en la interfaz
- ✅ 3 tipos: success, error, info
- ✅ Auto-cierre a los 3 segundos
- ✅ Cierre manual con botón X
- ✅ Animaciones suaves (fade in/out)
- ❌ Sin más `alert()` del sistema

**Uso en el código:**
```typescript
import { useToast } from '@/hooks/useToast'

const { showToast } = useToast()
showToast('Mensaje exitoso', 'success')
showToast('Ocurrió un error', 'error')
```

---

## 🚨 Troubleshooting

### Las áreas no se ven en el mapa
**Solución:** Verifica que las áreas tengan `activo = true` en Supabase

### No puedo acceder a /admin
**Solución:** Verifica que tu usuario tenga `is_admin: true` en User Metadata

### Error al borrar/editar áreas
**Solución:** Ejecuta `supabase/FIX-admin-permisos-v3-SIMPLE.sql`

### Las funciones de IA no funcionan
**Solución:** Verifica que tienes las API Keys configuradas en `.env.local`

### El mapa no carga
**Solución:** Verifica que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté configurada correctamente

### No puedo guardar rutas
**Solución:** Ejecuta `supabase/add-rutas-table.sql` en tu base de datos

### Las visitas no aparecen en mi perfil
**Solución:** Verifica que estés autenticado y que las RLS policies estén correctas

---

## 📝 Scripts Útiles

**IMPORTANTE:** Ejecutar desde el directorio del proyecto:
```powershell
cd "E:\Acttax Dropbox\Narciso Pardo\Acttax\EI - FURGOCASA\1 - ADMINISTRACION\7 - ACTIVOS\6 - MAPA FURGOCASA\NEW MAPA FURGOCASA"
```

Luego ejecutar los comandos:
```powershell
# Desarrollo
npm run dev

# Build de producción
npm run build

# Ejecutar producción
npm start

# Linting
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit
```

---

## 🔄 Migración desde SQLite

Si tienes datos en SQLite local, usa los scripts de migración:

```powershell
cd "E:\Acttax Dropbox\Narciso Pardo\Acttax\EI - FURGOCASA\1 - ADMINISTRACION\7 - ACTIVOS\6 - MAPA FURGOCASA\NEW MAPA FURGOCASA"
node scripts/migrate-to-supabase.js      # Migrar áreas
node scripts/migrate-users-to-supabase.js # Migrar usuarios
```

---

## 📚 Documentación

### 🎯 Guía Rápida de Documentación

**NUEVO:** Consulta el **[📋 Índice Completo de Documentación](./INDICE_DOCUMENTACION.md)** para navegar toda la documentación organizada por categorías.

### Documentos Esenciales

#### Instalación y Setup
- **[INSTALACION_RAPIDA.md](./INSTALACION_RAPIDA.md)** - Guía de instalación en 5 pasos
- **[COMANDOS_UTILES.md](./COMANDOS_UTILES.md)** - Comandos frecuentes de desarrollo
- **[CONFIGURACION_SUPABASE_URLS.md](./CONFIGURACION_SUPABASE_URLS.md)** - Configurar OAuth y URLs
- **[CONFIGURACION_SEO.md](./CONFIGURACION_SEO.md)** - 🆕 SEO, Sitemap XML y Robots.txt

#### Deployment y SEO
- **[GUIA_DEPLOYMENT_AWS.md](./GUIA_DEPLOYMENT_AWS.md)** - Guía completa de deployment en AWS Amplify
- **[GUIA_GOOGLE_SEARCH_CONSOLE.md](./GUIA_GOOGLE_SEARCH_CONSOLE.md)** - 🆕 Configuración paso a paso de Google Search Console
- **[FIX_IA_PRODUCCION.md](./FIX_IA_PRODUCCION.md)** - Solución de funciones IA en producción

#### Sistemas Principales
- **[SISTEMA_VISITAS_VALORACIONES_COMPLETO.md](./SISTEMA_VISITAS_VALORACIONES_COMPLETO.md)** - Visitas y valoraciones
- **[SISTEMA_DETECCION_DUPLICADOS.md](./SISTEMA_DETECCION_DUPLICADOS.md)** - 7 criterios anti-duplicados
- **[BUSQUEDA_MASIVA_AREAS.md](./BUSQUEDA_MASIVA_AREAS.md)** - Importación masiva desde Google Places
- **[SISTEMA_PROMPTS_FLEXIBLE.md](./SISTEMA_PROMPTS_FLEXIBLE.md)** - Configuración de IA

#### Soluciones Aplicadas
- **[SOLUCION_ADMIN_AREAS_FINAL.md](./SOLUCION_ADMIN_AREAS_FINAL.md)** - Permisos de administrador
- **[SOLUCION_FUNCIONES_IA_ADMIN.md](./SOLUCION_FUNCIONES_IA_ADMIN.md)** - Funciones de IA
- **[OAUTH_GOOGLE_SOLUCION_FINAL.md](./OAUTH_GOOGLE_SOLUCION_FINAL.md)** - OAuth redirect a producción

#### Debugging
- **[GUIA_DEBUGGING_IA.md](./GUIA_DEBUGGING_IA.md)** - Debugging de funciones IA paso a paso
- **[DIAGNOSTICO_GOOGLE_PLACES_API.md](./DIAGNOSTICO_GOOGLE_PLACES_API.md)** - Diagnóstico de Google Places API

### 📋 Otros Documentos

Para ver **TODA la documentación organizada** consulta:  
👉 **[INDICE_DOCUMENTACION.md](./INDICE_DOCUMENTACION.md)**

Incluye:
- 30+ documentos organizados por categoría
- Búsqueda por tema
- Flujos de trabajo comunes
- Estado y vigencia de cada documento

---

## 🎉 Novedades en v1.1 (Noviembre 2025)

### ✨ Panel de Administración Optimizado

1. **Gestión de Usuarios Mejorada** 👥
   - Tabla reorganizada con columnas separadas: Tipo | Nombre | Email | ID | Rol | Fecha | Último Acceso | Estado
   - Iconos visuales de proveedor (Google OAuth / Email)
   - Ordenación inteligente: usuarios más recientes primero por defecto
   - Todas las columnas ordenables individualmente
   - Datos en tiempo real desde Supabase Auth API
   - Sin caché: siempre muestra datos actualizados

2. **Analytics en Tiempo Real** 📊
   - Usuarios reales desde Supabase Auth (no hardcodeado)
   - **Nueva métrica**: Rutas Calculadas 🗺️
   - **Nueva métrica**: Distancia Total de rutas 🛣️ (en km)
   - **Nueva métrica**: Interacciones con IA 🤖 (mensajes chatbot)
   - Métricas de uso completas: ahora se mide TODO

3. **Sistema Sin Caché** 🚫
   - PWA configurado para no cachear APIs de admin
   - Headers HTTP de no-cache en todas las respuestas
   - Botón de recarga manual de datos
   - Página de limpieza de caché (`/clear-cache.html`)
   - Visualización de fecha Y hora en último acceso

### ✨ Características Anteriores (BETA 1.0)

1. **Planificador de Rutas Completo**
   - Integración con Google Maps Directions API
   - Búsqueda de áreas cercanas a la ruta
   - Guardar y recargar rutas

2. **Dashboard de Perfil de Usuario**
   - Vista completa de visitas con mapa
   - Gestión de valoraciones
   - Lista de favoritos
   - Rutas guardadas con recarga

3. **Sistema de Notificaciones Toast**
   - Notificaciones elegantes sin `alert()`
   - Feedback visual mejorado
   - Animaciones suaves

4. **Mejoras en el Mapa**
   - Migración completa a Google Maps API
   - InfoWindows mejoradas con fotos
   - Mejor rendimiento y UX

5. **Sistema Completo de Visitas y Valoraciones**
   - Registro de visitas con notas
   - Valoraciones con comentarios
   - Historial completo en perfil

---

## 🤝 Contribuir

Este es un proyecto personal, pero si encuentras bugs o tienes sugerencias:

1. Abre un Issue
2. Describe el problema o mejora
3. (Opcional) Envía un Pull Request

---

## 📄 Licencia

Este proyecto es de uso personal y educativo.

---

## 👨‍💻 Autor

**Narciso Pardo Buendía**
- Versión 1.1 - Noviembre 2025
- Versión BETA 1.0 - Octubre 2025

---

## 🙏 Agradecimientos

- Google Maps por la plataforma de mapas y rutas
- Supabase por la infraestructura
- OpenAI por las capacidades de IA
- La comunidad de autocaravanistas

---

## 📊 Estadísticas del Sistema

### Base de Datos Global
- 🌍 **25+ países** con áreas normalizadas
- 🗺️ **100+ regiones** administrativas mapeadas (CCAA, Länder, Regioni, States, etc.)
- 📍 **13,850+ áreas** con datos geográficos estructurados
- ✅ **100% cobertura** de país y región para todas las áreas activas

### Países Incluidos
**🇪🇺 Europa:** España, Francia, Alemania, Italia, Portugal, Austria, Suiza, Bélgica, Países Bajos, Reino Unido, Polonia, Chequia, Croacia, Noruega, Suecia, Dinamarca, Grecia, Eslovenia, y más

**🌎 América:** Estados Unidos, México, Argentina, Chile, Brasil, Colombia, Perú

**🌏 Oceanía:** Australia, Nueva Zelanda

**🌍 África:** Marruecos

---

## 📚 Documentación Completa

Para más información, consulta:
- **[INDICE_DOCUMENTACION.md](./INDICE_DOCUMENTACION.md)** - Índice completo de 30+ documentos
- **[CHANGELOG.md](./CHANGELOG.md)** - Registro detallado de cambios
- **[MEJORAS_FILTROS_Y_NORMALIZACION.md](./MEJORAS_FILTROS_Y_NORMALIZACION.md)** - Última actualización (29-oct-2025)

---

## 📞 Soporte

Para dudas o problemas:
- Revisa la **[documentación completa](./INDICE_DOCUMENTACION.md)**
- Consulta los scripts SQL en `/supabase`
- Verifica la consola del navegador (F12)

---

**¡Feliz viaje! 🚐✨**

*Mapa Furgocasa - v1.1.0 - Sistema Global en Producción*
