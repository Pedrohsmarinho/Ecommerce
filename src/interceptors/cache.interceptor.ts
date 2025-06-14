import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly redis: Redis;
  private readonly defaultTTL = 300; // 5 minutes in seconds

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    });
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const key = this.generateCacheKey(request);

    // Check if data exists in cache
    const cachedData = await this.redis.get(key);
    if (cachedData) {
      return of(JSON.parse(cachedData));
    }

    // If not in cache, get from handler and cache it
    return next.handle().pipe(
      tap(async (data) => {
        await this.redis.setex(key, this.defaultTTL, JSON.stringify(data));
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { method, url, query, params } = request;
    return `cache:${method}:${url}:${JSON.stringify(query)}:${JSON.stringify(params)}`;
  }
}