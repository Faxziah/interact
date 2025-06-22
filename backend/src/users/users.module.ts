import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSettings } from '../database/entities/user-settings.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserSettings]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {} 