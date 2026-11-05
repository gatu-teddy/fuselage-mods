-- Add video metadata columns to reels
alter table public.reels
  add column video_duration_seconds int,
  add column video_size_bytes bigint;
