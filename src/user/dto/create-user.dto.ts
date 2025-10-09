import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class createUserDto {
  @IsNotEmpty()
  username: string

  @IsNotEmpty()
  fullName: string

  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string
}
