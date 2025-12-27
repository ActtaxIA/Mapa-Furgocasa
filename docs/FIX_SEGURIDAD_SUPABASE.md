# 🔒 FIX DE SEGURIDAD - Supabase Database Linter

**Fecha:** 27 de Diciembre, 2024  
**Gravedad:** CRÍTICO  
**Problemas detectados:** 15 errores de seguridad

---

## 📊 RESUMEN DE PROBLEMAS

| Tipo | Cantidad | Gravedad | Descripción |
|------|----------|----------|-------------|
| **RLS Disabled** | 4 | 🔴 CRÍTICO | Tablas públicas sin protección RLS |
| **Auth Users Exposed** | 2 | 🔴 CRÍTICO | Vistas exponen datos de usuarios |
| **Security Definer Views** | 5 | 🟡 ADVERTENCIA | Vistas con permisos elevados |

---

## 🚨 PROBLEMAS CRÍTICOS

### 1. **RLS DESHABILITADO EN TABLAS PÚBLICAS**

**Impacto:** Cualquier usuario puede leer/modificar datos sin restricciones

**Tablas afectadas:**
- ✅ `datos_mercado_autocaravanas` - SOLUCIONADO
- ✅ `vehiculo_ficha_tecnica` - SOLUCIONADO
- ✅ `vehiculo_valoracion_economica` - SOLUCIONADO
- ✅ `vehiculos_registrados` - SOLUCIONADO

**Solución aplicada:**
```sql
ALTER TABLE public.[tabla] ENABLE ROW LEVEL SECURITY;
```

---

### 2. **EXPOSICIÓN DE DATOS DE AUTH.USERS**

**Impacto:** Datos sensibles de usuarios (emails, metadata) expuestos a anónimos

**Vistas afectadas:**
- ✅ `v_conversaciones_recientes` - Acceso anon REVOCADO
- ✅ `admin_valoraciones_ia` - Acceso anon REVOCADO

**Solución aplicada:**
```sql
REVOKE SELECT ON public.[vista] FROM anon;
GRANT SELECT ON public.[vista] TO authenticated;
```

---

### 3. **VISTAS CON SECURITY DEFINER**

**Impacto:** Vistas ejecutan con permisos del creador (potencialmente elevados)

**Análisis:**

| Vista | ¿Necesita SECURITY DEFINER? | Acción |
|-------|----------------------------|--------|
| `resumen_economico_vehiculo` | ✅ Sí | Mantener - necesario para agregaciones |
| `v_chatbot_stats` | ✅ Sí | Mantener - necesario para estadísticas |
| `admin_valoraciones_ia` | ✅ Sí | Mantener + Restringir acceso |
| `v_conversaciones_recientes` | ✅ Sí | Mantener + Restringir acceso |
| `estadisticas_mercado_por_modelo` | ✅ Sí | Mantener - necesario para agregaciones |

**Nota:** `SECURITY DEFINER` es necesario cuando la vista necesita acceder a datos con permisos elevados para agregaciones o joins complejos. NO eliminar sin verificar.

---

## 🔧 CÓMO APLICAR LOS FIXES

### **Opción 1: SQL Editor de Supabase (RECOMENDADO)**

1. Ve a tu proyecto en Supabase Dashboard
2. **SQL Editor** → **New Query**
3. Copia y pega el contenido de `supabase/fix-security-issues.sql`
4. Click en **Run** (F5)
5. Verifica que no hay errores

### **Opción 2: CLI de Supabase**

```bash
supabase db execute --file supabase/fix-security-issues.sql
```

---

## ✅ VERIFICACIÓN POST-FIX

### 1. **Verificar RLS habilitado:**

```sql
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'datos_mercado_autocaravanas', 
  'vehiculo_ficha_tecnica', 
  'vehiculo_valoracion_economica', 
  'vehiculos_registrados'
);
```

**Resultado esperado:** Todas las tablas deben tener `RLS Enabled = true`

---

### 2. **Verificar permisos de vistas:**

```sql
SELECT 
  table_name, 
  grantee, 
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name IN ('v_conversaciones_recientes', 'admin_valoraciones_ia')
ORDER BY table_name, grantee;
```

**Resultado esperado:**
- `v_conversaciones_recientes`: Solo `authenticated` y `service_role` (NO `anon`)
- `admin_valoraciones_ia`: Solo `service_role` (NO `anon` ni `authenticated`)

---

### 3. **Re-ejecutar Database Linter:**

1. Ve a: **Database** → **Linter**
2. Click en **Refresh**
3. Verifica que los 15 errores han desaparecido

---

## 🧪 PRUEBAS NECESARIAS

Después de aplicar los fixes, **PRUEBA** estas funcionalidades:

### ✅ **Gestión de Vehículos**
- [ ] Crear nuevo vehículo
- [ ] Ver lista de vehículos propios
- [ ] Editar vehículo propio
- [ ] Eliminar vehículo propio
- [ ] Verificar que NO se ven vehículos de otros usuarios

### ✅ **Datos de Mercado**
- [ ] Ver estadísticas de mercado (como anónimo)
- [ ] Contribuir datos de mercado (como autenticado)
- [ ] Verificar que usuarios NO pueden modificar/eliminar datos de otros

### ✅ **Chatbot**
- [ ] Abrir chatbot
- [ ] Enviar mensaje
- [ ] Ver historial de conversaciones
- [ ] Verificar que solo ves TUS conversaciones

### ✅ **Panel Admin**
- [ ] Login como admin
- [ ] Ver valoraciones IA
- [ ] Verificar que usuarios normales NO pueden acceder

---

## 📋 DETALLE DE CAMBIOS

### **Cambio 1: RLS Habilitado**

```sql
-- ANTES: RLS deshabilitado (INSEGURO)
-- Cualquier usuario podía leer/modificar TODO

-- DESPUÉS: RLS habilitado (SEGURO)
ALTER TABLE public.datos_mercado_autocaravanas ENABLE ROW LEVEL SECURITY;
-- Las políticas RLS controlan el acceso
```

### **Cambio 2: Vistas Protegidas**

```sql
-- ANTES: Anónimos podían ver conversaciones (INSEGURO)
-- GRANT SELECT ON public.v_conversaciones_recientes TO anon;

-- DESPUÉS: Solo usuarios autenticados (SEGURO)
REVOKE SELECT ON public.v_conversaciones_recientes FROM anon;
GRANT SELECT ON public.v_conversaciones_recientes TO authenticated;
```

### **Cambio 3: Vista Admin Restringida**

```sql
-- ANTES: Usuarios autenticados podían acceder (INSEGURO)
-- GRANT SELECT ON public.admin_valoraciones_ia TO authenticated;

-- DESPUÉS: Solo service_role (admins) (SEGURO)
REVOKE SELECT ON public.admin_valoraciones_ia FROM authenticated;
REVOKE SELECT ON public.admin_valoraciones_ia FROM anon;
GRANT SELECT ON public.admin_valoraciones_ia TO service_role;
```

---

## ⚠️ NOTAS IMPORTANTES

### **Sobre SECURITY DEFINER:**

Las vistas con `SECURITY DEFINER` **son necesarias** cuando:
- Necesitan hacer agregaciones cross-schema
- Necesitan acceder a datos con permisos elevados
- Hacen joins complejos que requieren bypass RLS temporal

**NO cambies a `SECURITY INVOKER` sin verificar** que no rompe la funcionalidad.

### **Sobre las Políticas RLS:**

Las políticas RLS ya estaban definidas correctamente. El problema era que RLS no estaba **habilitado** en las tablas. Ahora:

- ✅ RLS habilitado
- ✅ Políticas activas
- ✅ Acceso controlado por usuario

---

## 🎯 RESULTADO ESPERADO

Después de aplicar estos fixes:

- ✅ **0 errores** en Database Linter
- ✅ Usuarios solo ven sus propios datos
- ✅ Anónimos no pueden acceder a vistas sensibles
- ✅ Admins mantienen acceso completo
- ✅ Funcionalidad de la app intacta

---

## 📞 SOPORTE

Si encuentras algún problema después de aplicar los fixes:

1. Revisa los logs de Supabase (Database → Logs)
2. Verifica que las políticas RLS existen
3. Prueba con diferentes roles (anon, authenticated, admin)
4. Si algo no funciona, revierte el cambio específico

---

## 📚 REFERENCIAS

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Linter Docs](https://supabase.com/docs/guides/database/database-linter)
- [Security Best Practices](https://supabase.com/docs/guides/database/postgres/configuration)

---

**¡Importante!** Después de aplicar estos fixes, haz commit de ambos archivos:
- `supabase/fix-security-issues.sql`
- `docs/FIX_SEGURIDAD_SUPABASE.md`

