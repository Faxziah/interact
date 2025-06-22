-- AI Translator Database Initialization Script
-- This script will be automatically executed when PostgreSQL container starts

-- Create database if it doesn't exist (handled by Docker environment variables)

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Tables will be automatically created by TypeORM
-- This script is mainly for extensions and initial data if needed

-- Create indexes for better performance (will be added by TypeORM migrations)
-- These are examples of what TypeORM will create:

-- Example of what TypeORM creates:
-- CREATE TABLE users (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     email VARCHAR UNIQUE NOT NULL,
--     name VARCHAR NOT NULL,
--     password_hash VARCHAR NOT NULL,
--     provider VARCHAR DEFAULT 'local',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE translations (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     original_text TEXT NOT NULL,
--     translated_text TEXT NOT NULL,
--     source_language VARCHAR(10) NOT NULL,
--     target_language VARCHAR(10) NOT NULL,
--     translation_style VARCHAR NOT NULL DEFAULT 'formal',
--     ai_model_used VARCHAR(50) NOT NULL,
--     character_count INTEGER NOT NULL,
--     processing_time_ms INTEGER NOT NULL,
--     is_favorite BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE user_settings (
--     user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
--     default_source_language VARCHAR(10) DEFAULT 'auto',
--     default_target_language VARCHAR(10) DEFAULT 'en',
--     default_translation_style VARCHAR DEFAULT 'formal',
--     auto_save_translations BOOLEAN DEFAULT TRUE,
--     auto_detect_language BOOLEAN DEFAULT TRUE,
--     email_notifications BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Create indexes for better query performance
-- CREATE INDEX idx_translations_user_id_created_at ON translations(user_id, created_at DESC);
-- CREATE INDEX idx_translations_user_id ON translations(user_id);
-- CREATE INDEX idx_users_email ON users(email);

-- Insert sample data for development (optional)
-- This will only run if no users exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Tables don't exist yet, they will be created by TypeORM
        RAISE NOTICE 'Database tables will be created by TypeORM on first application start';
    END IF;
END $$; 