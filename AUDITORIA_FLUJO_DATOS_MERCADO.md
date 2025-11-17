# 🔍 AUDITORÍA - Flujo de Datos hacia `datos_mercado_autocaravanas`

**Fecha:** 17 de Noviembre 2025  
**Objetivo:** Verificar que TODOS los datos útiles están siendo capturados en la tabla `datos_mercado_autocaravanas`

---

## 📊 Resumen Ejecutivo

### ✅ Estado Actual

**ÚNICA FUENTE ACTIVA:** Valoración IA (SerpAPI)

**FUENTES FALTANTES:**
- ❌ Datos de compra del usuario NO se guardan
- ❌ Datos de venta del usuario NO se guardan
- ❌ Precio promedio de valoraciones IA NO se guarda

---

## 🔄 Fuentes de Datos Identificadas

### 1️⃣ SerpAPI (Valoración IA) ✅ ACTIVO

**Ubicación:** `app/api/vehiculos/[id]/ia-valoracion/route.ts` (líneas 903-936)

**Qué guarda:**
```typescript
{
  marca: vehiculo.marca,
  modelo: vehiculo.modelo,
  año: vehiculo.año,
  precio: comparable.precio,           // Precio del anuncio
  kilometros: comparable.kilometros,   // Kms del anuncio
  fecha_transaccion: hoy,
  verificado: true,
  tipo_calefaccion: null,
  homologacion: null,
  estado: 'Usado',
  origen: comparable.fuente,           // "SerpAPI" o "BD Interna"
  tipo_combustible: null,
  tipo_dato: 'Valoración IA',
  pais: 'España',
  region: null
}
```

**Fuente de datos:**
- `lib/valoracion/buscar-comparables.ts` - Busca en Google usando SerpAPI
- Sites escaneados: coches.net, autoscout24, milanuncios, wallapop, vibbo
- Filtros: precio 5K-500K€, marcas similares, años ±2

**Frecuencia:** Cada vez que se genera una valoración IA

**Problema:** ❌ **Guarda la marca/modelo del vehículo ACTUAL, NO del comparable**

```typescript
// LÍNEAS 908-911 (INCORRECTO)
marca: vehiculo.marca || null,      // ❌ Vehículo valorado
modelo: vehiculo.modelo || null,    // ❌ Vehículo valorado
año: vehiculo.año || null,          // ❌ Vehículo valorado
precio: c.precio || null,           // ✅ Del comparable
```

**DEBERÍA SER:**
```typescript
marca: extraerMarcaDeComparable(c),   // Del comparable
modelo: extraerModeloDeComparable(c), // Del comparable
año: c.año || vehiculo.año,           // Preferir del comparable
precio: c.precio,
```

**Impacto:**
- Los 52 registros actuales tienen marca/modelo del vehículo valorado
- Los precios y kms son correctos (vienen del comparable)
- Pero marca/modelo NO coinciden → **Datos inútiles para comparables futuros**

---

### 2️⃣ Datos de Compra del Usuario ❌ NO IMPLEMENTADO

**Ubicación:** `components/vehiculo/DatosCompraTab.tsx` (líneas 174-257)

**Qué debería guardar:**
```typescript
{
  marca: vehiculo.marca,
  modelo: vehiculo.modelo,
  año: vehiculo.año,
  precio: formData.pvp_base_particular || formData.precio_compra,
  kilometros: formData.kilometros_compra,
  fecha_transaccion: formData.fecha_compra,
  verificado: true,
  estado: formData.estado_general || 'Usado',
  origen: formData.origen_compra,         // 'Particular', 'Concesionario', etc.
  tipo_dato: 'Compra Real Usuario',
  pais: formData.pais_compra || 'España',
  region: null,
  tipo_vendedor: formData.tipo_vendedor,
  procedencia: formData.procedencia
}
```

**Implementación actual:** ❌ **Solo guarda en `vehiculo_valoracion_economica`**

**Impacto:**
- Pérdida de datos REALES de transacciones
- Cada compra es un comparable perfecto (precio real, kms reales)
- Actualmente solo se usan como comparables en valoraciones IA
- NO están en la tabla para estadísticas ni análisis

---

### 3️⃣ Datos de Venta del Usuario ❌ NO IMPLEMENTADO

**Ubicación:** `app/api/vehiculos/[id]/venta/route.ts` (líneas 81-301)

**Qué debería guardar:**
```typescript
{
  marca: vehiculo.marca,
  modelo: vehiculo.modelo,
  año: vehiculo.año,
  precio: body.precio_venta_final,
  kilometros: body.kilometros_venta,
  fecha_transaccion: body.fecha_venta,
  verificado: true,
  estado: body.estado_venta || 'Usado',
  origen: 'Venta Real Usuario',
  tipo_dato: 'Venta Real Usuario',
  pais: 'España',                      // O inferir de usuario
  region: null,
  comprador_tipo: body.comprador_tipo  // 'Particular', 'Empresa', etc.
}
```

**Implementación actual:** ❌ **Solo guarda en `vehiculo_valoracion_economica`**

**Impacto:**
- MAYOR pérdida de datos
- Ventas reales son el mejor comparable (precio de mercado confirmado)
- Actualmente solo se usan como comparables en valoraciones IA
- NO están disponibles para análisis de mercado

---

### 4️⃣ Precio Promedio de Valoraciones IA ❌ NO IMPLEMENTADO

**Ubicación:** `app/api/vehiculos/[id]/ia-valoracion/route.ts` (líneas 860-901)

**Qué debería guardar:**
```typescript
{
  marca: vehiculo.marca,
  modelo: vehiculo.modelo,
  año: vehiculo.año,
  precio: (precio_salida + precio_objetivo + precio_minimo) / 3,
  kilometros: kmActuales,
  fecha_transaccion: hoy,
  verificado: true,
  estado: 'Valorado IA',
  origen: 'Valoración IA Promedio',
  tipo_dato: 'Estimación IA',
  pais: 'España',
  region: null
}
```

**Implementación actual:** ❌ **Solo guarda en `valoracion_ia_informes`**

**Problema detectado:** En la sesión anterior identificamos que usar valoraciones IA como comparables creaba **auto-inflación**

**Solución adoptada:** NO incluir valoraciones IA como comparables (decisión correcta)

**Impacto:**
- Correcto NO incluirlo como comparable
- Pero podría guardarse para estadísticas y análisis de tendencias
- Con campo `verificado: false` para que la IA lo ignore

---

## 🚨 Problemas Críticos Detectados

### 1. Marca/Modelo Incorrectos en SerpAPI ⚠️⚠️⚠️

**Código actual (líneas 908-911):**
```typescript
marca: vehiculo.marca || null,   // ❌ Del vehículo VALORADO
modelo: vehiculo.modelo || null, // ❌ Del vehículo VALORADO
```

**Ejemplo del problema:**
- Usuario valora: "Giottivan 54T 2023"
- SerpAPI encuentra: "Adria Twin Plus 2024, 60.000€"
- Se guarda: marca="Giottivan", modelo="54T", precio=60000€

**Resultado:** ❌ **Datos inconsistentes e inútiles**

**Solución:** Extraer marca/modelo del título del comparable

```typescript
function extraerMarcaModelo(comparable: any): { marca: string, modelo: string } {
  const titulo = comparable.titulo.toLowerCase()
  
  // Lista de marcas conocidas
  const marcas = [
    'adria', 'weinsberg', 'giottivan', 'dreamer', 'pilote', 
    'knaus', 'hymer', 'bürstner', 'carado', 'challenger',
    'font vendome', 'autostar', 'rapido', 'benimar', 'roller team'
  ]
  
  let marcaEncontrada = null
  for (const marca of marcas) {
    if (titulo.includes(marca)) {
      marcaEncontrada = marca
      break
    }
  }
  
  // Extraer modelo (palabras después de la marca)
  let modelo = 'Desconocido'
  if (marcaEncontrada) {
    const idx = titulo.indexOf(marcaEncontrada)
    const resto = titulo.substring(idx + marcaEncontrada.length).trim()
    const palabras = resto.split(/\s+/).filter(p => p.length > 1)
    modelo = palabras.slice(0, 3).join(' ') // Primeras 3 palabras
  }
  
  return {
    marca: marcaEncontrada || 'Desconocido',
    modelo: modelo
  }
}
```

---

### 2. No se Guardan Compras de Usuario ⚠️⚠️

**Impacto:**
- Se pierden ~100% de datos de compra reales
- Cada usuario que registra su compra es una transacción real valiosa
- Solo se guardan en `vehiculo_valoracion_economica` (solo para ese vehículo)

**Solución:** Añadir INSERT en `DatosCompraTab.tsx`

```typescript
// DESPUÉS DE GUARDAR EN vehiculo_valoracion_economica (línea 246)
if (result.data) {
  // Guardar también en datos_mercado_autocaravanas
  const { data: vehiculoData } = await supabase
    .from('vehiculos_registrados')
    .select('marca, modelo, ano')
    .eq('id', vehiculoId)
    .single()
  
  if (vehiculoData) {
    await supabase
      .from('datos_mercado_autocaravanas')
      .insert({
        marca: vehiculoData.marca,
        modelo: vehiculoData.modelo,
        año: vehiculoData.ano,
        precio: dataToSave.pvp_base_particular || dataToSave.precio_compra,
        kilometros: dataToSave.kilometros_compra,
        fecha_transaccion: dataToSave.fecha_compra,
        verificado: true,
        estado: dataToSave.estado_general || 'Usado',
        origen: dataToSave.origen_compra || 'Usuario',
        tipo_dato: 'Compra Real Usuario',
        pais: dataToSave.pais_compra || 'España',
        tipo_combustible: null,
        tipo_calefaccion: null,
        homologacion: null,
        region: null
      })
  }
}
```

---

### 3. No se Guardan Ventas de Usuario ⚠️⚠️⚠️

**Impacto:**
- **MAYOR pérdida de datos** (ventas = precio real de mercado)
- Una venta es el mejor indicador de valor
- Actualmente solo visible para ese vehículo específico

**Solución:** Añadir INSERT en `app/api/vehiculos/[id]/venta/route.ts`

```typescript
// DESPUÉS DE GUARDAR EN vehiculo_valoracion_economica (línea 276)
if (result.data) {
  // Obtener datos del vehículo
  const { data: vehiculoData } = await supabase
    .from('vehiculos_registrados')
    .select('marca, modelo, ano')
    .eq('id', vehiculoId)
    .single()
  
  if (vehiculoData) {
    await supabase
      .from('datos_mercado_autocaravanas')
      .insert({
        marca: vehiculoData.marca,
        modelo: vehiculoData.modelo,
        año: vehiculoData.ano,
        precio: precioNumero,
        kilometros: dataToSave.kilometros_venta || null,
        fecha_transaccion: fecha_venta,
        verificado: true,
        estado: dataToSave.estado_venta || 'Vendido',
        origen: 'Venta Real Usuario',
        tipo_dato: 'Venta Real Usuario',
        pais: 'España',
        tipo_combustible: null,
        tipo_calefaccion: null,
        homologacion: null,
        region: null
      })
  }
}
```

---

## 📊 Proyección de Impacto

### Datos Actuales (Post-Limpieza)

- **Total registros:** 52
- **Fuente:** SerpAPI (100%)
- **Calidad:** Media (marca/modelo incorrectos)

### Proyección con Implementación Completa

Asumiendo:
- 10 usuarios activos
- 2 valoraciones IA por usuario/mes
- 50% registran compra
- 10% venden en el año

**Por mes:**
- SerpAPI: 20 valoraciones × 8 comparables = **160 registros**
- Compras usuario: 10 usuarios × 50% = **5 registros**
- Ventas usuario: 1-2 registros (esporádico)

**Total mensual:** ~165-170 registros de calidad

**Por año:** ~2.000 registros

**Con implementación correcta:**
- Marca/modelo precisos (extraídos del título)
- Mix de datos: scraping + transacciones reales
- Calidad: Alta (datos verificados)

---

## ✅ Plan de Acción Recomendado

### PRIORIDAD ALTA 🔴

#### 1. Corregir Marca/Modelo en SerpAPI
**Archivo:** `app/api/vehiculos/[id]/ia-valoracion/route.ts`
**Cambio:** Extraer marca/modelo del título del comparable
**Impacto:** Datos futuros serán precisos

#### 2. Guardar Ventas de Usuario
**Archivo:** `app/api/vehiculos/[id]/venta/route.ts`
**Cambio:** INSERT en `datos_mercado_autocaravanas` después de guardar
**Impacto:** Capturas precio real de mercado

#### 3. Guardar Compras de Usuario
**Archivo:** `components/vehiculo/DatosCompraTab.tsx`
**Cambio:** INSERT en `datos_mercado_autocaravanas` después de guardar
**Impacto:** Capturas transacciones reales

### PRIORIDAD MEDIA 🟡

#### 4. Limpiar Registros Existentes Incorrectos
**Script:** Nuevo `scripts/corregir-marcas-modelos.ts`
**Acción:** Los 52 registros actuales tienen marca/modelo incorrectos
**Opciones:**
  - A) Borrarlos (no son útiles)
  - B) Marcarlos como `verificado: false`
  - C) Intentar corregirlos con IA (si se guardó el título)

**Recomendación:** Borrarlos, empezar desde cero con lógica correcta

#### 5. Mejorar Extracción de Marca/Modelo
**Archivo:** Nuevo `lib/valoracion/extraer-marca-modelo.ts`
**Contenido:** Función robusta con lista de marcas y modelos conocidos
**Plus:** Usar IA (GPT) si no se puede extraer con regex

### PRIORIDAD BAJA 🟢

#### 6. Guardar Estimaciones IA (Solo Estadísticas)
**Archivo:** `app/api/vehiculos/[id]/ia-valoracion/route.ts`
**Cambio:** INSERT con `verificado: false`
**Uso:** Solo para análisis de tendencias, NO como comparables

#### 7. Dashboard de Datos de Mercado
**Nuevo:** `app/admin/datos-mercado/page.tsx`
**Contenido:**
  - Gráfica de crecimiento
  - Distribución por fuente
  - Top marcas/modelos
  - Alertas de anomalías

---

## 📈 Métricas de Éxito

### KPIs Propuestos

1. **Tasa de captura**
   - Objetivo: 100% de ventas guardadas
   - Objetivo: 80%+ de compras guardadas
   - Objetivo: 100% de comparables SerpAPI guardados

2. **Calidad de datos**
   - Objetivo: 95%+ marca/modelo precisos
   - Objetivo: 90%+ precios en rango 5K-500K€
   - Objetivo: 80%+ con kilometraje

3. **Crecimiento**
   - Objetivo: 150+ registros/mes
   - Objetivo: 2.000+ registros/año
   - Objetivo: 10.000+ registros a 5 años

4. **Precisión de valoraciones IA**
   - Objetivo: ±10% del precio real de venta
   - Actual: Desconocido (faltan ventas para comparar)

---

## 🎯 Conclusión

### Estado Actual
- ❌ **Solo 1 de 3 fuentes activas** (SerpAPI)
- ❌ **Marca/modelo incorrectos** en registros actuales
- ❌ **Se pierden 100% compras y ventas** de usuarios
- ⚠️ **52 registros actuales son inútiles** (marca/modelo no coincide)

### Con Implementación Completa
- ✅ **3 fuentes activas** (SerpAPI + Compras + Ventas)
- ✅ **Datos precisos** (marca/modelo extraídos correctamente)
- ✅ **~2.000 registros/año** de alta calidad
- ✅ **Mix perfecto**: scraping + transacciones reales
- ✅ **Valoraciones IA más precisas** (más comparables reales)

### Recomendación Final

**IMPLEMENTAR PRIORIDAD ALTA INMEDIATAMENTE:**

1. Corregir marca/modelo en SerpAPI (30 min)
2. Guardar ventas de usuario (20 min)
3. Guardar compras de usuario (20 min)
4. Limpiar 52 registros incorrectos (5 min)

**Total:** ~1.5 horas de desarrollo

**Beneficio:** Base de datos de mercado robusta y en crecimiento constante

---

**Fecha Auditoría:** 17 de Noviembre 2025  
**Próxima Revisión:** 1 de Diciembre 2025  
**Responsable:** Acttax IA

