import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerificationTokenRequestData {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
