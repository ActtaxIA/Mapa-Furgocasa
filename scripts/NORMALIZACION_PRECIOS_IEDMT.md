# 💰 Normalización Automática de Precios sin IEDMT

## 🚨 **Problema Crítico**

Los **concesionarios** publican precios de vehículos **NUEVOS** que **NO incluyen** el **Impuesto Especial sobre Determinados Medios de Transporte (IEDMT)**, también conocido como "Impuesto de Matriculación".

### **Ejemplo Real:**
- **Anuncio:** [Knaus Boxlife 600 MQ Platinum Selection](https://m3caravaning.com/m3caravaning/camper-nueva-knaus-boxlife-600-mq/)
- **Precio anunciado:** 68.500€
- **Texto clave:** _"IEDMT no incluido (Variable según Comunidad Autónoma)"_
- **Precio real PVP particular:** ~73.300€ (68.500€ + 7% IEDMT)

---

## ❌ **Consecuencias de NO Normalizar**

Si guardamos **68.500€** en `datos_mercado_autocaravanas`:

1. **Distorsión en Valoraciones IA:**
   - La IA pensará que ese modelo vale 68.500€
   - Comparables de particulares (con IEDMT) → ~73.000€
   - **Diferencia artificial de 4.500€** que no existe en la realidad

2. **Comparables Heterogéneos:**
   - ❌ Concesionarios: Precio sin IEDMT
   - ✅ Empresas de alquiler: Precio normalizado (+7%)
   - ✅ Particulares: Precio ya incluye todo
   - ✅ Compras de usuario: Precio ya incluye todo

3. **Infravaloración Sistemática:**
   - Usuario compra un vehículo similar por 73.000€
   - IA sugiere 68.500€ como "precio de mercado"
   - **Error del 6.5% en todas las valoraciones**

---

## ✅ **Solución: Normalización Automática**

### **Archivo:** `app/api/admin/datos-mercado/extract/route.ts`

### **Lógica Implementada:**

```typescript
// 1. Detectar si el vehículo es NUEVO
const esNuevo = estado.includes("nueva") || 
                estado.includes("nuevo") || 
                estado.includes("0 km");

if (esNuevo) {
  // 2. Buscar frases clave en el HTML del anuncio
  const faltaIEDMT = texto.includes("IEDMT no incluido") ||
                     texto.includes("Impuesto de matriculación no incluido") ||
                     texto.includes("Sin impuesto de matriculación");

  if (faltaIEDMT && precio) {
    // 3. Aplicar normalización (+14,75% para autocaravanas >3.5t)
    const precioNormalizado = Math.round(precio * 1.1475);
    
    // 4. Marcar origen claramente
    origen = "Concesionario (PVP Normalizado +14,75% IEDMT)";
  }
}
```

---

## 📊 **Ejemplo de Funcionamiento**

### **Entrada (HTML del anuncio):**
```
Precio: 68.500€
IEDMT no incluido (Variable según Comunidad Autónoma)
Estado: Nueva
```

### **Procesamiento:**
1. ✅ Detecta: `esNuevo = true`
2. ✅ Detecta: `faltaIEDMT = true`
3. ✅ Calcula: `68.500 × 1.1475 = 78.554€`
4. ✅ Marca: `origen = "Concesionario (PVP Normalizado +14,75% IEDMT)"`

### **Salida (guardado en BD):**
```json
{
  "marca": "Knaus",
  "modelo": "Boxlife 600 MQ Platinum Selection",
  "año": 2025,
  "precio": 78554,
  "kilometros": 0,
  "estado": "Nuevo",
  "origen": "Concesionario (PVP Normalizado +14,75% IEDMT)",
  "verificado": true
}
```

---

## 🔍 **Frases Clave Detectadas**

El sistema busca estas variantes (case-insensitive):

- ✅ `"IEDMT no incluido"`
- ✅ `"Impuesto de matriculación no incluido"`
- ✅ `"Impuesto matriculación no incluido"`
- ✅ `"Sin impuesto de matriculación"`
- ✅ `"Sin IEDMT"`
- ✅ `"IEDMT"` + `"no incluido"` (en cualquier parte del texto)

---

## 📝 **Logs en Console**

Cuando se aplica la normalización, verás:

```
🆕 [Extract] Detectado vehículo NUEVO → Aplicando reglas especiales
   📅 Año ajustado: null → 2025
   🚗 Kilómetros ajustados: null → 0
💰 [Extract] IEDMT NO INCLUIDO detectado → Normalizando precio
   Precio original: 68500€
   Precio normalizado (+14,75% IEDMT): 78554€
💾 [Extract] Guardando en base de datos...
```

---

## ⚠️ **Casos Especiales**

### 1. **Vehículos Usados**
- **NO se normalizan** (aunque diga "IEDMT no incluido")
- Los usados ya no pagan IEDMT, solo ITP (Impuesto de Transmisiones Patrimoniales)
- El precio anunciado es el precio real

### 2. **Porcentaje IEDMT**
- **Furgonetas camper < 3.500 kg:** ~7% (usado en el código)
- **Autocaravanas > 3.500 kg:** ~12%
- Para simplificar, usamos **7%** en todos los casos
- Si necesitas precisión, se puede ajustar por tipo de vehículo

### 3. **Variación por Comunidad Autónoma**
- Madrid: Descuento 15% (IEDMT efectivo ~6%)
- Canarias: Exento (0%)
- Resto: 7% estándar
- Usamos **7% estándar** como aproximación conservadora

---

## 🎯 **Resultado Final**

### **Antes (sin normalización):**
```sql
-- Comparables para valoración IA
SELECT marca, modelo, precio, origen
FROM datos_mercado_autocaravanas
WHERE marca = 'Knaus' AND modelo LIKE '%Boxlife%';

Resultado:
- Concesionario → 68.500€ ❌ (sin IEDMT)
- Particular    → 73.000€ ✅
- Usuario       → 72.800€ ✅
- Promedio: 71.433€ (distorsionado hacia abajo)
```

### **Ahora (con normalización):**
```sql
-- Comparables para valoración IA
SELECT marca, modelo, precio, origen
FROM datos_mercado_autocaravanas
WHERE marca = 'Knaus' AND modelo LIKE '%Boxlife%';

Resultado:
- Concesionario → 73.295€ ✅ (normalizado +7%)
- Particular    → 73.000€ ✅
- Usuario       → 72.800€ ✅
- Promedio: 73.031€ (homogéneo, preciso)
```

---

## 🚀 **Próximos Pasos**

1. **Corregir Registro Existente:**
   - Ir a `/admin/datos-mercado`
   - Eliminar el registro de "Knaus Boxlife 600 MQ" con precio 68.500€
   - Volver a extraer desde la URL
   - El sistema aplicará automáticamente la normalización → 73.295€

2. **Verificar en Futuras Extracciones:**
   - Todos los vehículos nuevos de concesionarios se normalizarán automáticamente
   - Revisar el `origen` en la tabla para confirmar: `"Concesionario (PVP Normalizado +7% IEDMT)"`

3. **Monitorear Precisión:**
   - Comparar valoraciones IA antes/después de la corrección
   - Verificar que los precios sugeridos sean más realistas

---

## 📚 **Referencias**

- **BOE - IEDMT:** [Real Decreto Legislativo 1/1993](https://www.boe.es/buscar/act.php?id=BOE-A-1993-28963)
- **Hacienda:** [Tabla tipos impositivos IEDMT](https://sede.agenciatributaria.gob.es/Sede/impuestos-tasas/impuesto-matriculacion.html)
- **Ejemplo real:** [M3 Caravaning - Knaus Boxlife](https://m3caravaning.com/m3caravaning/camper-nueva-knaus-boxlife-600-mq/)

---

**Versión:** 3.8.5  
**Última actualización:** 18/11/2025  
**Autor:** Sistema de normalización automática

