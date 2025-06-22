import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { User } from '../database/entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    translations: [],
    settings: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  };

  const authResponse = {
    user: { id: mockUser.id, email: mockUser.email, name: mockUser.name },
    accessToken: 'test-token',
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(authResponse),
            login: jest.fn().mockResolvedValue(authResponse),
            getProfile: jest.fn().mockResolvedValue({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                createdAt: mockUser.createdAt
            }),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
    .overrideGuard(LocalAuthGuard).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const registerDto: RegisterDto = { email: 'test@test.com', name: 'Test', password: 'password' };
      expect(await controller.register(registerDto)).toBe(authResponse);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = { email: 'test@test.com', password: 'password' };
      expect(await controller.login(loginDto, { user: mockUser })).toBe(authResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('should get a user profile', async () => {
      const req = { user: mockUser };
      await controller.getProfile(req);
      expect(service.getProfile).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
