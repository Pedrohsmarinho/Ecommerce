import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../../product/product.controller';
import { ProductService } from '../../product/product.service';
import { CreateProductDTO } from '../../product/dto/create-product.dto';
import { UpdateProductDTO } from '../../product/dto/update-product.dto';
import { UserType } from '@prisma/client';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
      };

      const mockProduct = {
        id: '1',
        ...createProductDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockProductService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(productService.create).toHaveBeenCalledWith(createProductDto);
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

      mockProductService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll({});

      expect(result).toEqual(mockProducts);
      expect(productService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const productId = '1';
      const mockProduct = {
        id: productId,
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockProductService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(productId);

      expect(result).toEqual(mockProduct);
      expect(productService.findOne).toHaveBeenCalledWith(productId);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = '1';
      const updateProductDto: UpdateProductDTO = {
        name: 'Updated Product',
        price: 149.99,
      };

      const mockProduct = {
        id: productId,
        ...updateProductDto,
        description: 'Test Description',
        stock: 10,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockProductService.update.mockResolvedValue(mockProduct);

      const result = await controller.update(productId, updateProductDto);

      expect(result).toEqual(mockProduct);
      expect(productService.update).toHaveBeenCalledWith(productId, updateProductDto, UserType.ADMIN);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const productId = '1';
      const mockResponse = { message: 'Product deleted successfully' };

      mockProductService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(productId);

      expect(result).toEqual(mockResponse);
      expect(productService.remove).toHaveBeenCalledWith(productId, UserType.ADMIN);
    });
  });
});