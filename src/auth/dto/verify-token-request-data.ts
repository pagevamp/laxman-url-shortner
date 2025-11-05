import { IsNotEmpty } from 'class-validator';
export class VerifyTokenRequestData {
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}
