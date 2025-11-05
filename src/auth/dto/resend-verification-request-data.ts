import { IsEmail, IsNotEmpty } from 'class-validator';
export class ResendVerificationRequestData {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
