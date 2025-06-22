import { Test, TestingModule } from '@nestjs/testing';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';
import { CreateTranslationDto } from './dto/create-translation.dto';

describe('TranslationsController', () => {
  let controller: TranslationsController;
  let service: TranslationsService;

  const mockTranslationsService = {
    getLanguages: jest.fn(),
    getTranslationStyles: jest.fn(),
    createTranslation: jest.fn(),
    getUserTranslations: jest.fn(),
    deleteTranslation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranslationsController],
      providers: [
        {
          provide: TranslationsService,
          useValue: mockTranslationsService,
        },
      ],
    }).compile();

    controller = module.get<TranslationsController>(TranslationsController);
    service = module.get<TranslationsService>(TranslationsService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLanguages', () => {
    it('should return available languages', async () => {
      const mockLanguages = [
        { id: '1', code: 'en', name: 'English', nativeName: 'English' },
        { id: '2', code: 'es', name: 'Spanish', nativeName: 'Español' },
      ];

      mockTranslationsService.getLanguages.mockResolvedValue(mockLanguages);

      const result = await controller.getLanguages();

      expect(result).toBe(mockLanguages);
      expect(service.getLanguages).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTranslationStyles', () => {
    it('should return available translation styles', async () => {
      const mockStyles = [
        { id: '1', value: 'formal', label: 'Formal', description: 'Professional tone' },
        { id: '2', value: 'casual', label: 'Casual', description: 'Informal tone' },
      ];

      mockTranslationsService.getTranslationStyles.mockResolvedValue(mockStyles);

      const result = await controller.getTranslationStyles();

      expect(result).toBe(mockStyles);
      expect(service.getTranslationStyles).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTranslation', () => {
    it('should create a new translation', async () => {
      const createTranslationDto: CreateTranslationDto = {
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        style: 'formal',
      };

      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockTranslation = {
        id: 'translation-123',
        originalText: 'Hello world',
        translatedText: 'Hola mundo',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        translationStyle: 'formal',
      };

      mockTranslationsService.createTranslation.mockResolvedValue(mockTranslation);

      const result = await controller.createTranslation(createTranslationDto, mockRequest);

      expect(result).toBe(mockTranslation);
      expect(service.createTranslation).toHaveBeenCalledWith(
        createTranslationDto,
        'user-123',
      );
      expect(service.createTranslation).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserTranslations', () => {
    it('should return user translations', async () => {
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockTranslations = {
        translations: [
          {
            id: 'translation-1',
            originalText: 'Hello',
            translatedText: 'Hola',
            createdAt: new Date(),
          },
        ],
      };

      mockTranslationsService.getUserTranslations.mockResolvedValue(mockTranslations);

      const result = await controller.getUserTranslations(mockRequest);

      expect(result).toBe(mockTranslations);
      expect(service.getUserTranslations).toHaveBeenCalledWith('user-123', undefined);
      expect(service.getUserTranslations).toHaveBeenCalledTimes(1);
    });

    it('should return user translations with limit', async () => {
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockTranslations = {
        translations: [],
      };

      mockTranslationsService.getUserTranslations.mockResolvedValue(mockTranslations);

      const result = await controller.getUserTranslations(mockRequest, 5);

      expect(result).toBe(mockTranslations);
      expect(service.getUserTranslations).toHaveBeenCalledWith('user-123', 5);
      expect(service.getUserTranslations).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRecentTranslations', () => {
    it('should return recent translations', async () => {
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockTranslations = {
        translations: [
          {
            id: 'translation-1',
            originalText: 'Hello',
            translatedText: 'Hola',
            createdAt: new Date(),
          },
        ],
      };

      mockTranslationsService.getUserTranslations.mockResolvedValue(mockTranslations);

      const result = await controller.getRecentTranslations(mockRequest);

      expect(result).toBe(mockTranslations);
      expect(service.getUserTranslations).toHaveBeenCalledWith('user-123', 5);
      expect(service.getUserTranslations).toHaveBeenCalledTimes(1);
    });
  });
}); 