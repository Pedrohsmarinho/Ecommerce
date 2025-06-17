import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserType, example: 'CLIENT' })
  @IsEnum(UserType)
  type: UserType;

  @ApiProperty({ example: '11999999999', required: false })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiProperty({ example: 'Rua Exemplo, 123', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}