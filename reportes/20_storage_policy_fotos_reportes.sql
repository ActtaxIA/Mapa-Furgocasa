-- ===================================================================
-- STORAGE POLICIES: Fotos de Reportes de Accidentes
-- ===================================================================
-- Políticas para permitir subida pública de fotos en reportes
-- ===================================================================

-- Política para permitir subida de fotos de reportes (público)
-- Los testigos pueden subir fotos sin autenticación
CREATE POLICY "Permitir subida pública de fotos de reportes"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'vehiculos' 
  AND (storage.foldername(name))[1] = 'reportes'
);

-- Política para lectura pública de fotos de reportes
-- Necesario para que el propietario pueda ver las fotos sin problemas
CREATE POLICY "Permitir lectura pública de fotos de reportes"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'vehiculos'
  AND (storage.foldername(name))[1] = 'reportes'
);

-- Comentario
COMMENT ON POLICY "Permitir subida pública de fotos de reportes" ON storage.objects IS 
'Permite a testigos anónimos subir fotos de accidentes en la carpeta reportes/';

COMMENT ON POLICY "Permitir lectura pública de fotos de reportes" ON storage.objects IS 
'Permite lectura pública de fotos de reportes para que los propietarios puedan verlas';

