# 🗺️ Búsqueda en Mapa - Implementación

## Descripción

Nueva funcionalidad añadida a la página de **Búsqueda Masiva de Áreas** que permite buscar lugares en una zona específica del mapa, similar a como funciona Google Maps con su botón "Buscar en esta zona".

## 📍 Ubicación

**URL:** `/admin/areas/busqueda-masiva`

La nueva sección aparece debajo de la búsqueda por texto, en la misma página.

## ✨ Características

### 1. Mapa Interactivo de Google Maps
- Mapa completamente funcional e interactivo
- Centro inicial: Madrid (España)
- Zoom inicial: nivel 6
- Controles: zoom, tipo de mapa, pantalla completa

### 2. Búsqueda en Área Visible
- **Campo de búsqueda** independiente del buscador de texto
- **Botón "Buscar en esta zona"** que se activa al mover/hacer zoom en el mapa
- Busca **solo en el área visible** del mapa (bounds)
- Usa **Nearby Search API** de Google en lugar de Text Search

### 3. Visualización de Resultados
- **Marcadores en el mapa:**
  - 🟢 **Verde grande** = Áreas nuevas (no existen en BD)
  - ⚪ **Gris pequeño** = Áreas ya existentes en BD
  - **InfoWindow** al hacer click en un marcador
  - **Animación DROP** para áreas nuevas

- **Lista de resultados:**
  - Tabla con checkbox para selección múltiple
  - Mismo formato que la búsqueda por texto
  - Botones: "Seleccionar todas las nuevas" / "Deseleccionar todas"

### 4. Detección de Duplicados
- Usa el **mismo sistema de 7 criterios** que la búsqueda por texto
- Verifica: Google Place ID, slug, nombre, dirección, coordenadas, similitud, etc.
- Marca automáticamente las áreas que ya existen

### 5. Importación Masiva
- Botón "Añadir X áreas" independiente de la búsqueda por texto
- Mismo proceso de importación
- Refresca el cache de áreas existentes después de importar

## 🔧 Archivos Creados/Modificados

### Nuevos Archivos

1. **`app/api/admin/search-places-map/route.ts`**
   - API endpoint específica para búsqueda en mapa
   - Acepta `query` y `bounds` (north, south, east, west)
   - Usa **Nearby Search API** de Google Places
   - Calcula centro y radio del área visible
   - Límite: 50km de radio máximo (restricción de Google)
   - Paginación: hasta 60 resultados (3 páginas × 20)
   - Enriquece resultados con Place Details API

2. **`components/admin/MapaInteractivoAdmin.tsx`**
   - Componente React para el mapa interactivo
   - Integración con Google Maps API usando `@googlemaps/js-api-loader`
   - Callbacks: `onMapReady`, `onBoundsChanged`
   - Props: `searchResults`, `existingAreas`
   - Dibuja marcadores con colores según estado
   - Debounce en `bounds_changed` (500ms)

### Archivos Modificados

3. **`app/admin/areas/busqueda-masiva/page.tsx`**
   - ✅ **NO se modificó la búsqueda por texto existente**
   - Añadido estado para búsqueda en mapa:
     - `mapSearchQuery`, `mapSearching`, `mapResults`
     - `mapSelectedPlaces`, `mapMessage`
     - `mapInstance`, `mapBounds`, `showMapSearchBtn`
   - Nuevas funciones:
     - `handleMapSearch()` - Búsqueda en mapa
     - `handleMapImport()` - Importación desde mapa
     - `toggleMapSelection()`, `selectAllMap()`, `deselectAllMap()`
   - Nueva sección JSX con:
     - Mapa interactivo (500px altura)
     - Campo de búsqueda
     - Instrucciones de uso
     - Tabla de resultados independiente

## 🔑 API de Google Maps Utilizada

### Text Search (búsqueda por texto - existente)
```
https://maps.googleapis.com/maps/api/place/textsearch/json
```
- Parámetros: `query`, `language`, `region`, `type`
- Busca en toda una región amplia

### Nearby Search (búsqueda en mapa - NUEVO)
```
https://maps.googleapis.com/maps/api/place/nearbysearch/json
```
- Parámetros: `location`, `radius`, `keyword`, `type`
- Busca en un radio específico desde un punto central
- Máximo: 50,000 metros (50km)

### Place Details (ambas)
```
https://maps.googleapis.com/maps/api/place/details/json
```
- Obtiene información adicional: website, teléfono, etc.

## 📊 Límites y Consideraciones

### Límites de Google Places API
- **Resultados máximos:** 60 por búsqueda (20 × 3 páginas)
- **Radio máximo:** 50km desde el centro del mapa visible
- **Delay entre páginas:** 2 segundos (requerido por Google)

### Cálculo del Radio
```typescript
// Centro del viewport
const centerLat = (bounds.north + bounds.south) / 2
const centerLng = (bounds.east + bounds.west) / 2

// Radio aproximado (distancia centro → esquina)
const latDiff = bounds.north - bounds.south
const lngDiff = bounds.east - bounds.west
const radiusKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 / 2
const radiusMeters = Math.min(radiusKm * 1000, 50000) // Máx 50km
```

### Consumo de Cuota API
Cada búsqueda consume:
- 1 llamada a Nearby Search (por página)
- N llamadas a Place Details (N = número de resultados)

**Ejemplo:** 20 resultados = 1 Nearby + 20 Details = **21 llamadas API**

## 💡 Cómo Usar

1. **Navegar al mapa:**
   - El mapa se carga automáticamente centrado en Madrid
   - Usa los controles para mover y hacer zoom

2. **Seleccionar zona:**
   - Navega hasta la zona que te interesa
   - Haz zoom para acercarte (más zoom = área más pequeña = mejores resultados)

3. **Buscar:**
   - Escribe un término: "motorhome area", "camping", "parking", etc.
   - Click en "Buscar en esta zona"
   - Los resultados aparecen como marcadores en el mapa

4. **Seleccionar e importar:**
   - Marca las áreas nuevas (checkbox)
   - Click en "Añadir X áreas"
   - Las áreas se importan a la base de datos

## 🎯 Ventajas vs Búsqueda por Texto

| Característica | Búsqueda por Texto | Búsqueda en Mapa |
|---|---|---|
| **Área de búsqueda** | Toda una región/ciudad | Solo zona visible |
| **Control visual** | ❌ No | ✅ Sí |
| **Precisión geográfica** | Media | Alta |
| **Ver resultados en mapa** | ❌ No | ✅ Sí |
| **Ideal para** | Ciudades/provincias completas | Zonas específicas |

## 🔄 Flujo de Búsqueda

```mermaid
graph TD
    A[Usuario navega en mapa] --> B[Hace zoom en zona]
    B --> C[Escribe término de búsqueda]
    C --> D[Click "Buscar en esta zona"]
    D --> E[Se capturan bounds del mapa]
    E --> F[Calcula centro y radio]
    F --> G[Llama a Nearby Search API]
    G --> H[Obtiene hasta 60 resultados]
    H --> I[Enriquece con Place Details]
    I --> J[Verifica duplicados 7 criterios]
    J --> K[Muestra marcadores en mapa]
    K --> L[Muestra lista de resultados]
    L --> M[Usuario selecciona áreas]
    M --> N[Click "Añadir X áreas"]
    N --> O[Importa a Supabase]
    O --> P[Recarga cache de duplicados]
```

## 🧪 Testing

### Casos de Prueba

1. **Búsqueda exitosa:**
   - Navegar a Portugal
   - Buscar "motorhome area"
   - Verificar marcadores verdes

2. **Detección de duplicados:**
   - Buscar en zona con áreas ya importadas
   - Verificar marcadores grises
   - Verificar que no se pueden seleccionar

3. **Importación:**
   - Seleccionar 5 áreas nuevas
   - Importar
   - Verificar que aparecen en la BD
   - Verificar que al buscar de nuevo aparecen como "Ya existe"

4. **Zoom extremo:**
   - Hacer zoom muy cercano (nivel 15+)
   - Buscar → debe devolver resultados locales
   - Hacer zoom muy lejano (nivel 3-4)
   - Buscar → debe limitarse a 50km de radio

## 🐛 Troubleshooting

### El mapa no carga
- Verificar que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté en `.env.local`
- Verificar que la API Key tenga habilitado:
  - Maps JavaScript API
  - Places API

### Botón "Buscar en esta zona" deshabilitado
- Esperar a que el mapa cargue completamente
- Mover el mapa para que se actualicen los bounds

### No encuentra resultados
- Probar con términos más genéricos: "camping", "parking"
- Hacer zoom más lejano para ampliar el área de búsqueda
- Verificar que la zona tiene lugares de ese tipo

### Error "Solicitud denegada"
- Verificar límites de cuota en Google Cloud Console
- Verificar que Places API esté habilitada

## 📝 Notas Técnicas

- **Independencia:** Las dos búsquedas (texto y mapa) son completamente independientes
- **Estado separado:** Cada búsqueda tiene sus propios states, resultados y selecciones
- **APIs diferentes:** Text Search vs Nearby Search
- **Mismo sistema de duplicados:** Reutiliza las funciones `checkIfPlaceExists()`, `normalizeText()`, etc.
- **Misma lógica de importación:** Ambas usan código similar para insertar en Supabase

## 🚀 Mejoras Futuras

1. **Dibujar el área de búsqueda:** Mostrar un círculo/rectángulo en el mapa indicando el área donde se buscará
2. **Filtros por tipo:** Checkbox para filtrar solo campings, solo parkings, etc.
3. **Clustering:** Agrupar marcadores cuando hay muchos resultados cercanos
4. **Exportar resultados:** Descargar CSV con los resultados encontrados
5. **Historial de búsquedas:** Guardar las zonas buscadas para volver a ellas
