import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { UserType } from '@prisma/client';
import { LoginDto } from '../../auth/dto/login.dto';
import { RegisterDto } from '../../auth/dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        type: UserType.CLIENT,
        contact: '1234567890',
        address: 'Test Address',
      };

      const mockResponse = {
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        type: registerDto.type,
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshToken = 'refresh-token';
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResponse);

      const result = await controller.refreshToken({ refreshToken });

      expect(result).toEqual(mockResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const userId = '1';
      const mockResponse = { message: 'Logged out successfully' };

      mockAuthService.logout.mockResolvedValue(mockResponse);

      const result = await controller.logout(userId);

      expect(result).toEqual(mockResponse);
      expect(authService.logout).toHaveBeenCalledWith(userId);
    });
  });
});