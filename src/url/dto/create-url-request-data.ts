import { IsNotEmpty } from 'class-validator';

export class CreateUrlRequestData {
  @IsNotEmpty({ message: 'Expiry date cannot be empty' })
  expiresAt: Date;

  @IsNotEmpty({ message: 'Original url cannot be empty' })
  originalUrl: string;

  @IsNotEmpty({ message: 'URL title cannot be empty' })
  title: string;
}
