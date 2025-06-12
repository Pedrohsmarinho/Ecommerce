import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/ProductDTO';

const prisma = new PrismaClient();

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const data: CreateProductDTO = req.body;
    const product = await prisma.product.create({
      data: {
        ...data,
        sellerId: req.user!.id,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
}

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data: UpdateProductDTO = req.body;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.sellerId !== req.user!.id && req.user!.type !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized to update this product' });
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.sellerId !== req.user!.id && req.user!.type !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized to delete this product' });
      return;
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
}