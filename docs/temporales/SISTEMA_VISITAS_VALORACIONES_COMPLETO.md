# 📋 Sistema Completo de Visitas y Valoraciones

## ✅ Lo que se ha implementado:

### 1. **Sistema de Registro de Visitas**
- ✅ Botón "Registrar Visita" en la página de detalle del área
- ✅ Modal para seleccionar fecha y añadir notas
- ✅ Guardado en la tabla `visitas` de Supabase
- ✅ Modal de éxito que pregunta si quieres valorar

### 2. **Sistema de Valoraciones**
- ✅ Componente `ValoracionesCompleto` que reemplaza al anterior
- ✅ Selector de estrellas (1-5)
- ✅ Campo de comentario opcional
- ✅ Verificación de autenticación antes de valorar
- ✅ Guardado en tabla `valoraciones` con restricción única (1 valoración por usuario/área)

### 3. **Dashboard de Perfil de Usuario**
- ✅ **Tab Visitas**: Lista y mapa de áreas visitadas con Google Maps
- ✅ **Tab Valoraciones**: Gestión de valoraciones con promedio
- ✅ **Tab Favoritos**: Grid de áreas favoritas
- ✅ **Tab Rutas**: Gestión de rutas guardadas
- ✅ **Estadísticas**: Contadores en tiempo real

### 4. **Mejoras en Carga de Datos**
- ✅ Consultas separadas para evitar problemas de JOIN
- ✅ Manejo correcto de errores
- ✅ Filtrado de resultados null

## 🗄️ Estructura de Base de Datos

### Tabla: `visitas`
```sql
- id (UUID)
- user_id (UUID) → auth.users
- area_id (UUID) → areas
- fecha_visita (DATE)
- notas (TEXT, opcional)
- created_at (TIMESTAMP)
```

### Tabla: `valoraciones`
```sql
- id (UUID)
- user_id (UUID) → auth.users
- area_id (UUID) → areas
- rating (INT 1-5)
- comentario (TEXT, opcional)
- fotos (TEXT[], opcional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE(user_id, area_id) ← Solo 1 valoración por usuario/área
```

### Tabla: `rutas`
```sql
- id (UUID)
- user_id (UUID) → auth.users
- nombre (TEXT)
- descripcion (TEXT, opcional)
- origen (JSONB)
- destino (JSONB)
- paradas (JSONB)
- distancia_km (DECIMAL)
- duracion_minutos (INT)
- geometria (JSONB)
- favorito (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔒 Políticas RLS (Row Level Security)

Todas las tablas tienen RLS habilitado con las siguientes políticas:

### visitas, valoraciones, favoritos, rutas:
- ✅ **SELECT**: Los usuarios solo ven sus propios registros
- ✅ **INSERT**: Los usuarios pueden crear sus registros
- ✅ **UPDATE**: Los usuarios pueden actualizar sus registros
- ✅ **DELETE**: Los usuarios pueden eliminar sus registros

## 🚀 Pasos para verificar que todo funciona:

### 1. **Ejecuta el SQL de rutas** (si no lo has hecho):
```bash
# En Supabase SQL Editor
supabase/add-rutas-table.sql
```

### 2. **Verifica las tablas en Supabase**:
- Ve a Table Editor
- Confirma que existen: `visitas`, `valoraciones`, `favoritos`, `rutas`
- Verifica que RLS esté habilitado (candado verde)

### 3. **Prueba el flujo completo**:

#### A. Registrar una visita:
1. Ve a cualquier área: `http://localhost:3000/area/[slug]`
2. Haz clic en **"Registrar Visita"**
3. Selecciona la fecha y añade notas (opcional)
4. Haz clic en "Registrar Visita"
5. ✅ Verás modal de éxito
6. ✅ Se abrirá automáticamente el formulario de valoración

#### B. Crear una valoración:
1. Selecciona las estrellas (1-5)
2. Escribe un comentario (opcional)
3. Haz clic en "Publicar Valoración"
4. ✅ La valoración aparecerá inmediatamente

#### C. Ver en el perfil:
1. Ve a: `http://localhost:3000/perfil`
2. **Tab "Visitas"**: Verás tus visitas en lista y mapa
3. **Tab "Valoraciones"**: Verás tus valoraciones con promedio
4. **Tab "Favoritos"**: Áreas que has marcado como favoritas
5. **Tab "Rutas"**: Rutas que has guardado desde `/ruta`

## 🔧 Debugging

Si no ves tus visitas/valoraciones:

### 1. **Abre la consola del navegador (F12)**
```javascript
// Verifica que estás autenticado
const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('User ID:', session?.user?.id)
```

### 2. **Verifica en Supabase directamente**
- Ve a Table Editor → `visitas`
- Busca registros con tu `user_id`
- Si no hay registros, el INSERT falló (revisa políticas RLS)

### 3. **Revisa las políticas RLS**
```sql
-- En Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'visitas';
SELECT * FROM pg_policies WHERE tablename = 'valoraciones';
```

Deberías ver políticas como:
- `"Usuarios ven sus visitas"`
- `"Usuarios pueden crear visitas"`
- etc.

### 4. **Test manual en SQL**
```sql
-- Ver tus visitas (reemplaza el UUID con tu user_id)
SELECT * FROM visitas WHERE user_id = 'tu-user-id-aqui';

-- Ver tus valoraciones
SELECT * FROM valoraciones WHERE user_id = 'tu-user-id-aqui';
```

## 📝 Archivos modificados/creados:

### Nuevos:
- ✅ `components/area/ValoracionesCompleto.tsx` - Sistema completo de valoraciones
- ✅ `components/perfil/DashboardStats.tsx` - Estadísticas del perfil
- ✅ `components/perfil/VisitasTab.tsx` - Tab de visitas con mapa
- ✅ `components/perfil/MapaVisitas.tsx` - Mapa de visitas con Google Maps
- ✅ `components/perfil/ValoracionesTab.tsx` - Tab de valoraciones
- ✅ `components/perfil/FavoritosTab.tsx` - Tab de favoritos
- ✅ `components/perfil/RutasTab.tsx` - Tab de rutas
- ✅ `supabase/add-rutas-table.sql` - SQL para tabla de rutas

### Modificados:
- ✅ `app/(public)/perfil/page.tsx` - Dashboard completo con tabs
- ✅ `app/(public)/area/[slug]/page.tsx` - Usa nuevo componente de valoraciones
- ✅ `components/ruta/PlanificadorRuta.tsx` - Guarda rutas en BD
- ✅ `types/database.types.ts` - Añadido tipo `Ruta`

## 🎯 Funcionalidades del sistema:

### Usuario puede:
1. ✅ Registrar visitas a áreas con fecha y notas
2. ✅ Valorar áreas (1-5 estrellas + comentario)
3. ✅ Ver mapa de sus visitas con Google Maps
4. ✅ Gestionar sus valoraciones (editar/eliminar)
5. ✅ Marcar áreas como favoritos
6. ✅ Guardar rutas calculadas con nombre y descripción
7. ✅ Ver estadísticas completas en su perfil

### El sistema:
1. ✅ Verifica autenticación antes de permitir acciones
2. ✅ Muestra modal de éxito después de registrar visita
3. ✅ Sugiere valorar después de registrar una visita
4. ✅ Previene valoraciones duplicadas (1 por usuario/área)
5. ✅ Actualiza contadores en tiempo real
6. ✅ Carga datos correctamente con consultas separadas

## 💡 Próximas mejoras sugeridas:

1. **Botones de acción en el mapa principal** para registrar visitas rápidamente
2. **Fotos en las valoraciones** (ya está la columna en BD, falta UI)
3. **Edición de valoraciones** desde el perfil
4. **Exportar rutas** a GPX o formato compartible
5. **Compartir valoraciones** en redes sociales
6. **Notificaciones** cuando alguien valora un área que has visitado

---

¿Todo funciona? Si sigues teniendo problemas, revisa los logs de la consola y comparte el error específico.

