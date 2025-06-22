import { Controller, Get } from '@nestjs/common';
import { ModelsService } from './models.service';
import { Model } from '../database/entities/model.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Public()
  @Get()
  findAll(): Promise<Model[]> {
    return this.modelsService.findAll();
  }
} 