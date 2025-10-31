import { IsNotEmpty } from 'class-validator';

export class RedirectUrlRequestData {
  @IsNotEmpty()
  shortCode: string;
}
