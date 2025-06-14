import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly redis: Redis;

  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    });
  }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async check() {
    try {
      return await this.health.check([
        // Check database connection
        async () => {
          try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
              database: {
                status: 'up',
              },
            };
          } catch (error) {
            return {
              database: {
                status: 'down',
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            };
          }
        },
        // Check memory usage
        () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
        // Check CPU usage
        () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
        // Check disk space
        () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
      ]);
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: {
          database: error instanceof Error && error.message.includes('database') ? 'down' : 'up',
          redis: error instanceof Error && error.message.includes('redis') ? 'down' : 'up',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}