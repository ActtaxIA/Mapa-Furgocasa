# 🚐 Sistema de Gestión Completa de Vehículos - Furgocasa

## 📋 Descripción

Sistema integral para que los usuarios gestionen completamente sus autocaravanas, incluyendo:

- ✅ **Mantenimientos y Revisiones**: ITV, cambios de aceite, revisiones periódicas
- 🔧 **Averías e Incidencias**: Registro y seguimiento de problemas
- 📄 **Documentación Digital**: Almacenamiento de documentos importantes
- 🛠️ **Mejoras y Modificaciones**: Historial de upgrades y personalizaciones
- ⛽ **Control de Kilometraje**: Registro de repostajes y consumo de combustible
- 📊 **Ficha Técnica Completa**: Todos los datos técnicos del vehículo

## 🗂️ Estructura de Scripts SQL

### **Orden de Ejecución:**

#### 1. **Sistema de Reportes de Accidentes** (prerequisito)
Ejecutar primero los scripts del sistema de reportes:

```sql
-- Ya ejecutados:
01_crear_tablas.sql
02_crear_triggers.sql
03_configurar_rls.sql
04_funciones_auxiliares.sql
```

#### 2. **Sistema de Gestión de Vehículos** (nuevo)
Ejecutar en este orden:

```sql
05_gestion_vehiculos_tablas.sql      -- Crear tablas de gestión
06_gestion_vehiculos_triggers.sql    -- Crear triggers y funciones
07_gestion_vehiculos_rls.sql         -- Configurar seguridad RLS
```

#### 3. **Sistema de Valoración Económica y Mercado** (nuevo)
Ejecutar después del sistema de gestión:

```sql
08_valoracion_economica.sql          -- Tablas de valoración y mercado
09_valoracion_economica_triggers.sql -- Triggers de cálculo automático
10_valoracion_economica_rls.sql      -- Seguridad RLS
11_funciones_analisis_economico.sql  -- Funciones de análisis e IA
```

## 📊 Tablas Creadas

### 1. **`mantenimientos`**
Historial completo de mantenimiento del vehículo.

**Campos principales:**
- `tipo`: ITV, Cambio aceite, Revisión, etc.
- `fecha`: Fecha del mantenimiento
- `kilometraje`: Km en el momento del servicio
- `coste`: Coste del mantenimiento
- `proximo_mantenimiento`: Para alertas automáticas
- `taller`: Información del servicio

**Características:**
- ⏰ Recordatorios automáticos
- 💰 Control de gastos
- 📸 Adjuntar fotos y documentos

### 2. **`averias`**
Registro de averías, problemas e incidencias.

**Campos principales:**
- `titulo` y `descripcion`: Detalles de la avería
- `fecha_averia`: Cuándo ocurrió
- `severidad`: baja, media, alta, crítica
- `estado`: pendiente, diagnosticando, en_reparacion, resuelto
- `coste_total`: Calculado automáticamente
- `garantia_hasta`: Control de garantías

**Características:**
- 📊 Seguimiento de estado
- 💸 Cálculo automático de costes
- 🔄 Detección de averías recurrentes
- 📅 Fechas automáticas de inicio/resolución

### 3. **`vehiculo_documentos`**
Documentación digital del vehículo.

**Campos principales:**
- `tipo`: ITV, Seguro, Manual, Certificado gas, etc.
- `url`: Ubicación en Supabase Storage
- `fecha_caducidad`: Para documentos temporales
- `alertar_dias_antes`: Recordatorios personalizados

**Características:**
- 📁 Almacenamiento organizado
- 🔔 Alertas de caducidad
- 🔒 Seguridad con RLS

### 4. **`vehiculo_mejoras`**
Registro de mejoras, modificaciones e instalaciones.

**Campos principales:**
- `titulo` y `descripcion`: Qué se mejoró
- `categoria`: Solar, Electricidad, Agua, etc.
- `coste_total`: Calculado automáticamente
- `satisfaccion`: Valoración 1-5 estrellas
- `es_publica`: Compartir con la comunidad

**Características:**
- 📸 Fotos antes/después
- 👥 Compartir con otros usuarios
- ⭐ Sistema de valoración
- 💡 Inspiración para la comunidad

### 5. **`vehiculo_kilometraje`**
Control de kilometraje y consumo de combustible.

**Campos principales:**
- `kilometros`: Lectura del cuentakilómetros
- `combustible_litros`: Litros repostados
- `coste_combustible`: Coste del repostaje
- `consumo_medio`: Calculado automáticamente en l/100km
- `precio_litro`: Calculado automáticamente

**Características:**
- 📈 Cálculo automático de consumo
- 💰 Control de gastos de combustible
- 📍 Geolocalización de repostajes
- 📊 Estadísticas de consumo

### 6. **`vehiculo_ficha_tecnica`**
Ficha técnica completa del vehículo.

**Campos principales:**
- **Dimensiones**: largo, ancho, alto
- **Pesos**: MMA, tara, carga útil (calculada)
- **Capacidades**: agua, combustible, gas
- **Plazas**: viajar, dormir
- **Motor**: marca, potencia, consumo oficial
- **Equipamiento**: solar, calefacción, nevera, etc.

**Características:**
- 🧮 Cálculo automático de carga útil
- 📝 Todos los datos técnicos
- 🔧 Información de equipamiento
- 💡 Datos para reventa

## 🔧 Triggers y Funciones Automáticas

### **Triggers de Actualización**
- ✅ Actualizar `updated_at` automáticamente en todas las tablas

### **Cálculos Automáticos**
- ✅ Coste total de averías (diagnóstico + reparación)
- ✅ Coste total de mejoras (materiales + mano de obra)
- ✅ Precio por litro de combustible
- ✅ Consumo medio en l/100km
- ✅ Carga útil (MMA - Tara)

### **Validaciones**
- ✅ Verificar propiedad del vehículo en todas las operaciones
- ✅ Fechas automáticas en cambios de estado de averías

## 🔒 Seguridad (RLS)

### **Políticas Implementadas**

Todas las tablas tienen RLS habilitado con estas políticas:

1. **SELECT**: Solo propios datos (excepto mejoras públicas)
2. **INSERT**: Solo para propios vehículos
3. **UPDATE**: Solo propios datos
4. **DELETE**: Solo propios datos

### **Acceso de Administradores**
Los administradores pueden ver todos los datos (solo SELECT) para soporte.

## 📱 Próximos Pasos de Implementación

### **Frontend (Pendiente)**

1. **Tipos TypeScript** (`types/gestion-vehiculos.types.ts`)
2. **API Endpoints**:
   - `/api/vehiculos/[id]/mantenimientos`
   - `/api/vehiculos/[id]/averias`
   - `/api/vehiculos/[id]/documentos`
   - `/api/vehiculos/[id]/mejoras`
   - `/api/vehiculos/[id]/kilometraje`
   - `/api/vehiculos/[id]/ficha-tecnica`

3. **Componentes UI**:
   - Dashboard del vehículo
   - Gestión de mantenimientos
   - Registro de averías
   - Biblioteca de documentos
   - Showcase de mejoras
   - Cuaderno de viaje (kilometraje)
   - Editor de ficha técnica

4. **Funcionalidades Avanzadas**:
   - Sistema de alertas y recordatorios
   - Gráficos de gastos
   - Estadísticas de consumo
   - Exportar PDF con historial completo
   - Compartir mejoras con la comunidad

## 🎯 Casos de Uso

### **Para Usuarios**
1. Registrar su autocaravana con todos los detalles
2. Llevar control de todos los mantenimientos
3. Registrar averías y su resolución
4. Almacenar documentos importantes digitalmente
5. Documentar mejoras y personalizaciones
6. Controlar consumo y gastos de combustible
7. Tener toda la información para vender el vehículo

### **Para la Comunidad**
1. Compartir mejoras e inspirar a otros
2. Aprender de experiencias de otros usuarios
3. Conocer problemas comunes por modelo
4. Encontrar talleres recomendados

## 💰 Sistema de Valoración Económica

### **Tablas Adicionales:**

#### 7. **`vehiculo_valoracion_economica`**
Control financiero completo del vehículo.

**Características:**
- 💵 Precio de compra y financiación
- 📊 Cálculo automático de inversión total
- 📉 Seguimiento de depreciación
- 💸 Precio de venta y ganancia/pérdida
- 🔄 ROI (Return on Investment)
- 📢 Compartir datos anónimos con la comunidad

#### 8. **`datos_mercado_autocaravanas`**
Base de datos de precios de mercado (anónimos).

**Características:**
- 🌐 Datos públicos para todos los usuarios
- 📊 Contribución anónima de la comunidad
- 🔍 Búsquedas por marca/modelo/año
- 📈 Tendencias de precios en el tiempo
- ✅ Verificación por administradores

#### 9. **`historico_precios_usuario`**
Evolución del valor del vehículo en el tiempo.

**Características:**
- 📅 Registro de valoraciones periódicas
- 👨‍💼 Tasaciones profesionales
- 🤖 Valoraciones automáticas
- 📄 Informes de tasación adjuntos

#### 10. **`gastos_adicionales`**
Gastos no cubiertos en otras tablas.

**Características:**
- 🏦 Seguros, impuestos, parking, etc.
- 🔄 Gastos recurrentes
- 🔔 Recordatorios de pagos
- 📊 Categorización detallada

### **Funciones de Análisis con IA:**

#### **`calcular_valoracion_automatica()`**
Algoritmo propio que estima el valor actual basándose en:
- 📊 Datos de mercado similares
- 🚗 Kilometraje y edad
- 🔧 Historial de averías
- ⭐ Estado general del vehículo

#### **`comparar_con_mercado()`**
Compara tu vehículo con precios actuales del mercado.

#### **`analisis_gastos_periodo()`**
Desglose detallado de gastos por categoría y periodo.

#### **`proyeccion_costes_anuales()`**
Proyección de costes futuros basada en historial.

#### **`estadisticas_consumo_combustible()`**
Análisis completo de consumo y costes de combustible.

## 💡 Valor Añadido

Este sistema convierte **Furgocasa** en:

- 📚 Un **cuaderno de bitácora digital** completo
- 💼 Una **herramienta de gestión profesional**
- 👥 Una **plataforma de comunidad** para compartir experiencias
- 📈 Un **sistema de control de costes** detallado
- 📄 Un **archivo digital** del historial del vehículo
- 💰 Una **herramienta de valoración** con IA propia
- 📊 Una **base de datos de mercado** única en España
- 💸 Un **sistema de ROI** para inversiones en autocaravanas

## 🚀 Ejecución de Scripts

### **En Supabase SQL Editor:**

```sql
-- SISTEMA DE GESTIÓN
-- 1. Crear tablas de gestión
\i 05_gestion_vehiculos_tablas.sql

-- 2. Crear triggers y funciones
\i 06_gestion_vehiculos_triggers.sql

-- 3. Configurar seguridad
\i 07_gestion_vehiculos_rls.sql

-- SISTEMA ECONÓMICO
-- 4. Crear tablas de valoración
\i 08_valoracion_economica.sql

-- 5. Crear triggers de cálculo
\i 09_valoracion_economica_triggers.sql

-- 6. Configurar seguridad
\i 10_valoracion_economica_rls.sql

-- 7. Crear funciones de análisis e IA
\i 11_funciones_analisis_economico.sql
```

### **Verificación:**

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'vehiculo%' 
  OR table_name IN ('mantenimientos', 'averias', 'gastos_adicionales', 'datos_mercado_autocaravanas', 'historico_precios_usuario'))
ORDER BY table_name;

-- Verificar vistas
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE '%economico%';

-- Verificar triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN (
  'mantenimientos', 'averias', 'vehiculo_documentos', 'vehiculo_mejoras', 
  'vehiculo_kilometraje', 'vehiculo_ficha_tecnica',
  'vehiculo_valoracion_economica', 'gastos_adicionales'
)
ORDER BY event_object_table, trigger_name;

-- Verificar RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE 'vehiculo%' 
  OR tablename IN ('mantenimientos', 'averias', 'gastos_adicionales', 'datos_mercado_autocaravanas', 'historico_precios_usuario'))
ORDER BY tablename;

-- Verificar funciones de análisis
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name LIKE '%economico%' 
  OR routine_name LIKE '%valoracion%'
  OR routine_name LIKE '%mercado%'
  OR routine_name LIKE '%consumo%')
ORDER BY routine_name;
```

## 📞 Soporte

Para dudas o problemas con la implementación, revisar:
- Logs de Supabase
- Políticas RLS activadas
- Permisos de usuario correctos
