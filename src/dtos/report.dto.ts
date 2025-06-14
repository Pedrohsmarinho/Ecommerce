import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-03-20' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: false, example: 'Product Name' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ required: false, example: 'CLIENT' })
  @IsOptional()
  @IsString()
  clientType?: string;
}