import { Controller, Get, Param } from '@nestjs/common';
import { TradesService } from './trades.service';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  async findAll() {
    return this.tradesService.findAll();
  }

  @Get(':id/categories')
  async findCategories(@Param('id') id: string) {
    return this.tradesService.findCategories(id);
  }
}
