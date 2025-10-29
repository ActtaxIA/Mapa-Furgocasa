# 🌍 Solución Completa: Filtro de Países

## 📋 Resumen del Problema

Las áreas de Portugal (y posiblemente otros países) se estaban guardando como "España" porque el código de búsqueda masiva tenía el país **hardcodeado**.

### Síntomas
- ✅ Al filtrar por "España": 863 áreas
- ❌ Al filtrar por "Portugal": solo 2 áreas (cuando deberían ser 35+)
- ❌ Provincias portuguesas (Faro, Lisboa, Porto) aparecían con país "España"

## 🔧 Soluciones Aplicadas

### 1. Código de Búsqueda Masiva Corregido

**Archivo modificado**: `app/admin/areas/busqueda-masiva/page.tsx`

**Antes (línea 471)**:
```typescript
let pais = 'España'  // ❌ SIEMPRE España
```

**Después**:
```typescript
let pais = 'España' // valor por defecto

// Detectar el país desde la dirección
const ultimaParte = addressParts[addressParts.length - 1].toLowerCase()

if (ultimaParte.includes('spain') || ultimaParte.includes('españa')) {
  pais = 'España'
} else if (ultimaParte.includes('portugal')) {
  pais = 'Portugal'
} else if (ultimaParte.includes('andorra')) {
  pais = 'Andorra'
} else if (ultimaParte.includes('france') || ultimaParte.includes('francia')) {
  pais = 'Francia'
} else if (ultimaParte.includes('morocco') || ultimaParte.includes('marruecos')) {
  pais = 'Marruecos'
} else {
  pais = addressParts[addressParts.length - 1]
}
```

### 2. Normalización del Filtro en el Mapa

**Archivo modificado**: `app/(public)/mapa/page.tsx`

- ✅ Se normalizan los valores con `.trim()` al comparar
- ✅ Se agregan logs de depuración en desarrollo
- ✅ Se muestra distribución de áreas por país al cargar

### 3. Script SQL Completo para Corregir Datos Existentes

**Archivo creado**: `supabase/fix-paises-completo.sql`

Este script detecta áreas mal etiquetadas usando **4 criterios**:

1. **Por Provincia**: 18 distritos portugueses conocidos
2. **Por Ciudad**: 50+ ciudades portuguesas principales
3. **Por Dirección**: Busca "Portugal", "PT", etc. en la dirección
4. **Por Código Postal**: Formato portugués `XXXX-XXX`

## 📝 Cómo Usar el Script SQL

### Paso 1: Revisar qué se va a corregir

Ejecuta la **SECCIÓN 1** del script en Supabase SQL Editor. Esto te mostrará:

```sql
-- Ver cuántas áreas se detectaron por cada criterio
SELECT 
  'Por Provincia' as criterio,
  COUNT(*) as total,
  provincia
FROM areas
WHERE activo = true
  AND pais != 'Portugal'
  AND provincia IN (
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
    'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
    'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
    'Viana do Castelo', 'Vila Real', 'Viseu',
    'Açores', 'Madeira', 'Algarve'
  )
GROUP BY provincia
ORDER BY total DESC;
```

### Paso 2: Aplicar las correcciones

Ejecuta la **SECCIÓN 2** del script. Esto actualizará todas las áreas detectadas.

```sql
-- Ejemplo: Corregir por provincia
UPDATE areas
SET pais = 'Portugal'
WHERE activo = true
  AND pais != 'Portugal'
  AND provincia IN ('Faro', 'Lisboa', 'Porto', ...);
```

### Paso 3: Verificar los resultados

Ejecuta la **SECCIÓN 3** del script para ver:

```sql
-- Resumen final
SELECT 
  pais,
  COUNT(*) as total_areas
FROM areas
GROUP BY pais
ORDER BY total_areas DESC;
```

Deberías ver:
- **España**: ~820-830 áreas
- **Portugal**: ~35-45 áreas
- **Andorra**: 4 áreas

## 🎯 Criterios de Detección

### Provincias Portuguesas
```
Aveiro, Beja, Braga, Bragança, Castelo Branco,
Coimbra, Évora, Faro, Guarda, Leiria,
Lisboa, Portalegre, Porto, Santarém, Setúbal,
Viana do Castelo, Vila Real, Viseu,
Açores, Madeira, Algarve
```

### Ciudades Portuguesas Principales
```
Lisboa, Porto, Faro, Coimbra, Braga, Setúbal,
Funchal, Évora, Aveiro, Leiria, Viseu, Guarda,
Portimão, Albufeira, Lagos, Cascais, Sintra,
Vila Nova de Gaia, Nazaré, Peniche, Óbidos,
Ericeira, Tavira, Sagres, y 30+ más...
```

### Patrones en Dirección
- Contiene "Portugal"
- Contiene ", PT"
- Contiene "Portuguese"

### Código Postal Portugués
- Formato: `XXXX-XXX` (ejemplo: `8500-001`)

## ✅ Resultados Esperados

### Antes de la Corrección
```
España: 863 áreas
Portugal: 2 áreas ❌
Andorra: 4 áreas
```

### Después de la Corrección
```
España: ~825 áreas
Portugal: ~38 áreas ✅
Andorra: 4 áreas
```

## 🔍 Verificación Final

### En Supabase
Ejecuta este SQL para ver si quedaron áreas portuguesas sin corregir:

```sql
SELECT 
  nombre,
  ciudad,
  provincia,
  pais,
  direccion
FROM areas
WHERE activo = true
  AND pais != 'Portugal'
  AND (
    direccion ILIKE '%Portugal%' OR
    provincia IN ('Faro', 'Lisboa', 'Porto', 'Aveiro', ...)
  )
LIMIT 50;
```

### En la Web
1. Ve a https://www.mapafurgocasa.com/mapa
2. Abre DevTools (F12) → Console
3. Busca: `📊 Distribución de áreas por país:`
4. Selecciona "Portugal" en el filtro
5. Verifica que aparecen todas las áreas portuguesas

## 📚 Archivos Relacionados

- ✅ `app/admin/areas/busqueda-masiva/page.tsx` - Código corregido
- ✅ `app/(public)/mapa/page.tsx` - Filtro normalizado
- ✅ `supabase/fix-paises-completo.sql` - Script de corrección
- ✅ `DIAGNOSTICO_FILTRO_PAISES.md` - Diagnóstico inicial
- ✅ `SOLUCION_FILTRO_PAISES_COMPLETA.md` - Este archivo

## 🚀 Para Futuras Búsquedas

A partir de ahora, cuando agregues áreas mediante **Búsqueda Masiva**:

1. El país se detectará **automáticamente** desde la dirección de Google Maps
2. Ya no se guardará todo como "España"
3. Se detectarán correctamente: Portugal, Andorra, Francia, Marruecos, etc.

## 💡 Si Encuentras Más Áreas Mal Etiquetadas

Si después de ejecutar el script todavía encuentras áreas portuguesas marcadas como España:

1. **Revisa la dirección y provincia** de esas áreas en Supabase
2. **Agrégalas** a las listas del script SQL
3. **Vuelve a ejecutar** las correcciones

O simplemente edítalas manualmente en:
```
https://www.mapafurgocasa.com/admin/areas
```

---

**Fecha**: 29 de octubre de 2025  
**Estado**: ✅ Solucionado

