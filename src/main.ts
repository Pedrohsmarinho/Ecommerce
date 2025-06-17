import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { ConfigService } from '@nestjs/config';
import { HttpMetricsInterceptor } from './metrics/http-metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));


  const httpMetricsInterceptor = app.get(HttpMetricsInterceptor);

  // Global interceptors
  app.useGlobalInterceptors(
    new ErrorInterceptor(),
    new CacheInterceptor(configService),
    httpMetricsInterceptor,
  );

  // Global guards
  app.useGlobalGuards(new RateLimitGuard(configService));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('The Ecommerce API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();