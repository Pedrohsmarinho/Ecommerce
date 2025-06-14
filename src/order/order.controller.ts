import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderDto } from '../dtos/order.dto';
import { PaymentConfirmationDto } from '../dtos/payment.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient stock' })
  @ApiResponse({ status: 404, description: 'Client or product not found' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Post(':id/confirm')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Confirm an order and start preparation' })
  @ApiResponse({ status: 200, description: 'Order confirmed successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  confirmOrder(@Param('id') id: string) {
    return this.orderService.confirmOrder(id);
  }

  @Post(':id/dispatch')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Mark order as dispatched' })
  @ApiResponse({ status: 200, description: 'Order marked as dispatched' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  dispatchOrder(@Param('id') id: string) {
    return this.orderService.dispatchOrder(id);
  }

  @Post(':id/deliver')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Mark order as delivered' })
  @ApiResponse({ status: 200, description: 'Order marked as delivered' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  deliverOrder(@Param('id') id: string) {
    return this.orderService.deliverOrder(id);
  }

  @Post(':id/cancel')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Cancel an order and restore stock' })
  @ApiResponse({ status: 200, description: 'Order cancelled and stock restored' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  cancelOrder(@Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }

  @Post(':id/payment')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Confirm or decline payment for an order' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order status or payment status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async confirmPayment(
    @Param('id') id: string,
    @Body() paymentConfirmationDto: PaymentConfirmationDto,
  ) {
    return this.orderService.confirmPayment(id, paymentConfirmationDto.status);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Return all orders' })
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiResponse({ status: 200, description: 'Return the order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }
}