import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from '@prisma/client';

export interface ClientProvisioningData {
  userId: string;
  name: string;
  contact?: string;
  address?: string;
}

@Injectable()
export class ClientProvisioningService {
  private readonly logger = new Logger(ClientProvisioningService.name);

  constructor(private prisma: PrismaService) {}

  async createClientProfile(data: ClientProvisioningData): Promise<void> {
    try {
      await this.prisma.client.create({
        data: {
          userId: data.userId,
          fullName: data.name,
          contact: data.contact || '',
          address: data.address || '',
        },
      });
      this.logger.log(`Client profile created for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to create client profile for user ${data.userId}`, error);
      throw error;
    }
  }

  async shouldCreateClientProfile(userType: UserType): Promise<boolean> {
    return userType === UserType.CLIENT;
  }
}
