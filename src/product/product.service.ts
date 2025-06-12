import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/ProductDTO';
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
        categoryId: createProductDto.categoryId
      },
      include: {
        category: true
      }
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true
      }
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDTO, userType: UserType) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admins can update products');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price: updateProductDto.price,
        stock: updateProductDto.stock,
        categoryId: updateProductDto.categoryId
      },
      include: {
        category: true
      }
    });
  }

  async delete(id: string, userType: UserType) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admins can delete products');
    }

    await this.prisma.product.delete({
      where: { id }
    });
  }
}