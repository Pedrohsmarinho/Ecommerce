import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateReportDto } from '../dtos/report.dto';
import { createObjectCsvWriter } from 'csv-writer';
import * as path from 'path';
import * as fs from 'fs';
import { Prisma } from '@prisma/client';

interface SalesData {
  product_id: string;
  product_name: string;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
  average_price: number;
}

interface Totals {
  total_orders: bigint;
  total_revenue: number;
}

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async generateReport(dto: GenerateReportDto, userId: string) {
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    // Generate unique filename
    const fileName = `sales_report_${Date.now()}.csv`;
    const filePath = path.join(reportsDir, fileName);

    // Build the SQL query with aggregations
    const salesData = await this.prisma.$queryRaw<SalesData[]>`
      SELECT
        p.id as product_id,
        p.name as product_name,
        COUNT(oi.id) as total_orders,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi."unitPrice") as total_revenue,
        AVG(oi."unitPrice") as average_price
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."productId"
      JOIN "Order" o ON o.id = oi."orderId"
      JOIN "Client" c ON c.id = o."clientId"
      JOIN "User" u ON u.id = c."userId"
      WHERE o.status != 'CANCELLED'
        AND o."orderDate" >= ${new Date(dto.startDate)}
        AND o."orderDate" <= ${new Date(dto.endDate)}
        ${dto.productName ? Prisma.sql`AND p.name ILIKE ${`%${dto.productName}%`}` : Prisma.sql``}
        ${dto.clientType ? Prisma.sql`AND u.type = ${dto.clientType}` : Prisma.sql``}
      GROUP BY p.id, p.name
      ORDER BY total_revenue DESC
    `;

    // Calculate totals
    const totals = await this.prisma.$queryRaw<Totals[]>`
      SELECT
        COUNT(DISTINCT o.id) as total_orders,
        SUM(oi.quantity * oi."unitPrice") as total_revenue
      FROM "Order" o
      JOIN "OrderItem" oi ON oi."orderId" = o.id
      JOIN "Client" c ON c.id = o."clientId"
      JOIN "User" u ON u.id = c."userId"
      WHERE o.status != 'CANCELLED'
        AND o."orderDate" >= ${new Date(dto.startDate)}
        AND o."orderDate" <= ${new Date(dto.endDate)}
        ${dto.productName ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM "OrderItem" oi2 
          JOIN "Product" p ON p.id = oi2."productId" 
          WHERE oi2."orderId" = o.id AND p.name ILIKE ${`%${dto.productName}%`}
        )` : Prisma.sql``}
        ${dto.clientType ? Prisma.sql`AND u.type = ${dto.clientType}` : Prisma.sql``}
    `;

    // Create CSV file
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'product_id', title: 'Product ID' },
        { id: 'product_name', title: 'Product Name' },
        { id: 'total_orders', title: 'Total Orders' },
        { id: 'total_quantity', title: 'Total Quantity' },
        { id: 'total_revenue', title: 'Total Revenue' },
        { id: 'average_price', title: 'Average Price' }
      ]
    });

    await csvWriter.writeRecords(salesData);

    // Create report record in database
    const report = await this.prisma.report.create({
      data: {
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        fileName,
        filePath,
        totalSales: totals[0].total_revenue || 0,
        totalOrders: Number(totals[0].total_orders) || 0,
        filters: dto as unknown as Prisma.JsonValue,
        userId
      }
    });

    return {
      report,
      summary: {
        totalOrders: Number(totals[0].total_orders) || 0,
        totalRevenue: totals[0].total_revenue || 0,
        productCount: salesData.length
      }
    };
  }

  async getReport(id: string) {
    return this.prisma.report.findUnique({
      where: { id }
    });
  }

  async listReports() {
    return this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}