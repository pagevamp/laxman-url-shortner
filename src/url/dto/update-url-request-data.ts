import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinDate,
} from 'class-validator';

export class UpdateUrlRequestData {
  @IsOptional()
  @IsString({ message: 'URL title must be a string' })
  @MaxLength(64, { message: 'URL title is too long' })
  title?: string;

  @IsOptional()
  @IsDate({ message: 'Expiration date must be a valid date' })
  @Type(() => Date)
  @MinDate(new Date(), { message: 'Expiration date must be in the future' })
  expiresAt?: Date;

  @IsOptional()
  @IsDate({ message: 'Expiry alert date must be a valid date' })
  @Type(() => Date)
  expiryAlertedAt?: Date;
}
