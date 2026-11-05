-- ============================================================
-- Fuselage — 003: video metadata on reels
-- Run after 002. Safe to re-run (columns are only added if missing).
-- ============================================================

-- Filled in by the upload flow from the video file
alter table public.reels
  add column if not exists video_duration_seconds int,
  add column if not exists video_size_bytes bigint;

-- 002 limits which reel columns users may write; allow these two as well
grant insert (video_duration_seconds, video_size_bytes),
      update (video_duration_seconds, video_size_bytes)
  on public.reels to authenticated;
