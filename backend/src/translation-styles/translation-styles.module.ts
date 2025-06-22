import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationStyle } from '../database/entities/translation-style.entity';
import { TranslationStylesService } from './translation-styles.service';
import { TranslationStylesController } from './translation-styles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TranslationStyle])],
  providers: [TranslationStylesService],
  controllers: [TranslationStylesController],
})
export class TranslationStylesModule {} 