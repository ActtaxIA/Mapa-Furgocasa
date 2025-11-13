# 🗺️ Mapeo de Campos: Formularios → Base de Datos

**Versión:** 1.0  
**Fecha:** 13 de noviembre de 2025

---

## 📋 Tabla: `mantenimientos`

### Campos en BD (PostgreSQL)
```sql
- id (UUID)
- vehiculo_id (UUID)
- user_id (UUID)
- tipo (VARCHAR) -- 'ITV', 'Cambio aceite', 'Revisión', etc.
- fecha (DATE)
- kilometraje (INTEGER)
- descripcion (TEXT)
- coste (DECIMAL)
- proximo_mantenimiento (DATE)
- kilometraje_proximo (INTEGER)
- alertar_dias_antes (INTEGER)
- taller (VARCHAR)
- direccion_taller (TEXT)
- telefono_taller (VARCHAR)
- fotos_urls (TEXT[])
- documentos_urls (TEXT[])
- notas (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Mapeo Formulario → BD
| Campo Formulario | Campo BD | Notas |
|-----------------|----------|-------|
| `tipo_mantenimiento` | `tipo` | ⚠️ DIFERENTE |
| `descripcion` | `descripcion` | ✅ IGUAL |
| `fecha_realizada` o `fecha_programada` | `fecha` | ⚠️ DIFERENTE |
| `kilometraje` | `kilometraje` | ✅ IGUAL |
| `coste` | `coste` | ✅ IGUAL |
| `taller` | `taller` | ✅ IGUAL |
| `ubicacion_taller` | `direccion_taller` | ⚠️ DIFERENTE |
| `notas` | `notas` | ✅ IGUAL |
| `proximo_mantenimiento_km` | `kilometraje_proximo` | ⚠️ DIFERENTE |
| `proximo_mantenimiento_fecha` | `proximo_mantenimiento` | ⚠️ DIFERENTE |

### Interface TypeScript Correcta
```typescript
interface Mantenimiento {
  id: string
  vehiculo_id: string
  user_id: string
  tipo: string // NO tipo_mantenimiento
  fecha: string // NO fecha_realizada
  kilometraje: number | null
  descripcion: string | null
  coste: number | null
  proximo_mantenimiento: string | null // NO proximo_mantenimiento_fecha
  kilometraje_proximo: number | null // NO proximo_mantenimiento_km
  taller: string | null
  direccion_taller: string | null // NO ubicacion_taller
  telefono_taller: string | null
  notas: string | null
  created_at: string
  updated_at: string
}
```

---

## 🔧 Tabla: `averias`

### Campos en BD (PostgreSQL)
```sql
- id (UUID)
- vehiculo_id (UUID)
- user_id (UUID)
- titulo (VARCHAR) NOT NULL
- categoria (VARCHAR) -- 'motor', 'electricidad', 'chapa', etc.
- descripcion (TEXT) NOT NULL
- fecha_averia (DATE)
- fecha_resolucion (DATE)
- kilometraje (INTEGER)
- coste_reparacion (DECIMAL)
- coste_total (DECIMAL)
- taller (VARCHAR)
- severidad (VARCHAR) -- 'baja', 'media', 'alta', 'critica'
- estado (VARCHAR) -- 'pendiente', 'en_reparacion', 'resuelto'
- en_garantia (BOOLEAN)
- notas (TEXT)
- fotos_urls (TEXT[])
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Mapeo Formulario → BD
| Campo Formulario | Campo BD | Notas |
|-----------------|----------|-------|
| `tipo_averia` | `categoria` | ⚠️ DIFERENTE |
| `descripcion` | `descripcion` | ✅ IGUAL (NOT NULL en BD) |
| `fecha_averia` | `fecha_averia` | ✅ IGUAL |
| `fecha_resolucion` | `fecha_resolucion` | ✅ IGUAL |
| `kilometraje` | `kilometraje` | ✅ IGUAL |
| `coste_mano_obra` | `coste_reparacion` | ⚠️ DIFERENTE |
| `coste_piezas` | ❌ NO EXISTE | Se suma a coste_total |
| `taller` | `taller` | ✅ IGUAL |
| `gravedad` | `severidad` | ⚠️ DIFERENTE + Mapeo de valores |
| `estado` | `estado` | ⚠️ DIFERENTE + Mapeo de valores |
| `garantia` | `en_garantia` | ⚠️ DIFERENTE |
| `notas` | `notas` | ✅ IGUAL |

### Mapeo de Valores (Enums)
#### Gravedad → Severidad
| Formulario | BD |
|-----------|-----|
| `leve` | `baja` |
| `moderada` | `media` |
| `grave` | `alta` |
| `critica` | `critica` |

#### Estado (Formulario → BD)
| Formulario | BD |
|-----------|-----|
| `pendiente` | `pendiente` |
| `en_reparacion` | `en_reparacion` |
| `reparada` | `resuelto` |

### Interface TypeScript Correcta
```typescript
interface Averia {
  id: string
  vehiculo_id: string
  user_id: string
  titulo: string // NOT NULL
  categoria: string // NO tipo_averia
  descripcion: string // NOT NULL
  fecha_averia: string
  fecha_resolucion: string | null
  kilometraje: number | null
  coste_reparacion: number | null // NO coste_mano_obra
  coste_total: number | null
  taller: string | null
  severidad: 'baja' | 'media' | 'alta' | 'critica' // NO gravedad
  estado: 'pendiente' | 'en_reparacion' | 'resuelto' // NO 'reparada'
  en_garantia: boolean // NO garantia
  notas: string | null
  created_at: string
  updated_at: string
}
```

---

## ✨ Tabla: `vehiculo_mejoras`

### Campos en BD (PostgreSQL)
```sql
- id (UUID)
- vehiculo_id (UUID)
- user_id (UUID)
- titulo (VARCHAR) NOT NULL
- categoria (VARCHAR) -- 'interior', 'exterior', 'mecanica', etc.
- descripcion (TEXT) NOT NULL
- fecha (DATE)
- coste_materiales (DECIMAL)
- coste_mano_obra (DECIMAL)
- coste_total (DECIMAL)
- instalado_por (VARCHAR)
- notas (TEXT)
- fotos_urls (TEXT[])
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Mapeo Formulario → BD
| Campo Formulario | Campo BD | Notas |
|-----------------|----------|-------|
| `nombre` | `titulo` | ⚠️ DIFERENTE (NOT NULL en BD) |
| `tipo_mejora` | `categoria` | ⚠️ DIFERENTE |
| `descripcion` | `descripcion` | ✅ IGUAL (NOT NULL en BD) |
| `fecha_instalacion` | `fecha` | ⚠️ DIFERENTE |
| `coste_producto` | `coste_materiales` | ⚠️ DIFERENTE |
| `coste_instalacion` | `coste_mano_obra` | ⚠️ DIFERENTE (pero mismo nombre) |
| `proveedor` | `instalado_por` | ⚠️ DIFERENTE |
| `marca` | ❌ NO EXISTE | - |
| `modelo` | ❌ NO EXISTE | - |
| `ubicacion_instalacion` | ❌ NO EXISTE | - |
| `garantia_meses` | ❌ NO EXISTE | - |
| `mejora_valor` | ❌ NO EXISTE | - |
| `notas` | `notas` | ✅ IGUAL |

### Interface TypeScript Correcta
```typescript
interface Mejora {
  id: string
  vehiculo_id: string
  user_id: string
  titulo: string // NO nombre, NOT NULL
  categoria: string // NO tipo_mejora
  descripcion: string // NOT NULL
  fecha: string // NO fecha_instalacion
  coste_materiales: number | null // NO coste_producto
  coste_mano_obra: number | null // NO coste_instalacion
  coste_total: number | null
  instalado_por: string | null // NO proveedor
  notas: string | null
  created_at: string
  updated_at: string
}
```

---

## ⚠️ Errores Comunes a Evitar

### 1. Usar nombres de formulario en lugar de nombres de BD
❌ **MAL:**
```typescript
mantenimiento.tipo_mantenimiento // NO EXISTE en BD
averia.tipo_averia // NO EXISTE en BD
mejora.nombre // NO EXISTE en BD
```

✅ **BIEN:**
```typescript
mantenimiento.tipo // ✅
averia.categoria // ✅
mejora.titulo // ✅
```

### 2. No mapear correctamente los valores de enums
❌ **MAL:**
```typescript
gravedad: 'leve' // BD espera 'baja'
estado: 'reparada' // BD espera 'resuelto'
```

✅ **BIEN:**
```typescript
severidad: 'baja' // ✅
estado: 'resuelto' // ✅
```

### 3. Enviar campos que no existen en BD
❌ **MAL:**
```typescript
const datos = {
  marca: mejora.marca, // ❌ NO EXISTE
  modelo: mejora.modelo, // ❌ NO EXISTE
  mejora_valor: mejora.mejora_valor // ❌ NO EXISTE
}
```

✅ **BIEN:**
```typescript
const datos = {
  titulo: mejora.titulo, // ✅
  categoria: mejora.categoria, // ✅
  // Solo enviar campos que existen en BD
}
```

### 4. No manejar campos NOT NULL
❌ **MAL:**
```typescript
descripcion: formData.descripcion || null // ❌ Puede fallar si es NOT NULL
titulo: '' // ❌ String vacío en campo NOT NULL
```

✅ **BIEN:**
```typescript
descripcion: formData.descripcion || 'Sin descripción' // ✅
titulo: formData.nombre || 'Mejora sin nombre' // ✅
```

---

## 🔄 Checklist de Verificación

### Para cada componente (Mantenimientos/Averías/Mejoras):

- [ ] **Interface TypeScript**: ¿Usa nombres de BD?
- [ ] **handleSubmit**: ¿Mapea correctamente formulario → BD?
- [ ] **handleEditar**: ¿Mapea correctamente BD → formulario?
- [ ] **Listado**: ¿Usa nombres de BD para mostrar datos?
- [ ] **Enums**: ¿Mapea valores correctamente (ej: leve → baja)?
- [ ] **Campos NOT NULL**: ¿Tiene valores por defecto?
- [ ] **Campos inexistentes**: ¿Se evitan campos que no están en BD?
- [ ] **TypeScript**: ¿Compila sin errores?

---

## 📝 Notas de Implementación

### Mantenimientos
✅ **CORRECTO** - Todos los campos mapeados correctamente

### Averías
✅ **CORRECTO** - Interface y mapeos corregidos (13-nov-2025)

### Mejoras
✅ **CORRECTO** - Campos mapeados, inexistentes removidos

---

**Fecha de creación:** 13 de noviembre de 2025  
**Última actualización:** 13 de noviembre de 2025  
**Mantenedor:** Equipo Mapa Furgocasa

