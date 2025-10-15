import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignupRequestData } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { CryptoService } from './crypto.service';
import { LoginRequestData } from './dto/login-user-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly cryptoService: CryptoService,
  ) {}

  async signUp(
    signupRequestData: SignupRequestData,
  ): Promise<{ accessToken: string }> {
    try {
      const userByUsername = await this.userService.findOneByField(
        'username',
        signupRequestData.username,
      );

      if (userByUsername) {
        throw new BadRequestException('Username already taken');
      }

      const userByEmail = await this.userService.findOneByField(
        'email',
        signupRequestData.email,
      );

      if (userByEmail) {
        throw new BadRequestException('Email already taken');
      }
      const hashedPassword = await this.cryptoService.hashPassword(
        signupRequestData.password,
      );

      const { email, fullName, username } = signupRequestData;

      const user = await this.userService.create({
        password: hashedPassword,
        email,
        fullName,
        username,
      });

      try {
        await this.emailService.sendVerificationLink({ email });
        console.log('Verification email sent to:', email);
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }

      const payload = { sub: user.id, username: user.username };

      return { accessToken: await this.jwtService.signAsync(payload) };
    } catch (error) {
      throw new BadRequestException({
        message: (error as Error)?.message,
      });
    }
  }

  async login(
    loginRequestData: LoginRequestData,
  ): Promise<{ accessToken: string }> {
    try {
      const user = await this.userService.findOneByField(
        'email',
        loginRequestData.email,
      );
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const match = await bcrypt.compare(
        loginRequestData.password,
        user.password,
      );
      const payload = { sub: user.id, username: user.username };

      if (match) {
        return { accessToken: await this.jwtService.signAsync(payload) };
      } else {
        throw new BadRequestException('Invalid email or password');
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Something went wrong during login',
        error: (error as Error)?.message,
      });
    }
  }
}
