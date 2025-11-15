import { IsEmail, IsNotEmpty } from 'class-validator';
export class ResendEmailVerificationRequestData {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
