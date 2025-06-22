import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTranslationDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  targetLanguage: string;

  @IsOptional()
  @IsString()
  sourceLanguage?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  aiProvider?: 'openai' | 'groq';
} 