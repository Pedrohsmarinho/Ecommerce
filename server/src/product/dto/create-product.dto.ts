import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDTO {
  @ApiProperty({ example: 'Smartphone XYZ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Latest model with advanced features' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'e5c3eec0-8a1c-4e7a-bad5-02dfd56c5a24' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
