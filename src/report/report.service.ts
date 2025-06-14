import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateReportDto } from '../dtos/report.dto';
import { createObjectCsvWriter } from 'csv-writer';
import { Prisma } from '@prisma/client';
import { S3Service } from '../s3/s3.service';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service
  ) {}

  async generateReport(dto: GenerateReportDto, userId: string) {
    // Generate unique filename
    const fileName = `sales_report_${Date.now()}.csv`;
    const s3Key = `reports/${fileName}`;

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

    // Create temporary file path
    const tempFilePath = path.join(os.tmpdir(), fileName);

    // Create CSV file
    const csvWriter = createObjectCsvWriter({
      path: tempFilePath,
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

    // Read the file and upload to S3
    const fileBuffer = fs.readFileSync(tempFilePath);

    // Upload to S3
    await this.s3Service.uploadFile(
      {
        buffer: fileBuffer,
        mimetype: 'text/csv',
        originalname: fileName
      },
      s3Key
    );

    // Clean up temporary file
    fs.unlinkSync(tempFilePath);

    // Get signed URL for the file
    const fileUrl = await this.s3Service.getSignedUrl(s3Key);

    // Create report record in database
    const report = await this.prisma.report.create({
      data: {
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        fileName,
        filePath: s3Key, // Store S3 key instead of local path
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
      },
      fileUrl // Include the signed URL in the response
    };
  }

  async getReport(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id }
    });

    if (report) {
      // Get a fresh signed URL for the file
      const fileUrl = await this.s3Service.getSignedUrl(report.filePath);
      return { ...report, fileUrl };
    }

    return report;
  }

  async listReports() {
    const reports = await this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Get signed URLs for all reports
    const reportsWithUrls = await Promise.all(
      reports.map(async (report) => {
        const fileUrl = await this.s3Service.getSignedUrl(report.filePath);
        return { ...report, fileUrl };
      })
    );

    return reportsWithUrls;
  }
}