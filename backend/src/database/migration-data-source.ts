import { DataSource } from 'typeorm';
import { User, Translation, UserSettings, Language, TranslationStyle } from './entities';

export const MigrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || '123456',
  database: process.env.POSTGRES_DB || 'interact',
  entities: [User, Translation, UserSettings, Language, TranslationStyle],
  migrations: ['src/database/migrations/**/*.ts'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: true,
}); 