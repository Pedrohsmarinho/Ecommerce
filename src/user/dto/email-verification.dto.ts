import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailVerificationDto {
  @ApiProperty({ example: 'verification-token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}