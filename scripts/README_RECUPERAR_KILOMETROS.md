# 🚗 Script: Recuperar Kilómetros en Datos de Mercado

## 📋 Problema

Muchos registros en la tabla `datos_mercado_autocaravanas` tienen `kilometros = null`:

- Reduce la utilidad de los datos para valoraciones IA
- Comparables sin KM son menos precisos
- Dificulta el análisis de depreciación

## ✅ Solución

Este script recupera los kilómetros desde las **fuentes originales**:

### Estrategias de Recuperación

#### 1️⃣ **Compras/Ventas de Usuario**
```sql
datos_mercado.tipo_dato = 'Compra Real Usuario'
→ Buscar en: vehiculo_valoracion_economica.kilometros_compra
  (matching por precio + fecha ±1 día)

datos_mercado.tipo_dato = 'Venta Real Usuario'
→ Buscar en: vehiculo_valoracion_economica.kilometros_venta
  (matching por precio + fecha ±1 día)
```

#### 2️⃣ **Historial de Vehículos Registrados**
```sql
Buscar vehículos con misma marca/modelo/año
→ Consultar: vehiculo_kilometraje (historial)
→ Filtrar: fecha ±30 días de la transacción
→ Tomar: KM más cercano en fecha
```

---

## 🚀 Uso

### **1. Requisitos**

Tener configurado `.env.local` con:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### **2. Ejecutar**

```bash
node scripts/recuperar-kilometros-datos-mercado.js
```

### **3. Salida Esperada**

```
🔍 Iniciando recuperación de kilómetros...

📊 Registros sin kilómetros: 45

🔎 Procesando: Weinsberg Carabaja 600 MQ (2023)
   ID: abc123
   Origen: Compra Real Usuario
   Tipo: Compra Real Usuario
   ✅ KM recuperado de compra: 15000
   💾 Actualizado con 15000 km

🔎 Procesando: Adria Twin Plus 600 (2024)
   ID: def456
   Origen: SerpAPI
   Tipo: Valoración IA
   ⚠️ No se encontraron KM en fuentes originales

============================================================
📊 RESUMEN DE RECUPERACIÓN
============================================================
Total registros sin KM:     45
✅ KM recuperados:          28
⚠️ No encontrados:          17
📈 Tasa de recuperación:    62.2%
============================================================

✅ Proceso completado
```

---

## 📊 Impacto Esperado

| Métrica | Antes | Después |
|---------|-------|---------|
| Registros sin KM | ~45 | ~17 |
| Tasa de completitud | 58% | 84% |
| Utilidad para IA | Media | Alta |

---

## ⚠️ Notas Importantes

1. **No-destructivo:** Solo actualiza `kilometros` en registros con `null`
2. **Seguro:** Usa `SUPABASE_SERVICE_ROLE_KEY` (necesario para actualizar)
3. **Logs detallados:** Muestra cada registro procesado
4. **Idempotente:** Puedes ejecutarlo múltiples veces sin problemas

---

## 🔧 Personalización

### Ajustar Tolerancia de Fechas

```javascript
// Línea 67 y 85 - Cambiar ±1 día
.gte('fecha_compra', new Date(Date.parse(dato.fecha_transaccion) - 86400000)...)
// 86400000 ms = 1 día
// Para ±3 días: 259200000 ms
```

### Ajustar Rango de Búsqueda en Historial

```javascript
// Línea 111 - Cambiar ±30 días
if (diffDias <= 30) {
// Para ±60 días: diffDias <= 60
```

---

## 🐛 Troubleshooting

### Error: "Faltan variables de entorno"
```bash
# Verificar .env.local
cat .env.local | grep SUPABASE
```

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### Tasa de recuperación baja (<40%)
- **Causa:** Datos de SerpAPI sin fuente original
- **Solución:** Mejorar extractor de SerpAPI para capturar KM

---

## 📈 Seguimiento

Después de ejecutar, verificar en admin:

```
https://www.mapafurgocasa.com/admin/datos-mercado

Filtros:
- Estado: Todos
- Ordenar por: Kilómetros (asc)
- Verificar que menos registros tengan "-"
```

---

## 🔄 Mantenimiento

**Frecuencia recomendada:**
- Ejecutar cada vez que se haga migración de datos
- Ejecutar mensualmente para datos de SerpAPI

**Automación futura:**
- Integrar en pipeline de migración
- Ejecutar automáticamente al insertar registros sin KM

---

## 📝 Changelog

- **v1.0** (18/11/2025): Versión inicial
  - Recuperación desde compras/ventas de usuario
  - Recuperación desde historial de KM
  - Logs detallados

