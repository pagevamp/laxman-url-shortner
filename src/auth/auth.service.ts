import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignupRequestData } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';
import { HashService } from './hash.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(
    signUpUserDto: SignupRequestData,
  ): Promise<{ accessToken: string }> {
    try {
      const userByUsername = await this.userService.findOneByField(
        'username',
        signUpUserDto.username,
      );

      if (userByUsername) {
        throw new BadRequestException('Username already taken');
      }

      const userByEmail = await this.userService.findOneByField(
        'email',
        signUpUserDto.email,
      );

      if (userByEmail) {
        throw new BadRequestException('Email already taken');
      }

      const hashedPassword = await this.hashService.hashPassword(
        signUpUserDto.password,
      );

      const { email, fullName, username } = signUpUserDto;

      const user = await this.userService.create({
        password: hashedPassword,
        email,
        fullName,
        username,
      });

      try {
        await this.emailService.sendVerificationLink(email);
        console.log('Verification email sent to:', email);
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }

      const payload = { sub: user.id, username: user.username };

      return { accessToken: await this.jwtService.signAsync(payload) };
    } catch (error) {
      console.error('Signup Error: ', error);
      throw error;
    }
  }
}
