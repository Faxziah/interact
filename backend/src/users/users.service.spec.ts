import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UserSettings } from '../database/entities/user-settings.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let userSettingsRepository: Repository<UserSettings>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserSettings),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userSettingsRepository = module.get<Repository<UserSettings>>(
      getRepositoryToken(UserSettings),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserSettings', () => {
    it('should return user settings if they exist', async () => {
      const settings = new UserSettings({ userId: mockUser.id });
      jest.spyOn(userSettingsRepository, 'findOne').mockResolvedValue(settings);
      expect(await service.getUserSettings(mockUser.id)).toEqual(settings);
    });

    it('should return default settings if they do not exist', async () => {
      jest.spyOn(userSettingsRepository, 'findOne').mockResolvedValue(null);
      const newSettings = new UserSettings({ userId: mockUser.id });
      jest.spyOn(userSettingsRepository, 'create').mockReturnValue(newSettings);
      jest.spyOn(userSettingsRepository, 'save').mockResolvedValue(newSettings);
      
      const result = await service.getUserSettings(mockUser.id);
      expect(result.userId).toEqual(mockUser.id);
      expect(userSettingsRepository.findOne).toHaveBeenCalledWith({ where: { userId: mockUser.id } });
    });
  });

  describe('updateUserSettings', () => {
    it('should update and return user settings', async () => {
      const dto = { defaultSourceLanguage: 'en' };
      const existingSettings = new UserSettings({ userId: mockUser.id });
      
      jest.spyOn(service, 'getUserSettings').mockResolvedValue(existingSettings);
      jest.spyOn(userSettingsRepository, 'save').mockResolvedValue({ ...existingSettings, ...dto });

      const result = await service.updateUserSettings(mockUser.id, dto);
      expect(service.getUserSettings).toHaveBeenCalledWith(mockUser.id);
      expect(userSettingsRepository.save).toHaveBeenCalledWith({ ...existingSettings, ...dto });
      expect(result.defaultSourceLanguage).toEqual('en');
    });
  });
}); 