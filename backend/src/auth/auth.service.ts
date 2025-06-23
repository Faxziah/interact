import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

import { User, UserSettings } from '../database/entities';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, name, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      email,
      name,
      passwordHash: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const userSettings = this.userSettingsRepository.create({
      userId: savedUser.id,
    });
    await this.userSettingsRepository.save(userSettings);

    return this.generateAuthResponse(savedUser);
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.passwordHash')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  /**
   * Validate user for Passport strategy
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.passwordHash')
      .getOne();

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  /**
   * Find user by ID (for JWT strategy)
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  /**
   * Forgot Password
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.save(user);

    // Send email
    const resetUrl = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/auth/reset-password?token=${resetToken}`;
    
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'reset-password',
      context: {
        name: user.name,
        url: resetUrl,
      },
    });
  }

  /**
   * Reset Password
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<AuthResponse> {
    const { token, password } = resetPasswordDto;

    const hashedToken = createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Password reset token is invalid or has expired.',
      );
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return this.generateAuthResponse(user);
  }

  public generateAuthResponse(user: User): AuthResponse {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    };
  }
}