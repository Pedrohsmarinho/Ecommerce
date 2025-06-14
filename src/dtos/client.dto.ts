import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Full name of the client',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Contact information (phone number)',
    example: '+1234567890'
  })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiProperty({
    description: 'Client address',
    example: '123 Main St, City, Country'
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'ID of the associated user',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UpdateClientDto {
  @ApiProperty({
    description: 'Full name of the client',
    example: 'John Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    description: 'Contact information (phone number)',
    example: '+1234567890',
    required: false
  })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiProperty({
    description: 'Client address',
    example: '123 Main St, City, Country',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Client status',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class FilterClientDto {
  @ApiProperty({
    description: 'Filter by client name',
    required: false
  })
  name?: string;

  @ApiProperty({
    description: 'Filter by client email',
    required: false
  })
  email?: string;

  @ApiProperty({
    description: 'Filter by client status',
    required: false
  })
  status?: boolean;
}