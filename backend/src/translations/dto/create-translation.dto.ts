import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTranslationDto {
  @IsString()
  @IsNotEmpty()
  originalText: string;

  @IsString()
  @IsNotEmpty()
  translatedText: string;

  @IsString()
  @IsNotEmpty()
  targetLanguage: string;

  @IsString()
  @IsNotEmpty()
  sourceLanguage: string;

  @IsString()
  @IsNotEmpty()
  style: string;

  @IsOptional()
  @IsString()
  aiProvider?: 'openai' | 'groq';
} 