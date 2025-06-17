// src/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestDurationSeconds: client.Histogram<string>;

  constructor() {
    client.collectDefaultMetrics();

    this.httpRequestDurationSeconds = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 1.5, 2, 5],
    });
  }

  observeRequestDuration(method: string, route: string, statusCode: string, durationSeconds: number) {
    this.httpRequestDurationSeconds.labels(method, route, statusCode).observe(durationSeconds);
  }

  async getMetrics(): Promise<string> {
    return await client.register.metrics();
  }
}
