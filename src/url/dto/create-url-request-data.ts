import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateUrlRequestData {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly expiresAt?: Date;

  @IsNotEmpty({ message: 'Original URL cannot be empty' })
  @IsString({ message: 'Original URL must be a string' })
  @IsUrl()
  originalUrl: string;

  @IsNotEmpty({ message: 'URL title cannot be empty' })
  @IsString({ message: 'URL Title must be a string' })
  title: string;
}
