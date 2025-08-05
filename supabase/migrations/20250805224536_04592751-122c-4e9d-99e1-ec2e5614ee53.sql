-- Add break time fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN break1_start time without time zone DEFAULT '10:00:00',
ADD COLUMN break1_end time without time zone DEFAULT '10:15:00',
ADD COLUMN break2_start time without time zone DEFAULT '15:00:00',
ADD COLUMN break2_end time without time zone DEFAULT '15:15:00';