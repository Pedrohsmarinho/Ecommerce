import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Setup Swagger for e2e tests
    const config = new DocumentBuilder()
      .setTitle('Ecommerce API')
      .setDescription('The Ecommerce API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - Health Check', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('/api (GET) - Swagger Documentation', () => {
    // Swagger UI should be accessible
    return request(app.getHttpServer()).get('/api/').expect(200);
  });
});
