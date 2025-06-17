// src/metrics/metrics.controller.ts
import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) { }

  @Get('metrics')
  @Header('Content-Type', 'text/plain')
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}
