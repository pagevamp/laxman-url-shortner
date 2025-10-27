import { IsNotEmpty } from 'class-validator';

export class CreateUrlRequestData {
  @IsNotEmpty({ message: 'Original url cannot be empty' })
  originalUrl: string;

  @IsNotEmpty({ message: 'URL title cannot be empty' })
  title: string;
}
