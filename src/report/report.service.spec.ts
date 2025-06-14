import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { GenerateReportDto } from '../dtos/report.dto';
import { UserType } from '@prisma/client';

describe('ReportService', () => {
  let service: ReportService;
  let prismaService: PrismaService;
  let s3Service: S3Service;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    report: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
    getSignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    prismaService = module.get<PrismaService>(PrismaService);
    s3Service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReport', () => {
    const generateReportDto: GenerateReportDto = {
      startDate: '2024-01-01',
      endDate: '2024-03-20',
      productName: 'Test Product',
      clientType: UserType.CLIENT,
    };

    const mockSalesData = [
      {
        product_id: 'product-1',
        product_name: 'Test Product',
        total_orders: 5,
        total_quantity: 10,
        total_revenue: 500.00,
        average_price: 50.00,
      },
    ];

    const mockTotals = [
      {
        total_orders: BigInt(5),
        total_revenue: 500.00,
      },
    ];

    const mockReport = {
      id: 'report-1',
      startDate: new Date(generateReportDto.startDate),
      endDate: new Date(generateReportDto.endDate),
      fileName: 'sales_report_1234567890.csv',
      filePath: 'reports/sales_report_1234567890.csv',
      totalSales: 500.00,
      totalOrders: 5,
      filters: generateReportDto,
      userId: 'user-1',
    };

    const mockSignedUrl = 'https://example.com/signed-url';

    it('should successfully generate a report', async () => {
      mockPrismaService.$queryRaw
        .mockResolvedValueOnce(mockSalesData)
        .mockResolvedValueOnce(mockTotals);
      mockPrismaService.report.create.mockResolvedValue(mockReport);
      mockS3Service.uploadFile.mockResolvedValue(mockReport.filePath);

      const result = await service.generateReport(generateReportDto, 'user-1');

      expect(result).toBeDefined();
      expect(result.report).toBeDefined();
      expect(result.report.id).toBe(mockReport.id);
      expect(result.report.totalSales).toBe(mockReport.totalSales);
      expect(result.report.totalOrders).toBe(mockReport.totalOrders);
      expect(result.summary).toBeDefined();
      expect(result.summary.totalOrders).toBe(5);
      expect(result.summary.totalRevenue).toBe(500.00);
      expect(result.report.filePath).toBe(mockReport.filePath);
      expect(mockS3Service.uploadFile).toHaveBeenCalled();
    });

    it('should get a report by id with signed URL', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);
      mockS3Service.getSignedUrl.mockResolvedValue(mockSignedUrl);

      const result = await service.getReport('report-1');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockReport.id);
      expect(result.filePath).toBe(mockReport.filePath);
      expect(mockS3Service.getSignedUrl).toHaveBeenCalled();
    });

    it('should list all reports with signed URLs', async () => {
      const mockReports = [mockReport];
      mockPrismaService.report.findMany.mockResolvedValue(mockReports);
      mockS3Service.getSignedUrl.mockResolvedValue(mockSignedUrl);

      const result = await service.listReports();

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockReport.id);
      expect(result[0].filePath).toBe(mockReport.filePath);
      expect(mockS3Service.getSignedUrl).toHaveBeenCalled();
    });
  });
});