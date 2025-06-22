import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationStyle } from '../database/entities/translation-style.entity';

@Injectable()
export class TranslationStylesService {
  constructor(
    @InjectRepository(TranslationStyle)
    private readonly translationStyleRepository: Repository<TranslationStyle>,
  ) {}

  findAll(): Promise<TranslationStyle[]> {
    return this.translationStyleRepository.find({ order: { sortOrder: 'ASC' } });
  }
} 