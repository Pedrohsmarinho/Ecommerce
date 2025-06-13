import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDTO, UpdateProductDTO, FilterProductDto } from '../dtos/ProductDTO';
import { UserType } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDTO) {
    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        category: {
          connect: {
            id: createProductDto.categoryId
          }
        }
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDTO, userType: UserType) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admins can update products');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string, userType: UserType) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admins can delete products');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findWithFilters(filters: FilterProductDto) {
    const where: any = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};

      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }

      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.available !== undefined) {
      where.stock = filters.available ? { gt: 0 } : { lte: 0 };
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
      },
    });
  }
}