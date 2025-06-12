import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '@prisma/client';
import { sendVerificationEmail } from '../utils/email';
import { generateVerificationToken } from '../utils/token';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    public jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { email: user.email, sub: user.id, roles: user.type };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m', // Access token expires in 15 minutes
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d', // Refresh token expires in 7 days
      }),
    ]);

    // Store refresh token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { email: user.email, sub: user.id, roles: user.type };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    ]);

    // Update refresh token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: string) {
    // Remove refresh token from database
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async register(email: string, password: string, name: string, type: UserType) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = generateVerificationToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type,
        emailVerified: false,
        emailVerifyToken: token,
        emailVerifyTokenExpires: expires,
      },
    });

    await sendVerificationEmail(email, token);

    return user;
  }
}