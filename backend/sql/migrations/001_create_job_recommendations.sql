-- ============================================================
-- Career Compass Hub - Database Migration
-- 001_create_job_recommendations.sql
--
-- Creates the job_recommendations table if it does not exist
-- and ensures the skills table has the expected columns.
--
-- Run this in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/<PROJECT_REF>/sql/new
-- ============================================================

-- ------------------------------------------------------------
-- 1. Create job_recommendations table (if not exists)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  match_percentage INTEGER NOT NULL DEFAULT 0,
  trust_score INTEGER NOT NULL DEFAULT 0,
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_job_recommendations_user_id
  ON public.job_recommendations (user_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_resume_id
  ON public.job_recommendations (resume_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_user_created
  ON public.job_recommendations (user_id, created_at DESC);

-- ------------------------------------------------------------
-- 2. Enable Row Level Security on job_recommendations
-- ------------------------------------------------------------
ALTER TABLE public.job_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own recommendations
DROP POLICY IF EXISTS "Users can view own recommendations"
  ON public.job_recommendations;
CREATE POLICY "Users can view own recommendations"
  ON public.job_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own recommendations
DROP POLICY IF EXISTS "Users can insert own recommendations"
  ON public.job_recommendations;
CREATE POLICY "Users can insert own recommendations"
  ON public.job_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recommendations
DROP POLICY IF EXISTS "Users can update own recommendations"
  ON public.job_recommendations;
CREATE POLICY "Users can update own recommendations"
  ON public.job_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own recommendations
DROP POLICY IF EXISTS "Users can delete own recommendations"
  ON public.job_recommendations;
CREATE POLICY "Users can delete own recommendations"
  ON public.job_recommendations
  FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. Ensure the skills table has the expected columns
--    (name + category). If your skills table already uses a
--    different skill column (skill / skill_name), uncomment
--    the alternative ALTER statements instead.
-- ------------------------------------------------------------
-- Add the standard columns if they are missing.
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS category TEXT;

-- Optional: If your skills table uses "skill" or "skill_name",
-- uncomment one of these to populate the standard "name" column:
-- UPDATE public.skills SET name = skill WHERE name IS NULL AND skill IS NOT NULL;
-- UPDATE public.skills SET name = skill_name WHERE name IS NULL AND skill_name IS NOT NULL;

-- ------------------------------------------------------------
-- 4. Grant access for the authenticated + service roles
-- ------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_recommendations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_recommendations TO service_role;
GRANT USAGE ON SEQUENCE job_recommendations_id_seq TO authenticated, service_role;

-- ============================================================
-- Optional verification queries (run after executing above):
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'job_recommendations' ORDER BY ordinal_position;
-- ============================================================