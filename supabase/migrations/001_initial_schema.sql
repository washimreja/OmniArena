-- OmniArena Initial Schema
-- Phase 8 — Apply with: supabase db push

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  avatar_url      TEXT,
  username        TEXT UNIQUE,
  plan            TEXT NOT NULL DEFAULT 'free',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Models
CREATE TABLE public.ai_models (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider        TEXT NOT NULL,
  model_key       TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  description     TEXT,
  model_type      TEXT NOT NULL DEFAULT 'text',
  context_window  INTEGER,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  icon_url        TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversations
CREATE TABLE public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT 'New Arena',
  is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Messages
CREATE TABLE public.messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role                TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content             TEXT NOT NULL,
  attachments         JSONB DEFAULT '[]'::JSONB,
  selected_model_ids  UUID[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);

-- AI Responses
CREATE TABLE public.ai_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id        UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  model_id          UUID NOT NULL REFERENCES public.ai_models(id),
  content           TEXT,
  status            TEXT NOT NULL DEFAULT 'waiting'
                      CHECK (status IN ('waiting','generating','completed','failed','retrying')),
  error_message     TEXT,
  latency_ms        INTEGER,
  token_count       INTEGER,
  metadata          JSONB DEFAULT '{}'::JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

-- Response Preferences
CREATE TABLE public.response_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_id       UUID NOT NULL REFERENCES public.ai_responses(id) ON DELETE CASCADE,
  preference_type   TEXT NOT NULL CHECK (preference_type IN ('preferred','liked','disliked')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, response_id)
);

-- Judge Results
CREATE TABLE public.judge_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id       UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id            UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  judge_model_id        UUID REFERENCES public.ai_models(id),
  winning_response_id   UUID REFERENCES public.ai_responses(id),
  reasoning             TEXT,
  rankings              JSONB DEFAULT '[]'::JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cross Examinations
CREATE TABLE public.cross_examinations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id        UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  examiner_model_id UUID NOT NULL REFERENCES public.ai_models(id),
  target_response_id UUID NOT NULL REFERENCES public.ai_responses(id),
  critique          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "conversations_own" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "messages_own" ON public.messages FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.conversations WHERE id = messages.conversation_id)
);
CREATE POLICY "ai_responses_own" ON public.ai_responses FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.conversations WHERE id = ai_responses.conversation_id)
);
CREATE POLICY "preferences_own" ON public.response_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "models_public_read" ON public.ai_models FOR SELECT USING (TRUE);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
