import { IsNotEmpty, IsString } from 'class-validator';

export class RedirectUrlRequestData {
  @IsNotEmpty()
  @IsString()
  shortCode: string;
}
