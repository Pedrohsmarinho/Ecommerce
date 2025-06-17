// src/metrics/http-metrics.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    // rota pode ser indefinida em alguns casos
    const route = req.route?.path || req.url;

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;

        const durationSeconds = (Date.now() - now) / 1000;
        this.metricsService.observeRequestDuration(
          method,
          route,
          statusCode.toString(),
          durationSeconds,
        );
      }),
    );
  }
}
