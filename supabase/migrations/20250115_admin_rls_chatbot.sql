-- =====================================================
-- NOTA: No existe tabla chatbot_mensajes
-- =====================================================
-- Los mensajes del chatbot se registran en user_interactions
-- con event_type = 'chatbot_message'
-- No se necesitan políticas adicionales, user_interactions ya tiene RLS

-- Este archivo se mantiene como documentación
-- El error 403 en analytics se debe a que la tabla no existe
-- La página de analytics debe actualizarse para usar user_interactions
