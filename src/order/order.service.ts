import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from '../dtos/order.dto';
import { PaymentStatus } from '../dtos/payment.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    // Start a transaction to create order and items
    return this.prisma.$transaction(async (prisma) => {
      // Verify client exists
      const client = await prisma.client.findUnique({
        where: { id: createOrderDto.clientId },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${createOrderDto.clientId} not found`);
      }

      // Calculate total and verify products
      let total = 0;
      const orderItems = [];

      for (const item of createOrderDto.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }

        const subtotal = Number(product.price) * item.quantity;
        total += subtotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        });
      }

      // Create order with items
      const order = await prisma.order.create({
        data: {
          clientId: createOrderDto.clientId,
          status: OrderStatus.RECEIVED,
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          client: {
            include: {
              user: true,
            },
          },
        },
      });

      return order;
    });
  }

  private async validateOrderStatusTransition(order: any, newStatus: OrderStatus) {
    const validTransitions = {
      [OrderStatus.RECEIVED]: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
      [OrderStatus.IN_PREPARATION]: [OrderStatus.DISPATCHED, OrderStatus.CANCELLED],
      [OrderStatus.DISPATCHED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition order from ${order.status} to ${newStatus}. Valid transitions are: ${validTransitions[order.status].join(', ')}`,
      );
    }
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    await this.validateOrderStatusTransition(order, newStatus);

    // If cancelling an order, restore the stock
    if (newStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      return this.prisma.$transaction(async (prisma) => {
        // Restore stock for each item
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        // Update order status
        return prisma.order.update({
          where: { id: orderId },
          data: { status: newStatus },
        });
      });
    }

    // For other status transitions, just update the status
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }

  async confirmOrder(orderId: string) {
    return this.updateOrderStatus(orderId, OrderStatus.IN_PREPARATION);
  }

  async dispatchOrder(orderId: string) {
    return this.updateOrderStatus(orderId, OrderStatus.DISPATCHED);
  }

  async deliverOrder(orderId: string) {
    return this.updateOrderStatus(orderId, OrderStatus.DELIVERED);
  }

  async cancelOrder(orderId: string) {
    return this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async confirmPayment(orderId: string, paymentStatus: PaymentStatus) {
    return this.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      if (order.status !== OrderStatus.RECEIVED) {
        throw new BadRequestException(`Order is not in RECEIVED status. Current status: ${order.status}`);
      }

      if (paymentStatus === PaymentStatus.CONFIRMED) {
        // Reduce stock for each item
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Update order status to IN_PREPARATION
        return prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.IN_PREPARATION },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            client: {
              include: {
                user: true,
              },
            },
          },
        });
      } else {
        // If payment is declined, cancel the order
        return prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            client: {
              include: {
                user: true,
              },
            },
          },
        });
      }
    });
  }
}