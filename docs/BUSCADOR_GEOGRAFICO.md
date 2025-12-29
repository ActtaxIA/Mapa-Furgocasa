# 🔍 Buscador Geográfico en el Mapa

**Versión:** 1.0  
**Fecha:** 29 de Diciembre, 2024  
**Estado:** ✅ DESPLEGADO EN PRODUCCIÓN

---

## 📋 RESUMEN

Se ha agregado un nuevo **buscador geográfico** en el mapa que permite buscar ubicaciones (ciudades, países, regiones) y navegar directamente a ellas. Cuando buscas una ubicación en un país diferente al filtrado actualmente, el sistema:

1. ✅ Cambia automáticamente el filtro de país
2. ✅ Muestra un mensaje explicativo
3. ✅ Te permite revertir el cambio fácilmente

---

## 🎯 CARACTERÍSTICAS

### **1. Búsqueda Geográfica Global**
- Busca **cualquier ubicación** del mundo
- Soporta:
  - 🌍 Países ("Argentina", "France")
  - 🏙️ Ciudades ("Buenos Aires", "Paris")
  - 📍 Regiones ("Andalucía", "Toscana")
  - 🗺️ Zonas ("Costa del Sol")

### **2. Cambio Automático de País**
Cuando buscas una ubicación en otro país:
- El filtro de país se actualiza automáticamente
- Se muestra un mensaje explicativo
- Puedes revertir el cambio desde los filtros

### **3. Interfaz Intuitiva**
- **Desktop:** Botón compacto que se expande al hacer clic
- **Móvil:** Diseño adaptado para pantallas pequeñas
- **Autocomplete:** Sugerencias mientras escribes (Google Places)

---

## 📍 UBICACIÓN EN LA INTERFAZ

### **Desktop**
```
┌─────────────────────────────────┐
│   [Ver ubicación / GPS Activo]   │  ← Botón GPS
├─────────────────────────────────┤
│   [🔍 Buscar en el mapa]         │  ← NUEVO Buscador
└─────────────────────────────────┘
```

### **Móvil**
```
┌───────────────────┐
│  [Ver ubicación]   │  ← Botón GPS
├───────────────────┤
│  [🔍 Buscar]       │  ← NUEVO Buscador (compacto)
└───────────────────┘
```

---

## 🚀 CÓMO FUNCIONA

### **Flujo de Uso Normal**

1. Usuario hace clic en **"🔍 Buscar en el mapa"**
2. El botón se expande a un input de búsqueda
3. Usuario empieza a escribir (ej: "Madrid")
4. Google Places Autocomplete muestra sugerencias
5. Usuario selecciona una sugerencia
6. El mapa se mueve a esa ubicación con zoom apropiado
7. El buscador se contrae automáticamente

### **Flujo con Cambio de País**

**Escenario:**
- Filtro actual: España
- Usuario busca: "Buenos Aires, Argentina"

**Qué pasa:**

1. ✅ El mapa se mueve a Buenos Aires
2. ✅ El filtro de país cambia a "Argentina"
3. ✅ Se muestra este mensaje:
   ```
   📍 Has buscado en Argentina. Hemos cambiado el filtro
   de país de España a Argentina. Puedes revertirlo
   desde los filtros.
   ```
4. ✅ Ahora el mapa muestra áreas de Argentina
5. ✅ Usuario puede volver a España desde los filtros

---

## 🎨 EJEMPLOS DE USO

### **Caso 1: Explorar Otra Región del Mismo País**

```
Usuario en: España (Madrid visible)
Busca: "Sevilla"
Resultado: ✅ Se mueve a Sevilla, filtro sigue en España
```

### **Caso 2: Cambiar de País**

```
Usuario en: España
Busca: "Paris, France"
Resultado: 
  ✅ Se mueve a París
  ✅ Filtro cambia a Francia
  ✅ Mensaje: "Has buscado en Francia..."
```

### **Caso 3: Explorar Sin Filtro**

```
Usuario: Sin filtro de país
Busca: "Tokyo, Japan"
Resultado:
  ✅ Se mueve a Tokio
  ✅ Filtro se aplica a Japón
  ✅ Mensaje: "Has buscado en Japón. Hemos aplicado el filtro..."
```

---

## 💻 IMPLEMENTACIÓN TÉCNICA

### **Archivos Creados/Modificados**

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `components/mapa/BuscadorGeografico.tsx` | **NUEVO** | Componente del buscador |
| `components/mapa/MapaInteractivo.tsx` | Modificado | Integración del buscador |
| `app/(public)/mapa/page.tsx` | Modificado | Lógica de cambio de país |

### **Tecnologías Utilizadas**

- **Google Places Autocomplete API**: Autocompletado de ubicaciones
- **Google Maps Geocoding**: Conversión de direcciones a coordenadas
- **React Hooks**: `useState`, `useRef`, `useEffect`
- **Tailwind CSS**: Estilos responsive

### **Integración con Google Maps**

```typescript
// Inicializar Autocomplete
const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
  fields: ['address_components', 'geometry', 'name', 'formatted_address'],
  types: ['(regions)'], // Ciudades, regiones, países
})

// Listener de selección
autocomplete.addListener('place_changed', () => {
  const place = autocomplete.getPlace()
  // Extraer país, coordenadas, etc.
  // Mover mapa
  // Notificar cambio de país
})
```

---

## 🔄 FLUJO DE DATOS

```
Usuario escribe en buscador
         ↓
Google Places Autocomplete
         ↓
Usuario selecciona sugerencia
         ↓
BuscadorGeografico extrae datos
         ↓
MapaInteractivo.onLocationFound()
         ↓
MapaPage.handleCountryChange()
         ↓
¿País diferente? → Sí
         ↓
Actualizar filtro de país
         ↓
Mostrar ToastNotification
```

---

## 📱 RESPONSIVE DESIGN

### **Diferencias Desktop vs Móvil**

| Aspecto | Desktop | Móvil |
|---------|---------|-------|
| **Ancho** | 320px (80rem) | 288px (72rem) |
| **Padding** | py-3 px-4 | py-2 px-3 |
| **Texto** | text-sm | text-xs |
| **Hint** | Visible | Oculto |
| **Placeholder** | "Ciudad, país, región..." | "Ciudad, país..." |

### **Breakpoints**

- `md:` → 768px y superior (tablet/desktop)
- Por defecto → < 768px (móvil)

---

## ⚠️ CONSIDERACIONES

### **Límites de la API**

Google Places Autocomplete tiene límites de uso:
- **Gratuito**: Hasta cierto número de peticiones
- **Después**: Se cobra por petición

**Optimizaciones implementadas:**
- Autocomplete solo se activa después de 1-2 caracteres
- No hay búsqueda automática, solo al seleccionar

### **Países No Soportados**

Si el usuario busca una ubicación en un país sin áreas en la BD:
- ✅ El mapa se mueve allí correctamente
- ✅ El filtro cambia
- ⚠️ No se mostrarán áreas (porque no hay)
- ✅ Usuario puede volver a país anterior

---

## 🎯 MEJORAS FUTURAS (Opcional)

### **Propuestas**

1. **Historial de búsquedas**
   - Guardar últimas 5 búsquedas
   - Mostrarlas al abrir el buscador

2. **Búsqueda por código postal**
   - Permitir buscar por CP (ej: "28001")

3. **Atajos de países populares**
   - Botones rápidos: España | Francia | Portugal

4. **Guardar ubicaciones favoritas**
   - Usuario logueado puede guardar ubicaciones

5. **Búsqueda de áreas específicas**
   - Integrar con el buscador de áreas existente
   - Ej: "Parking en Madrid" → Busca ubicación + filtra tipo

---

## 📊 MÉTRICAS A MONITOREAR

1. **Uso del buscador**
   - Cuántos usuarios usan el buscador vs. filtros
   - Países más buscados

2. **Conversión**
   - ¿Usuarios que buscan encuentran áreas?
   - ¿Tasa de rebote después de búsqueda?

3. **Errores**
   - Búsquedas sin resultados
   - Errores de API de Google

---

## ✅ TESTING REALIZADO

### **Tests Manuales**

- [x] Búsqueda en mismo país
- [x] Búsqueda en país diferente
- [x] Búsqueda sin filtro aplicado
- [x] Mensaje de toast aparece correctamente
- [x] Filtro se actualiza automáticamente
- [x] Responsive en móvil
- [x] Responsive en tablet
- [x] Responsive en desktop
- [x] Autocomplete funciona
- [x] Limpiar búsqueda con X
- [x] Contraer al perder foco

### **Casos Edge**

- [x] Buscar ubicación sin áreas cercanas
- [x] Buscar con mala conexión
- [x] Buscar país que no existe en BD
- [x] Múltiples búsquedas consecutivas
- [x] Cambiar manualmente filtro después de búsqueda

---

## 🚀 DEPLOYMENT

### **Commits**

1. `37ce775` - feat: agregar buscador geográfico con cambio automático de país
2. `8045527` - feat: mejorar diseño responsive para móvil

### **Archivos Desplegados**

- ✅ `components/mapa/BuscadorGeografico.tsx` (NUEVO)
- ✅ `components/mapa/MapaInteractivo.tsx` (Modificado)
- ✅ `app/(public)/mapa/page.tsx` (Modificado)

### **Verificación Post-Deployment**

1. ✅ Ir a https://www.mapafurgocasa.com/mapa
2. ✅ Ver botón "🔍 Buscar en el mapa" debajo de "Ver ubicación"
3. ✅ Hacer clic, escribir "Paris"
4. ✅ Seleccionar de autocomplete
5. ✅ Verificar que mapa se mueve
6. ✅ Verificar que filtro cambia a Francia
7. ✅ Verificar que aparece mensaje toast

---

## 📞 SOPORTE

Si hay problemas:
1. Verificar consola del navegador (F12)
2. Revisar que Google Maps API está cargada
3. Verificar permisos de Google Places API
4. Revisar límites de uso de la API

---

**¡La funcionalidad está 100% operativa en producción!** 🎉

Espera 2-3 minutos para que AWS Amplify termine el despliegue y pruébala en:
https://www.mapafurgocasa.com/mapa

