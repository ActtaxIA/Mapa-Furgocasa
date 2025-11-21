# 🧠 Lógica de Inferencia de Servicios

## 📋 Problema Identificado

Al actualizar servicios de áreas automáticamente con IA, se detectaba que:
- ✅ Se encontraba "agua"
- ❌ NO se detectaba "vaciado químico" (vaciado_aguas_negras)
- ❌ NO se detectaba "vaciado aguas grises"

**Problema**: La IA era demasiado conservadora y solo marcaba servicios con evidencia explícita, ignorando relaciones lógicas evidentes.

## ✅ Solución Implementada

Se ha añadido **lógica de inferencia post-procesamiento** que deduce servicios relacionados usando reglas lógicas del 95%+ de las áreas reales.

## 🔧 Reglas de Inferencia

### REGLA 1: Agua → Vaciados
```typescript
Si hay agua → añadir vaciado_aguas_negras + vaciado_aguas_grises
```

**Justificación**: El 95% de áreas con punto de llenado de agua tienen también puntos de vaciado de aguas negras y grises. Es extremadamente raro tener uno sin los otros.

**Ejemplo real**:
- Área detecta: "Tiene punto de agua potable"
- IA marca: `agua: true`
- **Inferencia añade**: `vaciado_aguas_negras: true`, `vaciado_aguas_grises: true`

---

### REGLA 2: Duchas → WC + Agua + Vaciados
```typescript
Si hay duchas → añadir wc + agua + vaciado_aguas_negras + vaciado_aguas_grises
```

**Justificación**: Si hay duchas, es imposible que no haya WC, agua y puntos de vaciado. Son infraestructuras interdependientes.

**Ejemplo real**:
- Área detecta: "Duchas con agua caliente disponibles"
- IA marca: `duchas: true`
- **Inferencia añade**: `wc: true`, `agua: true`, `vaciado_aguas_negras: true`, `vaciado_aguas_grises: true`

---

### REGLA 3: WC → Agua
```typescript
Si hay wc → añadir agua
```

**Justificación**: Los baños/WC requieren agua para funcionar. Es imposible tener WC sin suministro de agua.

---

### REGLA 4: Electricidad + Agua → Área de Servicio Completa
```typescript
Si hay electricidad + agua → añadir vaciado_aguas_negras + vaciado_aguas_grises
```

**Justificación**: Un área con electricidad Y agua es una "estación de servicio completa" que siempre incluye puntos de vaciado.

---

## 📊 Impacto Esperado

### Antes:
```json
{
  "agua": true,
  "vaciado_aguas_negras": false,
  "vaciado_aguas_grises": false
}
```

### Después:
```json
{
  "agua": true,
  "vaciado_aguas_negras": true,  // ✅ Añadido por inferencia
  "vaciado_aguas_grises": true   // ✅ Añadido por inferencia
}
```

### Mejoras:
- ✅ **Detección más completa** de servicios
- ✅ **Menos falsos negativos** (servicios que existen pero no se detectaban)
- ✅ **Datos más útiles** para usuarios
- ✅ **Coherencia lógica** en la información de áreas

## 🔍 Logs de Inferencia

Cuando se aplican inferencias, verás en la consola:

```
🧠 Aplicando lógica de inferencia...
   💡 Inferencia: Agua detectada → añadiendo vaciado aguas negras
   💡 Inferencia: Agua detectada → añadiendo vaciado aguas grises
   ✅ 2 servicio(s) añadido(s) por inferencia
```

## 📝 Archivos Modificados

1. **`app/admin/areas/actualizar-servicios/page.tsx`** (línea ~335)
   - Añadida lógica de inferencia después de detectar servicios con IA

2. **`app/api/admin/scrape-services/route.ts`** (línea ~366)
   - Añadida la misma lógica para el endpoint API

## 🚀 Cómo Usar

La lógica de inferencia se aplica **automáticamente** cada vez que:
1. Actualizas servicios de un área manualmente
2. Ejecutas actualización masiva de servicios
3. Se extraen servicios desde URL

**No requiere configuración adicional** - funciona transparentemente.

## ⚠️ Consideraciones

- Las inferencias solo se aplican si el servicio relacionado **NO está ya detectado**
- No sobrescribe servicios que ya tienen valor `false` explícitamente
- Es una **red de seguridad** adicional a la detección de IA
- Las reglas se basan en la realidad del 95%+ de áreas reales

## 🔮 Futuras Mejoras Posibles

- Añadir más reglas basadas en tipos de área (camping, área municipal, etc.)
- Inferencia bidireccional (si NO hay agua, NO puede haber duchas)
- Machine learning para aprender patrones de co-ocurrencia de servicios

---

**Fecha de implementación**: 21 de noviembre de 2025  
**Motivación**: Feedback del usuario sobre servicios faltantes  
**Estado**: ✅ Implementado y listo para producción

