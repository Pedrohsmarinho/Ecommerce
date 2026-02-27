import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class CreateUserDTO {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', description: 'User password', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @ApiProperty({ enum: UserType, example: UserType.CLIENT, description: 'User type' })
  @IsEnum(UserType)
  type: UserType;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country', description: 'User address' })
  @IsOptional()
  @IsString()
  address?: string;
}
