import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDTO {
  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country', description: 'User address' })
  @IsOptional()
  @IsString()
  address?: string;
}
