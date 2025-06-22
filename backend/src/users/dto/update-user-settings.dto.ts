import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  defaultSourceLanguage?: string;

  @IsOptional()
  @IsString()
  defaultTargetLanguage?: string;

  @IsOptional()
  @IsString()
  defaultTranslationStyle?: string;

  @IsOptional()
  @IsString()
  defaultModel?: string;

  @IsOptional()
  @IsBoolean()
  autoSaveTranslations?: boolean;

  @IsOptional()
  @IsBoolean()
  autoDetectLanguage?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;
} 