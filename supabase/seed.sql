-- OmniArena Seed Data
INSERT INTO public.ai_models (provider, model_key, display_name, description, model_type, context_window, is_active, is_featured, sort_order)
VALUES
  ('openai',    'gpt-4o',             'GPT-4o',              'Most capable OpenAI model',        'multimodal', 128000,  true, true,  1),
  ('openai',    'gpt-4o-mini',        'GPT-4o Mini',         'Fast and affordable OpenAI model', 'text',       128000,  true, false, 2),
  ('anthropic', 'claude-3-5-sonnet',  'Claude 3.5 Sonnet',   'Anthropic flagship model',         'multimodal', 200000,  true, true,  3),
  ('anthropic', 'claude-3-haiku',     'Claude 3 Haiku',      'Fast Anthropic model',             'text',       200000,  true, false, 4),
  ('google',    'gemini-1-5-pro',     'Gemini 1.5 Pro',      'Google advanced model',            'multimodal', 1000000, true, true,  5),
  ('google',    'gemini-flash',       'Gemini 1.5 Flash',    'Speed-optimized Google model',     'text',       1000000, true, false, 6),
  ('grok',      'grok-2',             'Grok-2',              'xAI flagship model',               'text',       131072,  true, true,  7);
