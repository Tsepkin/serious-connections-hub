-- Drop bot_profiles and dependent tables since bots will be in profiles table
DROP TABLE IF EXISTS bot_response_queue CASCADE;
DROP TABLE IF EXISTS bot_profiles CASCADE;