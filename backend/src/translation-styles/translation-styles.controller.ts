import { Controller, Get } from '@nestjs/common';
import { TranslationStylesService } from './translation-styles.service';
import { TranslationStyle } from '../database/entities/translation-style.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('translation-styles')
export class TranslationStylesController {
  constructor(private readonly translationStylesService: TranslationStylesService) {}

  @Public()
  @Get()
  findAll(): Promise<TranslationStyle[]> {
    return this.translationStylesService.findAll();
  }
} 