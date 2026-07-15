-- ============================================================================
-- Migration: Remove Customer Status
-- Run this in your Supabase SQL Editor to clean up the previous changes.
-- ============================================================================

-- 1. Remove the status column from customer_profiles
ALTER TABLE public.customer_profiles 
DROP COLUMN IF EXISTS status;

-- 2. Drop the unused enum type
DROP TYPE IF EXISTS customer_status_enum;
