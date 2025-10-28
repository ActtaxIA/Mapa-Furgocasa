# 🔧 SOLUCIÓN: Problemas con Edición y Borrado de Áreas en Admin

## 📋 PROBLEMA IDENTIFICADO

Las acciones de **editar** y **borrar** áreas desde el panel de administrador (`/admin/areas`) no funcionaban en Supabase debido a políticas RLS (Row Level Security) restrictivas.

### Síntomas:
- ✗ Al intentar borrar un área, se confirma pero no se elimina de la base de datos
- ✗ Al editar un área (`/admin/areas/edit/[id]`), los cambios no se guardan
- ✗ No aparecen errores específicos en consola

---

## 🎯 CAUSA RAÍZ

Las políticas RLS de la tabla `areas` en Supabase estaban configuradas para que los usuarios **solo puedan editar/borrar las áreas que ellos mismos crearon** (identificadas por el campo `created_by`).

### Políticas problemáticas:

```sql
-- Solo el creador puede actualizar sus áreas
CREATE POLICY "Usuarios pueden actualizar sus áreas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Solo el creador puede eliminar sus áreas
CREATE POLICY "Usuarios pueden eliminar sus áreas"
  ON public.areas FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
```

**Problema:** Los administradores no podían editar/borrar áreas que fueron:
- Migradas desde SQLite (sin `created_by`)
- Creadas por otros usuarios
- Creadas antes de implementar el sistema de autenticación

---

## ✅ SOLUCIÓN IMPLEMENTADA

Se ha creado el archivo `supabase/fix-admin-policies.sql` que:

1. **Elimina las políticas restrictivas** existentes
2. **Crea nuevas políticas** que permiten a los administradores gestionar TODAS las áreas
3. **Mantiene la seguridad** para usuarios normales (solo sus áreas)
4. **Permite a admins ver áreas inactivas** (importante para gestión)

### Nuevas Políticas:

```sql
-- ACTUALIZACIÓN: Creadores Y administradores pueden actualizar
CREATE POLICY "Usuarios y admins pueden actualizar áreas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- ELIMINACIÓN: Creadores Y administradores pueden eliminar
CREATE POLICY "Usuarios y admins pueden eliminar áreas"
  ON public.areas FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- VISUALIZACIÓN: Todos ven activas, admins ven todas
CREATE POLICY "Áreas públicas y admins ven todas"
  ON public.areas FOR SELECT
  USING (
    activo = true
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );
```

---

## 🚀 PASOS PARA APLICAR LA SOLUCIÓN

### 1. Ejecutar el Script SQL en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a **SQL Editor** (icono de código en el menú lateral)
3. Haz clic en **New Query**
4. Copia y pega el contenido completo de `supabase/fix-admin-policies.sql`
5. Haz clic en **Run** (o presiona `Ctrl+Enter`)
6. Deberías ver el mensaje: `"Políticas de administrador actualizadas correctamente!"`

### 2. Verificar los Cambios

Después de ejecutar el script, verás la lista de políticas activas. Deberías tener:

| policyname | cmd | roles |
|------------|-----|-------|
| Áreas públicas y admins ven todas | SELECT | public |
| Usuarios autenticados pueden crear áreas | INSERT | authenticated |
| Usuarios y admins pueden actualizar áreas | UPDATE | authenticated |
| Usuarios y admins pueden eliminar áreas | DELETE | authenticated |

### 3. Probar la Funcionalidad

1. **Cierra sesión y vuelve a iniciar sesión** como administrador
2. Ve a `/admin/areas`
3. Intenta **editar** un área → Los cambios deberían guardarse ✅
4. Intenta **borrar** un área → Se debería eliminar correctamente ✅

---

## 🔍 VERIFICACIÓN DE ADMIN

El sistema verifica que un usuario es administrador mediante:

```typescript
session.user.user_metadata?.is_admin === true
```

**Importante:** Asegúrate de que tu usuario tiene el campo `is_admin: true` en `user_metadata`.

### Cómo verificar/actualizar:

1. Ve a **Authentication** → **Users** en Supabase Dashboard
2. Selecciona tu usuario
3. En **User Metadata**, debería aparecer:
   ```json
   {
     "is_admin": true
   }
   ```
4. Si no existe, edita el usuario y añade ese campo

---

## 📝 BENEFICIOS ADICIONALES

Con estas nuevas políticas:

✅ Los administradores pueden gestionar **todas las áreas**
✅ Los administradores pueden ver **áreas inactivas** en el panel
✅ Los usuarios normales siguen limitados a sus propias áreas (seguridad)
✅ Compatible con áreas migradas desde SQLite
✅ No requiere cambios en el código de la aplicación

---

## 🔒 SEGURIDAD

Estas políticas mantienen la seguridad porque:

- ✅ Solo usuarios **autenticados** pueden hacer cambios
- ✅ Se verifica explícitamente el campo `is_admin` en `user_metadata`
- ✅ Los usuarios no-admin solo pueden editar sus propias áreas
- ✅ Las áreas activas siguen siendo públicas para todos

---

## 🛠️ TROUBLESHOOTING

### Problema: Sigo sin poder editar/borrar áreas

**Posibles causas:**

1. **No ejecutaste el script SQL correctamente**
   - Solución: Vuelve a ejecutar `supabase/fix-admin-policies.sql` en SQL Editor

2. **Tu usuario no tiene is_admin = true**
   - Solución: Ve a Authentication → Users → [tu usuario] → User Metadata
   - Añade o edita: `{"is_admin": true}`

3. **El navegador tiene caché de sesión antigua**
   - Solución: Cierra sesión completamente, borra caché, vuelve a iniciar sesión

4. **Estás usando un usuario diferente al que tiene is_admin**
   - Solución: Verifica con qué usuario has iniciado sesión

### Problema: Veo error "Policy violation" en consola

Esto indica que las políticas RLS siguen rechazando la operación.

**Solución:**
1. Verifica que las políticas nuevas existen:
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'areas' AND schemaname = 'public';
   ```

2. Si las políticas antiguas siguen ahí, elimínalas manualmente:
   ```sql
   DROP POLICY IF EXISTS "Usuarios pueden actualizar sus áreas" ON public.areas;
   DROP POLICY IF EXISTS "Usuarios pueden eliminar sus áreas" ON public.areas;
   ```

---

## 📊 TESTING RECOMENDADO

Después de aplicar los cambios, prueba:

- [ ] Editar un área y guardar cambios
- [ ] Reordenar imágenes de la galería y guardar
- [ ] Cambiar estado verificado/activo de un área
- [ ] Eliminar un área
- [ ] Ver áreas inactivas en el listado de admin
- [ ] Como usuario NO-admin, intentar editar un área ajena (debería fallar) ✅

---

## 📌 ARCHIVOS RELACIONADOS

- `supabase/fix-admin-policies.sql` - Script de corrección (NUEVO)
- `supabase/schema.sql` - Schema original
- `app/admin/areas/page.tsx` - Listado de áreas
- `app/admin/areas/edit/[id]/page.tsx` - Editor de área

---

## ✅ ESTADO FINAL

Después de aplicar esta solución, todas las operaciones de administrador en `/admin/areas` deberían funcionar correctamente.

**Fecha de solución:** 27 de octubre de 2025

