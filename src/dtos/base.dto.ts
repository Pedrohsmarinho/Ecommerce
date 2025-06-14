import { IsString, IsNumber, Matches, Min, Max, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class BaseDto {
  @IsNumber()
  @Min(0)
  @Max(999999.99)
  @Transform(({ value }) => Number(value))
  price?: number;

  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format. Must be a valid international number.',
  })
  @IsOptional()
  phone?: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9\s,.-]+$/, {
    message: 'Address can only contain letters, numbers, spaces, and basic punctuation.',
  })
  @IsOptional()
  address?: string;

  @IsString()
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Name can only contain letters and spaces.',
  })
  @IsOptional()
  name?: string;

  @IsString()
  @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
    message: 'Invalid email format.',
  })
  @IsOptional()
  email?: string;
}