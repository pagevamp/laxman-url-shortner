import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
export class LoginRequestData {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  password: string;
}
