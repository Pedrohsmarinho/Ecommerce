import { Injectable } from '@nestjs/common';
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
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { email: user.email, sub: user.id, roles: user.type };
    return {
      access_token: this.jwtService.sign(payload),
    };
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