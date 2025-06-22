import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import OpenAI from 'openai';

interface TranslateDto {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  style: string;
}

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly groq: Groq;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async translate(dto: TranslateDto, provider: 'openai' | 'groq' = 'openai'): Promise<string> {
    const { text, sourceLanguage, targetLanguage, style } = dto;
    
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage} in a ${style} style: "${text}"`;

    try {
      let completion;
      if (provider === 'openai') {
        completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
        });
      } else if (provider === 'groq') {
        completion = await this.groq.chat.completions.create({
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: prompt }],
        });
      } else {
        throw new Error('Invalid AI provider specified.');
      }
      
      return completion.choices[0]?.message?.content.trim();
    } catch (error) {
      throw new InternalServerErrorException(`Failed to get translation from ${provider}: ${error.message}`);
    }
  }
} 