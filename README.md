# 🚐 Mapa Furgocasa - Plataforma de Áreas para Autocaravanas

**Versión: BETA 1.0** 🎉

Plataforma web interactiva para descubrir y gestionar áreas de autocaravanas, campers y vehículos recreativos en España.

---

## 🌟 Características Principales

### Para Usuarios
- 🗺️ **Mapa Interactivo** con todas las áreas disponibles (Google Maps API)
- 🔍 **Búsqueda y Filtros** avanzados (servicios, precio, ubicación)
- 📍 **Información Detallada** de cada área (servicios, fotos, contacto)
- ⭐ **Sistema de Valoraciones** y comentarios
- 📝 **Registro de Visitas** con notas personales
- 💙 **Favoritos** para guardar tus áreas preferidas
- 🗺️ **Planificador de Rutas** con búsqueda de áreas cercanas
- 💾 **Rutas Guardadas** - Guarda y reutiliza tus rutas favoritas
- 👤 **Dashboard de Perfil** completo con:
  - Mis Visitas (con mapa interactivo)
  - Mis Valoraciones
  - Mis Favoritos
  - Mis Rutas Guardadas
- 📱 **Responsive Design** - Funciona en móvil, tablet y desktop
- 🌐 **Acceso Público** - No requiere registro para consultar áreas
- 🔔 **Notificaciones Toast** - Feedback elegante en todas las acciones

### Para Administradores
- ⚙️ **Panel de Administración** completo en `/admin`
- ➕ **Crear, Editar y Borrar** áreas
- 🔍 **Búsqueda Masiva** - Importar múltiples áreas desde Google Places
- 🛡️ **Detección Inteligente de Duplicados** - 7 criterios (GPS, nombre, dirección, fuzzy matching)
- 🤖 **Actualización Automática de Servicios** con IA (OpenAI + SerpAPI)
- ✨ **Enriquecimiento de Textos** con IA para descripciones
- 📸 **Búsqueda Automática de Imágenes** para cada área
- 📊 **Analytics** y estadísticas de uso
- 👥 **Gestión de Usuarios**

---

## 🛠️ Tecnologías

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Estilos:** Tailwind CSS
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Mapas:** Google Maps API (con Directions API para rutas)
- **IA:** OpenAI GPT-4o-mini
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
- ✅ Planificar rutas
- ❌ No puede valorar, favoritar, registrar visitas o guardar rutas

### Usuario Registrado
- ✅ Todo lo anterior
- ✅ Crear valoraciones y comentarios
- ✅ Guardar áreas favoritas
- ✅ Registrar visitas con notas
- ✅ Guardar rutas personalizadas
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

## 🗺️ Planificador de Rutas (NUEVO)

### Características
- 📍 **Origen, Destino y Paradas** - Planifica rutas complejas
- 🔍 **Búsqueda de Áreas** - Encuentra áreas a X km de tu ruta
- 📏 **Radio Configurable** - 5, 10, 20 o 50 km
- 💾 **Guardar Rutas** - Guarda tus rutas con nombre y descripción
- 🗂️ **Ver Rutas Guardadas** - Accede desde tu perfil
- 🔄 **Recargar Rutas** - Abre cualquier ruta guardada en el mapa
- 📊 **Información Detallada** - Distancia, duración, paradas
- 🗺️ **Google Maps Directions** - Rutas optimizadas

### Cómo Usar
1. Ve a `/ruta`
2. Introduce origen y destino (usa el autocompletado)
3. (Opcional) Añade paradas intermedias
4. Ajusta el radio de búsqueda
5. Haz clic en "Calcular Ruta"
6. Revisa las áreas encontradas en la ruta
7. (Opcional) Guarda la ruta para uso futuro
8. Desde tu perfil, puedes recargar cualquier ruta guardada

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

## 🎉 Novedades en BETA 1.0

### ✨ Características Principales
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
Versión BETA 1.0 - Octubre 2025

---

## 🙏 Agradecimientos

- Google Maps por la plataforma de mapas y rutas
- Supabase por la infraestructura
- OpenAI por las capacidades de IA
- La comunidad de autocaravanistas

---

## 📞 Soporte

Para dudas o problemas:
- Revisa la documentación en `/docs`
- Consulta los scripts SQL en `/supabase`
- Verifica la consola del navegador (F12)

---

**¡Feliz viaje! 🚐✨**

*Mapa Furgocasa - BETA 1.0*
