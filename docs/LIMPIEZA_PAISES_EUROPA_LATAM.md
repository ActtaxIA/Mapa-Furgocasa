# 🌍 Limpieza de Áreas: Enfoque Europa y LATAM

## 📋 Resumen

Scripts SQL para eliminar áreas fuera del alcance geográfico de Europa y Latinoamérica, enfocando la aplicación en estos dos continentes.

---

## 🗂️ Scripts Disponibles

### 1. **Script Completo** - `LIMPIAR_areas_fuera_europa_latam.sql`

Elimina TODOS los países fuera de Europa y LATAM:
- ❌ Estados Unidos
- ❌ Marruecos
- ❌ México
- ❌ Australia
- ❌ Nueva Zelanda
- ❌ Canadá
- ❌ Cualquier otro país fuera de Europa/LATAM

**Usa este si quieres limpiar completamente.**

### 2. **Script Específico** - `LIMPIAR_solo_EEUU_marruecos_mexico.sql` ⭐ RECOMENDADO

Elimina SOLO los 3 países especificados:
- ❌ Estados Unidos (todas las variantes: EEUU, USA, United States)
- ❌ Marruecos (Morocco)
- ❌ México (Mexico)

**Usa este para una limpieza quirúrgica.**

---

## 🚀 Cómo Usar

### Paso 1: Acceder a Supabase
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### Paso 2: Elegir el Script
Decide qué script usar según tus necesidades:
- **Limpieza específica** (recomendado): Usa `LIMPIAR_solo_EEUU_marruecos_mexico.sql`
- **Limpieza completa**: Usa `LIMPIAR_areas_fuera_europa_latam.sql`

### Paso 3: Ejecutar el Script
1. Copia todo el contenido del script elegido
2. Pégalo en el SQL Editor de Supabase
3. **IMPORTANTE**: Revisa la vista previa (PASO 1 del script)
4. Ejecuta el script completo

### Paso 4: Verificar Resultados
El script mostrará automáticamente:
- ✅ Cuántas áreas se eliminaron
- ✅ Qué países quedan
- ✅ Distribución por región
- ✅ Top países con más áreas

---

## 🔒 Seguridad - Backup Automático

Ambos scripts incluyen **backup automático** antes de eliminar:

```sql
CREATE TABLE areas_backup_eeuu_marruecos_mexico AS
SELECT * FROM areas WHERE ...
```

### Restaurar Áreas Eliminadas

Si necesitas recuperar las áreas:

```sql
-- Ver áreas en el backup
SELECT * FROM areas_backup_eeuu_marruecos_mexico;

-- Restaurar todas
INSERT INTO areas 
SELECT * FROM areas_backup_eeuu_marruecos_mexico;
```

### Eliminar el Backup

Cuando estés 100% seguro de que no necesitas las áreas:

```sql
DROP TABLE areas_backup_eeuu_marruecos_mexico;
```

---

## 📊 Países que SE MANTIENEN

### 🇪🇺 Europa (45+ países)

**Europa Occidental:**
- España, Portugal, Francia, Italia, Alemania
- Países Bajos, Bélgica, Luxemburgo, Suiza, Austria
- Reino Unido, Irlanda, Andorra, Mónaco

**Europa del Norte:**
- Noruega, Suecia, Dinamarca, Finlandia, Islandia
- Estonia, Letonia, Lituania

**Europa del Este:**
- Polonia, Chequia, Eslovaquia, Hungría
- Rumania, Bulgaria, Croacia, Eslovenia
- Serbia, Bosnia, Montenegro, Albania

**Europa del Sur:**
- Grecia, Chipre, Malta

### 🌎 Latinoamérica (20+ países)

**Sudamérica:**
- Argentina, Chile, Uruguay, Paraguay, Brasil
- Perú, Bolivia, Ecuador, Colombia, Venezuela

**Centroamérica:**
- Costa Rica, Panamá, Nicaragua, Honduras
- El Salvador, Guatemala, Belice

**Caribe:**
- Cuba, República Dominicana, Puerto Rico, Jamaica

> **Nota sobre México:** El script específico elimina México. Si quieres mantenerlo, elimina las líneas correspondientes del script.

---

## 🌍 Países que SE ELIMINAN

### Script Específico:
- ❌ Estados Unidos (EEUU, USA, United States)
- ❌ Marruecos (Morocco)
- ❌ México (Mexico)

### Script Completo (adicionales):
- ❌ Australia
- ❌ Nueva Zelanda
- ❌ Canadá
- ❌ Cualquier país fuera de Europa/LATAM

---

## 📈 Beneficios de la Limpieza

1. **Enfoque Geográfico** 🎯
   - Base de datos centrada en Europa y LATAM
   - Contenido más relevante para usuarios objetivo

2. **Rendimiento** ⚡
   - Menos datos = más rápido
   - Queries más eficientes
   - Menor uso de recursos

3. **Mantenimiento** 🛠️
   - Más fácil gestionar menos países
   - Actualizaciones más focalizadas
   - Mejor calidad de datos

4. **UX Mejorada** 🎨
   - Filtros más relevantes
   - Búsquedas más precisas
   - Menos "ruido" en resultados

---

## 📊 Estadísticas Esperadas Post-Limpieza

Dependerá de cuántas áreas tenías en cada país, pero típicamente:

```
🇪🇺 EUROPA: 90-95% de las áreas
🌎 LATINOAMÉRICA: 5-10% de las áreas
```

**Top 5 países esperados:**
1. 🇪🇸 España (~60-70%)
2. 🇫🇷 Francia (~10-15%)
3. 🇵🇹 Portugal (~5-10%)
4. 🇩🇪 Alemania (~3-5%)
5. 🇮🇹 Italia (~2-4%)

---

## ⚠️ Consideraciones Importantes

### Antes de Ejecutar

1. **Revisa la vista previa** - El script muestra qué se eliminará
2. **Verifica el backup** - Se crea automáticamente
3. **Hora de baja actividad** - Mejor ejecutar cuando hay menos usuarios
4. **Permisos admin** - Necesitas permisos de administrador en Supabase

### Durante la Ejecución

- ⏱️ El proceso puede tardar 1-5 minutos dependiendo del tamaño
- 🔄 No cierres la ventana hasta que termine
- 📊 Revisa los mensajes de confirmación

### Después de Ejecutar

1. ✅ Verifica que los países correctos se eliminaron
2. ✅ Comprueba que Europa/LATAM se mantienen
3. ✅ Prueba el mapa y filtros en la app
4. ✅ Revisa que las búsquedas funcionen bien

---

## 🔧 Troubleshooting

### Error: "Permission denied"
**Solución:** Asegúrate de tener permisos de administrador en Supabase

### Error: "Timeout"
**Solución:** Divide el script en partes más pequeñas y ejecuta por separado

### Eliminé países por error
**Solución:** Restaura desde el backup:
```sql
INSERT INTO areas SELECT * FROM areas_backup_eeuu_marruecos_mexico;
```

### No se creó el backup
**Solución:** Ejecuta solo la sección de backup primero, verifica que funcione, luego continúa

---

## 📝 Checklist de Ejecución

Usa esta lista para asegurar una limpieza exitosa:

- [ ] He revisado qué países quiero eliminar
- [ ] He elegido el script correcto
- [ ] He leído el script completo
- [ ] Tengo acceso admin a Supabase
- [ ] He visto la vista previa de eliminación
- [ ] El backup se creó correctamente
- [ ] He ejecutado las eliminaciones
- [ ] He verificado los resultados
- [ ] He probado el mapa en la app
- [ ] Los filtros funcionan correctamente
- [ ] He decidido si mantener o borrar el backup

---

## 🎯 Resultado Final

Después de ejecutar el script específico tendrás:

```
✅ Europa: TODAS las áreas mantenidas
✅ LATAM (sin México): TODAS las áreas mantenidas
❌ EEUU: 0 áreas
❌ Marruecos: 0 áreas
❌ México: 0 áreas
```

Base de datos limpia, enfocada y optimizada para tu público objetivo. 🎉

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta documentación
2. Consulta los logs del SQL Editor
3. Verifica el backup antes de hacer cambios
4. Prueba primero en un entorno de desarrollo si es posible

---

**Última actualización:** Noviembre 2024
**Versión:** 1.0
**Autor:** Mapa Furgocasa Team

