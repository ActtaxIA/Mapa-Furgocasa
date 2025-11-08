# 🔧 Script: Corregir Países de Áreas Añadidas HOY

## 📋 Descripción

Script optimizado para corregir automáticamente los países de las áreas importadas **el día actual**. Ideal para ejecutar al final del día después de una sesión de importación masiva.

## ✨ Ventajas

- ✅ **Ahorra dinero**: Solo procesa áreas del día actual, no toda la base de datos
- ✅ **Automático**: Filtra automáticamente por fecha (00:00 del día actual)
- ✅ **Eficiente**: Perfecto para días de importación masiva
- ✅ **Seguro**: Modo dry-run por defecto, no aplica cambios sin confirmación
- ✅ **Informativo**: Muestra costos estimados y estadísticas detalladas

## 🚀 Uso

### 1. Ver qué cambios haría (DRY RUN - no gasta dinero)

```bash
npm run db:fix:countries:today
```

Esto te mostrará:
- Cuántas áreas se importaron hoy
- Qué países están incorrectos
- Cuánto costará corregirlos
- **NO gasta créditos de Google API**

### 2. Aplicar los cambios realmente

```bash
npm run db:fix:countries:today -- --apply
```

⚠️ **Este comando sí gasta créditos de Google Geocoding API**

## 📊 Ejemplo de Salida

```
════════════════════════════════════════════════════════════════════
🔧 CORRECCIÓN DE PAÍSES - ÁREAS AÑADIDAS HOY
════════════════════════════════════════════════════════════════════
📅 Fecha: viernes, 8 de noviembre de 2024
🕐 Hora: 20:45:32
📊 Filtrando áreas desde: 8/11/2024, 0:00:00
Modo: 👀 DRY RUN (solo mostrar)
════════════════════════════════════════════════════════════════════

📊 Cargando áreas creadas hoy desde Supabase...
   Cargadas 11 áreas...

✅ Total: 11 áreas creadas hoy con coordenadas GPS

📅 Rango de fechas de las áreas:
   Primera área: 8/11/2024, 18:30:15
   Última área:  8/11/2024, 20:15:42

🔍 Analizando países con Google Geocoding API...

🔄 Autocamperplads Øster Hurup Havn
   España → Dinamarca

🔄 Flauenskjold Autocamping
   España → Dinamarca

...

════════════════════════════════════════════════════════════════════
📊 RESUMEN
════════════════════════════════════════════════════════════════════
Áreas procesadas:     11
Cambios necesarios:   11
Correctas:            0
Errores:              0
Llamadas API Google:  11
Costo estimado:       ~$0.06 USD
════════════════════════════════════════════════════════════════════

📋 CAMBIOS POR PAÍS:
   España → Dinamarca: 11 áreas

👀 Modo DRY RUN - No se aplicaron cambios
   Para aplicar los cambios, ejecuta:
   npm run db:fix:countries:today -- --apply
```

## 💰 Costos

| Áreas procesadas | Llamadas API | Costo aproximado |
|------------------|--------------|------------------|
| 10 áreas         | 10           | $0.05 USD        |
| 50 áreas         | 50           | $0.25 USD        |
| 100 áreas        | 100          | $0.50 USD        |
| 500 áreas        | 500          | $2.50 USD        |
| 1000 áreas       | 1000         | $5.00 USD        |

**Precio de Google:** $5 USD por cada 1000 llamadas a Geocoding API

## 🎯 Cuándo Usarlo

### ✅ Casos ideales:

1. **Después de importar áreas nuevas** durante el día
2. **Al final del día** después de una sesión de importación
3. **Cuando sabes que importaste áreas** de países que no son España
4. **Importaciones masivas** de 10-500 áreas en un día

### ❌ Cuando NO usarlo:

1. Si no importaste áreas hoy (no encontrará nada)
2. Si solo importaste 1-2 áreas (no vale la pena)
3. Si ya ejecutaste el script hoy y aplicaste cambios

## 🔄 Workflow Recomendado

### Flujo ideal de importación:

```bash
# 1. Importar áreas desde búsqueda masiva
# (Via web: /admin/areas/busqueda-masiva)

# 2. Al final del día, ver qué se importó
npm run db:fix:countries:today

# 3. Si hay cambios necesarios, aplicarlos
npm run db:fix:countries:today -- --apply

# 4. Verificar en la web que los países son correctos
# (Via web: /admin/areas)
```

## ⚙️ Cómo Funciona

1. **Calcula inicio del día**: 00:00:00 del día actual
2. **Filtra áreas**: Solo áreas con `created_at >= 00:00:00 de hoy`
3. **Verifica coordenadas**: Solo áreas con latitud/longitud válidas
4. **Llama a Google**: Reverse Geocoding (lat/lng → país)
5. **Compara**: País en BD vs País real de Google
6. **Muestra cambios**: Lista detallada de correcciones
7. **Aplica** (solo si pasas `--apply`): Actualiza la base de datos

## 🛡️ Seguridad

- ✅ Modo dry-run por defecto (no hace cambios)
- ✅ Delay de 100ms entre llamadas (no satura API)
- ✅ Muestra costo estimado antes de aplicar
- ✅ Solo actualiza el país si es diferente
- ✅ Actualiza provincia/ciudad solo si están vacías
- ✅ Logs detallados de cada operación

## 📝 Variables de Entorno Necesarias

Asegúrate de tener en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxx...
```

## 🆚 Diferencia con `fix-countries-with-geocoding.ts`

| Feature | `fix-countries-today.ts` | `fix-countries-with-geocoding.ts` |
|---------|--------------------------|-----------------------------------|
| **Áreas procesadas** | Solo del día actual | Todas las áreas |
| **Costo típico** | $0.05 - $2.50 | $50 - $500 |
| **Tiempo ejecución** | 1-5 minutos | 30-120 minutos |
| **Uso recomendado** | Diario, después de importar | Mensual, limpieza general |
| **Comando** | `npm run db:fix:countries:today` | `npm run db:fix:countries` |

## 🐛 Troubleshooting

### No encuentra áreas

```
⚠️  No se encontraron áreas creadas hoy con coordenadas GPS
```

**Causa**: No hay áreas importadas hoy o no tienen coordenadas.

**Solución**: Verifica que importaste áreas hoy y que tienen lat/lng.

### Error de API Key

```
❌ Error: Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

**Solución**: Añade la API Key en `.env.local`

### Error de Supabase

```
❌ Error: Faltan variables de entorno de Supabase
```

**Solución**: Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén en `.env.local`

## 📞 Soporte

Si tienes problemas:
1. Verifica que las variables de entorno estén configuradas
2. Asegúrate de que Google Maps API esté habilitada en Google Cloud Console
3. Verifica que tengas créditos disponibles en Google Cloud
4. Revisa los logs del script para más detalles

## 🎉 Ejemplo Completo

```bash
# Terminal
$ npm run db:fix:countries:today

🔧 CORRECCIÓN DE PAÍSES - ÁREAS AÑADIDAS HOY
📅 Fecha: viernes, 8 de noviembre de 2024
✅ Total: 11 áreas creadas hoy

📊 RESUMEN
Áreas procesadas:     11
Cambios necesarios:   11
Costo estimado:       ~$0.06 USD

📋 CAMBIOS POR PAÍS:
   España → Dinamarca: 11 áreas

👀 Modo DRY RUN - No se aplicaron cambios

# Si todo se ve bien, aplicar cambios
$ npm run db:fix:countries:today -- --apply

💾 Aplicando cambios a la base de datos...
✅ Autocamperplads Øster Hurup Havn: España → Dinamarca
✅ Flauenskjold Autocamping: España → Dinamarca
...

✅ CAMBIOS APLICADOS
Actualizadas correctamente: 11
Errores:                    0

✅ Script completado
```

---

**Creado por:** Acttax IA  
**Fecha:** Noviembre 2024  
**Versión:** 1.0

