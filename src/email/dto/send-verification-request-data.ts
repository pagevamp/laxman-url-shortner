import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendVerificationRequestData {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
