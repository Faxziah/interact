import { Test, TestingModule } from '@nestjs/testing';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { Translation } from '../database/entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('TranslationsController', () => {
  let controller: TranslationsController;
  let service: TranslationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranslationsController],
      providers: [
        {
          provide: TranslationsService,
          useValue: {
            createTranslation: jest.fn(),
            getUserTranslations: jest.fn(),
            getLanguages: jest.fn(),
            getTranslationStyles: jest.fn(),
            deleteTranslation: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<TranslationsController>(TranslationsController);
    service = module.get<TranslationsService>(TranslationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTranslation', () => {
    it('should create a translation', async () => {
      const dto: CreateTranslationDto = {
        originalText: 'Hello',
        translatedText: 'Hola',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        style: 'formal',
      };
      const req = { user: { id: 'userId' } };
      const expectedResult = new Translation();
      jest.spyOn(service, 'createTranslation').mockResolvedValue(expectedResult);
      expect(await controller.createTranslation(dto, req)).toBe(expectedResult);
      expect(service.createTranslation).toHaveBeenCalledWith(dto, req.user.id);
    });
  });

  describe('getUserTranslations', () => {
    it('should return user translations', async () => {
      const userId = '123';
      const translations = [new Translation(), new Translation()];
      jest.spyOn(service, 'getUserTranslations').mockResolvedValue({ translations });

      const result = await controller.getUserTranslations({ user: { id: userId } }, 10);
      expect(result).toEqual({ translations });
      expect(service.getUserTranslations).toHaveBeenCalledWith(userId, 10);
    });
  });

  describe('getRecentTranslations', () => {
    it('should return recent translations', async () => {
      const userId = '123';
      const translations = [new Translation(), new Translation()];
      jest.spyOn(service, 'getUserTranslations').mockResolvedValue({ translations });

      const result = await controller.getRecentTranslations({ user: { id: userId } });
      expect(result).toEqual({ translations });
      expect(service.getUserTranslations).toHaveBeenCalledWith(userId, 5);
    });
  });
});
