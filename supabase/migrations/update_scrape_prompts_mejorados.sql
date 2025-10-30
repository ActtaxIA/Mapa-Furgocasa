-- Actualizar configuración de prompts para scrape_services con prompts mejorados
-- Este script actualiza los prompts del agente de IA para mejor detección de servicios

UPDATE ia_config
SET config_value = jsonb_set(
  config_value,
  '{prompts}',
  '[
    {
      "id": "sys-1",
      "role": "system",
      "content": "Eres un auditor experto en áreas de autocaravanas y campings.\n\nINSTRUCCIONES ESTRICTAS:\n- Solo confirmas un servicio si hay EVIDENCIA EXPLÍCITA y CLARA\n- No asumas servicios por el tipo de lugar\n- Si hay duda o información ambigua, marca como false\n- Responde ÚNICAMENTE con JSON válido, sin texto adicional\n\nSERVICIOS A DETECTAR:\n- agua: Suministro de agua potable\n- electricidad: Conexión eléctrica o enchufes\n- vaciado_aguas_negras: Vaciado de aguas negras/WC químico\n- vaciado_aguas_grises: Vaciado de aguas grises\n- wifi: Conexión WiFi/Internet\n- duchas: Duchas disponibles\n- wc: Baños/WC\n- lavanderia: Lavandería o lavadoras\n- restaurante: Restaurante, bar o cafetería\n- supermercado: Supermercado o tienda\n- zona_mascotas: Área específica para mascotas",
      "order": 1,
      "required": true
    },
    {
      "id": "user-1",
      "role": "user",
      "content": "Analiza la siguiente información sobre \"{{area_nombre}}\" en {{area_ciudad}}, {{area_provincia}}:\n\n{{texto_analizar}}\n\nResponde con JSON con esta estructura exacta:\n{\n  \"agua\": true/false,\n  \"electricidad\": true/false,\n  \"vaciado_aguas_negras\": true/false,\n  \"vaciado_aguas_grises\": true/false,\n  \"wifi\": true/false,\n  \"duchas\": true/false,\n  \"wc\": true/false,\n  \"lavanderia\": true/false,\n  \"restaurante\": true/false,\n  \"supermercado\": true/false,\n  \"zona_mascotas\": true/false\n}",
      "order": 2,
      "required": true
    }
  ]'::jsonb
)
WHERE config_key = 'scrape_services';

-- Actualizar también max_tokens para los nuevos prompts más detallados
UPDATE ia_config
SET config_value = jsonb_set(
  config_value,
  '{max_tokens}',
  '400'
)
WHERE config_key = 'scrape_services';

-- Verificar la actualización
SELECT 
  config_key,
  config_value->'model' as model,
  config_value->'temperature' as temperature,
  config_value->'max_tokens' as max_tokens,
  jsonb_array_length(config_value->'prompts') as num_prompts
FROM ia_config
WHERE config_key = 'scrape_services';

