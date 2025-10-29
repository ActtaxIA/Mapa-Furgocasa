# Diagnóstico y Solución: Filtro de Países en el Mapa

## 🔍 Problema Identificado

Al seleccionar "Portugal" en el filtro del mapa, solo aparecen 2 áreas cuando deberían aparecer muchas más. Las áreas que deberían estar en Portugal están apareciendo en "España".

## 🛠️ Cambios Realizados

### 1. Normalización del Filtro de País

Se ha modificado el archivo `app/(public)/mapa/page.tsx` para:

- **Normalizar los valores con `.trim()`**: Elimina espacios en blanco extra al principio y final
- **Agregar logs de depuración**: Para identificar exactamente qué áreas no coinciden
- **Mostrar distribución por país**: Al cargar las áreas, muestra un resumen en la consola

### 2. Herramientas de Diagnóstico Creadas

#### Script de Análisis: `scripts/check-paises-supabase.js`

Este script analiza la columna `pais` en la base de datos y detecta:

- ✅ Distribución de áreas por país
- ⚠️ Espacios extra en valores
- ⚠️ Áreas con país incorrecto (ej: provincia portuguesa con país "España")
- ⚠️ Códigos postales que no coinciden con el país

**Cómo ejecutar:**

```bash
npm run db:check:paises
```

#### API de Corrección: `/api/admin/fix-paises`

Endpoint administrativo que:

- Analiza los mismos problemas que el script
- **Con `?fix=true`** aplica las correcciones automáticamente

**Cómo usar:**

1. **Solo análisis** (sin cambios):
   ```
   https://mapafurgocasa.com/api/admin/fix-paises
   ```

2. **Aplicar correcciones**:
   ```
   https://mapafurgocasa.com/api/admin/fix-paises?fix=true
   ```

⚠️ **Importante**: Solo accesible para usuarios con rol `admin`

## 📋 Pasos para Diagnosticar y Solucionar

### Paso 1: Ver Logs en el Navegador

1. Abre la aplicación en modo desarrollo (`npm run dev`)
2. Abre las DevTools del navegador (F12)
3. Ve a la pestaña "Console"
4. Navega a `/mapa`
5. Busca el log: `📊 Distribución de áreas por país:`

Esto te mostrará cuántas áreas hay realmente por cada país en la base de datos.

### Paso 2: Ejecutar Script de Análisis

```bash
npm run db:check:paises
```

Este script te mostrará:

- Cuántas áreas hay por país
- Qué áreas tienen problemas
- Sugerencias de corrección

### Paso 3: Revisar los Problemas Detectados

El script identificará problemas como:

```
País incorrecto: 35 caso(s)
------------------------------------------------------------

1. AC Castejón
   ID: abc123...
   País actual: España
   País correcto: Portugal
   Razón: Provincia portuguesa: Faro
   Ciudad: Castejón
```

### Paso 4: Aplicar Correcciones

#### Opción A: Automática (Recomendado)

Como administrador, accede a:

```
https://mapafurgocasa.com/api/admin/fix-paises?fix=true
```

Esto corregirá automáticamente:
- Espacios extra
- Países incorrectos basados en provincia/código postal

#### Opción B: Manual

Edita las áreas una por una desde el panel de administración:

```
https://mapafurgocasa.com/admin/areas
```

### Paso 5: Verificar los Cambios

1. Recarga la página del mapa
2. Selecciona "Portugal" en el filtro
3. Verifica que ahora aparecen todas las áreas correctas

## 🔬 Logs de Depuración Implementados

### Al Cargar Áreas

```javascript
📊 Distribución de áreas por país: {
  'España': 755,
  'Portugal': 35,
  'Andorra': 2
}
```

### Al Filtrar por Portugal

Si una área no coincide, verás:

```javascript
País no coincide: {
  areaNombre: "AC Faro",
  paisArea: "España",    // ← El problema
  paisFiltro: "Portugal",
  iguales: false
}
```

## 📝 Notas Técnicas

### Detección de Provincias Portuguesas

El sistema detecta las siguientes provincias como portuguesas:

- **Continente**: Aveiro, Beja, Braga, Bragança, Castelo Branco, Coimbra, Évora, Faro, Guarda, Leiria, Lisboa, Portalegre, Porto, Santarém, Setúbal, Viana do Castelo, Vila Real, Viseu
- **Islas**: Açores, Madeira

### Detección de Códigos Postales

- **Andorra**: Comienzan con `AD`
- **Portugal**: Formato `XXXX-XXX`

## 🚨 Problemas Comunes

### "No se ven los logs en la consola"

Asegúrate de que:
1. Estás en modo desarrollo (`npm run dev`)
2. Las DevTools están abiertas
3. La pestaña "Console" está seleccionada
4. No hay filtros aplicados en la consola

### "El script no funciona"

Verifica que:
1. Existe el archivo `.env.local` con las variables de Supabase
2. Las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` están configuradas

### "El endpoint /api/admin/fix-paises da error 401/403"

Debes estar:
1. Autenticado en la aplicación
2. Con un usuario que tenga rol `admin`

## 📊 Resumen de Archivos Modificados

### Modificados
- ✏️ `app/(public)/mapa/page.tsx` - Filtro normalizado y logs
- ✏️ `package.json` - Nuevo script `db:check:paises`

### Creados
- ➕ `scripts/check-paises-supabase.js` - Script de análisis
- ➕ `app/api/admin/fix-paises/route.ts` - Endpoint de corrección
- ➕ `app/api/debug/check-paises/route.ts` - Endpoint de depuración público

## ✅ Checklist de Verificación

- [ ] Ejecutar `npm run db:check:paises`
- [ ] Revisar problemas detectados
- [ ] Aplicar correcciones con `/api/admin/fix-paises?fix=true`
- [ ] Verificar en el mapa que Portugal muestra todas las áreas
- [ ] Verificar que España no incluye áreas portuguesas
- [ ] Probar otros países (Andorra si aplica)

## 🎯 Resultado Esperado

Después de aplicar las correcciones:

- **Portugal**: ~35+ áreas (todas las que tienen provincia portuguesa)
- **España**: ~755 áreas (sin áreas portuguesas)
- **Andorra**: 2 áreas (si tienen código postal AD)

---

**Última actualización**: 29 de octubre de 2025

