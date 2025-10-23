import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly defaultTTL = 300; // 5 minutes in seconds

  constructor(private redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method.toUpperCase();

    // Only cache GET requests - CRITICAL FIX
    if (method !== 'GET') {
      return next.handle();
    }

    const key = this.generateCacheKey(request);

    // Check if data exists in cache
    const cachedData = await this.redisService.get(key);
    if (cachedData) {
      return of(JSON.parse(cachedData));
    }

    // If not in cache, get from handler and cache it
    return next.handle().pipe(
      tap(async data => {
        await this.redisService.set(key, JSON.stringify(data), this.defaultTTL);
      })
    );
  }

  private generateCacheKey(request: any): string {
    const { method, url, query, params } = request;
    return `cache:${method}:${url}:${JSON.stringify(query)}:${JSON.stringify(params)}`;
  }
}
