# 👨‍💼 Panel de Administración - Sistema de Vehículos

## 🎯 Objetivo

Panel completo para que los administradores analicen, gestionen y moneticen toda la información de vehículos, reportes de accidentes, y datos de mercado.

## 📱 Nuevas Páginas del Admin

### 1. **Dashboard General** (`/admin/vehiculos`)
Vista panorámica con métricas clave.

**Widgets:**
- 📊 Total de vehículos registrados (por mes/año)
- 💰 Valor total del parque de vehículos
- 📈 Tendencias de registro (crecimiento)
- 🚨 Reportes de accidentes totales
- 💸 Datos de mercado recopilados
- 👥 Usuarios activos con vehículos

**Gráficos:**
- Evolución de registros mensuales
- Distribución por marcas
- Distribución por años de fabricación
- Mapa de calor de ubicaciones

---

### 2. **Análisis de Vehículos** (`/admin/vehiculos/analisis`)

#### **Vista: Por Marca y Modelo**
- Tabla ordenable/filtrable
- Columnas:
  - Marca/Modelo
  - Cantidad registrada
  - Año promedio
  - Km promedio
  - Precio compra promedio
  - Valor actual promedio
  - Depreciación media
  - Coste mantenimiento/año
  - Tasa de averías
- Exportar a CSV/Excel

#### **Vista: Por Rango de Precios**
- Distribución de vehículos por precio de compra
- 0-20k, 20k-40k, 40k-60k, 60k-80k, 80k+
- Estadísticas por rango
- Gráfico de barras/pastel

#### **Vista: Por Antigüedad**
- Distribución por año de fabricación
- Análisis de depreciación por edad
- Comparativa de costes por antigüedad

#### **Vista: Por Kilometraje**
- Distribución por rangos de km
- Consumo medio por rango
- Averías por rango de km

---

### 3. **Datos de Mercado** (`/admin/mercado`)

#### **Análisis de Precios**
- **Tabla de precios por marca/modelo/año:**
  - Precio compra medio
  - Precio venta medio
  - Margen (venta - compra)
  - Número de transacciones
  - Última actualización
  - Tendencia (↑↓→)

- **Gráficos de tendencias:**
  - Evolución de precios en el tiempo
  - Comparativa por marcas
  - Estacionalidad de ventas

- **Hot Models:**
  - Modelos más vendidos
  - Modelos con mayor demanda
  - Modelos con mejor retención de valor

#### **Comparador de Mercado**
- Herramienta para comparar precios
- Filtros: marca, modelo, año, km, equipamiento
- Resultado: precio estimado + rango

#### **Verificación de Datos**
- Cola de datos pendientes de verificar
- Aprobar/rechazar contribuciones
- Marcar como verificados

---

### 4. **Reportes de Accidentes** (`/admin/reportes-accidentes`)

#### **Vista General**
- Lista de todos los reportes
- Filtros:
  - Estado (leído/no leído/cerrado)
  - Fecha
  - Gravedad (tipo de daño)
  - Vehículo (marca/modelo)
  - Ubicación (ciudad)

#### **Estadísticas**
- Total de reportes
- Reportes por mes
- Ubicaciones más frecuentes (mapa de calor)
- Tipos de daños más comunes
- Vehículos más afectados
- Horarios de mayor incidencia

#### **Análisis de Siniestralidad**
- Zonas con más accidentes
- Modelos con más reportes
- Estadísticas para aseguradoras
- Patrones de siniestralidad

---

### 5. **Análisis de Costes** (`/admin/vehiculos/costes`)

#### **Mantenimientos**
- Coste medio por marca/modelo
- Frecuencia de mantenimientos
- Talleres más utilizados
- ITV: tasa de aprobación por marca
- Costes por tipo de servicio

#### **Averías**
- Ranking de modelos con más averías
- Tipos de averías más frecuentes
- Severidad media por marca
- Coste medio de reparación
- Garantías más reclamadas

#### **Mejoras**
- Mejoras más populares
- ROI de mejoras (satisfacción vs coste)
- Tendencias de personalización
- Mejoras más compartidas públicamente

#### **Combustible**
- Consumo real vs oficial por modelo
- Precio medio del combustible (histórico)
- Análisis por regiones
- Comparativa por tipo de combustible

---

### 6. **Análisis Financiero** (`/admin/vehiculos/financiero`)

#### **ROI de Usuarios**
- Usuarios con mejor ROI
- Usuarios con peor ROI
- Análisis de factores de éxito

#### **Depreciación**
- Curvas de depreciación por marca
- Modelos que mejor mantienen valor
- Comparativa con datos oficiales
- Proyecciones futuras

#### **Financiación**
- % de usuarios con financiación
- Plazos medios
- Cuotas medias
- Deuda pendiente media

---

### 7. **Gestión de Usuarios** (`/admin/usuarios/vehiculos`)

#### **Usuarios con Vehículos**
- Lista de usuarios con vehículos registrados
- Cantidad de vehículos por usuario
- Nivel de actividad (registros recientes)
- Usuarios que comparten datos
- Usuarios premium candidates

#### **Análisis de Comportamiento**
- Frecuencia de registro de gastos
- Engagement con la plataforma
- Features más utilizadas

---

### 8. **Informes y Exportaciones** (`/admin/informes`)

#### **Informes Predefinidos**
1. **Informe de Mercado Mensual**
   - Resumen de precios
   - Nuevos registros
   - Tendencias
   
2. **Informe de Siniestralidad**
   - Para aseguradoras
   - Zonas de riesgo
   - Modelos más siniestrados

3. **Informe de Costes de Mantenimiento**
   - Para potenciales compradores
   - Coste real de propiedad
   - Comparativa por marcas

4. **Informe de Satisfacción**
   - Basado en mejoras y valoraciones
   - Modelos recomendados
   - Problemas conocidos

#### **Generador de Informes Custom**
- Selector de métricas
- Filtros avanzados
- Formato: PDF, Excel, CSV
- Programar envíos automáticos

---

### 9. **Alertas y Monitorización** (`/admin/alertas`)

#### **Alertas Automáticas**
- Precio anormal detectado (muy alto/bajo)
- Patrón de fraude potencial
- Zona con aumento de accidentes
- Modelo con spike de averías
- Usuario con actividad sospechosa

#### **Monitorización en Tiempo Real**
- Nuevos registros
- Nuevos reportes de accidentes
- Contribuciones al mercado
- Alertas críticas

---

### 10. **Análisis Geográfico** (`/admin/geografico`)

#### **Mapas Interactivos**
- Vehículos por región
- Precios por región
- Accidentes por zona
- Consumo de combustible por región
- Talleres más recomendados

#### **Análisis Regional**
- Marcas preferidas por región
- Diferencias de precios
- Costes de mantenimiento regionales

---

## 📊 Componentes Reutilizables

### **Widgets/Cards**
- `StatCard` - Métrica con icono
- `TrendCard` - Métrica con tendencia
- `ChartCard` - Gráfico embebido
- `TableCard` - Tabla con paginación
- `MapCard` - Mapa interactivo

### **Gráficos**
- Líneas (tendencias temporales)
- Barras (comparativas)
- Pastel (distribuciones)
- Scatter (correlaciones)
- Mapa de calor (intensidad)
- Gauge (indicadores)

### **Tablas**
- Filtros avanzados
- Ordenación
- Exportación
- Búsqueda
- Paginación
- Acciones en lote

---

## 🔐 Permisos

### **Super Admin**
- Acceso total
- Gestión de datos de mercado
- Verificación de datos
- Exportación de informes

### **Admin Lectura**
- Ver todos los datos
- No puede modificar
- No puede exportar datos sensibles

### **Soporte**
- Ver reportes de accidentes
- Ayudar a usuarios
- Ver datos agregados (no individuales)

---

## 💰 Monetización de Datos

### **Informes Premium**
1. **Para Aseguradoras:**
   - Análisis de siniestralidad
   - Perfiles de riesgo por modelo
   - Zonas de alto riesgo
   - **Precio:** 500-2000€/informe

2. **Para Concesionarios:**
   - Precios de mercado actualizados
   - Demanda por modelo
   - Mejor momento para vender
   - **Precio:** Suscripción 200€/mes

3. **Para Fabricantes:**
   - Problemas recurrentes
   - Satisfacción del usuario
   - Competencia (benchmarking)
   - **Precio:** 5000-10000€/año

4. **Para Medios/Blogs:**
   - Tendencias de mercado
   - Modelos más populares
   - Estudios de depreciación
   - **Precio:** 100-500€/estudio

### **API de Datos**
- Endpoint para valoraciones
- Endpoint para precios de mercado
- **Precio:** Por llamada o suscripción

### **Widget de Valoración**
- Widget embebible en webs externas
- Genera leads para vosotros
- **Precio:** Freemium con comisión

---

## 🚀 Implementación Progresiva

### **Fase 1 - MVP Admin** (Prioritario)
1. Dashboard general
2. Lista de vehículos con filtros básicos
3. Reportes de accidentes
4. Datos de mercado básicos

### **Fase 2 - Análisis** (Medio Plazo)
5. Análisis de costes
6. Análisis financiero
7. Gráficos y tendencias

### **Fase 3 - Avanzado** (Largo Plazo)
8. Informes exportables
9. Alertas automáticas
10. API y monetización

---

## 📈 KPIs a Monitorizar

### **Adopción**
- Nuevos vehículos registrados/mes
- % de usuarios con vehículo
- Registros completos vs incompletos

### **Engagement**
- Actualizaciones de gastos/mes
- Usuarios activos últimos 30 días
- Features más usadas

### **Calidad de Datos**
- % de datos completos
- % de datos verificados
- Contribuciones al mercado

### **Monetización**
- Valor de datos recopilados
- Informes vendidos
- Revenue potential

---

## 🎨 Diseño UI/UX

### **Principios**
- Dashboards claros y concisos
- Filtros siempre visibles
- Exportación fácil
- Responsive (tablet friendly)
- Tooltips explicativos

### **Paleta de Colores Admin**
- Principal: Azul oscuro (#1e40af)
- Éxito: Verde (#10b981)
- Alerta: Amarillo (#f59e0b)
- Error: Rojo (#ef4444)
- Neutro: Gris (#6b7280)

---

## 🔍 Búsquedas y Filtros

### **Búsqueda Global**
- Por matrícula
- Por marca/modelo
- Por usuario (email/nombre)
- Por ciudad

### **Filtros Comunes**
- Rango de fechas
- Rango de precios
- Rango de km
- Marca/Modelo
- Estado/Provincia
- Verificado/No verificado

---

## 📱 Mobile Admin

### **Vista Simplificada**
- KPIs principales
- Notificaciones
- Acciones rápidas
- Vista de reportes críticos

No necesita todas las features del desktop, solo monitorización básica.
