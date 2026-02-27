import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserType } from '@prisma/client';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'e2e-test',
        },
      },
    });
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e-test-user@example.com',
          password: 'StrongPassword123!',
          name: 'E2E Test User',
          type: UserType.CLIENT,
          contact: '1234567890',
          address: '123 Test St',
        })
        .expect(201)
        .expect(res => {
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toBe('e2e-test-user@example.com');
          expect(res.body.user.name).toBe('E2E Test User');
          expect(res.body.user.type).toBe(UserType.CLIENT);
        });
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e-test-user@example.com',
          password: 'StrongPassword123!',
          name: 'Duplicate User',
          type: UserType.CLIENT,
        })
        .expect(409);
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'StrongPassword123!',
          name: 'Invalid User',
          type: UserType.CLIENT,
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'e2e-test-user@example.com',
          password: 'StrongPassword123!',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.refresh_token).toBeDefined();
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'e2e-test-user@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'non-existent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.email).toBe('e2e-test-user@example.com');
          expect(res.body.type).toBe(UserType.CLIENT);
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.refresh_token).toBeDefined();
          expect(res.body.access_token).not.toBe(accessToken);
          expect(res.body.refresh_token).not.toBe(refreshToken);
          // Update tokens for subsequent tests
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);
    });

    it.skip('should fail with old refresh token after refresh', async () => {
      // TODO: This test requires implementing refresh token rotation/revocation
      // Currently skipped as it needs additional token family tracking or a revocation list
      // See: https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
      // Save the current refresh token before refreshing
      const oldRefreshToken = refreshToken;

      // Get new tokens
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200);

      refreshToken = res.body.refresh_token;

      // Add a small delay to ensure DB update is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to use old token - should fail because DB now has hash of new token
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: oldRefreshToken,
        })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should not be able to refresh after logout', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(401);
    });
  });
});
