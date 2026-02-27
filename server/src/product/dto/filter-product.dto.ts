import { IsString, IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterProductDto {
  @ApiProperty({ example: 'Smartphone XYZ' })
  @IsString()
  name: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  maxPrice: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  available: boolean;
}
