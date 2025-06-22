import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationsService } from './translations.service';
import { Translation } from '../database/entities/translation.entity';
import { Language } from '../database/entities/language.entity';
import { TranslationStyle } from '../database/entities/translation-style.entity';
import { AiService } from '../ai/ai.service';
import { CreateTranslationDto } from './dto/create-translation.dto';

describe('TranslationsService', () => {
  let service: TranslationsService;
  let translationRepository: Repository<Translation>;
  let languageRepository: Repository<Language>;
  let translationStyleRepository: Repository<TranslationStyle>;
  let aiService: AiService;

  const mockTranslationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
  };

  const mockLanguageRepository = {
    find: jest.fn(),
  };

  const mockTranslationStyleRepository = {
    find: jest.fn(),
  };

  const mockAiService = {
    translate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationsService,
        {
          provide: getRepositoryToken(Translation),
          useValue: mockTranslationRepository,
        },
        {
          provide: getRepositoryToken(Language),
          useValue: mockLanguageRepository,
        },
        {
          provide: getRepositoryToken(TranslationStyle),
          useValue: mockTranslationStyleRepository,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    service = module.get<TranslationsService>(TranslationsService);
    translationRepository = module.get<Repository<Translation>>(
      getRepositoryToken(Translation),
    );
    languageRepository = module.get<Repository<Language>>(
      getRepositoryToken(Language),
    );
    translationStyleRepository = module.get<Repository<TranslationStyle>>(
      getRepositoryToken(TranslationStyle),
    );
    aiService = module.get<AiService>(AiService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLanguages', () => {
    it('should return active languages', async () => {
      const mockLanguages = [
        {
          id: '1',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          isActive: true,
        },
      ];

      mockLanguageRepository.find.mockResolvedValue(mockLanguages);

      const result = await service.getLanguages();

      expect(result).toEqual(mockLanguages);
      expect(mockLanguageRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { sortOrder: 'ASC', name: 'ASC' },
        select: ['id', 'code', 'name', 'nativeName'],
      });
    });
  });

  describe('getTranslationStyles', () => {
    it('should return active translation styles', async () => {
      const mockStyles = [
        {
          id: '1',
          value: 'formal',
          label: 'Formal',
          description: 'Professional tone',
          isActive: true,
        },
      ];

      mockTranslationStyleRepository.find.mockResolvedValue(mockStyles);

      const result = await service.getTranslationStyles();

      expect(result).toEqual(mockStyles);
      expect(mockTranslationStyleRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { sortOrder: 'ASC', label: 'ASC' },
        select: ['id', 'value', 'label', 'description'],
      });
    });
  });

  describe('createTranslation', () => {
    it('should create a translation successfully', async () => {
      const createTranslationDto: CreateTranslationDto = {
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        style: 'formal',
      };

      const mockTranslatedText = 'Hola mundo';
      const mockTranslation = {
        id: '1',
        originalText: 'Hello world',
        translatedText: mockTranslatedText,
        sourceLanguage: 'en',
        targetLanguage: 'es',
      };

      mockAiService.translate.mockResolvedValue(mockTranslatedText);
      mockTranslationRepository.create.mockReturnValue(mockTranslation);
      mockTranslationRepository.save.mockResolvedValue(mockTranslation);

      const result = await service.createTranslation(createTranslationDto, 'user-id');

      expect(result).toEqual(mockTranslation);
      expect(mockAiService.translate).toHaveBeenCalledWith({
        text: createTranslationDto.text,
        sourceLanguage: createTranslationDto.sourceLanguage,
        targetLanguage: createTranslationDto.targetLanguage,
        style: createTranslationDto.style,
      });
      expect(mockTranslationRepository.create).toHaveBeenCalled();
      expect(mockTranslationRepository.save).toHaveBeenCalledWith(mockTranslation);
    });

    it('should handle auto-detect source language', async () => {
      const createTranslationDto: CreateTranslationDto = {
        text: 'Hello world',
        targetLanguage: 'es',
      };

      const mockTranslatedText = 'Hola mundo';
      mockAiService.translate.mockResolvedValue(mockTranslatedText);
      mockTranslationRepository.create.mockReturnValue({});
      mockTranslationRepository.save.mockResolvedValue({});

      await service.createTranslation(createTranslationDto, 'user-id');

      expect(mockAiService.translate).toHaveBeenCalledWith({
        text: createTranslationDto.text,
        sourceLanguage: 'auto',
        targetLanguage: createTranslationDto.targetLanguage,
        style: 'formal',
      });
    });
  });

  describe('getUserTranslations', () => {
    it('should return user translations', async () => {
      const mockTranslations = [
        {
          id: '1',
          originalText: 'Hello',
          translatedText: 'Hola',
          createdAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTranslations),
      };

      mockTranslationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUserTranslations('user-id');

      expect(result).toEqual({ translations: mockTranslations });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'translation.userId = :userId',
        { userId: 'user-id' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'translation.createdAt',
        'DESC',
      );
    });

    it('should apply limit when provided', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockTranslationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getUserTranslations('user-id', 5);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('deleteTranslation', () => {
    it('should delete translation successfully', async () => {
      mockTranslationRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteTranslation('user-id', 'translation-id');

      expect(mockTranslationRepository.delete).toHaveBeenCalledWith({
        id: 'translation-id',
        userId: 'user-id',
      });
    });

    it('should throw NotFoundException if translation not found', async () => {
      mockTranslationRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(
        service.deleteTranslation('user-id', 'translation-id'),
      ).rejects.toThrow('Translation with ID "translation-id" not found');
    });
  });
}); 