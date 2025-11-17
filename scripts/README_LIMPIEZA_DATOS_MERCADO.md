# 🧹 Script de Limpieza de Datos de Mercado

## 📋 Descripción

Script automático para limpiar y mantener la tabla `datos_mercado_autocaravanas` en óptimas condiciones.

---

## 🎯 ¿Qué Hace?

### 1. Elimina Duplicados 🗑️
Identifica y borra registros duplicados basándose en:
- Marca
- Modelo
- Año
- Precio
- Kilometraje

**Ejemplo:** Si hay 3 registros de "Adria Twin Plus 2023, 60.000€, 50.000km", solo deja 1.

### 2. Archiva Datos Antiguos 📅
Marca como "no verificados" los datos con más de **18 meses** de antigüedad.

**Razón:** Precios de hace 18+ meses ya no reflejan el mercado actual.

### 3. Marca Datos Sospechosos ⚠️
Identifica y marca como "no verificados" registros con:
- Precio irreal (<5.000€ o >500.000€)
- Año imposible (<1990 o futuro)
- Kilometraje absurdo (<0 o >1.000.000 km)
- Sin marca ni modelo

---

## 🚀 Cómo Usar

### Opción 1: Ejecución Directa (Recomendado)

```bash
# Desde la raíz del proyecto
npx ts-node scripts/limpiar-datos-mercado.ts
```

### Opción 2: Compilar y Ejecutar

```bash
# Compilar
npx tsc scripts/limpiar-datos-mercado.ts

# Ejecutar
node scripts/limpiar-datos-mercado.js
```

---

## 📊 Ejemplo de Salida

```
🧹 Iniciando limpieza de datos_mercado_autocaravanas...

📥 Cargando datos de mercado...
✅ Cargados 262 registros

🔄 Paso 1/3: Eliminando duplicados...
   🗑️  Duplicado: Adria Twin Plus 2023 - 60000€
   🗑️  Duplicado: Weinsberg Carabus 2025 - 63380€
   ...
   ✅ Lote 1 borrado (45 registros)

📅 Paso 2/3: Marcando datos antiguos (>18 meses)...
   Encontrados 12 datos antiguos
   ✅ 12 datos marcados como no verificados
      📦 Ford Puma - 17/05/2023
      📦 Giottivan 54T - 03/06/2023

🔍 Paso 3/3: Identificando datos sospechosos...
   Encontrados 8 datos sospechosos
   ✅ 8 datos marcados como no verificados
      ⚠️  N/A N/A - Precio: N/A€
      ⚠️  Pilote V600S - Precio: 2500€

============================================================
📊 RESUMEN DE LIMPIEZA
============================================================
📥 Registros iniciales:       262
🗑️  Duplicados eliminados:    45
📅 Antiguos marcados:         12
⚠️  Sospechosos marcados:     8
✅ Registros finales:         217
🔄 Registros verificados:     197
============================================================

📊 Estadísticas finales por fuente:
   SerpAPI: 180 total (150 verificados)
   Valoración IA: 30 total (30 verificados)
   Archivado (>18 meses): 12 total (0 verificados)
   Datos sospechosos/incompletos: 8 total (0 verificados)

✅ Limpieza completada!
🎉 Script finalizado correctamente
```

---

## ⚙️ Configuración

El script usa las siguientes variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_key
```

**IMPORTANTE:** Usa la `SERVICE_ROLE_KEY` (no la `ANON_KEY`) para tener permisos completos.

---

## 🔒 Seguridad

### ¿Qué NO Hace?
- ❌ NO borra datos verificados recientes
- ❌ NO borra datos de ventas reales
- ❌ NO modifica datos de `vehiculo_valoracion_economica`

### ¿Qué Modifica?
- ✅ Borra duplicados exactos
- ✅ Marca antiguos como "no verificados" (no los borra)
- ✅ Marca sospechosos como "no verificados" (no los borra)

**Resultado:** Los datos NO se pierden, solo se marcan para que la IA los ignore.

---

## 📅 ¿Cuándo Ejecutar?

### Recomendado:
- **Mensualmente** - Para mantener la BD limpia
- **Después de 10+ valoraciones IA** - Acumulan duplicados
- **Cuando notes lentitud** - Muchos registros ralentizan queries

### Señales de que Necesitas Limpiar:
- 🔴 >500 registros en `datos_mercado_autocaravanas`
- 🔴 Muchos datos con mismos valores
- 🔴 Valoraciones IA tardan >2 minutos

---

## 🛠️ Mantenimiento

### Personalizar Criterios

Edita `scripts/limpiar-datos-mercado.ts`:

```typescript
// Cambiar antigüedad (default: 18 meses)
hace18Meses.setMonth(hace18Meses.getMonth() - 12) // 12 meses

// Cambiar rango de precios (default: 5.000€ - 500.000€)
if (!dato.precio || dato.precio < 10000 || dato.precio > 300000) {
  return true
}

// Cambiar rango de kilometraje (default: 0 - 1.000.000 km)
if (dato.kilometros && (dato.kilometros < 0 || dato.kilometros > 500000)) {
  return true
}
```

---

## 📚 Documentación Relacionada

- `RESUMEN_SESION_20251117.md` - Contexto de 262 datos de mercado
- `docs/SISTEMA_VALORACION_VENTA.md` - Cómo funciona la valoración IA
- `lib/valoracion/buscar-comparables.ts` - Cómo se obtienen los datos

---

## 🆘 Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Error: "Environment variables not defined"
Verifica que `.env.local` contiene:
```env
SUPABASE_SERVICE_ROLE_KEY=tu_key_aqui
```

### Error: "Permission denied"
Asegúrate de usar `SERVICE_ROLE_KEY`, no `ANON_KEY`.

---

## 📞 Soporte

**Problemas o Dudas:**
- GitHub Issues: `ActtaxIA/Mapa-Furgocasa`
- Email: soporte@mapafurgocasa.com

---

**Creado:** 17 de Noviembre 2025  
**Versión:** 1.0.0  
**Autor:** Acttax IA

