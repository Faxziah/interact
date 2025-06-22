import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationsService } from './translations.service';
import { Translation } from '../database/entities/translation.entity';
import { Language } from '../database/entities/language.entity';
import { TranslationStyle } from '../database/entities/translation-style.entity';
import { AiService } from '../ai/ai.service';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { NotFoundException } from '@nestjs/common';

describe('TranslationsService', () => {
  let service: TranslationsService;
  let translationRepository: jest.Mocked<Repository<Translation>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationsService,
        {
          provide: getRepositoryToken(Translation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        { provide: getRepositoryToken(Language), useValue: {} },
        { provide: getRepositoryToken(TranslationStyle), useValue: {} },
        { provide: AiService, useValue: {} },
      ],
    }).compile();

    service = module.get<TranslationsService>(TranslationsService);
    translationRepository = module.get(getRepositoryToken(Translation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTranslation', () => {
    it('should create and return a translation', async () => {
      const dto: CreateTranslationDto = {
        originalText: 'Hello',
        translatedText: 'Hola',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        style: 'formal',
      };
      const userId = 'userId';
      const translation = new Translation();

      translationRepository.create.mockReturnValue(translation);
      translationRepository.save.mockResolvedValue(translation);

      const result = await service.createTranslation(dto, userId);

      expect(translationRepository.create).toHaveBeenCalledWith({
        userId,
        originalText: dto.originalText,
        translatedText: dto.translatedText,
        sourceLanguage: dto.sourceLanguage,
        targetLanguage: dto.targetLanguage,
        translationStyle: dto.style,
        aiModelUsed: 'openai-gpt-4',
        characterCount: dto.originalText.length,
      });
      expect(translationRepository.save).toHaveBeenCalledWith(translation);
      expect(result).toEqual(translation);
    });
  });

  describe('getUserTranslations', () => {
    // ... existing code ...
  });
});
