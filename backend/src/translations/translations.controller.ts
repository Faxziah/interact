import { Controller, Post, Get, Delete, Body, Param, UseGuards, ParseUUIDPipe, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TranslationsService } from './translations.service';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Translations')
@Controller('translations')
export class TranslationsController {
  constructor(
    private readonly translationsService: TranslationsService,
  ) {}

  @Public()
  @Get('languages')
  @ApiOperation({ summary: 'Get available languages' })
  @ApiResponse({ status: 200, description: 'List of available languages' })
  async getLanguages() {
    return this.translationsService.getLanguages();
  }

  @Public()
  @Get('styles')
  @ApiOperation({ summary: 'Get available translation styles' })
  @ApiResponse({ status: 200, description: 'List of available translation styles' })
  async getTranslationStyles() {
    return this.translationsService.getTranslationStyles();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new translation' })
  @ApiResponse({ status: 201, description: 'Translation created successfully' })
  async createTranslation(@Body() createTranslationDto: CreateTranslationDto, @Request() req) {
    return this.translationsService.createTranslation(createTranslationDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get user translation history' })
  @ApiResponse({ status: 200, description: 'User translation history' })
  async getUserTranslations(@Request() req, @Query('limit') limit?: number) {
    return this.translationsService.getUserTranslations(req.user.id, limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('recent')
  @ApiOperation({ summary: 'Get recent translations' })
  @ApiResponse({ status: 200, description: 'Recent user translations' })
  async getRecentTranslations(@Request() req) {
    return this.translationsService.getUserTranslations(req.user.id, 5);
  }

  @Delete(':id')
  async deleteTranslation(
    @CurrentUser() user: { userId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.translationsService.deleteTranslation(user.userId, id);
  }
} 