import { IsNotEmpty } from 'class-validator';

export class UpdateUrlRequestData {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  expiresAt: Date;
}
