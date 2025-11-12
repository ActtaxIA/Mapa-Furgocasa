# 🚨 Sistema de Alertas de Accidentes - Scripts SQL

Este directorio contiene los scripts SQL necesarios para implementar el **Sistema de Alertas de Accidentes** en Supabase.

---

## 📋 Orden de Ejecución

**IMPORTANTE:** Ejecutar los scripts en el orden indicado en el **SQL Editor de Supabase**.

### 1️⃣ `01_crear_tablas.sql`
**Descripción:** Crea las 3 tablas principales del sistema
- `vehiculos_registrados` - Autocaravanas registradas por usuarios
- `reportes_accidentes` - Reportes de accidentes de testigos
- `notificaciones_reportes` - Historial de notificaciones

**Índices creados:** 11 índices para optimizar consultas

---

### 2️⃣ `02_crear_triggers.sql`
**Descripción:** Crea triggers y funciones automáticas
- Trigger `update_vehiculos_updated_at` - Actualiza fecha de modificación
- Trigger `update_reportes_updated_at` - Actualiza fecha de modificación
- Trigger `trigger_crear_notificacion_reporte` - Crea notificación automática al crear reporte
- Trigger `trigger_marcar_notificacion_leida` - Marca notificación como leída

---

### 3️⃣ `03_configurar_rls.sql`
**Descripción:** Configura Row Level Security (RLS) para seguridad
- **Políticas para `vehiculos_registrados`:**
  - Los usuarios solo ven sus propios vehículos
  - Búsqueda pública por QR (necesario para página de reporte)
  
- **Políticas para `reportes_accidentes`:**
  - Cualquiera puede crear reportes (anon)
  - Solo propietarios ven reportes de sus vehículos
  - Solo propietarios pueden actualizar/cerrar reportes

- **Políticas para `notificaciones_reportes`:**
  - Los usuarios solo ven sus notificaciones
  - El sistema puede crear notificaciones

---

### 4️⃣ `04_funciones_auxiliares.sql`
**Descripción:** Funciones útiles para consultas y estadísticas

#### Funciones creadas:

1. **`estadisticas_vehiculo(vehiculo_uuid)`**
   - Retorna: total_reportes, reportes_pendientes, reportes_cerrados, ultimo_reporte
   - Uso: Estadísticas de un vehículo específico

2. **`contar_reportes_no_leidos(usuario_uuid)`**
   - Retorna: cantidad de reportes no leídos
   - Uso: Badge de notificaciones en perfil

3. **`buscar_vehiculo_por_qr(qr_id)`**
   - Retorna: datos del vehículo o existe=false
   - Uso: Página pública de reporte

4. **`obtener_reportes_usuario(usuario_uuid)`**
   - Retorna: todos los reportes con información completa
   - Uso: Dashboard de reportes en perfil

5. **`marcar_reporte_leido(reporte_uuid, usuario_uuid)`**
   - Retorna: true/false
   - Uso: Marcar reporte como leído

6. **`cerrar_reporte(reporte_uuid, usuario_uuid, notas)`**
   - Retorna: true/false
   - Uso: Cerrar/resolver un reporte

7. **`generar_qr_id()`**
   - Retorna: string único (ej: "qr-a1b2c3d4e5f6")
   - Uso: Generar ID para QR al crear vehículo

---

## 🚀 Cómo Ejecutar

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido de `01_crear_tablas.sql`
5. Haz clic en **Run** (Ejecutar)
6. Verifica que aparezca: "Tablas creadas correctamente!"
7. Repite los pasos 3-6 con los demás scripts en orden

---

## ✅ Verificación

Después de ejecutar todos los scripts, verifica que todo esté correcto:

```sql
-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('vehiculos_registrados', 'reportes_accidentes', 'notificaciones_reportes');

-- Ver todas las funciones creadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%vehiculo%' OR routine_name LIKE '%reporte%';

-- Ver todas las políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('vehiculos_registrados', 'reportes_accidentes', 'notificaciones_reportes');
```

---

## 🔧 Tests Opcionales

Al final de `04_funciones_auxiliares.sql` hay tests comentados que puedes ejecutar:

```sql
-- Test 1: Generar QR ID único
SELECT public.generar_qr_id();

-- Test 2: Buscar vehículo por QR (debería retornar existe = false)
SELECT * FROM public.buscar_vehiculo_por_qr('qr-test-123');

-- Test 3: Contar reportes no leídos
-- Reemplazar 'TU-USER-UUID' con un UUID real
SELECT public.contar_reportes_no_leidos('TU-USER-UUID');
```

---

## 🗄️ Estructura de Datos

### Tabla: `vehiculos_registrados`
```sql
- id (UUID) - PK
- user_id (UUID) - FK → auth.users
- matricula (VARCHAR)
- marca, modelo, año, color
- foto_url, fotos_adicionales
- qr_code_id (VARCHAR UNIQUE) ← Para generar QR
- qr_image_url (TEXT) ← URL del QR generado
- activo, verificado
- created_at, updated_at
```

### Tabla: `reportes_accidentes`
```sql
- id (UUID) - PK
- vehiculo_afectado_id (UUID) - FK → vehiculos_registrados
- matricula_tercero, descripcion_tercero
- testigo_nombre, testigo_email, testigo_telefono
- descripcion, tipo_dano
- ubicacion_lat, ubicacion_lng, ubicacion_direccion
- fotos_urls (TEXT[])
- fecha_accidente
- ip_address, captcha_verificado
- leido, cerrado, notas_propietario
- created_at, updated_at
```

### Tabla: `notificaciones_reportes`
```sql
- id (UUID) - PK
- user_id (UUID) - FK → auth.users
- reporte_id (UUID) - FK → reportes_accidentes
- tipo_notificacion (email/push/in_app)
- estado (pendiente/enviada/fallida)
- intentos
- enviada_at, leida_at
- created_at
```

---

## 🔗 Relaciones

```
auth.users
    ↓ user_id
vehiculos_registrados
    ↓ vehiculo_afectado_id
reportes_accidentes
    ↓ reporte_id
notificaciones_reportes
```

---

## 🛡️ Seguridad (RLS)

### Políticas Principales:

✅ **Usuarios autenticados:**
- Solo ven sus propios vehículos
- Solo ven reportes de sus vehículos
- Solo pueden actualizar sus propios datos

✅ **Usuarios anónimos (public):**
- Pueden buscar vehículo por QR (solo datos básicos)
- Pueden crear reportes (sin autenticación)
- NO pueden ver reportes de otros

✅ **Sistema:**
- Puede crear notificaciones automáticamente
- Los triggers se ejecutan con privilegios DEFINER

---

## 📊 Estadísticas Rápidas

```sql
-- Contar vehículos registrados
SELECT COUNT(*) FROM vehiculos_registrados;

-- Contar reportes totales
SELECT COUNT(*) FROM reportes_accidentes;

-- Reportes por estado
SELECT 
  COUNT(*) FILTER (WHERE leido = false) as no_leidos,
  COUNT(*) FILTER (WHERE cerrado = false) as pendientes,
  COUNT(*) FILTER (WHERE cerrado = true) as cerrados
FROM reportes_accidentes;

-- Top 5 usuarios con más vehículos registrados
SELECT user_id, COUNT(*) as total_vehiculos
FROM vehiculos_registrados
GROUP BY user_id
ORDER BY total_vehiculos DESC
LIMIT 5;
```

---

## 🚨 Troubleshooting

### Error: "permission denied for table"
**Solución:** Asegúrate de que RLS está habilitado y las políticas están creadas correctamente

### Error: "function does not exist"
**Solución:** Ejecuta los scripts en orden (especialmente `02_crear_triggers.sql`)

### Error: "duplicate key value violates unique constraint"
**Solución:** El QR ID ya existe. Usa la función `generar_qr_id()` para generar uno único

---

## 📞 Soporte

Si tienes problemas ejecutando los scripts:
1. Verifica que tienes permisos de administrador en Supabase
2. Revisa los logs de error en el SQL Editor
3. Comprueba que ejecutaste los scripts en orden
4. Verifica que la extensión `uuid-ossp` está habilitada

---

## 🎯 Próximos Pasos

Una vez ejecutados todos los scripts, continuar con:
1. **Crear componentes React** para el frontend
2. **Implementar generación de QR** con librería `qrcode`
3. **Crear página pública** `/reporte/[qr-id]`
4. **Añadir tabs al perfil** para vehículos y reportes
5. **Implementar API endpoints** en Next.js

---

## 📝 Notas Importantes

- Los QR IDs son únicos e inmutables
- Los reportes NO se pueden editar por testigos (solo crear)
- Los propietarios pueden marcar reportes como leídos/cerrados
- Las notificaciones se crean automáticamente (trigger)
- Las fotos se almacenan en Supabase Storage (solo URLs en BD)
- La geolocalización se obtiene desde el navegador del testigo
- El geocoding reverso se hace con Google Maps API

---

**¡Sistema listo para usar! 🎉**
