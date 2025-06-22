import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';
import { Translation } from '../database/entities/translation.entity';
import { Language } from '../database/entities/language.entity';
import { TranslationStyle } from '../database/entities/translation-style.entity';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from 'src/users/users.service';
import { UserSettings } from 'src/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Translation, Language, TranslationStyle, UserSettings]), AiModule, UsersModule],
  controllers: [TranslationsController],
  providers: [TranslationsService, UsersService],
})
export class TranslationsModule {} 