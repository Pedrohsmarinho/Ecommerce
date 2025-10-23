import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxAttempts = 5; // Maximum attempts per window

  constructor(private redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getKey(request);

    const attempts = await this.redisService.incr(key);
    if (attempts === 1) {
      await this.redisService.expire(key, this.windowMs / 1000);
    }

    if (attempts > this.maxAttempts) {
      throw new HttpException(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }

  private getKey(request: Request): string {
    const ip = request.ip;
    const path = request.path;
    return `rate-limit:${ip}:${path}`;
  }
}
