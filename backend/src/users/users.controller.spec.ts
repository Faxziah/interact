import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserSettings } from '../database/entities/user-settings.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = { userId: '1', email: 'test@example.com' };
  const mockUserSettings = new UserSettings({ userId: mockUser.userId });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUserSettings: jest.fn().mockResolvedValue(mockUserSettings),
            updateUserSettings: jest.fn().mockResolvedValue(mockUserSettings),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserSettings', () => {
    it('should call service to get user settings', async () => {
      await controller.getUserSettings(mockUser);
      expect(service.getUserSettings).toHaveBeenCalledWith(mockUser.userId);
    });
  });

  describe('updateUserSettings', () => {
    it('should call service to update user settings', async () => {
      const dto = { defaultTargetLanguage: 'es' };
      await controller.updateUserSettings(mockUser, dto);
      expect(service.updateUserSettings).toHaveBeenCalledWith(mockUser.userId, dto);
    });
  });
}); 