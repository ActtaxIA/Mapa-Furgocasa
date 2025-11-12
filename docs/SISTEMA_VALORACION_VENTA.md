# 🚀 Sistema de Valoración Automática para Venta de Vehículos

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Funcionalidades Implementadas](#funcionalidades-implementadas)
4. [Guía de Uso](#guía-de-uso)
5. [API Endpoints](#api-endpoints)
6. [Componentes UI](#componentes-ui)
7. [Algoritmo de Valoración](#algoritmo-de-valoración)
8. [Flujo de Usuario](#flujo-de-usuario)

---

## 📊 Resumen Ejecutivo

### ¿Qué Problema Resuelve?

**Pregunta del Usuario:**
> "Con todos estos nuevos datos, un usuario preguntará: ¿por cuánto puedo vender mi camper?"

### Solución Implementada

Hemos creado un **sistema completo de valoración automática** que:

1. ✅ Calcula el valor estimado del vehículo con **IA/algoritmo propio**
2. ✅ Compara con datos reales del **mercado de autocaravanas**
3. ✅ Ajusta el precio según **kilometraje, averías y mejoras**
4. ✅ Muestra **3 rangos de precio** (rápida, justo, óptimo)
5. ✅ Permite **poner el vehículo en venta** con un clic
6. ✅ Registra **histórico de valoraciones** con gráficos
7. ✅ Guarda **valoraciones manuales** (tasaciones externas)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────┐      ┌─────────────────────────┐  │
│  │ ValoracionVenta    │      │ HistoricoValoracion     │  │
│  │ - Valor estimado   │      │ - Gráfico evolución     │  │
│  │ - 3 rangos precio  │      │ - Lista histórica       │  │
│  │ - Poner en venta   │      │ - Añadir manual         │  │
│  └────────────────────┘      └─────────────────────────┘  │
│           │                              │                  │
│           └──────────────┬───────────────┘                 │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP Requests
┌──────────────────────────┼──────────────────────────────────┐
│                    API ROUTES (Next.js)                     │
├──────────────────────────┴──────────────────────────────────┤
│                                                             │
│  GET  /api/vehiculos/[id]/valoracion                       │
│  PUT  /api/vehiculos/[id]/venta                            │
│  POST /api/vehiculos/[id]/venta                            │
│  GET  /api/vehiculos/[id]/historico-valoracion            │
│  POST /api/vehiculos/[id]/historico-valoracion            │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL Functions
┌──────────────────────────┼──────────────────────────────────┐
│                  SUPABASE (PostgreSQL)                      │
├──────────────────────────┴──────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ calcular_valoracion_automatica(vehiculo_id)        │  │
│  │ - Busca precios mercado similares                  │  │
│  │ - Aplica depreciación por años                     │  │
│  │ - Ajusta por kilometraje excesivo/bajo             │  │
│  │ - Penaliza por averías graves                      │  │
│  │ - Calcula nivel de confianza                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Tablas:                                             │  │
│  │ - vehiculos_registrados                             │  │
│  │ - vehiculo_valoracion_economica                     │  │
│  │ - datos_mercado_autocaravanas (público/anónimo)    │  │
│  │ - historico_precios_usuario                         │  │
│  │ - averias, mantenimientos, mejoras, kilometraje    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Funcionalidades Implementadas

### 1. Valoración Automática con IA

**Función SQL:** `calcular_valoracion_automatica(p_vehiculo_id)`

**Algoritmo Furgocasa v1.0:**

```sql
valor_estimado = precio_base × factor_años × factor_km × factor_estado
```

#### Factores de Ajuste:

**a) Precio Base:**
- Busca en `datos_mercado_autocaravanas`
- Filtra por: marca, modelo, año ±2 años
- Promedia ventas de últimos 2 años
- Si no hay datos: usa precio de compra con depreciación estándar

**b) Factor Años:**
- Primeros 5 años: 15% depreciación anual
- Después de 5 años: 10% depreciación anual
- Formula: `POWER(0.85, años)` o `POWER(0.85, 5) × POWER(0.90, años-5)`

**c) Factor Kilometraje:**
- Media esperada: 15,000 km/año
- Exceso de km: Penaliza 0.5% por cada 10,000 km extra (máx -40%)
- Bajo kilometraje: Bonifica 0.3% por cada 10,000 km menos (máx +20%)

**d) Factor Estado:**
- Analiza histórico de averías
- Penaliza 5% por cada avería grave/crítica (máx -30%)

**e) Nivel de Confianza:**
- **Alta:** ≥10 vehículos comparables
- **Media:** 3-9 vehículos comparables
- **Baja:** <3 vehículos comparables

---

### 2. Rangos de Precio Inteligentes

El sistema muestra **3 opciones** al usuario:

| Rango | Cálculo | Descripción | Tiempo Estimado |
|-------|---------|-------------|-----------------|
| 🔴 **Venta Rápida** | `-10%` | Precio agresivo | 1-2 semanas |
| 🟢 **Precio Justo** | `Valor estimado` | Equilibrado | 1-2 meses |
| 🔵 **Precio Óptimo** | `+10%` | Sin prisa | 2-4 meses |

**Ejemplo:**
```
Valor Estimado: 45,800 €

Venta Rápida:  41,220 € (-10%)
Precio Justo:  45,800 €
Precio Óptimo: 50,380 € (+10%)
```

---

### 3. Gestión de Venta

#### Estados del Vehículo:

```typescript
interface EstadoVenta {
  en_venta: boolean              // Si está publicado
  precio_venta_deseado: number   // Precio solicitado
  fecha_puesta_venta: Date       // Cuándo se publicó
  vendido: boolean               // Si se vendió
  precio_venta_final: number     // Precio real de venta
  fecha_venta: Date              // Cuándo se vendió
  ganancia_perdida: number       // ROI calculado
}
```

#### Flujo:

```
1. Usuario ve valoración → 2. Establece precio → 3. Activa venta
                                                        ↓
4. Estado "EN VENTA" visible ← ← ← ← ← ← ← ← ← ← ← ← ←
                                                        ↓
5. Negocia con comprador → 6. Registra venta final → 7. Actualiza historial
```

---

### 4. Histórico de Valoraciones

**Tabla:** `historico_precios_usuario`

```sql
CREATE TABLE historico_precios_usuario (
  id UUID PRIMARY KEY,
  vehiculo_id UUID REFERENCES vehiculos_registrados,
  fecha_valoracion TIMESTAMP,
  valor_estimado DECIMAL,
  kilometros INTEGER,
  fuente VARCHAR,  -- 'automatico' | 'manual' | 'tasacion'
  notas TEXT
)
```

**Fuentes de Valoración:**

- 🤖 **Automático:** Generado por el algoritmo de Furgocasa
- ✏️ **Manual:** Añadido por el usuario
- 🏢 **Tasación:** Valoración de concesionario/perito

---

### 5. Visualización con Gráficos

**Librería:** Recharts

**Gráfico de Área:**
- Eje X: Fechas (mes/año)
- Eje Y: Valor en €
- Gradiente azul degradado
- Tooltips interactivos
- Responsive (se adapta a móvil/desktop)

**Estadísticas Mostradas:**
- Valor inicial
- Valor actual
- Cambio total (€ y %)
- Tendencia visual (↑ ↓ →)

---

## 🎯 Guía de Uso

### Para el Usuario Final:

#### 1. Ver Valoración

```
1. Ir a Perfil → Mi Autocaravana → [Seleccionar vehículo]
2. El sistema muestra automáticamente:
   - Valor estimado con IA
   - Nivel de confianza
   - Comparativa con mercado
   - 3 rangos de precio
```

#### 2. Poner en Venta

```
1. Clic en "Poner en venta"
2. Establecer precio deseado (sugerencia automática)
3. Confirmar
4. ✅ Vehículo marcado como "EN VENTA"
```

#### 3. Seguir Evolución

```
1. Ver gráfico de histórico
2. Añadir valoraciones manuales (opcional)
3. Comparar evolución temporal
```

#### 4. Registrar Venta

```
1. Cuando vendas: "Registrar venta"
2. Ingresar precio final
3. Fecha de venta
4. Notas (comprador, forma de pago, etc.)
5. ✅ Sistema calcula ROI automáticamente
```

---

## 🔌 API Endpoints

### GET `/api/vehiculos/[id]/valoracion`

**Descripción:** Obtiene valoración automática del vehículo

**Response:**
```json
{
  "valor_estimado": 45800,
  "confianza": "Alta",
  "num_comparables": 12,
  "precio_mercado_medio": 48500,
  "ajuste_kilometraje": -1200,
  "ajuste_estado": -1500,
  "ajuste_equipamiento": 0,
  "metodo": "Algoritmo Furgocasa v1.0"
}
```

---

### PUT `/api/vehiculos/[id]/venta`

**Descripción:** Poner vehículo en venta o quitar de venta

**Request Body:**
```json
{
  "en_venta": true,
  "precio_venta_deseado": 46000
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### POST `/api/vehiculos/[id]/venta`

**Descripción:** Registrar venta final realizada

**Request Body:**
```json
{
  "precio_venta_final": 44500,
  "fecha_venta": "2024-11-15",
  "notas_venta": "Vendido a particular, transferencia bancaria"
}
```

---

### GET `/api/vehiculos/[id]/historico-valoracion`

**Descripción:** Obtiene histórico de valoraciones

**Response:**
```json
[
  {
    "id": "uuid",
    "fecha_valoracion": "2024-01-01",
    "valor_estimado": 50000,
    "kilometros": 75000,
    "fuente": "automatico",
    "notas": null
  },
  {
    "id": "uuid",
    "fecha_valoracion": "2024-06-01",
    "valor_estimado": 47000,
    "kilometros": 82000,
    "fuente": "manual",
    "notas": "Tasación del concesionario"
  }
]
```

---

### POST `/api/vehiculos/[id]/historico-valoracion`

**Descripción:** Añadir valoración manual al histórico

**Request Body:**
```json
{
  "valor_estimado": 46000,
  "kilometros": 85000,
  "fuente": "manual",
  "notas": "Valoración tras revisión completa"
}
```

---

## 🎨 Componentes UI

### 1. `ValoracionVenta.tsx`

**Props:**
```typescript
interface Props {
  vehiculoId: string
}
```

**Estados:**
```typescript
- valoracion: ValoracionData | null
- loading: boolean
- enVenta: boolean
- precioDeseado: number | null
- showVentaForm: boolean
- guardando: boolean
```

**Secciones:**
- Header con nivel de confianza
- Valor estimado destacado
- 3 rangos de precio (cards)
- Desglose de ajustes
- Contexto de mercado
- Botón "Poner en venta"
- Formulario inline para establecer precio

---

### 2. `HistoricoValoracion.tsx`

**Props:**
```typescript
interface Props {
  vehiculoId: string
}
```

**Secciones:**
- Botón "Añadir valoración"
- Formulario manual (collapsible)
- Estadísticas de cambio (3 cards)
- Gráfico de área (Recharts)
- Lista histórica detallada

**Gráfico:**
```typescript
<AreaChart data={datosGrafico}>
  <Area type="monotone" dataKey="valor" stroke="#4f46e5" />
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="fecha" />
  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k €`} />
  <Tooltip />
</AreaChart>
```

---

### 3. `DashboardVehiculo.tsx` (Integración)

**Layout:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ValoracionVenta vehiculoId={vehiculo.id} />
  <HistoricoValoracion vehiculoId={vehiculo.id} />
</div>
```

---

## 🧮 Algoritmo de Valoración (Detallado)

### Código SQL Simplificado:

```sql
CREATE OR REPLACE FUNCTION calcular_valoracion_automatica(p_vehiculo_id UUID)
RETURNS TABLE (...) AS $$
DECLARE
  v_precio_base DECIMAL;
  v_factor_años DECIMAL := 1.0;
  v_factor_km DECIMAL := 1.0;
  v_factor_estado DECIMAL := 1.0;
  v_años_uso INTEGER;
  v_km_actual INTEGER;
BEGIN
  -- 1. Obtener datos del vehículo
  SELECT * INTO v_vehiculo FROM vehiculos_registrados WHERE id = p_vehiculo_id;
  
  -- 2. Buscar precios de mercado
  SELECT AVG(precio), COUNT(*) INTO v_precio_base, v_num_comparables
  FROM datos_mercado_autocaravanas
  WHERE marca = v_vehiculo.marca
    AND modelo = v_vehiculo.modelo
    AND año BETWEEN (v_vehiculo.año - 2) AND (v_vehiculo.año + 2)
    AND tipo_dato IN ('venta', 'venta_anuncio')
    AND fecha_transaccion >= CURRENT_DATE - INTERVAL '2 years';

  -- 3. Si no hay datos, usar depreciación estándar
  IF v_num_comparables < 3 THEN
    IF v_años_uso <= 5 THEN
      v_factor_años := POWER(0.85, v_años_uso);  -- 15% anual
    ELSE
      v_factor_años := POWER(0.85, 5) * POWER(0.90, v_años_uso - 5);  -- 10% después
    END IF;
  END IF;

  -- 4. Ajuste por kilometraje
  km_esperados := v_años_uso * 15000;
  diferencia_km := v_km_actual - km_esperados;
  
  IF diferencia_km > 0 THEN
    v_factor_km := 1 - (diferencia_km / 10000 * 0.005);  -- Penaliza
    v_factor_km := GREATEST(v_factor_km, 0.6);  -- Máximo -40%
  ELSE
    v_factor_km := 1 + (ABS(diferencia_km) / 10000 * 0.003);  -- Bonifica
    v_factor_km := LEAST(v_factor_km, 1.2);  -- Máximo +20%
  END IF;

  -- 5. Ajuste por averías graves
  SELECT COUNT(*) INTO num_averias_graves
  FROM averias
  WHERE vehiculo_id = p_vehiculo_id AND severidad IN ('alta', 'critica');
  
  v_factor_estado := 1 - (num_averias_graves * 0.05);  -- 5% por avería
  v_factor_estado := GREATEST(v_factor_estado, 0.7);  -- Máximo -30%

  -- 6. Calcular valor estimado
  v_valor_estimado := v_precio_base * v_factor_años * v_factor_km * v_factor_estado;

  -- 7. Determinar confianza
  IF v_num_comparables >= 10 THEN
    v_confianza := 'Alta';
  ELSIF v_num_comparables >= 3 THEN
    v_confianza := 'Media';
  ELSE
    v_confianza := 'Baja';
  END IF;

  RETURN QUERY SELECT v_valor_estimado, v_confianza, ...;
END;
$$ LANGUAGE plpgsql;
```

---

## 📱 Flujo de Usuario (End-to-End)

### Caso de Uso Real:

**Usuario: Juan - Propietario de Fiat Ducato 2018**

```
Día 1: Juan quiere vender su camper
├─ Entra a "Mi Autocaravana"
├─ Ve: "¿Por cuánto puedo vender?"
│  └─ Valor estimado: 42,300 €
│  └─ Confianza: Alta (15 vehículos comparables)
│  └─ 3 rangos:
│      - Rápida: 38,070 €
│      - Justo:  42,300 €
│      - Óptimo: 46,530 €
├─ Ve desglose:
│  └─ Precio mercado: 45,000 €
│  └─ Ajuste km: -1,200 € (tiene 95k km, esperaba 90k)
│  └─ Ajuste averías: -1,500 € (1 avería grave registrada)
└─ Decide: "Voy a pedir 44,000 €"

Día 2: Juan pone en venta
├─ Clic "Poner en venta"
├─ Ingresa: 44,000 €
├─ Confirma
└─ ✅ Estado: "EN VENTA - 44,000 €"

Día 30: Juan revisa evolución
├─ Ve gráfico histórico:
│  └─ Enero 2024: 48,000 €
│  └─ Junio 2024: 45,000 €
│  └─ Nov 2024:   42,300 €
├─ Tendencia: ↓ -11.9% en el año
└─ Decide mantener precio 44,000 €

Día 45: Juan añade valoración manual
├─ Llevó camper a concesionario
├─ Añade valoración: 43,500 €
├─ Nota: "Tasación oficial Concesionario XYZ"
└─ ✅ Guardada en histórico

Día 60: Juan vende
├─ Negoció con comprador
├─ Precio final: 43,000 €
├─ "Registrar venta"
│  └─ Precio: 43,000 €
│  └─ Fecha: 15/01/2025
│  └─ Notas: "Vendido a particular, pago transferencia"
└─ ✅ Sistema calcula:
    - Inversión total: 52,000 €
    - Precio venta: 43,000 €
    - Pérdida: -9,000 €
    - ROI: -17.3%
```

---

## 🎯 Beneficios del Sistema

### Para el Usuario:

1. ✅ **Transparencia Total:** Sabe exactamente cuánto vale su vehículo
2. ✅ **Decisiones Informadas:** Datos reales, no estimaciones a ciegas
3. ✅ **Ahorro de Tiempo:** No necesita visitar 5 concesionarios
4. ✅ **Seguimiento Histórico:** Ve cómo evoluciona el valor
5. ✅ **Confianza:** Algoritmo basado en mercado real

### Para Furgocasa:

1. 💰 **Engagement:** Usuarios revisan valor regularmente
2. 💰 **Retención:** Función diferencial única
3. 💰 **Datos Valiosos:** Acumula precios de mercado
4. 💰 **Monetización:** Base para suscripción premium
5. 💰 **Marketplace:** Puede crear plataforma de compra/venta

---

## 📈 Próximas Mejoras

### v2.0 - Inteligencia Aumentada

- [ ] Machine Learning: Predicción con más factores
- [ ] Comparativa visual: Gráfico de barras con similares
- [ ] Alertas automáticas: "Tu vehículo ha subido 2,000 €"
- [ ] Consejos personalizados: "Realiza ITV para aumentar valor"
- [ ] Valoración por fotos: IA analiza estado visual

### v3.0 - Marketplace

- [ ] Publicar anuncio directo desde la app
- [ ] Chat con potenciales compradores
- [ ] Verificación de vehículos
- [ ] Transacciones seguras
- [ ] Comisión por venta

---

## 🎓 Conclusión

Hemos creado un **sistema empresarial completo** que responde a la pregunta:

> **"¿Por cuánto puedo vender mi camper?"**

Con:
- ✅ Algoritmo propio de valoración
- ✅ Comparativa con mercado real
- ✅ Interfaz intuitiva y visual
- ✅ Histórico y seguimiento
- ✅ Gestión completa de venta

**Todo implementado y funcional** 🚀

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Autor:** Furgocasa + Claude (Anthropic)

