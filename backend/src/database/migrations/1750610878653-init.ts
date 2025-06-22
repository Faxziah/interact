import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1750610878653 implements MigrationInterface {
    name = 'Init1750610878653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(255) NOT NULL,
                "name" character varying(255),
                "password_hash" character varying(255),
                "provider" character varying(50) NOT NULL DEFAULT 'credentials',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // Create user_settings table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_settings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid,
                "default_source_language" character varying(50) NOT NULL DEFAULT 'auto',
                "default_target_language" character varying(50) NOT NULL DEFAULT 'en',
                "default_translation_style" character varying(50) NOT NULL DEFAULT 'formal',
                "default_model" character varying(50) NOT NULL DEFAULT 'groq-llama3',
                "auto_save_translations" boolean NOT NULL DEFAULT true,
                "auto_detect_language" boolean NOT NULL DEFAULT true,
                "email_notifications" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "REL_986a2b6d3c05eb4091bb8066f7" UNIQUE ("user_id"),
                CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id")
            )
        `);

        // Create languages table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "languages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying(10) NOT NULL,
                "name" character varying(100) NOT NULL,
                "native_name" character varying(100) NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "sort_order" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_7397596cd241d3e85e8c14b774c" UNIQUE ("code"),
                CONSTRAINT "PK_b517f827ca496b29f4d549c631d" PRIMARY KEY ("id")
            )
        `);

        // Create translation_styles table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "translation_styles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "value" character varying(50) NOT NULL,
                "label" character varying(100) NOT NULL,
                "description" text,
                "is_active" boolean NOT NULL DEFAULT true,
                "sort_order" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_translation_styles_value" UNIQUE ("value"),
                CONSTRAINT "PK_translation_styles" PRIMARY KEY ("id")
            )
        `);

        // Create models table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "models" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "value" character varying(50) NOT NULL,
                "label" character varying(100) NOT NULL,
                "disabled" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_models_value" UNIQUE ("value"),
                CONSTRAINT "PK_models" PRIMARY KEY ("id")
            )
        `);

        // Create translations table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "translations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "original_text" text NOT NULL,
                "translated_text" text NOT NULL,
                "source_language" character varying(50) NOT NULL,
                "target_language" character varying(50) NOT NULL,
                "translation_style" character varying(50) NOT NULL DEFAULT 'formal',
                "ai_model_used" character varying(50) NOT NULL,
                "character_count" integer NOT NULL,
                "processing_time_ms" integer,
                "is_favorite" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_translations_id" PRIMARY KEY ("id")
            )
        `);

        // Add foreign keys
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "translations"
            ADD CONSTRAINT "FK_translations_user_id"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_translations_user_id_created_at" ON "translations" ("user_id", "created_at")`);
        await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users" ("email")`);

        // // Insert default languages
        await queryRunner.query(`
            INSERT INTO "languages" ("code", "name", "native_name", "sort_order") VALUES
            ('en', 'English', 'English', 1),
            ('es', 'Spanish', 'Español', 2),
            ('fr', 'French', 'Français', 3),
            ('de', 'German', 'Deutsch', 4),
            ('it', 'Italian', 'Italiano', 5),
            ('pt', 'Portuguese', 'Português', 6),
            ('ru', 'Russian', 'Русский', 7),
            ('ja', 'Japanese', '日本語', 8),
            ('zh', 'Chinese', '中文', 10),
            ('ar', 'Arabic', 'العربية', 11),
            ('hi', 'Hindi', 'हिन्दी', 12)
            ON CONFLICT (code) DO NOTHING
        `);

        // Insert default translation styles
        await queryRunner.query(`
            INSERT INTO "translation_styles" ("value", "label", "description", "sort_order") VALUES
            ('formal', 'Formal', 'Professional and formal tone', 1),
            ('casual', 'Casual', 'Conversational and informal tone', 2),
            ('technical', 'Technical', 'Technical and precise language', 3),
            ('creative', 'Creative', 'Creative and expressive style', 4)
            ON CONFLICT (value) DO NOTHING
        `);

        // Insert default models
        await queryRunner.query(`
            INSERT INTO "models" ("value", "label", "disabled") VALUES
            ('groq-llama3', 'Groq Llama3', false),
            ('openai-gpt-4', 'OpenAI GPT-4', true),
            ('openai-gpt-3.5', 'OpenAI GPT-3.5', true)
            ON CONFLICT (value) DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "translations"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "models"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "translation_styles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "languages"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_settings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
}
