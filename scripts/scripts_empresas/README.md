# 🇪🇸 Scripts de Búsqueda de Empresas

Scripts automatizados para encontrar empresas del sector autocaravanas en España y obtener sus datos de contacto.

## 📋 Scripts Disponibles

### `import-empresas-espana.ts`

Búsqueda masiva de empresas en España relacionadas con autocaravanas:
- **Alquiler de autocaravanas**
- **Concesionarios / Venta**
- **Talleres de camperización**
- **Campings especializados**

#### 🎯 Datos que Obtiene

El script genera un archivo CSV con las siguientes columnas:

| Columna | Descripción | Fuente |
|---------|-------------|--------|
| **Nombre** | Nombre de la empresa | Google Places |
| **Dirección** | Dirección completa | Google Places |
| **Provincia** | Provincia (comunidad autónoma) | Google Geocoding |
| **Ciudad** | Ciudad/localidad | Google Geocoding |
| **Teléfono** | Teléfono de contacto | Google Places |
| **Website** | URL del sitio web | Google Places |
| **Email** | Email de contacto | Scraping del website* |
| **Rating Google** | Valoración en Google | Google Places |
| **Google Place ID** | ID único de Google | Google Places |

> **Nota sobre emails**: Los emails se extraen mediante scraping básico del website. Tasa de éxito típica: 40-60%

---

## 🚀 Uso

### 1. Modo Estimación (Dry Run)

Prueba el script sin gastar créditos de API ni extraer emails:

```bash
npm run import:empresas:dry
```

Esto te mostrará:
- ✅ Número estimado de búsquedas
- ✅ Cuadrículas geográficas a procesar
- ✅ Términos de búsqueda
- ✅ Costo estimado en USD

### 2. Ejecución Completa

Ejecuta la búsqueda real y genera el CSV:

```bash
npm run import:empresas
```

### 3. Con Límite de Resultados

Limita el número de empresas a procesar (útil para pruebas):

```bash
npm run import:empresas -- --limit=100
```

---

## 📊 Cobertura Geográfica

El script divide España en **cuadrículas de ~55km** (0.5 grados) para una cobertura completa:

```
Latitud:  36.0° N → 43.79° N  (Sur Andalucía → Norte Galicia)
Longitud: -9.3° W → 4.33° E   (Oeste Galicia → Este Cataluña)
```

**No incluye**: Islas Canarias (requieren configuración separada)

---

## 🔍 Términos de Búsqueda

El script busca automáticamente estos términos en cada cuadrícula:

1. `"alquiler autocaravanas"`
2. `"alquiler camper"`
3. `"concesionario autocaravanas"`
4. `"venta autocaravanas"`
5. `"camperización furgonetas"`
6. `"taller camperización"`
7. `"camping autocaravanas"`

---

## 💰 Costos Estimados

Basado en precios de Google Maps Platform:

| Operación | Costo por 1000 | Estimado Total |
|-----------|----------------|----------------|
| Nearby Search API | $32 | ~$20-30 |
| Place Details API | $17 | ~$10-15 |
| Geocoding API | $5 | ~$2-5 |
| **TOTAL** | - | **$30-50 USD** |

> **Nota**: El scraping de emails es gratuito (no usa APIs de pago)

---

## 📁 Archivo de Salida

### Formato

El script genera un archivo CSV en:

```
scripts/scripts_empresas/empresas-autocaravanas-espana-YYYY-MM-DD.csv
```

### Características

- ✅ **Codificación UTF-8** con BOM (compatible con Excel)
- ✅ **Campos escapados** (comas, saltos de línea)
- ✅ **Formato CSV estándar**
- ✅ **Listo para importar** en Excel, Google Sheets, CRM

### Ejemplo de Apertura

**En Excel**:
1. Abrir Excel
2. Arrastrar el archivo `.csv`
3. Los datos aparecen correctamente en columnas

**En Google Sheets**:
1. Archivo → Importar
2. Seleccionar el CSV
3. Codificación: Detectar automáticamente

---

## 🛡️ Detección de Duplicados

El script evita duplicados mediante **7 criterios**:

1. ✅ **Google Place ID** (único por lugar)
2. ✅ **Slug normalizado** del nombre
3. ✅ **Nombre normalizado** (sin acentos ni puntuación)
4. ✅ **Dirección normalizada**
5. ✅ **Coordenadas GPS** (radio de 500m)
6. ✅ **Similitud de nombre** (Fuzzy matching 80%)
7. ✅ **Teléfono** (si está disponible)

---

## 🔧 Requisitos Técnicos

### Variables de Entorno

Asegúrate de tener configurada en `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### APIs de Google Requeridas

Habilita estas APIs en Google Cloud Console:

1. ✅ **Places API (New)**
2. ✅ **Places API (Legacy)** - Para Nearby Search
3. ✅ **Geocoding API**

### Dependencias

Ya incluidas en el proyecto:
- `dotenv` - Cargar variables de entorno
- `ts-node` - Ejecutar TypeScript
- Node.js fetch API (nativo en Node 18+)

---

## 📈 Progreso y Logs

Durante la ejecución verás:

```
📍 Cuadrícula 45/120 - Centro: [40.42, -3.70]
   Buscando "alquiler autocaravanas"... ✅ 8 resultados
      → 5 nuevas, 3 duplicadas
      🔍 Extrayendo email de https://example.com... ✅ info@example.com
      ✅ Procesada: Alquiler Campers Madrid
```

### Códigos de Estado

- `✅` - Operación exitosa
- `⚪` - Sin resultados / Email no encontrado
- `❌` - Error
- `⚠️` - Advertencia / límite alcanzado

---

## 🐛 Solución de Problemas

### Error: "Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"

**Solución**: Verifica que `.env.local` existe y contiene la API key válida.

### Error: "API Status: REQUEST_DENIED"

**Solución**: 
1. Verifica que las APIs están habilitadas en Google Cloud
2. Revisa que la API key tiene permisos
3. Comprueba límites de facturación

### Pocos emails encontrados

**Normal**: La tasa de éxito es ~40-60% porque:
- Algunos websites no publican emails
- Algunos usan JavaScript que no se puede scrapear fácilmente
- Algunos tienen formularios de contacto en lugar de email

**Solución**: Usa el teléfono y website para contactar empresas sin email.

### Timeout en scraping

**Normal**: Si un website tarda >5 segundos, se omite el scraping del email.

---

## 🎯 Casos de Uso

### 1. Campaña de Email Marketing

```bash
npm run import:empresas
# Resultado: CSV con emails para Mailchimp/SendGrid
```

### 2. Base de Datos CRM

```bash
npm run import:empresas
# Importar CSV a Salesforce, HubSpot, etc.
```

### 3. Análisis de Mercado

```bash
npm run import:empresas
# Analizar distribución geográfica, ratings promedio
```

### 4. Directorio de Empresas

```bash
npm run import:empresas
# Usar datos para crear directorio público
```

---

## 📝 Notas Importantes

### Privacidad y RGPD

Los datos obtenidos son **públicos** (disponibles en Google Maps). Sin embargo:

- ⚠️ **Uso comercial**: Revisa términos de servicio de Google
- ⚠️ **Email marketing**: Requiere consentimiento previo (RGPD)
- ✅ **Uso interno**: Investigación y análisis es permitido

### Límites de la API

Google Places tiene límites diarios gratuitos:
- 🆓 **Sin costo**: Primeros $200/mes
- 💰 **Pago**: Después de $200/mes

Monitorea uso en: https://console.cloud.google.com/apis/dashboard

---

## 🔄 Actualizaciones Futuras

Posibles mejoras:

- [ ] Soporte para Islas Canarias
- [ ] Búsqueda en Portugal
- [ ] Extracción de redes sociales (Instagram, Facebook)
- [ ] Validación de emails con API externa
- [ ] Categorización automática (alquiler vs venta vs camperización)

---

## 📞 Soporte

Para problemas o preguntas sobre este script, revisa:

1. Logs de ejecución en consola
2. Archivo CSV generado
3. Costos en Google Cloud Console

---

**Última actualización**: 2025-01-11  
**Versión**: 1.0.0



