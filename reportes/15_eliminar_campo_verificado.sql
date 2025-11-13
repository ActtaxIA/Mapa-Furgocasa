-- ===================================================================
-- SCRIPT: Eliminar campo "verificado" de reportes_accidentes
-- ===================================================================
-- PROPÓSITO: Simplificar el sistema eliminando verificación innecesaria
-- ===================================================================
-- FECHA: 2025-11-13
-- VERSIÓN: 1.0
-- AUTOR: Sistema Mapa Furgocasa
-- ===================================================================

-- CONTEXTO:
-- El campo "verificado" no tiene sentido en este contexto porque:
-- 1. Desincentiva que los testigos hagan reportes (más fricción)
-- 2. El testigo ya está haciendo un favor al reportar
-- 3. La validación debe ser responsabilidad del propietario, no del testigo
-- 4. Los campos "leido" y "cerrado" son suficientes para gestión

-- ===================================================================
-- ELIMINAR COLUMNA (si existe)
-- ===================================================================

ALTER TABLE public.reportes_accidentes
DROP COLUMN IF EXISTS verificado;

-- ===================================================================
-- VERIFICACIÓN
-- ===================================================================

-- Ver las columnas actuales de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'reportes_accidentes'
ORDER BY ordinal_position;

-- ===================================================================
-- RESULTADO ESPERADO:
-- ===================================================================
-- La tabla debe tener estas columnas de estado:
-- - leido (boolean) - El propietario ha visto el reporte
-- - cerrado (boolean) - El propietario marca el caso como resuelto
-- - captcha_verificado (boolean) - Verificación anti-spam (opcional)
--
-- NO debe tener:
-- - verificado (ELIMINADO - innecesario)
-- ===================================================================

RAISE NOTICE '✅ Campo "verificado" eliminado de reportes_accidentes';
RAISE NOTICE '✅ Sistema simplificado - solo leido/cerrado/captcha_verificado';

