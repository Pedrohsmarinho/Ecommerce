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
    // Limpa os mocks antes de cada teste
    mockAuthService.login.mockReset();
    mockAuthService.register.mockReset();
    mockAuthService.refreshToken.mockReset();
    mockAuthService.logout.mockReset();

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

      // O controller espera req.user
      const result = await controller.login({ user: loginDto });

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
      // O controller passa os campos individualmente
      expect(authService.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.name,
        registerDto.type,
        registerDto.contact,
        registerDto.address
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshToken = 'refresh-token';
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };
      // Mock do jwtService.decode
      authService.jwtService = { decode: jest.fn().mockReturnValue({ sub: 'userId' }) } as any;
      mockAuthService.refreshToken.mockResolvedValue(mockResponse);

      const result = await controller.refreshToken({ refreshToken });

      expect(result).toEqual(mockResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith('userId', refreshToken);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const userId = '1';
      const mockResponse = { message: 'Logged out successfully' };

      mockAuthService.logout.mockResolvedValue(mockResponse);

      // O controller espera req.user.id
      const result = await controller.logout({ user: { id: userId } });

      expect(result).toEqual(mockResponse);
      expect(authService.logout).toHaveBeenCalledWith(userId);
    });
  });
});