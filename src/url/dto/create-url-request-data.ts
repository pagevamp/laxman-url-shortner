import { IsNotEmpty } from 'class-validator';

export class CreateUrlRequestData {
  @IsNotEmpty({ message: 'Original url cannot be empty' })
  originalUrl: string;
}
