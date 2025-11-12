# 🚐 Sistema Completo de Gestión de Vehículos - Scripts SQL

Este directorio contiene los scripts SQL necesarios para implementar el **Sistema Completo de Gestión de Vehículos y Valoración Automática** en Supabase.

**Incluye:**

- 🚨 Sistema de Alertas de Accidentes (scripts 01-04)
- 🚐 Gestión Integral de Vehículos (scripts 05-07)
- 💰 Sistema de Valoración Económica (scripts 08-10)
- 🤖 Funciones de Análisis e IA (scripts 11-12)
- 📝 Ampliación de Campos de Compra (script 13)

---

## 📋 Orden de Ejecución Completo

**IMPORTANTE:** Ejecutar los scripts en el orden indicado en el **SQL Editor de Supabase**.

### 📦 Fase 1: Sistema de Reportes de Accidentes (01-04)

### 1️⃣ `01_crear_tablas.sql`

**Descripción:** Crea las 3 tablas principales del sistema

- `vehiculos_registrados` - Autocaravanas registradas por usuarios
- `reportes_accidentes` - Reportes de accidentes de testigos
- `notificaciones_reportes` - Historial de notificaciones

**Índices creados:** 11 índices para optimizar consultas

---

### 2️⃣ `02_crear_triggers.sql`

**Descripción:** Crea triggers y funciones automáticas

- Trigger `update_vehiculos_updated_at` - Actualiza fecha de modificación
- Trigger `update_reportes_updated_at` - Actualiza fecha de modificación
- Trigger `trigger_crear_notificacion_reporte` - Crea notificación automática al crear reporte
- Trigger `trigger_marcar_notificacion_leida` - Marca notificación como leída

---

### 3️⃣ `03_configurar_rls.sql`

**Descripción:** Configura Row Level Security (RLS) para seguridad

- **Políticas para `vehiculos_registrados`:**
  - Los usuarios solo ven sus propios vehículos
  - Búsqueda pública por QR (necesario para página de reporte)
- **Políticas para `reportes_accidentes`:**

  - Cualquiera puede crear reportes (anon)
  - Solo propietarios ven reportes de sus vehículos
  - Solo propietarios pueden actualizar/cerrar reportes

- **Políticas para `notificaciones_reportes`:**
  - Los usuarios solo ven sus notificaciones
  - El sistema puede crear notificaciones

---

### 4️⃣ `04_funciones_auxiliares.sql`

**Descripción:** Funciones útiles para consultas y estadísticas

#### Funciones creadas:

1. **`estadisticas_vehiculo(vehiculo_uuid)`**

   - Retorna: total_reportes, reportes_pendientes, reportes_cerrados, ultimo_reporte
   - Uso: Estadísticas de un vehículo específico

2. **`contar_reportes_no_leidos(usuario_uuid)`**

   - Retorna: cantidad de reportes no leídos
   - Uso: Badge de notificaciones en perfil

3. **`buscar_vehiculo_por_qr(qr_id)`**

   - Retorna: datos del vehículo o existe=false
   - Uso: Página pública de reporte

4. **`obtener_reportes_usuario(usuario_uuid)`**

   - Retorna: todos los reportes con información completa
   - Uso: Dashboard de reportes en perfil

5. **`marcar_reporte_leido(reporte_uuid, usuario_uuid)`**

   - Retorna: true/false
   - Uso: Marcar reporte como leído

6. **`cerrar_reporte(reporte_uuid, usuario_uuid, notas)`**

   - Retorna: true/false
   - Uso: Cerrar/resolver un reporte

7. **`generar_qr_id()`**
   - Retorna: string único (ej: "qr-a1b2c3d4e5f6")
   - Uso: Generar ID para QR al crear vehículo

---

### 📦 Fase 2: Gestión Integral de Vehículos (05-07)

### 5️⃣ `05_gestion_vehiculos_tablas.sql`

**Descripción:** Crea 6 tablas para gestión completa del vehículo

- `mantenimientos` - Historial completo de mantenimiento (ITV, aceite, revisiones)
- `averias` - Registro y seguimiento de averías e incidencias
- `vehiculo_documentos` - Biblioteca digital de documentos importantes
- `vehiculo_mejoras` - Registro de mejoras y personalizaciones
- `vehiculo_kilometraje` - Control de consumo y kilometraje
- `vehiculo_ficha_tecnica` - Datos técnicos completos del vehículo

**Índices creados:** 20+ índices para optimizar consultas

---

### 6️⃣ `06_gestion_vehiculos_triggers.sql`

**Descripción:** Crea triggers y funciones automáticas para gestión

- Triggers de actualización de timestamps
- Cálculo automático de costes totales (averías, mejoras)
- Cálculo de consumo de combustible y precio por litro
- Cálculo de carga útil
- Verificación de propiedad del vehículo
- Actualización de fechas de resolución de averías

**Funciones creadas:** 12 funciones automáticas

---

### 7️⃣ `07_gestion_vehiculos_rls.sql`

**Descripción:** Configura Row Level Security (RLS) para todas las tablas de gestión

- Políticas para usuarios autenticados (solo sus vehículos)
- Políticas para administradores (lectura completa)
- Verificación de propiedad en todas las operaciones

**Políticas creadas:** 20+ políticas de seguridad

---

### 📦 Fase 3: Sistema de Valoración Económica (08-10)

### 8️⃣ `08_valoracion_economica.sql`

**Descripción:** Crea 4 tablas para control económico completo

- `vehiculo_valoracion_economica` - Control financiero completo
- `datos_mercado_autocaravanas` - Base de datos pública de precios (anónima)
- `historico_precios_usuario` - Evolución del valor en el tiempo
- `gastos_adicionales` - Seguros, impuestos, parking, etc.

**Vistas creadas:** 2 vistas para análisis económico

---

### 9️⃣ `09_valoracion_economica_triggers.sql`

**Descripción:** Crea triggers para cálculos económicos automáticos

- Cálculo de inversión total (compra + gastos)
- Cálculo de totales de gastos adicionales
- Cálculo de ganancia/pérdida en venta
- Actualización de datos de mercado (contribución anónima)
- Cálculo de ROI automático

**Triggers creados:** 8 triggers automáticos

---

### 🔟 `10_valoracion_economica_rls.sql`

**Descripción:** Configura RLS para tablas económicas

- Políticas para usuarios (solo sus datos)
- Políticas para datos de mercado (lectura pública, escritura anónima)
- Políticas para administradores (lectura completa)

**Políticas creadas:** 12+ políticas de seguridad

---

### 📦 Fase 4: Funciones de Análisis e IA (11-12)

### 1️⃣1️⃣ `11_funciones_analisis_economico.sql`

**Descripción:** Funciones avanzadas de análisis económico y valoración con IA

- `calcular_valoracion_automatica()` - Algoritmo propio de valoración
- `comparar_con_mercado()` - Comparativa de precios en tiempo real
- `analisis_gastos_periodo()` - Desglose detallado de gastos
- `proyeccion_costes_anuales()` - Proyección de costes futuros
- `estadisticas_consumo_combustible()` - Análisis completo de consumo
- `obtener_resumen_economico_vehiculo()` - Vista consolidada

**Funciones creadas:** 6 funciones de análisis avanzado

---

### 1️⃣2️⃣ `12_funciones_admin.sql`

**Descripción:** Funciones de administración y analytics para el panel admin

- `admin_dashboard_metricas()` - KPIs principales
- `admin_analisis_por_marca_modelo()` - Análisis por vehículo
- `admin_distribucion_por_precio()` - Distribución económica
- `admin_analisis_siniestralidad()` - Reportes de accidentes
- `admin_top_modelos_mercado()` - Tendencias de mercado
- `admin_averias_recurrentes()` - Problemas comunes
- `admin_mejoras_populares()` - Mejoras más realizadas
- `admin_consumo_real_vs_oficial()` - Comparativa de consumos
- `admin_usuarios_top_contribuyentes()` - Usuarios más activos

**Funciones creadas:** 9 funciones de administración

---

## 📖 Documentación Adicional

Para más información detallada, consulta:

- **[README_GESTION_VEHICULOS.md](./README_GESTION_VEHICULOS.md)** - Guía completa de implementación
- **[RESUMEN_SISTEMA_COMPLETO.md](./RESUMEN_SISTEMA_COMPLETO.md)** - Resumen técnico completo
- **[docs/SISTEMA_VALORACION_VENTA.md](../docs/SISTEMA_VALORACION_VENTA.md)** - Guía de valoración automática
- **[docs/PANEL_ADMIN_VEHICULOS.md](../docs/PANEL_ADMIN_VEHICULOS.md)** - Panel de administración

---

## 🚀 Cómo Ejecutar

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido de `01_crear_tablas.sql`
5. Haz clic en **Run** (Ejecutar)
6. Verifica que aparezca: "Tablas creadas correctamente!"
7. Repite los pasos 3-6 con los demás scripts en orden

---

## ✅ Verificación Completa

Después de ejecutar todos los scripts (01-12), verifica que todo esté correcto:

```sql
-- Ver todas las tablas creadas (13 tablas)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'vehiculos_registrados', 'reportes_accidentes', 'notificaciones_reportes',
  'mantenimientos', 'averias', 'vehiculo_documentos', 'vehiculo_mejoras',
  'vehiculo_kilometraje', 'vehiculo_ficha_tecnica',
  'vehiculo_valoracion_economica', 'datos_mercado_autocaravanas',
  'historico_precios_usuario', 'gastos_adicionales'
)
ORDER BY table_name;

-- Ver todas las vistas creadas (2 vistas)
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('resumen_economico_vehiculo', 'estadisticas_mercado_por_modelo');

-- Ver todas las funciones creadas (20+ funciones)
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
  routine_name LIKE '%vehiculo%' OR
  routine_name LIKE '%reporte%' OR
  routine_name LIKE '%mantenimiento%' OR
  routine_name LIKE '%averia%' OR
  routine_name LIKE '%valoracion%' OR
  routine_name LIKE '%admin%' OR
  routine_name LIKE '%mercado%'
)
ORDER BY routine_name;

-- Ver todas las políticas RLS (40+ políticas)
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'vehiculos_registrados', 'reportes_accidentes', 'notificaciones_reportes',
  'mantenimientos', 'averias', 'vehiculo_documentos', 'vehiculo_mejoras',
  'vehiculo_kilometraje', 'vehiculo_ficha_tecnica',
  'vehiculo_valoracion_economica', 'datos_mercado_autocaravanas',
  'historico_precios_usuario', 'gastos_adicionales'
)
ORDER BY tablename, policyname;

-- Ver todos los triggers creados (30+ triggers)
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND (
  event_object_table LIKE '%vehiculo%' OR
  event_object_table LIKE '%reporte%' OR
  event_object_table LIKE '%mantenimiento%' OR
  event_object_table LIKE '%averia%' OR
  event_object_table LIKE '%valoracion%'
)
ORDER BY event_object_table, trigger_name;
```

---

## 🔧 Tests Opcionales

Al final de `04_funciones_auxiliares.sql` hay tests comentados que puedes ejecutar:

```sql
-- Test 1: Generar QR ID único
SELECT public.generar_qr_id();

-- Test 2: Buscar vehículo por QR (debería retornar existe = false)
SELECT * FROM public.buscar_vehiculo_por_qr('qr-test-123');

-- Test 3: Contar reportes no leídos
-- Reemplazar 'TU-USER-UUID' con un UUID real
SELECT public.contar_reportes_no_leidos('TU-USER-UUID');
```

---

## 🗄️ Estructura de Datos

### Tabla: `vehiculos_registrados`

```sql
- id (UUID) - PK
- user_id (UUID) - FK → auth.users
- matricula (VARCHAR)
- marca, modelo, año, color
- foto_url, fotos_adicionales
- qr_code_id (VARCHAR UNIQUE) ← Para generar QR
- qr_image_url (TEXT) ← URL del QR generado
- activo, verificado
- created_at, updated_at
```

### Tabla: `reportes_accidentes`

```sql
- id (UUID) - PK
- vehiculo_afectado_id (UUID) - FK → vehiculos_registrados
- matricula_tercero, descripcion_tercero
- testigo_nombre, testigo_email, testigo_telefono
- descripcion, tipo_dano
- ubicacion_lat, ubicacion_lng, ubicacion_direccion
- fotos_urls (TEXT[])
- fecha_accidente
- ip_address, captcha_verificado
- leido, cerrado, notas_propietario
- created_at, updated_at
```

### Tabla: `notificaciones_reportes`

```sql
- id (UUID) - PK
- user_id (UUID) - FK → auth.users
- reporte_id (UUID) - FK → reportes_accidentes
- tipo_notificacion (email/push/in_app)
- estado (pendiente/enviada/fallida)
- intentos
- enviada_at, leida_at
- created_at
```

---

## 🔗 Relaciones

```
auth.users
    ↓ user_id
vehiculos_registrados
    ↓ vehiculo_afectado_id
reportes_accidentes
    ↓ reporte_id
notificaciones_reportes
```

---

## 🛡️ Seguridad (RLS)

### Políticas Principales:

✅ **Usuarios autenticados:**

- Solo ven sus propios vehículos
- Solo ven reportes de sus vehículos
- Solo pueden actualizar sus propios datos

✅ **Usuarios anónimos (public):**

- Pueden buscar vehículo por QR (solo datos básicos)
- Pueden crear reportes (sin autenticación)
- NO pueden ver reportes de otros

✅ **Sistema:**

- Puede crear notificaciones automáticamente
- Los triggers se ejecutan con privilegios DEFINER

---

## 📊 Estadísticas Rápidas

```sql
-- Contar vehículos registrados
SELECT COUNT(*) FROM vehiculos_registrados;

-- Contar reportes totales
SELECT COUNT(*) FROM reportes_accidentes;

-- Reportes por estado
SELECT
  COUNT(*) FILTER (WHERE leido = false) as no_leidos,
  COUNT(*) FILTER (WHERE cerrado = false) as pendientes,
  COUNT(*) FILTER (WHERE cerrado = true) as cerrados
FROM reportes_accidentes;

-- Top 5 usuarios con más vehículos registrados
SELECT user_id, COUNT(*) as total_vehiculos
FROM vehiculos_registrados
GROUP BY user_id
ORDER BY total_vehiculos DESC
LIMIT 5;
```

---

## 🚨 Troubleshooting

### Error: "permission denied for table"

**Solución:** Asegúrate de que RLS está habilitado y las políticas están creadas correctamente

### Error: "function does not exist"

**Solución:** Ejecuta los scripts en orden (especialmente `02_crear_triggers.sql`)

### Error: "duplicate key value violates unique constraint"

**Solución:** El QR ID ya existe. Usa la función `generar_qr_id()` para generar uno único

---

## 📞 Soporte

Si tienes problemas ejecutando los scripts:

1. Verifica que tienes permisos de administrador en Supabase
2. Revisa los logs de error en el SQL Editor
3. Comprueba que ejecutaste los scripts en orden
4. Verifica que la extensión `uuid-ossp` está habilitada

---

## 🎯 Estado del Sistema

✅ **Sistema Completo Implementado**

### Backend (SQL) ✅

- ✅ 13 tablas creadas
- ✅ 2 vistas creadas
- ✅ 30+ triggers automáticos
- ✅ 20+ funciones SQL
- ✅ 40+ políticas RLS
- ✅ Scripts ejecutados en Supabase

### Frontend (React/Next.js) ✅

- ✅ Componentes React creados
- ✅ Generación de QR implementada (`qrcode`)
- ✅ Página pública `/reporte/[qr-id]` funcionando
- ✅ Tabs en perfil (`MiAutocaravana`, `MisReportes`)
- ✅ API endpoints implementados
- ✅ Dashboard del vehículo completo
- ✅ Valoración automática con UI
- ✅ Histórico con gráficos (Recharts)

### Documentación ✅

- ✅ README principal actualizado
- ✅ CHANGELOG completo
- ✅ Guías de implementación
- ✅ Documentación técnica detallada

---

### 1️⃣3️⃣ `13_ampliar_campos_compra.sql`

**Descripción:** Amplía la tabla `vehiculo_valoracion_economica` con campos adicionales para capturar información detallada de la compra

#### Campos añadidos:

**Información del Vendedor:**

- `tipo_vendedor` - Concesionario, Particular, Empresa alquiler, Subasta, etc.
- `nombre_vendedor` - Nombre del vendedor o concesionario
- `pais_compra` - País donde se compró
- `ciudad_compra` - Ciudad específica

**Estado del Vehículo en Compra:**

- `estado_general` - Excelente, Muy bueno, Bueno, Regular, Malo
- `num_propietarios_anteriores` - Número de dueños previos
- `libro_mantenimiento` - Si tiene libro de mantenimiento al día
- `itv_al_dia` - Si tenía ITV vigente

**Garantía y Documentación:**

- `tiene_garantia` - Si incluye garantía
- `meses_garantia` - Duración de la garantía
- `tipo_garantia` - Oficial, Concesionario, Aseguradora, etc.
- `transferencia_incluida` - Si incluye transferencia

**Financiación Detallada:**

- `entidad_financiera` - Banco o entidad que financia
- `tipo_interes` - % de interés aplicado

**Negociación:**

- `precio_inicial` - Precio pedido inicialmente
- `descuento_aplicado` - Descuento conseguido
- `vehiculo_entregado` - Si se entregó vehículo a cambio
- `precio_vehiculo_entregado` - Valoración del vehículo entregado

**Extras:**

- `extras_incluidos` - Lista de accesorios incluidos en la compra

**Índices:** 3 nuevos índices para optimizar búsquedas por tipo_vendedor, país y procedencia

---

## 🚀 Próximos Pasos (Opcionales)

Mejoras futuras sugeridas:

1. **Notificaciones Push** - Alertas en tiempo real
2. **Exportación de Informes PDF** - Reportes descargables
3. **API Pública** - Para integraciones externas
4. **Widget Embebible** - Valoración en webs externas
5. **Marketplace** - Compra/venta integrada
6. **App Móvil** - Versión nativa iOS/Android

---

## 📝 Notas Importantes

- Los QR IDs son únicos e inmutables
- Los reportes NO se pueden editar por testigos (solo crear)
- Los propietarios pueden marcar reportes como leídos/cerrados
- Las notificaciones se crean automáticamente (trigger)
- Las fotos se almacenan en Supabase Storage (solo URLs en BD)
- La geolocalización se obtiene desde el navegador del testigo
- El geocoding reverso se hace con Google Maps API

---

**¡Sistema listo para usar! 🎉**
