import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Translation } from '../database/entities/translation.entity';
import { Language } from '../database/entities/language.entity';
import { TranslationStyle } from '../database/entities/translation-style.entity';
import { AiService } from '../ai/ai.service';
import { CreateTranslationDto } from './dto/create-translation.dto';

@Injectable()
export class TranslationsService {
  constructor(
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(TranslationStyle)
    private readonly translationStyleRepository: Repository<TranslationStyle>,
    private readonly aiService: AiService,
  ) {}

  async getLanguages(): Promise<Language[]> {
    return this.languageRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
      select: ['id', 'code', 'name', 'nativeName'],
    });
  }

  async getTranslationStyles(): Promise<TranslationStyle[]> {
    return this.translationStyleRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', label: 'ASC' },
      select: ['id', 'value', 'label', 'description'],
    });
  }

  async createTranslation(
    createTranslationDto: CreateTranslationDto,
    userId: string,
  ): Promise<Translation> {
    const translation = this.translationRepository.create({
      userId,
      originalText: createTranslationDto.originalText,
      translatedText: createTranslationDto.translatedText,
      sourceLanguage: createTranslationDto.sourceLanguage,
      targetLanguage: createTranslationDto.targetLanguage,
      translationStyle: createTranslationDto.style,
      aiModelUsed: createTranslationDto.aiModelUsed || 'groq-llama3',
      characterCount: createTranslationDto.originalText.length,
    });

    return this.translationRepository.save(translation);
  }

  async getUserTranslations(userId: string, limit?: number): Promise<{ translations: Translation[] }> {
    const queryBuilder = this.translationRepository
      .createQueryBuilder('translation')
      .where('translation.userId = :userId', { userId })
      .orderBy('translation.createdAt', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    const translations = await queryBuilder.getMany();
    return { translations };
  }

  async deleteTranslation(userId: string, id: string): Promise<void> {
    const result = await this.translationRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Translation with ID "${id}" not found`);
    }
  }
} 