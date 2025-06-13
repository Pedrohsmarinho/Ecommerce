import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from '@prisma/client';
import { sendVerificationEmail } from '../utils/email';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        emailVerified: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        emailVerified: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async update(id: string, updateUserDto: any) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          name: updateUserDto.name,
          email: updateUserDto.email,
          type: updateUserDto.type as UserType,
        },
        select: {
          id: true,
          name: true,
          email: true,
          type: true,
          emailVerified: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    const token = Math.random().toString(36).substring(2, 15);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: token,
        emailVerifyTokenExpires: expires,
      },
    });

    await sendVerificationEmail(user.email, token);

    return { message: 'Verification email sent' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDTO) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.type !== UserType.CLIENT) {
      throw new ForbiddenException('Only CLIENT users can update their profile');
    }

    if (!user.client) {
      throw new NotFoundException('Client profile not found');
    }

    // Update user name if provided
    if (updateProfileDto.name) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: updateProfileDto.name,
        },
      });
    }

    // Update client profile
    const updatedClient = await this.prisma.client.update({
      where: { userId },
      data: {
        fullName: updateProfileDto.name || user.client.fullName,
        contact: updateProfileDto.contact || user.client.contact,
        address: updateProfileDto.address || user.client.address,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            type: true,
            emailVerified: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    return {
      id: updatedClient.id,
      fullName: updatedClient.fullName,
      contact: updatedClient.contact,
      address: updatedClient.address,
      user: updatedClient.user,
      created_at: updatedClient.created_at,
      updated_at: updatedClient.updated_at,
    };
  }

  async create(createUserDto: CreateUserDTO) {
    const { email, password, name, type, contact, address } = createUserDto;

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password, // Note: password should be hashed before this point
        name,
        type,
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

    // Generate verification token
    const token = Math.random().toString(36).substring(2, 15);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    // Update user with verification token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: token,
        emailVerifyTokenExpires: expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
      emailVerified: user.emailVerified,
    };
  }

  async createClientProfile(userId: string, updateProfileDto: UpdateProfileDTO) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.type !== UserType.CLIENT) {
      throw new ForbiddenException('Only CLIENT users can create client profiles');
    }

    if (user.client) {
      throw new ConflictException('Client profile already exists');
    }

    // Create client profile
    return this.prisma.client.create({
      data: {
        userId: user.id,
        fullName: updateProfileDto.name || user.name,
        contact: updateProfileDto.contact || '',
        address: updateProfileDto.address || '',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            type: true,
            emailVerified: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });
  }
}