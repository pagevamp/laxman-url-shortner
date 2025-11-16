import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUrl, MinDate } from 'class-validator';

export class CreateUrlRequestData {
  @IsNotEmpty({ message: 'Expiration date is required' })
  @IsDate({ message: 'Expiration date must be a valid date' })
  @Type(() => Date)
  @MinDate(new Date(), { message: 'Expiration date must be in the future' })
  readonly expiresAt: Date;

  @IsNotEmpty({ message: 'Original URL cannot be empty' })
  @IsString({ message: 'Original URL must be a string' })
  @IsUrl()
  originalUrl: string;

  @IsNotEmpty({ message: 'URL title cannot be empty' })
  @IsString({ message: 'URL Title must be a string' })
  title: string;
}
