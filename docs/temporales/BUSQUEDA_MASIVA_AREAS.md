# 🔍 Búsqueda Masiva de Áreas

## Descripción

Nueva funcionalidad del panel de administración que permite buscar y añadir múltiples áreas de autocaravanas desde Google Maps de forma masiva.

## Ubicación

**URL:** `/admin/areas/busqueda-masiva`

**Accesos:**
- Desde el panel principal de admin: botón "Búsqueda masiva" en la tarjeta de "Gestión de Áreas"
- Desde la página de gestión de áreas: botón "Búsqueda Masiva" en la barra superior

## Características

### 1. Búsqueda en Google Places

- Busca lugares directamente en Google Places API
- Ejemplos de búsquedas:
  - "areas autocaravanas murcia"
  - "camping autocaravanas valencia"
  - "parking autocaravanas madrid"
  - "área pernocta barcelona"

### 2. Sistema Inteligente de Detección de Duplicados (7 Criterios)

El sistema detecta duplicados usando **múltiples criterios** para garantizar que no se importen áreas repetidas:

#### ✅ Criterios de Detección:

1. **Google Place ID** (100% confiable)
   - Coincidencia exacta del identificador único de Google
   
2. **Slug Generado**
   - Compara el slug normalizado del nombre
   - Ejemplo: "Área Autocaravanas Murcia" → `area-autocaravanas-murcia`

3. **Nombre Normalizado**
   - Elimina acentos, mayúsculas y espacios extras
   - Coincidencia exacta del texto normalizado

4. **Dirección Normalizada**
   - Compara direcciones completas normalizadas
   - Detecta mismo lugar con dirección idéntica

5. **Coordenadas GPS (Radio 500m)**
   - Calcula distancia usando fórmula de Haversine
   - Si está a menos de 500 metros → mismo lugar físico
   - **Detecta duplicados aunque tengan nombres diferentes**

6. **Similitud de Nombre (Fuzzy Matching)**
   - Compara palabras significativas del nombre
   - Si ≥ 80% de palabras coinciden → probable duplicado
   - Ejemplo: "Camper Park Rey Lobo" vs "Rey Lobo Área Camper"

7. **Dirección Similar + Proximidad (Combinado)**
   - Dirección ≥ 60% similar + distancia < 2km → duplicado
   - Captura casos donde el nombre cambió pero ubicación es similar

#### 🎯 Visualización:

- **Áreas duplicadas**: Marcadas en gris con badge "Ya existe"
- **Áreas nuevas**: Fondo normal con badge verde "Nueva"
- **Logs detallados**: Ver consola del navegador para detalles de cada verificación

### 3. Selección Múltiple

- Selecciona individualmente cada área con checkboxes
- Botón "Seleccionar todas las nuevas" - selecciona solo las áreas que no existen
- Botón "Deseleccionar todas" - limpia la selección
- Contador visual: "X de Y áreas nuevas seleccionadas"

### 4. Importación Masiva

- Botón "Añadir X áreas" para importar las seleccionadas
- Proceso automático que:
  - Genera el slug automáticamente
  - Extrae información de ubicación
  - Guarda el `google_place_id` para evitar duplicados futuros
  - Marca las áreas como no verificadas (requieren revisión)
  - Las áreas se crean activas por defecto

### 5. Información Mostrada

Para cada resultado se muestra:
- ✅ **Nombre** del lugar
- 📍 **Dirección** completa
- 🌍 **Coordenadas** (latitud, longitud)
- ⭐ **Valoración** de Google (si existe)
- 🏷️ **Tipo** de lugar
- 📊 **Estado**: "Nueva" o "Ya existe"

## Flujo de Trabajo Recomendado

1. **Buscar**: Introducir término de búsqueda descriptivo
2. **Revisar**: Ver los resultados y identificar cuáles son nuevas
3. **Seleccionar**: Marcar las áreas que quieres importar
4. **Importar**: Hacer clic en "Añadir X áreas"
5. **Enriquecer**: Usar las funcionalidades de:
   - "Actualizar Servicios" - para detectar servicios disponibles
   - "Enriquecer Textos" - para generar descripciones con IA
   - "Enriquecer Imágenes" - para añadir fotos automáticamente

## Datos Importados

Al importar un área desde la búsqueda masiva, se guardan:

- ✅ **Nombre** (del lugar de Google)
- ✅ **Slug** (generado automáticamente)
- ✅ **Descripción** (texto genérico, requiere enriquecimiento)
- ✅ **Dirección** completa
- ✅ **Coordenadas** (latitud, longitud)
- ✅ **Google Place ID** (para evitar duplicados)
- ✅ **Google Maps URL** (enlace directo)
- ✅ **Ciudad y Provincia** (extraídas de la dirección)
- ⚠️ **Tipo de área** (por defecto: pública)
- ⚠️ **Verificado** (NO - requiere revisión manual)
- ✅ **Activo** (SÍ - visible en el mapa)

## Campos que Requieren Enriquecimiento Posterior

- 📝 Descripción detallada
- 🏷️ Tipo de área preciso
- 🛠️ Servicios disponibles
- 💰 Precio por noche
- 📸 Imágenes/fotos
- 📞 Contacto (teléfono, email, web)
- 🚐 Capacidad (plazas)

## API Endpoint

**Ruta:** `/api/admin/search-places`

**Método:** POST

**Body:**
```json
{
  "query": "areas autocaravanas murcia"
}
```

**Autenticación:** Requiere usuario administrador

**Respuesta:**
```json
{
  "results": [
    {
      "place_id": "ChIJ...",
      "name": "Área de Autocaravanas...",
      "formatted_address": "Calle..., Ciudad, Provincia",
      "geometry": {
        "location": {
          "lat": 37.9838,
          "lng": -1.1288
        }
      },
      "rating": 4.5,
      "user_ratings_total": 120,
      "types": ["rv_park", "lodging"]
    }
  ],
  "status": "OK"
}
```

## Tecnologías Utilizadas

- **Google Places API** - Text Search endpoint
- **Supabase** - Base de datos PostgreSQL
- **Next.js 14** - App Router
- **TypeScript** - Tipado fuerte
- **TailwindCSS** - Estilos

## Consideraciones

### Límites de API

- Google Places API tiene límites de uso
- Se recomienda hacer búsquedas específicas en lugar de genéricas
- Cada búsqueda puede retornar hasta **60 resultados** (3 páginas de 20)
- El sistema obtiene automáticamente todas las páginas disponibles

### Duplicados

- El sistema detecta duplicados usando **7 criterios diferentes** (ver sección 2)
- Incluye: Place ID, slug, nombre, dirección, coordenadas, similitud y proximidad
- Las áreas duplicadas NO se pueden seleccionar para importar
- Cache inteligente en memoria para verificación rápida (O(1) para exactas, O(n) para fuzzy)

### Verificación Manual

- Todas las áreas importadas requieren verificación manual
- Se recomienda revisar y completar:
  - Tipo de área correcto
  - Servicios disponibles
  - Precio (si aplica)
  - Descripción detallada

## ✅ Mejoras Implementadas (Octubre 2025)

- ✅ **Búsqueda ampliada**: Query mejorada con variaciones (área/area/camping/parking)
- ✅ **Detección avanzada de duplicados**: 7 criterios incluyendo GPS y fuzzy matching
- ✅ **Paginación automática**: Obtiene hasta 60 resultados de Google (3 páginas)
- ✅ **Cache inteligente**: Estructuras optimizadas para búsqueda rápida
- ✅ **Límite de visualización en mapa**: 50 resultados máximo para mejor rendimiento

## Mejoras Futuras Posibles

- [ ] Búsqueda por coordenadas o radio de área
- [ ] Filtros por tipo de lugar
- [ ] Importación automática de fotos desde Google
- [ ] Extracción de horarios de apertura
- [ ] Detección de servicios desde la descripción de Google
- [ ] Preview del lugar antes de importar
- [ ] Edición rápida de campos antes de importar
- [ ] Paginación en frontend para mostrar más de 50 resultados

## Soporte

Para problemas o mejoras, contactar con el administrador del sistema.

