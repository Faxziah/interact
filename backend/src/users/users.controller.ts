import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettings } from '../database/entities/user-settings.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('settings')
  async getUserSettings(@CurrentUser() user: { userId: string }): Promise<UserSettings> {
    return this.usersService.getUserSettings(user.userId);
  }

  @Put('settings')
  async updateUserSettings(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateUserSettingsDto,
  ): Promise<UserSettings> {
    return this.usersService.updateUserSettings(user.userId, dto);
  }
} 