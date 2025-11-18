# 🔄 Script de Sincronización: Valoraciones IA → Datos de Mercado

## 📋 ¿Qué hace este script?

Este script **NO toca el proceso de valoración IA** (que funciona perfecto). En su lugar, **lee los informes ya creados** y sincroniza sus `precio_objetivo` a la tabla `datos_mercado_autocaravanas`.

---

## 🎯 Objetivo

Cada valoración IA coherente debe convertirse en un **dato de mercado válido** para alimentar futuras valoraciones. Este script lo hace **después** de que la valoración termine, sin interferir con el proceso.

---

## 🚀 Cómo ejecutar

```bash
node scripts/sincronizar-valoraciones-a-mercado.js
```

---

## ⚙️ Funcionamiento

### 1️⃣ **Lee informes de valoración**
```javascript
SELECT * FROM valoracion_ia_informes
WHERE precio_objetivo IS NOT NULL
ORDER BY fecha_valoracion DESC
```

### 2️⃣ **Para cada informe:**
- Extrae: `precio_objetivo`, `marca`, `modelo`, `año`, `kilometros_actual`
- Verifica si YA existe en `datos_mercado_autocaravanas`
- Si NO existe → **Inserta** con:
  - `precio`: `precio_objetivo` (redondeado)
  - `origen`: "Valoración IA Usuario"
  - `tipo_dato`: "Valoración IA Usuario"
  - `verificado`: `true`
  - `fecha_transaccion`: fecha de la valoración

### 3️⃣ **Evita duplicados:**
- Busca por: `marca + modelo + año + precio`
- Si existe → **NO inserta** (log: 🔄 Duplicado)
- Si no existe → **Inserta** (log: ✅ Nuevo)

---

## 📊 Output Ejemplo

```
🔄 Sincronizando valoraciones IA a datos_mercado_autocaravanas...

📥 Cargando informes de valoración IA...
✅ Cargados 12 informes de valoración

   ✅ Nuevo: Weinsberg Carabus 600 MQ 2023 - 72500€
   🔄 Duplicado: Adria Twin Plus 600 2023 - 65000€ (ya existe)
   ✅ Nuevo: Knaus Boxstar 600 2024 - 78900€
   🔄 Duplicado: Giottivan 54T 2022 - 58000€ (ya existe)
   ...

============================================================
📊 RESUMEN DE SINCRONIZACIÓN
============================================================
📥 Informes procesados:       12
✅ Nuevos insertados:         8
🔄 Duplicados (saltados):     3
❌ Errores:                   1
============================================================

✅ Sincronización completada!
🎉 Script finalizado correctamente
```

---

## 🔁 Cuándo ejecutarlo

### Opción 1: **Manual (Recomendado inicialmente)**
```bash
# Una vez a la semana o cuando tengas varias valoraciones nuevas
node scripts/sincronizar-valoraciones-a-mercado.js
```

### Opción 2: **Cron Job Automático**
```bash
# Cada día a las 3 AM
0 3 * * * cd /ruta/proyecto && node scripts/sincronizar-valoraciones-a-mercado.js
```

### Opción 3: **Trigger en Supabase** (Futuro)
Si quieres automatización completa, se podría crear un trigger:
```sql
CREATE OR REPLACE FUNCTION sync_valoracion_to_mercado()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar en datos_mercado si no existe
  INSERT INTO datos_mercado_autocaravanas (...)
  SELECT ... WHERE NOT EXISTS ...
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_valoracion_insert
AFTER INSERT ON valoracion_ia_informes
FOR EACH ROW EXECUTE FUNCTION sync_valoracion_to_mercado();
```

---

## ✅ Ventajas de este enfoque

1. **NO rompe el proceso de valoración** (funciona perfecto)
2. **Independiente**: Se ejecuta cuando quieras
3. **Seguro**: Verifica duplicados antes de insertar
4. **Reversible**: Puedes borrar y volver a ejecutar
5. **Logs claros**: Sabes exactamente qué se insertó
6. **Sin bloqueos**: No ralentiza la valoración IA

---

## 🔍 Verificar resultados

Después de ejecutar el script, verifica en:

**Admin Panel:**
```
https://www.mapafurgocasa.com/admin/datos-mercado
```

**Filtrar por:**
- `origen`: "Valoración IA Usuario"
- `tipo_dato`: "Valoración IA Usuario"

Deberías ver todos tus vehículos valorados con sus `precio_objetivo` 🎯

---

## ⚠️ Notas importantes

- ✅ **NO modifica** el proceso de valoración IA
- ✅ **NO duplica** datos existentes
- ✅ **NO bloquea** la interfaz
- ✅ **Usa** `SUPABASE_SERVICE_ROLE_KEY` (admin)
- ⚠️ Requiere `.env.local` configurado

---

## 🐛 Troubleshooting

### Error: "Faltan variables de entorno"
```bash
# Verifica que existan en .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Error: "Cannot find module"
```bash
npm install @supabase/supabase-js dotenv
```

### No se insertan datos
- Revisa logs: ¿Son todos duplicados? (🔄)
- Verifica que los informes tengan `precio_objetivo`
- Comprueba permisos de BD

---

## 📈 Mejoras futuras (opcional)

1. **Configurar como cron job** en el servidor
2. **Trigger automático** en Supabase
3. **Webhook** desde valoración IA (cuando termine)
4. **Dashboard** de sincronización en admin panel

---

**Versión:** 3.10.5  
**Última actualización:** 2025-11-18  
**Autor:** Mapa Furgocasa

