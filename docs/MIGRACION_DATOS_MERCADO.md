# 🔄 Migración de Datos de Mercado - 21 Noviembre 2025

## 📋 Problema Identificado

Los usuarios registraban vehículos y completaban datos de compra/venta, pero estos **NO aparecían automáticamente** en la página de "Datos de Mercado" (`/admin/datos-mercado`).

## 🔍 Análisis Realizado

### Estado Inicial:
- ✅ 17 vehículos registrados en `vehiculos_registrados`
- ✅ 13 vehículos con datos de compra completos
- ✅ 4 vehículos vendidos
- ❌ Solo 5 registros de usuarios en `datos_mercado_autocaravanas`
- **Faltaban 12 registros** (9 compras + 3 ventas)

### Causa Raíz:
1. **Bug en el código**: Se usaba `ano` en vez de `año` en las consultas
2. **Datos históricos**: Los vehículos registrados antes del 17/11/2025 no se migraron automáticamente
3. **Precio sin normalizar**: No se estaba guardando el precio con impuesto de matriculación incluido

## ✅ Soluciones Implementadas

### 1. Corrección de Bugs en el Código

#### `components/vehiculo/DatosCompraTab.tsx`
- ✅ Cambiado `ano` → `año` en la consulta SQL
- ✅ Añadido cálculo de precio normalizado con impuesto de matriculación (14.72%)
- ✅ Mejorados logs para debugging

**Cambio clave:**
```typescript
// ANTES: Bug - columna incorrecta
.select('marca, modelo, ano, chasis')

// DESPUÉS: Correcto
.select('marca, modelo, año, chasis')

// Añadido cálculo de precio normalizado
const precioCompraNumero = parseFloat(formData.precio_compra)
let precioNormalizado = precioCompraNumero

if (!formData.precio_incluye_impuesto_matriculacion) {
  const tasaImpuesto = 0.1472 // 14.72%
  precioNormalizado = precioCompraNumero * (1 + tasaImpuesto)
}
```

#### `app/api/vehiculos/[id]/venta/route.ts`
- ✅ Cambiado `ano` → `año` en la consulta SQL
- ✅ Mejorados logs para debugging

### 2. Migración de Datos Históricos

**Script ejecutado:** `migrar-datos-historicos-mercado.ts`

**Resultados:**
- ✅ 9 compras migradas
- ✅ 3 ventas migradas
- ✅ 0 errores de inserción

**Datos migrados:**

**Compras:**
1. Weinsberg Carabus 600 MQ Edition Fire (2025) - 72.728,55 €
2. Dethleffs Globetrail 600 DB (2022) - 78.085,08 €
3. Weinsberg Carabus 600 MQ (2022) - 64.833,75 €
4. Weinsberg Caratour 600 Mq (2023) - 73.554,75 €
5. Pilote V600S (2022) - 57.500 €
6. Benimar Tessoro 494 (2016) - 45.000 €
7. Knaus Boxstar Family (2023) - 77.915,25 €
8. Knaus Boxlife DQ (2023) - 86.406,75 €
9. Weinsberg Carabus 540 MQ Edition Fire (2025) - 74.784,2 €

**Ventas:**
1. Dethleffs Globetrail 600 DB (2022) - Venta: 51.598 € (2025-11-01)
2. Weinsberg Carabus 600 MQ (2022) - Venta: 41.000 € (2025-10-24)
3. Giottivan 54T (2023) - Venta: 50.000 € (2025-01-20)

## 📊 Estado Final

### Datos en `datos_mercado_autocaravanas`:
- **Total registros:** 82
- **Datos de usuarios:** 17 (13 compras + 4 ventas)
- **Otras fuentes:** 65 (extracciones manuales, IA, etc.)

### Distribución por tipo:
- Extracción Manual Admin: 40
- Valoración IA: 15
- **Compra Real Usuario: 13** ✅
- Estimación IA: 9
- **Venta Real Usuario: 4** ✅
- Valoración IA Usuario: 1

## 🔮 Garantías para el Futuro

### Flujo Automático Corregido:

1. **Usuario registra datos de compra** →
   - Se guarda en `vehiculo_valoracion_economica`
   - **Automáticamente** se inserta en `datos_mercado_autocaravanas`
   - Precio normalizado con impuesto de matriculación

2. **Usuario registra venta** →
   - Se actualiza `vehiculo_valoracion_economica.vendido = true`
   - **Automáticamente** se inserta en `datos_mercado_autocaravanas`
   - Incluye precio y kilometraje de venta

### Vehículos sin Datos en Mercado (esperado):

Los siguientes vehículos **NO aparecen** en datos de mercado porque **NO tienen datos de compra/venta completos**:
1. SUNLIGHT A70 (2022) - Sin datos de compra
2. SUNLIGHT V60 (2022) - Sin datos de compra
3. RAPIDO R-8066 DF (2021) - Sin datos de compra
4. Ford Puma (2023) - Sin datos de compra

✅ **Esto es correcto y esperado.**

## 🚀 Despliegue

- ✅ Cambios commiteados: `bfc7b4d`
- ✅ Push a GitHub: `main`
- ⏳ Despliegue automático en AWS Amplify (2-3 minutos)
- 🔗 Producción: https://www.mapafurgocasa.com/admin/datos-mercado

## 📝 Notas Técnicas

- Los precios se normalizan automáticamente para incluir el impuesto de matriculación
- Los errores de inserción en `datos_mercado_autocaravanas` no bloquean el guardado principal
- Los logs ayudan a detectar problemas futuros
- La migración fue one-time, no es necesario ejecutarla de nuevo

---

**Fecha:** 21 de noviembre de 2025  
**Ejecutado por:** Sistema automático  
**Estado:** ✅ Completado exitosamente

