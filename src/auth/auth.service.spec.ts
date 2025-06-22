import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UserSettings } from '../database/entities/user-settings.entity';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let userSettingsRepository: jest.Mocked<Repository<UserSettings>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserSettings),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    userSettingsRepository = module.get(getRepositoryToken(UserSettings));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return auth response', async () => {
      const registerDto: RegisterDto = { email: 'test@test.com', name: 'Test', password: 'password' };
      const hashedPassword = 'hashedPassword';
      const user = { id: '1', ...registerDto, password: hashedPassword } as User;
      const userSettings = { id: 's1', userId: '1' } as UserSettings;
      const token = 'jwt-token';

      userRepository.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      userRepository.create.mockReturnValue(user);
      userRepository.save.mockResolvedValue(user);
      userSettingsRepository.create.mockReturnValue(userSettings);
      userSettingsRepository.save.mockResolvedValue(userSettings);
      jwtService.sign.mockReturnValue(token);

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.accessToken).toBe(token);
    });

    it('should throw ConflictException if user exists', async () => {
        const registerDto: RegisterDto = { email: 'test@test.com', name: 'Test', password: 'password' };
        userRepository.findOne.mockResolvedValue({} as User);
        await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login a user and return auth response', async () => {
        const loginDto: LoginDto = { email: 'test@test.com', password: 'password' };
        const user = { id: '1', email: 'test@test.com', password: 'hashedPassword' } as User;
        const qb = { where: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(user) };
        userRepository.createQueryBuilder.mockReturnValue(qb as any);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
        jwtService.sign.mockReturnValue('jwt-token');

        const result = await service.login(loginDto);
        expect(result.user.email).toBe(loginDto.email);
        expect(result.accessToken).toBe('jwt-token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
        const loginDto: LoginDto = { email: 'test@test.com', password: 'wrongpassword' };
        const user = { id: '1', email: 'test@test.com', password: 'hashedPassword' } as User;
        const qb = { where: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(user) };
        userRepository.createQueryBuilder.mockReturnValue(qb as any);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
        
        await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 