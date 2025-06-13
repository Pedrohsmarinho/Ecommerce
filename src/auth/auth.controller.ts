import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Req, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserType } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
      registerDto.type,
      registerDto.contact,
      registerDto.address
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    const decoded = this.authService.jwtService.decode(body.refreshToken) as any;
    if (!decoded || !decoded.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.authService.refreshToken(decoded.sub, body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    return this.authService.logout(req.user.id);
  }

  @Get('test/client')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.CLIENT)
  testClientRoute(@Request() req) {
    return {
      message: 'Client route accessed successfully',
      user: req.user
    };
  }

  @Get('test/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  testAdminRoute(@Request() req) {
    return {
      message: 'Admin route accessed successfully',
      user: req.user
    };
  }
}