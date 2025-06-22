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
  @IsBoolean()
  autoSaveTranslations?: boolean;
} 