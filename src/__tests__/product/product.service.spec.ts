import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../product/product.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserType } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProductDTO, UpdateProductDTO, FilterProductDto } from '../../dtos/ProductDTO';

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        categoryId: '1',
      };

      const mockProduct = {
        id: '1',
        ...createProductDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          stock: createProductDto.stock,
          category: {
            connect: {
              id: createProductDto.categoryId,
            },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll();
      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product when user is admin', async () => {
      const updateProductDto: UpdateProductDTO = {
        name: 'Updated Product',
        price: 149.99,
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
      };

      const updatedProduct = {
        ...mockProduct,
        ...updateProductDto,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update('1', updateProductDto, UserType.ADMIN);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateProductDto,
      });
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      const updateProductDto: UpdateProductDTO = {
        name: 'Updated Product',
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.update('1', updateProductDto, UserType.CLIENT)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a product when user is admin', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove('1', UserType.ADMIN);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.remove('1', UserType.CLIENT)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findWithFilters', () => {
    it('should filter products by name', async () => {
      const filters: FilterProductDto = {
        name: 'Test',
      };

      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 10,
          category: {
            id: '1',
            name: 'Test Category',
          },
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findWithFilters(filters);

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: filters.name,
            mode: 'insensitive',
          },
        },
        include: {
          category: true,
        },
      });
    });

    it('should filter products by price range', async () => {
      const filters: FilterProductDto = {
        minPrice: 50,
        maxPrice: 100,
      };

      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 75.99,
          stock: 10,
          category: {
            id: '1',
            name: 'Test Category',
          },
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findWithFilters(filters);

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          price: {
            gte: filters.minPrice,
            lte: filters.maxPrice,
          },
        },
        include: {
          category: true,
        },
      });
    });

    it('should filter products by availability', async () => {
      const filters: FilterProductDto = {
        available: true,
      };

      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 99.99,
          stock: 10,
          category: {
            id: '1',
            name: 'Test Category',
          },
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findWithFilters(filters);

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          stock: { gt: 0 },
        },
        include: {
          category: true,
        },
      });
    });
  });
});