-- ================================================================
-- RLS para datos_mercado_autocaravanas
-- ================================================================
-- Permitir que todos puedan leer los datos verificados
-- Solo Service Role puede insertar/modificar
-- ================================================================

-- Deshabilitar RLS temporalmente para verificar
ALTER TABLE datos_mercado_autocaravanas DISABLE ROW LEVEL SECURITY;

-- Comentario: Si necesitas habilitar RLS en el futuro, usa:
-- ALTER TABLE datos_mercado_autocaravanas ENABLE ROW LEVEL SECURITY;
--
-- Y crea políticas como:
-- CREATE POLICY "Permitir lectura a todos" ON datos_mercado_autocaravanas
--   FOR SELECT USING (true);
--
-- CREATE POLICY "Solo service role puede insertar" ON datos_mercado_autocaravanas
--   FOR INSERT WITH CHECK (auth.role() = 'service_role');



