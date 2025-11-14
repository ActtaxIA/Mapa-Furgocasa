# 📋 Changelog - Mapa Furgocasa

Todos los cambios importantes del proyecto se documentan en este archivo.

---

## [2.1.2] - 2025-11-14 🤖💰

### 🎯 SISTEMA DE VALORACIÓN CON IA

Implementación completa de valoración profesional de vehículos utilizando GPT-4 y búsqueda automática de comparables reales en internet.

### ✅ Agregado

#### Sistema de Valoración IA 🤖
- **Generación automática de informes** - GPT-4 analiza el vehículo y crea un informe profesional de 400-700 palabras
- **3 precios estratégicos** - Precio de salida (negociación), precio objetivo (realista), precio mínimo (límite)
- **Búsqueda de comparables** - SerpAPI busca anuncios similares en Milanuncios, Wallapop, etc.
- **Informe estructurado en 7 secciones**:
  1. Introducción al vehículo
  2. Precio nuevo para particular (con impuestos)
  3. Depreciación por tiempo y uso
  4. Valor de extras instalados
  5. Comparación con mercado actual
  6. Precios recomendados (salida/objetivo/mínimo)
  7. Conclusión y justificación
- **Historial completo** - Guarda todas las valoraciones con fecha para ver evolución temporal
- **Análisis de datos** - Considera precio compra, km, antigüedad, mejoras, averías, datos mercado

#### Nueva Tabla BD: `valoracion_ia_informes` 📊
```sql
- id (UUID)
- vehiculo_id (FK a vehiculos_registrados)
- user_id (FK a auth.users)
- fecha_valoracion (TIMESTAMPTZ)
- precio_salida, precio_objetivo, precio_minimo (NUMERIC)
- informe_texto (TEXT Markdown)
- comparables_json (JSONB - array de anuncios)
- num_comparables (INT)
- nivel_confianza (TEXT: Alta/Media/Baja)
- precio_base_mercado (NUMERIC)
- depreciacion_aplicada (NUMERIC %)
```

#### Trigger Automático 🔄
- **`trigger_actualizar_valor_desde_ia`** - Actualiza automáticamente `vehiculo_valoracion_economica` cuando se genera nueva valoración IA
- Mantiene `valor_estimado_actual`, `fecha_ultima_valoracion`, `ultima_valoracion_ia_id`

#### API Endpoint: `/api/vehiculos/[id]/ia-valoracion` 🚀
- **POST** - Genera nueva valoración (1-2 minutos):
  1. Recopila datos del vehículo (económicos, técnicos, averías, mejoras)
  2. Busca comparables con SerpAPI
  3. Construye prompt detallado
  4. Llama a GPT-4
  5. Extrae 3 precios del informe
  6. Guarda en BD con historial
- **GET** - Obtiene historial de valoraciones del vehículo

#### Biblioteca: `lib/valoracion/buscar-comparables.ts` 🔍
- Construye queries de búsqueda optimizadas
- Llama a SerpAPI
- Parsea resultados (título, precio, km, año, URL)
- Calcula relevancia de cada comparable
- Ordena y filtra duplicados
- Devuelve array de anuncios reales

#### Componente: `InformeValoracionIA.tsx` 📄
- **3 pestañas**:
  - 📄 Informe Completo (Markdown renderizado)
  - 🔍 Comparables (lista con enlaces externos)
  - 📊 Datos Técnicos (métricas y estadísticas)
- **Cards destacadas** para los 3 precios (verde, azul, naranja)
- **Botón "Poner en Venta"** - Redirige a tab venta con precio sugerido
- **Diseño profesional** con gradientes y animaciones

#### UI del Vehículo: Nueva Tab "Valoración IA" ✨
- **Icono dorado** (SparklesIconSolid)
- **Sección introductoria** explicando el servicio
- **Botón "Generar Valoración"** con confirmación y loading state
- **Estado vacío** elegante cuando no hay valoraciones
- **Historial** de todas las valoraciones generadas
- **Carga automática** al activar la tab

#### Analytics Admin 📊
- Corrección campo `año` → `ano` (sin ñ) en distribución por años
- Ahora funciona correctamente la visualización de antigüedad de vehículos

### 🔧 Modificado

#### Archivos Creados
- `lib/valoracion/buscar-comparables.ts` - Lógica de búsqueda SerpAPI
- `app/api/vehiculos/[id]/ia-valoracion/route.ts` - API endpoint
- `components/vehiculo/InformeValoracionIA.tsx` - Componente visualización

#### Archivos Modificados
- `app/(public)/vehiculo/[id]/page.tsx` - Nueva tab + funciones de valoración
- `app/admin/analytics/page.tsx` - Corrección campo `ano` en distribución por años
- `package.json` - Agregada dependencia `react-markdown`

### 📚 Técnico

#### Flujo Completo de Valoración
```
1. Usuario → Tab "Valoración IA" → Click "Generar"
2. API recopila datos del vehículo desde múltiples tablas
3. SerpAPI busca 10-20 anuncios similares en internet
4. GPT-4 recibe prompt de 2000+ tokens con toda la info
5. GPT-4 genera informe profesional narrativo
6. API extrae 3 precios con regex del informe
7. Se guarda en valoracion_ia_informes con fecha
8. Trigger actualiza vehiculo_valoracion_economica
9. Frontend muestra informe completo + comparables
```

#### Row Level Security (RLS)
- Usuarios ven solo sus valoraciones: `user_id = auth.uid()`
- Admins ven todas: `role = 'admin'`
- Cada valoración vinculada por UUID del vehículo (no matrícula)

#### Variables de Entorno Requeridas
```bash
OPENAI_API_KEY=sk-proj-...     # GPT-4
SERPAPI_KEY=...                 # Búsqueda comparables
```

### 🎯 Casos de Uso

#### Para Usuarios
- Saber el valor real de su vehículo antes de vender
- Obtener 3 precios estratégicos respaldados por datos
- Ver exactamente qué comparables se usaron
- Argumentos sólidos para negociaciones
- Seguir evolución del valor con el tiempo

#### Para Furgocasa (Admin)
- Ver todas las valoraciones de todos los usuarios
- Analizar precios del mercado secundario
- Detectar oportunidades de compra/venta
- Base de datos de precios reales acumulada
- Insights para estrategia de precios

### 🐛 Correcciones
- **Campo año** en analytics ahora consulta `ano` (sin ñ) correctamente
- **Distribución por años** funciona en `/admin/analytics` → tab Vehículos

---

## [2.1.1] - 2025-11-13 ✅💰

### 🐛 Correcciones Críticas - Sistema de Venta

#### ✅ Sistema de Registro de Venta FUNCIONANDO
- **Problema resuelto:** Error 500 al registrar venta de vehículo
- **Causa:** Uso incorrecto de `vehiculo_id` en UPDATE en lugar de `id` del registro
- **Solución:** Cambiado a usar `.eq('id', existingData.id)` igual que DatosCompraTab
- **Resultado:** ✅ Venta se registra correctamente con todos los datos económicos

#### 🔧 Mejoras en API de Venta
- ✅ Logs detallados en cada paso para debugging
- ✅ Validación estricta de campos requeridos (precio, fecha)
- ✅ Validación de formato de fecha (YYYY-MM-DD)
- ✅ Validación de tipos de datos (precio numérico válido)
- ✅ Cálculo automático de rentabilidad y coste anual
- ✅ Campos opcionales solo se añaden si tienen valor
- ✅ Eliminado `updated_at` manual (hay trigger automático)
- ✅ Mejor manejo de errores con detalles específicos (code, hint, message)

#### 🎯 Corrección en Gastos Adicionales
- ✅ Corregido campo de ordenación: `fecha_gasto` → `fecha`
- ✅ Coincide con el campo que envía el componente

#### 📊 Verificación Completa de Endpoints
- ✅ **Mantenimientos** - Tabla correcta, campos mapeados ✅
- ✅ **Averías** - Tabla correcta, campos mapeados ✅
- ✅ **Mejoras** - Tabla correcta, campos mapeados ✅
- ✅ **Gastos** - Tabla correcta, campos corregidos ✅
- ✅ **Venta** - Tabla correcta, UPDATE corregido ✅
- ✅ **Compra** - Tabla correcta, funcionando ✅

**Todos los endpoints ahora funcionan correctamente y usan el mismo patrón.**

---

## [2.1.0] - 2025-11-13 📸🚀

### 🎯 SISTEMA DE SUBIDA DIRECTA DE FOTOS A SUPABASE STORAGE

Solución definitiva al problema de AWS Amplify bloqueando `multipart/form-data`. Implementación completa de subida directa desde el frontend a Supabase Storage, bypasseando completamente AWS Amplify.

### ✅ Agregado

#### Subida Directa de Fotos 📸
- **Bypass completo de AWS Amplify** - Las fotos se suben directamente desde el navegador a Supabase Storage
- **Sin errores 403** - Eliminados todos los problemas de interception de API routes
- **Máximo 10MB por foto** (aumentado desde 5MB)
- **Subida en reportes de accidentes** - Hasta 5 fotos por reporte
- **Subida en vehículos** - Foto principal + hasta 9 adicionales (galería)
- **Validación en frontend** - Tamaño y cantidad antes de subir
- **URLs públicas** - Supabase Storage devuelve URLs públicas instantáneamente

#### Gestión Completa de Fotos 🗑️
- **Eliminar fotos ANTES de enviar** - Botón X en reportes y registro de vehículos
- **Eliminar fotos DESPUÉS** - Galería de vehículos con confirmación modal
- **Eliminación física** - Se borran de Supabase Storage + BD
- **Preview mejorado** - Muestra nombre y tamaño de cada foto
- **Feedback visual** - Toast notifications para todas las acciones

### 🔧 Modificado

#### Frontend
- `app/(public)/accidente/page.tsx` - Subida directa a Supabase Storage, botones de eliminar
- `components/perfil/MiAutocaravanaTab.tsx` - Subida directa de foto principal
- `components/vehiculo/GaleriaFotosTab.tsx` - Subida directa de fotos adicionales

#### Backend (API)
- `app/api/reportes/route.ts` - Recibe solo JSON con `fotos_urls[]` (no FormData)
- `app/api/vehiculos/route.ts` - Recibe solo JSON con `foto_url` (no FormData)
- `app/api/vehiculos/[id]/fotos/route.ts` - Recibe solo JSON con `foto_url`, DELETE físico

### 📚 Técnico

#### Flujo Nuevo (v2.1)
```
1. Usuario selecciona fotos
2. Frontend valida (tamaño, cantidad)
3. Frontend sube a Supabase Storage (directo)
4. Frontend obtiene URLs públicas
5. Frontend envía JSON con URLs a API
6. Backend guarda URLs en BD
```

#### Flujo Anterior (v2.0 - Fallaba)
```
1. Usuario selecciona fotos
2. Frontend envía FormData a API
3. AWS Amplify intercepta y bloquea (403)
4. ❌ FALLO
```

### 🎯 Ventajas
- ✅ **Más rápido** - Directo navegador → Supabase (sin API intermedia)
- ✅ **Sin límites** - No depende de límites de AWS Amplify
- ✅ **Confiable** - Supabase maneja millones de archivos sin problema
- ✅ **Escalable** - Preparado para crecimiento masivo
- ✅ **Mantenible** - Código más simple (solo JSON en API)

### 📊 Estado
- ✅ Reportes de accidentes: FUNCIONAL
- ✅ Registro de vehículos: FUNCIONAL
- ✅ Galería de fotos: FUNCIONAL
- ✅ Eliminación de fotos: FUNCIONAL

---

## [2.0.0] - 2025-11-12 🚀

### 🎯 SISTEMA COMPLETO DE GESTIÓN DE VEHÍCULOS Y VALORACIÓN AUTOMÁTICA

Versión mayor con sistema completo de gestión de autocaravanas, reportes de accidentes y valoración automática con IA.

### ✅ Agregado

#### Sistema de Reportes de Accidentes 🚨
- **Registro de vehículos** con matrícula, marca, modelo, año
- **QR único por vehículo** generado automáticamente
- **Página pública `/reporte/[qr_id]`** para que testigos reporten accidentes
- **Geolocalización automática** del accidente con Google Maps
- **Notificaciones automáticas** al propietario del vehículo
- **Gestión completa** desde el perfil de usuario
- **Información del testigo** (contacto directo)
- **Fotos del accidente** con upload a Supabase Storage

#### Gestión Integral de Vehículos 🚐
- **6 nuevas tablas SQL:**
  - `mantenimientos` - Historial completo (ITV, aceite, revisiones)
  - `averias` - Registro y seguimiento de averías
  - `vehiculo_documentos` - Biblioteca digital de documentos
  - `vehiculo_mejoras` - Registro de mejoras y personalizaciones
  - `vehiculo_kilometraje` - Control de consumo y kilometraje
  - `vehiculo_ficha_tecnica` - Datos técnicos completos
- **Dashboard del vehículo** con estadísticas y accesos rápidos
- **Alertas próximas** (mantenimientos y documentos a vencer)
- **Desglose de costes** completo

#### Sistema de Valoración Económica 💰
- **4 nuevas tablas SQL:**
  - `vehiculo_valoracion_economica` - Control financiero completo
  - `datos_mercado_autocaravanas` - Base de datos pública de precios
  - `historico_precios_usuario` - Evolución del valor en el tiempo
  - `gastos_adicionales` - Seguros, impuestos, parking, etc.
- **2 vistas SQL** para análisis económico
- **30+ triggers automáticos** para cálculos y validaciones
- **20+ funciones SQL** de análisis e IA

#### Valoración Automática con IA 🤖
- **Algoritmo propio de valoración** basado en datos reales de mercado
- **Función SQL:** `calcular_valoracion_automatica()` con múltiples factores:
  - Precio base de mercado (ventas reales)
  - Depreciación por años (15% primeros 5 años, 10% después)
  - Ajuste por kilometraje (penaliza/bonifica según uso)
  - Ajuste por estado (penaliza por averías graves)
  - Nivel de confianza (Alta/Media/Baja según datos)
- **3 rangos de precio:** Venta rápida (-10%), Precio justo, Precio óptimo (+10%)
- **Comparativa con mercado** en tiempo real
- **Poner vehículo en venta** con un clic
- **Componente React:** `ValoracionVenta.tsx` con UI completa

#### Histórico de Valoraciones 📊
- **Gráfico interactivo** con Recharts (evolución temporal)
- **Estadísticas de cambio** (valor inicial, actual, variación)
- **Valoraciones manuales** (tasaciones externas)
- **Múltiples fuentes** (automático, manual, tasación)
- **Componente React:** `HistoricoValoracion.tsx` con gráficos de área

#### Panel de Administración Avanzado 👨‍💼
- **9 funciones SQL de analytics:**
  - `admin_dashboard_metricas()` - KPIs principales
  - `admin_analisis_por_marca_modelo()` - Análisis por vehículo
  - `admin_distribucion_por_precio()` - Distribución económica
  - `admin_analisis_siniestralidad()` - Reportes de accidentes
  - `admin_top_modelos_mercado()` - Tendencias de mercado
  - `admin_averias_recurrentes()` - Problemas comunes
  - `admin_mejoras_populares()` - Mejoras más realizadas
  - `admin_consumo_real_vs_oficial()` - Comparativa de consumos
  - `admin_usuarios_top_contribuyentes()` - Usuarios más activos

#### Componentes React Nuevos
- `components/perfil/MiAutocaravanaTab.tsx` - Registro y gestión de vehículos
- `components/perfil/MisReportesTab.tsx` - Gestión de reportes recibidos
- `components/perfil/vehiculo/DashboardVehiculo.tsx` - Dashboard principal
- `components/perfil/vehiculo/ValoracionVenta.tsx` - Valoración automática
- `components/perfil/vehiculo/HistoricoValoracion.tsx` - Histórico con gráficos

#### API Endpoints Nuevos
- `GET /api/vehiculos` - Listar vehículos del usuario
- `POST /api/vehiculos` - Registrar nuevo vehículo
- `GET /api/vehiculos/buscar-qr` - Buscar vehículo por QR (público)
- `GET /api/vehiculos/[id]/valoracion` - Obtener valoración automática
- `PUT /api/vehiculos/[id]/venta` - Poner en venta
- `POST /api/vehiculos/[id]/venta` - Registrar venta final
- `GET /api/vehiculos/[id]/historico-valoracion` - Histórico de valoraciones
- `POST /api/vehiculos/[id]/historico-valoracion` - Añadir valoración manual
- `GET /api/reportes` - Listar reportes del usuario
- `POST /api/reportes` - Crear reporte (público)
- `PATCH /api/reportes/[id]` - Actualizar estado de reporte

### 🔧 Arreglado

#### TypeScript Errors
- **Google Maps types:** Usar tipos simplificados (`type GoogleMap = any`) como en otros componentes
- **createClient() async:** Añadir `await` en todas las API routes
- **Type casting:** Cast explícito para `ResumenEconomico`
- **Heroicons:** Usar `ArrowTrendingUpIcon` en lugar de `TrendingUpIcon`

#### Dependencias
- **qrcode:** Añadida dependencia `qrcode@^1.5.3` y `@types/qrcode@^1.5.5`
- **recharts:** Añadida dependencia `recharts@^2.10.3` para gráficos
- **package-lock.json:** Sincronizado con todas las nuevas dependencias

### 📚 Documentación

#### Nuevos Documentos
- `CHANGELOG_GESTION_VEHICULOS.md` - Changelog completo del sistema
- `docs/SISTEMA_VALORACION_VENTA.md` - Guía completa de valoración (639 líneas)
- `docs/PANEL_ADMIN_VEHICULOS.md` - Documentación del panel admin
- `reportes/README_GESTION_VEHICULOS.md` - Guía de implementación SQL
- `reportes/RESUMEN_SISTEMA_COMPLETO.md` - Resumen técnico completo

#### Documentos Actualizados
- `README.md` - Actualizado a v2.0.0 con todas las nuevas features
- `CHANGELOG.md` - Este archivo

### 🗄️ Base de Datos

#### Nuevas Tablas (13)
- `vehiculos_registrados` - Autocaravanas registradas
- `reportes_accidentes` - Reportes de testigos
- `notificaciones_reportes` - Historial de notificaciones
- `mantenimientos` - Historial de mantenimiento
- `averias` - Registro de averías
- `vehiculo_documentos` - Documentos digitales
- `vehiculo_mejoras` - Mejoras instaladas
- `vehiculo_kilometraje` - Control de kilometraje
- `vehiculo_ficha_tecnica` - Ficha técnica completa
- `vehiculo_valoracion_economica` - Control financiero
- `datos_mercado_autocaravanas` - Base de datos de mercado
- `historico_precios_usuario` - Histórico de valoraciones
- `gastos_adicionales` - Gastos adicionales

#### Nuevas Vistas (2)
- `resumen_economico_vehiculo` - Vista consolidada económica
- `estadisticas_mercado_por_modelo` - Estadísticas de mercado

#### Scripts SQL (12 archivos)
- `reportes/01_crear_tablas.sql` (162 líneas)
- `reportes/02_crear_triggers.sql` (109 líneas)
- `reportes/03_configurar_rls.sql` (131 líneas)
- `reportes/04_funciones_auxiliares.sql` (277 líneas)
- `reportes/05_gestion_vehiculos_tablas.sql` (390 líneas)
- `reportes/06_gestion_vehiculos_triggers.sql` (324 líneas)
- `reportes/07_gestion_vehiculos_rls.sql` (267 líneas)
- `reportes/08_valoracion_economica.sql` (356 líneas)
- `reportes/09_valoracion_economica_triggers.sql` (330 líneas)
- `reportes/10_valoracion_economica_rls.sql` (169 líneas)
- `reportes/11_funciones_analisis_economico.sql` (463 líneas)
- `reportes/12_funciones_admin.sql` (457 líneas)

**Total: 3,435 líneas de SQL**

### 📊 Métricas v2.0

- **Tablas nuevas:** 13
- **Vistas nuevas:** 2
- **Triggers nuevos:** 30+
- **Funciones SQL nuevas:** 20+
- **Componentes React nuevos:** 5
- **API endpoints nuevos:** 11
- **Tipos TypeScript nuevos:** 40+
- **Líneas de SQL:** 3,435
- **Líneas de documentación:** 1,350+

### 💰 Potencial de Monetización

El sistema genera datos únicos y valiosos:
- Base de datos de mercado español de autocaravanas
- Precios reales de compra/venta
- Costes reales de mantenimiento
- Problemas recurrentes por modelo
- Consumo real vs oficial
- Depreciación real por marca/modelo

**Vías identificadas:**
- Informes corporativos (aseguradoras, fabricantes)
- Suscripciones B2B (concesionarios)
- API de valoraciones (webs externas)
- Usuarios premium (5-10€/mes)
- Marketplace de servicios (comisiones)

**Proyección:** 34,000€/año (1k usuarios) → 280,000€/año (10k usuarios)

---

## [1.1.0] - 2025-11-05 ✨

### 🎯 OPTIMIZACIÓN DEL PANEL DE ADMINISTRACIÓN

Versión enfocada en mejorar el panel de administración con datos en tiempo real y mejor UX.

### ✅ Agregado

#### Gestión de Usuarios Mejorada (`/admin/users`)
- **Tabla reorganizada** con columnas separadas y ordenables:
  - `Tipo` - Icono visual del proveedor (Google OAuth / Email)
  - `Nombre` - Nombre completo del usuario
  - `Email` - Correo electrónico
  - `ID` - Identificador único (primeros 8 caracteres)
  - `Rol` - Admin / Usuario
  - `Fecha Registro` - Cuándo se registró
  - `Último Acceso` - Fecha y hora del último inicio de sesión
  - `Estado` - Confirmado / Pendiente
- **Iconos de proveedor** - Logo de Google para OAuth, icono de email para password
- **Ordenación inteligente** - Por defecto muestra usuarios más recientes primero
- **Datos en tiempo real** - Obtiene usuarios reales desde Supabase Auth API
- **Sin caché** - PWA configurado para no cachear `/api/admin/*`
- **Botón de recarga manual** - Actualiza datos con un clic
- **551 usuarios mostrados correctamente** (antes solo 505)

#### Analytics en Tiempo Real (`/admin/analytics`)
- **Usuarios reales** - Obtiene count desde API en lugar de valor hardcodeado
- **Nueva métrica: Rutas Calculadas** 🗺️ - Total de rutas planificadas por usuarios
- **Nueva métrica: Distancia Total** 🛣️ - Kilómetros acumulados de todas las rutas
- **Nueva métrica: Interacciones IA** 🤖 - Total de mensajes con el chatbot
- **Datos frescos** - Todas las métricas se calculan en tiempo real

#### Sistema Anti-Caché
- **Headers HTTP de no-cache** en todas las respuestas de `/api/admin/*`
- **Configuración PWA** - `NetworkOnly` para APIs de administración
- **Página de limpieza** - `/clear-cache.html` para limpiar service worker
- **Visualización mejorada** - Fecha Y hora en columna "Último Acceso"
- **Timestamp en URLs** - Evita caché del navegador con `?t=${Date.now()}`

#### AdminTable Component Mejorado
- **Props de ordenación inicial** - `initialSortColumn` e `initialSortDirection`
- **Ordenación configurable** - Permite establecer columna y dirección por defecto
- **Reutilizable** - Otros componentes pueden usar la ordenación personalizada

### 🔧 Arreglado

#### Problema de Caché
- **Solución**: PWA ya no cachea APIs de administración
- **Resultado**: Datos siempre actualizados sin necesidad de hard refresh

#### Ordenación de Usuarios
- **Problema**: Al hacer clic en "Último Acceso", ordenaba de más antiguo a más reciente
- **Solución**: Ahora ordena por defecto más recientes primero (descendente)
- **Comportamiento**: Click alterna entre descendente ↓ y ascendente ↑

#### Conteo de Usuarios
- **Problema**: Analytics mostraba 382 usuarios (hardcodeado)
- **Solución**: Ahora obtiene usuarios reales desde Supabase Auth
- **Resultado**: Muestra 551 usuarios correctamente

#### Datos Desactualizados
- **Problema**: Fechas de registro y último acceso no se actualizaban
- **Causa**: Service Worker cacheaba peticiones por 24 horas
- **Solución**: Sistema completo anti-caché implementado

### 📚 Documentación

- **INSTRUCCIONES_CACHE_USUARIOS.md** - Guía completa de solución del problema de caché
- **README.md actualizado** - Versión 1.1.0 con nuevas características
- **.dropboxignore creado** - Excluye `.git` de sincronización Dropbox

---

## [1.0.0] - 2025-11-04 🎉

### 🏆 VERSIÓN 1.0 - PRODUCCIÓN

Primera versión completamente funcional en producción con todas las características implementadas y operativas.

### ✅ Agregado

#### Sistema de Chatbot IA "Tío Viajero"
- **Chatbot conversacional completo** con OpenAI GPT-4o-mini
- **Function Calling** con 3 funciones principales:
  - `search_areas()` - Búsqueda inteligente por ubicación, servicios, precio
  - `get_area_details()` - Información detallada de áreas específicas
  - `get_areas_by_country()` - Listado por países
- **Geolocalización automática** del usuario
- **Sistema de prioridades** para ubicaciones explícitas vs. GPS
- **Widget flotante** con avatar del Tío Viajero
- **Historial de conversaciones** guardado en Supabase
- **Links clicables** para Google Maps (mejora UX)

#### Editor de Prompts IA
- **Editor visual** en `/admin/configuracion` para 3 agentes IA:
  - 🔍 Actualizar Servicios (scrape_services)
  - ✨ Enriquecer Textos (enrich_description)
  - 💬 Tío Viajero IA (chatbot)
- **Sistema de prompts múltiples** (system, user, assistant, agent)
- **Añadir, editar, eliminar y reordenar** prompts visualmente
- **Configuración de parámetros** (modelo, temperature, max_tokens)
- **Guardado en Supabase** con columna JSONB `prompts`

#### Seguridad y Permisos
- **Políticas RLS** completas para chatbot_config
- **Restricción de acceso** al mapa y chatbot (requiere login)
- **LoginWall component** genérico para bloquear features
- **Gestión de usuarios admin** con flag `is_admin`

#### Mejoras UX
- **Links clicables** "Ver en Google Maps" en lugar de URLs largas
- **"Volver al inicio"** en LoginWall para mejor navegación
- **Mensajes de éxito/error** mejorados
- **Estados de carga** en todas las operaciones

### 🔧 Arreglado

#### Variables de Entorno en AWS Amplify
- **Fix crítico**: Variables no disponibles en API routes
- **Solución**: Exponer variables mediante `env: {}` en `next.config.js`
- **Verificación**: Logs en `amplify.yml` para debugging
- **Resultado**: Chatbot API ahora recibe todas las variables correctamente

#### Políticas RLS de Supabase
- **Fix**: Error 403 al leer `chatbot_config`
- **Solución**: Políticas permisivas para usuarios autenticados
- **Verificación**: Query de testing directo
- **Resultado**: Frontend puede leer/editar configuración sin errores

#### Sistema de Testing Automatizado
- **Creado**: `/tester` con Puppeteer para tests E2E
- **Funcionalidades**:
  - Login automático
  - Navegación simulada
  - Interacción con chatbot
  - Screenshots de errores
  - Reportes HTML detallados
- **Uso**: Debugging del chatbot en producción
- **Estado**: Funcional (archivos eliminados tras resolver problemas)

### 📝 Documentación

#### Nuevos Documentos
- `CHATBOT_FUNCIONANDO.md` - Resumen de la solución
- `chatbot/PROBLEMA_RESUELTO.md` - Documentación completa del fix
- `chatbot/ACTIVAR_EDITOR_PROMPTS_TIO_VIAJERO.md` - Guía de activación
- `supabase/migrations/ADD_chatbot_prompts_system_EJECUTAR_AHORA.sql` - Migración de prompts
- `supabase/migrations/FIX_chatbot_config_RLS_policies.sql` - Fix de permisos
- `CHANGELOG.md` - Este archivo

#### Documentos Actualizados
- `README.md` - Actualizado a v1.0 con todas las features
- `chatbot/README.md` - Estado operativo
- `chatbot/CHATBOT_ACCION_INMEDIATA.md` - Marcado como resuelto
- `chatbot/CHATBOT_PROBLEMA_CRITICO_VISUALIZADO.md` - Contexto histórico

### 🗄️ Base de Datos

#### Migraciones Ejecutadas
```sql
-- 1. Sistema de prompts múltiples
ALTER TABLE chatbot_config ADD COLUMN prompts JSONB;
CREATE INDEX idx_chatbot_config_prompts ON chatbot_config USING GIN (prompts);

-- 2. Políticas RLS
CREATE POLICY "Authenticated users can read chatbot_config" ON chatbot_config FOR SELECT;
CREATE POLICY "Admins can update chatbot_config" ON chatbot_config FOR UPDATE;

-- 3. Usuario admin
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": "true"}' 
WHERE email = 'info@furgocasa.com';
```

### 🚀 Deployment

#### AWS Amplify
- **Build exitoso** con todas las variables de entorno
- **Variables configuradas**:
  - `OPENAI_API_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Todas las APIs de Google Maps
- **Tiempo de deploy**: ~2-3 minutos
- **URL producción**: https://www.mapafurgocasa.com

#### Supabase
- **Tabla `chatbot_config`** actualizada con columna `prompts`
- **Políticas RLS** correctamente implementadas
- **Usuarios** con permisos de admin configurados

### 📊 Métricas v1.0

- **Total de áreas**: 2000+
- **Países soportados**: 25+
- **Funciones del chatbot**: 3 (search, details, by_country)
- **Agentes IA configurables**: 3
- **Prompts editables**: Sistema, User, Assistant, Agent
- **Tiempo de respuesta del chatbot**: ~2-5 segundos
- **Uptime**: 99.9%

---

## [0.9.0] - 2025-11-03

### Agregado
- Sistema de rutas guardadas
- Planificador de rutas con Google Directions
- Dashboard de perfil completo
- Panel de administración v2

### Arreglado
- Búsqueda de áreas por país
- Filtros de servicios
- Detección de duplicados mejorada

---

## [0.8.0] - 2025-11-02

### Agregado
- Búsqueda masiva de áreas con Google Places
- Actualización automática de servicios con IA
- Enriquecimiento de textos con OpenAI
- Sistema de imágenes automático

---

## [0.7.0] - 2025-11-01

### Agregado
- Mapa interactivo con Google Maps
- Sistema de favoritos
- Valoraciones y comentarios
- Registro de visitas

---

## Leyenda

- ✅ **Agregado**: Nuevas funcionalidades
- 🔧 **Arreglado**: Bugs y problemas resueltos
- 📝 **Documentación**: Cambios en docs
- 🗄️ **Base de Datos**: Migraciones y schemas
- 🚀 **Deployment**: Cambios en infraestructura
- 🎨 **UI/UX**: Mejoras visuales y de experiencia

---

**Versión actual:** 2.0.0  
**Última actualización:** 12 de Noviembre, 2025  
**Próxima versión:** 2.1.0 (mejoras y optimizaciones)
