import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from '../database/entities/user-settings.entity';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
  ) {}

  async getUserSettings(userId: string): Promise<UserSettings> {
    const settings = await this.userSettingsRepository.findOne({ where: { userId } });

    if (!settings) {
      const defaultSettings = this.userSettingsRepository.create({ userId });
      return this.userSettingsRepository.save(defaultSettings);
    }
    
    return settings;
  }

  async updateUserSettings(userId: string, dto: UpdateUserSettingsDto): Promise<UserSettings> {
    const settings = await this.getUserSettings(userId);
    Object.assign(settings, dto);
    return this.userSettingsRepository.save(settings);
  }
} 