import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentStatus {
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED'
}

export class PaymentConfirmationDto {
  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.CONFIRMED })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}