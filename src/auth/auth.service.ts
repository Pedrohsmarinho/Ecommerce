import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '@prisma/client';
import { sendVerificationEmail } from '../utils/email';
import { generateVerificationToken } from '../utils/token';
import { hashRefreshToken, compareRefreshToken } from '../utils/hash';

interface jwtPayload {
  email: string;
  sub: string;
  type: UserType;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    public jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: user.type,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m', // Access token expires in 15 minutes
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d', // Refresh token expires in 7 days
      }),
    ]);

    // Hash and store refresh token in database
    const hashedRefreshToken = await hashRefreshToken(refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify token signature first
    let payload: jwtPayload;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Compare hashed refresh token
    const isValidToken = await compareRefreshToken(refreshToken, user.refreshToken);
    if (!isValidToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens with consistent payload structure
    // Add jti (JWT ID) and iat to ensure token uniqueness
    const accessPayload = {
      email: user.email,
      sub: user.id,
      type: user.type,
      jti: Math.random().toString(36).substring(2) + Date.now().toString(36),
    };

    const refreshPayload = {
      email: user.email,
      sub: user.id,
      type: user.type,
      jti: Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random(),
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, { expiresIn: '15m' }),
      this.jwtService.signAsync(refreshPayload, { expiresIn: '7d' }),
    ]);

    // Hash and update refresh token in database
    const hashedRefreshToken = await hashRefreshToken(newRefreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
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

  async register(
    email: string,
    password: string,
    name: string,
    type: UserType,
    contact: string,
    address: string
  ) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate cryptographically secure verification token
    const token = generateVerificationToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type,
        emailVerifyToken: token,
        emailVerifyTokenExpires: expires,
      },
    });

    // If user is CLIENT type, create client profile
    if (type === UserType.CLIENT) {
      await this.prisma.client.create({
        data: {
          userId: user.id,
          fullName: name,
          contact: contact || '',
          address: address || '',
        },
      });
    }

    // Send verification email
    await sendVerificationEmail(email, token);

    // Return user info (tokens are generated at login)
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        emailVerifyToken: user.emailVerifyToken,
      },
    };
  }
}
