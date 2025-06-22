import { Controller, Get } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { Language } from '../database/entities/language.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Public()
  @Get()
  findAll(): Promise<Language[]> {
    return this.languagesService.findAll();
  }
} 