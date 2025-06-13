import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from '../dtos/client.dto';
import { UpdateClientDto } from '../dtos/client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: createClientDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.client.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    try {
      return await this.prisma.client.update({
        where: { id },
        data: updateClientDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.client.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
  }
}