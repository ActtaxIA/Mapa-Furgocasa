-- Agregar configuración del agente de Valoración de Vehículos IA
-- Este agente usa GPT-4 + SearchAPI (opcional) para valorar vehículos

INSERT INTO ia_config (config_key, config_value, descripcion)
VALUES (
  'valoracion_vehiculos',
  '{
    "modelo": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2500,
    "prompts": [
      {
        "role": "system",
        "content": "Eres un experto tasador de autocaravanas y campers con 20 años de experiencia en el mercado español de segunda mano.",
        "order": 1
      },
      {
        "role": "user",
        "content": "Tu tarea es generar un INFORME PROFESIONAL de valoración siguiendo ESTRICTAMENTE esta estructura:\n\n1. INTRODUCCIÓN (50-80 palabras)\n2. PRECIO DE NUEVA PARA PARTICULAR (60-100 palabras)\n3. DEPRECIACIÓN POR TIEMPO Y USO (100-150 palabras)\n4. VALOR DE LOS EXTRAS (40-60 palabras)\n5. COMPARACIÓN CON EL MERCADO (100-150 palabras)\n6. PRECIO RECOMENDADO (80-120 palabras) - Presenta 3 cifras: Precio de salida, Precio objetivo, Precio mínimo\n7. CONCLUSIÓN (40-60 palabras)\n\nExtensión total: 400-700 palabras\nEstilo: Profesional, objetivo, claro\nFormato: Markdown con encabezados ##\nNO inventes datos, NO uses JSON ni tablas",
        "order": 2
      }
    ]
  }'::jsonb,
  'Configuración del agente de valoración de vehículos con IA (GPT-4 + SearchAPI opcional)'
)
ON CONFLICT (config_key) 
DO UPDATE SET
  config_value = EXCLUDED.config_value,
  descripcion = EXCLUDED.descripcion,
  updated_at = NOW();

